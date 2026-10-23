import { builtinFunctions, jsonDecode } from '../templates/builtins.mjs';
import * as v from '../templates/values.mjs';
import { base64EncodeNumber, base64DecodeNumber } from '../protocol/codec.mjs';
import { gzipSync, inflateRawSync } from 'node:zlib';
import path from 'node:path';
import { JsonObject, jsonObjectEntries } from '../protocol/json.mjs';
import { highlightValueSource } from './highlight.mjs';

const list = value => v.entries(value).map(([, child]) => child);
const bytes = value => Buffer.isBuffer(value) ? value : Buffer.from(v.text(value));
const decoded = value => { const text = value.toString(); return Buffer.from(text).equals(value) ? text : Buffer.from(value); };
// PHP filter/diff construct new tables, but intersect deletes from a copy.
// Their allocation sizes affect whether numeric keys stay packed; that layout
// is observable when a generated gameplay function subsequently calls rand.
const retained = (source, predicate, reserve = 0) => v.array(v.entries(source).filter(([key, value]) => predicate(value, key)), reserve);
const retainedByDeletion = (source, predicate) => {
  const result = v.copy(source);
  for (const [key, value] of v.entries(result)) if (!predicate(value, key)) v.unset({ target: result, key });
  return result;
};
export function varExport(value, indent = 0) {
  if (value instanceof JsonObject) { const padding = ' '.repeat(indent); return `(object) array(\n${jsonObjectEntries(value).map(([key, child]) => padding + '   ' + varExport(key) + ' => ' + (v.isArray(child) || child instanceof JsonObject ? '\n' + padding + '  ' : '') + varExport(child, indent + 2) + ',\n').join('')}${padding})`; }
  if (v.isArray(value)) { const padding = ' '.repeat(indent), rows = v.entries(value); return `array (\n${rows.map(([key, child]) => padding + '  ' + varExport(key) + ' => ' + (v.isArray(child) || child instanceof JsonObject ? '\n' + padding + '  ' : '') + varExport(child, indent + 2) + ',\n').join('')}${padding})`; }
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string') return "'" + value.replaceAll('\\', '\\\\').replaceAll("'", "\\'").replaceAll('\0', "' . \"\\0\" . '") + "'";
  return v.text(value);
}
function varDump(value, indent = 0) {
  if (v.isArray(value)) { const pad = ' '.repeat(indent); return `array(${v.entries(value).length}) {\n${v.entries(value).map(([key, child]) => pad + '  [' + (typeof key === 'number' ? key : '"' + key + '"') + ']=>\n' + pad + '  ' + varDump(child, indent + 2)).join('')}${pad}}\n`; }
  if (value == null) return 'NULL\n'; if (typeof value === 'boolean') return `bool(${value ? 'true' : 'false'})\n`;
  if (typeof value === 'number') return `${Number.isInteger(value) ? 'int' : 'float'}(${v.text(value)})\n`;
  return `string(${Buffer.byteLength(v.text(value))}) "${v.text(value)}"\n`;
}
export function moduleBuiltins(options) {
  const base = builtinFunctions(options);
  const combination = (values, count) => { const rows = v.entries(values), result = []; if (count <= 0 || count > rows.length) return result; for (let i = 0; i < rows.length; i++) { const head = v.get(values, i); if (count === 1) result.push([head]); else for (const rest of combination(functions.array_slice(values, i + 1), count - 1)) result.push([head, ...rest]); } return result; };
  const mergeRecursive = (left, right) => { const out = new Map(v.entries(left)); let next = Math.max(-1, ...[...out.keys()].filter(key => typeof key === 'number')) + 1; for (const [key, value] of v.entries(right)) { if (typeof key === 'number') out.set(next++, v.copy(value)); else if (!out.has(key)) out.set(key, v.copy(value)); else out.set(key, mergeRecursive(v.isArray(out.get(key)) ? out.get(key) : [out.get(key)], v.isArray(value) ? value : [value])); } return v.array([...out]); };
  const functions = {
    ...base,
    abs: value => Math.abs(v.number(value)), pow: (value, power) => v.number(value) ** v.number(power),
    sqrt: value => Math.sqrt(v.number(value)), log10: value => Math.log10(v.number(value)),
    exp: value => Math.exp(v.number(value)), fmod: (left, right) => v.number(left) % v.number(right),
    strtolower: value => decoded(Buffer.from(bytes(value).map(byte => byte >= 65 && byte <= 90 ? byte + 32 : byte))),
    ord: value => (Buffer.isBuffer(value) ? value : Buffer.from(v.text(value)))[0] ?? 0,
    chr: value => { const byte = v.int(value) & 255; return byte < 128 ? String.fromCharCode(byte) : Buffer.from([byte]); },
    pack: (format, value) => { if (format !== 'C') throw new Error(`Unsupported source binary format ${format}`); return Buffer.from([v.int(value) & 255]); },
    ctype_space: value => /^[\t\n\r\v\f ]+$/.test(typeof value === 'number' ? String.fromCharCode(value & 255) : v.text(value)),
    md5sub: (value, length) => base.substr(base.md5(value), 0, length),
    gversion_compare: (left, right) => { const a = (v.text(left).match(/\d*\.\d*\.\d*/)?.[0] ?? '').split('.'), b = (v.text(right).match(/\d*\.\d*\.\d*/)?.[0] ?? '').split('.'); for (let i = 0; i < Math.max(a.length, b.length); i++) { const cmp = v.int(a[i]) - v.int(b[i]); if (cmp) return Math.sign(cmp); } return 0; },
    substr_count: (source, needle) => { const text = v.text(source), find = v.text(needle); return !find ? false : text.split(find).length - 1; },
    number_format: (value, decimals = 0, separator = '.', thousands = ',') => { const precision = Math.max(0, v.int(decimals)), factor = 10 ** precision, rounded = v.round(v.number(value) * factor) / factor; const [whole, fraction] = rounded.toFixed(precision).split('.'); return whole.replace(/\B(?=(\d{3})+(?!\d))/g, v.text(thousands)) + (precision ? v.text(separator) + fraction : ''); },
    is_int: value => typeof value === 'number' && Number.isInteger(value), is_float: value => typeof value === 'number' && !Number.isInteger(value),
    dirname: value => path.posix.dirname(v.text(value).replaceAll('\\', '/')),
    urldecode: value => { const raw = v.text(value).replaceAll('+', ' '), bytes = []; for (let i = 0; i < raw.length;) { const match = raw.slice(i).match(/^%([0-9a-f]{2})/i); if (match) { bytes.push(Number.parseInt(match[1], 16)); i += 3; } else { const character = String.fromCodePoint(raw.codePointAt(i)); bytes.push(...Buffer.from(character)); i += character.length; } } const result = Buffer.from(bytes), decoded = result.toString(); return Buffer.from(decoded).equals(result) ? decoded : result; },
    htmlspecialchars_decode: (value, flags = 2) => v.text(value).replace(/&(amp|lt|gt|quot|#0*39|#x0*27);/gi, (whole, entity) => { entity = entity.toLowerCase(); if (entity === 'quot') return v.int(flags) & 2 ? '"' : whole; if (entity.startsWith('#')) return v.int(flags) & 1 ? "'" : whole; return { amp: '&', lt: '<', gt: '>' }[entity]; }),
    localtime: (timestamp = options?.now?.() ?? Math.floor(Date.now() / 1000), associative = false) => { const date = new Date((v.number(timestamp) + (options?.timezoneOffset ?? 0)) * 1000); const row = [date.getUTCSeconds(), date.getUTCMinutes(), date.getUTCHours(), date.getUTCDate(), date.getUTCMonth(), date.getUTCFullYear() - 1900, date.getUTCDay(), Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - Date.UTC(date.getUTCFullYear(), 0, 1)) / 86400000), 0]; return v.truth(associative) ? v.array(['sec','min','hour','mday','mon','year','wday','yday','isdst'].map((name, index) => ['tm_' + name, row[index]])) : row; },
    reset: value => v.entries(value)[0]?.[1] ?? false,
    array_merge_recursive: (...arrays) => arrays.reduce(mergeRecursive, []),
    full_combination: (values, minimum) => { const rows = []; for (let count = v.int(minimum); count <= v.entries(values).length; count++) rows.push(...combination(values, count)); return rows; },
    fatenum_create: (seed, length = 9) => { length = Math.min(16, v.int(length)); const full = base.md5(seed), hash = base.substr(full, 0, length) + base.substr(full, -length), digits = hash.replace(/[^0-9]/g, ''); let result = v.truth(digits) ? digits : String(Number.parseInt(hash.slice(0, 3), 16)); if (v.number(result) < 1997) result = String(v.number(result) * 999983); return result; },
    array_values: list,
    array_clone: source => v.array(v.entries(source).map(([key, value]) => [key, v.copy(value)])),
    array_slice: (source, offset, length = null, preserve = false) => { const rows = v.entries(source), start = v.int(offset) < 0 ? Math.max(0, rows.length + v.int(offset)) : v.int(offset); let index = 0; return v.array(rows.slice(start, length == null ? undefined : v.int(length) < 0 ? rows.length + v.int(length) : start + v.int(length)).map(([key, value]) => [typeof key === 'number' && !v.truth(preserve) ? index++ : key, value])); },
    array_combine: (keys, values) => { const a = list(keys), b = list(values); return !a.length || a.length !== b.length ? false : v.array(a.map((key, index) => [v.key(key), b[index]])); },
    array_column: (source, column, index = null) => { const rows = []; for (const [, row] of v.entries(source)) { const hasColumn = column === null || v.entries(row).some(([key]) => key === v.key(column)); if (hasColumn) rows.push([index !== null && v.entries(row).some(([key]) => key === v.key(index)) ? v.key(v.get(row, index)) : v.APPEND, column === null ? row : v.get(row, column)]); } return v.array(rows); },
    array_key_exists: (key, array) => v.entries(array).some(([name]) => name === v.key(key)),
    array_sum: array => list(array).reduce((sum, value) => sum + (v.isArray(value) ? 0 : v.number(value)), 0),
    array_diff: (first, ...others) => { const rows = v.entries(first), excluded = others.flatMap(list).map(v.text); if (!excluded.length) return v.copy(first); const keep = value => !excluded.includes(v.text(value)); if (rows.length === 1) return keep(rows[0][1]) ? v.copy(first) : []; return retained(first, keep, rows.length); },
    array_intersect: (first, ...others) => retainedByDeletion(first, value => others.every(other => list(other).some(item => v.text(item) === v.text(value)))),
    array_diff_key: (first, ...others) => retained(first, (value, key) => !others.some(other => v.entries(other).some(([name]) => name === key))),
    array_filter: (array, callback = null) => { if (callback !== null) throw new Error('Generated module array_filter requires a statically migrated callback'); return retained(array, v.truth); },
    array_unique: array => { if (v.entries(array).length <= 1) return v.copy(array); const seen = new Set(); return retained(array, value => { const key = v.text(value); if (seen.has(key)) return false; seen.add(key); return true; }); },
    array_reverse: (array, preserveKeys = false) => { let numeric = 0; return v.array(v.entries(array).reverse().map(([key, value]) => [typeof key === 'number' && !v.truth(preserveKeys) ? numeric++ : key, value])); },
    array_count_values: array => { const result = new Map(); for (const value of list(array)) if (typeof value === 'string' || Number.isInteger(value)) { const key = v.key(value); result.set(key, (result.get(key) ?? 0) + 1); } return v.array([...result]); },
    end: array => v.entries(array).at(-1)?.[1] ?? false,
    strval: v.text,
    var_export: (value, returnValue = false) => { if (!v.truth(returnValue)) throw new Error('Source var_export output requires an explicit output service'); return varExport(value); },
    __dump: varDump,
    highlight_string: (value, returnValue = false) => { if (!v.truth(returnValue)) throw new Error('Source syntax highlighting output requires an explicit output service'); return highlightValueSource(v.text(value)); },
    strstr: (value, needle, before = false) => { const source = bytes(value), target = typeof needle === 'string' || Buffer.isBuffer(needle) ? bytes(needle) : Buffer.from([v.int(needle) & 255]), index = source.indexOf(target); return !target.length || index < 0 ? false : decoded(source.subarray(v.truth(before) ? 0 : index, v.truth(before) ? index : undefined)); },
    str_split: (value, width = 1) => { width = v.int(width); if (width < 1) return false; const source = bytes(value); if (!source.length) return ['']; const result = []; for (let i = 0; i < source.length; i += width) result.push(decoded(source.subarray(i, i + width))); return result; },
    substr_replace: (value, replacement, offset, length = null) => { const source = bytes(value), start = v.int(offset) < 0 ? Math.max(0, source.length + v.int(offset)) : Math.min(source.length, v.int(offset)); const count = length === null ? source.length - start : v.int(length) < 0 ? Math.max(0, source.length + v.int(length) - start) : v.int(length); return decoded(Buffer.concat([source.subarray(0, start), bytes(replacement), source.subarray(start + count)])); },
    sprintf: (format, ...args) => { let i = 0; return v.text(format).replace(/%%|%(0?)(\d*)d/g, (match, zero, width) => { if (match === '%%') return '%'; const value = v.int(args[i++]), sign = value < 0 ? '-' : '', text = String(Math.abs(value)); return zero ? sign + text.padStart(Math.max(0, Number(width) - sign.length), '0') : (sign + text).padStart(Number(width), ' '); }); },
    base64_encode: value => (Buffer.isBuffer(value) ? value : Buffer.from(v.text(value))).toString('base64'),
    gzencode: (value, level = -1) => gzipSync(Buffer.isBuffer(value) ? value : Buffer.from(v.text(value)), { level: v.int(level) }),
    gzinflate: value => { try { const bytes = inflateRawSync(Buffer.isBuffer(value) ? value : Buffer.from(v.text(value))), decoded = bytes.toString(); return Buffer.from(decoded).equals(bytes) ? decoded : bytes; } catch (error) { if (error.code === 'Z_DATA_ERROR' || error.code === 'Z_BUF_ERROR') return false; throw error; } },
    base64_decode: (value, strict = false) => { const text = v.text(value); if (v.truth(strict) && /[^a-zA-Z0-9+/=\r\n\t ]/.test(text)) return false; const bytes = Buffer.from(text, 'base64'), decoded = bytes.toString(); return Buffer.from(decoded).equals(bytes) ? decoded : bytes; },
    base64_encode_number: (value, width) => base64EncodeNumber(v.int(value), v.int(width)), base64_decode_number: value => base64DecodeNumber(v.text(value)),
    json_decode: jsonDecode,
    mb_substr: (string, start, length = undefined) => { const chars = [...v.text(string)], offset = v.int(start); return chars.slice(offset, length === undefined ? undefined : v.int(length) < 0 ? v.int(length) : (offset < 0 ? Math.max(0, chars.length + offset) : offset) + v.int(length)).join(''); },
    gencode: value => gzipSync(base.json_encode(value)).toString('base64'),
  }; return functions;
}
