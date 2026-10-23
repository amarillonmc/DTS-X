import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { gdecode, gencode, mgzdecode } from './codec.mjs';

const binaryExtensions = new Set(['bmp', 'png', 'jpg', 'gif']);
const imageFile = name => binaryExtensions.has(path.posix.extname(name).slice(1));

function archiveName(value) {
  if (typeof value !== 'string' || value === '' || value === '.' || value === '..' || /[\\/\0]/.test(value)) {
    throw new TypeError('Replay archive entries must have a basename without path components.');
  }
  return value;
}

/** Pure byte equivalent of filelist_achieve/fold. Entries stay ordered and may
 * contain arbitrary binary data. Filesystem persistence belongs to the caller. */
export function fold(entries, { legacy = false } = {}) {
  const files = [...entries];
  if (files.length === 0) return false;
  if (legacy) {
    const data = new Map();
    for (const [name, contents] of files) {
      archiveName(name);
      const bytes = Buffer.from(contents);
      data.set(name, imageFile(name) ? bytes.toString('base64') : new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    }
    return Buffer.from(gencode(data));
  }
  const chunks = [];
  for (const [name, contents] of files) {
    archiveName(name);
    // The old parser discovers the size delimiter in the first 64 bytes. Game
    // archive names meet these constraints; reject unrepresentable custom names.
    if (name.includes(';') || Buffer.byteLength(name) >= 64) throw new TypeError('Replay archive name is ambiguous in the upstream container.');
    const payload = gzipSync(Buffer.from(contents)).toString('base64');
    chunks.push(Buffer.from(`${name};${payload.length};${payload}`));
  }
  return Buffer.concat(chunks);
}

/** Decode either generation of the real .dat container without writing files.
 * Invalid or escaping filenames are rejected before a caller can persist them. */
export function unfold(contents) {
  const bytes = Buffer.from(contents);
  const result = new Map();
  if (!bytes.subarray(0, 64).includes(59)) {
    const data = gdecode(bytes.toString('ascii'));
    if (!data || typeof data !== 'object') throw new TypeError('Malformed legacy replay archive.');
    for (const [name, value] of Object.entries(data)) {
      archiveName(name);
      if (typeof value !== 'string') throw new TypeError('Malformed legacy replay archive entry.');
      result.set(name, Buffer.from(value, imageFile(name) ? 'base64' : 'utf8'));
    }
    return result;
  }
  let offset = 0;
  while (offset < bytes.length) {
    const nameEnd = bytes.indexOf(59, offset);
    const sizeEnd = bytes.indexOf(59, nameEnd + 1);
    if (nameEnd < offset || sizeEnd < nameEnd) throw new TypeError('Truncated replay archive header.');
    const name = archiveName(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(offset, nameEnd)));
    const sizeText = bytes.subarray(nameEnd + 1, sizeEnd).toString('ascii');
    if (!/^\d+$/.test(sizeText)) throw new TypeError('Malformed replay archive entry length.');
    const size = Number(sizeText);
    if (!Number.isSafeInteger(size) || sizeEnd + 1 + size > bytes.length) throw new TypeError('Truncated replay archive payload.');
    const payload = bytes.subarray(sizeEnd + 1, sizeEnd + 1 + size).toString('ascii');
    result.set(name, mgzdecode(Buffer.from(payload, 'base64')));
    offset = sizeEnd + 1 + size;
  }
  return result;
}
