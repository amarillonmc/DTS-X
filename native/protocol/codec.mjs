import { gzipSync, inflateRawSync } from 'node:zlib';
import { JsonObject, jsonObjectEntries } from './json.mjs';

// Native implementations of include/global.func.php. The alphabet is the
// upstream numeric alphabet, not the MIME base64 alphabet used by gencode.
export const NUMBER_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-';

export function base64CharEncode(value) {
  return Number.isInteger(value) && value >= 0 && value < 64 ? NUMBER_ALPHABET[value] : ' ';
}

export function base64CharDecode(value) {
  const index = NUMBER_ALPHABET.indexOf(value);
  return value.length === 1 && index >= 0 ? index : 0;
}

export function base64EncodeNumber(value, length) {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError('Numeric protocol values must be nonnegative safe integers.');
  if (!Number.isSafeInteger(length) || length < 0) throw new RangeError('Numeric protocol width must be a nonnegative safe integer.');
  let result = '';
  for (let index = 0; index < length; index++) {
    result = base64CharEncode(value % 64) + result;
    value = Math.floor(value / 64);
  }
  // Deliberately retain upstream truncation when length is too small.
  return result;
}

export function base64DecodeNumber(value) {
  let result = 0;
  for (const byte of Buffer.from(value, 'utf8')) {
    result = result * 64 + base64CharDecode(String.fromCharCode(byte));
    if (!Number.isSafeInteger(result)) throw new RangeError('Decoded numeric protocol value exceeds JavaScript integer precision.');
  }
  return result;
}

function jsonString(value) {
  if (!value.isWellFormed()) throw new TypeError('Protocol JSON requires valid Unicode strings.');
  return JSON.stringify(value).replace(/\//g, '\\/').replace(/[\u0080-\uffff]/g, character => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`);
}

/** PHP's default json_encode spelling for the protocol's finite safe numbers,
 * strings and arrays. Sparse arrays retain their keys as JSON objects. An
 * ordered Map can represent an associative array whose insertion order matters.
 * No PHP execution or generated PHP code is involved. */
export function protocolJson(value) {
  const parents = new Set();
  function encode(item, depth) {
    if (depth > 512) throw new RangeError('Protocol JSON nesting exceeds the upstream depth limit.');
    if (item === null) return 'null';
    if (typeof item === 'string') return jsonString(item);
    if (typeof item === 'boolean') return String(item);
    if (typeof item === 'number') {
      if (!Number.isFinite(item) || Math.abs(item) > Number.MAX_SAFE_INTEGER) throw new RangeError('Protocol JSON numbers must be finite and within JavaScript safe precision.');
      if (Object.is(item, -0)) return '-0';
      // PHP switches to scientific notation below 0.0001, and retains .0 in
      // an integral mantissa. Neither difference changes the decoded value.
      if (item !== 0 && Math.abs(item) < 0.0001) {
        const [mantissa, exponent] = item.toExponential().split('e');
        return `${mantissa.includes('.') ? mantissa : `${mantissa}.0`}e${exponent}`;
      }
      return String(item);
    }
    if (typeof item !== 'object' || item === undefined) throw new TypeError('Unsupported protocol JSON value.');
    if (parents.has(item)) throw new TypeError('Protocol JSON cannot contain recursive values.');
    parents.add(item);
    let entries;
    let isList;
    if (item instanceof JsonObject) {
      entries = jsonObjectEntries(item); isList = false;
    } else if (item instanceof Map) {
      entries = [...item.entries()];
      isList = entries.every(([key], index) => key === index);
    } else {
      const prototype = Object.getPrototypeOf(item);
      if (!Array.isArray(item) && prototype !== Object.prototype && prototype !== null) throw new TypeError('Protocol JSON requires plain data objects.');
      entries = Object.entries(item);
      isList = Array.isArray(item) && entries.every(([key], index) => key === String(index));
    }
    const result = isList
      ? `[${entries.map(([, entry]) => encode(entry, depth + 1)).join(',')}]`
      : `{${entries.map(([key, entry]) => `${jsonString(String(key))}:${encode(entry, depth + 1)}`).join(',')}}`;
    parents.delete(item);
    return result;
  }
  return encode(value, 1);
}

/** Legacy mgzdecode deliberately inflates bytes 10..length-8 rather than
 * checking the gzip footer. Keep that behavior for existing replay payloads. */
export function mgzdecode(value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
  return inflateRawSync(bytes.subarray(10, Math.max(10, bytes.length - 8)));
}

export function gencode(value, { level = -1 } = {}) {
  return gzipSync(protocolJson(value), { level }).toString('base64');
}

class ProtocolPrecisionError extends RangeError {}

export function gdecode(value) {
  if (value === '' || value === '0' || value === null || value === undefined || value === false || value === 0) return [];
  try {
    return JSON.parse(mgzdecode(Buffer.from(value, 'base64')).toString('utf8'), (_key, decoded) => {
      if (typeof decoded === 'number' && (!Number.isFinite(decoded) || Math.abs(decoded) > Number.MAX_SAFE_INTEGER)) {
        throw new ProtocolPrecisionError('Decoded protocol number exceeds JavaScript safe precision.');
      }
      return decoded;
    });
  } catch (error) {
    if (error instanceof ProtocolPrecisionError) throw error;
    // Upstream returns null after a corrupt gzip stream or malformed JSON.
    return null;
  }
}
