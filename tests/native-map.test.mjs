import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { mapModule } from '../native/gameplay/map.mjs';
import { createPhp74Random } from '../native/random.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const base = { arealist: [0, 5, 32, 7, 34, 10, 12, 20, 9, 13, 25, 31, 29], areanum: 1, gametype: 0, hack: 0, gamevars: [], now: 1700000000, areatime: 1700000030, gamestate: 20, alivenum: 8, validnum: 10, weather: 1, starttime: 1699999800, areawarn: 0, uip: [], sec: null, min: null, hour: null, day: null, month: null, year: null, wday: null };
// Convert JS sparse list results to PHP JSON's preserved keys. This does not
// renumber the arrays consumed by gameplay or by the random service.
function wire(value) {
  if (value === undefined) return null;
  if (Array.isArray(value)) {
    const keys = Object.keys(value);
    if (!keys.length) return [];
    if (keys.length !== value.length) return Object.fromEntries(keys.map(key => [key, wire(value[key])]));
    return value.map(wire);
  }
  if (value !== null && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, wire(child)]));
  return value;
}

const fixtureSource = String.raw`<?php
namespace sys {
 function load_gameinfo_post_work_core(){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['load'];}
 function reset_game(){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['reset'];}
 function rs_game($mode=0){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['rs_game',$mode];}
 function updategame(){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['update'];}
 function parse_news(...$args){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=array_merge(['parse_news'],$args);return 'previous news';}
 function gameover(...$args){$GLOBALS['trace'][]=array_merge(['gameover'],$args);$GLOBALS['___LOCAL_SYS__VARS__gamestate']=0;}
 function addnews(...$args){$GLOBALS['trace'][]=array_merge(['news'],$args);}
 function systemputchat(...$args){$GLOBALS['trace'][]=array_merge(['chat'],$args);}
}
namespace {
 define('IN_GAME',true);define('IN_MODULEMNG',true);define('GAME_ROOT',__DIR__.'/engine/');define('MOD_SYS',true);define('MOD_MAP',true);
 date_default_timezone_set('UTC');require GAME_ROOT.'include/global.func.php';require GAME_ROOT.'include/modules/modules.func.php';
 require GAME_ROOT.'include/modules/core/map/main.php';require GAME_ROOT.'include/modules/core/map/config/map.config.php';
 $input=json_decode(stream_get_contents(STDIN),true);$mapkeys=$input['mapkeys'];$syskeys=$input['syskeys'];
 $defaults=['all_plsno_cache'=>[]];foreach($mapkeys as $k)$defaults[$k]=$$k;
 foreach(['map'=>$mapkeys,'sys'=>$syskeys] as $mod=>$keys){
   if($mod==='map')$keys[]='all_plsno_cache';$imp='';
   foreach($keys as $k)$imp.='$'.$k.' = & $GLOBALS["___LOCAL_'.strtoupper($mod).'__VARS__'.$k.'"];';
   define('IMPORT_MODULE_'.strtoupper($mod).'_GLOBALS',$imp);
 }
 foreach(['load_gameinfo_post_work_core','reset_game','rs_game','updategame','parse_news'] as $fn)hook_register('sys',$fn);
 foreach(get_defined_functions()['user'] as $fn)if(strpos($fn,'map\\')===0&&$fn!=='map\\init')hook_register('map',substr($fn,4));
 $out=[];
 foreach($input['cases'] as $case){
   $trace=[];foreach($defaults as $k=>$v)$GLOBALS['___LOCAL_MAP__VARS__'.$k]=$v;
   foreach($case['map']??[] as $k=>$v)$GLOBALS['___LOCAL_MAP__VARS__'.$k]=$v;
   foreach($case['sys'] as $k=>$v)$GLOBALS['___LOCAL_SYS__VARS__'.$k]=$v;
   $GLOBALS['___CURSCRIPT']=$case['script']??'GAME';mt_srand($case['seed']);
   $returns=[];foreach($case['calls'] as $call){$fn='map\\'.$call[0];$returns[]=$fn(...array_slice($call,1));}
   $s=[];foreach($syskeys as $k)$s[$k]=$GLOBALS['___LOCAL_SYS__VARS__'.$k];
   $m=[];foreach(array_keys($defaults) as $k)$m[$k]=$GLOBALS['___LOCAL_MAP__VARS__'.$k];
   $out[]=['returns'=>$returns,'sys'=>$s,'map'=>$m,'trace'=>$trace,'next'=>mt_rand()];
 }
 echo json_encode($out,JSON_UNESCAPED_UNICODE|JSON_PARTIAL_OUTPUT_ON_ERROR);
}`;

