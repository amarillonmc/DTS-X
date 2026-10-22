/**
 * Node.js host for the original PHP 7.4 engine. No native PHP executable is used.
 * Keep this adapter separate from engine/: game modules retain their PHP layout.
 */
import { randomBytes } from 'node:crypto';
import { mkdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { threadId, Worker } from 'node:worker_threads';
import {
  bindUserSpace, createNodeFsMountHandler, FileLockManagerForPosix, FileLockManagerForWindows, loadNodeRuntime,
} from '@php-wasm/node';
import {
  FileLockManagerInMemory,
  FileLockManagerComposite,
  PHP,
  PHPExecutionFailureError,
  setPhpIniEntries,
} from '@php-wasm/universal';

export const PHP_VERSION = '7.4';
export const VIRTUAL_ENGINE_ROOT = '/game';
export const VIRTUAL_RUNTIME_ROOT = '/runtime';

// Native OS locks coordinate workers/processes. This additional in-memory
// manager preserves the adapter's per-runtime bookkeeping within one thread.
const sharedFileLocks = new FileLockManagerInMemory();
let nextRuntimeId = 1;

/**
 * php-wasm 3.1.60 passes flock's LOCK_SH (1) into an fcntl access-mode check,
 * where 1 means F_WRLCK. Consequently a valid flock(LOCK_SH) on fopen(...,'rb')
 * fails with EBADF. flock locks do not use fcntl's read/write access check.
 * Suppress only that mistaken check, leaving descriptor validation, real OS
 * locks, nonblocking behavior and lock cleanup in the upstream implementation.
 */
function bindDtsUserSpace(context) {
  const nativeLocks = process.platform === 'win32'
    ? new FileLockManagerForWindows() : new FileLockManagerForPosix();
  const manager = new FileLockManagerComposite({
    nativeLockManager: nativeLocks, wasmLockManager: sharedFileLocks,
  });
  let inFlock = false;
  const builtin = context.wasmImports.builtin_fcntl64;
  const userSpace = bindUserSpace({ fileLockManager: manager }, {
    ...context,
    wasmImports: {
      ...context.wasmImports,
      builtin_fcntl64(fd, command, ...args) {
        const result = builtin(fd, command, ...args);
        if (inFlock && command === context.constants.F_GETFL && result >= 0) {
          return (result & ~context.constants.O_ACCMODE) | 2; // O_RDWR for this check only.
        }
        return result;
      },
      builtin_fd_close(fd) {
        // 3.1.60 otherwise calls UnlockFileEx after close() has invalidated the
        // descriptor. Release while it is live; upstream's post-close cleanup
        // then becomes an idempotent bookkeeping operation, not a failed unlock.
        let stream;
        try { stream = context.syscalls.getStreamFromFD(fd); } catch { /* Native close reports invalid descriptors. */ }
        if (stream?.nfd !== undefined && stream.node?.mount?.type === context.NODEFS) {
          manager.releaseLocksOnFdClose(context.pid, stream.nfd, context.NODEFS.realPath(stream.node));
        }
        return context.wasmImports.builtin_fd_close(fd);
      },
    },
  });
  const flock = userSpace.flock;
  userSpace.flock = (fd, operation) => {
    inFlock = true;
    try { return flock(fd, operation); }
    finally { inFlock = false; }
  };
  return userSpace;
}

/**
 * The pinned php-wasm Node adapter creates its own loopback WS/TCP proxy.
 * Require an unguessable token before its upgrade handler sees a connection.
 * Outbound destinations stay unrestricted because upstream supports remote
 * replay storage, shared user databases and cross-server requests.
 */
function protectNetworkProxy(module, activeSockets) {
  const server = module.outboundNetworkProxyServer;
  if (!server || !module.websocket?.url) {
    throw new Error('Unsupported php-wasm networking API; verify the pinned package versions.');
  }
  const token = randomBytes(32).toString('hex');
  const makeUrl = module.websocket.url;
  module.websocket.url = (...args) => {
    const url = new URL(makeUrl(...args));
    url.searchParams.set('dtsToken', token);
    return url.href;
  };

  const upgrades = server.listeners('upgrade');
  server.removeAllListeners('upgrade');
  server.on('upgrade', (request, socket, head) => {
    let authorized = false;
    try {
      const url = new URL(request.url, 'http://127.0.0.1');
      authorized = url.searchParams.get('dtsToken') === token && !request.headers.origin;
    } catch { /* Invalid requests never reach the underlying proxy. */ }
    if (!authorized) {
      socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
      return;
    }
    activeSockets.add(socket);
    socket.once('close', () => activeSockets.delete(socket));
    for (const handler of upgrades) handler.call(server, request, socket, head);
  });
}

function stringEntries(values = {}) {
  return Object.fromEntries(Object.entries(values)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([name, value]) => [name, String(value)]));
}

