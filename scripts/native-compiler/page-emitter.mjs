import { ModuleEmitter } from './module-emitter.mjs';
import { resourceSources } from './resource-list.mjs';

function fixedInclude(node) {
  if (node.kind === 'string') return node.value.replace(/^(?:\.\/|\/)+/, '');
  if (node.kind === 'bin' && node.type === '.' && node.left.kind === 'name' && node.left.name === 'GAME_ROOT' && node.right.kind === 'string') return node.right.value.replace(/^(?:\.\/|\/)+/, '');
  return null;
}
export class PageEmitter extends ModuleEmitter {
  constructor(filename, options = {}) { super(filename, { module: 'page', signatures: options.signatures ?? {}, localFunctions: new Set() }); this.pageFunctions = new Map(); }
  expression(node) {
    if (node?.kind === 'call' && node.what.kind === 'name' && this.pageFunctions.has(node.what.name.toLowerCase())) {
      const name = node.what.name.toLowerCase(), fn = this.pageFunctions.get(name);
      return `(await r.pageCall(${JSON.stringify(name)}${node.arguments.length ? ', ' + node.arguments.map((argument, index) => fn.arguments[index]?.byref ? `r.argument(${this.slot(argument)})` : this.expression(argument)).join(', ') : ''}))`;
    }
    if (node?.kind === 'magic' && node.value.toUpperCase() === '__LINE__') return String(node.loc?.start.line ?? 0);
    if (node?.kind === 'magic' && node.value.toUpperCase() === '__FILE__') return JSON.stringify(this.filename);
    if (node?.kind === 'include') {
      const target = fixedInclude(node.target);
      const bindings = { 'include/roommng/roommng.config.php': 'room-configuration', 'include/roommng/roommng.func.php': 'room-functions',
        'include/roommng/room.func.php': 'room-functions', 'include/valid.func.php': 'battlefield-entry', 'include/common.inc.php': 'request-bootstrap',
        'include/global.func.php': 'request-bootstrap', 'include/messages.func.php': 'messages', 'include/user.func.php': 'accounts',
        'include/modules/core/sys/config/server.config.php': 'runtime-configuration', 'include/modules/core/sys/config/system.config.php': 'runtime-configuration' };
      if (target && bindings[target]) return `(await r.nativeInclude(${JSON.stringify(bindings[target])}, s))`;
      if (target && resourceSources.includes(target)) return `(await r.include(${JSON.stringify(target)}, s, ${!!node.once}))`;
      if (target) return this.fail(node, `unbound page include ${target}`);
    }
    return super.expression(node);
  }
  statement(node, depth = 1) {
    if (node.kind === 'function') {
      const indent = '  '.repeat(depth), name = node.name.name.toLowerCase(), previous = this.staticScope, storage = `static${this.serial++}`;
      const parameters = node.arguments.map((argument, index) => `${indent}  r.parameter(s, ${JSON.stringify(argument.name.name)}, args.length > ${index} ? args[${index}] : ${this.expression(argument.value)}, ${argument.byref});\n`).join('');
      this.staticScope = storage; const body = this.statement(node.body, depth + 2); this.staticScope = previous;
      return `${indent}{\n${indent}  const ${storage} = Object.create(null);\n${indent}  r.defineLocal(${JSON.stringify(name)}, async (...args) => {\n${indent}    const s = Object.create(null);\n${parameters}${body}${indent}    return null;\n${indent}  });\n${indent}}\n`;
    }
    if (node.kind === 'static') {
      if (!this.staticScope) return this.fail(node, 'static outside a page function');
      const indent = '  '.repeat(depth);
      return node.variables.map(variable => `${indent}if (!Object.hasOwn(${this.staticScope}, ${this.key(variable.variable)})) r.assign(r.slot(${this.staticScope}, [${this.key(variable.variable)}]), ${this.expression(variable.defaultValue)});\n${indent}r.bind(${this.slot(variable.variable)}, ${this.staticScope}, ${this.key(variable.variable)});\n`).join('');
    }
    return super.statement(node, depth);
  }
  emit(ast) {
    const visit = node => { if (!node || typeof node !== 'object') return; if (node.kind === 'function') this.pageFunctions.set(node.name.name.toLowerCase(), node); for (const [key, child] of Object.entries(node)) if (key !== 'loc') visit(child); }; visit(ast);
    // PHP declares unconditional top-level functions before the first source
    // statement; conditional/nested declarations still occur in source order.
    const declarations = ast.children.filter(node => node.kind === 'function').map(node => this.statement(node)).join('');
    const body = ast.children.filter(node => node.kind !== 'function').map(node => this.statement(node)).join('');
    return `// Static native page from ${this.filename}. Build-only source translation.\nexport default async function execute(r, s) {\n${declarations}${body}  return null;\n}\n`;
  }
}
