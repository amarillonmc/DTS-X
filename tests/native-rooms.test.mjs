import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createRoomService, roomIsSubroom, roomPrefixKind, roomPrefixToId, roomIdToPrefix } from '../native/system/rooms.mjs';
import snapshot from '../native/system/room-config.json' with { type: 'json' };
import { isolatedDatabase } from './helpers/native-database.mjs';
import { installNative } from '../native/install/installer.mjs';
import { createDatabase } from '../native/storage/database.mjs';
import { createFileServices } from '../native/storage/files.mjs';
import { createLockServices } from '../native/storage/locks.mjs';
import { gdecode } from '../native/protocol/codec.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const canonical = value => value == null ? null : typeof value !== 'object' ? value : Object.fromEntries(Object.entries(value).map(([key, item]) => [key, canonical(item)]));
const seat = (name = '', forbidden = 0, ready = 0, leader = 0) => ({ name, forbidden, ready, leader });

test('room snapshot matches unchanged original configuration bytes', async () => {
  const bytes = await readFile(new URL('../' + snapshot.source, import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), snapshot.sha256);
});

test('native room creation, readiness, chat broadcasts and reload use the real original database tables', { timeout: 60000 }, async t => {
  const fixture = await isolatedDatabase(t, 'rooms'); if (!fixture) return;
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true }); const root = await mkdtemp(path.join(parent, 'native-rooms-'));
  let locks;
  t.after(async () => { await locks?.close(); assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  await installNative({ database: fixture.database, stateRoot: root, admin: { username: '房间测试', password: 'RoomFixtureOnly!' } });
  locks = await createLockServices(root);
  const files = await createFileServices({ stateRoot: root, sourceRoot: path.join(project, 'engine'), locks: locks.locks, clock: () => 1700000000 });
  const state = { cuser: '房间测试', now: 1700000000, gtablepre: 'bra_', room_prefix: '', room_id: 0, tablepre: 'bra_' };
  const cookies = [], notifications = []; let output = '';
  const rooms = createRoomService({ state, database: fixture.database, files, clock: () => 1700000000,
    setCookie: (name,value) => cookies.push([name,value]), broadcast: { notify: (id,time) => notifications.push([id,time]) }, output: { write: value => { output += value; } } });
  const id = await rooms.create(0); assert.equal(id, 1); assert.equal(await files.exists('gamedata/tmp/rooms/1.txt'), true);
  let row = await rooms.fetch(id), data = gdecode(row.roomvars);
  assert.equal(row.groomstatus, '10'); assert.equal(data.player[0].name, state.cuser); assert.equal(data.player[1].name, '');
  await assert.rejects(rooms.create(0), /已经创建了1个SOLO模式房间/);
  assert.equal(await rooms.enter(id), 1); assert.equal(output, 'redirect:index.php'); assert.deepEqual(cookies, [['roomid',1]]);
  data = gdecode((await rooms.fetch(id)).roomvars); data.player[1].name = '另一名玩家';
  for (let i = 0; i < 12; i++) rooms.newChat(data, '消息' + i);
  await rooms.saveBroadcast(id, data);
  assert.equal(data.readystat, 1); assert.equal(data.kicktime, 1700000030); assert.equal(notifications.length, 2);
  const fresh = await createDatabase(fixture.credentials);
  try {
    const reloaded = gdecode((await fresh.query('SELECT roomvars FROM bra_game WHERE groomid=1'))[0].roomvars);
    assert.deepEqual(reloaded, JSON.parse(JSON.stringify(data))); assert.equal(reloaded.chatdata[9].data, '消息11'); assert.equal(reloaded.chatdata[0].data, '消息2');
    assert.equal((await fresh.query('SELECT COUNT(*) AS n FROM bra_users'))[0].n, '1');
    assert.equal((await fresh.query('SELECT COUNT(*) AS n FROM bra_game WHERE groomid=0'))[0].n, '1');
  } finally { await fresh.close(); }
  state.room_id = id; state.room_prefix = 's1'; state.tablepre = 'bra_s1_';
  assert.equal(await rooms.initializeDatabase(id), 4); assert.equal(await rooms.initializeDatabase(id), 0);
  assert.equal((await fixture.database.query('SHOW TABLES LIKE "bra_s1_players"')).length, 1);
  assert.equal((await fixture.database.query('SHOW TABLES LIKE "bra_players"')).length, 1);
});