function normalizeHeaders(headers = {}) {
  return Object.fromEntries(Object.entries(headers)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([name, value]) => [
      name.toLowerCase(),
      Array.isArray(value) ? value.join(name.toLowerCase() === 'cookie' ? '; ' : ', ') : String(value),
    ]));
}

/**
 * @param {object} options
 * @param {string} options.engineRoot Real directory holding the copied upstream.
 * @param {string} options.runtimeRoot Real directory holding the PHP bridges.
 * @param {string} [options.stateRoot] Persistent sessions/temp files (default var/php).
 * @param {string|false} [options.prependFile] Virtual auto-prepend path; false for probes.
 * @param {object} [options.phpIni] Additional php.ini values, applied before startup.
 * @param {number} [options.maxRequests] Recreate the VM periodically (default 400).
 * @param {function} [options.onMessage] Handler for PHP post_message_to_js().
 * @returns {Promise<{run:function, close:function, onMessage:function, pending:number}>}
 */
export async function createPhpRuntime({
  engineRoot,
  runtimeRoot,
  stateRoot,
  prependFile = '/runtime/prepend.php',
  phpIni = {},
  maxRequests = 400,
  onMessage,
} = {}) {
  if (!engineRoot || !runtimeRoot) throw new TypeError('engineRoot and runtimeRoot are required.');
  assertNativeFileLocks();
  stateRoot ??= path.resolve(engineRoot, '..', 'var', 'php');
  const [engineDirectory, runtimeDirectory] = await Promise.all([
    realpath(engineRoot), realpath(runtimeRoot),
  ]);
  await mkdir(path.join(stateRoot, 'sessions'), { recursive: true });
  await mkdir(path.join(stateRoot, 'tmp'), { recursive: true });
  const stateDirectory = await realpath(stateRoot);
  const activeSockets = new Set();
  const processId = (process.pid * 1024 + threadId * 64 + nextRuntimeId++) % 2147483647;
  const load = () => loadNodeRuntime(PHP_VERSION, {
    fileLockManager: sharedFileLocks,
    followSymlinks: false,
    emscriptenOptions: {
      processId,
      bindUserSpace: bindDtsUserSpace,
      preRun: [(module) => protectNetworkProxy(module, activeSockets)],
    },
  });
  const php = new PHP(await load());
  let queue = Promise.resolve();
  let pending = 0;
  let closed = false;
  let closePromise;

  try {
    for (const [virtual, actual] of [
      ['/game', engineDirectory], ['/runtime', runtimeDirectory], ['/state', stateDirectory],
    ]) {
      php.mkdir(virtual);
      await php.mount(virtual, createNodeFsMountHandler(actual));
    }
    php.chdir('/game');
    await setPhpIniEntries(php, {
      memory_limit: '512M',
      max_execution_time: 180,
      max_input_time: 180,
      max_input_vars: 10000,
      upload_max_filesize: '32M',
      post_max_size: '32M',
      'session.save_path': '/state/sessions',
      upload_tmp_dir: '/state/tmp',
      sys_temp_dir: '/state/tmp',
      'date.timezone': 'UTC',
      expose_php: 'Off',
      display_errors: 'Off',
      display_startup_errors: 'Off',
      html_errors: 'Off',
      log_errors: 'On',
      short_open_tag: 'On',
      'opcache.validate_timestamps': 1,
      'opcache.revalidate_freq': 0,
      auto_prepend_file: prependFile || '',
      ...phpIni,
    });
    if (onMessage) php.onMessage(onMessage);
    php.enableRuntimeRotation({ recreateRuntime: load, maxRequests });
  } catch (error) {
    php.exit();
    for (const socket of activeSockets) socket.destroy();
    throw error;
  }

  return {
    get pending() { return pending; },
    onMessage(handler) { return php.onMessage(handler); },

    /**
     * Execute one HTTP-style request. scriptPath is an absolute virtual path,
     * e.g. /game/index.php or /runtime/install.php. `server` aliases `$_SERVER`.
     * Result is PHPResponse: httpStatusCode, headers (string[]), bytes,
     * text (UTF-8 getter), errors and exitCode. A PHP fatal error is returned as
     * a response; infrastructure/VM failures reject and rotate the VM next run.
     */
    run(request = {}) {
      if (closed) return Promise.reject(new Error('PHP runtime is closed.'));
      pending++;
      const result = queue.then(async () => {
        const { server, ...options } = request;
        if (options.scriptPath) {
          const script = path.posix.normalize(options.scriptPath);
          if (script.includes('\\') || script.includes('\0') ||
              !(script.startsWith('/game/') || script.startsWith('/runtime/'))) {
            throw new Error('PHP scriptPath must be inside /game or /runtime.');
          }
          options.scriptPath = script;
        }
        php.chdir('/game');
        try {
          return await php.run({
            ...options,
            method: options.method || 'GET',
            relativeUri: options.relativeUri || '/',
            headers: normalizeHeaders(options.headers),
            body: typeof options.body === 'string' ? Buffer.from(options.body) : options.body,
            env: stringEntries(options.env),
            $_SERVER: stringEntries({
              DOCUMENT_ROOT: '/game',
              SERVER_SOFTWARE: 'DTS-X/Node.js',
              ...(options.scriptPath ? { SCRIPT_FILENAME: options.scriptPath } : {}),
              ...options.$_SERVER,
              ...server,
            }),
          });
        } catch (error) {
          if (error instanceof PHPExecutionFailureError && error.source === 'request') {
            return error.response;
          }
          throw error;
        }
      });
      queue = result.then(() => {}, () => {}).finally(() => { pending--; });
      return result;
    },

    /** Stop accepting requests, drain existing work, and close the VM/proxy. */
    close() {
      if (closePromise) return closePromise;
      closed = true;
      closePromise = queue.then(() => {
        try { php.exit(); }
        finally {
          for (const socket of activeSockets) socket.destroy();
          activeSockets.clear();
        }
      });
      return closePromise;
    },
  };
}

