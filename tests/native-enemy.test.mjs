import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { enemyModule } from '../native/gameplay/enemy.mjs';
import { playerModule } from '../native/gameplay/player.mjs';
import { loggerModule } from '../native/gameplay/logger.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { createPhp74Random } from '../native/random.mjs';
import { createDatabase } from '../native/storage/database.mjs';
import { createLockServices } from '../native/storage/locks.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const enemy = { pid: '2', name: '乙', hp: '50', pls: '7', type: '0', extension: 'enemy-local' };
const self = { pid: '1', name: '甲', hp: '100', pls: '7', type: '0' };
const defaults = {
  sys: { tablepre: 'fixture_', mode: 'command', command: '', uip: { existing: 1 } },
  player: { pid: '1', pls: '7', action: 'enemy2', sdata: self, main: 'old main', cmd: 'old command' },
  logger: { log: 'earlier log' }, map: { plsinfo: { 7: '测试地图' } }, input: {}, corpse: {},
  metman: { battle_title: 'old title', tdata: { name: 'older name' }, w_pid: null, w_name: null, w_hp: null, w_pls: null, w_type: null },
};
const normalize = value => value === undefined ? null : Array.isArray(value) ? value.map(normalize)
  : value !== null && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalize(item)])) : value;
const statesFor = input => Object.fromEntries(Object.entries(defaults).map(([module, state]) => [module, { ...structuredClone(state), ...structuredClone(input[module] ?? {}) }]));

async function native(input, changes = {}) {
  const trace = [], states = statesFor(input), edata = structuredClone(input.edata), ldata = structuredClone(input.ldata ?? self), random = createPhp74Random(input.seed ?? 42);
  let buffer = input.buffer ?? '';
  const definitions = [
    { name: 'sys', state: states.sys, functions: {
      async act() { await Promise.resolve(); trace.push(['previous', 'act']); },
      async post_act(ctx) { await Promise.resolve(); trace.push(['previous', 'post_act']); if (input.postRemove) delete ctx.state('player').sdata.keep_enemy; },
    } },
    { name: 'player', state: states.player, functions: {
      async update_sdata() { await Promise.resolve(); trace.push(['update']); },
      async fetch_playerdata_by_pid(ctx, id) { await Promise.resolve(); trace.push(['fetch', id]); return structuredClone(edata); },
    } },
    { name: 'logger', state: states.logger }, { name: 'map', state: states.map }, { name: 'input', state: states.input },
    { name: 'metman', state: states.metman, functions: {
      async init_battle(ctx, ismeet = 0) { await Promise.resolve(); trace.push(['init', ismeet]); ctx.state().tdata = { name: ctx.state().w_name }; },
      async meetman_alternative(ctx, data) { await Promise.resolve(); trace.push(['previous', 'meetman_alternative', structuredClone(data)]); data.hp = -200; },
    } },
    { name: 'corpse', state: states.corpse, functions: {
      async check_corpse_discover(ctx, data) { await Promise.resolve(); trace.push(['corpse_check', structuredClone(data)]); data.checked = 1; return input.corpseVisible ?? true; },
      async findcorpse(ctx, data) { await Promise.resolve(); trace.push(['corpse_show', structuredClone(data)]); data.shown = 1; },
    } }, enemyModule,
    { name: 'enemy_fixture', dependencies: ['enemy'], functions: {
      ...(!input.emptyBattle ? { async battle_wrapper(ctx, pa, pd, active) { await Promise.resolve(); trace.push(['battle', structuredClone(pa), structuredClone(pd), active]); pa.hp = Number(pa.hp) - 5; pd.hp = Number(pd.hp) - 10; } } : {}),
      ...(input.hook ? {
        async calculate_active_obbs(ctx, pa, pd) { await Promise.resolve(); const result = await ctx.next(pa, pd); pa.active_words += '+fixture'; pd.touched = 1; return Number(result) + input.hook.add; },
        async calculate_active_obbs_multiplier(ctx, pa, pd) { await Promise.resolve(); pa.active_words += '*fixture'; return (await ctx.next(pa, pd)) * input.hook.multiply; },
        async calculate_active_obbs_change(ctx, pa, pd, rate) { await Promise.resolve(); const result = await ctx.next(pa, pd, rate); return input.hook.final ?? result; },
      } : {}),
      ...(input.customTemplate ? { async get_battlecmd_filename() { await Promise.resolve(); return 'custom-template'; } } : {}),
    } },
  ];
  const services = { random,
    database: { async query(sql) { trace.push(['query', sql]); return input.exists === false ? [] : [structuredClone(edata)]; } },
    templates: { names: { MOD_ENEMY_BATTLECMD: 'battle-command', MOD_METMAN_MEETMAN: 'meet-page' }, async render(name, scope) {
      trace.push(['render', name, structuredClone(scope.edata), scope.w_name, scope.w_extension]);
      scope.uip.fixture = 'render mutation'; return '<b>真实模板服务的测试边界</b>';
    } },
    output: { async take() { const result = buffer; buffer = ''; return result; } }, ...changes,
  };
  const session = await new ModuleRegistry(definitions).createSession({ services, states: { enemy: input.enemy ?? {} } });
  const pair = ['calculate_active_obbs', 'calculate_active_obbs_multiplier', 'calculate_active_obbs_change', 'get_final_active_obbs', 'check_enemy_meet_active', 'battle_wrapper'];
  const args = pair.includes(input.method) ? [ldata, edata, ...(input.args ?? [])] : ['findenemy', 'meetman_alternative'].includes(input.method) ? [edata] : [];
  const result = await session.call('enemy', input.method, ...args);
  const output = { result, edata, ldata, trace, buffer, next: random.rand() };
  for (const module of ['sys', 'player', 'logger', 'metman', 'enemy']) output[module] = session.state(module);
  return normalize(output);
}

