import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { installNative, installationSchema } from '../native/install/installer.mjs';
import { createDatabase } from '../native/storage/database.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';
import { createCookiePass, createStoredPass } from '../native/accounts/primitives.mjs';

async function stateDirectory(t, root) {
  const base = path.join(root, 'var/tests'); await fs.mkdir(base, { recursive: true });
  const directory = await fs.mkdtemp(path.join(base, 'native-install-'));
  t.after(async () => { assert.ok(path.resolve(directory).startsWith(path.resolve(base) + path.sep)); await fs.rm(directory, { recursive: true, force: true }); });
  return directory;
}

test('native installer provisions original schemas and preserves users and game state after reopening', async t => {
  const fixture = await isolatedDatabase(t, 'install'); if (!fixture) return;
  const { database, credentials, root } = fixture, stateRoot = await stateDirectory(t, root);
  const options = { database, stateRoot, admin: { username: '创始人', password: 'test-only-password' }, starttime: 1234567 };
  const installed = await installNative(options); assert.equal(installed.installed, true);
  const schema = await installationSchema(); assert.equal(schema.statements.length, 14);
  assert.equal((await database.query('SHOW TABLES')).length, 15);
  const user = (await database.query('SELECT * FROM bra_users'))[0];
  assert.equal(user.password, createStoredPass('创始人', createCookiePass('test-only-password'))); assert.equal(user.groupid, '9'); assert.equal(user.gender, 'f');
  await database.execute("UPDATE bra_users SET gold=6789,motto='保留存档' WHERE uid=1");
  await database.execute('UPDATE bra_game SET gamenum=93,starttime=9999999 WHERE groomid=0');
  const prior = { users: await database.query('SELECT * FROM bra_users'), game: await database.query('SELECT * FROM bra_game') };
  const reopened = await createDatabase(credentials);
  try {
    const again = await installNative({ ...options, database: reopened, admin: { username: '另一个', password: 'must-not-reset' }, starttime: 0 });
    assert.equal(again.installed, false); assert.deepEqual(await reopened.query('SELECT * FROM bra_users'), prior.users); assert.deepEqual(await reopened.query('SELECT * FROM bra_game'), prior.game);
  } finally { await reopened.close(); }
  const journalText = await fs.readFile(path.join(stateRoot, 'native-install.json'), 'utf8'), journal = JSON.parse(journalText);
  assert.equal(journal.status, 'ready'); assert.equal(journal.sources.length, 4); assert.equal(journalText.includes(options.admin.password), false);
  for (const name of ['gamedata/tmp/rooms', 'gamedata/replays', 'gamedata/bak']) assert.equal((await fs.stat(path.join(stateRoot, name))).isDirectory(), true);
});

test('installation refuses unrelated database, occupied state, partial setup and public/source roots without erasing data', async t => {
  const fixture = await isolatedDatabase(t, 'install_guard'); if (!fixture) return;
  const { database, root } = fixture, stateRoot = await stateDirectory(t, root), admin = { username: 'tester', password: 'test-only' };
  await database.execute('CREATE TABLE precious (value VARCHAR(20))'); await database.execute("INSERT INTO precious VALUES ('preserve')");
  await assert.rejects(installNative({ database, stateRoot, admin }), /nonempty, unowned database/);
  assert.deepEqual(await database.query('SELECT * FROM precious'), [{ value: 'preserve' }]);
  await database.execute('DROP TABLE precious'); // This test exclusively created and owns this fixture table.
  await fs.writeFile(path.join(stateRoot, 'saved-replay'), 'preserve');
  await assert.rejects(installNative({ database, stateRoot, admin }), /nonempty, unowned state/);
  assert.equal(await fs.readFile(path.join(stateRoot, 'saved-replay'), 'utf8'), 'preserve');
  await fs.writeFile(path.join(stateRoot, 'native-install.json'), JSON.stringify({ format: 1, status: 'creating', database: fixture.databaseName, tablePrefix: 'bra_' }));
  await assert.rejects(installNative({ database, stateRoot, admin }), /incomplete/);
  assert.deepEqual(await database.query('SHOW TABLES'), []);
  for (const unsafe of [root, path.join(root, 'engine'), path.join(root, 'public', 'installation')]) await assert.rejects(installNative({ database, stateRoot: unsafe, admin }), /web\/source root/);
});