test('room initialization, readiness, chat, options, fallback references and positions agree with source', t => {
  const cases = [];
  for (const type of Object.keys(snapshot.values.roomtypelist).map(Number)) {
    cases.push({ type, ops: [['get', 'name'], ['get', 'pnum'], ['get', 'nonexistent'], ['participants'], ['position', '甲'], ['chat', 'first'], ['chat', ''], ['chat', 'second'], ['update', 0], ['get', 'current_game_option']] });
  }
  for (const prefix of ['', '0', 's', 's0', 's01', 's-2', 's2', 'n5']) cases.push({ type: 0, prefix, ops: [['prefix', 0], ['prefix', '2']] });
  for (const names of [['甲', '乙'], ['甲', ''], ['', ''], ['0', '乙']]) for (const forbidden of [0, 1]) for (const running of [0, 1]) {
    cases.push({ type: 0, set: { player: [seat(names[0], 0, 1, 0), seat(names[1], forbidden, 0, 1)] }, ops: [['participants'], ['position', '甲'], ['team', 0], ['team', 1], ['update', running]] });
  }
  for (const ready of [0, 1]) cases.push({ type: 0, set: { player: [seat('甲', 0, ready, 0), seat('乙', 0, 0, 1)], readystat: 1, kicktime: 0 }, ops: [['kick'], ['update', 0]] });
  for (const value of [-1, 0, '0', '5', 30, 31, 'abc', '3.9']) cases.push({ type: 11, ops: [['checkoption', 'lvl', value], ['setoption', 'lvl', value], ['get', 'lvl']] });
  cases.push({ type: 0, ops: [['reference', 'name', '修改'], ['get', 'name'], ['reference', 'absent', 7], ['get', 'absent'], ['reference', 'timestamp', 5], ['tick']] });
  cases.push({ type: 4, ops: [['setoption', 'group-num', '3'], ['get', 'pnum'], ['reference', 'pnum', 30], ['get', 'pnum']] });
  const php = spawnSync(process.env.DTS_REFERENCE_PHP || 'php', [fileURLToPath(new URL('./fixtures/native-rooms.php', import.meta.url)), project], { input: JSON.stringify(cases), encoding: 'utf8', windowsHide: true, timeout: 10000 });
  if (php.error?.code === 'ENOENT') { t.skip('Development PHP oracle unavailable'); return; }
  assert.equal(php.status, 0, php.stderr);
  const expected = JSON.parse(php.stdout);
  for (let i = 0; i < cases.length; i++) {
    const item = cases[i], state = { cuser: '甲', now: 1800000000, gtablepre: 'bra_', room_prefix: item.prefix ?? '' };
    const service = createRoomService({ state, clock: () => expected[i].data.kicktime > expected[i].now ? expected[i].data.kicktime - 30 : expected[i].now });
    const data = Object.assign(service.initialize(item.type), structuredClone(item.set ?? {}));
    const methods = { chat: 'newChat', tick: 'tick', update: 'updateState', kick: 'autoKick', refresh: 'refreshTeamPositions', setoption: 'setOption', get: 'getVars', participants: 'participants', position: 'userPosition', team: 'teamHtml' };
    const returns = item.ops.map(([operation, ...args]) => {
      if (operation === 'reference') { service.getVarRef(data, args[0]).value = args[1]; return service.getVars(data, args[0]); }
      if (operation === 'checkoption') return service.checkOption(item.type, ...args);
      if (operation === 'prefix') return [service.tablePrefix(), service.tablePrefix(null, true), roomPrefixToId(state.room_prefix), roomPrefixKind(state.room_prefix), roomIsSubroom(state.room_prefix), roomIdToPrefix(args[0])];
      return service[methods[operation]](data, ...args);
    });
    assert.deepEqual(canonical({ data, returns }), canonical({ data: expected[i].data, returns: expected[i].returns }), `source room scenario ${i}`);
  }
  t.diagnostic(`${cases.length} original room state scenarios; SQL, startup, template and transport integrations are tested separately.`);
});
