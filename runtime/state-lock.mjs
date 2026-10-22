import { closeSync, mkdirSync, openSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** Hold a native OS lock until release/process exit. Never unlink the lock file:
 * doing so would allow another process to lock a different inode concurrently.
 * OS locks survive no process crash, so container restarts need no stale PID fix.
 */
export function acquireStateLock(config) {
  mkdirSync(config.stateRoot, { recursive:true });
  let native;
  try { native = require('fs-ext-extra-prebuilt'); }
  catch (cause) { throw new Error('Native file locks are required to protect the game state.', { cause }); }
  const file = path.join(config.stateRoot, 'host.lock');
  const fd = openSync(file, 'a+', 0o600);
  try {
    if (process.platform === 'win32') {
      native.lockFileExSync(fd, native.constants.LOCKFILE_EXCLUSIVE_LOCK | native.constants.LOCKFILE_FAIL_IMMEDIATELY, 0, 0, 1, 0);
    } else {
      native.flockSync(fd, 'exnb');
    }
  } catch (cause) {
    closeSync(fd);
    throw new Error(`The game state is in use. Stop its server/setup/compiler before opening ${config.stateRoot}.`, { cause });
  }
  // Metadata is informational; ownership is enforced by the OS, never PID text.
  try { writeFileSync(path.join(config.stateRoot, 'host-owner.json'), JSON.stringify({ pid:process.pid, startedAt:new Date().toISOString(), command:process.argv[1] || 'node' }), { mode:0o600 }); }
  catch (error) { closeSync(fd); throw error; }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    closeSync(fd);
  };
}
