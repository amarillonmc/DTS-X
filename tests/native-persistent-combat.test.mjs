import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { attackModule } from '../native/gameplay/attack.mjs';
import { battleModule } from '../native/gameplay/battle.mjs';
import { corpseModule } from '../native/gameplay/corpse.mjs';
import { exploreModule } from '../native/gameplay/explore.mjs';
import { enemyModule } from '../native/gameplay/enemy.mjs';
import { itemModule } from '../native/gameplay/items.mjs';
import { inputModule, prepareInputRequest } from '../native/gameplay/input.mjs';
import { levelModule } from '../native/gameplay/level.mjs';
import { loggerModule } from '../native/gameplay/logger.mjs';
import { mapModule } from '../native/gameplay/map.mjs';
import { metmanModule } from '../native/gameplay/metman.mjs';
import { playerModule } from '../native/gameplay/player.mjs';
import { skillbaseModule, createSkillCatalog } from '../native/gameplay/skills.mjs';
import { weaponModule } from '../native/gameplay/weapon.mjs';
import { dualWeaponModule, weaponKindModules } from '../native/gameplay/weapon-kinds.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { createPhp74Random } from '../native/random.mjs';
import { createDatabase } from '../native/storage/database.mjs';
import { createLockServices } from '../native/storage/locks.mjs';
import { createPlayerAssets } from '../native/storage/player-assets.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const playerSql = await readFile(path.join(project, 'engine/gamedata/sql/players.sql'), 'utf8');
const resetSql = await readFile(path.join(project, 'engine/gamedata/sql/reset.sql'), 'utf8');
const logSql = resetSql.match(/DROP TABLE IF EXISTS bra_log;[\s\S]*?\) ENGINE=MyISAM;/)?.[0];
assert.ok(logSql, 'Use the original log table declaration from reset.sql');
const originalOrder = (await readFile(path.join(project, 'engine/gamedata/modules.list.php'), 'utf8'))
  .split(/\r?\n/).filter(Boolean).map(line => line.split(',')[0]);
const realModules = [inputModule, playerModule, mapModule, itemModule, battleModule, attackModule, weaponModule, loggerModule, levelModule, exploreModule, metmanModule, corpseModule, enemyModule, skillbaseModule, ...weaponKindModules, dualWeaponModule];

function record(pid, changes = {}) {
  return {
    pid, name: pid === 1 ? '甲' : '乙', type: 0, hp: 1000, mhp: 1000, sp: 100, msp: 100,
    att: 120, def: 80, lvl: 8, exp: 0, pls: 3, state: 0, action: '',
    player_dead_flag: 0, killnum: 0, npckillnum: 0, gd: 'f', icon: 1,
    wep: pid === 1 ? '甲的武器' : '乙的武器', wepk: 'WG', wepe: 40, weps: 3, wepsk: '',
    wp: 60, wk: 60, wg: 60, wc: 60, wd: 60, wf: 60,
    killmsg: '胜负已分', lastword: '下次再战', nskill: '', nskillpara: '', ...changes,
  };
}

/** News/chat/game metadata and templates remain explicit test boundaries.
 * Real modules implement attack, weapons, items, player/skill storage, levels,
 * encounters, corpse loot and logger consumption; real native host services
 * supply SQL, RNG, OS locks and original icon files. The observer below only
 * records logger calls after awaiting their real implementation.
 */
function registry(events) {
  const dependencies = [
    { name: 'sys', state: () => ({
      tablepre: 'bra_', gtablepre: 'bra_', groomid: 1, now: 123456,
      nowep: '拳头', noarb: '内衣', nosta: '∞', command: '', mode: 'command',
      arealist: [0, 1, 2, 3, 4, 5], areanum: 1, areatime: 123999,
      gamestate: 30, gametype: 0, alivenum: 2, validnum: 2, deathnum: 0,
      hdamage: 0, hplayer: '', uip: {}, pdata_pool: {}, pdata_origin_pool: {}, pdata_lock_pool: {},
    }), functions: {
      async save_combatinfo(ctx) { events.push(['combat-info', ctx.state().hdamage, ctx.state().hplayer]); },
      async save_gameinfo(ctx) { events.push(['game-info', ctx.state().alivenum, ctx.state().deathnum]); },
      async addnews(ctx, ...args) { events.push(['news', ...structuredClone(args)]); },
      async addchat(ctx, ...args) { events.push(['chat', ...structuredClone(args)]); },
    } },
    { name: 'log_observer', dependencies: ['logger'], functions: {
      async logsave(ctx, pid, time, log = '', type = 's') {
        await ctx.next(pid, time, log, type);
        events.push(['logsave', pid, time, log, type]);
      },
    } },
  ];
  return new ModuleRegistry([...dependencies, ...realModules].sort((a, b) => originalOrder.indexOf(a.name) - originalOrder.indexOf(b.name)));
}