test('native map preserves every declared config and area function against real PHP hook dispatch', { timeout: 30_000 }, async t => {
  const php = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', timeout: 10_000, windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires PHP 7.4 reference.'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true }); const root = await mkdtemp(path.join(parent, 'native-map-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  const sources = ['include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', 'include/modules/modules.func.php', 'include/modules/core/map/main.php', 'include/modules/core/map/config/map.config.php'];
  for (const source of sources) { const target = path.join(root, 'engine', source); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', source), target); }
  await mkdir(path.join(root, 'engine/include/modulemng'), { recursive: true }); await copyFile(path.join(project, 'engine/include/modulemng/modulemng.config.sample.php'), path.join(root, 'engine/include/modulemng/modulemng.config.php'));
  const fixture = path.join(root, 'reference.php'); await writeFile(fixture, fixtureSource);
  const calls = [];
  for (const wave of [-1, 0, 1, 2, 10]) calls.push(['get_current_area', wave], ['get_current_not_area', wave], ['get_arealist_nextadd', wave], ['get_areanames_nextadd', wave], ['get_areanames_nextadd', wave, 1]);
  for (const place of [0, 5, '7', 32, 888]) calls.push(['check_pls', place], ['is_plsno_available', place], ['check_in_forbidden_area', place], ['check_can_enter', place]);
  calls.push(['get_plsnum'], ['get_plsnum', 1], ['get_all_plsno'], ['get_all_plsno', 1], ['get_area_wavenum'], ['get_area_interval'], ['get_safe_plslist'], ['get_safe_plslist', false], ['get_next_areadata_html'], ['get_next_areadata_html', 1700100000]);
  const cases = [{ calls }];
  for (const seconds of [-61, -1, 0, 9, 10, 59, 60, 600]) cases.push({ sys: { areatime: base.now + seconds }, calls: [['init_areatiming']] });
  cases.push({ script: 'NEWS', calls: [['init_areatiming']] });
  cases.push({ calls: [['rs_game', 2], ['get_all_plsno'], ['get_next_areadata_html']] }, { map: { area_on_start: [0, 7, 20], areainterval: [15] }, calls: [['rs_game', 2], ['get_all_plsno'], ['get_safe_plslist']] });
  cases.push({ sys: { gamevars: { plsinfo: { 101: '其他地图', 102: '秘密入口' } } }, calls: [['load_gameinfo_post_work_core'], ['get_plsnum', 1], ['reset_game'], ['get_plsnum', 1]] });
  for (const state of [0, 10, 20, 30]) for (const alive of [0, 1, 8]) cases.push({ sys: { gamestate: state, alivenum: alive, hack: 2, now: base.areatime + 1 }, calls: [['add_once_area', base.areatime]] });
  cases.push({ sys: { areanum: 12, now: base.areatime + 1 }, calls: [['add_once_area', base.areatime]] });
  for (const valid of [0, 1]) for (const forbidden of [1, 5, 9]) cases.push({ sys: { areanum: forbidden, validnum: valid }, calls: [['check_game_stop_joining_when_area']] });
  cases.push({ sys: { now: base.areatime + 5500 }, calls: [['updategame']] }, { sys: { now: base.areatime - 59 }, calls: [['updategame'], ['updategame']] });
  for (const news of ['death11', 'addarea', 'unknown']) cases.push({ calls: [['parse_news', 7, news, '01', '02', '03', news === 'addarea' ? '0_5_32' : '甲', '', 7, '', '', []]] });
  const inputs = cases.map((scenario, index) => ({ ...scenario, sys: { ...structuredClone(base), ...scenario.sys }, seed: index + 543 }));
  const config = JSON.parse(await readFile(path.join(project, 'native/gameplay/map-config.json'), 'utf8'));
  const reference = spawnSync(php, ['-d', 'display_errors=stderr', fixture], { input: JSON.stringify({ cases: inputs, mapkeys: Object.keys(config), syskeys: Object.keys(base) }), encoding: 'utf8', timeout: 20_000, maxBuffer: 4 * 1024 * 1024, windowsHide: true });
  assert.equal(reference.status, 0, reference.stderr); assert.equal(reference.stderr, '');
  const expected = JSON.parse(reference.stdout);
  for (let index = 0; index < inputs.length; index++) {
    const input = inputs[index], trace = [], random = createPhp74Random(input.seed);
    const boundary = { name: 'sys', state: input.sys, functions: {
      load_gameinfo_post_work_core() { trace.push(['load']); }, reset_game() { trace.push(['reset']); }, rs_game(ctx, mode = 0) { trace.push(['rs_game', mode]); }, updategame() { trace.push(['update']); },
      parse_news(ctx, ...args) { trace.push(['parse_news', ...args]); return 'previous news'; },
      gameover(ctx, ...args) { trace.push(['gameover', ...args]); ctx.state().gamestate = 0; },
      addnews(ctx, ...args) { trace.push(['news', ...args]); }, systemputchat(ctx, ...args) { trace.push(['chat', ...args]); },
    } };
    const session = await new ModuleRegistry([boundary, mapModule]).createSession({ states: { map: input.map ?? {} }, services: { random, system: { request: { script: input.script ?? 'GAME' } } } });
    const returns = []; for (const [name, ...args] of input.calls) returns.push(await session.call('map', name, ...args));
    const actual = wire({ returns, sys: session.state('sys'), map: session.state('map'), trace, next: random.mtRand() });
    assert.deepEqual(actual, expected[index], `case ${index}: ${JSON.stringify(input.calls)}`);
  }
  t.diagnostic(`Compared ${inputs.length} sequences including all source config, forbidden-area boundaries, safe-list keys, warnings, game-end order, reset shuffle and next RNG value.`);
});
