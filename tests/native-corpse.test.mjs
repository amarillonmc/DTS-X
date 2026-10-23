import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { corpseModule } from '../native/gameplay/corpse.mjs';
import { createPhp74Random } from '../native/random.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const enemy = { pid: 2, name: '乙', hp: 0, pls: 7, type: 0, money: '21', endtime: 100, state: 23, wep: '枪', wepk: 'WG', wepe: 12, weps: '3', wepsk: 'x', arb: '衣', arbk: 'DB', arbe: '5', arbs: 8, arbsk: '', itm3: '面包', itmk3: 'HH', itme3: 5, itms3: '2', itmsk3: '', extension: 'local field' };
const initial = {
  sys: { now: 108, tablepre: 'test_', mode: 'previous', command: '', gamestate: 20, nowep: 'sys fist', nosta: 'sys infinity', hour: '11', min: '22', sec: '33' },
  player: { pid: 1, name: '甲', money: 4, pls: 7, cmd: 'previous cmd', main: 'previous main', action: 'corpse2', sdata: { pid: 1, name: '甲' }, itm0: '', itmk0: '', itme0: 0, itms0: 0, itmsk0: '' },
  logger: { log: '' },
  metman: { battle_title: '', ...Object.fromEntries(Object.keys(enemy).filter(key => key !== 'extension').map(key => [`w_${key}`, null])) },
  weapon: { nowep: 'weapon fist', nosta: 'weapon infinity' }, input: {}, itemmain: {},
};
function normalize(value) {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value.map(normalize);
  if (value !== null && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, normalize(child)]));
  return value;
}
function scenarios() {
  const cases = [];
  const add = (label, method, args = [], changes = {}) => cases.push({ label, method, args, seed: cases.length + 40, edata: structuredClone(enemy), ...changes });
  for (const time of [102, 103, 104, '104']) for (const previous of [0, 1]) add(`protect ${time} ${previous}`, 'check_corpse_discover', [], { edata: { ...enemy, endtime: time }, previous });
  for (const seed of [1, 2, 3, 99, 102]) add(`roll ${seed}`, 'check_corpse_discover_dice', [], { seed });
  for (const item of ['wep', 'arb', 'itm3', 'itm30', 'money', 'destroy', 'invalid']) add(`take ${item}`, 'getcorpse_action', [item]);
  for (const [field, value] of [['weps', '0'], ['wepk', 'WN'], ['wepk', 'DN'], ['wepk', '']]) add(`empty ${field} ${value}`, 'getcorpse_action', ['wep'], { edata: { ...enemy, [field]: value } });
  add('take weapon without weapon module', 'getcorpse_action', ['wep'], { noWeapon: true });
  for (const item of ['money', 'destroy']) add(`denied ${item}`, 'getcorpse_action', [item], { deny: true });
  add('destroy special NPC no news', 'getcorpse_action', ['destroy'], { edata: { ...enemy, type: '90' } });
  for (const action of ['', 'corpse', 'corpse0', 'pacorpse2', 'corpse2', 'strangecorpse2']) add(`action ${action}`, 'getcorpse', ['money'], { player: { action } });
  add('missing row', 'getcorpse', ['money'], { exists: false });
  add('living target', 'getcorpse', ['money'], { edata: { ...enemy, hp: '1' } });
  add('different map', 'getcorpse', ['money'], { edata: { ...enemy, pls: 8 } });
  add('full get item order', 'getcorpse', ['itm3']);
  for (const amount of [0, '0', 21]) for (const type of [0, 90]) add(`show ${amount} ${type}`, 'findcorpse', [], { edata: { ...enemy, money: amount, type }, buffer: 'earlier output' });
  add('show denied money destroy', 'findcorpse', [], { deny: true });
  add('encounter dead', 'meetman', ['2']);
  add('encounter living', 'meetman', [2], { edata: { ...enemy, hp: 5 } });
  for (const gamestate of [20, 40]) for (const action of ['pacorpse2', 'corpse2', 'menu']) add(`prepare ${gamestate} ${action}`, 'prepare_initial_response_content', [], { sys: { gamestate }, player: { action } });
  for (const command of ['enter', 'menu']) for (const action of ['pacorpse2', 'corpse2', 'menu']) add(`act ${command} ${action}`, 'act', [], { sys: { command }, player: { action } });
  add('act picks money', 'act', [], { sys: { mode: 'corpse', command: 'money' } });
  add('act lost corpse', 'act', [], { sys: { command: 'enter' }, exists: false });
  for (const keep of [undefined, 0, 1]) for (const action of ['pacorpse2', 'corpse2', 'other']) add(`post ${keep} ${action}`, 'post_act', [], { player: { action, sdata: { pid: 1, name: '甲', ...(keep === undefined ? {} : { keep_corpse: keep }) } } });
  for (const news of ['cdestroy', 'other']) add(`news ${news}`, 'parse_news', [7, news, '01', '02', '03', '甲', '乙', '', '', '', []]);
  add('template filename', 'get_corpse_filename');
  return cases;
}
function statesFor(input) {
  return Object.fromEntries(Object.entries(initial).map(([name, state]) => [name, { ...structuredClone(state), ...structuredClone(input[name] ?? {}) }]));
}
async function actual(input, changes = {}) {
  const trace = [], edata = structuredClone(input.edata), states = statesFor(input), random = createPhp74Random(input.seed);
  let output = input.buffer ?? '';
  const previous = name => (ctx, ...args) => { trace.push(['previous', name, ...structuredClone(args)]); };
  const definitions = [
    { name: 'sys', state: states.sys, functions: { act: previous('act'), post_act: previous('post_act'), prepare_initial_response_content: previous('prepare_initial_response_content'), parse_news(ctx, ...args) { trace.push(['previous', 'parse_news', ...args]); return 'old news'; }, addnews(ctx, ...args) { trace.push(['news', ...args]); } } },
    { name: 'player', state: states.player, functions: { fetch_playerdata_by_pid(ctx, id) { trace.push(['fetch', id]); return structuredClone(edata); }, player_save(ctx, data) { trace.push(['save', structuredClone(data)]); } } },
    { name: 'logger', state: states.logger },
    { name: 'metman', state: states.metman, functions: { check_corpse_discover() { trace.push(['check']); return input.previous ?? 1; }, meetman: previous('meetman'), init_battle(ctx, value) { trace.push(['init_battle', value]); } } },
    { name: 'input', state: states.input },
    { name: 'itemmain', state: states.itemmain, functions: { itemget(ctx) { trace.push(['itemget', ...['itm0','itmk0','itme0','itms0','itmsk0'].map(key => ctx.state('player')[key])]); }, parse_item_words(ctx, data, simple) { trace.push(['words', structuredClone(data), simple]); return { money_words: 'parsed money' }; } } },
    ...(!input.noWeapon ? [{ name: 'weapon', state: states.weapon }] : []), corpseModule,
    { name: 'corpse_fixture', dependencies: ['corpse'], functions: {
      async check_can_destroy(ctx, data) { data.money = -100; return !input.deny && await ctx.next(data); },
      async check_can_pick_money(ctx, data) { data.money = -100; return !input.deny && await ctx.next(data); },
    } },
  ];
  const services = { random,
    database: { async query(sql) { trace.push(['query', sql]); return input.exists === false ? [] : [structuredClone(edata)]; } },
    templates: { names: { MOD_CORPSE_CORPSE: 'corpse-template', MOD_METMAN_MEETMAN: 'meet-template' }, async render(name, scope) {
      trace.push(['render', name, scope.default_selection, scope.w_money, scope.w_type, scope.w_extension, scope.w_money_words]);
      return `<b>${scope.default_selection}</b>`;
    } },
    output: { async take() { const content = output; output = ''; return content; } }, ...changes,
  };
  const session = await new ModuleRegistry(definitions).createSession({ services });
  const referenceFirst = ['check_corpse_discover', 'check_corpse_discover_dice', 'getcorpse_action', 'findcorpse'];
  const args = referenceFirst.includes(input.method) ? [edata, ...input.args] : input.args;
  const result = await session.call('corpse', input.method, ...args);
  return normalize({ result, edata, sys: session.state('sys'), player: session.state('player'), logger: session.state('logger'), metman: session.state('metman'), trace, output, next: random.mtRand() });
}

