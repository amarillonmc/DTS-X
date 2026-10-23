import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { itemshopModule } from '../native/gameplay/base-extra/itemshop.mjs';
import { createTemplateServices, createOutput } from '../native/templates/index.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

const project = fileURLToPath(new URL('../', import.meta.url)), copy = value => structuredClone(value);
const snap = value => value instanceof Map ? Object.fromEntries([...value].map(([key, value]) => [key, snap(value)])) : Array.isArray(value) ? value.map(snap) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, value]) => [key, snap(value)])) : value;
const shopItem = extra => ({ sid: '2', kind: '1', num: '10', price: '25', area: '0', item: '补给', itmk: 'HB', itme: '50', itms: '2', itmsk: 'z', ...extra });
function states(input = {}) { return { sys: { tablepre: 'test_', now: 1100, hour: '11', min: '22', sec: '33', mode: 'shop', command: '2', ...input.sys }, player: { money: '1000', pls: '0', cmd: 'old', itm0: '', itmk0: '', itme0: 0, itms0: 0, itmsk0: '', ...input.player }, logger: { log: '' }, map: {}, input: { sp_cmd: 'sp_shop', shoptype: '1', buynum: '2', ...input.input }, itemmain: {} }; }
function boundaries(input, trace) {
  return Object.entries(states(input)).map(([name, value]) => ({ name, state: () => value, functions: {
    ...(name === 'sys' ? { async rs_game(ctx, mode) { trace.push(['rs_game', mode]); }, async act() { trace.push(['act']); }, async parse_news(ctx, ...args) { trace.push(['parse_news', ...args]); return 'base-news'; } } : {}),
    ...(name === 'map' ? { async get_area_wavenum() { trace.push(['wave']); return input.wave ?? 0; } } : {}),
    ...(name === 'itemmain' ? { async parse_itmk_words(ctx, value, simple) { trace.push(['kind', value, simple]); return '种类:' + value; }, async parse_itmsk_words(ctx, value, simple) { trace.push(['special', value, simple]); return '属性:' + value; }, async parse_itmuse_desc() { return '物品说明'; }, async itemget(ctx) { const p = ctx.state('player'); trace.push(['itemget', ...['itm0', 'itmk0', 'itme0', 'itms0', 'itmsk0', 'money'].map(key => p[key])]); } } : {}),
  } }));
}
async function actual(input, suppliedDatabase) {
  const trace = [], registry = new ModuleRegistry([...boundaries(input, trace), itemshopModule]); let buffer = 'PRIOR';
  const database = suppliedDatabase ?? { async query(sql) { trace.push(['query', sql]); return copy(input.rows ?? [shopItem(input.item)]); }, async execute(sql) { trace.push(['query', sql]); }, async queries(sql) { trace.push(['queries', sql]); } };
  const session = await registry.createSession({ services: { database, templates: { names: { MOD_ITEMSHOP_SHOP: 'shop', MOD_ITEMSHOP_SP_SHOP: 'sp_shop' }, async render(name, scope) { trace.push(['render', name, snap(Object.fromEntries(['sn', 'shop', 'itemdata', 'sp_cmd'].map(key => [key, scope[key] ?? null])))]); return `<fixture:${name}>`; } }, output: { async take() { const value = buffer; buffer = ''; return value; } } } });
  const returns = []; for (const [fn, ...args] of input.calls) returns.push(await session.call('itemshop', fn, ...copy(args)) ?? null);
  return snap({ returns, sys: session.state('sys'), player: session.state('player'), log: session.state('logger').log, trace, buffer });
}
function scenarios() {
  const cases = [], add = (label, calls, values = {}) => cases.push({ label, calls, ...values });
  add('whole original catalog', [['get_shopconfig'], ['get_shopitem_list'], ['get_shop_tag_list']]);
  add('override category retains other categories', [['get_shopitem_list', ['1,2,3,4,改补给,HB,7,8,,\n', '22,1,3,0,新类,X,1,1,,\n']]]);
  add('parse rows', [['get_shopitem_list_by_kind', ['header', '0,标题', '1,1,2,3,名称,X,4,5,,\r\n', '2,3,4,5,物品,Y,6,7,,\n']], ['shopitem_row_data_process', ['a', 'b']]]);
  for (const mode of [0, 32, 63]) add('reset ' + mode, [['rs_game', mode]]);
  for (const kind of ['WP', 'WC', 'WD', 'WF', 'Y', 'B', 'TN', 'GA', 'GB', 'HB', 'P', 'V', 'M', 'X', 'p', 'ygo', 'mc', 'EA']) for (const durability of ['1', '∞']) for (const amount of ['1', '2']) add(`buy type ${kind}/${durability}/${amount}`, [['itembuy', '2', 'ignored', amount]], { item: { itmk: kind, itms: durability } });
  for (const amount of ['', '0', '-1', '2.9', '2x', '11', ' 3', 'bad']) add('quantity ' + amount, [['itembuy', 2, 1, amount]]);
  for (const item of [{ price: '-1' }, { price: '0' }, { num: '0' }, { num: '-1' }, { price: '5000' }, { area: '1' }]) add('blocked ' + JSON.stringify(item), [['itembuy', 2, 1, 1]], { item });
  add('missing row', [['itembuy', 999, 1, 1]], { rows: [] });
  for (const rows of [[], [shopItem()], [shopItem(), shopItem({ sid: '3', itmk: 'WP' })]]) add('display ' + rows.length, [['prepare_shopitem', '1'], ['shoplist', '1']], { rows });
  for (const pls of ['0', '1', '14', '27']) for (const command of ['menu', 'shop', '2']) add(`shop dispatch ${pls}/${command}`, [['act']], { player: { pls }, sys: { command } });
  for (const [mode, command] of [['command', 'special'], ['special', 'shop123'], ['special', 'shop'], ['command', 'other']]) add(`entry ${mode}/${command}`, [['act']], { sys: { mode, command } });
  for (const kind of ['itembuy', 'other']) add('news ' + kind, [['parse_news', 7, kind, '01', '02', '03', '本人', '补给', '', '', '', []]]);
  return cases;
}
const oracle = String.raw`<?php
namespace {define('IN_GAME',true);define('GAME_ROOT',__DIR__.'/engine/');define('MOD_ITEMSHOP_SHOP','shop');define('MOD_ITEMSHOP_SP_SHOP','sp_shop');error_reporting(E_ALL & ~E_NOTICE);ini_set('display_errors','stderr');require GAME_ROOT.'include/global.func.php';require GAME_ROOT.'include/modules/modules.func.php';$input=json_decode(stream_get_contents(STDIN),true);function record(...$args){$GLOBALS['trace'][]=json_decode(json_encode($args),true);}class FixtureDB {function query($sql){record('query',$sql);return (object)['rows'=>$GLOBALS['case']['rows']??[array_merge($GLOBALS['input']['item'],$GLOBALS['case']['item']??[])],'at'=>0];}function queries($sql){record('queries',$sql);}function num_rows($rows){return count($rows->rows);}function fetch_array($rows){return $rows->rows[$rows->at++]??false;}}}
namespace sys {function rs_game($mode){if(eval(__MAGIC__))return $___RET_VALUE;\record('rs_game',$mode);}function act(){if(eval(__MAGIC__))return $___RET_VALUE;\record('act');}function parse_news(...$args){if(eval(__MAGIC__))return $___RET_VALUE;\record('parse_news',...$args);return 'base-news';}}
namespace map {function get_area_wavenum(){\record('wave');return $GLOBALS['case']['wave']??0;}}
namespace itemmain {function parse_itmk_words($value,$simple){\record('kind',$value,$simple);return '种类:'.$value;}function parse_itmsk_words($value,$simple){\record('special',$value,$simple);return '属性:'.$value;}function itemget(){$values=[];foreach(['itm0','itmk0','itme0','itms0','itmsk0','money']as $key)$values[]=get_var_in_module($key,'player');\record('itemget',...$values);}}
namespace itemshop {function template($name){$GLOBALS['templateName']=$name;return __DIR__.'/fixture.htm';}}
namespace {require GAME_ROOT.'include/modules/base/itemshop/main.php';require GAME_ROOT.'include/modules/base/itemshop/config/shop.config.php';function reset_state($module,$values){foreach($values as $key=>$value)$GLOBALS['___LOCAL_'.strtoupper($module).'__VARS__'.$key]=$value;}$states=$input['states'];$states['sys']['db']=null;$states['itemshop']=['shops'=>$shops,'shop_tag_list'=>$shop_tag_list,'shop_allow_input_num'=>$shop_allow_input_num];
foreach($states as $module=>$values){$imports='';foreach($values as $key=>$value){$global='___LOCAL_'.strtoupper($module).'__VARS__'.$key;$imports.='global $'.$global.';$'.$key.'=&$'.$global.';';}define('MOD_'.strtoupper($module),true);define('IMPORT_MODULE_'.strtoupper($module).'_GLOBALS',$imports);}foreach($input['order'] as $module)foreach(get_defined_functions()['user'] as $fn)if(strpos($fn,$module.'\\')===0&&$fn!==$module.'\\init'&&$fn!=='itemshop\\template')hook_register($module,substr($fn,strlen($module)+1));
$out=[];foreach($input['cases']as $case){$trace=[];foreach($case['states']as $module=>$values)reset_state($module,$values);reset_state('itemshop',$states['itemshop']);$db=&get_var_in_module('db','sys');$db=new FixtureDB;$returns=[];ob_start();echo 'PRIOR';foreach($case['calls']as $entry){$fn='itemshop\\'.array_shift($entry);$returns[]=call_user_func_array($fn,$entry);}$output=['returns'=>$returns];foreach(['sys','player']as $module)foreach($case['states'][$module]as $key=>$value)$output[$module][$key]=get_var_in_module($key,$module);$output['log']=get_var_in_module('log','logger');$output['trace']=$trace;$output['buffer']=ob_get_contents();ob_end_clean();$out[]=json_encode($output,JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);}echo '['.implode(',',$out).']';}
`;

