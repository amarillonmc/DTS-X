import { createHash } from 'node:crypto';
import entities from './html-entities.json' with { type: 'json' };
import { mgzdecode, protocolJson } from '../protocol/codec.mjs';
import { JsonPrecisionError, parseOrderedJson } from '../protocol/json.mjs';
import * as v from './values.mjs';

const values = value => v.entries(value).map(([, item]) => item);
const bytes = value => Buffer.isBuffer(value) ? value : Buffer.from(v.text(value));
export function jsonDecode(value, associative = false, depth = 512) {
  try {
    const source = bytes(value), decoded = source.toString(); if (!Buffer.from(decoded).equals(source)) return null;
    return parseOrderedJson(decoded, { depth: v.int(depth), ...(v.truth(associative) ? { objectFactory: entries => v.array(entries) } : {}) });
  } catch (error) { if (error instanceof JsonPrecisionError) throw error; if (error instanceof SyntaxError) return null; throw error; }
}
export function decodeGameData(value, associative = false) {
  if (!v.truth(value)) return [];
  try { return jsonDecode(mgzdecode(Buffer.from(v.text(value), 'base64')), associative); }
  catch (error) { if (error.code === 'Z_DATA_ERROR' || error.code === 'Z_BUF_ERROR') return null; throw error; }
}
const orderedJson = value => {
  if (!v.isArray(value)) return value;
  const entries = v.entries(value).map(([key, child]) => [key, orderedJson(child)]);
  return entries.every(([key], index) => key === index) ? entries.map(([, child]) => child) : new Map(entries);
};
function substring(value, offset, length = undefined) {
  const buffer = bytes(value), start = v.int(offset) < 0 ? Math.max(0, buffer.length + v.int(offset)) : v.int(offset);
  const end = length === undefined ? buffer.length : v.int(length) < 0 ? buffer.length + v.int(length) : start + v.int(length);
  if (start > buffer.length || end < start) return false;
  const result = buffer.subarray(start, end), decoded = result.toString('utf8'); return Buffer.from(decoded).equals(result) ? decoded : Buffer.from(result);
}
function range(start, end, step = 1) {
  const letters = typeof start === 'string' && typeof end === 'string' && !v.numeric(start) && !v.numeric(end);
  const a = letters ? bytes(start)[0] : v.number(start), b = letters ? bytes(end)[0] : v.number(end), stride = Math.abs(v.number(step));
  if (!stride || stride > Math.abs(b - a) && a !== b) return false;
  const result = [], sign = a <= b ? 1 : -1;
  for (let n = a; sign > 0 ? n <= b : n >= b; n += stride * sign) { if (result.length >= 1000000) throw new RangeError('Template range is too large'); result.push(letters ? String.fromCharCode(n) : n); }
  return result;
}
function date(format, timestamp, offset = 0) {
  const current = new Date((v.number(timestamp) + offset) * 1000), pad = value => String(value).padStart(2, '0');
  if (Number.isNaN(current.valueOf())) return false;
  const fields = { Y: current.getUTCFullYear(), y: pad(current.getUTCFullYear() % 100), n: current.getUTCMonth() + 1, m: pad(current.getUTCMonth() + 1), j: current.getUTCDate(), d: pad(current.getUTCDate()), G: current.getUTCHours(), H: pad(current.getUTCHours()), h: pad(current.getUTCHours() % 12 || 12), i: pad(current.getUTCMinutes()), s: pad(current.getUTCSeconds()), w: current.getUTCDay(), U: v.int(timestamp) };
  let escaped = false, result = '';
  for (const character of v.text(format)) { if (escaped) { result += character; escaped = false; } else if (character === '\\') escaped = true; else result += fields[character] ?? character; }
  return result;
}
function stripTags(value) {
  const source = v.text(value); let result = '', state = 0, depth = 0, quoted = '', parens = 0;
  for (let i = 0; i < source.length; i++) {
    const c = source[i], previous = source[i - 1];
    if (c === '\0') continue;
    if (!state) { if (c === '<' && !/[\t\n\r\f\v ]/.test(source[i + 1] ?? '')) state = source.startsWith('<!--', i) ? 3 : source[i + 1] === '?' ? 2 : 1; else result += c; continue; }
    if (state === 3) { if (source.startsWith('-->', i)) { state = 0; i += 2; } continue; }
    if ((c === '"' || c === "'") && (state !== 2 || previous !== '\\')) { if (!quoted || quoted === c) quoted = quoted ? '' : c; continue; }
    if (quoted) continue;
    if (state === 2) { if (c === '(') parens++; if (c === ')') parens--; if (c === '>' && previous === '?' && !parens) state = 0; }
    else if (c === '<' && !/[\t\n\r\f\v ]/.test(source[i + 1] ?? '')) depth++;
    else if (c === '>') { if (depth) depth--; else state = 0; }
  }
  return result;
}