const source = String.raw`<?php
namespace sys {
 function act(){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['previous','act'];}
 function post_act(){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['previous','post_act'];}
 function prepare_initial_response_content(){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['previous','prepare_initial_response_content'];}
 function parse_news(...$args){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=array_merge(['previous','parse_news'],$args);return 'old news';}
 function addnews(...$args){$GLOBALS['trace'][]=array_merge(['news'],$args);}
}
namespace player {
 function fetch_playerdata_by_pid($id){$GLOBALS['trace'][]=['fetch',$id];return $GLOBALS['edata'];}
 function player_save($data){$GLOBALS['trace'][]=['save',$data];}
}
namespace metman {
 function check_corpse_discover(&$data){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['check'];return $GLOBALS['input']['previous']??1;}
 function meetman($sid){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['previous','meetman',$sid];}
 function init_battle($value){$GLOBALS['trace'][]=['init_battle',$value];}
}
namespace itemmain {
 function itemget(){eval(import_module('player'));$GLOBALS['trace'][]=['itemget',$itm0,$itmk0,$itme0,$itms0,$itmsk0];}
 function parse_item_words($data,$simple){$GLOBALS['trace'][]=['words',$data,$simple];return ['money_words'=>'parsed money'];}
}
namespace corpse_fixture {
 function check_can_destroy($data){if(eval(__MAGIC__))return $___RET_VALUE;$data['money']=-100;return empty($GLOBALS['input']['deny'])&&$chprocess($data);}
 function check_can_pick_money($data){if(eval(__MAGIC__))return $___RET_VALUE;$data['money']=-100;return empty($GLOBALS['input']['deny'])&&$chprocess($data);}
}
namespace {
 define('IN_GAME',true);define('IN_MODULEMNG',true);define('GAME_ROOT',__DIR__.'/engine/');
 require GAME_ROOT.'include/modules/modules.func.php';
 function addnews($t=0,$n='',$a='',$b='',$c='',$d='',$e=''){\sys\addnews($t,$n,$a,$b,$c,$d,$e);}
 require GAME_ROOT.'include/modules/base/corpse/main.php';require GAME_ROOT.'include/modules/base/corpse/config/corpse.config.php';
 $input=json_decode(stream_get_contents(STDIN),true);$edata=$input['edata'];$trace=[];
 if(empty($input['noWeapon']))define('MOD_WEAPON',true);
 define('MOD_CORPSE_CORPSE','corpse-template');define('MOD_METMAN_MEETMAN','meet-template');
 class Database {
   function query($sql){$GLOBALS['trace'][]=['query',$sql];return !isset($GLOBALS['input']['exists'])||$GLOBALS['input']['exists']?[1]:[];}
   function num_rows($result){return count($result);}
 }
 $states=$input['states'];$states['corpse']=array_intersect_key(get_defined_vars(),array_flip($input['corpsekeys']));$states['sys']['db']=new Database;
 foreach($states as $mod=>$state){$imp='';foreach($state as $key=>$value){$global='___LOCAL_'.strtoupper($mod).'__VARS__'.$key;$GLOBALS[$global]=$value;$imp.='$'.$key.' = & $GLOBALS["'.$global.'"];';}define('IMPORT_MODULE_'.strtoupper($mod).'_GLOBALS',$imp);}
 foreach(['act','post_act','prepare_initial_response_content','parse_news'] as $fn)hook_register('sys',$fn);
 foreach(['check_corpse_discover','meetman'] as $fn)hook_register('metman',$fn);
 foreach(get_defined_functions()['user'] as $fn)if(strpos($fn,'corpse\\')===0&&$fn!=='corpse\\init')hook_register('corpse',substr($fn,7));
 foreach(['check_can_destroy','check_can_pick_money'] as $fn)hook_register('corpse_fixture',$fn);
 function template($name){$GLOBALS['template_name']=$name;return __DIR__.'/template.php';}
 mt_srand($input['seed']);ob_start();echo $input['buffer']??'';
 $fn='corpse\\'.$input['method'];$args=$input['args'];
 if(in_array($input['method'],['check_corpse_discover','check_corpse_discover_dice','getcorpse_action','findcorpse'])) $result=$fn($edata,...$args);else $result=$fn(...$args);
 $output=ob_get_clean();$result=['result'=>$result,'edata'=>$edata,'trace'=>$trace,'output'=>$output,'next'=>mt_rand()];
 foreach(['sys','player','logger','metman'] as $mod){$out=[];foreach($input['states'][$mod] as $key=>$value)$out[$key]=$GLOBALS['___LOCAL_'.strtoupper($mod).'__VARS__'.$key];$result[$mod]=$out;}
 echo json_encode($result,JSON_UNESCAPED_UNICODE);
}`;

