import fs from 'node:fs/promises';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {privateAccountPath} from '../accounts/private-files.mjs';
import {protectedHeader} from './sys-support.mjs';

const mainLog='gamedata/tmp/log/auto_maintain.txt',replayLog='gamedata/tmp/log/auto_maintain_replay.txt',progressFile='gamedata/cache/auto_maintain_replay.json',listFile='gamedata/cache/tmp_amrlist.dat';
const DAY=86400,asInteger=value=>Math.trunc(Number.parseFloat(String(value))||0),date=value=>new Date(value*1000).toISOString().slice(0,19).replace('T',' ');
const replayNumber=name=>asInteger(name.startsWith('s')?name.slice(2,-4):name.slice(0,-4));
export function replaySendResult(response){return String(response).includes('Successfully')?0:String(response).includes('already')?1:2;}
export function replayWasSent(name,progress){const small=name.startsWith('s'),number=replayNumber(name);return number<=asInteger(progress[small?'small':'normal'])&&!progress[small?'failedSmall':'failedNormal'].some(value=>asInteger(value)===number);}
function validateProgress(value){
 if(!value||value.version!==1||!['normal','small'].every(key=>Number.isSafeInteger(value[key])&&value[key]>=0)||!['failedNormal','failedSmall'].every(key=>Array.isArray(value[key])&&value[key].every(item=>typeof item==='string'&&/^\d+$/.test(item))))throw new Error('Invalid native replay maintenance progress');return value;
}

/** Six original daily maintenance operations. Callers enter the shared request
 * gate, never its exclusive run() for the whole operation: remote storage sends
 * an HTTP callback to this host. Only the local users snapshot drains writers.
 * A nonblocking OS lease rejects overlap, including across Node processes.
 * Progress is inert JSON; legacy executable PHP state is never loaded.
 */
