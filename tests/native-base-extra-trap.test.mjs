import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { createPhp74Random } from '../native/random.mjs';
import { trapModule } from '../native/gameplay/base-extra/trap.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const copy = value => structuredClone(value);
const snapshot = value => JSON.parse(JSON.stringify(value));
const item = (overrides = {}) => ({ tid: '5', itm: '地雷', itmk: 'TO', itme: '101', itms: '1', itmsk: '2', pls: '1', ...overrides });
const owner = { pid: '2', name: '设雷者', type: '1', hp: '100', lvl: '8', wd: '50' };
function states(input = {}) {
  return { sys: { tablepre: 'test_', now: 1100, hour: '11', min: '22', sec: '33', mode: 'command', ...input.sys }, player: { pid: '1', name: '本人', type: '0', typeinfo: ['学生', 'NPC'], hp: '500', mhp: '500', lvl: '4', wd: '2', pls: '1', state: '0', pose: '1', tactic: '1', itm0: '地雷', itmk0: 'TO', itme0: '101', itms0: '1', itmsk0: '2', ...input.player, sdata: {} }, logger: { log: '' }, itemmain: { iteminfo: {}, map_noitemdrop_arealist: [0] }, map: {}, lvlctl: {}, explore: {}, metman: {}, trap: { ...trapModule.state(), ...input.trap } };
}
function bind(player, data = player) {
  const sdata = {};
  for (const key of Object.keys(data)) if (key !== 'sdata') { if (data !== player) player[key] = data[key]; Object.defineProperty(sdata, key, { enumerable: true, configurable: true, get: () => player[key], set: value => { player[key] = value; } }); }
  player.sdata = sdata;
}
function definitions(input, trace) {
  const state = states(input), record = (...values) => trace.push(snapshot(values));
  return Object.entries(state).filter(([name]) => name !== 'trap').map(([name, value]) => ({ name, state: () => value,
    ...(name === 'player' ? { initialize(ctx) { bind(ctx.state()); } } : {}), functions: {
      ...(name === 'sys' ? { async rs_game(ctx, mode) { record('rs_game', mode); }, async parse_news(ctx, ...args) { record('parse_news', ...args); return 'base-news'; }, async addnews(ctx, ...args) { record('news', ...args); } } : {}),
      ...(name === 'itemmain' ? { async parse_itmuse_desc(ctx, ...args) { record('description', ...args); return '原说明/'; }, async itemuse(ctx, value) { record('itemuse', value); }, async itms_reduce(ctx, value) { record('consume', value); if (value.itms !== '∞' && --value.itms <= 0) Object.assign(value, { itm: '', itmk: '', itme: 0, itms: 0, itmsk: '' }); } } : {}),
      ...(name === 'player' ? { async fetch_playerdata_by_pid(ctx, id) { record('fetch', id); return copy({ ...owner, pid: id }); }, async create_dummy_playerdata() { record('dummy'); return { pid: 0, name: '', type: 0 }; }, async update_sdata() { record('update_sdata'); }, async kill(ctx, pa, pd) { record('kill', pa, pd); pa.killnum = 1; pd.deathmark = true; return input.killmsg ?? '再见'; }, async player_save(ctx, pa) { record('save', pa); }, async load_playerdata(ctx, data) { record('load', data); bind(ctx.state(), snapshot(data)); } } : {}),
      ...(name === 'logger' ? { async logsave(ctx, ...args) { record('logsave', ...args); } } : {}),
      ...(name === 'map' ? { async get_all_plsno() { record('areas'); return [0, 1, 2]; }, async get_area_wavenum() { record('wave'); return input.wave ?? 0; } } : {}),
      ...(name === 'lvlctl' ? { async getexp(ctx, value) { record('exp', value); ctx.state('player').lvl = Number(ctx.state('player').lvl) + 1; } } : {}),
      ...(name === 'explore' ? { async discover(ctx, mode) { record('discover', mode); return 'found'; } } : {}),
    } }));
}
const hooks = {
  name: 'trap_test_hooks', dependencies: ['trap'], functions: {
    async get_trap_damage_multiplier(ctx, pa, pd, item, damage) { if (!ctx.services.fixture.extension) return await ctx.next(pa, pd, item, damage); ctx.services.fixture.record('multiplier', pa, pd, item, damage); item.itme = -100; pa.extension = 'attacker'; pd.extension = 'defender'; return ['0.5', '1.5']; },
    ...Object.fromEntries(['up', 'down', 'change'].map((suffix, index) => [suffix === 'change' ? 'get_trap_final_damage_change' : 'get_trap_final_damage_modifier_' + suffix, async (ctx, pa, pd, item, damage) => { if (!ctx.services.fixture.extension) return await ctx.next(pa, pd, item, damage); ctx.services.fixture.record(suffix, pa, pd, item, damage); return index === 0 ? Number(damage) + 4 : index === 1 ? Number(damage) - 1 : ctx.services.fixture.finalDamage ?? damage; }])),
    async post_traphit_events(ctx, pa, pd, item, damage) { await ctx.next(pa, pd, item, damage); if (ctx.services.fixture.extension) { ctx.services.fixture.record('post', pa, pd, item, damage); pd.post = true; } },
    async get_trapfilecont(ctx) { return ctx.services.fixture.lines ?? await ctx.next(); },
  },
};
async function actual(input, suppliedDatabase) {
  const trace = [], record = (...args) => trace.push(snapshot(args)), random = createPhp74Random(input.seed), object = copy(input.item ?? item()), pa = copy(input.pa ?? null);
  const database = suppliedDatabase ?? { async query(sql) { record('query', sql); return sql.startsWith('SELECT pid') ? copy(input.ownerRows ?? [{ pid: '2' }]) : copy(input.rows ?? []); }, async execute(sql) { record('query', sql); return {}; } };
  const registry = new ModuleRegistry([...definitions(input, trace), trapModule, hooks]);
  const session = await registry.createSession({ states: { trap: states(input).trap }, services: { random, database, fixture: { ...input, record } } });
  const returns = [];
  for (const [fn, ...args] of input.calls) returns.push(await session.call('trap', fn, ...args.map(value => value === '@item' ? object : value === '@pa' ? pa : copy(value))) ?? null);
  return { result: snapshot({ returns, item: object, pa, states: Object.fromEntries(['sys', 'player', 'logger', 'itemmain', 'trap'].map(name => [name, session.state(name)])), trace, next: random.rand() }), session };
}
function scenarios() {
  const cases = [], add = (label, calls, values = {}) => cases.push({ label, calls, seed: 42, ...values });
  for (const kind of ['TN', 'TNc', 'TOc', 'TNcTN', 'X']) for (const level of ['0', '4', '20']) for (const effect of ['0', '101', '800']) add(`deploy ${kind}/${level}/${effect}`, [['parse_itmuse_desc', '地雷', kind, effect, 1, ''], ['get_trap_itme_limit', '@item', '@pa'], ['itemuse', '@item']], { player: { lvl: level }, item: item({ itmk: kind, itme: effect, itms: '2' }) });
  add('empty optional player remains empty', [['get_trap_itme_limit', '@item', '@pa']], { pa: {} });
  add('explicit player cap', [['get_trap_itme_limit', '@item', '@pa']], { pa: { lvl: '0', wd: '0' } });
  for (const source of ['', '1', '2', '0', 'notnumeric', ' 2', '2 ']) for (const hp of ['1', '500']) for (const level of ['0', '300']) for (const seed of [0, 1, 2, 3, 42]) add(`trigger ${source}/${hp}/${level}/${seed}`, [['trapget', '@item']], { seed, item: item({ itmsk: source }), player: { hp, lvl: level } });
  const hitSeed = Array.from({ length: 1000 }, (_, seed) => seed).find(seed => createPhp74Random(seed).rand(0, 99) >= 90);
  for (const source of ['', '1', '2']) for (const finalDamage of [undefined, 0, -3, '11']) add(`hook chain ${source}/${finalDamage}`, [['trapget', '@item']], { seed: hitSeed, extension: true, finalDamage, item: item({ itmsk: source }), player: { hp: '1', lvl: '0' } });
  for (const durability of ['∞', '1', '2']) add(`consumption ${durability}`, [['trap_use', '@item']], { item: item({ itmk: 'TN', itms: durability }) });
  for (const rows of [[], [item()], [item(), item({ tid: '6', itmsk: '', itme: '20' })]]) for (let seed = 0; seed < 45; seed++) add(`discovery ${rows.length}/${seed}`, [['discover', 'search']], { seed, rows, trap: { trap_min_obbs: 30 } });
  for (const news of ['trap', 'trapmiss', 'death27', 'other']) for (const damage of [0, 4]) for (const name of ['', '设雷者']) for (const quote of ['', '遗言']) add(`news ${news}/${damage}/${name}/${quote}`, [['parse_news', 7, news, '01', '02', '03', '本人', 0, name, damage, quote, []]]);
  for (const wave of [0, 1, 2, 99]) for (const mode of [0, 16, 63]) add(`spawn ${wave}/${mode}`, [['rs_game', mode]], { wave, lines: ['header\n', '0,99,5,地雷,TO,100,1,=设雷者,\n', '1,1,2,空陷阱,TO,0,0,,\n', '99,2,1,常驻,TO,10,1,,\n', '98,1,2,特殊,TO,2,1,=无名,\n'] });
  add('actual resource bytes', [['get_trapfilecont']]);
  add('spawn actual source resource', [['rs_game', 16]]);
  return cases;
}
const oracle = String.raw`<?php
namespace { define('IN_GAME',true);define('GAME_ROOT',__DIR__.'/engine/');error_reporting(E_ALL & ~E_NOTICE);ini_set('display_errors','stderr');require GAME_ROOT.'include/global.func.php';require GAME_ROOT.'include/modules/modules.func.php';$input=json_decode(stream_get_contents(STDIN),true);function record(...$args){$GLOBALS['trace'][]=json_decode(json_encode($args),true);}class FixtureDB {function query($sql){record('query',$sql);if(strpos($sql,'SELECT')!==0)return true;return (object)['rows'=>strpos($sql,'SELECT pid')===0?($GLOBALS['case']['ownerRows']??[['pid'=>'2']]):($GLOBALS['case']['rows']??[]),'at'=>0];}function num_rows($r){return count($r->rows);}function data_seek($r,$at){$r->at=$at;}function fetch_array($r){return $r->rows[$r->at++]??false;}}
}
namespace sys {function rs_game($mode){if(eval(__MAGIC__))return $___RET_VALUE;\record('rs_game',$mode);}function parse_news(...$args){if(eval(__MAGIC__))return $___RET_VALUE;\record('parse_news',...$args);return 'base-news';}function addnews(...$args){\record('news',...$args);}}
namespace itemmain {function parse_itmuse_desc(...$args){if(eval(__MAGIC__))return $___RET_VALUE;\record('description',...$args);return '原说明/';}function itemuse(&$item){if(eval(__MAGIC__))return $___RET_VALUE;\record('itemuse',$item);}function itms_reduce(&$item){\record('consume',$item);if($item['itms']!=='∞'&&--$item['itms']<=0)$item=array_merge($item,['itm'=>'','itmk'=>'','itme'=>0,'itms'=>0,'itmsk'=>'']);}}
namespace player {function fetch_playerdata_by_pid($id){\record('fetch',$id);return array_merge($GLOBALS['input']['owner'],['pid'=>$id]);}function create_dummy_playerdata(){\record('dummy');return ['pid'=>0,'name'=>'','type'=>0];}function update_sdata(){\record('update_sdata');}function kill(&$pa,&$pd){\record('kill',$pa,$pd);$pa['killnum']=1;$pd['deathmark']=true;return $GLOBALS['case']['killmsg']??'再见';}function player_save($pa){\record('save',$pa);}function load_playerdata($data){\record('load',$data);$data=json_decode(json_encode($data),true);$s=&get_var_in_module('sdata','player');$s=[];foreach($data as $key=>$value){$p=&get_var_in_module($key,'player');$p=$value;$s[$key]=&$p;unset($p);}}}
namespace logger {function logsave(...$args){\record('logsave',...$args);}}
namespace map {function get_all_plsno(){\record('areas');return [0,1,2];}function get_area_wavenum(){\record('wave');return $GLOBALS['case']['wave']??0;}}
namespace lvlctl {function getexp($value){\record('exp',$value);$lvl=&get_var_in_module('lvl','player');$lvl+=1;}}
namespace explore {function discover($mode){if(eval(__MAGIC__))return $___RET_VALUE;\record('discover',$mode);return 'found';}}
namespace trap_test_hooks {
function get_trap_damage_multiplier(&$pa,&$pd,$item,$damage){if(eval(__MAGIC__))return $___RET_VALUE;if(empty($GLOBALS['case']['extension']))return $chprocess($pa,$pd,$item,$damage);\record('multiplier',$pa,$pd,$item,$damage);$item['itme']=-100;$pa['extension']='attacker';$pd['extension']='defender';return ['0.5','1.5'];}
function get_trap_final_damage_modifier_up(&$pa,&$pd,$item,$damage){if(eval(__MAGIC__))return $___RET_VALUE;if(empty($GLOBALS['case']['extension']))return $chprocess($pa,$pd,$item,$damage);\record('up',$pa,$pd,$item,$damage);return $damage+4;}
function get_trap_final_damage_modifier_down(&$pa,&$pd,$item,$damage){if(eval(__MAGIC__))return $___RET_VALUE;if(empty($GLOBALS['case']['extension']))return $chprocess($pa,$pd,$item,$damage);\record('down',$pa,$pd,$item,$damage);return $damage-1;}
function get_trap_final_damage_change(&$pa,&$pd,$item,$damage){if(eval(__MAGIC__))return $___RET_VALUE;if(empty($GLOBALS['case']['extension']))return $chprocess($pa,$pd,$item,$damage);\record('change',$pa,$pd,$item,$damage);return $GLOBALS['case']['finalDamage']??$damage;}
function post_traphit_events(&$pa,&$pd,$item,$damage){if(eval(__MAGIC__))return $___RET_VALUE;$chprocess($pa,$pd,$item,$damage);if(!empty($GLOBALS['case']['extension'])){\record('post',$pa,$pd,$item,$damage);$pd['post']=true;}}
function get_trapfilecont(){if(eval(__MAGIC__))return $___RET_VALUE;return $GLOBALS['case']['lines']??$chprocess();}
}
namespace {require GAME_ROOT.'include/modules/base/items/trap/main.php';require GAME_ROOT.'include/modules/base/items/trap/config/trap.config.php';
function reset_state($module,$values){foreach($values as $key=>$value)$GLOBALS['___LOCAL_'.strtoupper($module).'__VARS__'.$key]=$value;}
foreach($input['states'] as $module=>$values){$imports='';if($module==='sys')$values['db']=null;foreach($values as $key=>$value){$global='___LOCAL_'.strtoupper($module).'__VARS__'.$key;$imports.='global $'.$global.';$'.$key.'=&$'.$global.';';}define('MOD_'.strtoupper($module),true);define('IMPORT_MODULE_'.strtoupper($module).'_GLOBALS',$imports);}define('MOD_TRAP_TEST_HOOKS',true);
foreach($input['order'] as $module)foreach(get_defined_functions()['user'] as $fn)if(strpos($fn,$module.'\\')===0&&$fn!==$module.'\\init')hook_register($module,substr($fn,strlen($module)+1));
$out=[];foreach($input['cases'] as $case){$trace=[];foreach($case['states'] as $module=>$values)reset_state($module,$values);$db=&get_var_in_module('db','sys');$db=new FixtureDB;$s=&get_var_in_module('sdata','player');foreach($case['states']['player'] as $key=>$value)if($key!=='sdata')$s[$key]=&get_var_in_module($key,'player');\trap\init();mt_srand($case['seed']);$item=$case['item']??$input['item'];$pa=$case['pa']??null;$returns=[];
foreach($case['calls'] as $entry){$fn='trap\\'.array_shift($entry);$args=[];foreach($entry as &$value){if($value==='@item')$args[]=&$item;elseif($value==='@pa')$args[]=&$pa;else $args[]=&$value;}unset($value);$returns[]=call_user_func_array($fn,$args);}
$state=[];foreach(['sys','player','logger','itemmain','trap'] as $module){foreach($case['states'][$module] as $key=>$value)$state[$module][$key]=get_var_in_module($key,$module);if($module==='player')foreach(['sourceless','attackwith','killnum','deathmark','extension','post'] as $key){$val=get_var_in_module($key,$module);if($val!==null)$state[$module][$key]=$val;}}
$out[]=json_encode(['returns'=>$returns,'item'=>$item,'pa'=>is_array($pa)&&!count($pa)?(object)$pa:$pa,'states'=>$state,'trace'=>$trace,'next'=>rand()],JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);
foreach(['sourceless','attackwith','killnum','deathmark','extension','post'] as $key)unset($GLOBALS['___LOCAL_PLAYER__VARS__'.$key]);
}echo '['.implode(',',$out).']';}
`;

