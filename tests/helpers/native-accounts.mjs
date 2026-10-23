import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('../../', import.meta.url));
const fixture = String.raw`<?php
namespace oracle {
 function time(){return $GLOBALS['fixtureInput']['now']??\time();}
 function gexit($message,$file='',$line=0){throw new \RuntimeException($message);}
 function gsetcookie($name,$value,$life=0,$prefix=1){$GLOBALS['fixtureCookies'][]=[$name,$value,$life,$prefix];}
 function set_current_roomid($id){gsetcookie('roomid',$id);}
 function header($value){$GLOBALS['fixtureHeaders'][]=$value;}
 function template($name){$GLOBALS['fixtureTemplate']=$name;return __DIR__.'/empty.php';}
 function check_lock($dir,$file,$timeout,$key=''){$GLOBALS['fixtureTrace'][]=['check',$file,$timeout,$key];return false;}
 function create_lock($dir,$file,$key=''){$GLOBALS['fixtureTrace'][]=['create',$file,$key];return true;}
 function release_lock($dir,$file,$key=''){$GLOBALS['fixtureTrace'][]=['release',$file,$key];}
 function save_gameinfo(){$GLOBALS['fixtureTrace'][]=['save',$GLOBALS['validnum']??null,$GLOBALS['alivenum']??null,$GLOBALS['deathnum']??null];}
 function addnews(...$args){$GLOBALS['fixtureTrace'][]=['news',...$args];}
}
namespace {
 function import_module(...$names){return 'global $db,$gtablepre,$cudata,$decoded_u_settings,$cards,$card_rarecolor,$logistics_shop_items,$now,$pid,$ppid,$acquired_list,$parameter_list,$wthinfo,$plsinfo;';}
 function fetch_udata_by_username(...$args){return \oracle\fetch_udata_by_username(...$args);}
 function update_udata_by_username(...$args){return \oracle\update_udata_by_username(...$args);}
 define('IN_GAME',true);define('GAME_ROOT',__DIR__.'/engine/');date_default_timezone_set('UTC');
 error_reporting(E_ALL & ~E_NOTICE);ini_set('display_errors','stderr');
 $fixtureInput=json_decode(stream_get_contents(STDIN),true);$fixtureCookies=[];$fixtureHeaders=[];$fixtureTrace=[];$fixtureTemplate=null;$fixtureResult=null;
 require GAME_ROOT.'include/global.func.php';require GAME_ROOT.'include/user.oracle.php';require GAME_ROOT.'include/cards.oracle.php';require GAME_ROOT.'include/settings.oracle.php';require GAME_ROOT.'include/achievements.oracle.php';require GAME_ROOT.'include/messages.oracle.php';require GAME_ROOT.'include/skills.oracle.php';
 define('MOD_CARDBASE',true);define('MOD_CARDBASE_CARD_FRAME','card_frame');
 $now=$fixtureInput['now']??time();$game_url=$fixtureInput['gameUrl']??'https://example.test/';$nmlimit=$fixtureInput['nameLimit']??'';$iplimit=$fixtureInput['ipLimit']??'';
 $oldpswdcmp=$fixtureInput['oldCompatibility']??0;$gtablepre='bra_';$tablepre='bra_';$userdb_remote_storage='';$userdb_forced_local=0;$userdb_forced_key='';$udata_lock_pool=[];
 $_SERVER=$fixtureInput['server']??[];$_POST=$fixtureInput['post']??($fixtureInput['input']??[]);$_ERROR=$fixtureInput['errors']??[];$_INFO=$fixtureInput['info']??[];
 if(isset($fixtureInput['credentials'])){$cred=$fixtureInput['credentials'];require GAME_ROOT.'include/db/db_mysqli.class.php';$db=new dbstuff();$charset='utf-8';$dbcharset='utf8';$db->connect($cred['host'].':'.$cred['port'],$cred['user'],$cred['password'],$cred['database']);}
 if(isset($fixtureInput['script'])&&!isset($fixtureInput['entry']))define('CURSCRIPT',$fixtureInput['script']);
 foreach(($fixtureInput['globals']??[]) as $fixtureKey=>$fixtureValue)$GLOBALS[$fixtureKey]=$fixtureValue;
 foreach(($fixtureInput['gameRooms']??[])as$room){@mkdir(GAME_ROOT.'gamedata/tmp/rooms',0700,true);file_put_contents(GAME_ROOT.'gamedata/tmp/rooms/'.(int)$room.'.txt','fixture room');}
 if(isset($fixtureInput['entry'])){
  foreach(($fixtureInput['input']??[]) as $fixtureKey=>$fixtureValue)$GLOBALS[$fixtureKey]=$fixtureValue;
  register_shutdown_function(function(){global $fixtureResult,$fixtureCookies,$fixtureHeaders,$fixtureTrace,$fixtureTemplate,$db,$gamedata; $body=ob_get_contents();if(ob_get_level())ob_end_clean();
   $rows=isset($db)?$db->fetch_all($db->query('SELECT * FROM bra_users ORDER BY uid')):[];
   $extra=[];if(($GLOBALS['fixtureInput']['entry']??'')==='messages'){$extra=['messages'=>$GLOBALS['messages']??[],'mode'=>$GLOBALS['mode']??null,'info'=>$GLOBALS['info']??[],'storedMessages'=>$db->fetch_all($db->query('SELECT * FROM bra_messages ORDER BY mid')),'storedDeleted'=>$db->fetch_all($db->query('SELECT * FROM bra_del_messages ORDER BY mid'))];}
   if(($GLOBALS['fixtureInput']['entry']??'')==='admin'){$extra=['gmdata'=>$GLOBALS['gmdata']??[],'urdata'=>$GLOBALS['urdata']??[],'cmd_info'=>$GLOBALS['cmd_info']??null,'resultinfo'=>$GLOBALS['resultinfo']??null,'urcmd'=>$GLOBALS['urcmd']??null];}
   if($GLOBALS['fixtureInput']['gameAdmin']??false){$extra=array_merge($extra,['players'=>$db->fetch_all($db->query('SELECT * FROM bra_players ORDER BY pid')),'pcdata'=>$GLOBALS['pcdata']??[],'npcdata'=>$GLOBALS['npcdata']??[],'pc'=>$GLOBALS['pc']??null,'npc'=>$GLOBALS['npc']??null,'validnum'=>$GLOBALS['validnum']??null,'alivenum'=>$GLOBALS['alivenum']??null,'deathnum'=>$GLOBALS['deathnum']??null]);}
   if(($GLOBALS['fixtureInput']['input']['mode']??'')==='roomclose'){$extra['games']=$db->fetch_all($db->query('SELECT * FROM bra_game ORDER BY groomid'));$extra['roomExists']=file_exists(GAME_ROOT.'gamedata/tmp/rooms/'.(int)$GLOBALS['roomtoclose'].'.txt');}
   echo json_encode(array_merge(['error'=>$fixtureResult,'cookies'=>$fixtureCookies,'headers'=>$fixtureHeaders,'trace'=>$fixtureTrace,'template'=>$fixtureTemplate,'body'=>$body,'data'=>$gamedata??null,'rows'=>$rows],$extra),JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);
  });ob_start();ob_start();
  try{include __DIR__.'/entry-'.$fixtureInput['entry'].'.php';}catch(\Throwable $error){$fixtureResult=$error->getMessage();}exit;
 }
 try {
  if(($fixtureInput['mode']??'')==='storage'){
   $fixtureResult=[];foreach($fixtureInput['operations'] as $op){$fn='oracle\\'.$op['function'];$fixtureResult[]=$fn(...($op['args']??[]));}
   $fixtureResult=['results'=>$fixtureResult,'rows'=>$db->fetch_all($db->query('SELECT * FROM bra_users ORDER BY uid')),'trace'=>$fixtureTrace,'pool'=>$udata_lock_pool];
  }elseif(($fixtureInput['mode']??'')==='keyed_order'){
   $rows=\oracle\fetch_udata(...$fixtureInput['args']);$fixtureResult=['keys'=>array_keys($rows),'payload'=>gencode($rows)];
  }elseif(($fixtureInput['mode']??'')==='messages'){
   $fixtureResult=[];foreach($fixtureInput['operations'] as $op){$fn='oracle\\'.$op['function'];$fixtureResult[]=$fn(...($op['args']??[]));}
   $fixtureResult=['results'=>$fixtureResult,'messages'=>$db->fetch_all($db->query('SELECT * FROM bra_messages ORDER BY mid')),'deleted'=>$db->fetch_all($db->query('SELECT * FROM bra_del_messages ORDER BY mid')),'users'=>$db->fetch_all($db->query('SELECT * FROM bra_users ORDER BY uid')),'info'=>$info??[]];
  }elseif(($fixtureInput['mode']??'')==='settings'){
   $fixtureResult=[];foreach($fixtureInput['operations'] as $op){if($op['function']==='get'){$fixtureResult[]=\user_settings\get_u_settings($op['ud']??null);}else{$ud=$op['ud']??null;\user_settings\save_u_settings($op['settings'],$ud);$fixtureResult[]=$ud;}}
   $fixtureResult=['results'=>$fixtureResult,'current'=>$cudata,'cache'=>$decoded_u_settings];
  }else{$fn='oracle\\'.$fixtureInput['function'];$fixtureResult=$fn(...($fixtureInput['args']??[]));}
  echo json_encode(['result'=>$fixtureResult],JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);
 }catch(\Throwable $error){echo json_encode(['error'=>$error->getMessage()]);}
}`;

