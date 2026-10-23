import * as v from '../templates/values.mjs';

// The game's PCRE expressions use delimiters and i/m/s modifiers. Compile those
// concrete patterns to native RegExp; non-u expressions operate on UTF-8 bytes,
// as PHP does, rather than JavaScript UTF-16 character offsets.
function compiled(pattern, global = false) {
  pattern = v.text(pattern);
  const delimiter = pattern[0], end = pattern.lastIndexOf(delimiter);
  if (!delimiter || /[a-z0-9\\\s]/i.test(delimiter) || end === 0) throw new TypeError('Invalid source regular expression');
  const modifiers = pattern.slice(end + 1);
  if (/[^imsuD]/.test(modifiers)) throw new Error(`Unsupported source regular expression modifier: ${modifiers}`);
  const unicode = modifiers.includes('u');
  let source = pattern.slice(1, end).replaceAll(`\\${delimiter}`, delimiter);
  if (modifiers.includes('D') && !modifiers.includes('m')) source = source.replace(/(?<!\\)\$/g, '(?![\\s\\S])');
  if (!unicode) source = Buffer.from(source).toString('latin1');
  const expression = new RegExp(source, [...new Set(modifiers.replace('D', '') + (global ? 'g' : ''))].join(''));
  return { expression, encode: text => unicode ? v.text(text) : Buffer.from(v.text(text)).toString('latin1'),
    decode: text => unicode ? text : Buffer.from(text, 'latin1').toString(), unicode };
}
function capture(match, pattern, flags, subject, keepTrailing = false) {
  let end = match.length;
  if (!keepTrailing && !(flags & 512)) while (end > 1 && match[end - 1] === undefined) end--;
  return Array.from({ length: end }, (_, i) => {
    const value = match[i] === undefined ? (flags & 512 ? null : '') : pattern.decode(match[i]);
    if (!(flags & 256)) return value;
    const index = match.indices?.[i]?.[0] ?? -1;
    return [value, index < 0 || !pattern.unicode ? index : Buffer.byteLength(subject.slice(0, index))];
  });
}
export function pregMatch(pattern, subject, flags = 0, offset = 0, all = false) {
  flags = v.int(flags); const p = compiled(pattern, true), text = p.encode(subject);
  if (flags & ~(2 | 1 | 256 | 512)) throw new Error(`Unsupported source regular expression flags ${flags}`);
  if (flags & 256) p.expression = new RegExp(p.expression.source, p.expression.flags + 'd');
  offset = v.int(offset); if (offset < 0) offset = Buffer.byteLength(v.text(subject)) + offset;
  p.expression.lastIndex = p.unicode ? Buffer.from(v.text(subject)).subarray(0, offset).toString().length : offset;
  const rows = []; let match;
  while ((match = p.expression.exec(text))) {
    rows.push(capture(match, p, flags, text, all && !(flags & 2)));
    if (!all) break;
    if (!match[0].length) p.expression.lastIndex++;
  }
  if (!all) return { count: rows.length, matches: rows[0] ?? [] };
  if (flags & 2) return { count: rows.length, matches: rows };
  const captureCount = new RegExp(`(?:${p.expression.source})|`, p.expression.flags.replace('g', '')).exec('')?.length ?? 1;
  const width = rows.reduce((max, row) => Math.max(max, row.length), captureCount);
  return { count: rows.length, matches: Array.from({ length: width }, (_, index) => rows.map(row => index < row.length ? row[index] : (flags & 256 ? ['', -1] : ''))) };
}
function substitute(replacement, match) {
  return replacement.replace(/\\\\|\\\$|\\(\d{1,2})|\$(?:\{(\d+)\}|(\d{1,2}))/g, (whole, backslash, braced, plain) => whole === '\\\\' ? '\\' : whole === '\\$' ? '$' : match[Number(backslash ?? braced ?? plain)] ?? '');
}
export async function pregReplace(pattern, replacement, subject, limit = -1, callback = false) {
  if (v.isArray(subject)) { const result = []; for (const [key, value] of v.entries(subject)) result.push([key, await pregReplace(pattern, replacement, value, limit, callback)]); return v.array(result); }
  if (v.isArray(pattern)) { let result = subject, index = 0; for (const [, expression] of v.entries(pattern)) result = await pregReplace(expression, v.isArray(replacement) ? v.entries(replacement)[index++]?.[1] ?? '' : replacement, result, limit, callback); return result; }
  const p = compiled(pattern, true), text = p.encode(subject), pieces = []; let position = 0, count = 0, match;
  while ((limit < 0 || count < v.int(limit)) && (match = p.expression.exec(text))) {
    pieces.push(text.slice(position, match.index));
    pieces.push(callback ? p.encode(await replacement(capture(match, p, 0, text))) : substitute(p.encode(replacement), match));
    position = match.index + match[0].length; count++;
    if (!match[0].length) p.expression.lastIndex++;
  }
  pieces.push(text.slice(position)); return p.decode(pieces.join(''));
}
