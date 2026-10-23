import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { gameflowModules } from '../native/gameplay/gameflow.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const base = { tablepre: 'bra_', gamestate: 20, gametype: 0, validnum: 70, alivenum: 70, deathnum: 0, validlimit: 100, combonum: 160, now: 1000, starttime: 900, readymin: 1, gamenum: 3, gamevars: {}, teamwin_mode: [2], mode: 'original', room_id: 0, afktime: 900, hour: '11', min: '22', sec: '33' };
const op = (namespace, name, ...args) => [namespace, name, ...args];
function cases() {
  const list = [];
  const add = (label, calls, extra = {}) => list.push({ label, calls, sys: base, rows: [], ...extra });
  for (const gamestate of [0, 10, 20, 30, 40, 50]) for (const now of [839, 840, 841, 899, 900, 901]) add(`state ${gamestate}/${now}`, [op('gameflow_base', 'gamestateupdate')], { sys: { ...base, gamestate, now } });
  for (const gamevars of [{ max_opening_sec: 100 }, { max_opening_sec: 99 }, { max_player: '70' }, { max_player: '71' }, { max_player: '70.9' }, { max_player: 0 }, { max_player: '70tail' }, { max_player: 'invalid' }]) add('join limits', [op('gameflow_base', 'check_game_stop_joining_base')], { sys: { ...base, gamevars } });
  for (const gametype of [0, 2, 7]) for (const validnum of [0, 19, 20, 21]) for (const change of ['+12', '-3.9', '=99', '+2e2tail', '=bad', 'other']) add('combo formula', [op('gameflow_combo', 'calculate_combonum'), op('gameflow_combo', 'calculate_combonum', 1)], { sys: { ...base, gametype, validnum, gamevars: { combonum: change } } });
  for (const [gamestate, alivenum, deathnum] of [[20, 100, 159], [20, 100, 160], [20, 100, 240], [30, 50, 0], [30, 51, 0], [40, 1, 999]]) add('combo transition', [op('gameflow_combo', 'checkcombo', 777)], { sys: { ...base, gamestate, alivenum, deathnum } });
  for (const gamestate of [20, 30, 40, 50]) {
    add('duel transition', [op('gameflow_duel', 'duel', 0, '禁区解除钥匙'), op('gameflow_duel', 'duel', 888, 'key')], { sys: { ...base, gamestate } });
    add('encounter chain', ['search', 'move', 'other'].map(mode => op('gameflow_duel', 'calculate_meetman_rate', mode)).concat([op('gameflow_combo', 'discover_player_filter_corpse', { hp: 0 }), op('gameflow_duel', 'discover_player_filter_alive', { type: 1 }), op('gameflow_duel', 'discover_player_filter_alive', { type: 0 }), op('gameflow_combo', 'calculate_real_trap_obbs')]), { sys: { ...base, gamestate } });
    for (const team of [false, true]) for (const gametype of [0, 2]) add('team hooks', [op('gameflow_combo', 'senditem_check', { pid: 2 }), op('gameflow_combo', 'findteam', { pid: 2 }), op('gameflow_combo', 'teammake', 'team', 'test-value'), op('gameflow_combo', 'teamjoin', 'team', 'test-value'), op('gameflow_combo', 'teamquit'), op('gameflow_combo', 'check_team_button_exist')], { team, sys: { ...base, gamestate, gametype } });
  }
  for (const rows of [[], [{ teamID: '' }], [{ teamID: '' }, { teamID: '' }], [{ teamID: '甲' }, { teamID: '甲' }], [{ teamID: '甲' }, { teamID: '乙' }], [{ teamID: '01' }, { teamID: '1' }]]) add('team ending', [op('gameflow_base', 'checkendgame')], { sys: { ...base, gamestate: 40, gametype: 2 }, rows });
  for (const second of ['1e309', '2e309', '10e308']) add('overflow numeric-looking team names', [op('gameflow_base', 'checkendgame')], { sys: { ...base, gamestate: 40, gametype: 2 }, rows: [{ teamID: '1e309' }, { teamID: second }] });
  for (const gametype of [0, 2]) for (const alivenum of [0, 1, 2]) add('solo ending', [op('gameflow_base', 'checkendgame')], { sys: { ...base, gamestate: 40, gametype, alivenum }, rows: [] });
  for (const gamestate of [0, 20]) add('count actual players', [op('gameflow_base', 'update_valid_alivenum'), op('gameflow_base', 'check_valid_alivenum_single', { hp: '0' }), op('gameflow_base', 'check_valid_alivenum_single', { hp: '1' })], { sys: { ...base, gamestate }, rows: [{ hp: '1' }, { hp: '0' }, { hp: '-1' }, { hp: 50 }] });
  add('reset extension order', [op('gameflow_combo', 'reset_game')]);
  add('post area order', [op('gameflow_combo', 'post_addarea_process', 888, [4, 5])], { sys: { ...base, gamestate: 30, alivenum: 1 } });
  for (const room_id of [0, 1]) for (const gamestate of [20, 40]) for (const now of [1500, 1501]) for (const wave of [0, 1]) add('antiAFK trigger boundary', [op('gameflow_antiafk', 'get_antiAFKertime'), op('gameflow_antiafk', 'check_triggered_antiAFK')], { sys: { ...base, room_id, gamestate, now }, wave });
  add('antiAFK disabled', [op('gameflow_antiafk', 'check_triggered_antiAFK')], { sys: { ...base, gamestate: 50, now: 9999, gamevars: { forbid_antiAFK: 1 } } });
  for (const rows of [[], [{ pid: '2', name: '乙', pls: '7' }, { pid: '3', name: '丙', pls: '0' }]]) for (const alivenum of [0, 10]) add('antiAFK writes', [op('gameflow_antiafk', 'antiAFK')], { sys: { ...base, now: 1600, alivenum }, rows });
  add('antiAFK before predecessor update', [op('gameflow_base', 'gamestateupdate')], { sys: { ...base, gamestate: 40, now: 1600 }, rows: [{ pid: '2', name: '乙', pls: '7' }] });
  add('full update chain', [op('gameflow_base', 'updategame')], { rows: [{ hp: 1 }, { hp: 2 }] });
  for (const kind of ['combo', 'comboupdate', 'duel', 'duelkey', 'death32', 'other']) add('news', [op('gameflow_antiafk', 'parse_news', 5, kind, '01', '02', '03', '甲', '钥匙', 7, '', '', [])]);
  return list;
}
function normalize(value) {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value.map(normalize);
  if (value !== null && typeof value === 'object') return Object.keys(value).length ? Object.fromEntries(Object.entries(value).map(([key, child]) => [key, normalize(child)])) : [];
  return value;
}
function dependencies(input, trace) {
  const effect = name => (ctx, ...args) => { trace.push([name, ...structuredClone(args)]); };
  return [
    { name: 'sys', state: input.sys, functions: { reset_game: effect('reset'), updategame: effect('update'), save_gameinfo: effect('save'), prepare_new_game: effect('prepare'), rs_game: effect('rs_game'), addnews: effect('news'), systemputchat: effect('chat'), gameover: effect('gameover'), parse_news(ctx, ...args) { trace.push(['parse', ...args]); return 'old news'; } } },
    { name: 'map', state: { plsinfo: { 0: '禁区', 7: '学校' } }, functions: { get_area_wavenum() { return input.wave ?? 1; }, post_addarea_process: effect('post_area') } },
    { name: 'player', state: { name: '甲' } }, { name: 'logger', state: { log: '' } },
    { name: 'metman', functions: { calculate_meetman_rate(ctx, mode) { trace.push(['rate', mode]); return 30; }, discover_player_filter_corpse(ctx, data) { trace.push(['corpse', data]); return true; }, discover_player_filter_alive(ctx, data) { trace.push(['alive', data]); return true; } } },
    { name: 'trap', functions: { calculate_real_trap_obbs() { trace.push(['trap']); return 5; } } },
    ...(input.team ? [{ name: 'team', functions: { senditem_check(ctx, data) { trace.push(['send', data]); return true; }, findteam: effect('findteam'), teammake: effect('teammake'), teamjoin: effect('teamjoin'), teamquit: effect('teamquit'), check_team_button_exist() { trace.push(['button']); return 1; } } }] : []),
  ];
}
async function actual(input) {
  const trace = [];
  const session = await new ModuleRegistry([...dependencies(input, trace), ...gameflowModules]).createSession({ services: {
    database: { async query(sql) { trace.push(['query', sql]); return structuredClone(input.rows); }, async multi_update(...args) { trace.push(['multi', ...structuredClone(args)]); } },
  } });
  const results = [];
  for (const [namespace, method, ...args] of input.calls) results.push(await session.call(namespace, method, ...structuredClone(args)));
  return normalize({ results, sys: session.state('sys'), log: session.state('logger').log, trace });
}

