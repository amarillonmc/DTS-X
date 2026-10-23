import * as v from '../templates/values.mjs';
import { moduleBuiltins } from './builtins.mjs';
import { reference } from '../modules/registry.mjs';
import { pregMatch, pregReplace } from './regex.mjs';
import { resources } from './resources/catalog.mjs';
import skillSignatures from './signatures.json' with { type: 'json' };
import remainingSignatures from './remaining/signatures.json' with { type: 'json' };
import allSignatures from './all-signatures.json' with { type: 'json' };
import { cachePath, isDataCache, readDataCache, writeDataCache } from './cache.mjs';
import { derivedFilePath } from '../templates/derived.mjs';

const REF = Symbol('native generated reference');
const servicesByHost = new WeakMap();
const builtinsByHost = new WeakMap();
const initializationContexts = new WeakMap();
const compiledContexts = new WeakMap();
// ESM namespace spreading is expensive at every rule call. Share the stateless
// value functions through an ordinary prototype; request bindings stay own
// properties, and a caller can still override a helper on its own context.
const valueHelpers = { ...v };
const own = (object, key) => Object.hasOwn(object, key);
const isRef = value => !!value && typeof value === 'object' && (value[REF] || (() => { const d = Object.getOwnPropertyDescriptor(value, 'value'); return v.isReferenceDescriptor(d); })());
const readReference = value => isRef(value) ? value.value : value;
const required = (object, method, name = method) => { if (typeof object?.[method] !== 'function') throw new Error(`Native generated modules require ${name}`); return object[method].bind(object); };
const argument = ref => Object.freeze({ [REF]: true, get value() { return v.get(ref.target, ref.key); }, set value(value) { v.assign(ref, value); } });
function alias(ref, source) {
  if (!isRef(source)) throw new TypeError('Native reference assignment needs a concrete reference slot');
  if (ref.target instanceof Map) throw new TypeError('Reference binding into a Map needs an explicit record boundary');
  Object.defineProperty(ref.target, ref.key, { configurable: true, enumerable: true, get: () => source.value, set: value => { source.value = value; } });
  return source.value;
}
Object.assign(valueHelpers, {
  argument, alias, readReference,
  returnOwnedLocal(scope, name) {
    const descriptor = Object.getOwnPropertyDescriptor(scope, name);
    return descriptor && own(descriptor, 'value') ? descriptor.value : v.copy(v.get(scope, name));
  },
  parameter(scope, name, value, byref) {
    if (byref && isRef(value)) alias(v.slot(scope, [name]), value);
    else if (byref) Object.defineProperty(scope, name, { value, configurable: true, enumerable: true, writable: true });
    else {
      const ref = v.slot(scope, [name]), copied = v.copy(readReference(value));
      if (Object.getPrototypeOf(scope) === null) scope[ref.key] = copied;
      else v.assignOwned(ref, copied);
    }
  },
  arrayRefs(items) {
    const value = v.array(items.map(([key, child]) => [key, readReference(child)]));
    let next = 0;
    for (let [key, child, byref] of items) { if (key === v.APPEND) key = next; key = v.key(key); if (typeof key === 'number' && key >= next) next = key + 1; if (byref) alias(v.slot(value, [key]), child); }
    return value;
  },
  declare(scope, name) { if (!own(scope, name)) v.assign(v.slot(scope, [name]), null); },
  match(pattern, subject, matches, flags = 0, offset = 0, all = false) { const result = pregMatch(pattern, subject, flags, offset, all); if (matches) matches.value = result.matches; return result.count; },
  extract(scope, value, flags = 0, prefix = '') {
    let count = 0;
    if (![0, 3, 'EXTR_PREFIX_ALL'].includes(flags)) throw new Error(`Unsupported source extract mode ${flags}`);
    for (const [key, child] of v.entries(value)) {
      const name = flags === 3 || flags === 'EXTR_PREFIX_ALL' ? `${v.text(prefix)}_${key}` : v.text(key);
      if (/^[a-zA-Z_\x80-\uffff][a-zA-Z0-9_\x80-\uffff]*$/.test(name) && name !== 'GLOBALS' && name !== 'this') { v.assign(v.slot(scope, [name]), child); count++; }
    }
    return count;
  },
  shiftLeft: (left, right) => Number(BigInt.asIntN(64, BigInt(v.int(left)) << BigInt(v.int(right)))),
  exit: value => { throw new Error(`Native source exited: ${v.text(value)}`); },
  template: (name, templateId) => ({ name, templateId }),
});
const initializationHelpers = Object.create(valueHelpers);
for (const name of ['write', 'module', 'next', 'database', 'lookupReference', 'writeCache', 'include', 'requireRooms', 'requireMessages', 'namedCall', 'mutate']) {
  Object.defineProperty(initializationHelpers, name, {
    configurable: true,
    get() {
      const binding = initializationContexts.get(this);
      const full = binding.full ??= createFullModuleContext(binding.ctx, binding.module, binding.phase, binding.captured);
      const value = full[name];
      Object.defineProperty(this, name, { value, writable: true, configurable: true, enumerable: true });
      return value;
    },
    set(value) { Object.defineProperty(this, name, { value, writable: true, configurable: true, enumerable: true }); },
  });
}
const replacementCalls = new Set(['skillbase.skill_acquire', 'skillbase.skill_lost', 'wound.get_inf', 'trap.trap_damage']);
export const contextGlobalFunctions = Object.freeze(['preg_match', 'preg_match_all', 'preg_replace', 'preg_replace_callback', 'define', 'defined', 'constant', 'function_exists', 'debug_backtrace', 'save_gameinfo', 'addnews', 'getchat', 'systemputchat', 'rand', 'array_rand', 'array_randompick', 'ob_start', 'ob_get_contents', 'ob_clean', 'ob_end_clean', 'ob_end_flush', 'file_exists', 'filemtime', 'unlink', 'check_filemtime_expired', 'dump_template', 'file_get_contents', 'file_put_contents', 'writeover', 'openfile', 'var_dump']);
function nativeArguments(module, method, args, generatedModules) {
  return args.map(value => {
    if (!isRef(value)) return value;
    if (/^skill\d+$/.test(module) || generatedModules.has(module) || replacementCalls.has(`${module}.${method}`) || !v.isArray(value.value)) return value;
    return value.value;
  });
}

