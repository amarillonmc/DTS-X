import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { levelModule } from '../native/gameplay/level.mjs';
import { loggerModule } from '../native/gameplay/logger.mjs';
import { playerModule } from '../native/gameplay/player.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { createPhp74Random } from '../native/random.mjs';
import { createDatabase } from '../native/storage/database.mjs';
import { createLockServices } from '../native/storage/locks.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const record = extra => ({ pid: '1', name: '甲', type: '0', lvl: '1', exp: '0', hp: '80', mhp: '100', sp: '50', msp: '100', att: '20', def: '15', skillpoint: '0', upexp: '27', ...extra });
const levelKeys = Object.keys(levelModule.state);
const playerKeys = ['sdata', 'pid', 'lvl', 'exp', 'upexp', 'lvlupexp', 'db_player_structure_types'];
const phpFixture = String.raw`<?php
namespace player {
 function update_sdata() { if(eval(__MAGIC__)) return $___RET_VALUE; $GLOBALS['trace'][]=array('update'); }
 function player_save(&$pa) { if(eval(__MAGIC__)) return $___RET_VALUE; $GLOBALS['trace'][]=array('save',$pa); }
 function load_playerdata($pa) { if(eval(__MAGIC__)) return $___RET_VALUE; $GLOBALS['trace'][]=array('load',$pa,$GLOBALS['upexp']); $GLOBALS['sdata']=$pa; }
 function init_playerdata() { if(eval(__MAGIC__)) return $___RET_VALUE; $GLOBALS['trace'][]=array('init',$GLOBALS['upexp'],$GLOBALS['lvlupexp']); }
}
namespace fixture_level {
 function lvlup(&$pa) { if(eval(__MAGIC__)) return $___RET_VALUE; $chprocess($pa); $GLOBALS['lvuphp']+=3;$GLOBALS['sklog']='，额外训练'; $GLOBALS['trace'][]=array('level-hook',$pa['lvl']); }
 function get_lvllimit(&$pa) { if(eval(__MAGIC__)) return $___RET_VALUE; return $GLOBALS['input']['limit']??$chprocess($pa); }
}
namespace {
 define('IN_GAME',true); define('IN_MODULEMNG',true); define('GAME_ROOT',__DIR__.'/engine/');
 require GAME_ROOT.'include/modules/modules.func.php'; require GAME_ROOT.'include/modules/base/logger/main.php'; require GAME_ROOT.'include/modules/base/lvlctl/main.php'; require GAME_ROOT.'include/modules/base/lvlctl/config/lvlctl.config.php';
 $input=json_decode(stream_get_contents(STDIN),true);$trace=array();$now=12345;$tablepre='fixture_';$log=$input['log']??'before';
 foreach($input['level']??array() as $key=>$value) $GLOBALS[$key]=$value;
 $sdata=$input['current'];$pid=$input['currentPid']??'1';$lvl=$sdata['lvl'];$exp=$sdata['exp'];$upexp=null;$lvlupexp=null;$db_player_structure_types=array('lvl'=>$input['column']??'smallint(5) unsigned');
 define('IMPORT_MODULE_SYS_GLOBALS','global $now,$tablepre,$db;');define('IMPORT_MODULE_LOGGER_GLOBALS','global $log;');
 define('IMPORT_MODULE_PLAYER_GLOBALS','global $sdata,$pid,$lvl,$exp,$upexp,$lvlupexp,$db_player_structure_types;');
 define('IMPORT_MODULE_LVLCTL_GLOBALS','global $'.implode(',$',$input['levelKeys']).';');
 class FixtureDB { function array_insert(...$args) {$GLOBALS['trace'][]=array_merge(array('insert'),$args);} } $db=new FixtureDB();
 foreach(array('update_sdata','player_save','load_playerdata','init_playerdata') as $fn) hook_register('player',$fn);
 hook_register('logger','logsave');
 foreach(array('getexp','calc_upexp','calc_uplv','lvlup','get_lvllimit','checklvlup','load_playerdata','init_playerdata') as $fn) hook_register('lvlctl',$fn);
 if(!empty($input['hook'])) hook_register('fixture_level','lvlup'); if(isset($input['limit'])) hook_register('fixture_level','get_lvllimit');
 mt_srand($input['seed']??123);$pa=$input['pa'];$results=array();
 foreach($input['calls'] as $call) {
  $fn=array_shift($call);
  if(in_array($fn,array('getexp','checklvlup'))) { $f='lvlctl\\'.$fn; if(!empty($input['useCurrent'])) $results[]=$f($call[0]); else $results[]=$f($call[0],$pa); }
  elseif($fn==='lvlup'||$fn==='get_lvllimit') {$f='lvlctl\\'.$fn;$results[]=$f($pa);}
  elseif($fn==='load_playerdata') {$results[]=\lvlctl\load_playerdata($call[0]);}
  else {$f='lvlctl\\'.$fn;$results[]=$f(...$call);}
 }
 $level=array();foreach($input['levelKeys'] as $key)$level[$key]=$GLOBALS[$key]??null;
 $player=array();foreach($input['playerKeys'] as $key)$player[$key]=$GLOBALS[$key]??null;
 echo json_encode(array('results'=>$results,'pa'=>$pa,'level'=>$level,'player'=>$player,'log'=>$log,'trace'=>$trace,'nextRandom'=>mt_rand()),JSON_UNESCAPED_UNICODE);
}
`;

