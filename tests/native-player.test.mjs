import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { playerModule } from '../native/gameplay/player.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { createPhp74Random } from '../native/random.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const sql = await readFile(path.join(project, 'engine/gamedata/sql/players.sql'), 'utf8');
const schema = [...sql.matchAll(/^\s*`([^`]+)`\s+([^\s,]+(?:\s+unsigned)?)/gm)].map(([, Field, Type]) => ({ Field, Type }));
const sources = [
  'include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', 'include/modules/modules.func.php',
  'include/modules/core/player/main.php', 'include/modules/core/player/config/player.config.php',
  'include/db/db_mysqli.class.php', 'gamedata/sql/players.sql',
];
const baseSys = () => ({ tablepre: 'bra_', gtablepre: 'bra_', groomid: 4, now: 12345, gamestate: 30, gametype: 0,
  alivenum: 10, validnum: 13, deathnum: 2, command: 'menu', mode: 'combat', nowep: '拳头', noarb: '内衣', nosta: '∞',
  pdata_pool: {}, pdata_origin_pool: {}, pdata_lock_pool: {}, uip: { innerHTML: {}, value: {} },
  cudata: { motto: '座右铭', killmsg: '击杀词', lastword: '遗言' }, dinfo: { 11: '禁区死亡' }, chatinfo: ['公众', '队伍'],
});
const baseMap = () => ({ areaesc: 0, plsinfo: { 1: '广场', 2: '学校', 3: '森林' } });
const sample = (pid = '1', extra = {}) => ({ pid, type: '0', name: pid === '1' ? '甲' : '乙', state: '0', hp: '100', mhp: '100', sp: '70', msp: '100',
  player_dead_flag: '0', killnum: '0', npckillnum: '0', teamID: '', gd: 'f', icon: '1', pls: '2', bid: '0',
  att: '30', def: '20', wep: '刀', wepk: 'WK', wepe: '15', weps: '5', wepsk: '', arb: '服', arbk: 'DB', arbe: '4', arbs: '8', arbsk: '',
  motto: '旧座右铭', killmsg: '胜利', lastword: '再见', attackwith: '刀', ...extra });
const plain = value => JSON.parse(JSON.stringify(value, (key, item) => item instanceof Map ? Object.fromEntries(item) : item));
// Empty PHP arrays and native empty records represent the same unkeyed empty
// map at this test boundary; populated lists/records retain all keys and types.
const canonical = value => {
  if (value === undefined) return null;
  if (value === null || typeof value !== 'object') return value;
  if (!Object.keys(value).length) return {};
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, canonical(item)]));
};

async function nativeSession(input, actualDatabase = null) {
  const trace = [];
  const rows = structuredClone(input.rows ?? [sample()]);
  const rng = createPhp74Random(input.seed ?? 123);
  // Explicit DB/asset/lock fixtures are boundary observers; only the later
  // integration test uses the real MySQL service and source SQL table.
  const database = actualDatabase ?? {
    async query(sql) {
      if (sql.startsWith('DESCRIBE ')) return schema;
      trace.push(['query', sql]);
      if (sql.includes('COUNT(*)')) return [{ 'COUNT(*)': String(rows.filter(row => Number(row.hp) > 0 && Number(row.type) === 0).length) }];
      const found = sql.includes('pls IN') ? rows.filter(row => Number(row.hp) > 0)
        : sql.includes('WHERE name') ? rows.filter(row => row.name === sql.match(/name = '([^']*)'/)[1] && Number(row.type) === Number(sql.match(/type = '([^']*)'/)[1]))
        : rows.filter(row => String(row.pid) === sql.match(/pid = '([^']*)'/)[1]);
      return structuredClone(sql.startsWith('SELECT pid') ? found.map(row => ({ pid: row.pid })) : found);
    },
    async arrayUpdate(table, data, where, old) { trace.push(['update', table, structuredClone(data), where, structuredClone(old)]); },
    async queries(sql) { trace.push(['reset', sql]); },
  };
  const services = {
    database, inCommand: input.inCommand ?? false, random: rng,
    playerLocks: {
      async check(room, pid, timeout) { trace.push(['lock-check', room, pid, timeout]); return input.blocked ?? false; },
      async create(room, pid) { trace.push(['lock-create', room, pid]); return input.createFails ? false : true; },
      async release(room, pid) { trace.push(['lock-release', room, pid]); },
    },
    playerAssets: {
      async exists(name) { trace.push(['exists', name]); return Object.hasOwn(input.assets ?? {}, name); },
      async dimensions(name) { trace.push(['dimensions', name]); return input.assets[name]; },
    },
    output: { async peek() { return input.output ?? ''; } },
  };
  const definitions = [
    { name: 'sys', state: () => ({ ...baseSys(), ...input.sys }), functions: {
      async addchat(ctx, ...args) { trace.push(['chat', ...structuredClone(args)]); },
      async addnews(ctx, ...args) { trace.push(['news', ...structuredClone(args)]); },
      async save_gameinfo(ctx) { trace.push(['gameinfo', ctx.state().deathnum, ctx.state().alivenum]); },
      async rs_game(ctx, mode) { trace.push(['reset-next', mode]); },
    } },
    { name: 'map', state: () => ({ ...baseMap(), ...input.map }), functions: {
      async get_current_not_area() { return input.notAreas ?? [2, 3]; },
      async get_current_area() { return input.areas ?? [1]; },
      async get_safe_plslist(ctx, safe = true) {
        trace.push(['safe', safe]);
        const values = (safe ? input.safeAreas ?? [2, 3] : input.fallbackAreas ?? [1]).slice();
        if (safe && input.excludedAreas) values.forEach((value, index) => { if (input.excludedAreas.includes(value)) delete values[index]; });
        return values;
      },
      async init_areatiming() { trace.push(['timing']); },
      async addarea_pc_process(ctx, time) { trace.push(['area-next', time]); },
    } },
    { name: 'input', state: { sp_cmd: 'skill' } },
    { name: 'logger', state: { log: '日志' } },
    playerModule,
    { name: 'weapon', dependencies: ['player'], functions: {
      async get_attack_method() { return 'K'; },
      async get_att(ctx, pa) { pa.att_words = '30+15'; if (input.mainWords) pa.att_m_words = '主武器'; return input.totalAttack ?? 45.25; },
      async get_def(ctx, pa, pd) { pd.def_words = '20+4'; if (input.mainWords) pd.def_m_words = '防具'; return input.totalDefense ?? 24.04; },
    } },
    { name: 'fixture_player', dependencies: ['player'], functions: {
      async playerdata_construct_process(ctx, data) { data = await ctx.next(data); data.constructed = true; return data; },
      async set_revive_sequence(ctx, pa, pd) { await ctx.next(pa, pd); if (input.revive) pd.revive_sequence = { 200: 'late', 30: 'first', 80: 'chosen' }; },
      async revive_veto(ctx, pa, pd) { trace.push(['veto']); return input.veto ?? await ctx.next(pa, pd); },
      async revive_check(ctx, pa, pd, key) { trace.push(['check', key]); return key === 'chosen'; },
      async pre_revive_events(ctx, pa, pd, key) { trace.push(['pre-revive', key]); await ctx.next(pa, pd, key); },
      async post_revive_events(ctx, pa, pd, key) { trace.push(['post-revive', key]); pd.hp = 9; pd.rivival_news = ['revived', pd.name, '光']; await ctx.next(pa, pd, key); },
      async post_pc_avoid_killarea(ctx, data, time) { trace.push(['escaped', structuredClone(data), time]); await ctx.next(data, time); },
    } },
  ];
  const session = await new ModuleRegistry(definitions).createSession({ services, states: { player: input.player ?? {} } });
  return { session, trace, rng, services };
}

async function runNative(input, actualDatabase = null) {
  const { session, trace, rng } = await nativeSession(input, actualDatabase);
  const invoke = (name, ...args) => session.call('player', name, ...args), state = session.state('player'), sys = session.state('sys');
  let result = null;
  if (input.mode === 'pool_order') {
    for (const pid of [20, 2, 20]) await invoke('fetch_playerdata_by_pid', pid, 1);
    const keys = pool => pool instanceof Map ? [...pool.keys()] : Object.keys(pool);
    const first = await invoke('fetch_playerdata', 'same', 0);
    const initialLockOrder = keys(sys.pdata_lock_pool);
    await invoke('release_player_lock', 20);
    await invoke('create_player_lock', 20, 1);
    const reinsertedLockOrder = keys(sys.pdata_lock_pool);
    if (sys.pdata_pool instanceof Map) sys.pdata_pool.delete('20'); else delete sys.pdata_pool[20];
    await invoke('fetch_playerdata_by_pid', 20);
    const afterReinsert = await invoke('fetch_playerdata', 'same', 0);
    result = { first, afterReinsert, initialLockOrder, reinsertedLockOrder, playerOrder: keys(sys.pdata_pool), originalOrder: keys(sys.pdata_origin_pool) };
    await invoke('release_player_lock_from_pool');
  } else if (input.mode === 'storage') {
    const data = input.byName ? await invoke('fetch_playerdata', input.name ?? '甲', input.type ?? 0, input.ignorePool ?? 0, input.ignoreLock ?? 0)
      : await invoke('fetch_playerdata_by_pid', input.pid ?? '1', input.ignorePool ?? 0, input.ignoreLock ?? 0);
    if (data) {
      const original = await invoke('fetch_original_playerdata_by_id', data.pid);
      await invoke('load_playerdata', data);
      Object.assign(state.sdata, input.change ?? {});
      if (input.flatHp !== undefined) state.hp = input.flatHp;
      if (input.partial) await invoke('load_playerdata', input.partial);
      const beforeSave = structuredClone(state.sdata);
      await invoke('player_save', state.sdata);
      const pooled = await invoke('fetch_playerdata', data.name, 999);
      result = { data, original, beforeSave, pooled, flatHp: state.hp, sdata: structuredClone(state.sdata) };
    }
  } else if (input.mode === 'kill') {
    const pa = structuredClone(input.pa), pd = input.self ? pa : structuredClone(input.pd);
    const message = await invoke('kill', pa, pd);
    result = { pa, pd, message, dinfo: await invoke('get_dinfo', pd) };
  } else if (input.mode === 'icons') {
    result = [];
    for (const [name, ...args] of input.calls) result.push(await invoke(name, ...structuredClone(args)));
    result = { result, icons: state.icon_list, frontend: state.icon_list_contents_to_frontend };
  } else if (input.mode === 'area') {
    await invoke('addarea_pc_process', 12345);
  } else if (input.mode === 'locks') {
    result = [];
    for (const [pid, forced] of input.locks) result.push(await invoke('create_player_lock', pid, forced));
    await invoke('release_player_lock_from_pool');
  } else if (input.mode === 'reset') {
    await invoke('rs_game', input.resetMode);
  } else if (input.mode === 'profile') {
    await invoke('load_playerdata', input.data);
    await invoke('parse_interface_gameinfo');
    await invoke('parse_interface_profile');
    await invoke('pre_act'); await invoke('act'); await invoke('post_act');
    await invoke('prepare_response_content');
    result = Object.fromEntries(['sdata', 'hpcolor', 'spcolor', 'newhpimg', 'hplt', 'newspimg', 'splt', 'gamedata'].map(key => [key, structuredClone(state[key])]));
  } else if (input.mode === 'helpers') {
    const constructed = await invoke('playerdata_construct_process', input.data);
    const formatted = await invoke('player_format_with_db_structure', input.data);
    const diff = await invoke('player_diff_from_poll', input.data);
    await invoke('load_playerdata', input.data);
    await invoke('init_playerdata');
    result = { constructed, formatted, diff, dummy: await invoke('create_dummy_playerdata'), sdata: structuredClone(state.sdata),
      icons: [state.iconImg, state.iconImgB, state.iconImgBwidth], fog: state.fog, maxRage: await invoke('get_max_rage'), displayable: await invoke('check_alive_player_displayable', input.data) };
  }
  return plain({ result, trace, next: rng.rand(), sys: Object.fromEntries(['pdata_pool', 'pdata_origin_pool', 'pdata_lock_pool', 'deathnum', 'alivenum', 'validnum', 'uip', 'mode'].map(key => [key, sys[key]])) });
}

const phpFixture = String.raw`<?php
namespace sys {
 function addchat(...$args){$GLOBALS['trace'][]=array_merge(['chat'],$args);}
 function addnews(...$args){$GLOBALS['trace'][]=array_merge(['news'],$args);}
 function save_gameinfo(){ $GLOBALS['trace'][]=['gameinfo',get_var_in_module('deathnum','sys'),get_var_in_module('alivenum','sys')]; }
 function rs_game($mode){ if(eval(__MAGIC__))return $___RET_VALUE; $GLOBALS['trace'][]=['reset-next',$mode]; }
}
namespace map {
 function get_current_not_area(){return $GLOBALS['input']['notAreas']??[2,3];}
 function get_current_area(){return $GLOBALS['input']['areas']??[1];}
 function get_safe_plslist($safe=true){$GLOBALS['trace'][]=['safe',$safe];$values=$safe?($GLOBALS['input']['safeAreas']??[2,3]):($GLOBALS['input']['fallbackAreas']??[1]);if($safe&&isset($GLOBALS['input']['excludedAreas']))$values=array_diff($values,$GLOBALS['input']['excludedAreas']);return $values;}
 function init_areatiming(){$GLOBALS['trace'][]=['timing'];}
 function addarea_pc_process($time){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['area-next',$time];}
}
namespace weapon {
 function get_attack_method(&$pa){return 'K';}
 function get_att(&$pa,&$pd,$active){$pa['att_words']='30+15';if(!empty($GLOBALS['input']['mainWords']))$pa['att_m_words']='主武器';return $GLOBALS['input']['totalAttack']??45.25;}
 function get_def(&$pa,&$pd,$active){$pd['def_words']='20+4';if(!empty($GLOBALS['input']['mainWords']))$pd['def_m_words']='防具';return $GLOBALS['input']['totalDefense']??24.04;}
}
namespace player {
 // Observe the filesystem/locks at explicit host boundaries. Original player
 // source below is unmodified; file fallback logic still executes there.
 function file_exists($name){if(strpos($name,'img/')===0){$name=substr($name,4);$GLOBALS['trace'][]=['exists',$name];return isset($GLOBALS['input']['assets'][$name]);}return false;}
 function getimagesize($name){$name=substr($name,4);$GLOBALS['trace'][]=['dimensions',$name];return $GLOBALS['input']['assets'][$name];}
 function file_put_contents($path,$data,$flags=0){return strlen($data);}
 function check_lock($dir,$file,$timeout){preg_match('/player_(.+)\.nlk$/',$file,$m);$GLOBALS['trace'][]=['lock-check',get_var_in_module('groomid','sys'),$m[1],$timeout];return $GLOBALS['input']['blocked']??false;}
 function create_lock($dir,$file){preg_match('/player_(.+)\.nlk$/',$file,$m);$GLOBALS['trace'][]=['lock-create',get_var_in_module('groomid','sys'),$m[1]];return empty($GLOBALS['input']['createFails']);}
 function release_lock($dir,$file){preg_match('/player_(.+)\.nlk$/',$file,$m);$GLOBALS['trace'][]=['lock-release',get_var_in_module('groomid','sys'),$m[1]];}
}
namespace fixture_player {
 function playerdata_construct_process($data){if(eval(__MAGIC__))return $___RET_VALUE;$data=$chprocess($data);$data['constructed']=true;return $data;}
 function set_revive_sequence(&$pa,&$pd){if(eval(__MAGIC__))return $___RET_VALUE;$chprocess($pa,$pd);if(!empty($GLOBALS['input']['revive']))$pd['revive_sequence']=[200=>'late',30=>'first',80=>'chosen'];}
 function revive_veto(&$pa,&$pd){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['veto'];return $GLOBALS['input']['veto']??$chprocess($pa,$pd);}
 function revive_check(&$pa,&$pd,$key){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['check',$key];return $key==='chosen';}
 function pre_revive_events(&$pa,&$pd,$key){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['pre-revive',$key];$chprocess($pa,$pd,$key);}
 function post_revive_events(&$pa,&$pd,$key){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['post-revive',$key];$pd['hp']=9;$pd['rivival_news']=['revived',$pd['name'],'光'];$chprocess($pa,$pd,$key);}
 function post_pc_avoid_killarea($data,$time){if(eval(__MAGIC__))return $___RET_VALUE;$GLOBALS['trace'][]=['escaped',$data,$time];$chprocess($data,$time);}
}
namespace {
 define('IN_GAME',true);define('GAME_ROOT',__DIR__.'/engine/');
 error_reporting(E_ALL & ~E_NOTICE);ini_set('display_errors','stderr');
 require GAME_ROOT.'include/modules/modules.func.php';
 $input=json_decode(stream_get_contents(STDIN),true);$trace=[];
 foreach($input['sourceFiles'] as $file)if($file!='include/modules/modules.func.php'&&substr($file,-4)==='.php')require_once GAME_ROOT.$file;
 class FixtureResult { public $rows,$i=0; function __construct($rows){$this->rows=$rows;} }
 class FixtureDatabase {
  function query($sql){
   global $input,$trace;
   if(strpos($sql,'DESCRIBE ')===0)return new FixtureResult($input['schema']);
   $trace[]=['query',$sql];$rows=$input['rows'];
   if(strpos($sql,'COUNT(*)')!==false)return new FixtureResult([['COUNT(*)'=>(string)count(array_filter($rows,function($r){return $r['hp']>0&&$r['type']==0;}))]]);
   if(strpos($sql,'pls IN')!==false)$found=array_filter($rows,function($r){return $r['hp']>0;});
   elseif(strpos($sql,'WHERE name')!==false){preg_match("/name = '([^']*)'/",$sql,$name);preg_match("/type = '([^']*)'/",$sql,$type);$found=array_filter($rows,function($r)use($name,$type){return $r['name']===$name[1]&&$r['type']==$type[1];});}
   else {preg_match("/pid = '([^']*)'/",$sql,$pid);$found=array_filter($rows,function($r)use($pid){return (string)$r['pid']===$pid[1];});}
   $found=array_values($found);if(strpos($sql,'SELECT pid')===0)$found=array_map(function($r){return ['pid'=>$r['pid']];},$found);
   return new FixtureResult($found);
  }
  function num_rows($result){return count($result->rows);}
  function fetch_array($result){return $result->rows[$result->i++]??null;}
  function result($result,$row){return array_values($result->rows[$row])[0];}
  function array_update($table,$data,$where,$old=null){$GLOBALS['trace'][]=['update',$table,$data,$where,$old];}
  function queries($sql){$GLOBALS['trace'][]=['reset',$sql];}
 }
 function bind_state($name,$values){$imports='';foreach($values as $key=>$value){$global='___LOCAL_'.strtoupper($name).'__VARS__'.$key;$GLOBALS[$global]=$value;$imports.='global $'.$global.';$'.$key.'=&$'.$global.';';}define('MOD_'.strtoupper($name),true);define('IMPORT_MODULE_'.strtoupper($name).'_GLOBALS',$imports);}
 $db=new FixtureDatabase();
 if(isset($input['credentials'])){$cred=$input['credentials'];$db=new dbstuff();$charset='utf-8';$dbcharset='utf8';$db->connect($cred['host'].':'.$cred['port'],$cred['user'],$cred['password'],$cred['database']);}
 bind_state('sys',array_merge($input['sys'],['db'=>$db]));bind_state('map',$input['map']);bind_state('logger',['log'=>'日志']);bind_state('input',['sp_cmd'=>'skill']);
 // Original init builds and DESCRIBEs a temporary table in the isolated DB.
 // Filesystem cache writes occur only inside this disposable test directory.
 \player\init();
 $playerValues=[];
 foreach($input['playerKeys'] as $key)$playerValues[$key]=$$key??null;
 $playerValues=array_merge($playerValues,$input['player']??[]);
 foreach($db_player_structure as $key)if(!array_key_exists($key,$playerValues))$playerValues[$key]=null;
 bind_state('player',$playerValues);
 if(!empty($input['inCommand']))define('IN_COMMAND',true);
 foreach(['sys','map','player','fixture_player'] as $namespace)foreach(get_defined_functions()['user'] as $function){if(strpos($function,$namespace.'\\')!==0)continue;$name=substr($function,strlen($namespace)+1);if($name!=='init'&&!in_array($name,['file_exists','getimagesize','file_put_contents','check_lock','create_lock','release_lock']))hook_register($namespace,$name);}
 $trace=[];mt_srand($input['seed']??123);$mode=$input['mode'];$result=null;
 if($mode==='pool_order'){
  foreach([20,2,20] as $pid)\player\fetch_playerdata_by_pid($pid,1);
  $first=\player\fetch_playerdata('same',0);$initialLockOrder=array_keys(get_var_in_module('pdata_lock_pool','sys'));
  \player\release_player_lock(20);\player\create_player_lock(20,1);$reinsertedLockOrder=array_keys(get_var_in_module('pdata_lock_pool','sys'));
  $pool=&get_var_in_module('pdata_pool','sys');unset($pool[20]);\player\fetch_playerdata_by_pid(20);$afterReinsert=\player\fetch_playerdata('same',0);
  $result=['first'=>$first,'afterReinsert'=>$afterReinsert,'initialLockOrder'=>$initialLockOrder,'reinsertedLockOrder'=>$reinsertedLockOrder,'playerOrder'=>array_keys($pool),'originalOrder'=>array_keys(get_var_in_module('pdata_origin_pool','sys'))];
  \player\release_player_lock_from_pool();
 }elseif($mode==='storage'){
  $data=!empty($input['byName'])?\player\fetch_playerdata($input['name']??'甲',$input['type']??0,$input['ignorePool']??0,$input['ignoreLock']??0):\player\fetch_playerdata_by_pid($input['pid']??'1',$input['ignorePool']??0,$input['ignoreLock']??0);
  if($data){
   $original=\player\fetch_original_playerdata_by_id($data['pid']);\player\load_playerdata($data);$sdata=&get_var_in_module('sdata','player');
   foreach(($input['change']??[]) as $key=>$value)$sdata[$key]=$value;
   if(isset($input['flatHp'])){$hp=&get_var_in_module('hp','player');$hp=$input['flatHp'];}
   if(isset($input['partial']))\player\load_playerdata($input['partial']);
   $beforeSave=array_clone($sdata);\player\player_save($sdata);$pooled=\player\fetch_playerdata($data['name'],999);
   $result=['data'=>$data,'original'=>$original,'beforeSave'=>$beforeSave,'pooled'=>$pooled,'flatHp'=>get_var_in_module('hp','player'),'sdata'=>array_clone($sdata)];
  }
 }elseif($mode==='kill'){
  $pa=$input['pa'];if(!empty($input['self']))$pd=&$pa;else $pd=$input['pd'];$message=\player\kill($pa,$pd);$result=['pa'=>$pa,'pd'=>$pd,'message'=>$message,'dinfo'=>\player\get_dinfo($pd)];
 }elseif($mode==='icons'){
  $results=[];foreach($input['calls'] as $call){$name=array_shift($call);$fn='player\\'.$name;$args=[];foreach($call as &$v)$args[]=&$v;unset($v);$results[]=call_user_func_array($fn,$args);}
  $result=['result'=>$results,'icons'=>get_var_in_module('icon_list','player'),'frontend'=>get_var_in_module('icon_list_contents_to_frontend','player')];
 }elseif($mode==='area'){\player\addarea_pc_process(12345);
 }elseif($mode==='locks'){$result=[];foreach($input['locks'] as $lock)$result[]=\player\create_player_lock($lock[0],$lock[1]);\player\release_player_lock_from_pool();
 }elseif($mode==='reset'){\player\rs_game($input['resetMode']);
 }elseif($mode==='profile'){
  \player\load_playerdata($input['data']);\player\parse_interface_gameinfo();\player\parse_interface_profile();\player\pre_act();\player\act();\player\post_act();
  ob_start();echo $input['output']??'';\player\prepare_response_content();ob_end_clean();
  $result=[];foreach(['sdata','hpcolor','spcolor','newhpimg','hplt','newspimg','splt','gamedata'] as $key)$result[$key]=get_var_in_module($key,'player');
 }elseif($mode==='helpers'){
  $constructed=\player\playerdata_construct_process($input['data']);$formatted=\player\player_format_with_db_structure($input['data']);$diff=\player\player_diff_from_poll($input['data']);
  \player\load_playerdata($input['data']);\player\init_playerdata();
  $result=['constructed'=>$constructed,'formatted'=>$formatted,'diff'=>$diff,'dummy'=>\player\create_dummy_playerdata(),'sdata'=>array_clone(get_var_in_module('sdata','player')),
   'icons'=>[get_var_in_module('iconImg','player'),get_var_in_module('iconImgB','player'),get_var_in_module('iconImgBwidth','player')],'fog'=>get_var_in_module('fog','player'),'maxRage'=>\player\get_max_rage(),'displayable'=>\player\check_alive_player_displayable($input['data'])];
 }
 $sys=[];foreach(['pdata_pool','pdata_origin_pool','pdata_lock_pool','deathnum','alivenum','validnum','uip','mode'] as $key)$sys[$key]=get_var_in_module($key,'sys');
 echo json_encode(['result'=>$result,'trace'=>$trace,'next'=>rand(),'sys'=>$sys],JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);
}`;

async function oracle(t) {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true, timeout: 10_000 });
  if (version.error?.code === 'ENOENT' || version.stdout?.trim() !== '7.4') { t.skip('Development-only PHP 7.4 oracle unavailable; set DTS_REFERENCE_PHP.'); return null; }
  assert.equal(version.status, 0);
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'native-player-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  for (const source of sources) { const target = path.join(root, 'engine', source); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', source), target); }
  await mkdir(path.join(root, 'engine/include/modulemng'), { recursive: true });
  await mkdir(path.join(root, 'engine/gamedata/cache'), { recursive: true });
  await copyFile(path.join(project, 'engine/include/modulemng/modulemng.config.sample.php'), path.join(root, 'engine/include/modulemng/modulemng.config.php'));
  const fixture = path.join(root, 'oracle.php'); await writeFile(fixture, phpFixture);
  return input => {
    const payload = { ...input, rows: input.rows ?? [sample()], schema, sourceFiles: sources, playerKeys: Object.keys(playerModule.state()), sys: { ...baseSys(), ...input.sys }, map: { ...baseMap(), ...input.map } };
    const result = spawnSync(executable, ['-d', 'display_errors=stderr', fixture], { cwd: root, input: JSON.stringify(payload), encoding: 'utf8', windowsHide: true, timeout: 20_000, maxBuffer: 8 * 1024 * 1024 });
    // Do not print oracle errors when connection credentials are present.
    assert.equal(result.status, 0, input.credentials ? 'PHP real database oracle failed (diagnostics suppressed)' : result.stderr);
    try { return JSON.parse(result.stdout); }
    catch { throw new Error(input.credentials ? 'Invalid real database oracle response (diagnostics suppressed)' : `Invalid PHP response: ${result.stdout}\n${result.stderr}`); }
  };
}

test('player source functions agree with real PHP at storage, aliases, hooks, death and interface boundaries', { timeout: 120_000 }, async t => {
  const php = await oracle(t); if (!php) return;
  const cases = [
    { mode: 'storage' }, { mode: 'storage', byName: true }, { mode: 'storage', pid: 404 },
    { mode: 'storage', change: { hp: 73, wepe: 19, ignored: 'transient' }, flatHp: 72 },
    { mode: 'storage', change: { hp: 0, state: '3', deathmark: '23', player_dead_flag: 0 } },
    { mode: 'storage', rows: [sample('1', { type: '2', name: '怪物' })], change: { hp: 0 } },
    { mode: 'storage', partial: { state_backup: 7, hp: 23 } },
    { mode: 'storage', inCommand: true }, { mode: 'storage', inCommand: true, blocked: true },
    { mode: 'storage', inCommand: true, ignoreLock: 1 },
    { mode: 'storage', sys: { pdata_pool: { 1: sample('1', { hp: 91, type: 7 }) }, pdata_origin_pool: { 1: sample() } }, byName: true },
    { mode: 'storage', sys: { pdata_pool: { 1: sample('1', { hp: 91 }) } }, ignorePool: 1 },
    ...[false, true].flatMap(self => [0, 2].flatMap(type => [false, true].map(revive => ({ mode: 'kill', self, revive, pa: sample('1', { type, state: 11 }), pd: sample('2', { type, state: 23 }) })))),
    { mode: 'kill', self: true, revive: true, veto: true, pa: sample('1', { state: 19, sourceless: true }) },
    ...[false, true].flatMap(inCommand => [false, true].map(blocked => ({ mode: 'locks', inCommand, blocked, locks: [['1', 0], ['1', 1], ['2', 1], ['2', 1]] }))),
    { mode: 'locks', inCommand: true, createFails: true, locks: [['1', 0], ['1', 1]] },
    { mode: 'area', rows: [sample(), sample('2', { type: '2' })] },
    { mode: 'area', map: { areaesc: 1 } },
    { mode: 'area', map: { areaesc: 1 }, safeAreas: [], fallbackAreas: [3] },
    ...[0, 1, 7, 99].flatMap(seed => [[1, 3, 6], [0, 1, 2, 3, 4], [5, 6]].map(excludedAreas => ({ mode: 'area', map: { areaesc: 1 }, safeAreas: [0, 1, 2, 3, 4, 5, 6], excludedAreas, seed }))),
    { mode: 'area', notAreas: [] }, { mode: 'area', map: { areaesc: 1 }, sys: { gamestate: 40 } },
    ...[0, 3, 4, 7].map(resetMode => ({ mode: 'reset', resetMode })),
    ...[0, 20, 50, 100].map(hp => ({ mode: 'profile', data: sample('1', { hp, sp: hp, teamID: hp === 50 ? 'T' : '' }), output: '<b>缓冲输出</b>' })),
    { mode: 'profile', data: sample(), mainWords: true, sys: { gametype: 2, command: 'special', mode: 'command' } },
    { mode: 'helpers', data: sample('1', { state_backup: 0, icon: -1, weps: '0', arbs: 0, ignored: 'drop' }) },
    { mode: 'helpers', data: sample('1', { state_backup: 9, icon: -1, hp: null }), sys: { pdata_origin_pool: { 1: sample() } } },
  ];
  for (const [index, input] of cases.entries()) {
    const expected = php(input), actual = await runNative(input);
    // Lock filenames stringify pid before the original filesystem operation.
    for (const result of [actual, expected]) for (const event of result.trace) if (event[0].startsWith('lock-')) event[2] = String(event[2]);
    assert.deepEqual(canonical(actual), canonical(expected), `case ${index}: ${input.mode}`);
  }
  t.diagnostic(`${cases.length} source-oracle scenarios; DB/lock/assets are explicit observed boundaries.`);
});

test('player icon names, validation, resource fallback and selection match real PHP', { timeout: 60_000 }, async t => {
  const php = await oracle(t); if (!php) return;
  const input = { mode: 'icons', player: { pc_icon_range: { f: [0, 3], m: [0, 2], n: [0, 2] } }, assets: {
    'f_0.gif': [80, 80], 'f_1.png': [80, 80], 'f_1a.jpg': [300, 600], 'f_3.gif': [80, 80], 'f_3a.gif': [120, 340],
    'm_1.jpg': [80, 80], 'm_1a.jpg': [60, 80], 'n_2.gif': [80, 80], 'n_2a.gif': [200, 200],
    'name.png': [80, 80], 'name_a.jpg': [111, 341], 'png': [80, 80],
  }, calls: [
    ...[0, 1, '01', '1.0', '1e0', -1, 4, 'bad', '1 ', 1.1].map(icon => ['icon_parser_valid', { icon, gd: 'f', type: 0 }]),
    ['icon_parser_valid', { icon: 'npc.png', gd: 'bad', type: 1 }],
    ['icon_parser_name_format', 0, 'f', 2], ['icon_parser_name_format', 1, 'm', '2'], ['icon_parser_name_format', 0, 'm', 'name.gif'],
    ['icon_parser_name_format', 1, 'f', 'name'], ['icon_parser_name_format', 0, 'f', '人物.png'],
    ['icon_parser_file_check', 'missing.gif', 'keep.gif'], ['icon_parser_file_check', 'name.gif', 'name_a.gif'], ['icon_parser_file_check', 'noext', 'noextbig'],
    ['get_pc_icon_selecting_list'], ['icon_parser_shell', { icon: 1, gd: 'f' }], ['icon_parser_shell', { icon: 999, gd: 'f' }],
    ['icon_parser', 1, 'f', 2], ['get_icon_num_limit', 'x'], ['get_icon_num_random', 'f'], ['get_icon_num_random', 'm'],
  ] };
  assert.deepEqual(canonical(await runNative(input)), canonical(php(input)));
});

test('player pools retain source insertion order for same-name selection and lock release', { timeout: 30_000 }, async t => {
  const php = await oracle(t); if (!php) return;
  const input = { mode: 'pool_order', inCommand: true, rows: [sample('20', { name: 'same', type: '1' }), sample('2', { name: 'same', type: '0' })] };
  const expected = php(input), actual = await runNative(input);
  for (const output of [actual, expected]) {
    for (const name of ['initialLockOrder', 'reinsertedLockOrder', 'playerOrder', 'originalOrder']) output.result[name] = output.result[name].map(String);
    for (const event of output.trace) if (event[0].startsWith('lock-')) event[2] = String(event[2]);
  }
  assert.equal(expected.result.first.pid, '20');
  assert.equal(expected.result.afterReinsert.pid, '2');
  assert.deepEqual(expected.result.initialLockOrder, ['20', '2']);
  assert.deepEqual(expected.result.reinsertedLockOrder, ['2', '20']);
  assert.deepEqual(canonical(actual), canonical(expected));
});

test('player requires actual schema/services instead of silently constructing a mock backend', async () => {
  const source = await readFile(path.join(project, 'engine/include/modules/core/player/main.php'), 'utf8');
  const declared = [...source.matchAll(/\bfunction\s+(\w+)\s*\(/g)].map(match => match[1]).filter(name => name !== 'init').sort();
  assert.deepEqual(Object.keys(playerModule.functions).sort(), declared, 'source declarations are tracked separately from behavioral evidence');
  await assert.rejects(new ModuleRegistry([{ name: 'sys', state: { tablepre: 'bra_' } }, { name: 'map' }, { name: 'input' }, playerModule]).createSession(), /database.query/);
  const { session, services } = await nativeSession({});
  delete services.playerLocks;
  await assert.rejects(session.call('player', 'create_player_lock', 1, 1), /playerLocks.check/);
  delete services.playerAssets;
  await assert.rejects(session.call('player', 'icon_parser_file_check', 'f_1.gif', 'f_1a.gif'), /playerAssets.exists/);
});

test('player saves and reloads source-schema rows in an owned real MySQL database', { timeout: 120_000 }, async t => {
  const isolated = await isolatedDatabase(t, 'player'); if (!isolated) return;
  const { database } = isolated;
  await database.queries(sql);
  const row = sample(); delete row.attackwith;
  await database.arrayInsert('bra_players', row);
  const { session } = await nativeSession({}, database);
  const fetched = await session.call('player', 'fetch_playerdata_by_pid', 1);
  assert.equal(fetched.hp, '100'); assert.equal(fetched.state_backup, '0'); assert.equal(fetched.constructed, true);
  await session.call('player', 'load_playerdata', fetched);
  const state = session.state('player');
  state.sdata.hp = 73; state.wepe = 27;
  assert.equal(state.hp, 73); assert.equal(state.sdata.wepe, 27);
  await session.call('player', 'player_save', state.sdata);
  const reloaded = await session.call('player', 'fetch_playerdata_by_pid', 1, 1, 1);
  assert.equal(reloaded.hp, '73'); assert.equal(reloaded.wepe, '27');
  reloaded.hp = 0; reloaded.state = 3; reloaded.deathmark = 23;
  await session.call('player', 'player_save', reloaded);
  let stored = (await database.query("SELECT hp,state,player_dead_flag FROM bra_players WHERE pid='1'"))[0];
  assert.deepEqual(stored, { hp: '0', state: '23', player_dead_flag: '1' });
  reloaded.hp = 1; reloaded.player_dead_flag = 0;
  await session.call('player', 'player_save', reloaded);
  stored = (await database.query("SELECT hp,player_dead_flag FROM bra_players WHERE pid='1'"))[0];
  assert.deepEqual(stored, { hp: '1', player_dead_flag: '1' }, 'one-way death flag survives stale input');
  await session.call('player', 'rs_game', 4);
  assert.equal((await database.query('SELECT COUNT(*) AS n FROM bra_players'))[0].n, '0');
});

test('unchanged PHP and native player produce identical persisted rows on the same isolated MySQL schema', { timeout: 120_000 }, async t => {
  const php = await oracle(t); if (!php) return;
  const isolated = await isolatedDatabase(t, 'player_oracle'); if (!isolated) return;
  const { database, credentials } = isolated;
  const row = sample(); delete row.attackwith;
  const input = { mode: 'storage', change: { hp: 0, deathmark: '23', state: 3, wepe: 21, extra: 'not stored' } };
  await database.queries(sql); await database.arrayInsert('bra_players', row);
  const actual = await runNative(input, database);
  const actualRows = await database.query('SELECT * FROM bra_players');
  await database.queries(sql); await database.arrayInsert('bra_players', row);
  const expected = php({ ...input, credentials });
  const expectedRows = await database.query('SELECT * FROM bra_players');
  assert.deepEqual(canonical(actual), canonical(expected));
  assert.deepEqual(actualRows, expectedRows);
  assert.equal(expectedRows[0].state, '23'); assert.equal(expectedRows[0].player_dead_flag, '1');
});
