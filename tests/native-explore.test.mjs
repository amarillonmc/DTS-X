import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { exploreModule } from '../native/gameplay/explore.mjs';
import { mapModule } from '../native/gameplay/map.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const sys = { mode: 'command', command: '', arealist: [0, 1, 2, 3, 4, 5], areanum: 1, hack: 0 };
const operation = (name, ...args) => [name, ...args];
function scenarios() {
  const cases = [];
  const add = (label, calls, extra = {}) => cases.push({ label, calls, sys: { ...sys }, player: { pls: '1', sp: '100' }, input: {}, ...extra });
  for (const destination of ['main', 0, '0', '1', 1, 2, '2', 99]) add(`move ${destination} (${typeof destination})`, [operation('allow_move_check', destination), operation('move', destination)]);
  for (const sp of [0, '1', 14, '15', 16, '100']) add(`stamina ${sp}`, [operation('allow_move_check', 2), operation('move', 2), operation('allow_search_check'), operation('search')], { player: { pls: 1, sp } });
  for (const cost of [-2, 0, '1', 1, '1.5', 2.5, '15', 100]) add(`cost override ${cost} (${typeof cost})`, [operation('allow_move_check', '2'), operation('allow_search_check'), operation('move', '2'), operation('search')], { cost });
  add('forbidden search', [operation('allow_search_check'), operation('search')], { player: { pls: '0', sp: 100 } });
  add('hack permits forbidden destination', [operation('move', '0'), operation('search')], { sys: { ...sys, hack: '1' } });
  add('default move', [operation('move')]);
  add('base discovery entry points', [operation('discover', 'search2'), operation('search_area'), operation('move_to_area', 2)]);
  add('asynchronous discovery override succeeds', [operation('search_area'), operation('search'), operation('move', '2')], { found: true });
  for (const command of ['move', 'search', 'other']) for (const mode of ['command', 'combat']) add(`act ${mode}/${command}`, [operation('act')], { sys: { ...sys, mode, command }, input: { moveto: '3' } });
  return cases;
}
function definitions(input, effects) {
  return [
    { name: 'sys', state: () => input.sys, functions: { act() { effects.push(['base-act']); } } },
    { name: 'input', state: () => input.input }, { name: 'logger', state: () => ({ log: '' }) }, { name: 'player', state: () => input.player },
    mapModule, exploreModule,
    { name: 'fixture', dependencies: ['explore'], functions: {
      async calculate_move_sp_cost(ctx) { await Promise.resolve(); return Object.hasOwn(input, 'cost') ? input.cost : await ctx.next(); },
      async calculate_search_sp_cost(ctx) { await Promise.resolve(); return Object.hasOwn(input, 'cost') ? input.cost : await ctx.next(); },
      async discover(ctx, mode) { effects.push(['discovery', mode, ctx.state('player').pls, ctx.state('player').sp]); await Promise.resolve(); return input.found ? true : await ctx.next(mode); },
    } },
  ];
}
const oracle = String.raw`<?php
namespace sys { function act(){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['effects'][]=['base-act'];} }
namespace fixture {
 function calculate_move_sp_cost(){if(eval(__MAGIC__))return $___RET_VALUE;global $case;return array_key_exists('cost',$case)?$case['cost']:$chprocess();}
 function calculate_search_sp_cost(){if(eval(__MAGIC__))return $___RET_VALUE;global $case;return array_key_exists('cost',$case)?$case['cost']:$chprocess();}
 function discover($mode){if(eval(__MAGIC__))return $___RET_VALUE;global $case,$effects;$effects[]=['discovery',$mode,get_var_in_module('pls','player'),get_var_in_module('sp','player')];return !empty($case['found'])?true:$chprocess($mode);}
}
namespace {
 define('IN_GAME',true);define('GAME_ROOT',__DIR__.'/engine/');error_reporting(E_ALL & ~E_NOTICE);ini_set('display_errors','stderr');
 require GAME_ROOT.'include/modules/modules.func.php';require GAME_ROOT.'include/modules/core/map/main.php';require GAME_ROOT.'include/modules/core/map/config/map.config.php';require GAME_ROOT.'include/modules/base/explore/main.php';require GAME_ROOT.'include/modules/base/explore/config/explore.config.php';
 function bind_state($name,$values){$imports='';foreach($values as $key=>$value){$global='___LOCAL_'.strtoupper($name).'__VARS__'.$key;$GLOBALS[$global]=$value;$imports.='global $'.$global.';$'.$key.'=&$'.$global.';';}define('MOD_'.strtoupper($name),true);define('IMPORT_MODULE_'.strtoupper($name).'_GLOBALS',$imports);}
 function reset_state($name,$values){foreach($values as $key=>$value)$GLOBALS['___LOCAL_'.strtoupper($name).'__VARS__'.$key]=$value;}
 $input=json_decode(stream_get_contents(STDIN),true);$map=[];foreach($input['mapkeys'] as $key)$map[$key]=$$key;$map['all_plsno_cache']=[];
 bind_state('map',$map);bind_state('sys',$input['cases'][0]['sys']);bind_state('player',$input['cases'][0]['player']);bind_state('logger',['log'=>'']);bind_state('input',['moveto'=>null]);bind_state('explore',[]);bind_state('fixture',[]);
 foreach(['sys','map','explore','fixture'] as $module)foreach(get_defined_functions()['user'] as $fn)if(strpos($fn,$module.'\\')===0&&substr($fn,strlen($module)+1)!='init')hook_register($module,substr($fn,strlen($module)+1));
 $out=[];foreach($input['cases'] as $case){$effects=[];reset_state('sys',$case['sys']);reset_state('player',$case['player']);reset_state('map',$map);reset_state('logger',['log'=>'']);reset_state('input',['moveto'=>$case['input']['moveto']??null]);$returns=[];foreach($case['calls'] as $call){$fn='explore\\'.$call[0];$returns[]=$fn(...array_slice($call,1));}$player=[];foreach($case['player'] as $key=>$value)$player[$key]=get_var_in_module($key,'player');$sys=[];foreach($case['sys'] as $key=>$value)$sys[$key]=get_var_in_module($key,'sys');$out[]=['returns'=>$returns,'player'=>$player,'sys'=>$sys,'log'=>get_var_in_module('log','logger'),'effects'=>$effects];}
 echo json_encode($out,JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);
}`;