async function oracle(t) {
  const php = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', timeout: 10000, windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires development-only PHP 7.4 oracle.'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'native-level-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  for (const source of ['include/modules/modules.func.php', 'include/modules/base/logger/main.php', 'include/modules/base/lvlctl/main.php', 'include/modules/base/lvlctl/config/lvlctl.config.php']) {
    const target = path.join(root, 'engine', source); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', source), target);
  }
  await mkdir(path.join(root, 'engine/include/modulemng'), { recursive: true });
  await copyFile(path.join(project, 'engine/include/modulemng/modulemng.config.sample.php'), path.join(root, 'engine/include/modulemng/modulemng.config.php'));
  const file = path.join(root, 'oracle.php'); await writeFile(file, phpFixture);
  return input => {
    const result = spawnSync(php, ['-d', 'display_errors=stderr', '-d', 'error_reporting=22519', file], { input: JSON.stringify({ levelKeys, playerKeys, ...input }), encoding: 'utf8', timeout: 15000, maxBuffer: 4 * 1024 * 1024, windowsHide: true });
    assert.equal(result.status, 0, result.stderr);
    try { return JSON.parse(result.stdout); } catch { assert.fail(`Invalid PHP level oracle JSON: ${result.stderr}`); }
  };
}

async function native(input) {
  const trace = [], random = createPhp74Random(input.seed ?? 123);
  const definitions = [
    { name: 'sys', state: { now: 12345, tablepre: 'fixture_' } },
    { name: 'player', state: { sdata: input.current, pid: input.currentPid ?? '1', lvl: input.current.lvl, exp: input.current.exp, upexp: null, lvlupexp: null, db_player_structure_types: { lvl: input.column ?? 'smallint(5) unsigned' } }, functions: {
      async update_sdata() { trace.push(['update']); },
      async player_save(ctx, data) { trace.push(['save', structuredClone(data)]); },
      async load_playerdata(ctx, data) { trace.push(['load', structuredClone(data), ctx.state().upexp]); ctx.state().sdata = structuredClone(data); },
      async init_playerdata(ctx) { trace.push(['init', ctx.state().upexp, ctx.state().lvlupexp]); },
    } }, loggerModule, levelModule,
  ];
  if (input.hook || input.limit !== undefined) definitions.push({ name: 'fixture_level', dependencies: ['lvlctl'], functions: {
    ...(input.hook ? { async lvlup(ctx, pa) { await Promise.resolve(); await ctx.next(pa); ctx.state('lvlctl').lvuphp += 3; ctx.state('lvlctl').sklog = '，额外训练'; trace.push(['level-hook', pa.lvl]); } } : {}),
    ...(input.limit !== undefined ? { async get_lvllimit() { await Promise.resolve(); return input.limit; } } : {}),
  } });
  const session = await new ModuleRegistry(definitions).createSession({ services: { random, database: { async arrayInsert(...args) { trace.push(['insert', ...structuredClone(args)]); } } }, states: { logger: { log: input.log ?? 'before' }, lvlctl: input.level ?? {} } });
  const pa = structuredClone(input.pa), results = [];
  for (const [fn, ...args] of input.calls) {
    let result;
    if (['getexp', 'checklvlup'].includes(fn)) result = await session.call('lvlctl', fn, args[0], input.useCurrent ? null : pa);
    else if (['lvlup', 'get_lvllimit'].includes(fn)) result = await session.call('lvlctl', fn, pa);
    else result = await session.call('lvlctl', fn, ...structuredClone(args));
    results.push(result ?? null);
  }
  return { results, pa, level: Object.fromEntries(Object.entries(session.state('lvlctl'))), player: Object.fromEntries(playerKeys.map(key => [key, session.state('player')[key]])), log: session.state('logger').log, trace, nextRandom: random.rand() };
}