/** Only the concrete builtins called by the audited template corpus. */
export function builtinFunctions({ now = () => Math.floor(Date.now() / 1000), timezoneOffset = 0 } = {}) {
  const find = (needle, haystack, strict = false) => v.entries(haystack).find(([, item]) => (v.truth(strict) ? v.identical : v.equal)(needle, item));
  return {
    count: value => value == null ? 0 : v.isArray(value) ? v.entries(value).length : 1,
    sizeof: value => value == null ? 0 : v.isArray(value) ? v.entries(value).length : 1,
    is_array: v.isArray, is_numeric: v.numeric, is_string: value => typeof value === 'string' || Buffer.isBuffer(value),
    strlen: value => bytes(value).length, mb_strlen: value => [...v.text(value)].length,
    substr: substring, strpos: (value, needle, offset = 0) => { const target = typeof needle === 'string' || Buffer.isBuffer(needle) ? bytes(needle) : Buffer.from([v.int(needle) & 255]); if (!target.length) return false; const pos = bytes(value).indexOf(target, v.int(offset)); return pos < 0 ? false : pos; },
    strtoupper: value => v.text(value).replace(/[a-z]/g, character => character.toUpperCase()),
    trim: (value, characters = ' \t\n\r\0\v') => { const set = new Set([...characters]); const chars = [...v.text(value)]; while (set.has(chars[0])) chars.shift(); while (set.has(chars.at(-1))) chars.pop(); return chars.join(''); },
    str_replace: (search, replacement, subject) => {
      const searches = v.isArray(search) ? values(search) : [search], replacements = v.isArray(replacement) ? values(replacement) : null;
      const replace = item => searches.reduce((result, needle, i) => v.text(needle) === '' ? result : result.replaceAll(v.text(needle), v.text(replacements ? replacements[i] ?? '' : replacement)), v.text(item));
      return v.isArray(subject) ? v.array(v.entries(subject).map(([name, item]) => [name, replace(item)])) : replace(subject);
    },
    explode: (delimiter, value, limit = undefined) => { if (v.text(delimiter) === '') return false; const result = v.text(value).split(v.text(delimiter)); if (limit === undefined || v.int(limit) >= result.length) return result; if (v.int(limit) < 0) return result.slice(0, v.int(limit)); return [...result.slice(0, Math.max(1, v.int(limit)) - 1), result.slice(Math.max(1, v.int(limit)) - 1).join(v.text(delimiter))]; },
    implode: (separator, items) => items === undefined ? values(separator).map(v.text).join('') : values(items).map(v.text).join(v.text(separator)),
    in_array: (needle, items, strict = false) => !!find(needle, items, strict),
    array_search: (needle, items, strict = false) => find(needle, items, strict)?.[0] ?? false,
    array_keys: items => v.entries(items).map(([name]) => name),
    array_flip: items => v.array(v.entries(items).filter(([, value]) => typeof value === 'string' || Number.isInteger(value)).map(([name, value]) => [v.key(value), name])),
    array_merge: (...arrays) => v.array(arrays.flatMap(items => v.entries(items).map(([name, value]) => [typeof name === 'number' ? v.APPEND : name, value]))),
    range, round: (value, precision = 0) => { if (v.int(precision) !== 0) throw new Error('Template round precision requires an explicit native implementation'); return v.round(v.number(value)); },
    floor: value => Math.floor(v.number(value)), ceil: value => Math.ceil(v.number(value)),
    max: (...args) => (args.length === 1 ? values(args[0]) : args).reduce((a, b) => v.compare(a, b) >= 0 ? a : b),
    min: (...args) => (args.length === 1 ? values(args[0]) : args).reduce((a, b) => v.compare(a, b) <= 0 ? a : b),
    htmlentities: value => [...v.text(value)].map(character => entities[character] ?? character).join(''),
    urlencode: value => encodeURIComponent(v.text(value)).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase()).replaceAll('%20', '+'),
    md5: value => createHash('md5').update(bytes(value)).digest('hex'),
    strip_tags: stripTags,
    json_encode: value => protocolJson(orderedJson(value)), gdecode: decodeGameData,
    time: now, date: (format, timestamp = now()) => date(format, timestamp, timezoneOffset), gmdate: (format, timestamp = now()) => date(format, timestamp),
    convert_tm: (value, simple = 0) => { const seconds = v.int(value), days = Math.floor(seconds / 86400), minutes = Math.floor((seconds % 3600) / 60); let hours = Math.floor((seconds % 86400) / 3600); if (v.truth(simple) && days > 0 && minutes > 30) hours++; return (days > 0 ? `${days}天` : '') + (hours > 0 ? `${hours}小时` : '') + (days <= 0 || !v.truth(simple) ? `${minutes}分钟` : ''); },
  };
}
