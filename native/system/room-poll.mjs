import { EventEmitter } from 'node:events';

/** In-process wakeups are only a latency optimization. Every waiter rechecks
 * persisted room state on a bounded interval, so updates from another Node
 * process and a broadcast racing registration are not lost. */
export function createRoomBroadcast({ intervalMs = 500, timeoutMs = 30_000 } = {}) {
  const events = new EventEmitter(); events.setMaxListeners(0);
  let closed = false;
  return {
    notify(id) { events.emit(String(id)); },
    close() { closed = true; events.emit('close'); },
    async wait(id, readChange, { signal, timeout = timeoutMs } = {}) {
      const key = String(id), deadline = Date.now() + timeout;
      let generation = 0, wake;
      const changed = () => { generation++; wake?.(); };
      events.on(key, changed); events.on('close', changed); signal?.addEventListener('abort', changed);
      try {
        while (!closed && !signal?.aborted) {
          const before = generation, value = await readChange();
          if (value !== null && value !== undefined && value !== false) return value;
          if (Date.now() >= deadline) return null;
          if (before !== generation) continue;
          await new Promise(resolve => {
            let timer;
            wake = () => { clearTimeout(timer); wake = null; resolve(); };
            timer = setTimeout(wake, Math.min(intervalMs, deadline - Date.now()));
            if (closed || signal?.aborted || before !== generation) wake();
          });
        }
        return null;
      } finally { events.removeListener(key, changed); events.removeListener('close', changed); signal?.removeEventListener('abort', changed); }
    },
  };
}