test('corpse rules match real PHP protection, loot, rendering, action lifecycle and mutation order', async t => {
  const php = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', timeout: 10_000, windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires PHP 7.4 reference.'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true }); const root = await mkdtemp(path.join(parent, 'native-corpse-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  const sources = ['include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', 'include/modules/modules.func.php', 'include/modules/base/corpse/main.php', 'include/modules/base/corpse/config/corpse.config.php'];
  for (const file of sources) { const target = path.join(root, 'engine', file); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', file), target); }
  await mkdir(path.join(root, 'engine/include/modulemng'), { recursive: true }); await copyFile(path.join(project, 'engine/include/modulemng/modulemng.config.sample.php'), path.join(root, 'engine/include/modulemng/modulemng.config.php'));
  const fixture = path.join(root, 'reference.php'); await writeFile(fixture, source);
  await writeFile(path.join(root, 'template.php'), `<?php $GLOBALS['trace'][]=['render',$GLOBALS['template_name'],$default_selection,$w_money,$w_type,$w_extension,$w_money_words];echo '<b>'.$default_selection.'</b>';`);
  const cases = scenarios();
  for (const input of cases) {
    const reference = spawnSync(php, ['-d', 'display_errors=stderr', fixture], { input: JSON.stringify({ ...input, states: statesFor(input), corpsekeys: Object.keys(corpseModule.state()) }), encoding: 'utf8', timeout: 15_000, windowsHide: true });
    assert.equal(reference.status, 0, reference.stderr); assert.equal(reference.stderr, '', input.label);
    assert.deepEqual(await actual(input), JSON.parse(reference.stdout), input.label);
  }
  t.diagnostic(`Compared ${cases.length} real-source scenarios, reference mutation, saved snapshots, output/selection, exact queries and next RNG state.`);
});

test('corpse rendering, data access and RNG require explicit native services', async () => {
  const scenario = scenarios().find(input => input.method === 'findcorpse');
  await assert.rejects(actual(scenario, { templates: {} }), /requires template binding/);
  await assert.rejects(actual(scenario, { templates: { names: { MOD_METMAN_MEETMAN: 'meet' } } }), /requires templates.render/);
  await assert.rejects(actual(scenario, { output: {} }), /requires output.take/);
  await assert.rejects(actual({ ...scenario, method: 'getcorpse', args: ['money'] }, { database: {} }), /requires database.query/);
  await assert.rejects(actual({ ...scenario, method: 'check_corpse_discover_dice', args: [] }, { random: {} }), /requires random.rand/);
});
