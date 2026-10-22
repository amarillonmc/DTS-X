import { parentPort, workerData } from 'node:worker_threads';
import { createPhpRuntime, assertNativeFileLocks } from './php-runtime.mjs';

// This file is an internal pool entry point, not an HTTP endpoint.
if (!parentPort) throw new Error('php-worker.mjs must run in a worker thread.');
let php;
let messageId = 0;
const callbacks = new Map();

parentPort.on('message', async message => {
  if (message.type === 'php-message-response') {
    const callback = callbacks.get(message.id);
    if (!callback) return;
    callbacks.delete(message.id);
    if (message.error) callback.reject(new Error(message.error));
    else callback.resolve(message.value);
    return;
  }
  try {
    if (message.type === 'close') {
      await php.close();
      parentPort.postMessage({ id: message.id, result: null });
      return;
    }
    const response = await php.run(message.request);
    const result = {
      httpStatusCode: response.httpStatusCode,
      headers: response.headers,
      bytes: response.bytes,
      errors: response.errors,
      exitCode: response.exitCode,
    };
    parentPort.postMessage({ id: message.id, result });
  } catch (error) {
    parentPort.postMessage({ id: message.id, error: error.stack || error.message });
  }
});

try {
  assertNativeFileLocks();
  php = await createPhpRuntime({
    ...workerData,
    onMessage: value => new Promise((resolve, reject) => {
      const id = ++messageId;
      callbacks.set(id, { resolve, reject });
      parentPort.postMessage({ type: 'php-message', id, value });
    }),
  });
  parentPort.postMessage({ type: 'ready' });
} catch (error) {
  parentPort.postMessage({ type: 'startup-error', error: error.stack || error.message });
}
