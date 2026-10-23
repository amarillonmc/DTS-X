import { names as sourceNames, loaders } from './catalog.mjs';
import { createOutput } from './output.mjs';
import { builtinFunctions } from './builtins.mjs';
import * as values from './values.mjs';
import { derivedTemplatePath, derivedHtml } from './derived.mjs';

export { createOutput };
const own = (object, key) => Object.hasOwn(object, key);
const identifier = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const valueHelpers = { ...values };
const renderers = new Map();
function templateRenderer(file) {
  const loader = loaders[file];
  let entry = renderers.get(file);
  if (entry?.loader === loader) return entry.renderer ?? entry.pending;
  if (typeof loader !== 'function') throw new Error(`Native template is missing: ${file}`);
  entry = { loader };
  entry.pending = Promise.resolve().then(loader).then(module => {
    if (typeof module.default !== 'function') throw new TypeError(`Invalid native template renderer: ${file}`);
    entry.renderer = module.default;
    return entry.renderer;
  });
  renderers.set(file, entry);
  entry.pending.catch(() => { if (renderers.get(file) === entry) renderers.delete(file); });
  return entry.pending;
}

/** Load static function code before accepting HTTP. No renderer, module hook,
 * request, random source, database operation or derived data file is executed. */
export async function preloadNativeTemplates() {
  const files = Object.keys(loaders); let next = 0;
  await Promise.all(Array.from({ length: 16 }, async () => {
    while (next < files.length) await templateRenderer(files[next++]);
  }));
  return files.length;
}
const plans = new Map();
function templatePlan(enabledModules) {
  const key = JSON.stringify(enabledModules);
  let plan = plans.get(key);
  if (!plan) {
    const enabled = new Set(enabledModules), names = Object.create(null), definitions = Object.create(null);
    for (const name of enabled) definitions[`MOD_${name.toUpperCase()}`] = true;
    for (const [constant, binding] of Object.entries(sourceNames)) if (enabled.has(binding.module)) names[constant] = definitions[constant] = binding.name;
    plan = { names: Object.freeze(names), definitions: Object.freeze(definitions) };
    if (plans.size >= 16) plans.delete(plans.keys().next().value);
    plans.set(key, plan);
  }
  return plan;
}

/** Create one request's native renderer. Only generated, source-manifest-bound
 * JavaScript can be loaded. source.mjs and php-parser are build-only and are
 * deliberately absent from this production import graph.
 *
 * session: ModuleSession or () => ModuleSession for bootstrap cycles.
 * enabledModules: module names available to this request, including templates.
 * functions: explicitly supplied native global helpers (room/account/bubbles).
 * files.readText(path): host-authorized original assets/news/dictionary text.
 * globals: request global reference slots, distinct from imported module slots.
 * output: createOutput(), shared with native gameplay hooks for exact ordering.
 */
