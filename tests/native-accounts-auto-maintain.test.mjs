import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {once} from 'node:events';
import {setTimeout as delay} from 'node:timers/promises';
import {isolatedDatabase} from './helpers/native-database.mjs';
import {createAutoMaintainOracle,maintenanceDirectory,seedMaintenanceFiles,maintenanceFiles} from './helpers/native-auto-maintain.mjs';
import {createAutoMaintainService,replaySendResult,replayWasSent} from '../native/system/auto-maintain.mjs';
import {createLockServices} from '../native/storage/locks.mjs';
import {createFileServices} from '../native/storage/files.mjs';
import {createMaintenanceGate} from '../native/http/maintenance.mjs';
import {installationSchema} from '../native/install/installer.mjs';
const DAY=86400;
async function schema(database){for(const name of ['bra_users','bra_del_messages'])await database.execute((await installationSchema()).statements.find(row=>row.name===name).sql);}
async function seed(database,now){
 for(const table of ['bra_users','bra_del_messages']){await database.execute('DELETE FROM '+table);await database.execute('ALTER TABLE '+table+' AUTO_INCREMENT=1');}
 for(const dtimestamp of [now-DAY*30-1,now-DAY*30,now-DAY*30+1,now])await database.arrayInsert('bra_del_messages',{title:'测试邮件',receiver:'账户',sender:'系统',dtimestamp});
 for(const [username,lastwin]of [['甲/乙',0],['账户',123]])await database.arrayInsert('bra_users',{username,password:'fixture-only-hash',lastwin,credits:55});
}
async function environment(t,fixture,entries={},clock=()=>Date.now()/1000){
 const stateRoot=await maintenanceDirectory(t);await seedMaintenanceFiles(stateRoot,entries);const locks=await createLockServices(stateRoot);t.after(()=>locks.close());const maintenance=createMaintenanceGate();t.after(()=>maintenance.close());const files=await createFileServices({stateRoot,sourceRoot:path.join(fixture.root,'engine'),locks:locks.locks,clock});return {stateRoot,database:fixture.database,files,locks:locks.locks,maintenance,clock};
}
test('six maintenance operations match real PHP SQL, backup bytes, deletion boundaries, stat-cache guards and remote progress',async t=>{
 const oracle=await createAutoMaintainOracle(t);if(!oracle)return;const fixture=await isolatedDatabase(t,'auto_maintain');if(!fixture)return;await schema(fixture.database);const wall=Math.floor(Date.now()/1000),gameNow=wall+28800;
 const sourceFiles={
  'gamedata/replays/.gitignore':{content:'keep'},'gamedata/replays/notes.gitignore':{content:'keep'},'gamedata/replays/1.tmp':{content:'delete'},'gamedata/replays/2.js':{content:'delete'},
  ...Object.fromEntries(['1.dat','2.dat','10.dat','s.1.dat','s.2.dat'].map((name,index)=>['gamedata/replays/'+name,{content:'录像'+name,modified:wall-DAY*30-(index%2?0:1)}])),
  'gamedata/cache/a.htm':{content:'expire',modified:wall-DAY-1},'gamedata/cache/b.htm':{content:'keep boundary',modified:wall-DAY},'gamedata/cache/randrecipe_old':{content:'expire',modified:wall-DAY-1},'gamedata/cache/other.txt':{content:'keep',modified:wall-DAY*90},
  ...Object.fromEntries([0,1,2].map(number=>[`gamedata/cache/user_backup/userdb_${number}.php`,{content:'old backup '+number}]))
 };
 const configuration={replay_remote_storage:'https://fixture.invalid/replay_receive.php',replay_remote_storage_sign:'public-fixture',replay_remote_storage_key:'fixture-key',gameurl:'https://source.invalid/'},responses={'1.dat':['try again','Successfully Received.'],'10.dat':['failed'],'2.dat':['2.dat has already existed.'],'s.1.dat':['Successfully Received.'],'s.2.dat':['already']};
 for(const [code,forced,age,remote]of [[0,false,null,false],[1,true,null,false],[2,true,null,false],[4,true,null,false],[8,true,null,false],[16,true,null,false],[32,true,null,false],[63,true,null,true],[63,false,DAY+1,true],[63,false,1,true],[48,false,null,false],[48,false,DAY+1,false],[50,false,DAY+1,false],[56,false,DAY+1,true]]){
  const entries={...sourceFiles,...(age!==null?{'gamedata/tmp/log/auto_maintain.txt':{content:'prior\r\n',modified:wall-age}}:{})},config=remote?configuration:{};await seed(fixture.database,gameNow);
  const expected=await oracle({credentials:fixture.credentials,clock:wall,gameNow,files:entries,code,forced,configuration:config,responses:structuredClone(responses)});await seed(fixture.database,gameNow);
  const env=await environment(t,fixture,entries,()=>wall),trace=[],answers=structuredClone(responses),service=createAutoMaintainService({...env,gameNow:()=>gameNow,configuration:config,sleep:async seconds=>trace.push(['sleep',seconds]),fetch:async(url,options)=>{const context=Object.fromEntries(options.body);context['no-overlap']=Number(context['no-overlap']);trace.push(['http',url.href,context]);const list=answers[context.filename]??[''];return {text:async()=>list.length>1?list.shift():list[0]};}});
  await env.maintenance.request(()=>service.run(code,{forced}));assert.deepEqual(await fixture.database.query('SELECT * FROM bra_del_messages ORDER BY mid'),expected.messages,JSON.stringify({code,forced,age}));assert.deepEqual(await maintenanceFiles(env.stateRoot),expected.files,JSON.stringify({code,forced,age}));assert.deepEqual(await service.readProgress(),expected.progress);assert.deepEqual(trace,expected.trace);
 }
});

