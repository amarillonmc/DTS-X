/**
 * Native implementation of the Unstable module dispatch contract.
 *
 * The registry contains JavaScript functions only. Source counterparts:
 * include/modules/modules.func.php (hook_register / __MAGIC__),
 * include/modules/modules.init.template.php, and
 * include/modulemng/modulemng.func.php (FIFO dependency ordering).
 */

import {AsyncLocalStorage} from 'node:async_hooks';
const identifier = /^[a-z_][a-z0-9_]*$/i;
const reservedFunctions = new Set(['init', '___pre_init', '___post_init']);
const own = (value, key) => Object.hasOwn(value, key);
const canonical = value => {
  if (typeof value !== 'string' || !identifier.test(value)) {
    throw new TypeError(`Invalid module or function identifier: ${String(value)}`);
  }
  return value.toLowerCase();
};

function normalizeDefinition(definition) {
  const name = canonical(definition.name);
  const functions = Object.create(null);
  for (const [spelling, implementation] of Object.entries(definition.functions ?? {})) {
    const key = canonical(spelling);
    if (reservedFunctions.has(key)) throw new TypeError(`${name}.${key}: use initialize for lifecycle work`);
    if (own(functions, key)) throw new TypeError(`Duplicate function ${name}.${key}`);
    if (typeof implementation !== 'function') throw new TypeError(`${name}.${key} must be a JavaScript function`);
    functions[key] = implementation;
  }
  if (definition.initialize !== undefined && typeof definition.initialize !== 'function') {
    throw new TypeError(`${name}.initialize must be a function`);
  }
  return Object.freeze({
    ...definition,
    name,
    dependencies: Object.freeze((definition.dependencies ?? []).map(canonical)),
    optionalDependencies: Object.freeze((definition.optionalDependencies ?? []).map(canonical)),
    conflicts: Object.freeze((definition.conflicts ?? []).map(canonical)),
    functions: Object.freeze(functions),
  });
}

/** Preserve the original FIFO topological order, including enabled optional edges. */
export function orderModules(definitions) {
  const normalized = definitions.filter(definition => definition.enabled !== false).map(normalizeDefinition);
  const byName = new Map();
  for (const definition of normalized) {
    if (byName.has(definition.name)) throw new Error(`Duplicate module ${definition.name}`);
    byName.set(definition.name, definition);
  }
  const outgoing = new Map(normalized.map(definition => [definition.name, []]));
  const incoming = new Map(normalized.map(definition => [definition.name, 0]));
  for (const definition of normalized) {
    for (const conflict of definition.conflicts) {
      if (byName.has(conflict) || conflict === 'root') throw new Error(`Module conflict: ${definition.name} / ${conflict}`);
    }
    for (const dependency of definition.dependencies) {
      if (!byName.has(dependency)) throw new Error(`Missing dependency ${dependency} required by ${definition.name}`);
    }
    for (const dependency of [...definition.dependencies, ...definition.optionalDependencies]) {
      if (!byName.has(dependency)) continue;
      outgoing.get(dependency).push(definition.name);
      incoming.set(definition.name, incoming.get(definition.name) + 1);
    }
  }
  const queue = normalized.filter(definition => incoming.get(definition.name) === 0).map(definition => definition.name);
  for (let head = 0; head < queue.length; head++) {
    for (const dependent of outgoing.get(queue[head])) {
      incoming.set(dependent, incoming.get(dependent) - 1);
      if (incoming.get(dependent) === 0) queue.push(dependent);
    }
  }
  if (queue.length !== normalized.length) {
    throw new Error(`Module dependency cycle: ${normalized.filter(definition => incoming.get(definition.name) > 0).map(definition => definition.name).join(', ')}`);
  }
  const seenFunctions = new Map();
  for (const name of queue) {
    const definition = byName.get(name);
    for (const functionName of Object.keys(definition.functions)) {
      if (seenFunctions.has(functionName)) {
        const overridesDependency = [...definition.dependencies, ...definition.optionalDependencies]
          .some(dependency => own(byName.get(dependency)?.functions ?? {}, functionName));
        if (!overridesDependency) {
          throw new Error(`Undeclared override ${name}.${functionName} conflicts with ${seenFunctions.get(functionName)}.${functionName}`);
        }
      }
      seenFunctions.set(functionName, name);
    }
  }
  return Object.freeze(queue.map(name => byName.get(name)));
}

/** An explicit scalar reference; the same slot can traverse any number of hooks. */
export function reference(target, key) {
  if (target === null || typeof target !== 'object') throw new TypeError('A reference needs an object target');
  if (!own(target, key)) Object.defineProperty(target, key, { value: null, writable: true, enumerable: true, configurable: true });
  return Object.freeze({
    get value() { return target[key]; },
    set value(value) { target[key] = value; },
  });
}

export class ModuleRegistry {
  #definitions;

  constructor(definitions) {
    this.#definitions = orderModules(definitions);
  }

