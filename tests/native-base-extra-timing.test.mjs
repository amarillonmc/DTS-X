import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { noiseModule, cooldownModule, apmModule, openingModule } from '../native/gameplay/base-extra/timing.mjs';
import { sysGlobalFunctions } from '../native/system/sys-global.mjs';
import { gdecode, gencode } from '../native/protocol/codec.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

const project = fileURLToPath(new URL('../', import.meta.url)), modules = [noiseModule, cooldownModule, apmModule, openingModule];
const copy = value => structuredClone(value), snapshot = value => JSON.parse(JSON.stringify(value));
const defaults = { pid: '1', hp: '100', sp: '50', cdsec: '1100', cdmsec: '600', a_actionnum: '10', v_actionnum: '5', validtime: '1000', endtime: '1090', gamedata: { old: 1 }, main: 'old-main' };
const baseFunctions = { sys: ['act', 'pre_act', 'post_act', 'prepare_response_content', 'prepare_initial_response_content', 'load_gameinfo_post_work_extra', 'gameinfo_audit', 'reset_game', 'save_gameinfo_prepare_work'], explore: ['move', 'search', 'discover'], itemmain: ['itemuse_wrapper', 'itemuse'] };
function states(input = {}) {
  return { input: { ___PAGE_STARTTIME_VALUE: 1100.111 }, sys: { now: 1100, gamestate: 20, gametype: '0', command: 'enter', mode: 'other', noisevars: { noisetime: 1090, noisepls: 2, noiseid: 7, noiseid2: 8, noisemode: 'G' }, ...input.sys }, player: { ...copy(defaults), ...input.player }, map: { plsinfo: { 1: '森林', 2: '湖畔' } }, logger: { log: '' }, skillbase: { acquired: 1, skip: 0, ...input.skillbase }, explore: {}, itemmain: {}, noise: { ...noiseModule.state(), noiseinfo: { G: '枪声', D: '爆炸声' }, noisetime: 1090, noisepls: 2, noiseid: 7, noiseid2: 8, noisemode: 'G', ...input.noise }, cooldown: { ...cooldownModule.state(), ...input.cooldown }, opening: { ...openingModule.state(), ...input.opening } };
}
function boundaries(input, trace) {
  const record = (...values) => trace.push(snapshot(values));
  return Object.entries(states(input)).filter(([name]) => !modules.some(module => module.name === name)).map(([name, state]) => ({ name, state: () => state, functions: {
    ...Object.fromEntries((baseFunctions[name] ?? []).map(fn => [fn, async (ctx, ...args) => {
      record(fn, ...args);
      if (fn === 'itemuse') {
        if (input.mutation === 'decrement') args[0].itms = Number(args[0].itms) - 1;
        if (input.mutation === 'type') args[0].itms = Number(args[0].itms);
        if (input.mutation === 'hp') ctx.state('player').hp = Number(ctx.state('player').hp) + 1;
        if (input.mutation === 'hp-type') ctx.state('player').hp = Number(ctx.state('player').hp);
        if (input.mutation === 'sp') ctx.state('player').sp = Number(ctx.state('player').sp) + 1;
      }
      if (fn === 'save_gameinfo_prepare_work') return args[0];
      return fn === 'discover' ? input.discoverResult ?? false : null;
    }])),
    ...(name === 'sys' ? { async save_combatinfo(ctx) { record('save-combat', ctx.state('noise')); } } : {}),
    ...(name === 'skillbase' ? { async skill_query(ctx, id) { record('query-skill', id); return ctx.state().acquired; }, async skill_getvalue(ctx, id, key) { record('get-skill', id, key); return ctx.state().skip; }, async skill_setvalue(ctx, id, key, value) { record('set-skill', id, key, value); ctx.state().skip = value; } } : {}),
  } }));
}
const hooks = { name: 'timing_test_hooks', dependencies: ['cooldown'], functions: {
  async get_move_coldtime(ctx, destination) { const result = await ctx.next(destination); if (ctx.services.fixture.mutateReference) destination.value = '2'; return result; },
  async get_itemuse_coldtime(ctx, item) { const result = await ctx.next(item); if (ctx.services.fixture.mutateReference) item.value = '3'; return result; },
} };
async function actual(input) {
  const trace = [], registry = new ModuleRegistry([...boundaries(input, trace), ...modules, hooks]), initial = states(input);
  const session = await registry.createSession({ states: Object.fromEntries(modules.filter(module => module.state).map(module => [module.name, initial[module.name]])), services: { fixture: input, system: { request: { daemon: input.daemon ?? false, pageStartTime: input.start ?? 1100.012 }, clock: { now: () => input.clock ?? 1100.234 } }, templates: { names: { MOD_OPENING_STORYBOARD_CONTAINER: 'opening.storyboard_container' } } } });
  const item = copy(input.item ?? { itms: '2' }), pa = copy(input.pa ?? { ...defaults }), game = copy(input.game ?? { noisevars: { retained: 7 }, extra: 9 });
  if (input.itemAlias) Object.defineProperty(item, 'itms', { enumerable: true, get: () => session.state('player').itms1, set: value => { session.state('player').itms1 = value; } });
  const returns = [];
  for (const [namespace, fn, ...args] of input.calls) returns.push(await session.call(namespace, fn, ...args.map(value => value === '@item' ? item : value === '@pa' ? pa : value === '@game' ? game : copy(value))) ?? null);
  return snapshot({ returns, item, pa, game, states: Object.fromEntries(Object.keys(initial).map(name => [name, session.state(name)])), trace });
}
function scenarios() {
  const result = [], add = (label, calls, values = {}) => result.push({ label, calls, ...values }), op = (name, fn, ...args) => [name, fn, ...args];
  for (const elapsed of [-1, 0, 59, 60, 299, 300, 301]) for (const pid of ['1', '7', '8']) for (const hp of ['0', '1']) add(`noise ${elapsed}/${pid}/${hp}`, [op('noise', 'pre_act')], { sys: { now: 1090 + elapsed }, player: { pid, hp } });
  for (const values of [{}, { noisetime: null, noisepls: '0', noiseid: false, noiseid2: '', noisemode: '0' }, { noisetime: 19, noiseid: -1, noiseid2: 0, noisemode: '' }]) add('noise audit ' + JSON.stringify(values), [op('noise', 'gameinfo_audit'), op('noise', 'save_gameinfo_prepare_work', '@game', 0), op('noise', 'reset_game')], { noise: values });
  for (const vars of [{ noisemode: 'D', noiseid: '1', noisepls: '2', now: 1200 }, {}, { noiseid: 2, absent: 4 }]) add('noise loaded ' + JSON.stringify(vars), [op('noise', 'load_gameinfo_post_work_extra'), op('noise', 'pre_act'), op('noise', 'addnoise', 1, 'G'), op('noise', 'save_gameinfo_prepare_work', '@game')], { sys: { noisevars: vars }, game: { noisevars: false, extra: 9 } });
  for (const active of [0, 1]) for (const show of [0, 1]) for (const clock of [1099.999, 1100.234, 1100.6, 1100.999, 1101]) for (const hp of ['0', '1']) add(`cooldown ${active}/${show}/${clock}/${hp}`, [op('cooldown', 'check_in_coldtime'), op('cooldown', 'move', '1'), op('cooldown', 'search'), op('cooldown', 'itemuse_wrapper', '1'), op('cooldown', 'post_act'), op('cooldown', 'prepare_initial_response_content'), op('cooldown', 'prepare_response_content')], { clock, player: { hp }, cooldown: { coldtimeon: active, showcoldtimer: show } });
  for (const daemon of [0, 1]) for (const active of [0, 1]) for (const cd of [0, '200', 650, 1234.75]) add(`forced ${daemon}/${active}/${cd}`, [op('cooldown', 'get_pstime'), op('cooldown', 'set_coldtime', cd, 1), op('cooldown', 'set_coldtime', 100), op('cooldown', 'set_coldtime', '1500'), op('cooldown', 'post_act'), op('cooldown', 'prepare_response_content')], { daemon, cooldown: { coldtimeon: active } });
  add('scalar hook argument replacement', [op('cooldown', 'move', '1'), op('cooldown', 'itemuse_wrapper', '1'), op('cooldown', 'post_act')], { clock: 1101, mutateReference: true });
  for (const mutation of ['none', 'decrement', 'type', 'hp', 'hp-type', 'sp']) for (const itemAlias of [false, true]) add(`apm item ${mutation}/${itemAlias}`, [op('apm', 'itemuse', '@item'), op('apm', 'act'), op('apm', 'discover', 'search')], { mutation, itemAlias, player: { itms1: '2' } });
  for (const state of [0, 19, 20, 50]) for (const hp of ['0', '1']) for (const end of [0, 1]) for (const validtime of ['1000', '1090', '1200']) add(`apm time ${state}/${hp}/${end}/${validtime}`, [op('apm', 'calc_apm', '@pa', end)], { sys: { gamestate: state }, pa: { ...defaults, hp, validtime } });
  for (const pa of [{}, { actionnum: 4 }, { v_actionnum: 5 }, { actionnum: 5, a_actionnum: 7 }, { v_actionnum: 5, a_actionnum: 7 }]) for (const time of [1, 30, 60, 1234]) add(`winner ${JSON.stringify(pa)}/${time}`, [op('apm', 'calc_winner_apm', '@pa', time)], { pa });
  for (const gametype of ['0', '1', '5', '13', '18', '19', '99']) for (const hp of ['0', '1']) for (const acquired of [0, 1]) for (const skip of [0, 1]) for (const command of ['enter', 'search']) add(`opening ${gametype}/${hp}/${acquired}/${skip}/${command}`, [op('opening', 'opening_by_shootings_available'), op('opening', 'prepare_initial_response_content'), op('opening', 'act'), op('opening', 'prepare_response_content')], { sys: { gametype, command }, player: { hp }, skillbase: { acquired, skip } });
  return result;
}
const oracle = String.raw`<?php
namespace {define('IN_GAME',true);define('GAME_ROOT',__DIR__.'/engine/');define('MOD_OPENING_STORYBOARD_CONTAINER','opening.storyboard_container');error_reporting(E_ALL & ~E_NOTICE);ini_set('display_errors','stderr');require GAME_ROOT.'include/global.func.php';require GAME_ROOT.'include/modules/modules.func.php';$input=json_decode(stream_get_contents(STDIN),true);function record(...$args){$GLOBALS['trace'][]=json_decode(json_encode($args),true);}foreach($input['baseFunctions'] as $module=>$functions)foreach($functions as $fn){$params=$fn==='itemuse'?'&$item':'...$args';$head=$fn==='itemuse'?'$args=[&$item];':'';$body='';if($fn==='itemuse')$body='$mutation=$GLOBALS["case"]["mutation"]??"none";if($mutation==="decrement")$item["itms"]-=1;if($mutation==="type")$item["itms"]=(int)$item["itms"];$hp=&get_var_in_module("hp","player");$sp=&get_var_in_module("sp","player");if($mutation==="hp")$hp+=1;if($mutation==="hp-type")$hp=(int)$hp;if($mutation==="sp")$sp+=1;';$ret=$fn==='save_gameinfo_prepare_work'?'$args[0]':($fn==='discover'?'($GLOBALS["case"]["discoverResult"]??false)':'null');eval('namespace '.$module.' {function '.$fn.'('.$params.'){if(eval(__MAGIC__))return $___RET_VALUE;'.$head.'\record("'.$fn.'",...$args);'.$body.'return '.$ret.';}}');}}
namespace sys {function save_combatinfo(){$noise=[];foreach($GLOBALS['case']['states']['noise'] as $key=>$v)$noise[$key]=get_var_in_module($key,'noise');\record('save-combat',$noise);}}
namespace skillbase {function skill_query($id){\record('query-skill',$id);return get_var_in_module('acquired','skillbase');}function skill_getvalue($id,$key){\record('get-skill',$id,$key);return get_var_in_module('skip','skillbase');}function skill_setvalue($id,$key,$value){\record('set-skill',$id,$key,$value);$skip=&get_var_in_module('skip','skillbase');$skip=$value;}}
namespace cooldown {function getmicrotime(){return $GLOBALS['case']['clock']??1100.234;}}
namespace timing_test_hooks {function get_move_coldtime(&$dest){if(eval(__MAGIC__))return $___RET_VALUE;$ret=$chprocess($dest);if(!empty($GLOBALS['case']['mutateReference']))$dest='2';return $ret;}function get_itemuse_coldtime(&$item){if(eval(__MAGIC__))return $___RET_VALUE;$ret=$chprocess($item);if(!empty($GLOBALS['case']['mutateReference']))$item='3';return $ret;}}
namespace {
foreach($input['modules'] as $module){require GAME_ROOT.'include/modules/base/'.$module.'/main.php';if($module!=='apm')require GAME_ROOT.'include/modules/base/'.$module.'/config/'.$module.'.config.php';}
function reset_state($module,$values){foreach($values as $key=>$value)$GLOBALS['___LOCAL_'.strtoupper($module).'__VARS__'.$key]=$value;}
foreach($input['states'] as $module=>$values){$imports='';foreach($values as $key=>$value){$global='___LOCAL_'.strtoupper($module).'__VARS__'.$key;$imports.='global $'.$global.';$'.$key.'=&$'.$global.';';}define('MOD_'.strtoupper($module),true);define('IMPORT_MODULE_'.strtoupper($module).'_GLOBALS',$imports);}
foreach($input['order'] as $module)foreach(get_defined_functions()['user'] as $fn)if(strpos($fn,$module.'\\')===0&&$fn!==$module.'\\init'&&$fn!=='cooldown\\getmicrotime')hook_register($module,substr($fn,strlen($module)+1));
$out=[];foreach($input['cases'] as $case){$trace=[];foreach($case['states'] as $module=>$values)reset_state($module,$values);$cmdcdtime=&get_var_in_module('cmdcdtime','cooldown');$rmcdtime=&get_var_in_module('rmcdtime','cooldown');$cmdcdtime=$rmcdtime=0;$___MOD_SRV=$case['daemon']??0;$pagestartime=$case['start']??1100.012;$item=$case['item']??['itms'=>'2'];$pa=$case['pa']??$input['defaults'];$game=$case['game']??['noisevars'=>['retained'=>7],'extra'=>9];if(!empty($case['itemAlias']))$item['itms']=&get_var_in_module('itms1','player');$returns=[];
foreach($case['calls'] as $entry){$fn=array_shift($entry).'\\'.array_shift($entry);$args=[];foreach($entry as &$value){if($value==='@item')$args[]=&$item;elseif($value==='@pa')$args[]=&$pa;elseif($value==='@game')$args[]=&$game;else $args[]=&$value;}unset($value);$returns[]=call_user_func_array($fn,$args);}
$state=[];foreach($case['states'] as $module=>$values){$state[$module]=[];foreach($values as $key=>$value)$state[$module][$key]=get_var_in_module($key,$module);if(!$state[$module])$state[$module]=(object)[];}$state['player']['gamedata']=(object)$state['player']['gamedata'];$state['sys']['noisevars']=(object)$state['sys']['noisevars'];
$out[]=json_encode(['returns'=>$returns,'item'=>$item,'pa'=>is_array($pa)&&!count($pa)?(object)$pa:$pa,'game'=>$game,'states'=>$state,'trace'=>$trace],JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);unset($item);
}echo '['.implode(',',$out).']';}
`;

