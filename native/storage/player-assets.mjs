import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';

// Cache only parsed dimensions, never existence or path authorization. Each
// use first resolves the current path and checks nanosecond file metadata, so
// replacement, deletion and in-place changes are visible to the next call.
const dimensionCache = new Map();
const dimensionCacheLimit = 1024;

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
 * Request hosts opt into a directory snapshot. exists() still validates every
 * positive path; snapshotExists() additionally accepts ordinary root files
 * from that snapshot, exclusively for the unmodified built-in icon enumeration.
 * Symlinks and image bytes always undergo current realpath validation.
 */
export async function createPlayerAssets(imageRoot, { indexNames = false } = {}) {
  if (!path.isAbsolute(imageRoot)) throw new TypeError('Player image root must be absolute');
  const root = await realpath(imageRoot);
  if (!(await stat(root)).isDirectory()) throw new TypeError('Player image root must be a directory');
  const indexedName = name => process.platform === 'win32' ? name.toLowerCase() : name;
  let names;
  const nameIndex = () => names ??= readdir(root, { withFileTypes: true }).then(entries => new Map(entries.map(entry => [indexedName(entry.name), entry]))).catch(error => {
    // A searchable but non-listable directory can still serve known files.
    if (error.code === 'EACCES' || error.code === 'EPERM') return null;
    throw error;
  });
  function candidatePath(name) {
    if (typeof name !== 'string' || !name || name.includes('\0') || name.includes(':') || path.isAbsolute(name)) throw new TypeError('Invalid relative player image name');
    const normalized = name.replaceAll('\\', '/');
    if (normalized.split('/').some(part => part === '..')) throw new TypeError('Player image path escapes its root');
    const candidate = path.resolve(root, normalized);
    if (candidate === root) throw new TypeError('Player image path escapes its root');
    return candidate;
  }
  async function resolve(candidate) {
    const resolved = await realpath(candidate);
    const relative = path.relative(root, resolved);
    if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new TypeError('Player image path escapes its root');
    return resolved;
  }
  async function exists(name, snapshot = false) {
    try {
      const candidate = candidatePath(name), filename = path.basename(candidate);
      // Restrict snapshot matching to ordinary root filenames. Nested and
      // unusual names retain filesystem matching and realpath authorization.
      if (indexNames && path.dirname(candidate) === root && /^[a-z0-9_-]+(?:\.[a-z0-9_-]+)*$/i.test(filename)) {
        const index = await nameIndex();
        if (index) {
          const entry = index.get(indexedName(filename));
          if (!entry) return false;
          if (snapshot && !entry.isSymbolicLink()) return entry.isFile();
        }
      }
      return (await stat(await resolve(candidate))).isFile();
    } catch (error) { if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return false; throw error; }
  }
  return Object.freeze({
    async numberedCandidates(gender, minimum, maximum) {
      if (!indexNames || !['f','m','n'].includes(gender) || !Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum)) return null;
      const index = await nameIndex();
      if (!index) return null;
      const found = new Set(), low = Math.min(minimum, maximum), high = Math.max(minimum, maximum);
      for (const name of index.keys()) {
        const match = /^([fmn])_(-?\d+)\.(?:gif|png|jpg)$/.exec(name);
        if (!match || match[1] !== gender) continue;
        const value = Number(match[2]);
        if (String(value) === match[2] && value >= low && value <= high) found.add(value);
      }
      return [...found].sort((a, b) => minimum <= maximum ? a - b : b - a);
    },
    exists: name => exists(name),
    snapshotExists: name => exists(name, true),
    async dimensions(name) {
      const resolved = await resolve(candidatePath(name));
      const info = await stat(resolved, { bigint: true });
      const signature = `${info.dev}:${info.ino}:${info.size}:${info.mtimeNs}:${info.ctimeNs}`;
      const cached = dimensionCache.get(resolved);
      if (cached?.signature === signature) return [...cached.dimensions];
      const dimensions = size(await readFile(resolved));
      dimensionCache.delete(resolved);
      dimensionCache.set(resolved, { signature, dimensions });
      if (dimensionCache.size > dimensionCacheLimit) dimensionCache.delete(dimensionCache.keys().next().value);
      return [...dimensions];
    },
  });
}