test('native lvlctl preserves complete source leveling, references, logging and random draw order', async t => {
  const reference = await oracle(t); if (!reference) return;
  const cases = [
    { label: 'below threshold', calls: [['getexp', 26]] },
    { label: 'exact threshold', calls: [['getexp', '27']] },
    { label: 'negative experience', calls: [['getexp', -12]] },
    { label: 'current player saves and reloads', useCurrent: true, calls: [['getexp', 80]] },
    { label: 'strict pid prevents equal numeric pid local logging', currentPid: 1, calls: [['getexp', 27]] },
    { label: 'other human receives persistent log', pa: record({ pid: '2' }), calls: [['checklvlup', 100]] },
    { label: 'NPC gets stats without message', pa: record({ pid: '2', type: '1' }), calls: [['getexp', 100]] },
    { label: 'full stamina suppresses refill', pa: record({ sp: '100' }), calls: [['getexp', 27]] },
    { label: 'stamina refill clamps to maximum', pa: record({ sp: '99' }), calls: [['getexp', 100]] },
    { label: 'tinyint level cap on increase', column: 'tinyint(3) unsigned', pa: record({ lvl: '249', exp: '4490' }), calls: [['getexp', 1000]] },
    { label: 'already at cap gains capped exp and returns zero', column: 'tinyint(3) unsigned', pa: record({ lvl: '250', exp: '1' }), calls: [['getexp', 5], ['getexp', 100000]] },
    { label: 'over-cap uses old threshold before clamp', column: 'tinyint(3) unsigned', pa: record({ lvl: '300', exp: '9000' }), calls: [['getexp', -1]] },
    { label: 'large level cap', pa: record({ lvl: '64999', exp: '1169990' }), calls: [['getexp', 100]] },
    { label: 'overridden cap and async per-level hook', hook: true, limit: 3, calls: [['getexp', 100]] },
    { label: 'standalone stat accumulator preserves prior values', level: { lvuphp: '3', lvupspref: '2', sklog: 'old' }, calls: [['lvlup']] },
    { label: 'fractional config rounding', level: { baseexp: 9.5 }, calls: [['getexp', 29], ['calc_upexp', 5.5], ['calc_uplv', 80, 29]] },
    { label: 'zero config integer casts', level: { baseexp: 0 }, calls: [['getexp', 9], ['calc_uplv', 0, 0]] },
    { label: 'load and init hook order', calls: [['load_playerdata', { ...record(), upexp: '99' }], ['init_playerdata'], ['get_lvllimit']] },
    { label: 'missing and null upexp do not overwrite', calls: [['load_playerdata', { name: '甲' }], ['load_playerdata', { upexp: null }]] },
    ...Array.from({ length: 16 }, (_, seed) => ({ label: `seed ${seed} multiple levels`, seed, calls: [['getexp', 127], ['getexp', 20]] })),
  ];
  for (const scenario of cases) await t.test(scenario.label, async () => {
    const input = { pa: record(), current: record(), ...scenario };
    assert.deepEqual(await native(input), reference(input));
  });
});

