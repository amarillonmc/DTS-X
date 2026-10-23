import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const project=fileURLToPath(new URL('../../',import.meta.url));
export async function maintenanceDirectory(t,prefix='native-auto-maintain-'){
 const base=path.join(project,'var/tests');await fs.mkdir(base,{recursive:true});const root=await fs.mkdtemp(path.join(base,prefix));
 t.after(async()=>{assert.ok(path.resolve(root).startsWith(path.resolve(base)+path.sep));await fs.rm(root,{recursive:true,force:true});});return root;
}
export async function seedMaintenanceFiles(root,entries){
 for(const directory of ['gamedata/replays','gamedata/cache','gamedata/tmp/log'])await fs.mkdir(path.join(root,directory),{recursive:true});
 for(const [relative,entry]of Object.entries(entries)){const file=path.resolve(root,relative);assert.ok(file.startsWith(path.resolve(root)+path.sep));await fs.mkdir(path.dirname(file),{recursive:true});if(entry.directory)await fs.mkdir(file,{recursive:true});else await fs.writeFile(file,entry.content??'');if(entry.modified)await fs.utimes(file,entry.modified,entry.modified);}
}
export async function maintenanceFiles(root){
 const result={};async function visit(folder){for(const entry of await fs.readdir(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory())await visit(file);else{const relative=path.relative(root,file).replaceAll('\\','/');if(/auto_maintain_replay\.(?:config\.php|json)$/.test(relative))continue;result[relative]=await fs.readFile(file,'utf8');}}}await visit(path.join(root,'gamedata'));return result;
}
/** Unchanged original maintenance bodies, real PHP 7.4 file stat cache and
 * mysqli. Only time, HTTP responses, sleeps and PHP marker locks are observed
 * boundaries. Node tests independently exercise the real OS lock and HTTP.
 */
export async function createAutoMaintainOracle(t){
 const executable=process.env.DTS_REFERENCE_PHP||'php',version=spawnSync(executable,['-r','echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'],{encoding:'utf8',windowsHide:true});if(version.stdout?.trim()!=='7.4'){t.skip('Development PHP 7.4 oracle unavailable');return;}
 const root=await maintenanceDirectory(t,'native-auto-maintain-php-');
 const globalSource=await fs.readFile(path.join(project,'engine/include/global.func.php'),'utf8'),originalWrite=globalSource.slice(globalSource.indexOf('function writeover('),globalSource.indexOf('//打开文件，以数组形式返回'));
 return async input=>{
  const directory=await fs.mkdtemp(path.join(root,'case-'));await seedMaintenanceFiles(directory,input.files??{});
  for(const name of ['misc','replay']){const target=path.join(directory,`include/auto_maintain/auto_maintain_${name}.func.php`);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,(await fs.readFile(path.join(project,`engine/include/auto_maintain/auto_maintain_${name}.func.php`),'utf8')).replace('<?php','<?php namespace oracle;'));}
  await fs.writeFile(path.join(directory,'database.php'),(await fs.readFile(path.join(project,'engine/include/db/db_mysqli.class.php'),'utf8')).replace('<?php','<?php namespace oracle;'));
  const fixture=String.raw`<?php namespace oracle;
 $input=json_decode(stream_get_contents(STDIN),true);$trace=[];date_default_timezone_set('UTC');ini_set('display_errors','stderr');error_reporting(E_ALL & ~E_NOTICE);
 define('IN_GAME',true);define('GAME_ROOT',__DIR__.'/');define('IN_GAME_CHECK_STR',"<?php if(!defined('IN_GAME')) exit('Access Denied'); ?>\r\n");
 function time(){return $GLOBALS['input']['clock'];}function date($format){return \gmdate($format,time());}
 function dir_init($dir){if(!is_dir($dir))mkdir($dir,0700,true);return $dir;}
 function check_lock(...$args){return 0;}function create_lock(...$args){}function release_lock(...$args){}
 function curl_post($url,$context){$GLOBALS['trace'][]=['http',$url,$context];$name=$context['filename'];$answers=&$GLOBALS['input']['responses'][$name];if(!isset($answers)||!count($answers))return '';return count($answers)>1?array_shift($answers):$answers[0];}
 function sleep($seconds){$GLOBALS['trace'][]=['sleep',$seconds];}
 require __DIR__.'/database.php';$charset='utf-8';$dbcharset='utf8';$db=new dbstuff();$c=$input['credentials'];$db->connect($c['host'].':'.$c['port'],$c['user'],$c['password'],$c['database']);
 $gtablepre='bra_';$now=$input['gameNow'];foreach(($input['configuration']??[])as$key=>$value)$GLOBALS[$key]=$value;$replay_remote_storage=$replay_remote_storage??'';
 require GAME_ROOT.'include/auto_maintain/auto_maintain_misc.func.php';require GAME_ROOT.'include/auto_maintain/auto_maintain_replay.func.php';
 if(isset($input['progress'])){$p=$input['progress'];$amr_progress_no=$p['normal'];$amr_progress_sno=$p['small'];$amr_failure_no=$p['failedNormal'];$amr_failure_sno=$p['failedSmall'];amr_maintain_progress_save();}
 clearstatcache();if(($input['operation']??'run')==='send')amr_main();else am_main($input['code'],$input['forced']??0);
 $progress=amr_maintain_progress_get();$rows=$db->fetch_all($db->query('SELECT * FROM bra_del_messages ORDER BY mid'));
 echo json_encode(['trace'=>$trace,'progress'=>['version'=>1,'normal'=>$progress[0],'small'=>$progress[1],'failedNormal'=>$progress[2],'failedSmall'=>$progress[3]],'messages'=>$rows],JSON_UNESCAPED_UNICODE);
 `;
  const script=path.join(directory,'fixture.php');await fs.writeFile(script,fixture+originalWrite);const result=spawnSync(executable,[script],{cwd:directory,input:JSON.stringify(input),encoding:'utf8',windowsHide:true,timeout:10000});assert.equal(result.status,0,result.stderr);let parsed;try{parsed=JSON.parse(result.stdout);}catch{throw new Error(result.stdout+'\n'+result.stderr);}return {...parsed,files:await maintenanceFiles(directory)};
 };
}
