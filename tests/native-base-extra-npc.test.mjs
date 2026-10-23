import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { createPhp74Random } from '../native/random.mjs';
import { npcModule, npcchatModule } from '../native/gameplay/base-extra/npc.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

const project = fileURLToPath(new URL('../', import.meta.url)), modules = [npcModule, npcchatModule];
const copy = value => structuredClone(value);
function snap(value) { if (value == null || typeof value !== 'object') return value; if (Array.isArray(value) && Object.keys(value).length === value.length) return value.map(snap); return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, snap(item)])); }
const fighter = extra => ({ pid: '1', type: '0', name: '本人', state: '1', hp: '100', mhp: '100', is_counter: 0, dmg_dealt: 10, ...extra });
const newChat = { color: 'blue', meet: ['见面一', '见面二'], attackfine: ['攻击一', '攻击二'], attackhurt: ['受伤一', '受伤二'], counterfine: ['反击一', '反击二'], counterhurt: ['反击伤一', '反击伤二'], defendfine: ['防御一', '防御二'], defendhurt: ['防御伤一', '防御伤二'], kill: ['击杀一', '击杀二'], retreat: '撤退', revive: ['复活一', '复活二'], cannot_counter: '反击失败', out_of_range: '射程不足', critical: '必杀', addnpc: '加入' };
const baseFunctions = { sys: ['rs_game'], player: ['addarea_pc_process_single', 'get_player_killmsg', 'get_player_lastword'], battle: ['battle_prepare', 'cannot_counter'], attack: ['attack_prepare', 'attack_finish', 'player_kill_enemy', 'show_player_killwords', 'apply_total_damage_modifier_seckill'] };
function boundaries(input, trace) {
  const record = (...args) => trace.push(snap(copy(args)));
  return ['sys', 'map', 'player', 'lvlctl', 'battle', 'attack', 'logger', 'skillbase'].map(name => ({ name, state: () => name === 'sys' ? { now: 1100, tablepre: 'test_' } : name === 'logger' ? { log: '' } : name === 'player' ? { typeinfo: { 0: '玩家', 1: '原类型' }, killmsginfo: { 0: '原台词' }, lwinfo: { 0: '原遗言' } } : {}, functions: {
    ...Object.fromEntries((baseFunctions[name] ?? []).map(fn => [fn, async (ctx, ...args) => { record(fn, ...args); return fn === 'get_player_killmsg' ? '玩家击杀' : fn === 'get_player_lastword' ? '玩家遗言' : null; }])),
    ...(name === 'map' ? { async get_safe_plslist(ctx, noDanger = true, type = 0) { record('safe', noDanger, type); return copy(input.safe ?? [1, 21, 2, 26, 33, 34]); } } : {}),
    ...(name === 'lvlctl' ? { async calc_upexp(ctx, level) { record('exp', level); return level * 100; } } : {}),
    ...(name === 'player' ? { async player_format_with_db_structure(ctx, npc) { record('format', npc); return copy(npc); }, async post_pc_avoid_killarea(ctx, npc, time) { record('post-area', npc, time); } } : {}),
  } }));
}
async function actual(input, suppliedDatabase) {
  const trace = [], record = (...args) => trace.push(snap(copy(args))), random = createPhp74Random(input.seed ?? 42), npc = copy(input.npc ?? npcModule.state().npcinit), pa = fighter(input.pa), pd = fighter(input.pd);
  const database = suppliedDatabase ?? { async execute(sql) { record('execute', sql); }, async arrayInsert(table, data) { record('insert', table, data); }, async arrayUpdate(...args) { record('update', ...args); } };
  const session = await new ModuleRegistry([...boundaries(input, trace), ...modules]).createSession({ states: { npc: input.npcState ?? {}, npcchat: input.chatState ?? {} }, services: { random, database } });
  const returns = [];
  for (const [namespace, fn, ...args] of input.calls) returns.push(await session.call(namespace, fn, ...args.map(value => value === '@npc' ? npc : value === '@pa' ? pa : value === '@pd' ? pd : copy(value))) ?? null);
  return snap({ returns, npc, pa, pd, log: session.state('logger').log, trace, next: random.rand() });
}
function scenarios() {
  const result = [], add = (label, calls, values = {}) => result.push({ label, calls, ...values }), op = (name, fn, ...args) => [name, fn, ...args];
  for (const gd of ['m', 'r']) for (const pls of [1, 99]) for (const skill of ['17', { wp: '4', wf: 8 }]) for (const safe of [[], [1, 21, 26, 33], [34]]) add(`construct ${gd}/${pls}/${JSON.stringify(skill)}/${safe}`, [op('npc', 'init_npcdata', '@npc')], { npc: { ...npcModule.state().npcinit, gd, pls, skill, mss: '18', lvl: '4' }, safe });
  for (const type of [0, 1, 2, 14, 20]) for (const safe of [[1, 21, 2, 26, 33, 34], []]) for (const seed of [0, 1, 2, 42]) add(`safe/migrate ${type}/${safe}/${seed}`, [op('npc', 'get_safe_plslist', 1, type), op('npc', 'addarea_pc_process_single', '@pa', 1000)], { pa: { type, pls: 9 }, safe, seed });
  add('whole original npc catalog reset', [op('npc', 'rs_game', 8)]);
  add('reset without npc bit', [op('npc', 'rs_game', 7)]);
  const subs = { 2: { name: '乙' }, 4: { name: '丁' }, 7: { name: '庚' } };
  for (const count of [0, 2, 3, 4, 6]) add(`npc selection ${count}`, [op('npc', 'rs_game', 8)], { npcState: { npcinfo: { 14: { num: count, pls: 99, gd: 'r', sub: subs } } } });
  const npcState = { npc_killmsginfo: { 95: { 某人: '击杀' }, 96: '所有击杀' }, npc_lwinfo: { 95: { 某人: '遗言' }, 96: '所有遗言' }, npc_revive_info: { 95: { 某人: '复活' }, 96: '所有复活' } };
  for (const type of [0, 95, 96, 97]) for (const name of ['某人', '不在表中']) for (const hp of [0, 1]) add(`words ${type}/${name}/${hp}`, [op('npcchat', 'get_player_killmsg', '@pa'), op('npc', 'get_player_lastword', '@pa')], { npcState, pa: { type, name, hp } });
  for (const situation of ['meet', 'battle', 'kill', 'cannot_counter', 'out_of_range', 'critical', 'addnpc', 'other']) for (const attacker of [0, 1]) for (const hp of ['0', '49', '50']) for (const counter of [0, 1]) for (const modern of [false, true]) {
    const target = { type: '1', name: '林无月', hp, is_counter: counter }, chatState = modern ? { npcchat: { 1: { 林无月: newChat } } } : {};
    add(`chat ${situation}/${attacker}/${hp}/${counter}/${modern}`, [op('npcchat', 'npcchat', '@pa', '@pd', 1, situation), op('npcchat', 'npcchat', '@pa', '@pd', 1, situation, 0)], { pa: attacker ? target : {}, pd: attacker ? {} : target, chatState });
  }
  for (const fn of ['battle_prepare', 'attack_prepare', 'attack_finish', 'cannot_counter', 'player_kill_enemy', 'show_player_killwords', 'apply_total_damage_modifier_seckill']) for (const attacker of [0, 1]) for (const flag of [{}, { dmg_dealt: 0 }, { dmg_dealt: -1 }, { npc_revived: 1, npc_evolved: 1 }, { out_of_range: 0 }, { seckill: 1 }]) add(`chain ${fn}/${attacker}/${JSON.stringify(flag)}`, [op('npcchat', fn, '@pa', '@pd', 1, '击杀词')], { pa: { ...(attacker ? { type: 1, name: '林无月' } : {}), ...flag }, pd: { ...(attacker ? {} : { type: 1, name: '林无月' }), ...flag } });
  add('chat disabled', [op('npcchat', 'npcchat', '@pa', '@pd', 1, 'meet')], { pa: { type: 1, name: '林无月' }, chatState: { npcchaton: 0 } });
  add('missing NPC chat', [op('npcchat', 'npcchat', '@pa', '@pd', 1, 'meet')], { pa: { type: 999, name: '无人' } });
  return result;
}
const oracle = String.raw`<?php
namespace {define('IN_GAME',true);define('GAME_ROOT',__DIR__.'/engine/');error_reporting(E_ALL & ~E_NOTICE);ini_set('display_errors','stderr');require GAME_ROOT.'include/global.func.php';require GAME_ROOT.'include/modules/modules.func.php';$input=json_decode(stream_get_contents(STDIN),true);function record(...$args){$GLOBALS['trace'][]=json_decode(json_encode($args),true);}class FixtureDB{function query($sql){record('execute',$sql);}function array_insert(...$args){record('insert',...$args);}function array_update(...$args){record('update',...$args);}}
foreach($input['baseFunctions'] as $module=>$functions)foreach($functions as $fn){$pair=in_array($module,['attack','battle']);$params=$pair?'&$pa,&$pd,$active,$message=null':($fn==='get_player_killmsg'||$fn==='get_player_lastword'?'&$pa':'...$args');$head=$pair?'$args=func_get_args();':($params==='&$pa'?'$args=[$pa];':'');$ret=$fn==='get_player_killmsg'?"'玩家击杀'":($fn==='get_player_lastword'?"'玩家遗言'":'null');eval('namespace '.$module.' {function '.$fn.'('.$params.'){if(eval(__MAGIC__))return $___RET_VALUE;'.$head.'\record("'.$fn.'",...$args);return '.$ret.';}}');}}
namespace map {function get_safe_plslist($noDanger=true,$type=0){if(eval(__MAGIC__))return $___RET_VALUE;\record('safe',$noDanger,$type);return $GLOBALS['case']['safe']??[1,21,2,26,33,34];}}
namespace lvlctl {function calc_upexp($level){\record('exp',$level);return $level*100;}}
namespace player {function player_format_with_db_structure($npc){\record('format',$npc);return $npc;}function post_pc_avoid_killarea($npc,$time){\record('post-area',$npc,$time);}}
namespace {require GAME_ROOT.'include/modules/base/npc/main.php';require GAME_ROOT.'include/modules/base/npc/config/npc.data.config.php';require GAME_ROOT.'include/modules/base/npc/config/npc.resource.config.php';require GAME_ROOT.'include/modules/base/npcchat/main.php';require GAME_ROOT.'include/modules/base/npcchat/config/npcchat.config.php';
$configs=[];foreach($input['configKeys'] as $module=>$keys)foreach($keys as $key)$configs[$module][$key]=$$key;
function reset_state($module,$values){foreach($values as $key=>$value)$GLOBALS['___LOCAL_'.strtoupper($module).'__VARS__'.$key]=$value;}
$states=['sys'=>['now'=>1100,'tablepre'=>'test_','db'=>null],'player'=>['typeinfo'=>[0=>'玩家',1=>'原类型'],'killmsginfo'=>[0=>'原台词'],'lwinfo'=>[0=>'原遗言']],'logger'=>['log'=>''],'map'=>[],'lvlctl'=>[],'attack'=>[],'battle'=>[],'skillbase'=>[]]+$configs;
foreach($states as $module=>$values){$imports='';foreach($values as $key=>$value){$global='___LOCAL_'.strtoupper($module).'__VARS__'.$key;$imports.='global $'.$global.';$'.$key.'=&$'.$global.';';}define('MOD_'.strtoupper($module),true);define('IMPORT_MODULE_'.strtoupper($module).'_GLOBALS',$imports);}foreach($input['order'] as $module)foreach(get_defined_functions()['user'] as $fn)if(strpos($fn,$module.'\\')===0&&$fn!==$module.'\\init')hook_register($module,substr($fn,strlen($module)+1));
$out=[];foreach($input['cases'] as $case){$trace=[];foreach($states as $module=>$values)reset_state($module,$values);reset_state('npc',$case['npcState']??[]);reset_state('npcchat',$case['chatState']??[]);$db=&get_var_in_module('db','sys');$db=new FixtureDB;$typeinfo=&get_var_in_module('typeinfo','player');$killmsginfo=&get_var_in_module('killmsginfo','player');$lwinfo=&get_var_in_module('lwinfo','player');$typeinfo+=get_var_in_module('npc_typeinfo','npc');$killmsginfo+=get_var_in_module('npc_killmsginfo','npc');$lwinfo+=get_var_in_module('npc_lwinfo','npc');mt_srand($case['seed']??42);$npc=$case['npc']??$configs['npc']['npcinit'];$pa=array_merge($input['fighter'],$case['pa']??[]);$pd=array_merge($input['fighter'],$case['pd']??[]);$returns=[];
foreach($case['calls'] as $entry){$fn=array_shift($entry).'\\'.array_shift($entry);$args=[];foreach($entry as &$value){if($value==='@npc')$args[]=&$npc;elseif($value==='@pa')$args[]=&$pa;elseif($value==='@pd')$args[]=&$pd;else $args[]=&$value;}unset($value);$returns[]=call_user_func_array($fn,$args);}
$out[]=json_encode(['returns'=>$returns,'npc'=>$npc,'pa'=>$pa,'pd'=>$pd,'log'=>get_var_in_module('log','logger'),'trace'=>$trace,'next'=>rand()],JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);
}echo '['.implode(',',$out).']';}
`;