/**
 * Require OS locks for pools: JavaScript lock fallback cannot coordinate worker
 * threads or different Node processes. Never silently run competing VMs without
 * native locks, because the engine relies on flock for generated caches/state.
 */
export function assertNativeFileLocks() {
  try {
    if (process.platform === 'win32') new FileLockManagerForWindows();
    else new FileLockManagerForPosix();
  } catch (cause) {
    throw new Error('Native file locks are required. Install dependencies with optional packages enabled on a supported Node.js/platform combination.', { cause });
  }
}

async function startWorker(options, onMessage, requestTimeoutMs) {
  const worker = new Worker(new URL('./php-worker.mjs', import.meta.url), {
    workerData: options,
    // CLI/test-runner flags are not worker flags. Node 24+ selects the supported
    // WASM async mode itself; workers require no inherited command-line flags.
    execArgv: [],
  });
  let sequence = 0;
  let dead = false;
  let termination;
  const waiting = new Map();
  let readyResolve, readyReject;
  const ready = new Promise((resolve, reject) => { readyResolve = resolve; readyReject = reject; });
  const die = error => {
    if (dead) return;
    dead = true;
    readyReject(error);
    for (const { reject, timer } of waiting.values()) {
      clearTimeout(timer);
      reject(error);
    }
    waiting.clear();
    termination = worker.terminate();
  };
  worker.on('error', die);
  worker.on('exit', code => {
    if (!dead) die(new Error(`PHP worker exited unexpectedly (code ${code}).`));
  });
  worker.on('message', async message => {
    if (message.type === 'ready') { readyResolve(); return; }
    if (message.type === 'startup-error') { die(new Error(message.error)); return; }
    if (message.type === 'php-message') {
      try {
        const value = onMessage ? await onMessage(message.value) : undefined;
        worker.postMessage({ type: 'php-message-response', id: message.id, value });
      } catch (error) {
        worker.postMessage({ type: 'php-message-response', id: message.id, error: error.message });
      }
      return;
    }
    const pending = waiting.get(message.id);
    if (!pending) return;
    waiting.delete(message.id);
    clearTimeout(pending.timer);
    if (message.error) pending.reject(new Error(message.error));
    else pending.resolve(message.result);
  });
  const startupTimer = setTimeout(() => die(new Error('PHP worker startup timed out.')), 60_000);
  try { await ready; }
  finally { clearTimeout(startupTimer); }
  const call = (type, request) => new Promise((resolve, reject) => {
    if (dead) { reject(new Error('PHP worker is unavailable.')); return; }
    const id = ++sequence;
    const timer = setTimeout(() => die(new Error(`PHP request exceeded ${requestTimeoutMs} ms; its worker was restarted.`)), requestTimeoutMs);
    waiting.set(id, { resolve, reject, timer });
    try { worker.postMessage({ id, type, request }); }
    catch (error) {
      waiting.delete(id); clearTimeout(timer); reject(error);
    }
  });
  return {
    get dead() { return dead; },
    async run(request) {
      const result = await call('run', request);
      // Worker serialization deliberately preserves binary bytes and repeated
      // response headers. Decode text lazily for CLI scripts and diagnostics.
      Object.defineProperty(result, 'text', { get: () => Buffer.from(result.bytes).toString('utf8') });
      return result;
    },
    async close() {
      if (!dead) {
        try { await call('close'); }
        finally { die(new Error('PHP worker closed.')); }
      }
      await termination;
    },
  };
}

