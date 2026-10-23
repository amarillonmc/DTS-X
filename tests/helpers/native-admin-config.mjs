import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const project=fileURLToPath(new URL('../../',import.meta.url));
/** Test-only PHP execution. Config handlers may rewrite only this owned copy. */
export async function createAdminConfigOracle(t){
 const executable=process.env.DTS_REFERENCE_PHP||'php';const version=spawnSync(executable,['-r','echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'],{encoding:'utf8',windowsHide:true});if(version.stdout?.trim()!=='7.4'){t.skip('Development PHP 7.4 oracle unavailable');return;}
 const parent=path.join(project,'var/tests');await fs.mkdir(parent,{recursive:true});const root=await fs.mkdtemp(path.join(parent,'native-admin-config-'));t.after(async()=>{assert.ok(path.resolve(root).startsWith(path.resolve(parent)+path.sep));await fs.rm(root,{recursive:true,force:true});});
 const sources=['include/global.func.php','include/bubblebox.func.php','include/roommng/roommng.config.php','templates/default/templates.lang.php','include/admin/admin.lang.php','gamedata/banlist.list',...['server','system','game'].map(name=>'include/modules/core/sys/config/'+name+'.config.sample.php'),'include/modules/core/map/config/map.config.php','include/modules/core/gameflow/gameflow_combo/config/gameflow_combo.config.php','include/modules/core/gameflow/gameflow_antiafk/config/gameflow_antiafk.config.php',...['corpse','rest','team','cooldown'].map(name=>'include/modules/base/'+name+'/config/'+name+'.config.php')];
 for(const source of sources){const target=path.join(root,source.replace('.sample.php','.php'));await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(path.join(project,'engine',source),target);}
 for(const name of ['configmng','globalgamemng','gamecfgmng','banlistmng','adminlogcheck','gameinfomng'])await fs.writeFile(path.join(root,'include/admin',name+'.php'),(await fs.readFile(path.join(project,'engine/include/admin',name+'.php'),'utf8')).replace('<?php','<?php namespace oracle;'));
 await fs.writeFile(path.join(root,'empty.php'),'');
 const fixture=String.raw`<?php namespace oracle;
 function time(){return $GLOBALS['input']['now'];}
 function template($name){return __DIR__.'/empty.php';}
 function astrfilter($value){return is_array($value)?array_map(__NAMESPACE__.'\\astrfilter',$value):str_replace('eval','',$value);}
 function adminlog(...$args){$GLOBALS['trace'][]=$args;}
 function save_gameinfo(){$row=[];foreach(['weather','hack','gamestate','starttime','readymin','areatime','gamevars']as$key)$row[$key]=$GLOBALS[$key]??null;$GLOBALS['trace'][]=['save',$row];}
 function addnews(...$args){$GLOBALS['trace'][]=['news',...$args];}
 function import_module(...$names){return 'global $wthinfo;';}
 define('IN_GAME',true);define('IN_ADMIN',true);define('GAME_ROOT',__DIR__.'/');date_default_timezone_set('UTC');ini_set('display_errors','stderr');error_reporting(E_ALL & ~E_NOTICE);
 $input=json_decode(stream_get_contents(STDIN),true);$trace=[];require GAME_ROOT.'include/global.func.php';include GAME_ROOT.'include/admin/admin.lang.php';
 foreach(($input['globals']??[])as$key=>$value)$GLOBALS[$key]=$value;
 $_POST=$input['post']??[];foreach(($input['request']??[])as$key=>$value)$GLOBALS[$key]=$value;
 $___MOD_CODE_ADV1=0;$command=$input['command']??'';$cmd_info=false;
 file_put_contents(GAME_ROOT.'gamedata/adminmsg.htm',$input['messages']['adminmsg']??'');file_put_contents(GAME_ROOT.'gamedata/systemmsg.htm',$input['messages']['systemmsg']??'');
 if(isset($input['audit']))file_put_contents(GAME_ROOT.'gamedata/adminlog_nf.php',$input['audit']);
 include GAME_ROOT.'include/admin/'.$input['page'].'.php';
 $fields=[];foreach(($input['fields']??[])as$key)$fields[$key]=$GLOBALS[$key]??null;
 echo json_encode(['info'=>$cmd_info,'trace'=>$trace,'fields'=>$fields,'showdata'=>$showdata??null],JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);
 namespace map;
 function get_area_wavenum(){return $GLOBALS['input']['wave']??0;}
 function get_area_interval(){return 30;}
 function get_current_area($next=0){return $next?[2,3]:[0,1];}
 namespace sys;
 function gameover(...$args){$GLOBALS['trace'][]=['gameover',...$args];$GLOBALS['gamestate']=0;}
 `;
 const script=path.join(root,'fixture.php');await fs.writeFile(script,fixture);
 return input=>{const result=spawnSync(executable,[script],{cwd:root,input:JSON.stringify(input),encoding:'utf8',windowsHide:true,timeout:10000});assert.equal(result.status,0,result.stderr);try{return JSON.parse(result.stdout);}catch{throw new Error(result.stdout+'\n'+result.stderr);}};
}
