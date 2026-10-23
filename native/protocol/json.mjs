// JSON data decoding with textual property order. JSON.parse sorts integer
// property names before a caller can observe them. Game card/achievement data
// and remote user maps retain PHP's insertion order instead. This parser only
// accepts JSON data; it never accepts or evaluates executable source.
const order = new WeakMap();
export class JsonObject {
  constructor(entries) {
    const keys = [];
    for (const [name, value] of entries) {
      if (!Object.hasOwn(this, name)) keys.push(name);
      Object.defineProperty(this, name, { configurable: true, enumerable: true, writable: true, value });
    }
    order.set(this, keys);
  }
}
export const jsonObjectEntries = value => {
  const names = (order.get(value) ?? []).filter(name => Object.hasOwn(value, name));
  for (const name of Object.keys(value)) if (!names.includes(name)) names.push(name);
  return names.map(name => [name, value[name]]);
};
export class JsonPrecisionError extends RangeError {}
export function parseOrderedJson(source, { objectFactory = entries => new JsonObject(entries), depth = 512 } = {}) {
  if (typeof source !== 'string' || !source.isWellFormed()) throw new SyntaxError('JSON requires valid Unicode');
  let position = 0;
  const fail = () => { throw new SyntaxError(`Invalid JSON at byte ${Buffer.byteLength(source.slice(0, position))}`); };
  const whitespace = () => { while (/[\t\r\n ]/.test(source[position] ?? '\0')) position++; };
  function string() {
    const start = position++; let escaped = false;
    for (; position < source.length; position++) {
      const char = source[position];
      if (!escaped && char === '"') { const value = JSON.parse(source.slice(start, ++position)); if (!value.isWellFormed()) fail(); return value; }
      if (!escaped && char === '\\') escaped = true; else escaped = false;
    }
    return fail();
  }
  function value(level) {
    whitespace(); const first = source[position];
    if (first === '"') return string();
    if (first === '[' || first === '{') {
      if (level >= depth) fail();
      position++; const closing = first === '[' ? ']' : '}', entries = [];
      whitespace(); if (source[position] === closing) { position++; return first === '[' ? entries : objectFactory(entries); }
      while (position < source.length) {
        if (first === '[') entries.push(value(level + 1));
        else { whitespace(); if (source[position] !== '"') fail(); const key = string(); whitespace(); if (source[position++] !== ':') fail(); entries.push([key, value(level + 1)]); }
        whitespace(); const delimiter = source[position++]; if (delimiter === closing) return first === '[' ? entries : objectFactory(entries); if (delimiter !== ',') fail();
      }
      return fail();
    }
    for (const [word, result] of [['null', null], ['true', true], ['false', false]]) if (source.startsWith(word, position)) { position += word.length; return result; }
    const token = source.slice(position).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (!token) return fail(); position += token[0].length; const number = Number(token[0]);
    if (!Number.isFinite(number) || Math.abs(number) > Number.MAX_SAFE_INTEGER) throw new JsonPrecisionError('Decoded protocol number exceeds JavaScript safe precision.');
    return token[0] === '-0' ? 0 : number;
  }
  const result = value(1); whitespace(); if (position !== source.length) fail(); return result;
}
