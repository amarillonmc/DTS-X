import { AsyncLocalStorage } from 'node:async_hooks';

/** Per-request output with nested, async-safe include captures. A render does
 * not consume earlier output; gameplay's output.take() retains that contract.
 */
export function createOutput() {
  const contexts = new AsyncLocalStorage(), root = [[]];
  const stack = () => contexts.getStore() ?? root;
  const current = () => stack().at(-1);
  return Object.freeze({
    write(value) { if (typeof value !== 'string') throw new TypeError('Native output requires text'); current().push(value); },
    peek() { return current().join(''); },
    take() { const buffer = current(), value = buffer.join(''); buffer.length = 0; return value; },
    start() { stack().push([]); return true; },
    endClean() { if (stack().length <= 1) return false; stack().pop(); return true; },
    async capture(callback) { const buffer = []; await contexts.run([buffer], callback); return buffer.join(''); },
  });
}
