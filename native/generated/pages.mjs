import { pages } from './pages/catalog.mjs';
import { createModuleContext } from './context.mjs';

export class NativePageExit extends Error {
  constructor(value) { super('Native page completed'); this.value = value; }
}
/** The host has already authenticated/bootstrapped the request. Fixed native
 * services replace includes; page control flow remains generated ordinary JS.
 * Returns captured response text without writing it to the response twice.
 */
export async function renderPage(name, host, scope = host.scope) {
  const execute = pages[name] ?? pages[`command_${name}`]; if (!execute) throw new Error(`Native page is not compiled: ${name}`);
  const session = host.session;
  const ctx = { services: host.services, moduleName: 'page', functionName: name,
    hasModule: module => session.hasModule(module), hasFunction: (module, name) => session.hasFunction(module, name), state: module => session.state(module), reference: (module, key) => session.reference(module, key),
    importInto: (target, ...names) => session.importInto(target, ...names), call: (module, fn, ...args) => session.call(module, fn, ...args),
  };
  const r = createModuleContext(ctx, 'page');
  host.pageFunctions ??= new Map();
  r.defineLocal = (name, fn) => { if (host.pageFunctions.has(name)) throw new Error(`Duplicate page function ${name}`); host.pageFunctions.set(name, fn); };
  r.pageCall = (name, ...args) => { const fn = host.pageFunctions.get(name); if (!fn) throw new Error(`Undefined page function ${name}`); return fn(...args); };
  const call = r.call;
  r.call = (name, ...args) => name === 'function_exists' && host.pageFunctions.has(args[0]) ? true : host.pageFunctions.has(name) ? r.pageCall(name, ...args) : call(name, ...args);
  r.exit = value => { throw new NativePageExit(value); };
  r.nativeInclude = async (binding, target) => {
    if (binding === 'request-bootstrap') { if (!host.session || !host.database) throw new Error('Page requires a completed native request bootstrap'); return 1; }
    if (binding === 'runtime-configuration') { session.importInto(target, 'sys'); return 1; }
    if (binding === 'accounts') { if (!host.users) throw new Error('Page requires native account services'); return 1; }
    if (binding === 'room-configuration') { if (!host.rooms?.config) throw new Error('Page requires native room configuration'); for (const [key, value] of Object.entries(host.rooms.config)) r.assign(r.slot(target, [key]), value); return 1; }
    if (binding === 'room-functions') { if (!host.rooms) throw new Error('Page requires native room services'); return 1; }
    if (binding === 'battlefield-entry') { if (typeof host.enterBattlefield !== 'function') throw new Error('Page requires native battlefield entry'); return 1; }
    if (binding === 'messages') { if (!host.messages) throw new Error('Page requires native messages'); return 1; }
    throw new Error(`Unbound native page include ${binding}`);
  };
  return host.output.capture(async () => { try { await execute(r, scope); } catch (error) { if (!(error instanceof NativePageExit)) throw error; if (typeof error.value === 'string') host.output.write(error.value); } });
}
export const hasPage = name => Object.hasOwn(pages, name) || Object.hasOwn(pages, `command_${name}`);
export const generatedPages = Object.fromEntries(Object.keys(pages).map(name => [name.replace(/^command_/, ''), (host, scope) => renderPage(name, host, scope)]));
