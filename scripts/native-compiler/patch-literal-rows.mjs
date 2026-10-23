// Development-only optimization for a large table with a few computed rows.
// Constant unique keys preserve the source layout; unknown shapes stay intact.
import { isArrayLiteral } from './hoist-literals.mjs';

function splitList(source) {
  if (!source.startsWith('[') || !source.endsWith(']')) return null;
  const result = []; let start = 1, depth = 0;
  for (let at = 1; at < source.length - 1; at++) {
    const char = source[at];
    if (char === '"') { for (at++; at < source.length; at++) { if (source[at] === '\\') at++; else if (source[at] === '"') break; } continue; }
    if (char === "'" || char === '`' || char === '/') return null;
    if ('([{'.includes(char)) depth++;
    else if (')]}'.includes(char)) { if (--depth < 0) return null; }
    else if (char === ',' && !depth) { result.push(source.slice(start, at).trim()); start = at + 1; }
  }
  if (depth) return null;
  if (source.slice(start, -1).trim()) result.push(source.slice(start, -1).trim());
  return result;
}

export function patchLiteralRows(code, valuesPath) {
  const start = code.indexOf('  async initialize(ctx) {');
  if (start < 0) return code;
  const prepared = new Set();
  for (const match of code.matchAll(/^const (literal\d+) = literalValues\.immutableArray\((.*)\);$/gm)) {
    const expression = match[2].replace(/("(?:\\.|[^"\\])*")|literalValues\.(array|APPEND)\b/g, (whole, string, helper) => string ?? `r.${helper}`);
    if (isArrayLiteral(expression)) prepared.add(match[1]);
  }
  const inert = expression => prepared.has(expression) || isArrayLiteral(`r.array([[0, ${expression}]])`);
  const declarations = []; let serial = 0;
  const body = code.slice(start).replace(/^(\s*r\.assign\(r\.slot\(s, \["(?:\\.|[^"\\])*"\]\), )(r\.array\(.*\))(\);)$/gm, (line, before, expression, after) => {
    if (expression.length < 1024) return line;
    const items = splitList(expression.slice('r.array('.length, -1));
    if (!items || items.length < 32) return line;
    const base = [], dynamic = [], keys = new Set();
    for (const item of items) {
      const pair = splitList(item);
      if (pair?.length !== 2) return line;
      let key;
      try { key = JSON.parse(pair[0]); } catch { return line; }
      if (typeof key !== 'string' && !(typeof key === 'number' && Number.isSafeInteger(key))) return line;
      // Numeric JSON keys and their canonical decimal strings address the same
      // PHP bucket. APPEND/dynamic/duplicate keys deliberately take the old path.
      if (keys.has(String(key))) return line;
      keys.add(String(key));
      if (inert(pair[1])) base.push(item);
      else { base.push(`[${pair[0]}, null]`); dynamic.push(item); }
    }
    if (!dynamic.length || dynamic.length * 4 > items.length) return line;
    while (code.includes(`literalRows${serial}`)) serial++;
    const name = `literalRows${serial++}`;
    const source = `r.array([${base.join(', ')}])`.replace(/("(?:\\.|[^"\\])*")|r\.(array|APPEND)\b/g, (whole, string, helper) => string ?? `literalValues.${helper}`);
    declarations.push(`const ${name} = literalValues.immutableArray(${source});`);
    return `${before}r.arrayPatch(${name}, [${dynamic.join(', ')}])${after}`;
  });
  if (!declarations.length) return code;
  // Existing literal declarations must execute before a table that uses them.
  const imported = code.includes('import * as literalValues from ');
  const boundary = code.lastIndexOf('export const definition = {', start);
  if (boundary < 0) return code;
  return code.slice(0, boundary) + `${imported ? '' : `import * as literalValues from ${JSON.stringify(valuesPath)};\n`}${declarations.join('\n')}\n` + code.slice(boundary, start) + body;
}