export function createAutoMaintainService({stateRoot,database,files,locks,maintenance,tablePrefix='bra_',gameNow=()=>Date.now()/1000,clock=()=>Date.now()/1000,configuration={},fetch:fetcher=globalThis.fetch,sleep=seconds=>delay(seconds*1000)}){
 if(!/^[A-Za-z0-9_]*$/.test(tablePrefix)||!files||typeof locks?.acquire!=='function'||typeof locks?.release!=='function')throw new TypeError('Native maintenance requires database, file and OS-lock services');
 const settings=()=>typeof configuration==='function'?configuration():configuration;
 const log=(line,replay=false)=>files.write(replay?replayLog:mainLog,line+'\r\n','ab+');
 const isOldEnough=async()=>{const modified=await files.mtime(mainLog);return modified===false||clock()-modified>=DAY;};
 const readProgress=async()=>await files.exists(progressFile)?validateProgress(JSON.parse(await files.readText(progressFile))):{version:1,normal:0,small:0,failedNormal:[],failedSmall:[]};
 const atomicWrite=async(relative,bytes)=>{const target=await privateAccountPath(stateRoot,relative),temporary=await privateAccountPath(stateRoot,relative+'.'+randomBytes(12).toString('hex')+'.tmp');await fs.writeFile(temporary,bytes,{flag:'wx',mode:0o600});try{await fs.rename(temporary,target);}catch(error){await fs.unlink(temporary);throw error;}};
 let running=false;
 const withLease=async(callback)=>{if(running)return {ran:false,reason:'already_running'};running=true;let token;try{try{token=await locks.acquire('auto-maintain',{timeoutMs:0});}catch(error){if(error.code==='LOCK_TIMEOUT')return {ran:false,reason:'already_running'};throw error;}return await callback();}finally{try{if(token)await locks.release('auto-maintain',token);}finally{running=false;}}};
 const sendFile=async filename=>{
  const config=settings(),remote=config.replay_remote_storage;let url;try{url=new URL(remote);}catch{throw new TypeError('Invalid remote replay storage URL');}
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.hash)throw new TypeError('Invalid remote replay storage URL');
  const body=new URLSearchParams({sign:String(config.replay_remote_storage_sign??''),pass:String(config.replay_remote_storage_key??''),cmd:'storage_req',filename,callurl:String(config.gameurl??'').replace(/\/$/,'')+'/replay_receive.php','no-overlap':'1'});
  let response='',result=2;
  for(let attempt=0;attempt<3;attempt++){
   try{const res=await fetcher(url,{method:'POST',body,signal:AbortSignal.timeout(10000),redirect:'manual'});response=(await res.text()).replace(/^[ \n\r\t\v\0]+|[ \n\r\t\v\0]+$/g,'');}catch{response='';}
   result=replaySendResult(response);if(result<=1)break;
  }
  return {result,response};
 };
 async function sendReplaysUnlocked(){
  await log(date(clock())+'\r\nReplay maintain started.',true);if(!settings().replay_remote_storage){await log('No remote storage setting.',true);return {sent:0,failed:0};}
  // Always load progress, also when resuming an existing list. The old PHP
  // routine omitted this on resume and could write invalid PHP assignments.
  const progress=await readProgress();let list;
  if(await files.exists(listFile))list=JSON.parse(await files.readText(listFile));
  else{list=[];for(const name of await files.list('gamedata/replays')??[])if(name.endsWith('.dat')&&!name.startsWith('.')&&!await files.isDirectory('gamedata/replays/'+name)&&!replayWasSent(name,progress))list.push(name);list.sort();await atomicWrite(listFile,JSON.stringify(list));}
  if(!Array.isArray(list)||!list.every(name=>typeof name==='string'&&/^(?:s\.)?[0-9]+\.dat$/.test(name)))throw new Error('Invalid replay maintenance list');
  progress.failedNormal=[];progress.failedSmall=[];let sent=0,failed=0;
  for(const filename of list){const small=filename.startsWith('s'),number=small?filename.slice(2,-4):filename.slice(0,-4),{result,response}=await sendFile(filename);
   if(result>1){progress[small?'failedSmall':'failedNormal'].push(number);failed++;}else sent++;
   progress[small?'small':'normal']=asInteger(number);await log(`File ${filename} sent. ${result<=1?'Successful. ':'Failure: '}${response} `,true);if(result===0)await sleep(5);
  }
  await atomicWrite(progressFile,JSON.stringify(validateProgress(progress))+'\n');await log('Maintaining over.\r\n--------------------------------\r\n',true);await files.remove(listFile);return {sent,failed,progress};
 }
 async function backupUsers(){
  if(typeof maintenance?.run!=='function')throw new TypeError('User backup requires the host maintenance gate');
  return maintenance.run(async()=>{
   const token=await locks.acquire('userdb_auto_backup',{timeoutMs:60000});
   try{const rows=await database.query(`SELECT * FROM ${tablePrefix}users`),bytes=protectedHeader+rows.map(row=>JSON.stringify(row).replaceAll('/','\\/')+'\r\n').join('');
    const directory=await privateAccountPath(stateRoot,'gamedata/cache/user_backup',{directory:true}),stage=await privateAccountPath(stateRoot,'gamedata/cache/user_backup/stage_'+randomBytes(12).toString('hex')+'.tmp');
    // Finish the snapshot before rotating any existing backup; failed SELECT
    // or encoding cannot delete a previously valid generation.
    await fs.writeFile(stage,bytes,{flag:'wx',mode:0o600});
    const backup=async number=>privateAccountPath(stateRoot,'gamedata/cache/user_backup/userdb_'+number+'.php');
    try{await fs.unlink(await backup(0));}catch(error){if(error.code!=='ENOENT')throw error;}
    for(const number of [1,2])try{await fs.rename(await backup(number),await backup(number-1));}catch(error){if(error.code!=='ENOENT')throw error;}
    await fs.rename(stage,path.join(directory,'userdb_2.php'));return rows.length;
   }finally{await locks.release('userdb_auto_backup',token);}
  });
 }
 async function runUnlocked(code,forced){
  if(!Number.isSafeInteger(code)||code<0||code>63)throw new TypeError('Maintenance code must be a bit mask from 0 to 63');
  // PHP 7.4 has ONE CurrentStatFile (ext/standard/filestat.c), not one cache
  // entry per path. Appending keeps the initial log stat, but unlink clears it
  // and the replay scans' is_dir replaces it. Model just this second guard;
  // the ordinary native file service does not emulate PHP's stat cache.
  // https://github.com/php/php-src/blob/PHP-7.4.33/ext/standard/filestat.c
  const initialModified=await files.mtime(mainLog);
  if(!forced&&initialModified!==false&&clock()-initialModified<DAY)return {ran:false,reason:'recent'};
  const result={ran:true,deletedMessages:0,deletedReplayFiles:0,prunedReplays:0,backedUpUsers:0,deletedTempFiles:0};let originalLogStatCached=initialModified!==false;
  await log(date(clock())+'\r\nAuto-maintaining code started.');
  if(code){await database.execute(`DELETE FROM ${tablePrefix}del_messages WHERE dtimestamp <= ${Math.floor(gameNow())-DAY*30}`);result.deletedMessages=database.affected_rows();await log(`Dustbin messages created over 30 days ago deleted. Affected ${result.deletedMessages} records.`);}
  if(code&2){for(const name of await files.list('gamedata/replays')??[]){if(name.startsWith('.'))continue;const extension=path.posix.extname(name).slice(1);if(extension==='dat'||extension==='gitignore'||await files.isDirectory('gamedata/replays/'+name))continue;await files.remove('gamedata/replays/'+name);originalLogStatCached=false;result.deletedReplayFiles++;}await log(`All non .dat files in /gamedata/replays/ deleted. Affected ${result.deletedReplayFiles} files.`);}
  if((code&4)&&settings().replay_remote_storage){result.remote=await sendReplaysUnlocked();originalLogStatCached=false;await log('All replay files sent to remote server. You can check /gamedata/tmp/log/auto_maintain_replay.txt for detailed infomations.');}
  if((code&8)&&settings().replay_remote_storage){const progress=await readProgress(),names=await files.list('gamedata/replays')??[];if(names.length)originalLogStatCached=false;for(const name of names)if(name.endsWith('.dat')&&!name.startsWith('.')&&!await files.isDirectory('gamedata/replays/'+name)&&replayWasSent(name,progress)&&clock()-await files.mtime('gamedata/replays/'+name)>DAY*30){await files.remove('gamedata/replays/'+name);result.prunedReplays++;}await log(`All replay files sent to remote server and created over 30 days ago deleted. Affected ${result.prunedReplays} files.`);}
  if(!forced&&!originalLogStatCached&&!await isOldEnough())return {...result,stoppedAtSecondGuard:true};
  if(code&16){result.backedUpUsers=await backupUsers();await log(`Userdb backuped. Affected ${result.backedUpUsers} records.`);}
  if(code&32){for(const name of await files.list('gamedata/cache')??[])if(!name.startsWith('.')&&(name.endsWith('.htm')||name.startsWith('randrecipe'))&&!await files.isDirectory('gamedata/cache/'+name)&&clock()-await files.mtime('gamedata/cache/'+name)>DAY){await files.remove('gamedata/cache/'+name);result.deletedTempFiles++;}await log(`Miscellaneous temp files deleted. Affected ${result.deletedTempFiles} files.`);}
  await log('Auto-maintaining finished.\r\n-------------------------------------------------');return result;
 }
 return Object.freeze({run:(code=63,{forced=false}={})=>withLease(()=>runUnlocked(code,forced)),isOldEnough,readProgress,sendReplays:()=>withLease(sendReplaysUnlocked)});
}