/** Execute original function/entry bodies in a test-only namespace so the
 * clock, HTTP exit/template/cookie and lock boundaries are observable. All
 * hashing, validation, SQL, account mutation and registration rules remain
 * the original source. This directory is never used by production code. */
export async function createAccountsOracle(t) {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true, timeout: 10_000 });
  if (version.error?.code === 'ENOENT' || version.stdout?.trim() !== '7.4') { t.skip('Development-only PHP 7.4 oracle unavailable; set DTS_REFERENCE_PHP.'); return null; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'native-accounts-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  for (const source of ['include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', 'include/db/db_mysqli.class.php', 'templates/default/help.htm','gamedata/admincfg.php','include/admin/admin.lang.php']) {
    const target = path.join(root, 'engine', source); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', source), target);
  }
  await mkdir(path.join(root, 'engine/gamedata/cache'), { recursive: true });
  await mkdir(path.join(root,'engine/gamedata/cache/user_backup'),{recursive:true});
  await mkdir(path.join(root, 'include'), { recursive: true }); await mkdir(path.join(root, 'gamedata'), { recursive: true });
  await writeFile(path.join(root, 'include/common.inc.php'), '<?php // Explicit host boundary: the harness supplies the filtered request and user database.');
  await writeFile(path.join(root, 'include/messages.func.php'), '<?php // Original namespaced messages functions already loaded by the oracle.');
  await writeFile(path.join(root, 'gamedata/banlist.list'), '<?php // The harness supplies the selected ban rules.');
  await writeFile(path.join(root, 'empty.php'), '');
  const source = await readFile(path.join(project, 'engine/include/user.func.php'), 'utf8');
  await writeFile(path.join(root, 'engine/include/user.oracle.php'), source.replace('<?php', '<?php\nnamespace oracle;'));
  for (const [name,relative] of [['cards','extra/card/cardbase'],['settings','extra/misc/user_settings'],['achievements','extra/achievement/achievement_base'],['skills','base/skillbase']]) {
    const source = await readFile(path.join(project,'engine/include/modules',relative,'main.php'),'utf8');
    await writeFile(path.join(root,'engine/include',name + '.oracle.php'), source.replaceAll('if (eval(__MAGIC__)) return $___RET_VALUE;',''));
  }
  await writeFile(path.join(root,'engine/include/messages.oracle.php'), (await readFile(path.join(project,'engine/include/messages.func.php'),'utf8')).replace('<?php','<?php\nnamespace oracle;'));
  for (const name of ['gmlist','urlist','pcmng','npcmng','gamecheck','rankclear','antiAFKmng','roomclose'])await writeFile(path.join(root,'engine/include/admin',name+'.php'),(await readFile(path.join(project,'engine/include/admin',name+'.php'),'utf8')).replace('<?php','<?php\nnamespace oracle;'));
  for (const entry of ['login', 'register', 'user','messages','admin']) await writeFile(path.join(root, `entry-${entry}.php`), (await readFile(path.join(project, 'engine', entry + '.php'), 'utf8')).replace('<?php', '<?php\nnamespace oracle;'));
  const main = path.join(root, 'oracle.php'); await writeFile(main, fixture);
  const run = input => {
    const result = spawnSync(executable, ['-d', 'display_errors=stderr', main], { cwd: root, input: JSON.stringify(input), encoding: 'utf8', windowsHide: true, timeout: 30_000, maxBuffer: 8 * 1024 * 1024 });
    assert.equal(result.status, 0, input.credentials ? 'Original account database oracle failed (diagnostics suppressed)' : result.stderr);
    try { return JSON.parse(result.stdout); } catch { throw new Error(input.credentials ? 'Invalid account database oracle output (diagnostics suppressed)' : `Invalid account oracle output: ${result.stdout}\n${result.stderr}`); }
  };
  run.async = input => new Promise((resolve, reject) => {
    const child = spawn(executable, ['-d', 'display_errors=stderr', main], { cwd: root, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    const timer = setTimeout(() => { child.kill(); reject(new Error('Original account oracle timed out')); }, 30000);
    let stdout = ''; child.stdout.setEncoding('utf8'); child.stdout.on('data', data => { stdout += data; });
    child.stderr.resume(); child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => { clearTimeout(timer); if (code !== 0) return reject(new Error('Original account oracle failed (diagnostics suppressed)')); try { resolve(JSON.parse(stdout)); } catch { reject(new Error('Invalid account oracle output (diagnostics suppressed)')); } });
    child.stdin.end(JSON.stringify(input));
  });
  return run;
}
