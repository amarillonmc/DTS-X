import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import snapshots from '../native/system/sys-config.json' with { type: 'json' };
import { installationSchema } from '../native/install/installer.mjs';
import { createDatabase } from '../native/storage/database.mjs';
import { createLockServices } from '../native/storage/locks.mjs';
import { createUserService } from '../native/accounts/users.mjs';
import { createAccountService } from '../native/accounts/service.mjs';
import { createVerificationService } from '../native/accounts/verification.mjs';
import { createCookiePass, createStoredPass } from '../native/accounts/primitives.mjs';
import { gdecode, gencode } from '../native/protocol/codec.mjs';
import { decodeUserRows } from '../native/accounts/wire.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';
import { createAccountsOracle } from './helpers/native-accounts.mjs';
const now = 1729612800, gameUrl = 'https://example.test/';
const resources = snapshots['resources.config.php'];
const canonical = value => value instanceof Map ? Object.fromEntries([...value].map(([key, row]) => [key, canonical(row)])) : Array.isArray(value) ? value.map(canonical) : value;
async function setup(t, label = 'accounts') {
  const fixture = await isolatedDatabase(t, label); if (!fixture) return null;
  await fixture.database.execute((await installationSchema()).statements.find(entry => entry.name === 'bra_users').sql);
  const base = path.join(fixture.root, 'var/tests'); await fs.mkdir(base, { recursive: true });
  const stateRoot = await fs.mkdtemp(path.join(base, 'native-accounts-data-'));
  t.after(async () => { assert.ok(path.resolve(stateRoot).startsWith(path.resolve(base) + path.sep)); await fs.rm(stateRoot, { recursive: true, force: true }); });
  const requests = [];
  t.after(async () => { for (const { users, locks } of requests) { await users.close(); await locks.close(); } });
  const session = async (script = 'login', database = fixture.database) => {
    const locks = await createLockServices(stateRoot), users = createUserService({ database, locks: locks.locks, script, lockTimeoutMs: 80 });
    requests.push({ users, locks }); return { users, locks };
  };
  return { ...fixture, stateRoot, session };
}
async function reset(database) { await database.execute('DELETE FROM bra_users'); await database.execute('ALTER TABLE bra_users AUTO_INCREMENT=1'); }
const userData = username => ({ username, password: createStoredPass(username, createCookiePass('password')), groupid: 1, gender: 'm', gold: 100, card_data: gencode([{ cardid: 0, cardenergy: 0 }]) });

test('native user storage matches original SQL and row/key semantics on real MySQL', async t => {
  const oracle = await createAccountsOracle(t); if (!oracle) return;
  const fixture = await setup(t); if (!fixture) return;
  const { database, credentials } = fixture;
  const operations = [
    ['insert_udata', [userData('甲')], 'insert'], ['insert_udata', [userData('乙')], 'insert'],
    ['fetch_udata', ['*', '1', 'uid DESC', 1], 'fetch'],
    ['update_udata_by_username', [{ gold: 567, motto: '中文资料' }, '甲'], 'updateByUsername'],
    ['update_udata_multilist', [[{ username: '甲', credits: 42 }, { username: '乙', credits: 99 }]], 'updateMany'],
    ['fetch_udata_by_username', ['甲'], 'fetchByUsername'],
    ['fetch_udata', ['uid,username,gold', '1', 'uid DESC', 2], 'fetch'],
  ];
  const expected = oracle({ mode: 'storage', credentials, script: 'user', operations: operations.map(([fn,args]) => ({ function: fn, args })) });
  assert.equal(expected.error, undefined); await reset(database);
  const { users } = await fixture.session('user'), actual = [];
  for (const [, args, fn] of operations) actual.push(canonical(await users[fn](...args)));
  assert.deepEqual(actual, expected.result.results); assert.deepEqual(await database.query('SELECT * FROM bra_users ORDER BY uid'), expected.result.rows);
  assert.deepEqual([...await users.fetch('uid,username', '1', 'uid DESC', 2)].map(([key]) => key), [2,1]);
  assert.deepEqual(users.lockNames(), ['乙','甲']);
  for(const username of ['20','2','__proto__','constructor']) await users.insertRaw({...userData(username),motto:'nested "quote", and {braces} [1,2]'});
  for(const keytype of [1,2]) {
    const ordered=oracle({mode:'keyed_order',credentials,script:'rank',args:['*','1','uid DESC',keytype,1]}).result;
    assert.deepEqual([...decodeUserRows(ordered.payload).keys()],ordered.keys);
    assert.deepEqual([...await users.fetch('*','1','uid DESC',keytype,1)], [...decodeUserRows(ordered.payload)]);
  }
});