test('remote replay transfer uses real HTTP callbacks outside exclusive gate, retries, preserves progress after restart and rejects overlap',async t=>{
 const fixture=await isolatedDatabase(t,'auto_replay');if(!fixture)return;await schema(fixture.database);const now=Math.floor(Date.now()/1000);await seed(fixture.database,now);
 const env=await environment(t,fixture,{'gamedata/replays/1.dat':{content:'binary replay \0中文'},'gamedata/replays/s.2.dat':{content:'small replay'}}),received=new Map(),attempts=new Map(),trace=[];let enter,release;const entered=new Promise(resolve=>{enter=resolve;}),blocked=new Promise(resolve=>{release=resolve;});
 const server=http.createServer(async(req,res)=>{try{let data='';for await(const chunk of req)data+=chunk;const form=new URLSearchParams(data);if(req.url==='/callback/replay_receive.php')return await env.maintenance.request(async()=>{trace.push('callback');res.end(await env.files.readBytes('gamedata/replays/'+form.get('filename')));});
  const name=form.get('filename');attempts.set(name,(attempts.get(name)??0)+1);assert.equal(form.get('no-overlap'),'1');if(name==='1.dat'&&attempts.get(name)<3){res.end('retry');return;}if(name==='1.dat'){enter();await blocked;}
  const result=await fetch(form.get('callurl'),{method:'POST',body:new URLSearchParams({cmd:'storage_callback',filename:name})});received.set(name,Buffer.from(await result.arrayBuffer()));res.end('Successfully Received.');
 }catch(error){res.statusCode=500;res.end('fixture failed');trace.push(error.message);}});server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>new Promise(resolve=>server.close(resolve)));const base='http://127.0.0.1:'+server.address().port;
 const service=createAutoMaintainService({...env,gameNow:()=>now,configuration:{replay_remote_storage:base+'/remote',gameurl:base+'/callback/',replay_remote_storage_sign:'fixture',replay_remote_storage_key:'fixture-key'},sleep:async seconds=>trace.push(seconds)});
 const operation=env.maintenance.request(()=>service.run(4,{forced:true}));await entered;
 const competingLocks=await createLockServices(env.stateRoot);try{assert.deepEqual(await env.maintenance.request(()=>service.run(4,{forced:true})),{ran:false,reason:'already_running'});const competing=createAutoMaintainService({...env,locks:competingLocks.locks});assert.deepEqual(await env.maintenance.request(()=>competing.run(4,{forced:true})),{ran:false,reason:'already_running'});}finally{release();await competingLocks.close();}const result=await operation;assert.equal(result.remote.sent,2);assert.equal(result.remote.failed,0);assert.deepEqual(attempts,new Map([['1.dat',3],['s.2.dat',1]]));assert.equal(received.get('1.dat').toString(),'binary replay \0中文');assert.deepEqual(trace,['callback',5,'callback',5]);
 const restarted=createAutoMaintainService({...env,configuration:{}});assert.deepEqual(await restarted.readProgress(),{version:1,normal:1,small:2,failedNormal:[],failedSmall:[]});assert.equal(await env.files.exists('gamedata/cache/tmp_amrlist.dat'),false);
 // A resumed list must retain the untouched small-game watermark; legacy PHP
 // left it unset and could write a syntactically invalid progress file.
 await env.files.write('gamedata/cache/tmp_amrlist.dat','["3.dat"]');const resumed=createAutoMaintainService({...env,configuration:{replay_remote_storage:base+'/remote',gameurl:base+'/callback'},fetch:async()=>({text:async()=> 'already'})});await env.maintenance.request(()=>resumed.sendReplays());assert.equal((await resumed.readProgress()).small,2);assert.equal((await resumed.readProgress()).normal,3);
});

test('backup drains writers, rotates complete snapshots, preserves user rows and fails closed on malformed replay state',async t=>{
 const fixture=await isolatedDatabase(t,'auto_backup');if(!fixture)return;await schema(fixture.database);const now=Math.floor(Date.now()/1000);await seed(fixture.database,now);const env=await environment(t,fixture),service=createAutoMaintainService({...env,gameNow:()=>now});let release;
 const writer=env.maintenance.request(()=>new Promise(resolve=>{release=resolve;}));while(!release)await delay(1);const backup=env.maintenance.request(()=>service.run(16,{forced:true}));while(!env.maintenance.pending)await delay(1);assert.equal(await env.files.exists('gamedata/cache/user_backup/userdb_2.php'),false);release();await writer;await backup;
 const first=await env.files.readBytes('gamedata/cache/user_backup/userdb_2.php');await fixture.database.execute('UPDATE bra_users SET credits=99');await env.maintenance.request(()=>service.run(16,{forced:true}));assert.deepEqual(await env.files.readBytes('gamedata/cache/user_backup/userdb_1.php'),first);assert.match(await env.files.readText('gamedata/cache/user_backup/userdb_2.php'),/"credits":"99"/);assert.equal((await fixture.database.query('SELECT COUNT(*) AS n FROM bra_users'))[0].n,'2');
 await env.files.write('gamedata/cache/auto_maintain_replay.json','{"version":1}');await assert.rejects(service.readProgress(),/Invalid native/);assert.equal(replaySendResult('Successfully already'),0);assert.equal(replaySendResult('already'),1);assert.equal(replaySendResult('failure'),2);assert.equal(replayWasSent('10.dat',{normal:2,failedNormal:[],small:0,failedSmall:[]}),false);
});
