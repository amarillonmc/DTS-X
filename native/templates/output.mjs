import { AsyncLocalStorage } from 'node:async_hooks';
const contexts = new AsyncLocalStorage();

/** Per-request output with nested, async-safe include captures. A render does
 * not consume earlier output; gameplay's output.take() retains that contract.
 */
export function createOutput() {
  const root = [[]], owner = Symbol('output');
  const stack = () => {
    // A callback may render through another output before returning to this
    // one. Find this owner's capture without exposing the other request's text.
    for (let frame = contexts.getStore(); frame; frame = frame.parent) {
      if (frame.owner === owner) return frame.stack;
    }
    return root;
  };
  const current = () => stack().at(-1);
  return Object.freeze({
    write(value) { if (typeof value !== 'string') throw new TypeError('Native output requires text'); current().push(value); },
    peek() { return current().join(''); },
    take() { const buffer = current(), value = buffer.join(''); buffer.length = 0; return value; },
    start() { stack().push([]); return true; },
    endClean() { if (stack().length <= 1) return false; stack().pop(); return true; },
    async capture(callback) {
      const buffer = [];
      await contexts.run({ owner, stack: [buffer], parent: contexts.getStore() }, callback);
      return buffer.join('');
    },
  });
}
