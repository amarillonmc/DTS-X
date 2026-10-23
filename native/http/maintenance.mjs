import { AsyncLocalStorage } from 'node:async_hooks';

/** All dynamic requests and scheduled writers enter the same gate. Maintenance
 * suspends its own request, drains other writers, and runs exclusively. Queued
 * maintenance requests are also suspended, so two simultaneous upgrades cannot
 * wait on each other's request completion. */
export function createMaintenanceGate() {
  const context = new AsyncLocalStorage(), active = new Set(), changed = new Set();
  let closing = false, pending = 0, tail = Promise.resolve();
  const notify = () => { for (const wake of [...changed]) wake(); };
  const unavailable = () => Object.assign(new Error('Server is shutting down'), { status: 503, code: 'NATIVE_SHUTDOWN' });
  async function until(predicate, signal) {
    while (!predicate()) {
      if (signal?.aborted) throw signal.reason ?? new Error('Request aborted');
      await new Promise((resolve, reject) => {
        const wake = () => { changed.delete(wake); signal?.removeEventListener('abort', abort); resolve(); };
        const abort = () => { changed.delete(wake); signal?.removeEventListener('abort', abort); reject(signal.reason ?? new Error('Request aborted')); };
        changed.add(wake); signal?.addEventListener('abort', abort, { once: true });
        if (signal?.aborted) abort();
      });
    }
  }
  return {
    async request(callback, { signal } = {}) {
      if (context.getStore()) throw new Error('Nested maintenance request gate');
      const ticket = { maintenance: false };
      for (;;) {
        await until(() => closing || pending === 0, signal);
        if (closing) throw unavailable();
        if (signal?.aborted) throw signal.reason ?? new Error('Request aborted');
        if (pending !== 0) continue;
        active.add(ticket); break;
      }
      try { return await context.run(ticket, callback); }
      finally { active.delete(ticket); notify(); }
    },
    async run(callback) {
      const ticket = context.getStore();
      if (ticket?.maintenance) throw new Error('Nested maintenance operation');
      if (closing) throw unavailable();
      if (ticket) { ticket.maintenance = true; active.delete(ticket); }
      pending++;
      const previous = tail;
      let release;
      tail = new Promise(resolve => { release = resolve; });
      notify();
      try {
        await previous;
        await until(() => active.size === 0);
        return await callback();
      } finally {
        if (ticket) { ticket.maintenance = false; active.add(ticket); }
        pending--; release(); notify();
      }
    },
    async close() {
      closing = true; notify();
      await until(() => active.size === 0 && pending === 0);
      context.disable();
    },
    get pending() { return pending; },
  };
}