test('native level progression persists through actual player aliases, OS locks, log SQL and new connections', { timeout: 60000 }, async t => {
  const isolated = await isolatedDatabase(t, 'level'); if (!isolated) return;
  const sql = await readFile(path.join(project, 'engine/gamedata/sql/players.sql'), 'utf8');
  const reset = await readFile(path.join(project, 'engine/gamedata/sql/reset.sql'), 'utf8');
  const logSql = reset.match(/DROP TABLE IF EXISTS bra_log;[\s\S]*?\) ENGINE=MyISAM;/)?.[0]; assert.ok(logSql);
  await isolated.database.queries(sql); await isolated.database.queries(logSql);
  const base = record(); delete base.upexp;
  await isolated.database.arrayInsert('bra_players', base);
  await isolated.database.arrayInsert('bra_players', { ...base, pid: '2', name: '乙' });
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true });
  const stateRoot = await mkdtemp(path.join(parent, 'native-level-locks-'));
  t.after(async () => { assert.ok(path.resolve(stateRoot).startsWith(path.resolve(parent) + path.sep)); await rm(stateRoot, { recursive: true, force: true }); });
  const locks = await createLockServices(stateRoot);
  const definitions = [
    { name: 'sys', state: { tablepre: 'bra_', gtablepre: 'bra_', groomid: 1, now: 12345, nowep: '拳头', noarb: '内衣', nosta: '∞' } },
    { name: 'map' }, { name: 'input' }, playerModule, loggerModule, levelModule,
  ];
  const session = await new ModuleRegistry(definitions).createSession({ services: { database: isolated.database, playerLocks: locks.playerLocks, random: createPhp74Random(123), inCommand: true } });
  let gained;
  try {
    const self = await session.call('player', 'fetch_playerdata_by_pid', 1);
    await session.call('player', 'load_playerdata', self);
    assert.equal(await session.call('lvlctl', 'getexp', 80), 1);
    gained = structuredClone(session.state('player').sdata);
    assert.equal(gained.lvl, 4); assert.equal(gained.exp, 80); assert.match(session.state('logger').log, /你升了3级/);
    const other = await session.call('player', 'fetch_playerdata_by_pid', 2);
    await session.call('lvlctl', 'getexp', 27, other);
    await session.call('player', 'player_save', other);
    assert.equal((await isolated.database.query('SELECT * FROM bra_log')).length, 1);
  } finally { await locks.close(); }
  const reopened = await createDatabase(isolated.credentials);
  try {
    const rows = await reopened.query('SELECT * FROM bra_players ORDER BY pid');
    assert.equal(rows[0].lvl, '4'); assert.equal(rows[0].hp, String(gained.hp)); assert.equal(rows[0].skillpoint, '3');
    assert.equal(rows[1].lvl, '2'); assert.equal(rows[1].skillpoint, '1');
    const next = await new ModuleRegistry([{ name: 'sys', state: { tablepre: 'bra_', now: 12346 } }, { name: 'player', state: { pid: '2' }, functions: { async pre_act() {} } }, loggerModule]).createSession({ services: { database: reopened } });
    await next.call('logger', 'pre_act'); assert.match(next.state('logger').log, /1秒前，.*你升了1级/);
    assert.equal((await reopened.query('SELECT * FROM bra_log')).length, 0);
  } finally { await reopened.close(); }
});

test('native level refuses missing random source when a level must be granted', async () => {
  const session = await new ModuleRegistry([{ name: 'sys' }, { name: 'player' }, loggerModule, levelModule]).createSession();
  await assert.rejects(session.call('lvlctl', 'lvlup', record()), /request-local random/);
});