const source = String.raw`<?php
namespace sys {
 function act(){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['previous','act'];}
 function post_act(){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['previous','post_act'];if(!empty($GLOBALS['input']['postRemove'])){eval(import_module('player'));unset($sdata['keep_enemy']);}}
}
namespace player {
 function update_sdata(){$GLOBALS['trace'][]=['update'];}
 function fetch_playerdata_by_pid($id){$GLOBALS['trace'][]=['fetch',$id];return $GLOBALS['edata'];}
}
namespace metman {
 function init_battle($ismeet=0){eval(import_module('metman'));$GLOBALS['trace'][]=['init',$ismeet];$tdata=['name'=>$w_name];}
 function meetman_alternative($data){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['previous','meetman_alternative',$data];$data['hp']=-200;}
}
namespace corpse {
 function check_corpse_discover(&$data){$GLOBALS['trace'][]=['corpse_check',$data];$data['checked']=1;return $GLOBALS['input']['corpseVisible']??true;}
 function findcorpse(&$data){$GLOBALS['trace'][]=['corpse_show',$data];$data['shown']=1;}
}
namespace enemy_fixture {
 function battle_wrapper(&$pa,&$pd,$active){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['battle',$pa,$pd,$active];$pa['hp']-=5;$pd['hp']-=10;}
 function calculate_active_obbs(&$pa,&$pd){if(eval(__MAGIC__))return $___RET_VALUE;$result=$chprocess($pa,$pd);$pa['active_words'].='+fixture';$pd['touched']=1;return $result+$GLOBALS['input']['hook']['add'];}
 function calculate_active_obbs_multiplier(&$pa,&$pd){if(eval(__MAGIC__))return $___RET_VALUE;$pa['active_words'].='*fixture';return $chprocess($pa,$pd)*$GLOBALS['input']['hook']['multiply'];}
 function calculate_active_obbs_change(&$pa,&$pd,$rate){if(eval(__MAGIC__))return $___RET_VALUE;$result=$chprocess($pa,$pd,$rate);return $GLOBALS['input']['hook']['final']??$result;}
 function get_battlecmd_filename(){if(eval(__MAGIC__))return $___RET_VALUE;return 'custom-template';}
}
namespace {
 define('IN_GAME',true);define('IN_MODULEMNG',true);define('GAME_ROOT',__DIR__.'/engine/');
 require GAME_ROOT.'include/modules/modules.func.php';require GAME_ROOT.'include/modules/base/enemy/main.php';require GAME_ROOT.'include/modules/base/enemy/config/enemy.config.php';
 $input=json_decode(stream_get_contents(STDIN),true);$trace=[];$edata=$input['edata'];$ldata=$input['ldata'];
 define('MOD_ENEMY_BATTLECMD','battle-command');define('MOD_METMAN_MEETMAN','meet-page');
 class Database {function query($sql){$GLOBALS['trace'][]=['query',$sql];return ($GLOBALS['input']['exists']??true)?[1]:[];}function num_rows($rows){return count($rows);}}
 $states=$input['states'];$states['enemy']=array_replace(array_intersect_key(get_defined_vars(),array_flip($input['enemykeys'])),$input['enemy']??[]);$states['sys']['db']=new Database;
 foreach($states as $mod=>$state){$imp='';foreach($state as $key=>$value){$global='___LOCAL_'.strtoupper($mod).'__VARS__'.$key;$GLOBALS[$global]=$value;$imp.='$'.$key.' = & $GLOBALS["'.$global.'"];';}define('IMPORT_MODULE_'.strtoupper($mod).'_GLOBALS',$imp);}
 foreach(['act','post_act'] as $fn)hook_register('sys',$fn);hook_register('metman','meetman_alternative');
 foreach(get_defined_functions()['user'] as $fn)if(strpos($fn,'enemy\\')===0&&$fn!=='enemy\\init')hook_register('enemy',substr($fn,6));
 if(empty($input['emptyBattle']))hook_register('enemy_fixture','battle_wrapper');
 if(!empty($input['hook']))foreach(['calculate_active_obbs','calculate_active_obbs_multiplier','calculate_active_obbs_change'] as $fn)hook_register('enemy_fixture',$fn);
 if(!empty($input['customTemplate']))hook_register('enemy_fixture','get_battlecmd_filename');
 function template($name){$GLOBALS['renderName']=$name;return __DIR__.'/template.php';}
 mt_srand($input['seed']??42);ob_start();echo $input['buffer']??'';
 $fn='enemy\\'.$input['method'];
 if(in_array($input['method'],['calculate_active_obbs','calculate_active_obbs_multiplier','calculate_active_obbs_change','get_final_active_obbs','check_enemy_meet_active','battle_wrapper']))$result=$fn($ldata,$edata,...($input['args']??[]));
 elseif(in_array($input['method'],['findenemy','meetman_alternative']))$result=$fn($edata);
 else $result=$fn();
 $output=['result'=>$result,'edata'=>$edata,'ldata'=>$ldata,'trace'=>$trace,'buffer'=>ob_get_clean(),'next'=>mt_rand()];
 foreach(['sys','player','logger','metman','enemy'] as $mod){$output[$mod]=[];foreach($states[$mod] as $key=>$value)if($key!=='db')$output[$mod][$key]=$GLOBALS['___LOCAL_'.strtoupper($mod).'__VARS__'.$key];}
 echo json_encode($output,JSON_UNESCAPED_UNICODE);
}
`;
async function oracle(t) {
  const php = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', timeout: 10000, windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires development-only PHP 7.4 oracle.'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'native-enemy-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  for (const file of ['include/modules/modules.func.php', 'include/modules/base/enemy/main.php', 'include/modules/base/enemy/config/enemy.config.php']) {
    const target = path.join(root, 'engine', file); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', file), target);
  }
  await mkdir(path.join(root, 'engine/include/modulemng'), { recursive: true });
  await copyFile(path.join(project, 'engine/include/modulemng/modulemng.config.sample.php'), path.join(root, 'engine/include/modulemng/modulemng.config.php'));
  await writeFile(path.join(root, 'oracle.php'), source);
  await writeFile(path.join(root, 'template.php'), '<?php $GLOBALS["trace"][]=["render",$GLOBALS["renderName"],$edata,$w_name,$w_extension??null];$uip["fixture"]="render mutation";echo "<b>真实模板服务的测试边界</b>";');
  return input => {
    const result = spawnSync(php, ['-d', 'display_errors=stderr', '-d', 'error_reporting=22519', path.join(root, 'oracle.php')], { input: JSON.stringify({ ldata: self, states: statesFor(input), enemykeys: Object.keys(enemyModule.state), ...input }), encoding: 'utf8', timeout: 15000, maxBuffer: 4 * 1024 * 1024, windowsHide: true });
    assert.equal(result.status, 0, result.stderr);
    try { return JSON.parse(result.stdout); } catch { assert.fail(`Invalid PHP enemy oracle JSON: ${result.stderr}`); }
  };
}

