import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { createPhp74Random } from '../native/random.mjs';
import { npcModule } from '../native/gameplay/base-extra/npc.mjs';
import { addnpcModule } from '../native/gameplay/base-extra/addnpc.mjs';
import { playerModule } from '../native/gameplay/player.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

const project = fileURLToPath(new URL('../', import.meta.url)), copy = value => structuredClone(value), snap = value => JSON.parse(JSON.stringify(value));
const fields = ['name', 'gd', 'mhp', 'msp', 'hp', 'sp', 'lvl', 'exp', 'type', 'sNo', 'pls', 'state', 'endtime', 'wp', 'wk', 'wg', 'wc', 'wd', 'wf'];
function states(input = {}) { return { sys: { now: 1100, tablepre: 'test_', hour: '11', min: '22', sec: '33', pve_ignore_mode: [1, 3, 10, 14], gametype: '0', hack: 0, gamevars: { old: 2 }, ...input.sys }, player: { name: '本人', rp: '42', typeinfo: { 0: '学生' }, killmsginfo: {}, lwinfo: {}, db_player_structure: fields }, map: { plsinfo_disp: { 1: '森林', 33: '雏菊之丘' } }, logger: { log: '' }, itemmain: {}, weather: {}, lvlctl: {}, skillbase: {} }; }
function boundaries(input, trace) {
  const record = (...args) => trace.push(snap(args));
  return Object.entries(states(input)).map(([name, value]) => ({ name, state: () => value, functions: {
    ...(name === 'sys' ? { async addnews(ctx, ...args) { record('news', ...args); }, async systemputchat(ctx, ...args) { record('chat', ...args); }, async save_gameinfo() { record('save_gameinfo'); }, async parse_news(ctx, ...args) { record('parse_news', ...args); return 'base-news'; }, async rs_game() {} } : {}),
    ...(name === 'itemmain' ? { async parse_itmuse_desc(ctx, ...args) { record('description', ...args); return '原说明/'; }, async itemuse(ctx, item) { record('itemuse', item); } } : {}),
    ...(name === 'map' ? { async get_safe_plslist(ctx, flag = true, type = 0) { record('safe', flag, type); return [1, 21, 26, 33]; } } : {}),
    ...(name === 'lvlctl' ? { async calc_upexp(ctx, level) { record('exp', level); return level * 100; } } : {}),
    ...(name === 'weather' ? { async wthchange(ctx, ...args) { record('weather', ...args); ctx.state('sys').weather = 17; } } : {}),
    ...(name === 'player' ? { async player_format_with_db_structure(ctx, data) { record('format', data); return input.strip ? await playerModule.functions.player_format_with_db_structure(ctx, data) : copy(data); }, async get_player_killmsg() {}, async get_player_lastword() {}, async addarea_pc_process_single() {}, async post_pc_avoid_killarea() {} } : {}),
  } }));
}
async function actual(input, suppliedDatabase) {
  const trace = [], random = createPhp74Random(input.seed ?? 42); let id = 100;
  const database = suppliedDatabase ?? { async arrayInsert(table, data) { trace.push(['insert', table, snap(data)]); id++; }, insert_id() { return id; } };
  const session = await new ModuleRegistry([...boundaries(input, trace), npcModule, addnpcModule]).createSession({ services: { random, database } });
  const item = copy(input.item ?? { itm: '挑战者之印', itmk: 'Y', itme: '1', itms: '3', itmsk: '属性' }), returns = [];
  for (const [fn, ...args] of input.calls) returns.push(await session.call('addnpc', fn, ...args.map(value => value === '@item' ? item : copy(value))) ?? null);
  return snap({ returns, item, sys: session.state('sys'), rp: session.state('player').rp, log: session.state('logger').log, trace, next: random.rand() });
}
function scenarios() {
  const cases = [], add = (label, calls, values = {}) => cases.push({ label, calls, ...values });
  for (const name of ['挑战者之印', '破灭之诗', '黑色碎片', '其他']) for (const kind of ['Y', 'Z', 'X']) for (const gametype of [0, 1, 3, 10, 14]) add(`item ${name}/${kind}/${gametype}`, [['parse_itmuse_desc', name, kind, '1', '3', '属性'], ['itemuse', '@item']], { strip: true, sys: { gametype }, item: { itm: name, itmk: kind, itme: '1', itms: '3', itmsk: '属性' } });
  for (const [type, sub] of [[4, 0], [7, 0], [7, 1], [7, 2], [12, 0]]) for (const count of [0, 1, 3]) for (const showPlace of [0, 1]) add(`summon ${type}/${sub}/${count}/${showPlace}`, [['addnpc', type, sub, count, showPlace, 999]], { strip: false });
  add('database formatter removes sub before second summon', [['addnpc', 7, 0, 2]], { strip: true, sourceMergeWarning: true });
  for (const news of ['addnpc', 'addnpcs', 'addnpc_pls', 'addnpcs_pls', 'secphase', 'thiphase', 'dfphase', 'hackb', 'dfsecphase', 'other']) add('news ' + news, [['parse_news', 7, news, '01', '02', '03', '角色', '3', 33, '', '', []]]);
  add('all summoning resources', [['get_addnpclist']]); return cases;
}
const oracle = String.raw`<?php
namespace {define('IN_GAME',true);define('GAME_ROOT',__DIR__.'/engine/');error_reporting(E_ALL & ~E_NOTICE);ini_set('display_errors','stderr');require GAME_ROOT.'include/global.func.php';require GAME_ROOT.'include/modules/modules.func.php';$input=json_decode(stream_get_contents(STDIN),true);function record(...$args){$GLOBALS['trace'][]=json_decode(json_encode($args),true);}set_error_handler(function($number,$message){return !empty($GLOBALS['case']['sourceMergeWarning'])&&$number===E_WARNING&&strpos($message,'array_merge(): Expected parameter 2 to be an array, null given')!==false;});class FixtureDB{public $id=100;function array_insert($table,$data){record('insert',$table,$data);$this->id++;}function insert_id(){return $this->id;}}}
namespace sys {function addnews(...$args){\record('news',...$args);}function systemputchat(...$args){\record('chat',...$args);}function save_gameinfo(){\record('save_gameinfo');}function parse_news(...$args){if(eval(__MAGIC__))return $___RET_VALUE;\record('parse_news',...$args);return 'base-news';}function rs_game($x){if(eval(__MAGIC__))return $___RET_VALUE;}}
namespace itemmain {function parse_itmuse_desc(...$args){if(eval(__MAGIC__))return $___RET_VALUE;\record('description',...$args);return '原说明/';}function itemuse(&$item){if(eval(__MAGIC__))return $___RET_VALUE;\record('itemuse',$item);}}
namespace map {function get_safe_plslist($flag=true,$type=0){if(eval(__MAGIC__))return $___RET_VALUE;\record('safe',$flag,$type);return [1,21,26,33];}}
namespace lvlctl {function calc_upexp($level){\record('exp',$level);return $level*100;}}
namespace weather {function wthchange(...$args){\record('weather',...$args);$weather=&get_var_in_module('weather','sys');$weather=17;}}
namespace player {function player_format_with_db_structure($data){\record('format',$data);if(empty($GLOBALS['case']['strip']))return $data;$result=[];foreach($GLOBALS['input']['fields'] as $key)if(isset($data[$key]))$result[$key]=$data[$key];return $result;}function get_player_killmsg(&$p){if(eval(__MAGIC__))return $___RET_VALUE;}function get_player_lastword(&$p){if(eval(__MAGIC__))return $___RET_VALUE;}function addarea_pc_process_single($p,$t){if(eval(__MAGIC__))return $___RET_VALUE;}function post_pc_avoid_killarea($p,$t){}}
namespace {require GAME_ROOT.'include/modules/base/npc/main.php';require GAME_ROOT.'include/modules/base/npc/config/npc.data.config.php';require GAME_ROOT.'include/modules/base/npc/config/npc.resource.config.php';$configs=['npc'=>[]];foreach($input['configKeys']['npc'] as $key)$configs['npc'][$key]=$$key;require GAME_ROOT.'include/modules/base/addnpc/main.php';require GAME_ROOT.'include/modules/base/addnpc/config/addnpc.config.php';foreach($input['configKeys']['addnpc'] as $key)$configs['addnpc'][$key]=$$key;
function reset_state($module,$values){foreach($values as $key=>$value)$GLOBALS['___LOCAL_'.strtoupper($module).'__VARS__'.$key]=$value;}
$states=$input['states']+$configs;$states['sys']['db']=null;foreach($states as $module=>$values){$imports='';foreach($values as $key=>$value){$global='___LOCAL_'.strtoupper($module).'__VARS__'.$key;$imports.='global $'.$global.';$'.$key.'=&$'.$global.';';}define('MOD_'.strtoupper($module),true);define('IMPORT_MODULE_'.strtoupper($module).'_GLOBALS',$imports);}foreach($input['order'] as $module)foreach(get_defined_functions()['user'] as $fn)if(strpos($fn,$module.'\\')===0&&$fn!==$module.'\\init')hook_register($module,substr($fn,strlen($module)+1));
$out=[];foreach($input['cases'] as $case){$trace=[];foreach($states as $module=>$values)reset_state($module,$values);reset_state('sys',$case['sys']??[]);$db=&get_var_in_module('db','sys');$db=new FixtureDB;$typeinfo=&get_var_in_module('typeinfo','player');$typeinfo+=get_var_in_module('npc_typeinfo','npc');mt_srand($case['seed']??42);$item=$case['item']??['itm'=>'挑战者之印','itmk'=>'Y','itme'=>'1','itms'=>'3','itmsk'=>'属性'];$returns=[];
foreach($case['calls'] as $entry){$fn='addnpc\\'.array_shift($entry);$args=[];foreach($entry as &$value){if($value==='@item')$args[]=&$item;else $args[]=&$value;}unset($value);$returns[]=call_user_func_array($fn,$args);}
$sys=[];foreach($input['states']['sys'] as $key=>$value)$sys[$key]=get_var_in_module($key,'sys');$weather=get_var_in_module('weather','sys');if($weather!==null)$sys['weather']=$weather;
$out[]=json_encode(['returns'=>$returns,'item'=>$item,'sys'=>$sys,'rp'=>get_var_in_module('rp','player'),'log'=>get_var_in_module('log','logger'),'trace'=>$trace,'next'=>rand()],JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);unset($GLOBALS['___LOCAL_SYS__VARS__weather']);
}echo '['.implode(',',$out).']';}
`;

