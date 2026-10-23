/** Application-owned schema metadata, equivalent to the source's compiled
 * players schema. No connection, player row or room state is retained. Schema
 * migrations invalidate this service (or restart the application). */
export function createPlayerSchemaCache() {
  const tables = new Map();
  return Object.freeze({
    async describe(database, table) {
      if (typeof table !== 'string' || !/^[A-Za-z0-9_]+$/.test(table)) throw new TypeError('Invalid players schema table');
      let pending = tables.get(table);
      if (!pending) {
        pending = Promise.resolve().then(async () => {
          const rows = await database.query(`DESCRIBE ${table}`);
          const names = new Set();
          if (!Array.isArray(rows) || !rows.length) throw new Error('Native player requires an installed players table with a real schema');
          return Object.freeze(Array.from(rows, row => {
            if (!row || typeof row !== 'object') throw new TypeError('Invalid player schema column');
            const { Field, Type } = row;
            if (typeof Field !== 'string' || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(Field) || typeof Type !== 'string' || names.has(Field)) throw new TypeError('Invalid or duplicate player schema column');
            names.add(Field);
            return Object.freeze({ Field, Type });
          }));
        });
        tables.set(table, pending);
        // A failed query is not a cached absence. Do not remove a newer value
        // if a migration invalidated this entry while the query was pending.
        pending.catch(() => { if (tables.get(table) === pending) tables.delete(table); });
      }
      return pending;
    },
    invalidate(table) { if (table === undefined) tables.clear(); else tables.delete(table); },
  });
}
