/** Build-only AST -> ordinary asynchronous JavaScript. There is no AST walker
 * in the renderer: every branch, loop, call and reference is emitted explicitly.
 * Unsupported syntax fails the build with its original source location.
 */
export class TemplateEmitter {
  constructor(filename) { this.filename = filename; this.serial = 0; this.calls = new Set(); }
  fail(node, detail = node.kind) { throw new Error(`${this.filename}:${node.loc?.start.line ?? '?'}: unsupported template syntax ${detail}`); }
  key(node) { return typeof node.name === 'string' ? JSON.stringify(node.name) : this.expression(node.name); }
  slot(node) {
    const keys = [];
    while (node.kind === 'offsetlookup') { keys.unshift(node.offset ? this.expression(node.offset) : 'r.APPEND'); node = node.what; }
    if (node.kind !== 'variable') return this.fail(node, 'assignment target');
    if (node.name === 'GLOBALS') return `r.slot(r.globals, [${keys.join(', ')}])`;
    if (typeof node.name === 'string' && /^_(GET|POST|COOKIE|REQUEST|SERVER|FILES|ENV|SESSION)$/.test(node.name)) return `r.slot(r.globals, [${JSON.stringify(node.name)}${keys.length ? ', ' + keys.join(', ') : ''}])`;
    keys.unshift(this.key(node));
    return `r.slot(s, [${keys.join(', ')}])`;
  }
  expression(node) {
    if (!node) return 'null';
    const e = child => this.expression(child);
    switch (node.kind) {
      case 'string': return JSON.stringify(node.value);
      case 'number': return node.value;
      case 'boolean': return String(node.value);
      case 'nullkeyword': return 'null';
      case 'name': return `r.constant(${JSON.stringify(node.name)})`;
      case 'variable': return node.name === 'GLOBALS' ? 'r.globals' : `r.get(${typeof node.name === 'string' && /^_(GET|POST|COOKIE|REQUEST|SERVER|FILES|ENV|SESSION)$/.test(node.name) ? 'r.globals' : 's'}, ${this.key(node)})`;
      case 'offsetlookup': return `r.get(${e(node.what)}, ${e(node.offset)})`;
      case 'array': return `r.array([${node.items.map(item => {
        if (item.byRef || item.unpack) return this.fail(item, 'array reference/unpack');
        return `[${item.key ? e(item.key) : 'r.APPEND'}, ${e(item.value)}]`;
      }).join(', ')}])`;
      case 'encapsed': return `(${node.value.map(part => `r.text(${e(part.expression)})`).join(' + ')})`;
      case 'cast': {
        const types = { int: 'int', float: 'number', string: 'text', bool: 'truth', array: 'castArray' };
        if (!types[node.type]) return this.fail(node, `cast ${node.type}`);
        return `r.${types[node.type]}(${e(node.expr)})`;
      }
      case 'unary':
        if (node.type === '!') return `(!r.truth(${e(node.what)}))`;
        if (node.type === '-' || node.type === '+') return `(${node.type}r.number(${e(node.what)}))`;
        return this.fail(node);
      case 'isset': return `(${node.variables.map(value => `(${e(value)} != null)`).join(' && ')})`;
      case 'empty': return `(!r.truth(${e(node.expression)}))`;
      case 'bin': {
        const left = e(node.left), right = e(node.right);
        if (node.type === '&&' || node.type === '||') return `(r.truth(${left}) ${node.type} r.truth(${right}))`;
        if (node.type === '.') return `(r.text(${left}) + r.text(${right}))`;
        const binary = { '+': 'add', '-': 'subtract', '*': 'multiply', '/': 'divide', '%': 'modulo', '&': 'bitAnd', '==': 'equal', '===': 'identical' };
        if (binary[node.type]) return `r.${binary[node.type]}(${left}, ${right})`;
        if (node.type === '!=' || node.type === '!==') return `(!r.${node.type === '!=' ? 'equal' : 'identical'}(${left}, ${right}))`;
        if (['<', '<=', '>', '>='].includes(node.type)) return `(r.compare(${left}, ${right}) ${node.type} 0)`;
        return this.fail(node, `operator ${node.type}`);
      }
      case 'retif':
        if (node.trueExpr) return `(r.truth(${e(node.test)}) ? ${e(node.trueExpr)} : ${e(node.falseExpr)})`;
        return `(await (async value => r.truth(value) ? value : ${e(node.falseExpr)})(${e(node.test)}))`;
      case 'assign': {
        if (node.left.kind === 'list') return `r.list([${node.left.items.map(item => item ? this.slot(item.value) : 'null').join(', ')}], ${e(node.right)})`;
        const slot = this.slot(node.left), value = e(node.right);
        if (node.operator === '=') return `r.assign(${slot}, ${value})`;
        const op = { '.=': 'concat', '+=': 'add' }[node.operator];
        if (!op) return this.fail(node, `assignment ${node.operator}`);
        return `r.update(${slot}, ${JSON.stringify(op)}, ${value})`;
      }
      case 'post': return `r.post(${this.slot(node.what)}, ${node.type === '+' ? 1 : -1})`;
      case 'call': {
        if (node.what.kind === 'variable' || node.what.kind === 'offsetlookup') return `(await r.namedCall(${e(node.what)}${node.arguments.length ? ', ' + node.arguments.map(e).join(', ') : ''}))`;
        if (node.what.kind !== 'name') return this.fail(node, 'dynamic function');
        const name = node.what.name.replace(/^\\/, ''), args = node.arguments.map(e);
        this.calls.add(name);
        if (name.toLowerCase() === 'template') return `r.template(${args.join(', ')})`;
        if (name.includes('\\')) {
          const [module, method, ...rest] = name.split('\\'); if (rest.length) return this.fail(node, 'nested namespace');
          return `(await r.module(${JSON.stringify(module)}, ${JSON.stringify(method)}${args.length ? ', ' + args.join(', ') : ''}))`;
        }
        if (['shuffle', 'sort', 'array_pop'].includes(name.toLowerCase())) return `(await r.mutate(${JSON.stringify(name.toLowerCase())}, ${this.slot(node.arguments[0])}))`;
        return `(await r.call(${JSON.stringify(name.toLowerCase())}${args.length ? ', ' + args.join(', ') : ''}))`;
      }
      case 'include': return `(await r.include(${e(node.target)}, s))`;
      case 'eval': {
        // A single legacy weapon profile builds "echo $" + key + ";".
        // Lower that exact, audited construction to a variable lookup. Never
        // accept or execute the resulting string as source code.
        const value = node.source;
        if (value.kind === 'bin' && value.type === '.' && value.right.kind === 'string' && value.right.value === ';'
          && value.left.kind === 'bin' && value.left.type === '.' && value.left.left.kind === 'string' && value.left.left.value === 'echo $') {
          return `(await r.write(r.text(r.get(s, ${e(value.left.right)}))))`;
        }
        if (node.source.kind !== 'call' || node.source.what.kind !== 'name' || node.source.what.name !== 'import_module') return this.fail(node, 'dynamic evaluation');
        return `r.imports(s, ${node.source.arguments.map(e).join(', ')})`;
      }
      case 'exit': return `r.exit(${e(node.expression)})`;
      default: return this.fail(node);
    }
  }
  statement(node, depth = 1) {
    const indent = '  '.repeat(depth), e = value => this.expression(value), stmt = child => this.statement(child, depth);
    if (node.kind === 'program' || node.kind === 'block') return node.children.map(stmt).join('');
    if (node.kind === 'inline') return `${indent}await r.write(${JSON.stringify(node.value)});\n`;
    if (node.kind === 'echo') return node.expressions.map(value => `${indent}await r.write(r.text(${e(value)}));\n`).join('');
    if (node.kind === 'expressionstatement') return `${indent}${e(node.expression)};\n`;
    if (node.kind === 'if') return `${indent}if (r.truth(${e(node.test)})) {\n${this.statement(node.body, depth + 1)}${indent}}${node.alternate ? ` else {\n${this.statement(node.alternate, depth + 1)}${indent}}` : ''}\n`;
    if (node.kind === 'foreach') {
      const id = this.serial++, source = e(node.source), reference = node.value.byref;
      const setKey = node.key ? `${indent}  r.assign(${this.slot(node.key)}, k${id});\n` : '';
      const setValue = reference ? `r.bind(${this.slot(node.value)}, a${id}, k${id});` : `r.assign(${this.slot(node.value)}, v${id});`;
      return `${indent}{\n${indent}  const a${id} = ${reference ? source : `r.copy(${source})`};\n${indent}  for (const [k${id}, v${id}] of r.entries(a${id})) {\n${setKey}${indent}    ${setValue}\n${this.statement(node.body, depth + 2)}${indent}  }\n${indent}}\n`;
    }
    if (node.kind === 'for') return `${indent}for (${node.init.map(e).join(', ')}; r.truth(${node.test.map(e).join(', ')}); ${node.increment.map(e).join(', ')}) {\n${this.statement(node.body, depth + 1)}${indent}}\n`;
    if (node.kind === 'continue') {
      if (node.level && node.level.value !== '1') return this.fail(node, 'multi-level continue');
      return `${indent}continue;\n`;
    }
    if (node.kind === 'global') return node.items.map(value => `${indent}r.global(s, ${this.key(value)});\n`).join('');
    return this.fail(node);
  }
  emit(ast) { return `// Generated from ${this.filename}; edit source migration/compiler, not generated code.\nexport default async function render(r, s) {\n${this.statement(ast)}return 1;\n}\n`; }
}
