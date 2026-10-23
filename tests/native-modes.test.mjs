import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import inventory from '../native/inventory.json' with { type: 'json' };
import roomConfig from '../native/system/room-config.json' with { type: 'json' };
import { definitions as skills, infoById } from '../native/generated/catalog.mjs';
import { definitions as remaining } from '../native/generated/remaining/catalog.mjs';
import { nativeGameplayModules } from '../native/catalog.mjs';
import { createNativeRequestHost } from '../native/http/request-host.mjs';
import { prepareInputRequest } from '../native/gameplay/input.mjs';
import { createRoomBroadcast } from '../native/system/room-poll.mjs';
import { createMaintenanceGate } from '../native/http/maintenance.mjs';
import { installNative } from '../native/install/installer.mjs';
import { createCookiePass } from '../native/accounts/primitives.mjs';
import { commandAct } from '../native/http/game-pages.mjs';
import { renderPage } from '../native/generated/pages.mjs';
import { gdecode } from '../native/protocol/codec.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const manual = new Set(nativeGameplayModules.map(module => module.name));
const additionalModules = [...skills, ...remaining].filter(module => !manual.has(module.name));
const roomModes = Object.entries(roomConfig.values.roomtypelist).filter(([, type]) => type.available)
  .map(([roomType, type]) => ({ mode: type.gtype, roomType: Number(roomType), title: type.name.replace(/<[^>]*>/g, ''),
    now: Math.max(1700000000, Number(type['available-start'] || 0) + 1) }));
const cases = [
  ...[0, 4, 6].map(mode => ({ mode, title: 'classic selection ' + mode })),
  ...[1, 7].map(mode => ({ mode, title: 'retained event ' + mode })),
  ...roomModes,
  // These three original modes are disabled in modules.list. Their tests opt
  // in to that mode (and its original difficulty/repair skills for mode 5)
  // while retaining every default enabled module;
  // no public room availability or deployed configuration is changed.
  ...[2, 3, 5].map(mode => ({ mode, enable: 'gtype' + mode, title: 'explicit optional event ' + mode })),
];