test('original login/register entry success and failure match native cookies, messages and persisted rows', async t => {
  const oracle = await createAccountsOracle(t); if (!oracle) return;
  const fixture = await setup(t, 'account_entries'); if (!fixture) return;
  const { database, credentials } = fixture;
  const verification = await createVerificationService({ gameUrl, clock: () => now });
  const token = verification.token(0, now), correct = verification.question(token, now).correct_i;
  const registerBase = { cmd: 'post_register', username: '测试者', npass: 'password', rnpass: 'password', gender: 'f', icon: '7', motto: 'hello', killmsg: 'bye', lastword: 'next', register_token: token, vq_answer: String(correct) };
  const cases = [
    ['register', registerBase], ['register', { ...registerBase, cmd: 'anything', username: '另类命令' }],
    ['register', { ...registerBase, username: '' }], ['register', { ...registerBase, rnpass: 'different' }],
    ['register', { ...registerBase, vq_answer: '-1' }], ['register', { ...registerBase, register_token: '' }],
    ['register', { ...registerBase, username: '已存在' }, userData('已存在')],
    ['login', { username: '测试者', password: 'password' }, userData('测试者')],
    ['login', { username: '测试者', password: 'wrong' }, userData('测试者')],
    ['login', { username: '测试者', password: 'password' }, { ...userData('测试者'), groupid: 0 }],
    ['login', { username: '不存在', password: 'password' }], ['login', {}], ['login', { mode: 'quit' }],
  ];
  for (const [entry, input, seed] of cases) {
    await reset(database); if (seed) await database.arrayInsert('bra_users', seed);
    const expected = oracle({ credentials, entry, input, now, gameUrl, ipLimit: '/^$/', nameLimit: '/^$/', errors: resources._ERROR, info: resources._INFO, server: { REMOTE_ADDR: '127.0.0.2' } });
    await reset(database); if (seed) await database.arrayInsert('bra_users', seed);
    const { users, locks } = await fixture.session(entry), accounts = createAccountService({ users, verification, clock: () => now });
    let actual, error = null; try { actual = await accounts[entry](input, { server: { REMOTE_ADDR: '127.0.0.2' } }); } catch (failure) { error = failure.message; }
    assert.equal(error, expected.error, JSON.stringify([entry, input.username, input.mode]));
    if (actual) {
      assert.equal(actual.template ?? null, expected.template);
      // PHP setcookie serializes scalar values, including integer room 0.
      assert.deepEqual(actual.cookies.map(cookie => [cookie.name.replace(/^bra_/, ''), cookie.value, cookie.expires == null ? 0 : cookie.expires - now, 1]), expected.cookies.map(([name,value,...rest]) => [name,String(value),...rest]));
      if (actual.data?.innerHTML) assert.deepEqual(actual.data, expected.data);
      assert.equal(actual.redirect ? 'Location: ' + actual.redirect : null, expected.headers[0] ?? null);
    }
    const rows = await database.query('SELECT * FROM bra_users ORDER BY uid');
    // Compression bytes can vary between PHP zlib and Node versions. The
    // actual encoded data must decode to exactly the same source card record.
    for (const list of [rows, expected.rows]) for (const row of list) if (row.card_data) row.card_data = gdecode(row.card_data);
    assert.deepEqual(rows, expected.rows); await users.close(); await locks.close();
  }
});