async function openRequest(credentials, stateRoot, seed, command = '') {
  const database = await createDatabase(credentials);
  let lockServices;
  try {
    lockServices = await createLockServices(stateRoot);
    const events = [];
    const session = await registry(events).createSession({ services: {
      database, playerLocks: lockServices.playerLocks, inCommand: true, random: createPhp74Random(seed),
      input: prepareInputRequest({ request: { message: '' } }),
      playerAssets: await createPlayerAssets(path.join(project, 'engine/img')), skills: createSkillCatalog(realModules),
      system: { request: { script: 'ACT' } },
      templates: { names: { MOD_METMAN_MEETMAN: 'boundary-meetman', MOD_BATTLE_BATTLERESULT: 'boundary-battle-result', MOD_CORPSE_CORPSE: 'boundary-corpse', MOD_ITEMMAIN_ITEMFIND: 'boundary-itemfind', MOD_ENEMY_BATTLECMD: 'boundary-enemy' },
        async render(name) { events.push(['template-boundary', name]); return ''; } },
      output: { async take() { return ''; } },
    } });
    session.state('sys').command = command;
    return { database, session, events, async close() { try { await lockServices.close(); } finally { await database.close(); } } };
  } catch (error) {
    try { await lockServices?.close(); } finally { await database.close(); }
    throw error;
  }
}

// Fixed source formula/RNG examples, not damage stubs: seed 6 gives rifle hit,
// fluctuation +1%, 10/10 damage, then a successful counter with +5%, 8/10.
// seed 1 gives +6%, 8/10 for rifles, and -2%, 8/10 for thrown weapons.
const cases = [
  { name: 'rifle hit and successful counter both persist', seed: 6, command: 'G',
    attacker: record(1), defender: record(2, { weps: 4 }),
    expected: { attackerHp: '924', defenderHp: '909', attackerDurability: 2, defenderDurability: 3, damage: 91, counterDamage: 76 } },
  { name: 'lethal last rifle shot preserves death state and empty magazine', seed: 1, command: 'G',
    attacker: record(1, { weps: 1 }), defender: record(2, { hp: 1, wepk: 'WK', weps: 5, money: 21, itm1: '面包', itmk1: 'HH', itme1: 5, itms1: 2, itmsk1: '' }),
    expected: { attackerHp: '1000', defenderHp: '0', attackerDurability: '∞', defenderDurability: 5, damage: 76, death: true } },
  { name: 'last thrown weapon is destroyed through itemmain and saved as fists', seed: 1, command: 'C',
    attacker: record(1, { wepk: 'WC', weps: 1 }), defender: record(2, { wepk: 'WK', weps: 5 }),
    expected: { attackerHp: '1000', defenderHp: '959', attackerDurability: '∞', defenderDurability: 5, damage: 41, destroyed: true } },
];

