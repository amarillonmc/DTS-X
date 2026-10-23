import { tokenize } from './select-imports.mjs';

/** Arrays freshly returned by the value constructors already own their copied
 * children. Their enclosing assignment/return need not copy them a second time.
 * Only static compiler helper calls qualify; escaped/mutated runtimes do not. */
export function elideTemporaryCopies(source) {
  let tokens;
  try { tokens = tokenize(source); } catch { return source; }
  const is = (at, ...values) => values.every((value, offset) => tokens[at + offset]?.type !== 'string' && tokens[at + offset]?.value === value);
  const pairs = new Map(), stack = [];
  for (let at = 0; at < tokens.length; at++) {
    const token = tokens[at]; if (token.type === 'string') continue;
    if (token.value === '(') stack.push(at);
    if (token.value === ')') { const begin = stack.pop(); if (begin === undefined) return source; pairs.set(begin, at); }
    if (token.type === 'name' && token.value === 'r') {
      if (is(at - 1, 'const', 'r', '=', 'createModuleContext', '(')) continue;
      if (!is(at, 'r', '.') || tokens[at + 2]?.type !== 'name') return source;
      if (tokens[at + 3]?.value !== '(' && !['APPEND', 'globals'].includes(tokens[at + 2].value)) return source;
    }
  }
  if (stack.length) return source;
  const fresh = at => is(at, 'r', '.') && ['array', 'arrayRefs', 'arrayPatch'].includes(tokens[at + 2]?.value) && tokens[at + 3]?.value === '(';
  const edits = [];
  for (let at = 0; at < tokens.length; at++) {
    if (is(at, 'r', '.', 'copy', '(') && fresh(at + 4)) {
      const inner = pairs.get(at + 7), outer = pairs.get(at + 3);
      if (inner + 1 === outer) { edits.push([tokens[at].start, tokens[at + 3].end, ''], [tokens[outer].start, tokens[outer].end, '']); }
    }
    if (is(at, 'r', '.', 'assign', '(', 'r', '.', 'slot', '(')) {
      const first = pairs.get(at + 7), second = first + 2;
      if (tokens[first + 1]?.value !== ',' || !fresh(second)) continue;
      if (pairs.get(second + 3) + 1 === pairs.get(at + 3)) edits.push([tokens[at + 2].start, tokens[at + 2].end, 'assignOwned']);
    }
  }
  let code = source;
  for (const [start, end, value] of edits.sort((a, b) => b[0] - a[0])) code = code.slice(0, start) + value + code.slice(end);
  return code;
}