test('explore native function list covers the complete original module', async () => {
  const source = await readFile(path.join(project, 'engine/include/modules/base/explore/main.php'), 'utf8');
  const names = [...source.matchAll(/^\s*function\s+(\w+)\s*\(/gm)].map(match => match[1]).filter(name => name !== 'init');
  assert.deepEqual(Object.keys(exploreModule.functions).sort(), names.sort());
  assert.deepEqual(exploreModule.dependencies, ['sys', 'input', 'map', 'logger', 'player']);
  assert.ok(Object.values(exploreModule.functions).every(fn => fn.constructor.name === 'AsyncFunction'));
});

test('exploration with real map rules matches unchanged PHP, including async cost/discovery hooks', { timeout: 30_000 }, async t => {
  const php = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true, timeout: 10_000 });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires PHP 7.4 development oracle.'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true }); const temporary = await mkdtemp(path.join(parent, 'native-explore-'));
  try {
    const files = ['include/modules/modules.func.php', 'include/modules/core/map/main.php', 'include/modules/core/map/config/map.config.php', 'include/modules/base/explore/main.php', 'include/modules/base/explore/config/explore.config.php'];
    for (const file of files) { const target = path.join(temporary, 'engine', file); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', file), target); }
    await mkdir(path.join(temporary, 'engine/include/modulemng'), { recursive: true }); await writeFile(path.join(temporary, 'engine/include/modulemng/modulemng.config.php'), '<?php $___MOD_CODE_ADV2=0;$___MOD_SRV=0;');
    await writeFile(path.join(temporary, 'oracle.php'), oracle);
    const inputs = scenarios(), config = JSON.parse(await readFile(path.join(project, 'native/gameplay/map-config.json'), 'utf8'));
    const reference = spawnSync(php, ['-d', 'display_errors=stderr', path.join(temporary, 'oracle.php')], { input: JSON.stringify({ cases: inputs, mapkeys: Object.keys(config) }), encoding: 'utf8', windowsHide: true, timeout: 20_000, maxBuffer: 4 * 1024 * 1024 });
    assert.equal(reference.status, 0, reference.stderr); assert.equal(reference.stderr, ''); const expected = JSON.parse(reference.stdout);
    for (const [index, input] of inputs.entries()) {
      const effects = [], session = await new ModuleRegistry(definitions(input, effects)).createSession();
      const returns = []; for (const [name, ...args] of input.calls) returns.push(await session.call('explore', name, ...args) ?? null);
      const actual = JSON.parse(JSON.stringify({ returns, player: session.state('player'), sys: session.state('sys'), log: session.state('logger').log, effects }));
      assert.deepEqual(actual, expected[index], input.label);
    }
    t.diagnostic(`Compared ${inputs.length} exploration sequences and source scalar types, stamina, locations, original messages and hook order.`);
  } finally { assert.ok(path.resolve(temporary).startsWith(path.resolve(parent) + path.sep)); await rm(temporary, { recursive: true, force: true }); }
});
