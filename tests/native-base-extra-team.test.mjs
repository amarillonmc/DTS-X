import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { teamModule } from '../native/gameplay/base-extra/team.mjs';
import { createTemplateServices, createOutput } from '../native/templates/index.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

const project = fileURLToPath(new URL('../', import.meta.url)), copy = value => structuredClone(value), snap = value => JSON.parse(JSON.stringify(value));
const fields = ['itm', 'itmk', 'itme', 'itms', 'itmsk'];
function player(extra = {}) { const value = { pid: '1', name: '本人', type: '0', teamID: '队伍', teamPass: '密码', hp: '100', sp: '300', pls: '1', fog: 0, action: 'team2', cmd: 'old-command', main: 'old-main' }; for (let i = 1; i <= 6; i++) for (const field of fields) value[field + i] = field === 'itme' || field === 'itms' ? 0 : ''; return Object.assign(value, { itm1: '补给', itmk1: 'HB', itme1: '50', itms1: '3', itmsk1: '' }, extra); }
function states(input) { return { input: { teamcmd: 'teammake', nteamID: '新队', nteamPass: '密码', message: '你好', ...input.input }, sys: { tablepre: 'test_', now: 1100, hour: '11', min: '22', sec: '33', mode: 'senditem', command: 'item1', gametype: '0', teamwin_mode: [2], noitm: '无', ...input.sys }, player: { ...player(input.player), sdata: {} }, logger: { log: '' }, map: { plsinfo: { 1: '森林' } }, metman: { tdata: {}, battle_title: '', w_pid: null, w_name: null, w_hp: null, w_teamID: null }, enemy: {}, gameflow_combo: {} }; }
const scopeSnapshot = scope => Object.fromEntries(['teamcmd', 'action', 'w_extra', 'w_name', 'battle_title'].map(key => [key, scope[key] ?? null]));
function boundaries(input, trace, database) {
  const record = (...args) => trace.push(snap(args));
  return Object.entries(states(input)).map(([name, state]) => ({ name, state: () => state,
    ...(name === 'player' ? { initialize(ctx) { const p = ctx.state(); for (const key of Object.keys(p)) if (key !== 'sdata') Object.defineProperty(p.sdata, key, { enumerable: true, get: () => p[key], set: value => { p[key] = value; } }); if (input.keepTeam != null) p.sdata.keep_team = input.keepTeam; } } : {}), functions: {
      ...(name === 'sys' ? { async act() { record('act'); }, async post_act() { record('post_act'); }, async parse_news(ctx, ...args) { record('parse_news', ...args); return 'base-news'; }, async addnews(ctx, ...args) { record('news', ...args); } } : {}),
      ...(name === 'metman' ? { async discover_player_filter_alive(ctx, data) { record('filter', data); return input.filterResult ?? true; }, async meetman_alternative(ctx, data) { record('meet', data); }, async init_battle(ctx, flag) { record('init_battle', flag); ctx.state().tdata = { name: ctx.state().w_name }; } } : {}),
      ...(name === 'gameflow_combo' ? { async is_gamestate_combo() { record('combo'); return input.combo ?? false; } } : {}),
      ...(name === 'player' ? { async fetch_playerdata_by_pid(ctx, id) { record('fetch', id); return database ? (await database.query(`SELECT * FROM test_players WHERE pid='${id}'`))[0] ?? null : input.missing ? null : player({ pid: '2', name: '队友', ...input.enemy }); }, async player_save(ctx, data) { record('save', data); if (database) { const update = Object.fromEntries(['pid', 'name', 'type', 'teamID', 'teamPass', 'hp', 'sp', 'pls', ...Array.from({ length: 6 }, (_, i) => fields.map(field => field + (i + 1))).flat()].map(key => [key, data[key]])); await database.arrayUpdate('test_players', update, `pid='${data.pid}'`); } } } : {}),
      ...(name === 'logger' ? { async logsave(ctx, ...args) { record('logsave', ...args); } } : {}),
    } }));
}
async function actual(input, database) {
  const trace = [], registry = new ModuleRegistry([...boundaries(input, trace, database), teamModule]); let buffer = 'PRIOR';
  const session = await registry.createSession({ services: { database: database ?? { async query(sql) { trace.push(['query', sql]); return copy(input.rows ?? []); } }, templates: { names: { MOD_TEAM_TEAM: 'team', MOD_TEAM_FINDTEAM: 'findteam', MOD_METMAN_MEETMAN: 'meetman' }, async render(name, scope) { trace.push(['render', name, snap(scopeSnapshot(scope))]); return `<fixture:${name}>`; } }, output: { async take() { const value = buffer; buffer = ''; return value; } } } });
  const enemy = input.missing ? null : player({ pid: '2', name: '队友', ...input.enemy }), returns = [];
  for (const [fn, ...args] of input.calls) returns.push(await session.call('team', fn, ...args.map(value => value === '@enemy' ? enemy : copy(value))) ?? null);
  return snap({ returns, enemy, sys: session.state('sys'), player: session.state('player'), metman: session.state('metman'), log: session.state('logger').log, trace, buffer });
}
function scenarios() {
  const cases = [], add = (label, calls, values = {}) => cases.push({ label, calls, ...values });
  for (const fn of ['teammake', 'teamjoin']) for (const [name, password] of [['', '密码'], ['0', '密码'], ['新队', ''], ['新队', '0'], ['无', '密码'], ['all', '密码'], ['123456789012345678901', '密码'], ['测试测试测试测', '密码'], ['新队', '测试测试测试测'], ['新队', '密码']]) for (const sp of ['100', '200', '201']) add(`${fn} ${name}/${password}/${sp}`, [[fn, name, password]], { player: { teamID: '', sp } });
  for (const fn of ['teammake', 'teamjoin']) for (const rows of [[], [{ teamPass: '密码' }], [{ teamPass: '错误' }], Array.from({ length: 5 }, () => ({ teamPass: '密码' }))]) add(`${fn} rows ${JSON.stringify(rows)}`, [[fn, '新队', '密码']], { rows, player: { teamID: '' } });
  for (const [password, stored] of [['0e123', '0e456'], ['1e309', '2e309'], ['1e309', '1e309'], ['01', '1']]) add(`loose passwords ${password}/${stored}`, [['teamjoin', '新队', password]], { player: { teamID: '' }, rows: [{ teamPass: stored }] });
  for (const team of ['', '队伍']) for (const teamcmd of ['teammake', 'teamjoin', 'teamquit', 'other']) for (const combo of [false, true]) for (const sp of ['100', '200', '201']) add(`team commands ${team}/${teamcmd}/${combo}/${sp}`, [['act']], { combo, player: { teamID: team, sp }, sys: { mode: 'command', command: 'team' }, input: { teamcmd } });
  for (const mode of ['teammake', 'teamjoin', 'other']) add(`form dispatch ${mode}`, [['act']], { player: { teamID: '' }, sys: { mode: 'team', command: mode } });
  for (const fog of [0, 1]) for (const gametype of [0, 2]) for (const combo of [false, true]) for (const enemyTeam of ['队伍', '', '另一队']) add(`meet ${fog}/${gametype}/${combo}/${enemyTeam}`, [['discover_player_filter_alive', '@enemy'], ['meetman_alternative', '@enemy'], ['post_act']], { combo, player: { fog }, sys: { gametype }, enemy: { teamID: enemyTeam, extra: '局部字段' } });
  for (const [own, other] of [['1e309', '2e309'], ['0e1', '0e2']]) add('numeric team ' + own, [['senditem_check_teammate', '@enemy']], { player: { teamID: own }, enemy: { teamID: other } });
  for (const command of ['back', 'item1', 'item2', 'item01', 'unknown']) for (const type of ['0', '1']) for (const full of [false, true]) add(`give ${command}/${type}/${full}`, [['act'], ['post_act']], { sys: { command }, enemy: { type, ...Object.fromEntries(Array.from({ length: 6 }, (_, index) => ['itms' + (index + 1), full ? '1' : 0])) } });
  for (const enemy of [{ pid: '1' }, { pls: '2' }, { hp: '0' }, { teamID: '其他' }]) add('invalid recipient ' + JSON.stringify(enemy), [['senditem']], { enemy });
  add('missing recipient', [['senditem']], { missing: true });
  for (const action of ['', 'team', 'enemy2', 'prefixteam2']) add('missing encounter ' + action, [['senditem']], { player: { action } });
  for (const keepTeam of [0, 1]) add('keep encounter ' + keepTeam, [['post_act']], { keepTeam });
  for (const news of ['teammake', 'teamjoin', 'teamquit', 'senditem', 'other']) add('news ' + news, [['parse_news', 7, news, '01', '02', '03', '甲', '乙', '道具', '', '', []]]);
  return cases;
}
const oracle = String.raw`<?php
namespace {define('IN_GAME',true);define('GAME_ROOT',__DIR__.'/engine/');define('MOD_TEAM_TEAM','team');define('MOD_TEAM_FINDTEAM','findteam');define('MOD_METMAN_MEETMAN','meetman');error_reporting(E_ALL & ~E_NOTICE);ini_set('display_errors','stderr');require GAME_ROOT.'include/global.func.php';require GAME_ROOT.'include/modules/modules.func.php';$input=json_decode(stream_get_contents(STDIN),true);function record(...$args){$GLOBALS['trace'][]=json_decode(json_encode($args),true);}class FixtureDB {function query($sql){record('query',$sql);return $GLOBALS['case']['rows']??[];}function num_rows($rows){return count($rows);}function result($rows,$index){return array_values($rows[$index])[0];}}}
namespace sys {function act(){if(eval(__MAGIC__))return $___RET_VALUE;\record('act');}function post_act(){if(eval(__MAGIC__))return $___RET_VALUE;\record('post_act');}function parse_news(...$args){if(eval(__MAGIC__))return $___RET_VALUE;\record('parse_news',...$args);return 'base-news';}function addnews(...$args){\record('news',...$args);}}
namespace metman {function discover_player_filter_alive(&$data){if(eval(__MAGIC__))return $___RET_VALUE;\record('filter',$data);return $GLOBALS['case']['filterResult']??true;}function meetman_alternative($data){if(eval(__MAGIC__))return $___RET_VALUE;\record('meet',$data);}function init_battle($flag){\record('init_battle',$flag);$tdata=&get_var_in_module('tdata','metman');$tdata=['name'=>get_var_in_module('w_name','metman')];}}
namespace player {function fetch_playerdata_by_pid($id){\record('fetch',$id);return $GLOBALS['case']['enemyData'];}function player_save($data){\record('save',$data);}}
namespace logger {function logsave(...$args){\record('logsave',...$args);}}
namespace gameflow_combo {function is_gamestate_combo(){\record('combo');return $GLOBALS['case']['combo']??false;}}
namespace team {function template($name){$GLOBALS['templateName']=$name;return __DIR__.'/fixture.htm';}}
namespace {require GAME_ROOT.'include/modules/base/team/main.php';require GAME_ROOT.'include/modules/base/team/team.command.php';require GAME_ROOT.'include/modules/base/team/config/team.config.php';function reset_state($module,$values){foreach($values as $key=>$value)$GLOBALS['___LOCAL_'.strtoupper($module).'__VARS__'.$key]=$value;}$states=$input['states'];$states['sys']['db']=null;$states['team']=['team_sp'=>$team_sp,'teamj_sp'=>$teamj_sp,'teamlimit'=>$teamlimit];
foreach($states as $module=>$values){$imports='';foreach($values as $key=>$value){$global='___LOCAL_'.strtoupper($module).'__VARS__'.$key;$imports.='global $'.$global.';$'.$key.'=&$'.$global.';';}define('MOD_'.strtoupper($module),true);define('IMPORT_MODULE_'.strtoupper($module).'_GLOBALS',$imports);}foreach($input['order'] as $module)foreach(get_defined_functions()['user'] as $fn)if(strpos($fn,$module.'\\')===0&&$fn!==$module.'\\init'&&$fn!=='team\\template')hook_register($module,substr($fn,strlen($module)+1));
$out=[];foreach($input['cases'] as $case){$trace=[];foreach($case['states'] as $module=>$values)reset_state($module,$values);reset_state('team',$states['team']);$db=&get_var_in_module('db','sys');$db=new FixtureDB;$s=&get_var_in_module('sdata','player');foreach($case['states']['player'] as $key=>$value)if($key!=='sdata')$s[$key]=&get_var_in_module($key,'player');if(isset($case['keepTeam']))$s['keep_team']=$case['keepTeam'];$enemy=$case['enemyData'];$returns=[];ob_start();echo 'PRIOR';
foreach($case['calls'] as $entry){$fn='team\\'.array_shift($entry);$args=[];foreach($entry as &$value){if($value==='@enemy')$args[]=&$enemy;else $args[]=&$value;}unset($value);$returns[]=call_user_func_array($fn,$args);}
$output=['returns'=>$returns,'enemy'=>$enemy];foreach(['sys','player','metman'] as $module){$output[$module]=[];foreach($case['states'][$module] as $key=>$value)$output[$module][$key]=get_var_in_module($key,$module);}$output['metman']['tdata']=(object)$output['metman']['tdata'];$output['log']=get_var_in_module('log','logger');$output['trace']=$trace;$output['buffer']=ob_get_contents();ob_end_clean();$out[]=json_encode($output,JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);
}echo '['.implode(',',$out).']';}
`;