test('native enemy preserves every encounter hook, probability stage and action branch against actual PHP', async t => {
  const reference = await oracle(t); if (!reference) return;
  const cases = [];
  const add = (label, method, extra = {}) => cases.push({ label, method, edata: structuredClone(enemy), ...extra });
  add('template name', 'get_battlecmd_filename');
  add('find uses imported enemy profile not edata', 'findenemy', { buffer: 'earlier output', metman: { w_name: 'profile name' } });
  add('find alternate template hook', 'findenemy', { customTemplate: true });
  for (const type of ['0', 0, '1', 1]) add(`base type ${typeof type} ${type}`, 'calculate_active_obbs', { edata: { ...enemy, type }, ldata: { ...self, active_words: '<:BASEVAR:>+<:BASEVAR:>' } });
  add('base multiplier', 'calculate_active_obbs_multiplier');
  add('base final changer preserves string', 'calculate_active_obbs_change', { args: ['17.5'] });
  add('empty source battle extension', 'battle_wrapper', { args: [1], emptyBattle: true });
  for (const base of [-200, 0, 1, 50, 150, 200]) for (const multiply of [0, 0.5, 2]) add(`rate clamps ${base} * ${multiply}`, 'get_final_active_obbs', { enemy: { active_obbs_pc: base }, hook: { add: 0, multiply } });
  add('final hook after additive and multiplier', 'get_final_active_obbs', { hook: { add: 10, multiply: 0.5, final: 103 } });
  add('final hook below floor', 'get_final_active_obbs', { hook: { add: 10, multiply: 0.5, final: -2 } });
  for (let seed = 0; seed < 16; seed++) for (const type of ['0', '1']) add(`seed ${seed} target ${type}`, 'check_enemy_meet_active', { seed, edata: { ...enemy, type } });
  add('encounter active preserves caller value copy', 'meetman_alternative', { enemy: { active_obbs_range: [100, 100] }, hook: { add: 0, multiply: 1 } });
  add('encounter passive changes only current reference', 'meetman_alternative', { enemy: { active_obbs_range: [0, 0] }, hook: { add: 0, multiply: 1 } });
  add('encounter dead falls through by value', 'meetman_alternative', { edata: { ...enemy, hp: '0' } });
  for (const action of ['', 'enemy2', 'menemy2', 'menu']) for (const keep of [undefined, 0, '0', 1]) add(`post ${action} keep ${keep}`, 'post_act', { player: { action, sdata: { ...self, ...(keep === undefined ? {} : { keep_enemy: keep }) } } });
  add('post applies after preceding hook', 'post_act', { postRemove: true, player: { sdata: { ...self, keep_enemy: 1 } } });
  add('enter marks current record before next hook', 'act', { sys: { command: 'enter' } });
  add('noncombat delegates', 'act');
  add('back skips SQL', 'act', { sys: { mode: 'combat', command: 'back' } });
  for (const action of ['', 'enemy', 'enemy0', 'target2', 'enemy2', '2enemy', 'enemyenemy2']) add(`combat action ${action}`, 'act', { sys: { mode: 'combat' }, player: { action } });
  add('missing target', 'act', { sys: { mode: 'combat' }, exists: false });
  add('target left map', 'act', { sys: { mode: 'combat' }, edata: { ...enemy, pls: '8' } });
  add('dead target visible corpse', 'act', { sys: { mode: 'combat' }, edata: { ...enemy, hp: '0' } });
  add('dead target hidden corpse', 'act', { sys: { mode: 'combat' }, edata: { ...enemy, hp: '-1' }, corpseVisible: false });
  for (const input of cases) await t.test(input.label, async () => assert.deepEqual(await native(input), reference(input)));
});