/**
 * Worker-backed PHP contexts sharing the mounted disk. Native blocking flock
 * must run outside Node's HTTP event loop; placing several VMs on one event
 * loop deadlocks when a lock holder yields to a competing request.
 * Keep an independent pool for nested internal curl callbacks.
 */
export async function createPhpRuntimePool({ size = 2, requestTimeoutMs = 180_000, onMessage, ...options } = {}) {
  if (!Number.isSafeInteger(size) || size < 1 || size > 32) {
    throw new RangeError('PHP pool size must be an integer between 1 and 32.');
  }
  if (!Number.isFinite(requestTimeoutMs) || requestTimeoutMs < 1) {
    throw new RangeError('requestTimeoutMs must be positive.');
  }
  assertNativeFileLocks();
  const instances = [];
  try {
    for (let i = 0; i < size; i++) {
      let client = await startWorker(options, onMessage, requestTimeoutMs);
      let queue = Promise.resolve();
      let pending = 0;
      instances.push({
        get pending() { return pending; },
        run(request) {
          pending++;
          const result = queue.then(async () => {
            if (client.dead) {
              await client.close();
              client = await startWorker(options, onMessage, requestTimeoutMs);
            }
            return client.run(request);
          });
          queue = result.then(() => {}, () => {}).finally(() => { pending--; });
          return result;
        },
        async close() { await queue; await client.close(); },
      });
    }
  } catch (error) {
    await Promise.allSettled(instances.map(instance => instance.close()));
    throw error;
  }
  let closed = false;
  let cursor = 0;
  let closePromise;
  return {
    size,
    get pending() { return instances.reduce((sum, instance) => sum + instance.pending, 0); },
    run(request) {
      if (closed) return Promise.reject(new Error('PHP runtime pool is closed.'));
      let selected = instances[cursor++ % size];
      for (const instance of instances) {
        if (instance.pending < selected.pending) selected = instance;
      }
      return selected.run(request);
    },
    close() {
      closed = true;
      closePromise ??= Promise.all(instances.map(instance => instance.close()));
      return closePromise;
    },
  };
}