const fixture = String.raw`<?php
namespace sys {
 function reset_game(){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['reset'];}
 function updategame(){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['update'];}
 function save_gameinfo(){$GLOBALS['trace'][]=['save'];}
 function prepare_new_game(){$GLOBALS['trace'][]=['prepare'];}
 function rs_game(...$args){$GLOBALS['trace'][]=array_merge(['rs_game'],$args);}
 function addnews(...$args){$GLOBALS['trace'][]=array_merge(['news'],$args);}
 function systemputchat(...$args){$GLOBALS['trace'][]=array_merge(['chat'],$args);}
 function gameover(){$GLOBALS['trace'][]=['gameover'];}
 function parse_news(...$args){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=array_merge(['parse'],$args);return 'old news';}
}
namespace map {
 function get_area_wavenum(){return $GLOBALS['input']['wave']??1;}
 function post_addarea_process(...$args){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=array_merge(['post_area'],$args);}
}
namespace metman {
 function calculate_meetman_rate($mode){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['rate',$mode];return 30;}
 function discover_player_filter_corpse(&$data){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['corpse',$data];return true;}
 function discover_player_filter_alive(&$data){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['alive',$data];return true;}
}
namespace trap {function calculate_real_trap_obbs(){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['trap'];return 5;}}
namespace team {
 function senditem_check($data){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['send',$data];return true;}
 function findteam(&$data){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['findteam',$data];}
 function teammake(...$args){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=array_merge(['teammake'],$args);}
 function teamjoin(...$args){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=array_merge(['teamjoin'],$args);}
 function teamquit(){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['teamquit'];}
 function check_team_button_exist(){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['button'];return 1;}
}
namespace {
 define('IN_GAME',true);define('IN_MODULEMNG',true);define('GAME_ROOT',__DIR__.'/engine/');
 require GAME_ROOT.'include/global.func.php';require GAME_ROOT.'include/modules/modules.func.php';
 $input=json_decode(stream_get_contents(STDIN),true);if(!empty($input['team']))define('MOD_TEAM',true);
 foreach(['base','combo','duel','antiafk'] as $name){$root=GAME_ROOT.'include/modules/core/gameflow/gameflow_'.$name.'/';require $root.'main.php';if(file_exists($root.'config/gameflow_'.$name.'.config.php'))require $root.'config/gameflow_'.$name.'.config.php';}
 class Database {public $offset=0;function query($sql){$GLOBALS['trace'][]=['query',$sql];$this->offset=0;return $GLOBALS['input']['rows'];}function fetch_array($rows){return $rows[$this->offset++]??false;}function num_rows($rows){return count($rows);}function multi_update(...$args){$GLOBALS['trace'][]=array_merge(['multi'],$args);}}
 $defaults=get_defined_vars();$states=['sys'=>$input['sys'],'player'=>['name'=>'甲'],'map'=>['plsinfo'=>[0=>'禁区',7=>'学校']],'logger'=>['log'=>'']];$states['sys']['db']=new Database;
 foreach($input['configKeys'] as $name=>$keys){$states[$name]=[];foreach($keys as $key)$states[$name][$key]=$defaults[$key];}
 foreach($states as $mod=>$state){$imp='';foreach($state as $key=>$value){$global='___LOCAL_'.strtoupper($mod).'__VARS__'.$key;$GLOBALS[$global]=$value;$imp.='$'.$key.' = & $GLOBALS["'.$global.'"];';}define('IMPORT_MODULE_'.strtoupper($mod).'_GLOBALS',$imp);}
 foreach($input['order'] as $mod)foreach(get_defined_functions()['user'] as $fn)if(strpos($fn,$mod.'\\')===0&&$fn!==$mod.'\\init')hook_register($mod,substr($fn,strlen($mod)+1));
 $trace=[];$results=[];foreach($input['calls'] as $entry){$fn=$entry[0].'\\'.$entry[1];$args=array_slice($entry,2);$results[]=$fn(...$args);}
 $out=[];foreach($input['sys'] as $key=>$value)$out[$key]=$GLOBALS['___LOCAL_SYS__VARS__'.$key];echo json_encode(['results'=>$results,'sys'=>$out,'log'=>$GLOBALS['___LOCAL_LOGGER__VARS__log'],'trace'=>$trace],JSON_UNESCAPED_UNICODE);
}`;

