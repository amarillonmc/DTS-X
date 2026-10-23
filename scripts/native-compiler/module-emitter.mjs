import { TemplateEmitter } from './template-emitter.mjs';

const functionName = node => node.name.name.toLowerCase();
const isMagic = node => node?.kind === 'if' && node.test.kind === 'eval'
  && node.test.source.kind === 'name' && node.test.source.name === '__MAGIC__'
  && node.body.kind === 'return' && node.body.expr?.kind === 'variable'
  && node.body.expr.name === '___RET_VALUE' && !node.alternate;
const mutations = new Set(['shuffle', 'sort', 'rsort', 'asort', 'arsort', 'ksort', 'krsort', 'array_pop', 'array_shift', 'array_push', 'array_unshift', 'array_splice', 'swap']);

/** Build-only lowering of named module functions. Branches, loops, expressions
 * and calls become normal JavaScript; no AST or source text enters production.
 * Only the exact module dispatcher sentinel is replaced by registry dispatch.
 */
export class ModuleEmitter extends TemplateEmitter {
  constructor(filename, { module, signatures, localFunctions }) {
    super(filename); this.module = module; this.signatures = signatures; this.localFunctions = localFunctions;
    this.method = null; this.phase = 'function'; this.loops = []; this.switches = new Set();
  }
  slot(node) {
    const keys = []; let root = node;
    while (root.kind === 'offsetlookup') { keys.unshift(root.offset ? this.expression(root.offset) : 'r.APPEND'); root = root.what; }
    if (root.kind === 'variable' && root.name === 'GLOBALS') return `r.slot(r.globals, [${keys.join(', ')}])`;
    if (root.kind === 'call' && keys.length) return `r.slot(${this.expression(root)}, [${keys.join(', ')}])`;
    return super.slot(node);
  }
  arguments(nodes, module, method) {
    const signature = this.signatures[`${module}.${method}`] ?? [];
    return nodes.map((node, index) => signature[index]?.byref
      ? `r.argument(${this.slot(node)})` : node.kind === 'variadic' ? `...r.entries(${this.expression(node.what)}).map(([, value]) => value)` : this.expression(node));
  }
  expression(node) {
    const e = value => this.expression(value);
    if (node?.kind === 'nowdoc') return JSON.stringify(node.value);
    if (node?.kind === 'variable' && node.name === 'GLOBALS') return 'r.globals';
    if (node?.kind === 'number' && /^0[0-7]+$/.test(node.value)) return '0o' + node.value.slice(1);
    if (node?.kind === 'variadic') return `...r.entries(${e(node.what)}).map(([, value]) => value)`;
    if (node?.kind === 'array' && node.items.some(item => item.byRef)) return `r.arrayRefs([${node.items.map(item => `[${item.key ? e(item.key) : 'r.APPEND'}, ${item.byRef ? `r.argument(${this.slot(item.value)})` : e(item.value)}, ${item.byRef}]`).join(', ')}])`;
    if (node?.kind === 'assignref') {
      const right = node.right;
      const source = right.kind === 'call' && right.what.kind === 'name' && ['get_var_in_module', 'get_var_input'].includes(right.what.name)
        ? `(await r.lookupReference(${JSON.stringify(right.what.name)}, ${right.arguments.map(e).join(', ')}))`
        : right.kind === 'call' && right.what.kind === 'name' && right.what.name === 'room_get_vars'
          ? `(await r.call("room_get_vars_ref", ${right.arguments.map(e).join(', ')}))`
        : right.kind === 'call' ? e(right) : `r.argument(${this.slot(right)})`;
      return `r.alias(${this.slot(node.left)}, ${source})`;
    }
    if (node?.kind === 'magic') {
      if (node.value === '__DIR__') return JSON.stringify(this.filename.replace(/\/[^/]+$/, ''));
      if (node.value === '__FILE__') return JSON.stringify(this.filename);
      if (node.value === '__NAMESPACE__') return JSON.stringify(this.module);
      return this.fail(node, `magic ${node.value}`);
    }
    if (node?.kind === 'bin' && node.type === '<<') return `r.shiftLeft(${e(node.left)}, ${e(node.right)})`;
    if (node?.kind === 'bin' && node.type === '??') return `(${e(node.left)} ?? ${e(node.right)})`;
    if (node?.kind === 'assign' && ['-=', '*=', '/='].includes(node.operator)) return `r.update(${this.slot(node.left)}, ${JSON.stringify({ '-=': 'subtract', '*=': 'multiply', '/=': 'divide' }[node.operator])}, ${e(node.right)})`;
    if (node?.kind === 'call') {
      if (node.what.kind === 'variable' && node.what.name === 'chprocess') return `(await r.next(${this.arguments(node.arguments, this.module, this.method).join(', ')}))`;
      if (node.what.kind === 'variable' || node.what.kind === 'offsetlookup') return `(await r.namedCall(${e(node.what)}${node.arguments.length ? ', ' + node.arguments.map(argument => ['variable', 'offsetlookup'].includes(argument.kind) ? `r.argument(${this.slot(argument)})` : e(argument)).join(', ') : ''}))`;
      if (node.what.kind === 'propertylookup') {
        if (node.what.what.kind !== 'variable' || node.what.what.name !== 'db' || node.what.offset.kind !== 'identifier') return this.fail(node, 'non-database method');
        return `(await r.database(${JSON.stringify(node.what.offset.name)}, ${node.arguments.map(e).join(', ')}))`;
      }
      if (node.what.kind === 'name') {
        const name = node.what.name.replace(/^\\/, '').toLowerCase();
        // Original derived PHP configuration writes become explicit inert data
        // writes. The source calculation and cache invalidation stay unchanged.
        const cacheFields = {
          'cardbase.parse_card_index': [['cardindex', 'new_cardindex'], ['cardindex_reverse', 'new_cardindex_reverse']],
          'cardbase.parse_card_gaining_method': [['card_gaining_method', 'cgmethod']],
          'randrecipe.create_randrecipe_config': [['randrecipe', 'rl']],
          'skill490.get_random_itmksklist490': [['itemklist', 'itemklist'], ['itemsklist', 'itemsklist']],
          'randmix.create_randmix_config': [['randmixinfo', '___native_randmixinfo']],
        }[`${this.module}.${this.method}`];
        if (name === 'var_export' && this.module === 'randmix' && this.method === 'create_randmix_config') return `(await r.call("var_export", r.assign(r.slot(s, ["___native_randmixinfo"]), ${e(node.arguments[0])}), 1))`;
        if (['file_put_contents', 'writeover'].includes(name) && cacheFields) return `(await r.writeCache(${e(node.arguments[0])}, r.array([${cacheFields.map(([field, variable]) => `[${JSON.stringify(field)}, r.get(s, ${JSON.stringify(variable)})]`).join(', ')}])))`;
        if (name === 'file_put_contents' && this.module === 'itemnumlist' && this.method === 'itemnumlist_write') return `(await r.writeCache(${e(node.arguments[0])}, r.array(r.entries(r.get(s, "cont")).map(([key, value]) => ["cont_" + key, value]))))`;
        if (name === 'extract') return `r.extract(s, ${node.arguments.map(e).join(', ')})`;
        if (['preg_match', 'preg_match_all'].includes(name) && node.arguments.length >= 3) return `(await r.match(${e(node.arguments[0])}, ${e(node.arguments[1])}, r.argument(${this.slot(node.arguments[2])}), ${node.arguments[3] ? e(node.arguments[3]) : '0'}, ${node.arguments[4] ? e(node.arguments[4]) : '0'}, ${name === 'preg_match_all'}))`;
        let target, method;
        if (name.includes('\\')) [target, method] = name.split('\\');
        else if (this.localFunctions.has(name)) [target, method] = [this.module, name];
        if (target) {
          this.calls.add(`${target}\\${method}`);
          return `(await r.module(${JSON.stringify(target)}, ${JSON.stringify(method)}${node.arguments.length ? ', ' + this.arguments(node.arguments, target, method).join(', ') : ''}))`;
        }
        if (mutations.has(name)) return `(await r.mutate(${JSON.stringify(name)}, ${node.arguments.map((argument, index) => index === 0 || name === 'swap' ? `r.argument(${this.slot(argument)})` : e(argument)).join(', ')}))`;
        // Global helpers returning references have a concrete native slot API.
        if (name === 'get_var_in_module' || name === 'get_var_input') return `r.readReference((await r.lookupReference(${JSON.stringify(name)}, ${node.arguments.map(e).join(', ')})))`;
      }
    }
    if (node?.kind === 'include' && node.target.kind === 'string') {
      if (node.target.value === './include/roommng/room.func.php') return 'r.requireRooms()';
      if (node.target.value === './include/messages.func.php') return 'r.requireMessages()';
      return this.fail(node, `source include ${node.target.value}`);
    }
    if (node?.kind === 'include') return `(await r.include(${e(node.target)}, s, ${!!node.once}))`;
    return super.expression(node);
  }
  statement(node, depth = 1) {
    const indent = '  '.repeat(depth), e = value => this.expression(value);
    if (this.module === 'replay' && this.method === 'post_gameover_events' && node.kind === 'if'
      && node.test?.kind === 'bin' && node.test.type === '||'
      && node.test.left?.kind === 'unary' && node.test.left.type === '!' && node.test.left.what?.name === '___MOD_SRV'
      && node.test.right?.kind === 'unary' && node.test.right.type === '!' && node.test.right.what?.name === '___MOD_CODE_ADV3'
      && node.body.kind === 'return' && !node.body.expr && !node.alternate) {
      return `${indent}// Native recording replaces the PHP daemon/compressor capability guard.\n${indent}if (!r.capability("replayRecording")) return null;\n`;
    }
    if (isMagic(node)) return `${indent}// __MAGIC__: ModuleRegistry dispatches the complete override chain.\n`;
    if (node.kind === 'namespace') return node.children.map(child => this.statement(child, depth)).join('');
    if (node.kind === 'function') return '';
    if (node.kind === 'return') return `${indent}return r.copy(${e(node.expr)});\n`;
    if (node.kind === 'unset') return node.variables.map(value => `${indent}r.unset(${this.slot(value)});\n`).join('');
    if (node.kind === 'switch') {
      const label = `switch${this.serial++}`; this.loops.push(label); this.switches.add(label);
      const cases = node.body.children.map(branch => `${indent}    ${branch.test ? `case r.equal(${label}Value, ${e(branch.test)})` : 'default'}:\n${this.statement(branch.body, depth + 3)}`).join('');
      this.loops.pop();
      return `${indent}{\n${indent}  const ${label}Value = ${e(node.test)};\n${indent}  ${label}: switch (true) {\n${cases}${indent}  }\n${indent}}\n`;
    }
    if (['foreach', 'for', 'while', 'do'].includes(node.kind)) {
      const label = `loop${this.serial++}`; this.loops.push(label); let code;
      if (node.kind === 'while') code = `${indent}${label}: while (r.truth(${e(node.test)})) {\n${this.statement(node.body, depth + 1)}${indent}}\n`;
      else if (node.kind === 'do') code = `${indent}${label}: do {\n${this.statement(node.body, depth + 1)}${indent}} while (r.truth(${e(node.test)}));\n`;
      else code = super.statement(node, depth).replace(/for \(/, `${label}: for (`);
      this.loops.pop(); return code;
    }
    if (node.kind === 'break') {
      const level = Number(node.level?.value ?? 1), label = this.loops.at(-level);
      if (!label) return this.fail(node, 'invalid break level');
      return `${indent}break ${label};\n`;
    }
    if (node.kind === 'continue') {
      const level = Number(node.level?.value ?? 1), label = this.loops.at(-level);
      if (!label) return this.fail(node, 'invalid continue level');
      return `${indent}${this.switches.has(label) ? 'break' : 'continue'} ${label};\n`;
    }
    if (node.kind === 'global' && this.phase === 'top') return node.items.map(value => `${indent}r.declare(s, ${this.key(value)});\n`).join('');
    return super.statement(node, depth);
  }
  emitFunction(node) {
    this.method = functionName(node); this.phase = this.method === 'init' ? 'init' : 'function';
    const params = node.arguments.map((argument, index) => {
      const value = `args.length > ${index} ? args[${index}] : ${this.expression(argument.value)}`;
      return `  r.parameter(s, ${JSON.stringify(argument.name.name)}, ${value}, ${argument.byref});\n`;
    }).join('');
    return `async function ${this.method}(ctx, ...args) {\n  const r = createModuleContext(ctx, ${JSON.stringify(this.module)}, ${JSON.stringify(this.phase)}), s = Object.create(null);\n${params}${this.statement(node.body)}  return null;\n}\n`;
  }
}

export function collectFunctions(ast) {
  return ast.children.flatMap(node => node.kind === 'namespace' ? node.children : [node]).filter(node => node.kind === 'function');
}
export function signaturesFor(ast, module) {
  return Object.fromEntries(collectFunctions(ast).map(fn => [`${module}.${functionName(fn)}`, fn.arguments.map(argument => ({ name: argument.name.name, byref: argument.byref }))]));
}