test('real native combat persists both players and enemy logs across closed connections and fresh sessions', { timeout: 180_000 }, async t => {
  const isolated = await isolatedDatabase(t, 'persistent_combat'); if (!isolated) return;
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true });
  const stateRoot = await mkdtemp(path.join(parent, 'native-persistent-combat-'));
  t.after(async () => {
    const absolute = path.resolve(stateRoot);
    assert.ok(absolute.startsWith(path.resolve(parent) + path.sep));
    assert.ok(path.basename(absolute).startsWith('native-persistent-combat-'));
    await rm(absolute, { recursive: true, force: true });
  });
  await isolated.database.queries(playerSql);
  await isolated.database.queries(logSql);
  for (const scenario of cases) await t.test(scenario.name, async () => {
    // These tables exist only in the database just claimed by the fixture.
    await isolated.database.execute('DELETE FROM bra_log');
    await isolated.database.execute('DELETE FROM bra_players');
    await isolated.database.arrayInsert('bra_players', scenario.attacker);
    await isolated.database.arrayInsert('bra_players', scenario.defender);
    let request = await openRequest(isolated.credentials, stateRoot, scenario.seed, scenario.command);
    let before, localLog, enemyLog, events;
    try {
      const session = request.session;
      assert.deepEqual(session.chain('playerdata_construct_process'), ['player', 'skillbase', 'itemmain']);
      assert.ok(session.chain('item_destroy_core').includes('itemmain'));
      const pa = await session.call('player', 'fetch_playerdata_by_pid', 1);
      const pd = await session.call('player', 'fetch_playerdata_by_pid', 2);
      assert.equal(pa.weps, scenario.attacker.weps, 'real itemmain normalizes DB durability for battle');
      assert.deepEqual([...session.state('sys').pdata_lock_pool.keys()], ['1', '2']);
      assert.equal(await session.call('map', 'check_can_enter', pa.pls), true);
      await session.call('player', 'load_playerdata', pa);
      await session.call('battle', 'battle_wrapper', pa, pd, 1);
      localLog = session.state('logger').log;
      enemyLog = pd.battlelog;
      before = await request.database.query('SELECT * FROM bra_players ORDER BY pid');
      events = structuredClone(request.events);
      assert.equal(String(pa.hp), scenario.expected.attackerHp);
      assert.equal(String(pd.hp), scenario.expected.defenderHp);
      assert.match(localLog, new RegExp(`造成了<span class="red b">${scenario.expected.damage}</span>点物理伤害`));
      if (scenario.expected.counterDamage) {
        assert.match(localLog, /乙的反击/);
        assert.match(enemyLog, new RegExp(`对其做出了<span class="yellow b">${scenario.expected.counterDamage}</span>点反击`));
      }
      if (scenario.expected.death) {
        assert.equal(pd.state, 23); assert.equal(pa.killnum, 1);
        assert.equal(session.state('metman').battle_title, '发现尸体');
        assert.equal(session.state('metman').tdata.isdead, true);
        assert.ok(events.some(event => event[0] === 'template-boundary' && event[1] === 'boundary-corpse'));
        assert.ok(events.some(event => event[0] === 'news' && event[2] === 'death23'));
        assert.match(enemyLog, /你被甲杀死了/);
      }
      if (scenario.expected.destroyed) {
        assert.equal(pa.wep, '拳头'); assert.equal(pa.wepk, 'WN'); assert.equal(pa.wepe, 0);
        assert.match(localLog, /用光了/);
        assert.match(localLog, /射程不足，无法反击/);
      }
      const savedLog = events.find(event => event[0] === 'logsave');
      assert.deepEqual(savedLog?.slice(1), ['2', 123456, enemyLog, 'b']);
      assert.equal(events.filter(event => event[0] === 'logsave').length, 1);
      assert.ok(Number(pa.exp) > 0, 'actual attack experience is awarded');
      assert.equal(before[0].exp, String(pa.exp), 'real lvlctl experience persists');
      await session.call('player', 'release_player_lock_from_pool');
      assert.equal(session.state('sys').pdata_lock_pool.size, 0);
    } finally {
      await request.close();
    }
    // A different mysql2 connection and a fresh registry session must recover
    // state from actual tables, never the prior request's pools or objects.
    await assert.rejects(request.database.query('SELECT 1'), /closed/);
    const oldSession = request.session;
    request = await openRequest(isolated.credentials, stateRoot, scenario.seed);
    try {
      assert.notEqual(request.session, oldSession);
      assert.equal(request.session.state('sys').pdata_pool.size, 0);
      const pa = await request.session.call('player', 'fetch_playerdata_by_pid', 1);
      const pd = await request.session.call('player', 'fetch_playerdata_by_pid', 2);
      assert.equal(pa.hp, scenario.expected.attackerHp); assert.equal(pd.hp, scenario.expected.defenderHp);
      assert.equal(pa.weps, scenario.expected.attackerDurability); assert.equal(pd.weps, scenario.expected.defenderDurability);
      assert.deepEqual(await request.database.query('SELECT * FROM bra_players ORDER BY pid'), before, 'every persisted field survives connection closure');
      const logs = await request.database.query('SELECT toid,type,time,log FROM bra_log ORDER BY lid');
      assert.equal(logs.length, 1); assert.equal(logs[0].toid, '2'); assert.equal(logs[0].type, 'b'); assert.equal(logs[0].time, '123456');
      assert.deepEqual(Buffer.from(logs[0].log, 'utf8'), Buffer.from(enemyLog, 'utf8'), 'enemy HTML is persisted byte for byte through the original log schema');
      if (scenario.expected.death) {
        assert.equal(pd.state, '23'); assert.equal(pd.player_dead_flag, '1'); assert.equal(pd.bid, '1');
        assert.equal(pd.endtime, '123456'); assert.equal(pa.killnum, '1'); assert.equal(pa.action, 'corpse2');
      } else { assert.equal(pd.player_dead_flag, '0'); assert.equal(pa.player_dead_flag, '0'); }
      if (scenario.expected.destroyed) { assert.equal(pa.wep, '拳头'); assert.equal(pa.wepk, 'WN'); assert.equal(pa.wepe, '0'); assert.equal(pa.wepsk, ''); }
      if (scenario.expected.death) {
        await request.session.call('player', 'load_playerdata', pa);
        await request.session.call('corpse', 'getcorpse', 'money');
        await request.session.call('corpse', 'getcorpse', 'itm1');
        await request.session.call('player', 'update_sdata');
        await request.session.call('player', 'player_save', request.session.state('player').sdata);
        const looted = await request.database.query('SELECT pid,money,itm1,itms1 FROM bra_players ORDER BY pid');
        assert.deepEqual(looted.map(row => [row.pid,row.money,row.itm1,row.itms1]), [['1','21','面包','2'],['2','0','','0']]);
      }
      await request.session.call('player', 'load_playerdata', pd);
      request.session.state('logger').log = '';
      await request.session.call('logger', 'pre_act');
      assert.equal(request.session.state('logger').log, `0秒前，${enemyLog}<br />`, 'real logger consumes the preserved enemy HTML');
      assert.equal((await request.database.query('SELECT lid FROM bra_log')).length, 0, 'consumed log rows are deleted from the actual table');
      await request.session.call('player', 'release_player_lock_from_pool');
    } finally {
      await request.close();
    }
  });
  await t.test('search discovers an enemy and a new request executes the real battle command', async () => {
    await isolated.database.execute('DELETE FROM bra_log');
    await isolated.database.execute('DELETE FROM bra_players');
    await isolated.database.arrayInsert('bra_players', [record(1), record(2, { weps: 4 })]);
    let request = await openRequest(isolated.credentials, stateRoot, 18, 'search');
    try {
      const pa = await request.session.call('player', 'fetch_playerdata_by_pid', 1);
      await request.session.call('player', 'load_playerdata', pa);
      await request.session.call('enemy', 'act');
      const player = request.session.state('player');
      assert.equal(player.sp, 85); assert.equal(player.action, 'enemy2');
      assert.equal(request.session.state('metman').battle_title, '发现敌人');
      assert.ok(request.events.some(event => event[0] === 'template-boundary' && event[1] === 'boundary-enemy'));
      await request.session.call('player', 'update_sdata');
      await request.session.call('player', 'player_save', player.sdata);
    } finally { await request.close(); }
    request = await openRequest(isolated.credentials, stateRoot, 6, 'G');
    try {
      const pa = await request.session.call('player', 'fetch_playerdata_by_pid', 1);
      assert.equal(pa.sp, '85'); assert.equal(pa.action, 'enemy2');
      await request.session.call('player', 'load_playerdata', pa);
      request.session.state('sys').mode = 'combat';
      await request.session.call('enemy', 'act');
      const rows = await request.database.query('SELECT pid,hp,weps,exp FROM bra_players ORDER BY pid');
      assert.deepEqual(rows.map(row => [row.pid,row.hp,row.weps]), [['1','924','2'],['2','909','3']]);
      assert.ok(rows.every(row => Number(row.exp) > 0));
      assert.equal((await request.database.query('SELECT lid FROM bra_log')).length, 1);
      assert.match(request.session.state('logger').log, /91<\/span>点物理伤害/);
    } finally { await request.close(); }
  });
  t.diagnostic('Original players/log SQL, mysql2 reopen, OS locks, real search/enemy commands, logger consumption/experience/skill storage/corpse loot and original images. Sys news/metadata, HTTP and template renderer remain boundaries.');
});
