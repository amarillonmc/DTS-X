// Build-time optimization of the emitter's tiny JavaScript scope protocol.
// Unknown syntax/use of the whole local scope always retains full imports.
const same = (tokens, at, values) => values.every((value, index) => tokens[at + index]?.type !== 'string' && tokens[at + index]?.value === value);
export function tokenize(source) {
  const result = [];
  for (let at = 0; at < source.length;) {
    if (/\s/.test(source[at])) { at++; continue; }
    if (source.startsWith('//', at)) { const end = source.indexOf('\n', at); at = end < 0 ? source.length : end; continue; }
    if (source.startsWith('/*', at)) { const end = source.indexOf('*/', at + 2); if (end < 0) throw new Error('Unclosed comment'); at = end + 2; continue; }
    const start = at, quote = source[at];
    if (quote === '"' || quote === "'") {
      for (at++; at < source.length; at++) { if (source[at] === '\\') at++; else if (source[at] === quote) { at++; break; } }
      const raw = source.slice(start, at);
      if (raw.at(-1) !== quote) throw new Error('Unclosed string');
      result.push({ type: 'string', value: quote === '"' ? JSON.parse(raw) : null, start, end: at }); continue;
    }
    // The emitter lowers division/regex to helpers and does not emit template
    // literals. Decline manually edited files using these unfamiliar forms.
    if (quote === '`' || quote === '/') throw new Error('Unsupported generated syntax');
    const name = source.slice(at).match(/^[$A-Z_a-z][$\w]*/)?.[0];
    if (name) { at += name.length; result.push({ type: 'name', value: name, start, end: at }); continue; }
    result.push({ type: 'punctuation', value: source[at], start, end: ++at });
  }
  return result;
}

export function selectImports(source) {
  let tokens;
  try { tokens = tokenize(source); } catch { return { code: source, eligible: 0, changed: 0, skipped: { syntax: 1 }, fields: [] }; }
  const replacements = [], skipped = {}, fieldCounts = [];
  let eligible = 0, changed = 0;
  const reject = reason => { skipped[reason] = (skipped[reason] ?? 0) + 1; };
  for (let at = 0; at < tokens.length; at++) {
    if (!same(tokens, at, ['async', 'function'])) continue;
    const name = tokens[at + 2]?.value;
    if (!same(tokens, at + 3, ['(', 'ctx', ',', '.', '.', '.', 'args', ')', '{'])) {
      return { code: source, eligible: 0, changed: 0, skipped: { signature: 1 }, fields: [] };
    }
    let begin = at + 3;
    while (begin < tokens.length && !(tokens[begin].type === 'punctuation' && tokens[begin].value === '{')) begin++;
    let end = begin + 1, depth = 1;
    for (; end < tokens.length && depth; end++) { if (tokens[end].type !== 'punctuation') continue; if (tokens[end].value === '{') depth++; else if (tokens[end].value === '}') depth--; }
    if (depth) { reject('unclosed function'); continue; }
    const body = tokens.slice(begin + 1, end - 1);
    at = end - 1;
    if (!body.some((token, index) => same(body, index, ['r', '.', 'imports', '(']))) continue;
    // init() has the same private Object.create(null) lexical scope as other
    // generated functions. The public definition.initialize(ctx) object method
    // uses ctx.state() and is deliberately outside this function matcher.
    if (name.startsWith('___')) { reject('lifecycle'); continue; }
    const fields = new Set(), imports = [];
    let declarations = 0, reason;
    for (let index = 0; index < body.length && !reason; index++) {
      const token = body[index];
      if (token.type === 'name' && token.value === 'r') {
        const declaration = body[index - 1]?.value === 'const' && same(body, index + 1, ['=', 'createModuleContext', '(']);
        const member = body[index + 1]?.value === '.' && body[index + 2]?.type === 'name';
        const readable = member && (body[index + 3]?.value === '(' || ['APPEND', 'globals'].includes(body[index + 2].value));
        if (!declaration && !readable) { reason = 'runtime escape or mutation'; break; }
      }
      if (same(body, index, ['r', '.'])) {
        const helper = body[index + 2]?.value;
        if (['include', 'extract', 'namedCall'].includes(helper)) { reason = 'scope-sensitive helper'; break; }
        if (helper === 'call') {
          const method = body[index + 4];
          if (method?.type !== 'string' || typeof method.value !== 'string' || ![',', ')'].includes(body[index + 5]?.value) || ['debug_backtrace', 'get_defined_vars', 'extract', 'compact'].includes(method.value.toLowerCase())) { reason = 'scope-sensitive call'; break; }
        }
      }
      if (token.type !== 'name' || token.value !== 's') continue;
      if (same(body, index - 1, [',', 's', '=', 'Object', '.', 'create', '(', 'null', ')', ';'])) { declarations++; continue; }
      const prefix = body.slice(index - 4, index).map(token => token.value);
      if (prefix[0] !== 'r' || prefix[1] !== '.' || prefix[3] !== '(' || body[index + 1]?.value !== ',') { reason = 'scope escape'; break; }
      const helper = prefix[2];
      if (helper === 'imports') {
        let cursor = index + 1;
        while (body[cursor]?.value === ',' && body[cursor + 1]?.type === 'string' && typeof body[cursor + 1].value === 'string') cursor += 2;
        if (cursor === index + 1 || body[cursor]?.value !== ')') { reason = 'dynamic module'; break; }
        imports.push(body[index - 2]);
      } else if (['get', 'parameter', 'global', 'declare'].includes(helper)) {
        const field = body[index + 2];
        if (field?.type !== 'string' || typeof field.value !== 'string' || ![',', ')'].includes(body[index + 3]?.value)) { reason = 'dynamic key'; break; }
        fields.add(field.value);
      } else if (helper === 'slot') {
        const field = body[index + 3];
        if (body[index + 2]?.value !== '[' || field?.type !== 'string' || typeof field.value !== 'string' || ![',', ']'].includes(body[index + 4]?.value)) { reason = 'dynamic slot'; break; }
        fields.add(field.value);
      } else reason = 'unknown scope helper';
    }
    if (reason || declarations !== 1) { reject(reason ?? 'scope declaration'); continue; }
    eligible++;
    const selected = JSON.stringify([...fields]);
    for (const token of imports) {
      // Insert the field list after the exact first `s,` argument, retaining the
      // original import position/module order and all other source byte-for-byte.
      const scope = tokens.findIndex(value => value.start === token.start) + 2;
      replacements.push([token.start, token.end, 'importsSelected']);
      replacements.push([tokens[scope + 1].end, tokens[scope + 1].end, ` ${selected},`]);
      changed++;
    }
    fieldCounts.push(fields.size);
  }
  let code = source;
  for (const [start, end, value] of replacements.sort((a, b) => b[0] - a[0])) code = code.slice(0, start) + value + code.slice(end);
  return { code, eligible, changed, skipped, fields: fieldCounts };
}