test('itemshop retains source functions, dependencies, config and category order', async () => {
  const base = path.join(project, 'engine/include/modules/base/itemshop'), source = await readFile(path.join(base, 'main.php'), 'utf8'), header = await readFile(path.join(base, 'module.inc.php'), 'utf8');
  assert.deepEqual(Object.keys(itemshopModule.functions).sort(), [...source.matchAll(/^\s*function\s+(\w+)\s*\(/gm)].map(match => match[1]).filter(name => name !== 'init').sort());
  for (const [key, field] of [['dependency', 'dependencies'], ['dependency_optional', 'optionalDependencies'], ['templatelist', 'templates']]) assert.deepEqual(itemshopModule[field], header.match(new RegExp('\\$___MODULE_' + key + " = '([^']*)'"))[1].split(' ').filter(Boolean));
  const config = JSON.parse(await readFile(path.join(project, 'native/gameplay/base-extra/itemshop-config.json'), 'utf8')); assert.equal(createHash('sha256').update(await readFile(path.join(project, config.source))).digest('hex'), config.sha256); assert.deepEqual([...itemshopModule.state().shop_tag_list], config.shopTags);
});

test('shop catalogs, purchasing and original template scopes agree with PHP 7.4', { timeout: 120_000 }, async t => {
  const php = process.env.DTS_REFERENCE_PHP || 'php', version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true }); if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires PHP 7.4 development oracle.'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true }); const temporary = await mkdtemp(path.join(parent, 'native-base-extra-shop-'));
  try {
    for (const file of ['include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', 'include/modules/modules.func.php', 'gamedata/sql/shopitem.sql', 'include/modules/base/itemshop/main.php', 'include/modules/base/itemshop/config/shop.config.php', 'include/modules/base/itemshop/config/shopitem.config.php']) { const target = path.join(temporary, 'engine', file); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', file), target); }
    await mkdir(path.join(temporary, 'engine/include/modulemng'), { recursive: true }); await writeFile(path.join(temporary, 'engine/include/modulemng/modulemng.config.php'), '<?php $___MOD_CODE_ADV2=0;$___MOD_SRV=0;'); await writeFile(path.join(temporary, 'fixture.htm'), String.raw`<?php \record('render',$GLOBALS['templateName'],['sn'=>$sn??null,'shop'=>$shop??null,'itemdata'=>$itemdata??null,'sp_cmd'=>$sp_cmd??null]);echo '<fixture:'.$GLOBALS['templateName'].'>';`);
    const cases = scenarios(), registry = new ModuleRegistry([...boundaries(cases[0], []), itemshopModule]); await writeFile(path.join(temporary, 'oracle.php'), oracle);
    const expected = spawnSync(php, [path.join(temporary, 'oracle.php')], { input: JSON.stringify({ states: states(), item: shopItem(), order: registry.order, cases: cases.map(input => ({ ...input, states: states(input) })) }), encoding: 'utf8', windowsHide: true, timeout: 60_000, maxBuffer: 96 * 1024 * 1024 }); assert.equal(expected.status, 0, expected.stderr); assert.equal(expected.stderr, ''); const outputs = JSON.parse(expected.stdout);
    for (const [index, input] of cases.entries()) assert.deepEqual(await actual(input), outputs[index], input.label); t.diagnostic(`Compared ${cases.length} original PHP cases, complete CSV catalogs/SQL, category replacement, quantity rules, messages and buffer handling.`);
  } finally { assert.ok(path.resolve(temporary).startsWith(path.resolve(parent) + path.sep)); await rm(temporary, { recursive: true, force: true }); }
});