test('noise, cooldown, apm and opening preserve original inventories and configs', async () => {
  for (const module of modules) {
    const base = path.join(project, 'engine/include/modules/base', module.name), source = await readFile(path.join(base, 'main.php'), 'utf8'), header = await readFile(path.join(base, 'module.inc.php'), 'utf8');
    assert.deepEqual(Object.keys(module.functions).sort(), [...source.matchAll(/^\s*function\s+(\w+)\s*\(/gm)].map(match => match[1]).filter(name => name !== 'init').sort());
    for (const [key, field] of [['dependency', 'dependencies'], ['dependency_optional', 'optionalDependencies'], ['templatelist', 'templates']]) assert.deepEqual(module[field], header.match(new RegExp('\\$___MODULE_' + key + " = '([^']*)'"))[1].split(' ').filter(Boolean));
    if (module.name !== 'apm') { const config = JSON.parse(await readFile(path.join(project, 'native/gameplay/base-extra', module.name + '-config.json'), 'utf8')); assert.equal(createHash('sha256').update(await readFile(path.join(project, config.source))).digest('hex'), config.sha256); for (const [key, value] of Object.entries(config.values)) assert.deepEqual(module.state()[key], value); }
  }
});

test('timing, action counts, sound messages and opening agree with unchanged PHP 7.4', { timeout: 120_000 }, async t => {
  const php = process.env.DTS_REFERENCE_PHP || 'php', version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires PHP 7.4 development oracle.'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true }); const temporary = await mkdtemp(path.join(parent, 'native-base-extra-timing-'));
  try {
    const sources = ['include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', 'include/modules/modules.func.php', ...modules.flatMap(module => [`include/modules/base/${module.name}/main.php`, ...(module.name === 'apm' ? [] : [`include/modules/base/${module.name}/config/${module.name}.config.php`])])];
    for (const file of sources) { const target = path.join(temporary, 'engine', file); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', file), target); }
    await mkdir(path.join(temporary, 'engine/include/modulemng'), { recursive: true }); await writeFile(path.join(temporary, 'engine/include/modulemng/modulemng.config.php'), '<?php $___MOD_CODE_ADV2=0;$___MOD_SRV=0;');
    const cases = scenarios(), registry = new ModuleRegistry([...boundaries(cases[0], []), ...modules, hooks]);
    await writeFile(path.join(temporary, 'oracle.php'), oracle);
    const expected = spawnSync(php, [path.join(temporary, 'oracle.php')], { input: JSON.stringify({ modules: modules.map(module => module.name), baseFunctions, defaults, states: states(), order: registry.order, cases: cases.map(input => ({ ...input, states: states(input) })) }), encoding: 'utf8', windowsHide: true, timeout: 60_000, maxBuffer: 96 * 1024 * 1024 });
    assert.equal(expected.status, 0, expected.stderr); assert.equal(expected.stderr, ''); const outputs = JSON.parse(expected.stdout);
    for (const [index, input] of cases.entries()) assert.deepEqual(await actual(input), outputs[index], input.label);
    t.diagnostic(`Compared ${cases.length} PHP cases, exact logs and template names, hook order, scalar replacements, item aliases and database-string values.`);
  } finally { assert.ok(path.resolve(temporary).startsWith(path.resolve(parent) + path.sep)); await rm(temporary, { recursive: true, force: true }); }
});

test('noise survives actual combat-info database serialization and reload', async t => {
  const fixture = await isolatedDatabase(t, 'noise'); if (!fixture) return;
  const database = fixture.database;
  await database.execute('CREATE TABLE test_game (groomid int PRIMARY KEY,hdamage int,hplayer varchar(255),noisevars text,arealist varchar(255),roomvars text,gamevars text)');
  const empty = gencode(new Map());
  await database.arrayInsert('test_game', { groomid: 0, hdamage: 0, hplayer: '', noisevars: empty, arealist: '1,2', roomvars: empty, gamevars: empty });
  const sys = { name: 'sys', state: () => ({ now: 1234, room_id: 0, gtablepre: 'test_', afktime: 0, alivenum: 1, deathnum: 0, noisevars: null }), functions: sysGlobalFunctions };
  const registry = new ModuleRegistry([sys, { name: 'player' }, { name: 'map' }, { name: 'logger' }, noiseModule]);
  const first = await registry.createSession({ services: { database } }); await first.call('sys', 'load_gameinfo');
  await first.call('noise', 'addnoise', '2', 'G', '7', '8');
  const stored = (await database.query('SELECT noisevars FROM test_game'))[0].noisevars, decoded = gdecode(stored);
  assert.equal(decoded.noisetime, 1234); assert.equal(decoded.noiseid, '7'); assert.equal(decoded.noisemode, 'G');
  const second = await registry.createSession({ services: { database } }); await second.call('sys', 'load_gameinfo');
  for (const key of ['noisetime', 'noisepls', 'noiseid', 'noiseid2', 'noisemode']) assert.equal(second.state('noise')[key], first.state('noise')[key]);
});