for (const scenario of cases) test(`full mode ${scenario.mode}: ${scenario.title}`, { timeout: 180000 }, async t => {
  const db = await isolatedDatabase(t, 'modes'); if (!db) return;
  const parent = path.join(root, 'var/tests'); await mkdir(parent, { recursive: true });
  const stateRoot = await mkdtemp(path.join(parent, 'native-mode-' + scenario.mode + '-'));
  const broadcast = createRoomBroadcast(), maintenance = createMaintenanceGate(), hosts = [];
  t.after(async () => {
    for (const host of hosts) await host.close(); broadcast.close(); await maintenance.close();
    assert.ok(path.resolve(stateRoot).startsWith(path.resolve(parent) + path.sep)); await rm(stateRoot, { recursive: true, force: true });
  });
  const username = '模式测试', opponent = '模式对手', password = 'ModeFixtureOnly!';
  await installNative({ database: db.database, stateRoot, admin: { username, password } });
  let now = scenario.now ?? 1700000000, roomId = 0;
  const optedIn = scenario.mode === 5 ? ['gtype5', 'skill1004', 'skill1005'] : [scenario.enable].filter(Boolean);
  const configuration = inventory.modules.map(({ name, enabled }) => ({ name, enabled: enabled || optedIn.includes(name) }));
  async function open(post = {}, pathname = '/act.php', user = username) {
    const request = { pathname, input: prepareInputRequest({ cookies: { bra_user: user, bra_pass: createCookiePass(password), bra_roomid: String(roomId) }, post, request: post }),
      server: { SERVER_PORT: '80' }, pageStartTime: now };
    const host = await createNativeRequestHost({ configuration, additionalModules, infoById, databaseOptions: db.credentials,
      sourceRoot: path.join(root, 'engine'), stateRoot, publicUrl: 'http://127.0.0.1', request, broadcast, maintenance,
      clock: { now: () => now }, randomSeed: 77, systemConfig: { gtablepre: 'bra_', gamefounder: username } });
    hosts.push(host); assert.equal((await host.accounts.authenticate(host.scope)).username, user); return host;
  }
  if (scenario.mode === 20) {
    const afterOpening = now; now = 1700000000;
    const gated = await open({}, '/login.php');
    await assert.rejects(gated.rooms.create(scenario.roomType), /暂不能使用/, 'Future opening remains unavailable before its original timestamp');
    await gated.close(); now = afterOpening;
  }
  let host = await open({}, '/login.php');
  await host.session.call('sys', 'load_gameinfo');
  assert.equal(configuration.filter(module => module.enabled).length, 770 + optedIn.length);
  for (const module of configuration) assert.equal(host.session.hasModule(module.name), module.enabled, module.name);
  if (scenario.mode === 14) {
    const registration = await host.accounts.register({});
    const registered = await host.accounts.register({ cmd: 'post_register', username: opponent, npass: password, rnpass: password,
      register_token: registration.data.register_token, vq_answer: registration.data.vq_question_arr.correct_i,
      gender: 'm', icon: 1, motto: '', killmsg: '', lastword: '' }, { server: { REMOTE_ADDR: '127.0.0.2' } });
    assert.equal(registered.code, null);
  }
  if (scenario.roomType != null) {
    roomId = Number(await host.rooms.create(scenario.roomType)); assert.ok(roomId > 0);
    assert.equal(Number((await host.rooms.fetch(roomId)).groomtype), scenario.roomType);
    await host.close(); host = await open({}, '/login.php');
    await host.rooms.initializeDatabase(roomId);
    assert.equal(Number(host.session.state('sys').gametype), scenario.mode);
    if (scenario.mode === 14) {
      // Prepare two occupied team-leader seats in the real room record, then
      // use both users' unchanged ready controllers to construct the game and
      // its seat/team mapping. Empty seats retain the original forbid flag.
      const room = gdecode((await host.rooms.fetch(roomId)).roomvars);
      for (let position = 0; position < room.player.length; position++) room.player[position].forbidden = position === 0 || position === 5 ? 0 : 1;
      room.player[5].name = opponent;
      await host.rooms.saveBroadcast(roomId, room); assert.equal(room.readystat, 1); await host.close();
      for (const user of [username, opponent]) {
        host = await open({ command: 'ready' }, '/roomcmd.php', user);
        await renderPage('roomcmd', host, host.scope); await host.close();
      }
      host = await open({}, '/login.php');
      await host.session.call('sys', 'load_gameinfo');
      const teamInfo = host.session.state('sys').gamevars.teamID_info;
      assert.equal(teamInfo[username], '红队'); assert.equal(teamInfo[opponent], '蓝队');
    }
  } else host.session.state('sys').gamevars.next_gametype = scenario.mode;
  const sys = host.session.state('sys'); sys.starttime = sys.now;
  // This is the original administrator preparation chain. Readiness/seat
  // commands are covered through real two-account HTTP in native-full-http.
  if (roomId) sys.groomstatus = 40;
  t.diagnostic(`mode ${scenario.mode}: original reset/resource hooks in ${roomId ? 'room ' + roomId : 'main room'}`);
  if (scenario.mode !== 14) {
    await host.session.call('gameflow_base', 'gamestate_prepare_game');
    await host.session.call('gameflow_base', 'gamestate_start_game');
    await host.session.call('sys', 'save_gameinfo');
  }
  assert.equal(Number(sys.gametype), scenario.mode); assert.ok(Number(sys.gamestate) >= 20);
  const prefix = sys.tablepre, historyPrefix = sys.wtablepre, gameNumber = Number(sys.gamenum);
  const resources = {};
  for (const table of ['players', 'mapitem', 'shopitem', 'maptrap']) {
    resources[table] = Number((await db.database.query(`SELECT COUNT(*) AS n FROM ${prefix}${table}`))[0].n);
  }
  assert.ok(resources.players > 0, 'Original NPC resources must be installed');
  const locations = await host.session.call('map', 'get_all_plsno', 1);
  assert.ok(locations.length > 0);
  if (scenario.mode === 21) assert.deepEqual(locations.map(Number), [101, 102, 103, 104]);
  if (scenario.mode === 22) assert.ok(locations.map(Number).includes(201));
  if (scenario.mode === 5) await assert.rejects(host.rooms.create(10), /暂不能使用/, 'The original disabled public room stays disabled');
  await host.enterBattlefield(username, createCookiePass(password), 'm', 1, scenario.mode === 22 ? 1201 : scenario.mode === 5 ? 182 : 0, '127.0.0.1');
  const entered = (await db.database.query(`SELECT * FROM ${prefix}players WHERE type=0 AND name='${username}'`))[0];
  assert.ok(entered); assert.ok(Number(entered.hp) > 0); assert.ok(entered.nskill);
  if (scenario.mode === 17) assert.equal(Number(entered.card), 1000);
  if (scenario.mode === 20) assert.equal(Number(entered.card), 1002);
  if (scenario.mode === 22) assert.equal(Number(entered.card), 1201);
  if (scenario.mode === 3) assert.equal(Number(entered.card), 151);
  if (scenario.mode === 5) assert.equal(Number(entered.card), 182);
  if ([13, 18, 19, 20, 22].includes(scenario.mode)) assert.equal(entered.itm5, '全恢复药剂');
  if (scenario.mode === 19) assert.equal(entered.arb, '挑战者战斗服');
  if (scenario.mode === 21) assert.equal(entered.itm6, '窥屏用头戴式显示器');
  if (scenario.mode === 22) assert.equal(entered.itm6, '梦境礼盒');
  if (scenario.mode === 14) {
    assert.equal(entered.teamID, '红队');
    await host.enterBattlefield(opponent, createCookiePass(password), 'm', 1, 0, '127.0.0.2');
    assert.equal((await db.database.query(`SELECT teamID FROM ${prefix}players WHERE name='${opponent}' AND type=0`))[0].teamID, '蓝队');
  }
  await host.close(); now += 1;
  host = await open({ mode: 'command', command: 'enter' });
  await host.session.call('sys', 'routine');
  const payload = gdecode(await commandAct(host, host.scope));
  assert.ok(payload.innerHTML?.main); assert.ok(payload.innerHTML?.cmd); assert.ok(payload.innerHTML?.cmd_interface);
  assert.equal(Number(host.session.state('sys').gametype), scenario.mode);
  const player = host.session.state('player'); assert.equal(Number(player.pid), Number(entered.pid));
  if (scenario.mode === 5) {
    assert.equal(await host.session.call('skillbase', 'skill_query', 1004), true);
    assert.equal(await host.session.call('skillbase', 'skill_query', 1005), true);
    assert.equal(Number(await host.session.call('skillbase', 'skill_getvalue', 1004, 'lvl')), 1);
    assert.equal(await host.session.call('skillbase', 'skill_getvalue', 1005, 'cur1'), '智慧果');
  }
  player.sdata.motto = '模式请求持久化' + scenario.mode;
  await host.session.call('player', 'player_save', player.sdata);
  await host.close(); now += 1;
  host = await open({ mode: 'command', command: 'menu' });
  const saved = await host.session.call('player', 'fetch_playerdata', username);
  assert.equal(saved.motto, '模式请求持久化' + scenario.mode); assert.equal(Number(saved.card), Number(entered.card));
  if (scenario.mode === 13) {
    const before = Number(host.session.state('sys').gamestate);
    await host.session.call('sys', 'gameover', 0, 'end2', username);
    assert.equal(Number(host.session.state('sys').gamestate), before, 'Ascension forbids last-survivor ending');
  }
  await host.session.call('sys', 'gameover', 0, scenario.mode === 13 ? 'end7' : 'end1', scenario.mode === 13 ? username : '');
  assert.equal(Number(host.session.state('sys').gamestate), 0);
  const history = (await db.database.query(`SELECT * FROM ${historyPrefix}history WHERE gid='${gameNumber}'`))[0];
  assert.ok(history); assert.equal(Number(history.gametype), scenario.mode); assert.equal(Number(history.vnum), scenario.mode === 14 ? 2 : 1); assert.ok(history.validlist);
  await host.close(); host = await open({}, '/login.php');
  assert.equal(Number(host.session.state('sys').gamestate), 0);
  assert.equal(Number((await db.database.query(`SELECT gametype FROM ${historyPrefix}history WHERE gid='${gameNumber}'`))[0].gametype), scenario.mode);
  t.diagnostic(`mode ${scenario.mode}: ${JSON.stringify(resources)}, real entry/action/save/reopen and ending persisted`);
});
