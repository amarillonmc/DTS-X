/** Compiled static avatar metadata, scoped to one application/source tree.
 * Like the original generated avatar list, refresh on deployment/restart or
 * module-plan activation. Actual image byte reads retain their own path checks.
 * Only the unmodified built-in enumeration may use this catalog. */
export function createPlayerIconCatalog() {
  const entries = new Map();
  return Object.freeze({
    async read(key, build) {
      let pending = entries.get(key);
      if (!pending) {
        pending = Promise.resolve().then(build).then(value => structuredClone(value));
        if (entries.size >= 32) entries.delete(entries.keys().next().value);
        entries.set(key, pending);
        pending.catch(() => { if (entries.get(key) === pending) entries.delete(key); });
      }
      return structuredClone(await pending);
    },
    invalidate() { entries.clear(); },
  });
}