/** Explicit per-request bindings for statically generated native functions.
 * These are data access and named service adapters, never a PHP evaluator.
 * No missing function, source include, database or filesystem operation has a
 * mock fallback. constants/globals are shared with the HTTP/template host.
 */
export function createGeneratedServices({ constants = Object.create(null), globals = Object.create(null), functions = Object.create(null), files, clock, random, output, templates, capabilities = Object.create(null) } = {}) {
  return { constants, globals, functions, files, clock, random, output, templates, capabilities, generatedModules: new Set() };
}
function services(ctx) {
  if (ctx.services.generated) return ctx.services.generated;
  let result = servicesByHost.get(ctx.services);
  if (!result) { result = createGeneratedServices(ctx.services); servicesByHost.set(ctx.services, result); }
  return result;
}
function builtins(host) {
  const clock = host.clock, now = clock?.nowSeconds, timezoneOffset = host.timezoneOffset ?? 0;
  let cached = builtinsByHost.get(host);
  if (!cached || cached.clock !== clock || cached.now !== now || cached.timezoneOffset !== timezoneOffset) {
    cached = { clock, now, timezoneOffset, functions: moduleBuiltins({ now: now?.bind(clock), timezoneOffset }) };
    builtinsByHost.set(host, cached);
  }
  return cached.functions;
}
export function createModuleContext(ctx, module, phase = 'function') {
  if (phase !== 'top' && phase !== 'init') return createFullModuleContext(ctx, module, phase);
  const host = services(ctx), templates = ctx.services.templates ?? host.templates;
  host.generatedModules.add(module);
  const captured = { host, templates, output: ctx.services.output ?? host.output, random: ctx.services.random ?? host.random, files: ctx.services.files ?? host.files, builtin: builtins(host) };
  const binding = { ctx, module, phase, captured, full: null };
  const full = () => binding.full ??= createFullModuleContext(ctx, module, phase, captured);
  const constant = name => {
    if (own(host.constants, name)) return host.constants[name];
    if (name === 'IN_GAME') return true;
    if (name.startsWith('MOD_') && /^MOD_[A-Z0-9_]+$/.test(name) && ctx.hasModule(name.slice(4).toLowerCase())) return 1;
    if (own(templates?.names ?? {}, name)) return templates.names[name];
    return name;
  };
  const r = { __proto__: initializationHelpers, globals: host.globals,
    capability: name => host.capabilities?.[name] === true,
    imports: (scope, ...names) => ctx.importInto(scope, ...names),
    importsSelected: (scope, fields, ...names) => typeof ctx.importSelectedInto === 'function'
      ? ctx.importSelectedInto(scope, fields, ...names) : ctx.importInto(scope, ...names),
    global(scope, name) {
      const target = phase === 'init' && !own(host.globals, name) ? ctx.state() : host.globals;
      if (!own(target, name)) v.assign(v.slot(target, [name]), null);
      if (scope !== target) v.bind(v.slot(scope, [name]), target, name);
    },
    constant,
    async call(name, ...args) {
      if (name === 'define') { if (own(host.constants, args[0])) return false; host.constants[args[0]] = v.copy(args[1]); return true; }
      if (name === 'defined') return constant(v.text(args[0])) !== args[0];
      if (name === 'constant') return constant(v.text(args[0]));
      return full().call(name, ...args);
    },
  };
  initializationContexts.set(r, binding);
  return r;
}