export function createTemplateServices({ session, enabledModules = [], templateId = 1, constants = {}, globals = Object.create(null), functions = {}, files, output = createOutput(), random, clock, timezoneOffset = 0 } = {}) {
  if (typeof output.capture !== 'function' || typeof output.write !== 'function') throw new TypeError('Native templates require output.capture() and output.write()');
  const plan = templatePlan(enabledModules), names = Object.assign(Object.create(null), plan.names), definitions = Object.assign(Object.create(null), { IN_GAME: true, TEMPLATEID: 1, TPLDIR: 'templates/default' }, constants, plan.definitions);
  const hasConstant = name => own(constants, name) || own(definitions, name);
  const constant = name => own(constants, name) ? constants[name] : own(definitions, name) ? definitions[name] : name;
  const builtin = builtinFunctions({ now: clock?.nowSeconds?.bind(clock), timezoneOffset });
  const getSession = () => {
    const current = typeof session === 'function' ? session() : session;
    if (!current) throw new Error('Native templates require an initialized module session');
    return current;
  };
  const resolve = (name, selected = templateId) => {
    name = values.text(name); selected = values.truth(selected) ? selected : templateId;
    if (name.startsWith('MOD_')) {
      if (own(names, name)) name = names[name];
      else if (hasConstant(name) && typeof constant(name) === 'string') name = constant(name);
      else throw new Error(`Undefined native template binding ${name}`);
    }
    name = name.replaceAll('\\', '/');
    const gameRoot = values.text(hasConstant('GAME_ROOT') ? constant('GAME_ROOT') : null).replaceAll('\\', '/');
    if (gameRoot && name.startsWith(gameRoot)) name = name.slice(gameRoot.length);
    name = name.replace(/^(?:\.\/)+/, '');
    if (name.split('/').includes('..') || name.startsWith('/') || /^[a-z]:/i.test(name)) throw new Error('Template path is outside the source manifest');
    if (/\.(htm|html)$/i.test(name) && own(loaders, name)) return name;
    if (!name.includes('/')) {
      const derived = derivedTemplatePath(name, selected); if (derived) return derived;
      const themed = `templates/${Number(selected) === 1 ? 'default' : selected}/${name}.htm`;
      if (own(loaders, themed)) return themed;
      const fallback = `templates/default/${name}.htm`; if (own(loaders, fallback)) return fallback;
    } else {
      const themed = `${name}.${selected}.htm`; if (own(loaders, themed)) return themed;
      const fallback = `${name}.htm`; if (own(loaders, fallback)) return fallback;
    }
    throw new Error(`Native template is missing: ${name}`);
  };
  const has = (name, selected = templateId) => { try { resolve(name, selected); return true; } catch { return false; } };
  const renderDerived = async file => {
    if (!files?.readText) throw new Error('Derived help templates require native files.readText');
    let text;
    try { text = await files.readText(file); }
    catch (error) {
      if (error.code !== 'ENOENT' || file.startsWith('gamedata/templates/default/')) throw error;
      text = await files.readText(file.replace(/^gamedata\/templates\/\d+\//, 'gamedata/templates/default/'));
    }
    return derivedHtml(text);
  };
  const functionExists = name => {
    name = values.text(name).replace(/^\\/, '');
    if (name.includes('\\')) { const [module, method] = name.split('\\'); return getSession().hasModule(module) && getSession().chain(method).includes(module.toLowerCase()); }
    return own(builtin, name.toLowerCase()) || own(functions, name.toLowerCase());
  };
  async function context(selected) {
    const r = { __proto__: valueHelpers, globals,
      write: value => output.write(value),
      exit: message => { throw new Error(`Template exited: ${values.text(message)}`); },
      constant,
      imports: (scope, ...modules) => getSession().importInto(scope, ...modules),
      global: (scope, name) => {
        if (scope === globals) { if (!own(scope, name)) values.assign(values.slot(scope, [name]), null); return; }
        Object.defineProperty(scope, name, { configurable: true, enumerable: true, get: () => values.get(globals, name), set: value => values.assign(values.slot(globals, [name]), value) });
      },
      module: (module, method, ...args) => getSession().call(module, method, ...args),
      template: (name, requested = selected) => ({ name, templateId: requested }),
      async include(target, scope) {
        if (target === null || typeof target !== 'object' || !own(target, 'name')) throw new TypeError('Generated template include requires a resolved template request');
        const file = resolve(target.name, target.templateId);
        if (file.startsWith('gamedata/templates/')) { output.write(await renderDerived(file)); return; }
        const renderer = await templateRenderer(file);
        return renderer(r, scope);
      },
      async namedCall(name, ...args) {
        name = values.text(name).replace(/^\\/, '');
        const pieces = name.split('\\');
        if (!pieces.every(piece => identifier.test(piece)) || pieces.length > 2) throw new TypeError('Invalid native template function name');
        return pieces.length === 2 ? r.module(pieces[0], pieces[1], ...args) : r.call(name.toLowerCase(), ...args);
      },
      async mutate(name, ref) {
        const current = values.get(ref.target, ref.key);
        if (!values.isArray(current)) throw new TypeError(`${name} requires a template array`);
        const items = values.entries(current).map(([, value]) => value);
        if (name === 'array_pop') { const result = items.pop() ?? null; values.assign(ref, items); return result; }
        if (name === 'sort') items.sort(values.compare);
        else if (name === 'shuffle') { if (typeof random?.shuffle !== 'function') throw new Error('Template shuffle requires request random.shuffle()'); random.shuffle(items); }
        else throw new Error(`Unknown template array mutation ${name}`);
        values.assign(ref, items); return true;
      },
      async call(name, ...args) {
        if (name === 'defined') return hasConstant(values.text(args[0]));
        if (name === 'function_exists') return functionExists(args[0]);
        if (name === 'get_var_in_module') return values.get(getSession().state(values.text(args[1])), args[0]);
        if (name === 'file_get_contents') {
          if (typeof files?.readText !== 'function') throw new Error('Native templates require files.readText() for this resource');
          let result; try { result = await files.readText(values.text(args[0])); } catch (error) { if (error.code === 'ENOENT') return false; throw error; } if (typeof result !== 'string') throw new TypeError('files.readText must return text'); return result;
        }
        if (own(builtin, name)) return builtin[name](...args);
        if (own(functions, name) && typeof functions[name] === 'function') return functions[name](...args);
        throw new Error(`Native template global function is missing: ${name}`);
      },
    };
    return r;
  }
  return Object.freeze({ names, output, has,
    async render(name, scope = Object.create(null), selected = templateId) {
      if (!scope || typeof scope !== 'object') throw new TypeError('Template scope must be an object with live bindings');
      const file = resolve(name, selected);
      if (file.startsWith('gamedata/templates/')) return renderDerived(file);
      const renderer = await templateRenderer(file), r = await context(selected);
      return output.capture(() => renderer(r, scope));
    },
    // A build-time test or explicit native controller can use the same context
    // with an imported generated JS function. No code string is accepted.
    async renderFunction(renderer, scope = Object.create(null), selected = templateId) {
      if (typeof renderer !== 'function') throw new TypeError('A compiled native function is required');
      const r = await context(selected); return output.capture(() => renderer(r, scope));
    },
  });
}
