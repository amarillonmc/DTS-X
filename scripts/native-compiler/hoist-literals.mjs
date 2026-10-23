// Development-only transformation of the static JavaScript emitter's output.
// This recognizes a deliberately tiny literal grammar; it never evaluates code
// or moves expressions that read state, call rules, or contain references.
export function isArrayLiteral(source) {
  let at = 0;
  const token = value => { while (/\s/.test(source[at] ?? '') && at < source.length) at++; if (!source.startsWith(value, at)) return false; at += value.length; return true; };
  const value = () => {
    if (token('r.array(')) { if (!list()) return false; return token(')'); }
    if (token('r.APPEND')) return true;
    if (token('[')) { if (token(']')) return true; do { if (!value()) return false; } while (token(',')); return token(']'); }
    while (/\s/.test(source[at] ?? '') && at < source.length) at++;
    const scalar = source.slice(at).match(/^(?:"(?:\\.|[^"\\])*"|true\b|false\b|null\b|-?(?:0[xX][0-9a-fA-F]+|0[oO][0-7]+|\d+(?:\.\d*)?(?:[eE][+-]?\d+)?))/);
    if (!scalar) return false; at += scalar[0].length; return true;
  };
  const list = () => { if (!token('[')) return false; if (token(']')) return true; do { if (!value()) return false; } while (token(',')); return token(']'); };
  return source.startsWith('r.array(') && value() && token('') && at === source.length;
}

export function hoistLiterals(code, valuesPath) {
  const start = code.indexOf('  async initialize(ctx) {');
  if (start < 0) return code;
  const literals = [];
  const existing = [...code.matchAll(/^const literal(\d+) =/gm)].map(match => Number(match[1]));
  let serial = existing.length ? Math.max(...existing) + 1 : 0;
  const lift = expression => {
    const name = `literal${serial++}`;
    const inert = expression.replace(/("(?:\\.|[^"\\])*")|r\.(array|APPEND)\b/g, (whole, string, helper) => string ?? `literalValues.${helper}`);
    literals.push(`const ${name} = literalValues.immutableArray(${inert});`);
    return name;
  };
  const body = code.slice(start).replace(/^(\s*r\.assign\(r\.slot\(s, \["(?:\\.|[^"\\])*"\]\), )(r\.array\(.*\))(\);)$/gm, (line, before, expression, after) => {
    if (expression.length < 128) return line;
    if (isArrayLiteral(expression)) return `${before}${lift(expression)}${after}`;
    // A large table can include a random/state-dependent row. Move only pure
    // nested arrays; leave dynamic expressions and their evaluation order intact.
    const spans = [], stack = [];
    for (let at = 0; at < expression.length; at++) {
      if (expression[at] === '"') { for (at++; at < expression.length; at++) { if (expression[at] === '\\') at++; else if (expression[at] === '"') break; } continue; }
      if (expression[at] === '(') stack.push(expression.slice(at - 7, at) === 'r.array' ? at - 7 : null);
      else if (expression[at] === ')') { const begin = stack.pop(); if (begin != null && at - begin > 256) spans.push([begin, at + 1]); }
    }
    spans.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
    const replacements = []; let through = -1;
    for (const [begin, end] of spans) if (begin >= through && isArrayLiteral(expression.slice(begin, end))) {
      replacements.push([begin, end, lift(expression.slice(begin, end))]); through = end;
    }
    for (const [begin, end, name] of replacements.reverse()) expression = expression.slice(0, begin) + name + expression.slice(end);
    return `${before}${expression}${after}`;
  });
  if (!literals.length) return code;
  const contextImport = code.search(/import \{ (?:cachedModuleContext as )?createModuleContext \}/);
  if (contextImport < 0) return code;
  const boundary = code.indexOf('\n', contextImport) + 1;
  const imported = code.includes('import * as literalValues from ');
  return code.slice(0, boundary) + `${imported ? '' : `import * as literalValues from ${JSON.stringify(valuesPath)};\n`}${literals.join('\n')}\n` + code.slice(boundary, start) + body;
}
