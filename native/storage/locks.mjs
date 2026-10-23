import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';
import { privateStateRoot } from './private-root.mjs';

const require = createRequire(import.meta.url);
const resourceKey = resource => {
  if (typeof resource !== 'string' || !resource || resource.includes('\0') || path.isAbsolute(resource) || /^[A-Za-z]:/.test(resource)) throw new TypeError('A relative lock resource is required');
  const normalized = resource.replaceAll('\\', '/').split('/').filter(part => part && part !== '.');
  if (!normalized.length || normalized.includes('..')) throw new TypeError('Lock resource escapes state root');
  const key = normalized.join('/');
  return process.platform === 'win32' ? key.toLowerCase() : key;
};

/** OS-backed asynchronous locks for one native request's services. Lock files
 * live in a separate persistent directory, not in the source's cleanup paths.
 * Closing a request or crashing a process releases ownership; files must never
 * be unlinked, which would let contenders lock different inodes for one key.
 * A bounded wait throws on timeout: no caller proceeds with an unowned lock.
 */
export async function createLockServices(stateRoot) {
  if (typeof stateRoot !== 'string' || !path.isAbsolute(stateRoot)) throw new TypeError('An absolute native state root is required');
  let native;
  try { native = require('fs-ext-extra-prebuilt'); }
  catch { throw new Error('Native OS file locking is required; no unlocked fallback is available'); }
  const root = await privateStateRoot(stateRoot, { create: true }), directory = path.join(root, '.native-locks');
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  if ((await fs.lstat(directory)).isSymbolicLink()) throw new Error('Native lock directory must not be a symlink');
  const pending = new Set(), pendingKeys = new Set(), owners = new Map(); let closed = false;
  const abort = () => Object.assign(new Error('Native lock services closed'), { code: 'LOCK_CLOSED' });

  async function acquire(resource, { pollMicroseconds = 10000, timeoutMs = Infinity, signal } = {}) {
    if (closed) throw abort();
    const key = resourceKey(resource);
    if (owners.has(key) || pendingKeys.has(key)) throw new Error('Lock resource already owned or requested by this request');
    if (!(timeoutMs >= 0) || !(pollMicroseconds > 0)) throw new RangeError('Invalid lock wait duration');
    const controller = new AbortController();
    let finished;
    const completion = new Promise(resolve => { finished = resolve; });
    const request = { controller, completion }; pending.add(request); pendingKeys.add(key);
    const cancel = () => controller.abort(signal?.reason); signal?.addEventListener('abort', cancel, { once: true });
    if (signal?.aborted) cancel();
    const file = path.join(directory, createHash('sha256').update(key).digest('hex') + '.lock');
    let handle;
    try {
      // The directory is private; reject an existing link before opening. The
      // stable file is retained across every acquisition and release.
      try { if ((await fs.lstat(file)).isSymbolicLink()) throw new Error('Native lock file must not be a symlink'); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      handle = await fs.open(file, 'a+', 0o600);
      const start = performance.now();
      while (true) {
        if (closed || controller.signal.aborted) throw abort();
        try {
          if (process.platform === 'win32') native.lockFileExSync(handle.fd, native.constants.LOCKFILE_EXCLUSIVE_LOCK | native.constants.LOCKFILE_FAIL_IMMEDIATELY, 0, 0, 1, 0);
          else native.flockSync(handle.fd, 'exnb');
          const token = Object.freeze({ resource: key });
          owners.set(key, { token, handle }); handle = null;
          return token;
        } catch (error) {
          if (!['EAGAIN', 'EACCES', 'EWOULDBLOCK', 'EBUSY'].includes(error.code)) throw new Error('Native OS lock acquisition failed', { cause: error });
          if (performance.now() - start >= timeoutMs) throw Object.assign(new Error('Native lock wait timed out'), { code: 'LOCK_TIMEOUT' });
          await delay(Math.max(1, Math.min(pollMicroseconds / 1000, timeoutMs - (performance.now() - start))), undefined, { signal: controller.signal });
        }
      }
    } finally {
      signal?.removeEventListener('abort', cancel);
      try { if (handle) await handle.close(); }
      finally { pending.delete(request); pendingKeys.delete(key); finished(); }
    }
  }
  async function release(resource, token) {
    const key = resourceKey(resource), owned = owners.get(key);
    if (!owned || owned.token !== token) throw new Error('Cannot release a lock not owned by this request');
    // Remove ownership only after the handle is closed successfully.
    await owned.handle.close(); owners.delete(key);
  }
  const reserved = new Map();
  const playerPath = (room, player) => {
    if (!/^[0-9]+$/.test(String(room)) || !/^[0-9]+$/.test(String(player))) throw new TypeError('Invalid player lock identifier');
    return `gamedata/tmp/playerlock/room${room}/player_${player}.nlk`;
  };
  return {
    locks: { acquire, release },
    playerLocks: {
      // Reserve at check() so check/create cannot race another request. The
      // adapter intentionally fails closed on the source's timeout branch.
      async check(room, player, timeoutMs) {
        const key = playerPath(room, player);
        if (!reserved.has(key)) reserved.set(key, await acquire(key, { timeoutMs }));
        return false;
      },
      async create(room, player) {
        const key = playerPath(room, player);
        if (!reserved.has(key)) reserved.set(key, await acquire(key, { timeoutMs: 0 }));
        return true;
      },
      async release(room, player) {
        const key = playerPath(room, player), token = reserved.get(key);
        if (token) { await release(key, token); reserved.delete(key); }
      },
    },
    async close() {
      closed = true;
      const waiting = [...pending]; for (const request of waiting) request.controller.abort();
      await Promise.all(waiting.map(request => request.completion));
      const releaseResults = await Promise.allSettled([...owners.values()].map(({ handle }) => handle.close()));
      owners.clear(); reserved.clear();
      const failed = releaseResults.find(result => result.status === 'rejected');
      if (failed) throw failed.reason;
    },
  };
}
