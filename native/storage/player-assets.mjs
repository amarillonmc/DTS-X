import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';

function size(bytes) {
  let width, height;
  if (bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && bytes.toString('ascii', 12, 16) === 'IHDR') {
    width = bytes.readUInt32BE(16); height = bytes.readUInt32BE(20);
  } else if (bytes.length >= 10 && ['GIF87a','GIF89a'].includes(bytes.toString('ascii', 0, 6))) {
    width = bytes.readUInt16LE(6); height = bytes.readUInt16LE(8);
  } else if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset < bytes.length) {
      if (bytes[offset++] !== 0xff) break;
      while (bytes[offset] === 0xff) offset++;
      const marker = bytes[offset++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 2 > bytes.length) break;
      const length = bytes.readUInt16BE(offset);
      if (length < 2 || offset + length > bytes.length) break;
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4,0xc8,0xcc].includes(marker) && length >= 8) {
        height = bytes.readUInt16BE(offset + 3); width = bytes.readUInt16BE(offset + 5); break;
      }
      offset += length;
    }
  }
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0) throw new Error('Unsupported or malformed player image');
  return [width, height];
}

/** Read-only host service for the original img/ resources. Supported formats
 * are the snapshot's GIF, PNG and JPEG images, including animated GIF canvas
 * dimensions. No image bytes are rewritten and no external image process runs.
 * dimensions() reports a missing/unsupported resource instead of fabricating
 * a size. The validated root prevents filenames from escaping the asset tree.
 */
export async function createPlayerAssets(imageRoot) {
  if (!path.isAbsolute(imageRoot)) throw new TypeError('Player image root must be absolute');
  const root = await realpath(imageRoot);
  if (!(await stat(root)).isDirectory()) throw new TypeError('Player image root must be a directory');
  async function resolve(name) {
    if (typeof name !== 'string' || !name || name.includes('\0') || name.includes(':') || path.isAbsolute(name)) throw new TypeError('Invalid relative player image name');
    const normalized = name.replaceAll('\\', '/');
    if (normalized.split('/').some(part => part === '..')) throw new TypeError('Player image path escapes its root');
    const candidate = path.resolve(root, normalized);
    const resolved = await realpath(candidate);
    const relative = path.relative(root, resolved);
    if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new TypeError('Player image path escapes its root');
    return resolved;
  }
  return Object.freeze({
    async exists(name) {
      try { return (await stat(await resolve(name))).isFile(); }
      catch (error) { if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return false; throw error; }
    },
    async dimensions(name) { return size(await readFile(await resolve(name))); },
  });
}