/** Compiler-owned function contexts contain service bindings, never locals.
 * Reuse within a registry request; standalone mutable contexts keep the public
 * fresh-context API. Changed services/clock/globals invalidate the binding. */
export function cachedModuleContext(ctx, module, phase = 'function') {
  if (phase !== 'function' || !Object.isFrozen(ctx)) return createModuleContext(ctx, module, phase);
  const host = services(ctx), templates = ctx.services.templates ?? host.templates;
  const output = ctx.services.output ?? host.output, random = ctx.services.random ?? host.random, files = ctx.services.files ?? host.files;
  const clock = host.clock, now = clock?.nowSeconds, timezone = host.timezoneOffset ?? 0;
  let cached = compiledContexts.get(ctx);
  if (!cached || cached.module !== module || cached.host !== host || cached.templates !== templates || cached.output !== output
    || cached.random !== random || cached.files !== files || cached.clock !== clock || cached.now !== now || cached.timezone !== timezone || cached.globals !== host.globals) {
    cached = { module, host, templates, output, random, files, clock, now, timezone, globals: host.globals,
      context: createModuleContext(ctx, module, phase) };
    compiledContexts.set(ctx, cached);
  } else host.generatedModules.add(module);
  return cached.context;
}
function createFullModuleContext(ctx, module, phase, captured) {
  const host = captured ? captured.host : services(ctx), output = captured ? captured.output : ctx.services.output ?? host.output, templates = captured ? captured.templates : ctx.services.templates ?? host.templates;
  host.generatedModules.add(module);
  const random = captured ? captured.random : ctx.services.random ?? host.random, files = captured ? captured.files : ctx.services.files ?? host.files;
  const relativeFile = value => { if (typeof value !== 'string') return value; const root = v.text(host.constants.GAME_ROOT ?? '').replaceAll('\\', '/'); let path = value.replaceAll('\\', '/'); if (root && path.startsWith(root)) path = path.slice(root.length); return path.replace(/^(?:\.\/|\/)+/, ''); };
  const builtin = captured ? captured.builtin : builtins(host);
  const global = (scope, name) => {
    const target = phase === 'init' && !own(host.globals, name) ? ctx.state() : host.globals;
    if (!own(target, name)) v.assign(v.slot(target, [name]), null);
    if (scope === target) return;
    v.bind(v.slot(scope, [name]), target, name);
  };
  const constant = name => {
    if (own(host.constants, name)) return host.constants[name];
    if (name === 'IN_GAME') return true;
    if (name.startsWith('MOD_') && /^MOD_[A-Z0-9_]+$/.test(name) && ctx.hasModule(name.slice(4).toLowerCase())) return 1;
    if (own(templates?.names ?? {}, name)) return templates.names[name];
    return name;
  };
  const r = { __proto__: valueHelpers, globals: host.globals,
    capability: name => host.capabilities?.[name] === true,
    imports: (scope, ...names) => ctx.importInto(scope, ...names),
    // The compiler uses this only when every access to the local scope is a
    // known literal key. Dynamic scopes retain the complete import boundary.
    importsSelected: (scope, fields, ...names) => typeof ctx.importSelectedInto === 'function'
      ? ctx.importSelectedInto(scope, fields, ...names) : ctx.importInto(scope, ...names), global, constant,
    unset: v.unset,
    write: value => required(output, 'write', 'services.output.write')(value),
    module: (target, method, ...args) => ctx.call(target, method, ...nativeArguments(target, method, args, host.generatedModules)),
    next: (...args) => ctx.next(...nativeArguments(ctx.nextModuleName ?? '', ctx.functionName, args, host.generatedModules)),
    async database(method, ...args) {
      const database = ctx.services.database;
      const aliases = { array_insert: 'arrayInsert', array_update: 'arrayUpdate' };
      const result = await required(database, aliases[method] ?? method, `services.database.${method}`)(...args);
      return method === 'query' && Array.isArray(result) ? v.opaque(result) : result;
    },
    async lookupReference(name, key, target = 'input') {
      if (name === 'get_var_input') return ctx.call('input', 'get_var', key);
      const state = ctx.state(target); return v.truth(key) && v.get(state, key) != null ? ctx.reference(target, key) : reference({ value: null }, 'value');
    },
    writeCache: (filename, fields) => writeDataCache(files, relativeFile(filename), fields),
    async include(target, scope, once = false) {
      if (typeof target === 'string') {
        const path = relativeFile(target), execute = resources[path];
        if (execute) { host.includedResources ??= new Set(); if (once && host.includedResources.has(path)) return true; host.includedResources.add(path); await execute(r, scope); return 1; }
        if (isDataCache(path)) return readDataCache(files, path, scope);
        throw new Error(`Unbound native data include ${target}`);
      }
      const html = await required(templates, 'render', 'services.templates.render')(target.name, scope, target.templateId); required(output, 'write', 'services.output.write')(html); return 1;
    },
    requireRooms() { if (!Object.keys(host.functions).some(name => name.startsWith('room_'))) throw new Error('Native generated skill requires room functions'); return 1; },
    requireMessages() { required(host.functions, 'message_create', 'native message_create'); return 1; },
    async namedCall(name, ...args) {
      const parts = v.text(name).replace(/^\\/, '').split('\\');
      if (parts.length > 2 || !parts.every(part => /^[a-z_]\w*$/i.test(part))) throw new TypeError('Invalid generated function name');
      if (parts.length === 2) { const signature = allSignatures[parts.join('.').toLowerCase()] ?? []; return r.module(parts[0], parts[1], ...args.map((value, index) => signature[index]?.byref ? value : readReference(value))); }
      return r.call(parts[0].toLowerCase(), ...args.map(readReference));
    },
    async mutate(name, ref, ...args) {
      const value = readReference(ref); if (!isRef(ref)) throw new TypeError('An array mutation needs its source slot');
      if (name === 'swap') { const other = args[0]; if (!isRef(other)) throw new TypeError('swap requires two reference slots'); const previous = v.copy(value); ref.value = other.value; other.value = previous; return null; }
      if (!v.isArray(value)) throw new TypeError(`${name} needs an array`);
      let items = v.entries(value), result = true;
      if (name === 'array_pop') { const last = items.pop(); result = last?.[1] ?? null; if (last) r.unset(v.slot(value, [last[0]])); return result; }
      if (name === 'array_push') { for (const item of args) v.assign(v.slot(value, [v.APPEND]), item); return v.arrayCount(value); }
      if (name === 'array_shift') { result = items.shift()?.[1] ?? null; let next = 0; ref.value = v.array(items.map(([key, item]) => [typeof key === 'number' ? next++ : key, item])); return result; }
      if (name === 'array_unshift') { let next = args.length; ref.value = v.array([...args.map((item, key) => [key, item]), ...items.map(([key, item]) => [typeof key === 'number' ? next++ : key, item])]); return v.arrayCount(ref.value); }
      if (name === 'array_splice') { const offset = v.int(args[0]), length = args.length < 2 ? items.length : v.int(args[1]), start = offset < 0 ? Math.max(0, items.length + offset) : offset; const removed = items.splice(start, length < 0 ? Math.max(0, items.length - start + length) : length, ...v.entries(v.castArray(args[2] ?? [])).map(([, item]) => [v.APPEND, item])); let next = 0; ref.value = v.array(items.map(([key, item]) => [typeof key === 'number' || key === v.APPEND ? next++ : key, item])); next = 0; return v.array(removed.map(([key, item]) => [typeof key === 'number' ? next++ : key, item])); }
      if (['asort', 'arsort', 'ksort', 'krsort'].includes(name)) { items.sort(([leftKey, left], [rightKey, right]) => name === 'ksort' || name === 'krsort' ? (name === 'krsort' ? -1 : 1) * v.compare(leftKey, rightKey) : (name === 'arsort' ? -1 : 1) * v.compare(left, right)); ref.value = v.array(items); return true; }
      const list = items.map(([, item]) => item);
      if (name === 'shuffle') required(random, 'shuffle', 'services.random.shuffle')(list);
      else if (name === 'sort' || name === 'rsort') list.sort((left, right) => (name === 'rsort' ? -1 : 1) * v.compare(left, right));
      else throw new Error(`Unknown generated array mutation ${name}`);
      ref.value = list; return result;
    },
    async call(name, ...args) {
      if (['file_exists', 'is_dir'].includes(name) && (args[0] == null || args[0] === '')) return false;
      if (['file_exists', 'filemtime', 'file_get_contents', 'file_put_contents', 'writeover', 'unlink', 'chmod'].includes(name)) args[0] = derivedFilePath(cachePath(relativeFile(args[0])));
      if (name === 'check_filemtime_expired') { args[0] = derivedFilePath(cachePath(relativeFile(args[0]))); args[1] = v.isArray(args[1]) ? v.array(v.entries(args[1]).map(([key, value]) => [key, derivedFilePath(cachePath(relativeFile(value)))])) : derivedFilePath(cachePath(relativeFile(args[1]))); }
      if (name === 'preg_match' || name === 'preg_match_all') return pregMatch(args[0], args[1], args[3], args[4], name === 'preg_match_all').count;
      if (name === 'preg_replace') return pregReplace(...args);
      if (name === 'preg_replace_callback') return pregReplace(args[0], matches => r.namedCall(args[1], matches), args[2], args[3], true);
      if (name === 'debug_backtrace') { const frames = required(ctx, 'backtrace', 'ModuleRegistry business call frames')(); return args[1] ? frames.slice(0, v.int(args[1])) : frames; }
      if (name === 'var_dump') { for (const value of args) required(output, 'write', 'services.output.write')(builtin.__dump(value)); return null; }
      if (name === 'define') { if (own(host.constants, args[0])) return false; host.constants[args[0]] = v.copy(args[1]); return true; }
      if (name === 'defined') return constant(v.text(args[0])) !== args[0];
      if (name === 'constant') return constant(v.text(args[0]));
      if (name === 'function_exists') { const parts = v.text(args[0]).replace(/^\\/, '').toLowerCase().split('\\'); return parts.length === 2 ? (typeof ctx.hasFunction === 'function' ? ctx.hasFunction(parts[0], parts[1]) : ctx.hasModule(parts[0]) && (own(skillSignatures, parts.join('.')) || own(remainingSignatures, parts.join('.')))) : own(builtin, parts[0]) || own(host.functions, parts[0]) || contextGlobalFunctions.includes(parts[0]); }
      if (['save_gameinfo', 'addnews', 'getchat', 'systemputchat'].includes(name)) return ctx.call('sys', name, ...args);
      if (name === 'rand') return required(random, 'rand', 'services.random.rand')(...args.map(v.int));
      if (name === 'array_rand' || name === 'array_randompick') {
        const source = args[0], count = args[1] === undefined ? 1 : v.int(args[1]), length = v.arrayCount(source);
        if (count < 1 || count > length) return null;
        const buckets = v.arrayBucketKeys(source);
        const selected = required(random, 'arrayRandPacked', 'services.random.arrayRandPacked')(buckets, count);
        const keys = Array.isArray(selected) ? selected.map(index => buckets[index]) : buckets[selected];
        if (name === 'array_rand') return keys;
        return Array.isArray(keys) ? v.array(keys.map(key => [key, v.get(source, key)])) : v.copy(v.get(source, keys));
      }
      if (name === 'ob_start') return required(output, 'start', 'services.output.start')();
      if (name === 'ob_get_contents') return required(output, 'peek', 'services.output.peek')();
      if (name === 'ob_clean') { required(output, 'take', 'services.output.take')(); return true; }
      if (name === 'ob_end_clean') return required(output, 'endClean', 'services.output.endClean')();
      if (name === 'ob_end_flush') { const content = required(output, 'take', 'services.output.take')(), closed = required(output, 'endClean', 'services.output.endClean')(); required(output, 'write', 'services.output.write')(content); return closed; }
      if (name === 'file_exists') return required(files, 'exists', 'services.files.exists')(v.text(args[0]));
      if (name === 'filemtime') return required(files, 'mtime', 'services.files.mtime')(v.text(args[0]));
      if (name === 'unlink') { await required(files, 'remove', 'services.files.remove')(v.text(args[0])); return true; }
      if (name === 'check_filemtime_expired') { if (!await required(files, 'exists', 'services.files.exists')(args[0])) return true; const modified = await required(files, 'mtime', 'services.files.mtime')(args[0]); for (const source of v.isArray(args[1]) ? v.entries(args[1]).map(([, value]) => value) : [args[1]]) if (await files.exists(source) && await files.mtime(source) > modified) return true; return false; }
      if (name === 'dump_template') { const scope = Object.create(null); r.extract(scope, host.globals); return required(templates, 'render', 'services.templates.render')(args[0], scope, args[1]); }
      if (name === 'file_get_contents') { try { return await required(files, 'read', 'services.files.read')(v.text(args[0])); } catch (error) { if (error.code === 'ENOENT') return false; throw error; } }
      if (name === 'file_put_contents') { await required(files, 'write', 'services.files.write')(v.text(args[0]), args[1], args[2] === 8 ? 'ab' : 'wb'); return ArrayBuffer.isView(args[1]) ? args[1].byteLength : Buffer.byteLength(v.text(args[1])); }
      if (name === 'writeover') return required(files, 'write', 'services.files.write')(...args);
      if (name === 'openfile') {
        // Original openfile uses the locked readover helper, which fails on a
        // missing file. Its empty-file result is one empty line, unlike file().
        const content = await required(files, 'readText', 'services.files.readText')(v.text(args[0]));
        const rows = content.replaceAll('\n', '\n<:game:>').split('<:game:>');
        if (rows.at(-1) === '' || rows.at(-1) === '\r') rows.pop();
        return rows.length ? rows : [''];
      }
      if (own(builtin, name)) return builtin[name](...args);
      return required(host.functions, name, `native global ${name}`)(...args);
    },
  };
  return r;
}
