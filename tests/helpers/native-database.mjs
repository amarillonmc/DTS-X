import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { createDatabase } from '../../native/storage/database.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
export async function isolatedDatabase(t, label = 'storage') {
  if (!/^[a-z_]+$/.test(label)) throw new TypeError('Fixture label must be lowercase letters');
  let credentials;
  try { credentials = JSON.parse(await fs.readFile(path.join(root, 'var/test-db-credentials.json'), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') { t.skip('Requires the dedicated scripts/test-db.ps1 database; production is never used.'); return null; } throw error; }
  assert.equal(credentials.host, '127.0.0.1'); assert.equal(credentials.port, 33317); assert.equal(credentials.database, 'dtsx_test');
  const options = { host: credentials.host, port: credentials.port, user: credentials.user, password: credentials.password, charset: 'utf8' };
  const connection = await createDatabase(options);
  let owned = false;
  const databaseName = 'dtsx_native_' + label + '_' + randomBytes(8).toString('hex');
  try {
    const actual = (await connection.query('SELECT @@datadir AS dir'))[0].dir;
    assert.equal(path.resolve(actual.replace(/[\\/]+$/, '')), path.resolve(root, 'var/test-db'), 'Refusing to write to a non-fixture data directory');
    await connection.execute(`CREATE DATABASE ${databaseName} CHARACTER SET utf8 COLLATE utf8_general_ci`); owned = true;
    await connection.select_db(databaseName);
    t.after(async () => {
      try { if (owned) await connection.execute(`DROP DATABASE ${databaseName}`); }
      finally { await connection.close(); }
    });
    return { database: connection, databaseName, credentials: { ...options, database: databaseName }, root };
  } catch (error) {
    try { if (owned) await connection.execute(`DROP DATABASE ${databaseName}`); }
    finally { await connection.close(); }
    throw error;
  }
}
