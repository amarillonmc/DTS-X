import { gdecode, mgzdecode } from '../protocol/codec.mjs';
import { arrayKey } from '../system/sys-support.mjs';

/** Decode ONLY a remote fetch_udata keyed row container. JSON.parse sorts
 * integer-looking property keys when enumerated, while upstream retains query
 * order. Validate via the normal codec, then scan the outer JSON members in
 * their transmitted order. Nested row objects still use the normal decoder.
 * This is a JSON wire boundary, not a general PHP array/value interpreter. */
export function decodeUserRows(payload) {
  const decoded = gdecode(payload);
  if (decoded === null || typeof decoded !== 'object') return null;
  if (Array.isArray(decoded)) return new Map(decoded.map((value,index) => [index,value]));
  const json = mgzdecode(Buffer.from(payload,'base64')).toString('utf8');
  let i = 0; const skip = () => { while (/\s/.test(json[i] ?? '') && i < json.length) i++; };
  const quotedEnd = start => {
    let j = start + 1;
    while (j < json.length) { if (json[j] === '\\') j += 2; else if (json[j++] === '"') return j; }
    throw new TypeError('Malformed remote user JSON string');
  };
  skip(); if (json[i++] !== '{') return null;
  const rows = new Map(); skip();
  while (json[i] !== '}') {
    const start = i; if (json[i] !== '"') throw new TypeError('Malformed remote user JSON key'); i = quotedEnd(i);
    const key = JSON.parse(json.slice(start,i)); skip(); if (json[i++] !== ':') throw new TypeError('Malformed remote user JSON member'); skip();
    let depth = 0;
    while (i < json.length) {
      const char = json[i];
      if (char === '"') { i = quotedEnd(i); continue; }
      if (char === '[' || char === '{') depth++;
      else if (char === ']' || char === '}') { if (depth === 0) break; depth--; }
      else if (char === ',' && depth === 0) break;
      i++;
    }
    rows.set(arrayKey(key),decoded[key]); skip(); if (json[i] === ',') { i++; skip(); } else if (json[i] !== '}') throw new TypeError('Malformed remote user JSON container');
  }
  return rows;
}
