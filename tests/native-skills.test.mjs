import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { playerModule } from '../native/gameplay/player.mjs';
import { createSkillCatalog, skillbaseModule } from '../native/gameplay/skills.mjs';
import { ModuleRegistry, reference } from '../native/modules/registry.mjs';
import { createDatabase } from '../native/storage/database.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const playerSql = await readFile(path.join(project, 'engine/gamedata/sql/players.sql'), 'utf8');
const schema = [...playerSql.matchAll(/^\s*`([^`]+)`\s+([^\s,]+(?:\s+unsigned)?)/gm)].map(([, Field, Type]) => ({ Field, Type }));
const sourceFiles = ['include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php',
  'include/modules/modules.func.php', 'include/modules/core/player/main.php', 'include/modules/core/player/config/player.config.php',
  'include/modules/base/skillbase/main.php', 'include/db/db_mysqli.class.php', 'gamedata/sql/players.sql'];
const info = { 2: 'debuff;test;', 20: 'card;unique;', 64: 'club;', 99: 'unloaded;' };
const basePlayer = (pid = 1, extra = {}) => ({ pid, name: `角色${pid}`, type: 0, hp: 100, state: 0, player_dead_flag: 0,
  nskill: 'auacba', nskillpara: 'MjBfbHZs,Mw==,Ml90c2tfZXhwaXJl,OTk=,Ml9lcXBza19mbGFn,MQ==,', ...extra });
const baseSys = input => ({ tablepre: 'bra_', gtablepre: 'bra_', groomid: 1, gamestate: input.gamestate ?? 30,
  gametype: input.gametype ?? 0, pdata_pool: [], pdata_origin_pool: [], pdata_lock_pool: [] });
const clone = value => structuredClone(value);
const listEntries = value => value instanceof Map ? [...value] : value == null ? null : Object.entries(value);
const canonical = value => {
  if (value === undefined) return null;
  if (value instanceof Map) return canonical([...value]);
  if (ArrayBuffer.isView(value)) return { bytes: Buffer.from(value).toString('base64') };
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, canonical(item)]));
};

async function nativeSession(input, actualDatabase = null) {
  const trace = [], rows = input.rows ?? [basePlayer()];
  const boundary = {
    async query(sql) {
      if (sql.startsWith('DESCRIBE ')) return schema;
      trace.push(['query', sql]);
      const pid = sql.match(/pid = '([^']*)'/)?.[1];
      const found = rows.filter(row => String(row.pid) === pid);
      return clone(sql.startsWith('SELECT pid') ? found.map(row => ({ pid: row.pid })) : found);
    },
    async arrayUpdate(table, data, where) { trace.push(['update', table, clone(data), where]); },
  };
  const definitions = [
    { name: 'sys', state: () => baseSys(input), functions: { async post_enterbattlefield_events(ctx, pa) { trace.push(['enter-base', pa.pid]); } } },
    { name: 'map' }, { name: 'input' }, playerModule, skillbaseModule,
    ...[2, 20, 64].map(skillid => ({ name: `skill${skillid}`, dependencies: ['skillbase'], functions: {
      async [`acquire${skillid}`](ctx, pa) { trace.push(['acquire', skillid, pa.pid]); pa.hp = Number(pa.hp) + 1; await ctx.call('skillbase', 'skill_setvalue', skillid, 'acquired', 'yes', pa); },
      async [`lost${skillid}`](ctx, pa) { trace.push(['lost', skillid, pa.pid]); pa.hp = Number(pa.hp) - 1; await ctx.call('skillbase', 'skill_delvalue', skillid, 'acquired', pa); },
      ...(skillid === 20 ? { async check_unlocked20(ctx, pa) { trace.push(['unlock', pa.pid]); return Number(pa.hp) >= 100; } } : {}),
    } })),
    { name: 'fixture_skills', dependencies: ['skillbase'], functions: {
      async skill_onload_event(ctx, pa) { trace.push(['onload', pa.pid]); await ctx.next(pa); if (input.onload) await ctx.call('skillbase', 'skill_acquire', 2, pa); },
      async skill_onsave_event(ctx, pa) { trace.push(['onsave', pa.pid]); if (input.onsave) await ctx.call('skillbase', 'skill_lost', 2, pa); await ctx.next(pa); },
      async check_skill_available(ctx, skillid, pa) { trace.push(['available', skillid, pa.pid]); await ctx.next(skillid, pa); },
      async skill_enabled_core(ctx, skillid, pa) { trace.push(['enabled', skillid, pa.pid ?? null]); return input.disabled !== skillid && await ctx.next(skillid, pa); },
    } },
  ];
  const session = await new ModuleRegistry(definitions).createSession({
    states: { player: { pid: input.currentPid ?? 1 }, skillbase: { valid_skills: input.validSkills ?? {} } },
    services: { database: actualDatabase ?? boundary, skills: createSkillCatalog(definitions, info) },
  });
  return { session, trace };
}

async function runNative(input) {
  const { session, trace } = await nativeSession(input), invoke = (fn, ...args) => session.call('skillbase', fn, ...args);
  const state = session.state('skillbase'), player = session.state('player');
  let pa = clone(input.pa ?? basePlayer()), result = [];
  if (input.mode === 'codec') {
    for (const operation of input.operations) {
      try {
        let args = operation.args;
        if (operation.fn === 'skillbase_save_process') args = [new Map(args[0]), new Map(args[1])];
        const value = operation.fn === 'roundtrip' ? await invoke('skillbase_save_process', ...await invoke('skillbase_load_process', ...args)) : await invoke(operation.fn, ...args);
        result.push(operation.fn === 'skillbase_load_process' ? value.map(listEntries)
          : operation.fn === 'parse_skill_parameter_data' ? listEntries(value) : value);
      } catch (error) { result.push({ error: error.message }); }
    }
    return canonical(result);
  }
  if (input.mode === 'player') {
    pa = await session.call('player', 'fetch_playerdata_by_pid', pa.pid);
    await session.call('player', 'load_playerdata', pa);
    for (const operation of input.operations ?? []) {
      const holder = { pa: operation.target === 'emptySlot' ? {} : null };
      const slot = operation.target?.endsWith('Slot');
      const target = slot ? reference(holder, 'pa') : operation.target === 'self' ? null : operation.target === 'sdata' ? player.sdata : pa;
      const value = await invoke(operation.fn, ...operation.args, target, ...(operation.noCover === undefined ? [] : [operation.noCover]));
      result.push(slot ? [value, clone(holder.pa)] : value);
    }
    await session.call('player', 'player_save', player.sdata, input.inProc ?? 0);
  } else {
    await invoke('skillbase_load', pa, input.dummy ?? false);
    for (const operation of input.operations ?? []) {
      const target = operation.target === 'self' ? null : pa;
      result.push(await invoke(operation.fn, ...operation.args, target, ...(operation.noCover === undefined ? [] : [operation.noCover])));
    }
    if (input.enter) await invoke('post_enterbattlefield_events', pa);
    if (input.save !== false) await invoke('skillbase_save', pa, input.inProc ?? 0);
  }
  return canonical({ pa, result, trace, state: { ppid: state.ppid, acquired: listEntries(state.acquired_list), parameters: listEntries(state.parameter_list) },
    player: { pid: player.pid, hp: player.hp, nskill: player.nskill, nskillpara: player.nskillpara, sdata: player.sdata } });
}

const phpFixture = String.raw`<?php
namespace sys { function post_enterbattlefield_events(&$pa){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['enter-base',$pa['pid']];} }
namespace player { function file_exists($name){return false;} function file_put_contents($path,$data,$flags=0){return strlen($data);} }
namespace skill2 {
 function acquire2(&$pa){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['acquire',2,$pa['pid']];$pa['hp']+=1;\skillbase\skill_setvalue(2,'acquired','yes',$pa);}
 function lost2(&$pa){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['lost',2,$pa['pid']];$pa['hp']-=1;\skillbase\skill_delvalue(2,'acquired',$pa);}
}
namespace skill20 {
 function acquire20(&$pa){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['acquire',20,$pa['pid']];$pa['hp']+=1;\skillbase\skill_setvalue(20,'acquired','yes',$pa);}
 function lost20(&$pa){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['lost',20,$pa['pid']];$pa['hp']-=1;\skillbase\skill_delvalue(20,'acquired',$pa);}
 function check_unlocked20(&$pa){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['unlock',$pa['pid']];return $pa['hp']>=100;}
}
namespace skill64 {
 function acquire64(&$pa){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['acquire',64,$pa['pid']];$pa['hp']+=1;\skillbase\skill_setvalue(64,'acquired','yes',$pa);}
 function lost64(&$pa){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['lost',64,$pa['pid']];$pa['hp']-=1;\skillbase\skill_delvalue(64,'acquired',$pa);}
}
namespace fixture_skills {
 function skill_onload_event(&$pa){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['onload',$pa['pid']];$chprocess($pa);if(!empty($GLOBALS['input']['onload']))\skillbase\skill_acquire(2,$pa);}
 function skill_onsave_event(&$pa){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['onsave',$pa['pid']];if(!empty($GLOBALS['input']['onsave']))\skillbase\skill_lost(2,$pa);$chprocess($pa);}
 function check_skill_available($skillid,&$pa){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['available',$skillid,$pa['pid']];$chprocess($skillid,$pa);}
 function skill_enabled_core($skillid,&$pa){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['enabled',$skillid,$pa['pid']??null];return ($GLOBALS['input']['disabled']??null)!==$skillid&&$chprocess($skillid,$pa);}
}
namespace {
 define('IN_GAME',true);define('GAME_ROOT',__DIR__.'/engine/');error_reporting(E_ALL & ~E_NOTICE);ini_set('display_errors','stderr');
 require GAME_ROOT.'include/modules/modules.func.php';$input=json_decode(stream_get_contents(STDIN),true);$trace=[];
 foreach($input['sourceFiles'] as $file)if($file!='include/modules/modules.func.php'&&substr($file,-4)==='.php')require_once GAME_ROOT.$file;
 class FixtureResult {public $rows,$i=0;function __construct($rows){$this->rows=$rows;}}
 class FixtureDatabase {
  function query($sql){global $input,$trace;if(strpos($sql,'DESCRIBE ')===0)return new FixtureResult($input['schema']);$trace[]=['query',$sql];preg_match("/pid = '([^']*)'/",$sql,$match);$rows=array_values(array_filter($input['rows'],function($row)use($match){return (string)$row['pid']===$match[1];}));if(strpos($sql,'SELECT pid')===0)$rows=array_map(function($r){return ['pid'=>$r['pid']];},$rows);return new FixtureResult($rows);}
  function num_rows($r){return count($r->rows);}function fetch_array($r){return $r->rows[$r->i++]??null;}
  function queries($sql){}
  function array_update($table,$data,$where,$old=null){$GLOBALS['trace'][]=['update',$table,$data,$where];}
 }
 function bind_state($name,$values){$imports='';foreach($values as $key=>$value){$global='___LOCAL_'.strtoupper($name).'__VARS__'.$key;$GLOBALS[$global]=$value;$imports.='global $'.$global.';$'.$key.'=&$'.$global.';';}define('MOD_'.strtoupper($name),true);define('IMPORT_MODULE_'.strtoupper($name).'_GLOBALS',$imports);}
 $db=new FixtureDatabase();if(isset($input['credentials'])){$c=$input['credentials'];$db=new dbstuff();$charset='utf-8';$dbcharset='utf8';$db->connect($c['host'].':'.$c['port'],$c['user'],$c['password'],$c['database']);}
 bind_state('sys',array_merge($input['sys'],['db'=>$db]));bind_state('map',[]);bind_state('input',[]);
 \player\init();$playerValues=[];foreach($input['playerKeys'] as $key)$playerValues[$key]=$$key??null;
 foreach($db_player_structure as $key)if(!array_key_exists($key,$playerValues))$playerValues[$key]=null;
 $playerValues['pid']=$input['currentPid']??1;$playerValues['sdata']=[];bind_state('player',$playerValues);
 bind_state('skillbase',['acquired_list'=>null,'parameter_list'=>null,'ppid'=>-1,'valid_skills'=>$input['validSkills']??[]]);
 foreach([2,20,64] as $sid){bind_state('skill'.$sid,[]);define('MOD_SKILL'.$sid.'_INFO',$input['info'][$sid]);}
 foreach(['sys','player','skillbase','skill2','skill20','skill64','fixture_skills'] as $ns)foreach(get_defined_functions()['user'] as $fn){if(strpos($fn,$ns.'\\')!==0)continue;$name=substr($fn,strlen($ns)+1);if($name!=='init'&&!in_array($name,['file_exists','file_put_contents']))hook_register($ns,$name);}
 function entries($array,$stringKeys=false){if($array===null)return null;$result=[];foreach($array as $key=>$value)$result[]=[$stringKeys?(string)$key:$key,$value];return $result;}
 function jsonvalue($value){if(is_string($value)&&!preg_match('//u',$value))return ['bytes'=>base64_encode($value)];if(is_array($value))foreach($value as $key=>$item)$value[$key]=jsonvalue($item);return $value;}
 function normalized($value){if(!is_array($value))return $value;foreach(['acquired_list','parameter_list'] as $key)if(array_key_exists($key,$value))$value[$key]=entries($value[$key]);return $value;}
 $pa=$input['pa'];$result=[];$trace=[];$mode=$input['mode']??'operations';
 if($mode==='codec'){
  foreach($input['operations'] as $operation){try{$fn='skillbase\\'.$operation['fn'];$args=$operation['args'];if($operation['fn']==='skillbase_save_process'){foreach([0,1] as $i){$out=[];foreach($args[$i] as $pair)$out[$pair[0]]=$pair[1];$args[$i]=$out;}}
   $value=$operation['fn']==='roundtrip'?\skillbase\skillbase_save_process(...\skillbase\skillbase_load_process(...$args)):$fn(...$args);if($operation['fn']==='skillbase_load_process')$value=[entries($value[0]),entries($value[1],true)];elseif($operation['fn']==='parse_skill_parameter_data')$value=entries($value,true);$result[]=$value;
  }catch(\Throwable $e){$result[]=['error'=>preg_replace('/^Class .* not found$/','source exception',$e->getMessage())];}}
  echo json_encode(jsonvalue($result),JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);exit;
 }
 if($mode==='player'||$mode==='database'){$pa=\player\fetch_playerdata_by_pid($pa['pid']);\player\load_playerdata($pa);$sdata=&get_var_in_module('sdata','player');}
 else \skillbase\skillbase_load($pa,$input['dummy']??false);
 foreach(($input['operations']??[]) as $operation){$fn='skillbase\\'.$operation['fn'];$args=$operation['args'];$slot=substr($operation['target']??'',-4)==='Slot';if($slot){$target=$operation['target']==='emptySlot'?[]:null;}elseif(($operation['target']??'')==='self'){$target=null;}elseif(($operation['target']??'')==='sdata'){$target=&$sdata;}else{$target=&$pa;}$args[]=&$target;if(isset($operation['noCover']))$args[]=$operation['noCover'];$value=call_user_func_array($fn,$args);$result[]=$slot?[$value,normalized(array_clone($target))]:$value;unset($target);}
 if($mode==='player'||$mode==='database')\player\player_save($sdata,$input['inProc']??0);
 else{if(!empty($input['enter']))\skillbase\post_enterbattlefield_events($pa);if(($input['save']??true)!==false)\skillbase\skillbase_save($pa,$input['inProc']??0);}
 if($mode==='database'){echo json_encode(['row'=>$db->fetch_array($db->query("SELECT * FROM bra_players WHERE pid='1'"))]);exit;}
 $state=['ppid'=>get_var_in_module('ppid','skillbase'),'acquired'=>entries(get_var_in_module('acquired_list','skillbase')),'parameters'=>entries(get_var_in_module('parameter_list','skillbase'))];
 $player=[];foreach(['pid','hp','nskill','nskillpara','sdata'] as $key)$player[$key]=normalized(get_var_in_module($key,'player'));
 echo json_encode(['pa'=>normalized($pa),'result'=>$result,'trace'=>$trace,'state'=>$state,'player'=>$player],JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);
}`;

async function oracle(t) {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true, timeout: 10_000 });
  if (version.error?.code === 'ENOENT' || version.stdout?.trim() !== '7.4') { t.skip('Development-only PHP 7.4 oracle unavailable; set DTS_REFERENCE_PHP.'); return null; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'native-skills-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  for (const source of sourceFiles) { const target = path.join(root, 'engine', source); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', source), target); }
  await mkdir(path.join(root, 'engine/include/modulemng'), { recursive: true });
  await mkdir(path.join(root, 'engine/gamedata/cache'), { recursive: true });
  await copyFile(path.join(project, 'engine/include/modulemng/modulemng.config.sample.php'), path.join(root, 'engine/include/modulemng/modulemng.config.php'));
  const fixture = path.join(root, 'oracle.php'); await writeFile(fixture, phpFixture);
  return input => {
    const payload = { ...input, schema, sourceFiles, info, pa: input.pa ?? basePlayer(), rows: input.rows ?? [basePlayer()], sys: baseSys(input), playerKeys: Object.keys(playerModule.state()) };
    const result = spawnSync(executable, ['-d', 'display_errors=stderr', fixture], { cwd: root, input: JSON.stringify(payload), encoding: 'utf8', windowsHide: true, timeout: 20_000, maxBuffer: 8 * 1024 * 1024 });
    assert.equal(result.status, 0, input.credentials ? 'Isolated PHP database oracle failed (diagnostics suppressed)' : result.stderr);
    try { return JSON.parse(result.stdout); } catch { throw new Error(input.credentials ? 'Invalid isolated PHP database response (diagnostics suppressed)' : `Invalid PHP response: ${result.stdout}\n${result.stderr}`); }
  };
}

test('skill codec matches original PHP byte output, key ordering and overwrite semantics', async t => {
  const php = await oracle(t); if (!php) return;
  const operations = [
    ...Array.from({ length: 64 }, (_, value) => ({ fn: 'value_conv_to_b64', args: [value] })),
    ...[...('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-')].map(value => ({ fn: 'b64_conv_to_value', args: [value] })),
    { fn: 'skillbase_load_process', args: ['auacau--aa', 'MjBfbHZs,Mw==,Ml94,5Lit5paH,'] },
    { fn: 'skillbase_load_process', args: ['', ''] },
    { fn: 'skillbase_save_process', args: [[[20, 1], [2, 0], [4095, '1'], [0, true], [64, 1]], [['20_lvl', 3], ['2_x', '中文,;\u0000'], ['0', false], ['01', null]]] },
    ...['0', '', 'YQ==,Yg==,YQ==,Yw==,', 'T=Q==,Y===Q==,', 'M=!=Q==,I+A=,'].map(value => ({ fn: 'parse_skill_parameter_data', args: [value] })),
    { fn: 'skill_getvalue_direct', args: [20, 'lvl', basePlayer().nskillpara] },
    { fn: 'roundtrip', args: ['auacau--aa', 'Ml9iaW5hcnk=,/wCAAA==,'] },
    { fn: 'skillbase_save_process', args: [Array.from({ length: 4096 }, (_, i) => [4095 - i, 1]), []] },
    ...[25.9, 51.9, 60.9].map(value => ({ fn: 'value_conv_to_b64', args: [value] })),
  ];
  const input = { mode: 'codec', operations };
  assert.deepEqual(await runNative(input), canonical(php(input)));
});

test('skill acquisition, loss, metadata, early hooks and player aliases agree with original PHP', { timeout: 120_000 }, async t => {
  const php = await oracle(t); if (!php) return;
  const ops = [
    { fn: 'get_acquired_skill_array', args: [] }, { fn: 'skill_query', args: [2] },
    { fn: 'skill_check_unlocked', args: [20] }, { fn: 'skill_check_unlocked', args: [64] },
    { fn: 'skill_lost', args: [20] }, { fn: 'skill_lost', args: [20] },
    { fn: 'check_have_skill_info', args: ['card;'] }, { fn: 'skill_acquire', args: [20] },
    { fn: 'skill_acquire', args: [2] }, { fn: 'skill_getvalue', args: [2, 'tsk_expire'] },
    { fn: 'skill_setvalue', args: [20, 'lvl', 7] }, { fn: 'skill_setvalue', args: [20, 'memo', '中文,;'] },
    { fn: 'skill_delvalue', args: [20, 'lvl'] }, { fn: 'skill_setvalue', args: [20, 'lvl', 8] },
    { fn: 'skill_getvalue', args: [20, 'lvl'] }, { fn: 'skill_query', args: [999] },
    { fn: 'get_acquired_skill_array', args: [] },
    { fn: 'skill_acquire', args: [2], noCover: 1 },
    { fn: 'check_skill_info', args: [20, 'unique;;'] }, { fn: 'check_skill_info', args: [99, 'unloaded'] },
  ];
  const cases = [
    ...[1, 2, 0].flatMap(pid => [false, true].flatMap(dummy => [false, true].map(inProc => ({ pa: basePlayer(pid), dummy, inProc, operations: ops })))),
    { pa: basePlayer(2), disabled: 2, operations: ops },
    { pa: basePlayer(2), onload: true, onsave: true, operations: ops },
    { pa: basePlayer(1), onload: true, onsave: true, operations: ops },
    { pa: basePlayer(1), gamestate: 0, operations: ops },
    { pa: basePlayer(2, { skills: { 20: { lvl: 3, memo: '备注' }, 2: 4, 99: 9 }, o_card: 111, card: 222 }), enter: true, validSkills: { 0: [64, 99] } },
    { pa: basePlayer(1, { skills: { 20: 0, 2: -1 }, o_card: 0, card: 222 }), enter: true, validSkills: { 0: [64] } },
    ...[false, true].map(inProc => ({ mode: 'player', onload: true, onsave: true, inProc, operations: ops.map(op => ({ ...op, target: 'sdata' })) })),
    { mode: 'player', operations: ops.map(op => ({ ...op, target: 'self' })) },
    { dummy: true, save: false, operations: [{ fn: 'skill_query', args: [2] }, { fn: 'skill_getvalue', args: [2, 'lvl'] }] },
    { currentPid: 0, pa: basePlayer(0), operations: ops },
    { mode: 'player', operations: [
      { fn: 'skill_acquire', args: [2], target: 'nullSlot' },
      { fn: 'skill_lost', args: [2], target: 'emptySlot' },
    ] },
  ];
  for (let i = 0; i < cases.length; i++) assert.deepEqual(await runNative(cases[i]), canonical(php(cases[i])), `scenario ${i}: ${JSON.stringify(cases[i])}`);
  t.diagnostic(`${cases.length} complete source-hook scenarios; skill2/20/64 are explicit mutation observers, not implementations of those skills.`);
});

test('skillbase declares every source hook and refuses missing metadata or malformed encoding', async () => {
  const source = await readFile(path.join(project, 'engine/include/modules/base/skillbase/main.php'), 'utf8');
  const functions = [...source.matchAll(/^\s*function\s+(\w+)\s*\(/gm)].map(match => match[1]).filter(name => name !== 'init');
  assert.deepEqual(Object.keys(skillbaseModule.functions).sort(), functions.sort());
  const { session } = await nativeSession({});
  for (const value of ['a', 'a?', 'zz!']) await assert.rejects(session.call('skillbase', 'skillbase_load_process', value, ''), /bad nskill/);
  await assert.rejects(session.call('skillbase', 'parse_skill_parameter_data', 'YQ==,Yg=='), /bad nskillpara/);
  await assert.rejects(session.call('skillbase', 'value_conv_to_b64', 64), /bad char/);
  const catalog = createSkillCatalog([{ name: 'skill2', functions: { acquire2() {} } }, { name: 'skill20', enabled: false }], info);
  assert.equal(catalog.getInfo(20), null); assert.equal(catalog.getInfo(99), null); assert.equal(catalog.hasFunction(2, 'acquire2'), true);
});

test('skill strings persist through real player saves, closed connections and PHP comparison', { timeout: 120_000 }, async t => {
  const php = await oracle(t); if (!php) return;
  const isolated = await isolatedDatabase(t, 'skills'); if (!isolated) return;
  await isolated.database.queries(playerSql);
  const input = { mode: 'database', pa: basePlayer(), operations: [
    { fn: 'skill_lost', args: [20], target: 'sdata' }, { fn: 'skill_acquire', args: [2], target: 'sdata' },
    { fn: 'skill_setvalue', args: [2, 'memo', '中文,;'], target: 'sdata' },
    { fn: 'skill_setvalue', args: [2, 'lvl', 6], target: 'sdata' },
  ] };
  await isolated.database.arrayInsert('bra_players', basePlayer());
  const phpRow = php({ ...input, credentials: isolated.credentials }).row;
  await isolated.database.execute("DELETE FROM bra_players WHERE pid='1'");
  await isolated.database.arrayInsert('bra_players', basePlayer());
  let database = await createDatabase(isolated.credentials);
  try {
    const { session } = await nativeSession(input, database);
    const pa = await session.call('player', 'fetch_playerdata_by_pid', 1);
    await session.call('player', 'load_playerdata', pa);
    for (const op of input.operations) await session.call('skillbase', op.fn, ...op.args, session.state('player').sdata);
    await session.call('player', 'player_save', session.state('player').sdata);
  } finally { await database.close(); }
  database = await createDatabase(isolated.credentials);
  try {
    const rows = await database.query("SELECT * FROM bra_players WHERE pid='1'");
    assert.deepEqual(rows[0], phpRow);
    const { session } = await nativeSession(input, database);
    const pa = await session.call('player', 'fetch_playerdata_by_pid', 1);
    await session.call('player', 'load_playerdata', pa);
    assert.equal(await session.call('skillbase', 'skill_query', 20), false);
    assert.equal(await session.call('skillbase', 'skill_getvalue', 2, 'memo'), '中文,;');
    assert.equal(await session.call('skillbase', 'skill_getvalue', 2, 'lvl'), '6');
  } finally { await database.close(); }
});