  get order() { return this.#definitions.map(definition => definition.name); }

  async createSession({ services = {}, states = {}, onCreate } = {}) {
    const session = new ModuleSession(services);
    // Host services (templates, room/account helpers) may be called by init.
    // Publish this request's session before loading without sharing any state
    // between requests. Accessing an unloaded module still fails normally.
    if (onCreate) await onCreate(session);
    for (const definition of this.#definitions) await session.load(definition, states[definition.name]);
    return session;
  }
}

class ModuleSession {
  #calls = new AsyncLocalStorage();
  #services;
  #states = new Map();
  #exports = new Map();
  #chains = new Map();
  #definitions = new Map();
  #initializing = null;

  constructor(services) { this.#services = services; }

  async load(definition, injectedState) {
    const initial = typeof definition.state === 'function'
      ? await definition.state(this.#services)
      : definition.state ?? {};
    if (initial === null || typeof initial !== 'object' || Array.isArray(initial)) {
      throw new TypeError(`Module ${definition.name} state must be an object`);
    }
    if (injectedState !== undefined && (injectedState === null || typeof injectedState !== 'object' || Array.isArray(injectedState))) {
      throw new TypeError(`Injected ${definition.name} state must be an object`);
    }
    // Defaults and configuration may be reused by the caller. PHP creates
    // request-local arrays; mutating one native session must not mutate another
    // session or the caller's configuration. Live services belong in services.
    const state = Object.assign(Object.create(null), structuredClone(initial),
      injectedState === undefined ? undefined : structuredClone(injectedState));
    this.#states.set(definition.name, state);
    this.#definitions.set(definition.name, definition);
    this.#initializing = definition.name;
    try {
      if (definition.initialize) await definition.initialize(this.#context(definition.name, 'init', null));
    } finally { this.#initializing = null; }
    // PHP captures the public variable list after init. Later assignments can
    // update those variables, but do not silently add new import_module exports.
    this.#exports.set(definition.name, Object.keys(state).filter(key => !key.startsWith('___PRIVATE_')));
    for (const [name, implementation] of Object.entries(definition.functions)) {
      const chain = this.#chains.get(name) ?? [];
      chain.push({ module: definition.name, name, implementation, index: chain.length });
      this.#chains.set(name, chain);
    }
  }

  state(name) {
    const key = canonical(name);
    if (!this.#states.has(key)) throw new Error(`Module ${key} is not initialized`);
    return this.#states.get(key);
  }

  hasModule(name) { return this.#exports.has(canonical(name)); }

  hasFunction(moduleName, functionName) {
    const definition = this.#definitions.get(canonical(moduleName));
    return !!definition && own(definition.functions, canonical(functionName));
  }

  chain(name) { return (this.#chains.get(canonical(name)) ?? []).map(entry => entry.module); }

  call(moduleName, functionName, ...args) { return this.#dispatch(null, moduleName, functionName, args); }

  reference(moduleName, variableName) { return reference(this.state(moduleName), variableName); }

  importInto(scope, ...moduleNames) {
    for (const moduleName of moduleNames) {
      const name = canonical(moduleName);
      const state = this.state(name);
      const names = this.#exports.get(name);
      if (!names) throw new Error(`Module ${name} has not completed initialization`);
      for (const key of names) {
        // INPUT uses PHP isset: null is not set; 0, false and '' are set.
        if (name === 'input' && own(scope, key) && scope[key] !== null && scope[key] !== undefined) continue;
        Object.defineProperty(scope, key, {
          configurable: true, enumerable: true,
          get: () => state[key],
          set: value => { state[key] = value; },
        });
      }
    }
    return scope;
  }

  #context(moduleName, functionName, entry) {
    const caller = `${moduleName}.${functionName}`;
    return Object.freeze({
      moduleName, functionName,
      nextModuleName: entry && entry.index > 0 ? this.#chains.get(functionName)[entry.index - 1].module : null,
      services: this.#services,
      hasModule: name => this.hasModule(name),
      hasFunction: (module, name) => this.hasFunction(module, name),
      backtrace: () => (this.#calls.getStore() ?? []).map(frame=>({...frame})),
      call: (target, name, ...args) => this.#dispatch(caller, target, name, args),
      next: (...args) => entry && entry.index > 0
        ? this.#invoke(this.#chains.get(functionName)[entry.index - 1], args)
        : null,
      state: (name = moduleName) => this.state(name),
      reference: (name, variable) => this.reference(name, variable),
      importInto: (scope, ...names) => this.importInto(scope, ...names),
    });
  }

  #invoke(entry, args) {
    return this.#calls.run([{function:`${entry.module}\\${entry.name}`},...(this.#calls.getStore()??[])],()=>entry.implementation(this.#context(entry.module, entry.name, entry), ...args));
  }

  #dispatch(caller, moduleName, functionName, args) {
    const module = canonical(moduleName);
    const name = canonical(functionName);
    const definition = this.#definitions.get(module);
    if (!definition) throw new Error(`Module ${module} is not initialized`);
    if (!own(definition.functions, name)) throw new Error(`Undefined module function ${module}.${name}`);
    if (this.#initializing === module) {
      // Functions exist while init runs, but hook_register has not run yet.
      return this.#calls.run([{function:`${module}\\${name}`},...(this.#calls.getStore()??[])],()=>definition.functions[name](this.#context(module, name, null), ...args));
    }
    const chain = this.#chains.get(name);
    const target = chain.find(entry => entry.module === module);
    const parent = chain[target.index + 1];
    // __MAGIC__ permits direct entry only from the immediate overriding
    // function. All other callers enter the final (outermost) implementation.
    const actual = parent && caller !== `${parent.module}.${name}` ? chain.at(-1) : target;
    return this.#invoke(actual, args);
  }
}
