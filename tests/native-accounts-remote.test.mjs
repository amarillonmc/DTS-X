import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { isolatedDatabase } from './helpers/native-database.mjs';
import { createAccountsOracle } from './helpers/native-accounts.mjs';
import { installationSchema } from '../native/install/installer.mjs';
import { createRemoteUserReceiver } from '../native/accounts/remote.mjs';
import { createRemoteUserClient, createUserService } from '../native/accounts/users.mjs';
import { timestampSalt, createStoredPass, createCookiePass } from '../native/accounts/primitives.mjs';
import { gdecode, gencode } from '../native/protocol/codec.mjs';

test('native remote endpoint accepts actual original PHP curl protocol and Node client with real database leases', async t => {
  const oracle = await createAccountsOracle(t); if (!oracle) return;
  const fixture = await isolatedDatabase(t, 'remote_users'); if (!fixture) return;
  const { database, root } = fixture;
  await database.execute((await installationSchema()).statements.find(row => row.name === 'bra_users').sql);
  const base = path.join(root, 'var/tests'); await fs.mkdir(base, { recursive: true }); const stateRoot = await fs.mkdtemp(path.join(base, 'native-remote-'));
  t.after(async () => { assert.ok(path.resolve(stateRoot).startsWith(path.resolve(base) + path.sep)); await fs.rm(stateRoot, { recursive: true, force: true }); });
  const now = 1729612800, sign = 'fixture-peer', password = 'test-only-remote-password';
  const receiver = createRemoteUserReceiver({ database, stateRoot, peers: { [sign]: { pass: password, ip: '127.0.0.1' } }, clock: () => now, leaseMs: 20000, lockTimeoutMs: 60 });
  const server = http.createServer(async (request, response) => {
    try { const chunks = []; for await (const chunk of request) chunks.push(chunk); response.end(await receiver.handle(Object.fromEntries(new URLSearchParams(Buffer.concat(chunks).toString())), { REMOTE_ADDR: request.socket.remoteAddress })); }
    catch { response.statusCode = 500; response.end('Error: Native request failed'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await receiver.close(); });
  const url = `http://127.0.0.1:${server.address().port}/userdb_receive.php`;
  const remote = createRemoteUserClient({ url, sign, password, clock: () => now });
  const sample = { username: '远端用户', password: createStoredPass('远端用户', createCookiePass('password')), groupid: 1, gold: 100 };
  assert.match(await remote.command('insert_udata', sample), /^INSERT /);
  assert.equal((await remote.command('fetch_udata', '*', "username='远端用户'"))[0].gold, '100');
  const competing = createRemoteUserClient({ url, sign, password, clock: () => now });
  await assert.rejects(competing.command('fetch_udata', '*', "username='远端用户'"), error => error.code === 'REMOTE_USER_REJECTED');
  await remote.release();
  assert.equal((await competing.command('fetch_udata', '*', "username='远端用户'"))[0].username, '远端用户'); await competing.release();
  const globals = { userdb_remote_storage: url, userdb_remote_storage_sign: sign, userdb_remote_storage_pass: password, userdb_remote_reconnect_times: 1, userdb_remote_reconnect_duration: 0 };
  const original = await oracle.async({ function: 'curl_udata_cmd', args: ['fetch_udata', '*', "username='远端用户'", '', 0, 1], globals, now, script: 'user' });
  assert.equal(original.error, undefined); assert.deepEqual(original.result, await remote.command('fetch_udata', '*', "username='远端用户'", '', 0, 1));
  const changed = await oracle.async({ function: 'curl_udata_cmd', args: ['update_udata', { gold: 333, motto: 'PHP写入原生端' }, "username='远端用户'"], globals, now, script: 'user' });
  assert.match(changed.result, /^UPDATE /);
  assert.equal((await remote.command('fetch_udata', '*', "username='远端用户'", '', 0, 1))[0].motto, 'PHP写入原生端');
  const auth = { sign, pass: timestampSalt(password, 0, now), key: 'aabb', command: 'fetch_udata', para1: '*', para2: '1' };
  assert.equal(await receiver.handle({ ...auth, pass: 'wrong' }, { REMOTE_ADDR: '127.0.0.1' }), 'Error: Invalid sign');
  assert.equal(await receiver.handle(auth, { REMOTE_ADDR: '127.0.0.2' }), 'Error: Invalid sign');
  assert.equal(await receiver.handle({ ...auth, command: 'insert_udata', para1: gencode(Array.from({ length: 11 }, (_, index) => ({ ...sample, username: 'user' + index }))) }, { REMOTE_ADDR: '127.0.0.1' }), 'Error: Too many inserts');
  assert.equal(await receiver.handle({ ...auth, key: '../escape' }, { REMOTE_ADDR: '127.0.0.1' }), 'Error: Invalid lock key');
  assert.equal(gdecode(await receiver.handle({ ...auth, command: 'get_ip' }, { REMOTE_ADDR: '127.0.0.1' })), '127.0.0.1');
  await remote.release();
});