test('authentication and profile writes survive connection restart and account locks serialize real requests', async t => {
  const fixture = await setup(t, 'account_restart'); if (!fixture) return;
  const { database, credentials } = fixture;
  const first = await fixture.session('user'); await first.users.insertRaw(userData('持久用户'));
  const accounts = createAccountService({ users: first.users, clock: () => now, cards: { getCardList: user => gdecode(user.card_data).map(card => card.cardid) } });
  const scope = { cuser: '持久用户', cpass: createCookiePass('password') };
  assert.equal((await accounts.authenticate(scope)).username, '持久用户');
  await assert.rejects(accounts.authenticate({ ...scope, cpass: 'wrong' }), error => error.code === 'wrong_pw');
  const competitor = await fixture.session('user'); await assert.rejects(competitor.users.fetchByUsername('持久用户'), error => error.code === 'LOCK_TIMEOUT');
  const response = await accounts.changeProfile({ opass: 'password', npass: 'new-password', rnpass: 'new-password', motto: "quote' & data", card: '999', item_auto_merge: '2', skip_opening: '1' }, { scope });
  assert.equal(response.cookies[0].value, createCookiePass('new-password'));
  await first.users.close(); await first.locks.close();
  const connection = await createDatabase(credentials);
  try {
    const reopened = await fixture.session('user', connection), restarted = createAccountService({ users: reopened.users });
    await assert.rejects(restarted.authenticate(scope), error => error.code === 'wrong_pw');
    const user = await restarted.authenticate({ ...scope, cpass: createCookiePass('new-password') });
    assert.equal(user.motto, "quote' & data"); assert.equal(user.card, '0'); assert.deepEqual(gdecode(user.u_settings), { item_auto_merge: 2, skip_opening: 1 });
    await reopened.users.close(); await reopened.locks.close();
  } finally { await connection.close(); }
});

test('user edit entry matches original PHP with real card-data decoding and user-settings cache', async t => {
  const oracle = await createAccountsOracle(t); if (!oracle) return;
  const fixture = await setup(t,'account_profile'); if (!fixture) return;
  const { database,credentials } = fixture, username = '资料用户', seed = { ...userData(username), u_settings: gencode({ existing: 'retained' }) };
  const scope = { cuser: username, cpass: createCookiePass('password') };
  const cases = [
    { mode:'edit',opass:'password',npass:'next-pass',rnpass:'next-pass',card:'0',motto:'changed',skip_opening:'1',gscroll_type:'-2' },
    { mode:'edit',opass:'wrong',npass:'next-pass',rnpass:'different',card:'900',icon:'4' },
    { mode:'edit',card:'0' },
  ];
  for (const input of cases) {
    await reset(database); await database.arrayInsert('bra_users',seed);
    const expected = oracle({ credentials, entry:'user', input, globals: scope, now, errors:resources._ERROR,info:resources._INFO });
    assert.equal(expected.error,null); await reset(database); await database.arrayInsert('bra_users',seed);
    const {users,locks} = await fixture.session('user');
    const account = createAccountService({users,clock:()=>now,cards:{getCardList:user=>Object.values(gdecode(user.card_data)).map(card=>card.cardid)}});
    const actual = await account.userPage(input,{scope});
    assert.deepEqual(actual.data,expected.data); assert.deepEqual(actual.cookies.map(cookie=>[cookie.name.replace(/^bra_/,''),cookie.value,0,1]),expected.cookies);
    const rows = await database.query('SELECT * FROM bra_users ORDER BY uid');
    for (const list of [rows,expected.rows]) for (const row of list) { row.card_data=gdecode(row.card_data); row.u_settings=gdecode(row.u_settings); }
    assert.deepEqual(rows,expected.rows); await users.close(); await locks.close();
  }
});