test('team inventories, original dependencies and configuration remain intact', async () => {
  const base = path.join(project, 'engine/include/modules/base/team'), source = await readFile(path.join(base, 'main.php'), 'utf8') + await readFile(path.join(base, 'team.command.php'), 'utf8'), header = await readFile(path.join(base, 'module.inc.php'), 'utf8');
  assert.deepEqual(Object.keys(teamModule.functions).sort(), [...source.matchAll(/^\s*function\s+(\w+)\s*\(/gm)].map(match => match[1]).filter(name => name !== 'init').sort());
  for (const [key, field] of [['dependency', 'dependencies'], ['dependency_optional', 'optionalDependencies'], ['templatelist', 'templates']]) assert.deepEqual(teamModule[field], header.match(new RegExp('\\$___MODULE_' + key + " = '([^']*)'"))[1].split(' ').filter(Boolean));
  const config = JSON.parse(await readFile(path.join(project, 'native/gameplay/base-extra/team-config.json'), 'utf8')); assert.deepEqual(teamModule.state(), config.values); assert.equal(createHash('sha256').update(await readFile(path.join(project, config.source))).digest('hex'), config.sha256);
});

test('team creation, encounters and inventory transfer agree with original PHP hooks', { timeout: 120_000 }, async t => {
  const php = process.env.DTS_REFERENCE_PHP || 'php', version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires PHP 7.4 development oracle.'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true }); const temporary = await mkdtemp(path.join(parent, 'native-base-extra-team-'));
  try {
    for (const file of ['include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', 'include/modules/modules.func.php', 'include/modules/base/team/main.php', 'include/modules/base/team/team.command.php', 'include/modules/base/team/config/team.config.php']) { const target = path.join(temporary, 'engine', file); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', file), target); }
    await mkdir(path.join(temporary, 'engine/include/modulemng'), { recursive: true }); await writeFile(path.join(temporary, 'engine/include/modulemng/modulemng.config.php'), '<?php $___MOD_CODE_ADV2=0;$___MOD_SRV=0;');
    await writeFile(path.join(temporary, 'fixture.htm'), String.raw`<?php \record('render',$GLOBALS['templateName'],['teamcmd'=>$teamcmd??null,'action'=>$action??null,'w_extra'=>$w_extra??null,'w_name'=>$w_name??null,'battle_title'=>$battle_title??null]);echo '<fixture:'.$GLOBALS['templateName'].'>';`);
    const cases = scenarios(), registry = new ModuleRegistry([...boundaries(cases[0], []), teamModule]); await writeFile(path.join(temporary, 'oracle.php'), oracle);
    const expected = spawnSync(php, [path.join(temporary, 'oracle.php')], { input: JSON.stringify({ states: states({}), order: registry.order, cases: cases.map(input => ({ ...input, states: states(input), enemyData: input.missing ? null : player({ pid: '2', name: '队友', ...input.enemy }) })) }), encoding: 'utf8', windowsHide: true, timeout: 60_000, maxBuffer: 96 * 1024 * 1024 });
    assert.equal(expected.status, 0, expected.stderr); assert.equal(expected.stderr, ''); const outputs = JSON.parse(expected.stdout);
    for (const [index, input] of cases.entries()) assert.deepEqual(await actual(input), outputs[index], input.label);
    t.diagnostic(`Compared ${cases.length} PHP cases, including byte-length limits, loose passwords/team IDs, inventory aliases, recipient save order and template scopes.`);
  } finally { assert.ok(path.resolve(temporary).startsWith(path.resolve(parent) + path.sep)); await rm(temporary, { recursive: true, force: true }); }
});

test('team uses generated original forms and transfer persists the recipient inventory', async t => {
  let session; const output = createOutput(), templates = createTemplateServices({ session: () => session, enabledModules: ['team', 'metman'], output });
  const input = { player: { teamID: '' }, input: { teamcmd: 'teamjoin' } }; session = await new ModuleRegistry([...boundaries(input, []), teamModule]).createSession({ services: { templates, output } });
  output.write('PRIOR'); await session.call('team', 'teamcheck'); assert.match(session.state('player').cmd, /^PRIOR<input type="hidden" id="mode" name="mode" value="team">/); assert.match(session.state('player').cmd, /name="nteamID"/); assert.match(session.state('player').cmd, /name="command" value="teamjoin"/); assert.equal(output.peek(), '');
  session.state('player').teamID = '队伍'; await session.call('team', 'findteam', player({ pid: '2', name: '队友' })); assert.match(session.state('player').cmd, /name="mode" value="senditem"/); assert.match(session.state('player').cmd, /postCmd\('gamecmd','command.php'\)/); assert.match(session.state('player').cmd, /value="补给\/50\/3"/);
  const fixture = await isolatedDatabase(t, 'team'); if (!fixture) return;
  const database = fixture.database, columns = ['pid', 'name', 'type', 'teamID', 'teamPass', 'hp', 'sp', 'pls', ...Array.from({ length: 6 }, (_, i) => fields.map(field => field + (i + 1))).flat()];
  await database.execute('CREATE TABLE test_players (' + columns.map(column => column + ' varchar(255)').join(',') + ')');
  const recipient = player({ pid: '2', name: '队友', itms1: 0 }); await database.arrayInsert('test_players', Object.fromEntries(columns.map(column => [column, recipient[column]])));
  const result = await actual({ calls: [['senditem']], enemy: { itms1: 0 } }, database), saved = (await database.query("SELECT * FROM test_players WHERE pid='2'"))[0]; assert.equal(saved.itm1, '补给'); assert.equal(saved.itms1, '3'); assert.equal(result.player.itms1, 0); assert.equal(result.player.itm1, '');
});