test('NPC and chat inventories and resource snapshots match original sources', async () => {
  for (const module of modules) {
    const base = path.join(project, 'engine/include/modules/base', module.name), source = await readFile(path.join(base, 'main.php'), 'utf8'), header = await readFile(path.join(base, 'module.inc.php'), 'utf8');
    assert.deepEqual(Object.keys(module.functions).sort(), [...source.matchAll(/^\s*function\s+(\w+)\s*\(/gm)].map(match => match[1]).filter(name => name !== 'init').sort());
    for (const [key, field] of [['dependency', 'dependencies'], ['dependency_optional', 'optionalDependencies'], ['templatelist', 'templates']]) assert.deepEqual(module[field], header.match(new RegExp('\\$___MODULE_' + key + " = '([^']*)'"))[1].split(' ').filter(Boolean));
    const config = JSON.parse(await readFile(path.join(project, 'native/gameplay/base-extra', module.name + '-config.json'), 'utf8')); assert.deepEqual(module.state(), config.values);
    for (const entry of config.sources) assert.equal(createHash('sha256').update(await readFile(path.join(project, entry.source))).digest('hex'), entry.sha256);
  }
});

test('original NPC population and chat hooks agree with native state and random draws', { timeout: 120_000 }, async t => {
  const php = process.env.DTS_REFERENCE_PHP || 'php', version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires PHP 7.4 development oracle.'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true }); const temporary = await mkdtemp(path.join(parent, 'native-base-extra-npc-'));
  try {
    const files = ['include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', 'include/modules/modules.func.php', 'include/modules/base/npc/main.php', 'include/modules/base/npc/config/npc.data.config.php', 'include/modules/base/npc/config/npc.resource.config.php', 'include/modules/base/npcchat/main.php', 'include/modules/base/npcchat/config/npcchat.config.php'];
    for (const file of files) { const target = path.join(temporary, 'engine', file); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', file), target); }
    await mkdir(path.join(temporary, 'engine/include/modulemng'), { recursive: true }); await writeFile(path.join(temporary, 'engine/include/modulemng/modulemng.config.php'), '<?php $___MOD_CODE_ADV2=0;$___MOD_SRV=0;');
    const cases = scenarios(), registry = new ModuleRegistry([...boundaries(cases[0], []), ...modules]); await writeFile(path.join(temporary, 'oracle.php'), oracle);
    const expected = spawnSync(php, [path.join(temporary, 'oracle.php')], { input: JSON.stringify({ modules: modules.map(module => module.name), configKeys: Object.fromEntries(modules.map(module => [module.name, Object.keys(module.state())])), baseFunctions, order: registry.order, fighter: fighter(), cases }), encoding: 'utf8', windowsHide: true, timeout: 60_000, maxBuffer: 96 * 1024 * 1024 });
    assert.equal(expected.status, 0, expected.stderr); assert.equal(expected.stderr, ''); const outputs = JSON.parse(expected.stdout);
    for (const [index, input] of cases.entries()) assert.deepEqual(await actual(input), outputs[index], input.label);
    t.diagnostic(`Compared ${cases.length} original PHP cases including the complete shipped NPC population, old/new chat formats, sparse safe-area keys, hook calls and RNG state.`);
  } finally { assert.ok(path.resolve(temporary).startsWith(path.resolve(parent) + path.sep)); await rm(temporary, { recursive: true, force: true }); }
});

test('NPC reset and forbidden-area relocation update a real isolated table', async t => {
  const fixture = await isolatedDatabase(t, 'npc'); if (!fixture) return;
  const database = fixture.database; await database.execute('CREATE TABLE test_players (pid int PRIMARY KEY AUTO_INCREMENT,type int,name varchar(255),pls int)');
  await database.execute("INSERT INTO test_players (type,name,pls) VALUES (0,'玩家',1),(2,'NPC',9)");
  await actual({ calls: [['npc', 'addarea_pc_process_single', '@pa', 1000]], pa: { pid: '2', type: '2', pls: '9' }, safe: [1, 2] }, { ...database, arrayUpdate: (...args) => database.arrayUpdate(...args) });
  const rows = await database.query('SELECT pid,type,name,pls FROM test_players ORDER BY pid'); assert.equal(rows[0].pls, '1'); assert.ok(['1', '2'].includes(rows[1].pls));
  await actual({ calls: [['npc', 'rs_game', 8]], npcState: { npcinfo: {} } }, database);
  assert.deepEqual((await database.query('SELECT name FROM test_players')).map(row => row.name), ['玩家']);
});