test('trap retains every source function, configuration and original dependency', async () => {
  const source = await readFile(path.join(project, 'engine/include/modules/base/items/trap/main.php'), 'utf8');
  assert.deepEqual(Object.keys(trapModule.functions).sort(), [...source.matchAll(/^\s*function\s+(\w+)\s*\(/gm)].map(match => match[1]).filter(name => name !== 'init').sort());
  const header = await readFile(path.join(project, 'engine/include/modules/base/items/trap/module.inc.php'), 'utf8');
  for (const [key, field] of [['dependency', 'dependencies'], ['dependency_optional', 'optionalDependencies'], ['templatelist', 'templates']]) assert.deepEqual(trapModule[field], header.match(new RegExp('\\$___MODULE_' + key + " = '([^']*)'"))[1].split(' ').filter(Boolean));
  const config = JSON.parse(await readFile(path.join(project, 'native/gameplay/base-extra/trap-config.json'), 'utf8'));
  assert.equal(createHash('sha256').update(await readFile(path.join(project, config.source))).digest('hex'), config.sha256);
  for (const [key, value] of Object.entries(config.values)) assert.equal(trapModule.state()[key], value);
});

test('trap deployment, ownership, death references and hooks agree with PHP 7.4', { timeout: 120_000 }, async t => {
  const php = process.env.DTS_REFERENCE_PHP || 'php', version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires PHP 7.4 development oracle.'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true }); const temporary = await mkdtemp(path.join(parent, 'native-base-extra-trap-'));
  try {
    for (const file of ['include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', 'include/modules/modules.func.php', 'include/modules/base/items/trap/main.php', 'include/modules/base/items/trap/config/trap.config.php', 'include/modules/base/items/trap/config/trapitem.config.php']) { const target = path.join(temporary, 'engine', file); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', file), target); }
    await mkdir(path.join(temporary, 'engine/include/modulemng'), { recursive: true }); await writeFile(path.join(temporary, 'engine/include/modulemng/modulemng.config.php'), '<?php $___MOD_CODE_ADV2=0;$___MOD_SRV=0;');
    const cases = scenarios(), registry = new ModuleRegistry([...definitions(cases[0], []), trapModule, hooks]), payload = { owner, item: item(), states: states(cases[0]), order: registry.order, cases: cases.map(input => ({ ...input, states: states(input) })) };
    await writeFile(path.join(temporary, 'oracle.php'), oracle);
    const expected = spawnSync(php, [path.join(temporary, 'oracle.php')], { input: JSON.stringify(payload), encoding: 'utf8', windowsHide: true, timeout: 60_000, maxBuffer: 96 * 1024 * 1024 });
    assert.equal(expected.status, 0, expected.stderr); assert.equal(expected.stderr, ''); const outputs = JSON.parse(expected.stdout);
    for (const [index, input] of cases.entries()) assert.deepEqual((await actual(input)).result, outputs[index], input.label);
    t.diagnostic(`Compared ${cases.length} original PHP cases, all state fields, SQL text, recorded extension boundaries and subsequent RNG draws.`);
  } finally { assert.ok(path.resolve(temporary).startsWith(path.resolve(parent) + path.sep)); await rm(temporary, { recursive: true, force: true }); }
});

test('trap deployment and consumption persist on an isolated real database', async t => {
  const fixture = await isolatedDatabase(t, 'traps'); if (!fixture) return;
  const database = fixture.database;
  await database.execute('CREATE TABLE test_maptrap (tid int NOT NULL AUTO_INCREMENT PRIMARY KEY,itm varchar(255),itmk varchar(255),itme varchar(255),itms varchar(255),itmsk varchar(255),pls int)');
  const deployed = await actual({ seed: 0, calls: [['trap_use', '@item']], item: item({ itmk: 'TN', itms: '2' }), player: { lvl: '0', wd: '0' } }, database);
  let rows = await database.query('SELECT * FROM test_maptrap'); assert.equal(rows.length, 1); assert.equal(rows[0].itmk, 'TO'); assert.equal(rows[0].itme, '76'); assert.equal(rows[0].itmsk, '1'); assert.equal(deployed.result.item.itms, 1);
  const triggered = await actual({ seed: 0, calls: [['trapget', '@item']], item: rows[0], player: { hp: '500', lvl: '0' } }, database);
  rows = await database.query('SELECT * FROM test_maptrap'); assert.deepEqual(rows, []); assert.equal(triggered.result.states.trap.selflag, true);
});
