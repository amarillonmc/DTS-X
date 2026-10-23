import fs from 'node:fs/promises';
import path from 'node:path';
import { privateStateRoot } from './private-root.mjs';

const mutable = /^gamedata\/(?:tmp|bak|cache|replays|remote_replays|javascript|templates)(?:\/|$)/;
const missing = error => error.code === 'ENOENT';
function relativePath(value) {
  if (typeof value !== 'string' || !value || /[\0:]/.test(value) || path.isAbsolute(value)) throw new TypeError('A relative game data path is required');
  const parts = value.replaceAll('\\', '/').split('/').filter(part => part && part !== '.');
  if (!parts.length || parts.some(part => part === '..' || part.startsWith('.'))) throw new TypeError('Game data path escapes the allowed tree');
  return parts.join('/');
}

/** Read original resources; write only private mutable data. State is never
 * copied over the engine snapshot, and cleanup never reaches the OS-lock tree.
 * All methods reject symlinks at every path component before accessing a file.
 */
export async function createFileServices({ stateRoot, sourceRoot, locks, clock = () => Date.now() / 1000 }) {
  if (![stateRoot, sourceRoot].every(value => typeof value === 'string' && path.isAbsolute(value))) throw new TypeError('Absolute state and source directories are required');
  if (typeof locks?.acquire !== 'function' || typeof locks?.release !== 'function') throw new TypeError('File services require real OS locks');
  const state = await privateStateRoot(stateRoot, { create: true, sourceRoot }), source = await fs.realpath(sourceRoot);
  const inside = (file, root) => file === root || file.startsWith(root + path.sep);
  if (inside(state, source) || inside(source, state)) throw new Error('Mutable data and original resources must be separate trees');
  async function checked(root, relative, createParents = false) {
    const parts = relative.split('/'); let cursor = root;
    for (let i = 0; i < parts.length; i++) {
      cursor = path.resolve(cursor, parts[i]);
      if (!inside(cursor, root) || cursor === root) throw new Error('Resolved data path is outside its root');
      try { if ((await fs.lstat(cursor)).isSymbolicLink()) throw new Error('Game data symlinks are not allowed'); }
      catch (error) {
        if (!missing(error)) throw error;
        if (createParents && i < parts.length - 1) await fs.mkdir(cursor, { mode: 0o700 });
      }
    }
    return cursor;
  }
  async function existing(relative) {
    if (mutable.test(relative)) {
      const file = await checked(state, relative);
      try { await fs.stat(file); return file; } catch (error) { if (!missing(error)) throw error; }
    }
    return checked(source, relative);
  }
  async function writable(value, parents = true) {
    const relative = relativePath(value);
    if (!mutable.test(relative)) throw new Error('Original game resources are read-only');
    return { relative, file: await checked(state, relative, parents) };
  }
  async function locked(relative, action) {
    const key = 'native-files/' + relative, token = await locks.acquire(key);
    try { return await action(); } finally { await locks.release(key, token); }
  }
  const api = {
    async readBytes(value) {
      const relative = relativePath(value);
      return locked(relative, async () => fs.readFile(await existing(relative)));
    },
    async read(value) {
      const bytes = await api.readBytes(value), string = bytes.toString('utf8');
      return Buffer.from(string).equals(bytes) ? string : bytes;
    },
    async readText(value) {
      const result = await api.read(value);
      if (typeof result !== 'string') throw new TypeError('Text resource contains invalid UTF-8');
      return result;
    },
    async exists(value) {
      try { await fs.stat(await existing(relativePath(value))); return true; } catch (error) { if (missing(error)) return false; throw error; }
    },
    async mtime(value) {
      try { return Math.floor((await fs.stat(await existing(relativePath(value)))).mtimeMs / 1000); } catch (error) { if (missing(error)) return false; throw error; }
    },
    async size(value) { return (await fs.stat(await existing(relativePath(value)))).size; },
    async isDirectory(value) {
      try { return (await fs.stat(await existing(relativePath(value)))).isDirectory(); } catch (error) { if (missing(error)) return false; throw error; }
    },
    async list(value, type = '') {
      const relative = relativePath(value); let entries;
      try { entries = await fs.readdir(await existing(relative), { withFileTypes: true }); } catch (error) { if (missing(error)) return null; throw error; }
      const result = [];
      for (const entry of entries) {
        if (entry.isSymbolicLink()) throw new Error('Game data symlinks are not allowed');
        if (!type || (type === 'dir' ? entry.isDirectory() : !entry.isDirectory() && path.extname(entry.name).slice(1) === type)) result.push(entry.name);
      }
      return result;
    },
    async mkdir(value) {
      const { relative, file } = await writable(value);
      await locked(relative, async () => {
        try { const stat = await fs.stat(file); if (stat.isDirectory()) return; await fs.unlink(file); } catch (error) { if (!missing(error)) throw error; }
        await fs.mkdir(file, { mode: 0o700 });
      });
    },
    async chmod(value, mode) {
      const { relative, file } = await writable(value, false);
      if (!Number.isInteger(mode) || mode < 0 || mode > 0o7777) throw new TypeError('Invalid game file permission mode');
      await locked(relative, () => fs.chmod(file, mode));
      return true;
    },
    async write(value, data, mode = 'rb+') {
      if (!['rb+', 'wb', 'wb+', 'ab', 'ab+'].includes(mode)) throw new TypeError('Unsupported game data write mode');
      const { relative, file } = await writable(value);
      if (typeof data !== 'string' && !ArrayBuffer.isView(data)) throw new TypeError('Game data write requires text or bytes');
      await locked(relative, async () => {
        // rb+ is truncated to the new byte count by original writeover().
        await fs.writeFile(file, data, { flag: mode.startsWith('a') ? 'a' : 'w', mode: 0o600 });
      });
    },
    async touch(value) {
      const { relative, file } = await writable(value);
      await locked(relative, async () => { const handle = await fs.open(file, 'a', 0o600); try { const now = clock(); await handle.utimes(now, now); } finally { await handle.close(); } });
    },
    async remove(value) {
      const { relative, file } = await writable(value, false);
      await locked(relative, async () => { try { await fs.unlink(file); } catch (error) { if (!missing(error)) throw error; } });
    },
    async clear(value, { keepRoot = false, expireSeconds = 0 } = {}) {
      const { relative, file } = await writable(value, false);
      // A reset may clear an individual game directory, never an entire data
      // category or all rooms/replays in the private instance by accident.
      if (relative.split('/').length < 3) throw new Error('Cleanup requires a game data subdirectory');
      if (!Number.isFinite(expireSeconds) || expireSeconds < 0) throw new TypeError('Invalid cleanup expiry');
      async function visit(folder, keep) {
        let entries; try { entries = await fs.readdir(folder, { withFileTypes: true }); } catch (error) { if (missing(error)) return; throw error; }
        for (const entry of entries) {
          if (entry.name === '.gitignore') continue;
          const target = path.resolve(folder, entry.name);
          if (!inside(target, state) || !inside(target, file)) throw new Error('Cleanup path escaped the intended game directory');
          const stat = await fs.lstat(target);
          if (stat.isSymbolicLink()) throw new Error('Cleanup will not traverse game data symlinks');
          if (stat.isDirectory()) await visit(target, false);
          else if (!expireSeconds || clock() - Math.floor(stat.mtimeMs / 1000) > expireSeconds) await fs.unlink(target);
        }
        if (!keep) try { await fs.rmdir(folder); } catch (error) { if (!['ENOTEMPTY', 'EEXIST'].includes(error.code)) throw error; }
      }
      await locked(relative, () => visit(file, keepRoot));
    },
  };
  return api;
}
