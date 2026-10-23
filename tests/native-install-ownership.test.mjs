import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { installNative } from '../native/install/installer.mjs';
import { doctorNative } from '../native/doctor.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

test('setup and diagnostics reject damaged ownership records without modifying saved data', { timeout: 120000 }, async t => {
  const fixture = await isolatedDatabase(t, 'install_ownership'); if (!fixture) return;
  const { database, credentials, root } = fixture;
  const base = path.join(root, 'var/tests'); await fs.mkdir(base, { recursive: true });
  const stateRoot = await fs.mkdtemp(path.join(base, 'native-install-ownership-'));
  t.after(async () => { assert.ok(path.resolve(stateRoot).startsWith(path.resolve(base) + path.sep)); await fs.rm(stateRoot, { recursive: true, force: true }); });
  const options = { database, stateRoot, admin: { username: '归属校验', password: 'OwnershipFixtureOnly!' } };
  const config = { stateRoot, databaseOptions: credentials, tablePrefix: 'bra_' };
  await installNative(options);
  await database.execute("UPDATE bra_users SET gold=4713,motto='损坏标记不得覆盖数据' WHERE uid=1");
  await database.execute('UPDATE bra_game SET gamenum=72,starttime=1234567 WHERE groomid=0');
  const file = path.join(stateRoot, 'native-install.json'), journalText = await fs.readFile(file, 'utf8'), journal = JSON.parse(journalText);
  const saved = { users: await database.query('SELECT * FROM bra_users'), game: await database.query('SELECT * FROM bra_game'), tables: await database.query('SHOW TABLES') };
  const snapshot = async () => ({ users: await database.query('SELECT * FROM bra_users'), game: await database.query('SELECT * FROM bra_game'), tables: await database.query('SHOW TABLES') });
  const refuse = async label => {
    const markerText = await fs.readFile(file, 'utf8'), rows = await database.query('SELECT * FROM bra_native_install');
    await assert.rejects(installNative(options), /ownership|owners/i, label + ': setup');
    await assert.rejects(doctorNative(config), /ownership|owners/i, label + ': diagnostics');
    assert.deepEqual(await snapshot(), saved, label + ': saved account and game remain intact');
    assert.equal(await fs.readFile(file, 'utf8'), markerText, label + ': damaged journal remains available for inspection');
    assert.deepEqual(await database.query('SELECT * FROM bra_native_install'), rows, label + ': no owner is invented or repaired');
  };
  const corrupt = async (owner, databaseOwners) => {
    const damaged = { ...journal }; if (owner === undefined) delete damaged.owner; else damaged.owner = owner;
    await fs.writeFile(file, JSON.stringify(damaged));
    await database.execute('DELETE FROM bra_native_install');
    for (const value of databaseOwners) await database.execute(`INSERT INTO bra_native_install (singleton,owner) VALUES (1,${database.escape(value)})`);
  };
  // Previously, absent journal.owner and an empty SELECT result compared as
  // undefined === undefined; matching malformed strings were accepted too.
  for (const [label, owner, databaseOwners] of [
    ['missing owner and empty owner table', undefined, []],
    ['empty owner on both sides', '', ['']],
    ['short owner on both sides', 'a'.repeat(47), ['a'.repeat(47)]],
    ['nonhex owner on both sides', 'g'.repeat(48), ['g'.repeat(48)]],
    ['structured owner instead of a string', [journal.owner], [journal.owner]],
    ['valid owner with missing database row', journal.owner, []],
    ['different database owner', journal.owner, [journal.owner === 'f'.repeat(48) ? 'e'.repeat(48) : 'f'.repeat(48)]],
  ]) { await corrupt(owner, databaseOwners); await refuse(label); }

  // A restored/damaged marker schema could lose its primary key. Checking
  // only the first row would incorrectly accept duplicate singleton records.
  await database.execute('ALTER TABLE bra_native_install DROP PRIMARY KEY');
  await corrupt(journal.owner, [journal.owner, journal.owner]); await refuse('duplicate singleton ownership rows');
  await database.execute('DELETE FROM bra_native_install');
  await database.execute('ALTER TABLE bra_native_install ADD PRIMARY KEY (singleton)');
  await database.execute(`INSERT INTO bra_native_install (singleton,owner) VALUES (1,${database.escape(journal.owner)})`);
  await fs.writeFile(file, journalText);
  assert.equal((await installNative(options)).installed, false);
  assert.equal((await doctorNative(config)).ownership, 'verified');
  assert.deepEqual(await snapshot(), saved);
});