test('game preparation, combo, duel and antiAFK match original PHP chains', { timeout: 90_000 }, async t => {
  const php = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', timeout: 10_000, windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires PHP 7.4 reference.'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true }); const root = await mkdtemp(path.join(parent, 'native-gameflow-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  const sources = ['include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', 'include/modules/modules.func.php'];
  for (const name of ['base', 'combo', 'duel', 'antiafk']) sources.push(`include/modules/core/gameflow/gameflow_${name}/main.php`);
  for (const name of ['combo', 'antiafk']) sources.push(`include/modules/core/gameflow/gameflow_${name}/config/gameflow_${name}.config.php`);
  for (const source of sources) { const target = path.join(root, 'engine', source); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', source), target); }
  await mkdir(path.join(root, 'engine/include/modulemng'), { recursive: true }); await copyFile(path.join(project, 'engine/include/modulemng/modulemng.config.sample.php'), path.join(root, 'engine/include/modulemng/modulemng.config.php'));
  const filename = path.join(root, 'reference.php'); await writeFile(filename, fixture);
  const scenarios = cases();
  const configKeys = Object.fromEntries(gameflowModules.filter(module => module.state).map(module => [module.name, Object.keys(typeof module.state === 'function' ? module.state() : module.state)]));
  for (const input of scenarios) {
    const order = new ModuleRegistry([...dependencies(input, []), ...gameflowModules]).order;
    const result = spawnSync(php, ['-d', 'display_errors=stderr', filename], { input: JSON.stringify({ ...input, order, configKeys }), encoding: 'utf8', timeout: 15_000, windowsHide: true });
    assert.equal(result.status, 0, result.stderr); assert.equal(result.stderr, '', input.label);
    assert.deepEqual(await actual(input), JSON.parse(result.stdout), `${input.label}: ${JSON.stringify(input.sys)}`);
  }
  t.diagnostic(`Compared ${scenarios.length} PHP sequences, transition thresholds, chained encounter/team rules, original SQL/news order and AFK boundary.`);
});

test('antiAFK updates only eligible original-schema players in a real isolated database', async t => {
  const isolated = await isolatedDatabase(t, 'gameflow'); if (!isolated) return;
  await isolated.database.queries(await readFile(path.join(project, 'engine/gamedata/sql/players.sql'), 'utf8'));
  const players = [
    { pid: 1, name: '失联', type: 0, hp: 100, state: 0, endtime: 399, pls: 7 },
    { pid: 2, name: '边界', type: 0, hp: 100, state: 0, endtime: 400, pls: 7 },
    { pid: 3, name: '已死', type: 0, hp: 0, state: 23, endtime: 0, pls: 7 },
    { pid: 4, name: 'NPC', type: 1, hp: 100, state: 0, endtime: 0, pls: 7 },
    { pid: 5, name: '状态限制', type: 0, hp: 100, state: 10, endtime: 0, pls: 7 },
  ];
  await isolated.database.arrayInsert('bra_players', players);
  const input = { sys: { ...base, alivenum: 4 }, rows: [] }, trace = [];
  const session = await new ModuleRegistry([...dependencies(input, trace), ...gameflowModules]).createSession({ services: { database: isolated.database } });
  await session.call('gameflow_antiafk', 'antiAFK', 10);
  const rows = await isolated.database.query('SELECT pid,hp,state FROM bra_players ORDER BY pid');
  assert.deepEqual(rows.map(row => [row.pid, row.hp, row.state]), [['1','0','32'], ['2','100','0'], ['3','0','23'], ['4','100','0'], ['5','100','10']]);
  assert.equal(session.state('sys').alivenum, 3); assert.equal(session.state('sys').deathnum, 1); assert.equal(session.state('sys').afktime, 1000);
  assert.deepEqual(trace, [['news',1000,'death32','失联','', '7','',''],['save']]);
  await session.call('gameflow_antiafk', 'antiAFK', 10);
  assert.equal(trace.length, 2, 'no eligible rows: no repeated news, count mutation or save');
});