test('native enemy source function inventory and default configuration remain complete', async () => {
  const source = await readFile(path.join(project, 'engine/include/modules/base/enemy/main.php'), 'utf8');
  const names = [...source.matchAll(/\bfunction\s+(\w+)\s*\(/g)].map(match => match[1]).filter(name => name !== 'init').sort();
  assert.deepEqual(Object.keys(enemyModule.functions).sort(), names);
  assert.equal(names.length, 11);
  assert.deepEqual(enemyModule.state, { findenemy_active_words: '对方好像完全没有注意到你！', active_obbs_pc: 50, active_obbs_npc: 55, active_obbs_range: [10, 99] });
});

test('native enemy refuses missing production template, output, database and random services', async () => {
  const input = { method: 'findenemy', edata: enemy };
  await assert.rejects(native(input, { templates: undefined }), /templates.render/);
  await assert.rejects(native(input, { output: undefined }), /output.take/);
  await assert.rejects(native({ ...input, method: 'act', sys: { mode: 'combat' } }, { database: undefined }), /database.query/);
  await assert.rejects(native({ ...input, method: 'check_enemy_meet_active' }, { random: undefined }), /request-local random/);
});

test('native enemy fetches real player records under OS locks and preserves current-player battle references', { timeout: 60000 }, async t => {
  const isolated = await isolatedDatabase(t, 'enemy'); if (!isolated) return;
  await isolated.database.queries(await readFile(path.join(project, 'engine/gamedata/sql/players.sql'), 'utf8'));
  await isolated.database.arrayInsert('bra_players', self);
  const enemyRow = { ...enemy }; delete enemyRow.extension;
  await isolated.database.arrayInsert('bra_players', enemyRow);
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true });
  const stateRoot = await mkdtemp(path.join(parent, 'native-enemy-locks-'));
  t.after(async () => { assert.ok(path.resolve(stateRoot).startsWith(path.resolve(parent) + path.sep)); await rm(stateRoot, { recursive: true, force: true }); });
  const locks = await createLockServices(stateRoot);
  let battles = 0;
  const session = await new ModuleRegistry([
    { name: 'sys', state: { tablepre: 'bra_', gtablepre: 'bra_', groomid: 1, now: 12345, mode: 'combat', command: 'attack' } },
    { name: 'map', state: { plsinfo: { 7: '测试地图' } } }, { name: 'input' }, playerModule, loggerModule,
    { name: 'metman', state: defaults.metman }, { name: 'corpse' }, enemyModule,
    // This is an explicit downstream battle boundary, not a replacement combat
    // implementation. It proves real query/fetch/locks and alias persistence.
    { name: 'battle_fixture', dependencies: ['enemy'], functions: { async battle_wrapper(ctx, pa, pd, active) {
      battles++; assert.equal(active, 1); assert.equal(pa, ctx.state('player').sdata); assert.equal(pd.pid, '2');
      pd.hp = Number(pd.hp) - 7; pa.hp = Number(pa.hp) - 4;
      await ctx.call('player', 'player_save', pa); await ctx.call('player', 'player_save', pd);
    } } },
  ]).createSession({ services: { database: isolated.database, playerLocks: locks.playerLocks, inCommand: true } });
  try {
    await session.call('player', 'load_playerdata', await session.call('player', 'fetch_playerdata_by_pid', 1));
    session.state('player').action = 'enemy2';
    await session.call('enemy', 'act'); assert.equal(battles, 1); assert.equal(session.state('player').hp, 96);
  } finally { await locks.close(); }
  const reopened = await createDatabase(isolated.credentials);
  try { assert.deepEqual((await reopened.query('SELECT pid,hp FROM bra_players ORDER BY pid')), [{ pid: '1', hp: '96' }, { pid: '2', hp: '43' }]); }
  finally { await reopened.close(); }
});