test('addnpc preserves its complete functions, dependencies and configuration', async () => {
  const base = path.join(project, 'engine/include/modules/base/addnpc'), source = await readFile(path.join(base, 'main.php'), 'utf8'), header = await readFile(path.join(base, 'module.inc.php'), 'utf8');
  assert.deepEqual(Object.keys(addnpcModule.functions).sort(), [...source.matchAll(/^\s*function\s+(\w+)\s*\(/gm)].map(match => match[1]).filter(name => name !== 'init').sort());
  for (const [key, field] of [['dependency', 'dependencies'], ['dependency_optional', 'optionalDependencies'], ['templatelist', 'templates']]) assert.deepEqual(addnpcModule[field], header.match(new RegExp('\\$___MODULE_' + key + " = '([^']*)'"))[1].split(' ').filter(Boolean));
  const config = JSON.parse(await readFile(path.join(project, 'native/gameplay/base-extra/addnpc-config.json'), 'utf8')); assert.deepEqual(addnpcModule.state(), config.values); for (const entry of config.sources) assert.equal(createHash('sha256').update(await readFile(path.join(project, entry.source))).digest('hex'), entry.sha256);
});

test('summoning items and NPC insertion agree with original PHP 7.4', { timeout: 120_000 }, async t => {
  const php = process.env.DTS_REFERENCE_PHP || 'php', version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires PHP 7.4 development oracle.'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true }); const temporary = await mkdtemp(path.join(parent, 'native-base-extra-addnpc-'));
  try {
    for (const file of ['include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', 'include/modules/modules.func.php', 'include/modules/base/npc/main.php', 'include/modules/base/npc/config/npc.data.config.php', 'include/modules/base/npc/config/npc.resource.config.php', 'include/modules/base/addnpc/main.php', 'include/modules/base/addnpc/config/addnpc.config.php']) { const target = path.join(temporary, 'engine', file); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', file), target); }
    await mkdir(path.join(temporary, 'engine/include/modulemng'), { recursive: true }); await writeFile(path.join(temporary, 'engine/include/modulemng/modulemng.config.php'), '<?php $___MOD_CODE_ADV2=0;$___MOD_SRV=0;');
    const cases = scenarios(), registry = new ModuleRegistry([...boundaries(cases[0], []), npcModule, addnpcModule]); await writeFile(path.join(temporary, 'oracle.php'), oracle);
    const expected = spawnSync(php, [path.join(temporary, 'oracle.php')], { input: JSON.stringify({ fields, states: states(), configKeys: { npc: Object.keys(npcModule.state()), addnpc: Object.keys(addnpcModule.state()) }, order: registry.order, cases }), encoding: 'utf8', windowsHide: true, timeout: 60_000, maxBuffer: 96 * 1024 * 1024 });
    assert.equal(expected.status, 0, expected.stderr); assert.equal(expected.stderr, ''); const outputs = JSON.parse(expected.stdout);
    for (const [index, input] of cases.entries()) assert.deepEqual(await actual(input), outputs[index], input.label);
    t.diagnostic(`Compared ${cases.length} original PHP cases, source NPC resources, inserted records/IDs, news, weather and item consumption order.`);
  } finally { assert.ok(path.resolve(temporary).startsWith(path.resolve(parent) + path.sep)); await rm(temporary, { recursive: true, force: true }); }
});

test('three summoned enforcers persist with their distinct source identities', async t => {
  const fixture = await isolatedDatabase(t, 'summon'); if (!fixture) return;
  const database = fixture.database; await database.execute('CREATE TABLE test_players (pid int PRIMARY KEY AUTO_INCREMENT,' + fields.map(field => field + ' varchar(255)').join(',') + ')');
  const output = await actual({ strip: true, calls: [['itemuse', '@item']] }, database), rows = await database.query('SELECT name,type,sNo,hp,pls FROM test_players ORDER BY pid');
  assert.equal(rows.length, 3); assert.equal(new Set(rows.map(row => row.name)).size, 3); assert.ok(rows.every(row => row.type === '7' && Number(row.hp) > 0)); assert.equal(output.item.itms, 0); assert.equal(output.item.itm, '');
});