test('real shop resets and stock purchase persist; original controls retain category order', async t => {
  const fixture = await isolatedDatabase(t, 'shop'); if (!fixture) return;
  const database = fixture.database; await actual({ calls: [['rs_game', 32]] }, database);
  const row = (await database.query("SELECT * FROM test_shopitem WHERE item='矿泉水'"))[0]; assert.ok(row); assert.equal(row.num, '500');
  const result = await actual({ calls: [['itembuy', row.sid, row.kind, 2]] }, database); assert.equal(result.player.money, 970); assert.equal(result.player.itms0, 2); assert.equal((await database.query(`SELECT num FROM test_shopitem WHERE sid='${row.sid}'`))[0].num, '498');
  let session; const output = createOutput(), templates = createTemplateServices({ session: () => session, enabledModules: ['itemshop'], output }); session = await new ModuleRegistry([...boundaries({ sys: { mode: 'command', command: 'special' } }, []), itemshopModule]).createSession({ services: { templates, output, database } });
  output.write('DISCARD'); await session.call('itemshop', 'act'); const html = session.state('player').cmd; assert.ok(!html.startsWith('DISCARD')); assert.ok(html.indexOf('id="bshop16"') < html.indexOf('id="bshop12"')); assert.match(html, /postCmd\('gamecmd','command.php'\)/);
  await session.call('itemshop', 'shoplist', '1'); assert.match(session.state('player').cmd, /id="buynum" name="buynum"/); assert.match(session.state('player').cmd, /name="shoptype" value="1"/);
});

test('generated ordered-array shop override retains category rows',async()=>{const rows=['1,2,3,4,改补给,HB,7,8,,\n','22,1,3,0,新类,X,1,1,,\n'];assert.deepEqual(await actual({calls:[['get_shopitem_list',new Map(rows.map((row,key)=>[key,row]))]]}),await actual({calls:[['get_shopitem_list',rows]]}));});
