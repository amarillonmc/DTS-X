import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {isolatedDatabase} from './helpers/native-database.mjs';

const project=fileURLToPath(new URL('../',import.meta.url));
async function acceptanceRoot(){
 if(!process.env.NATIVE_ACCEPTANCE_ROOT)return project;
 const base=path.resolve(project,'var/tests'),candidate=path.resolve(process.env.NATIVE_ACCEPTANCE_ROOT);
 assert.equal(path.dirname(candidate),base,'Acceptance runtime must be an immediate child of this repository var/tests');
 assert.match(path.basename(candidate),/^native-production-deps-[A-Za-z0-9_-]+$/,'Acceptance runtime must use the dedicated production dependency fixture prefix');
 assert.equal((await fs.lstat(candidate)).isSymbolicLink(),false,'Acceptance runtime must not be a symlink');
 const actual=await fs.realpath(candidate),actualBase=await fs.realpath(base);
 assert.equal(path.dirname(actual),actualBase,'Resolved acceptance runtime must remain inside this repository fixture directory');
 assert.match(path.basename(actual),/^native-production-deps-[A-Za-z0-9_-]+$/);return actual;
}
async function bounded(promise,milliseconds,message){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),milliseconds);})]);}finally{clearTimeout(timer);}}
async function unusedPort(){const socket=net.createServer();await new Promise((resolve,reject)=>{socket.once('error',reject);socket.listen(0,'127.0.0.1',resolve);});const port=socket.address().port;await new Promise((resolve,reject)=>socket.close(error=>error?reject(error):resolve()));return port;}

test('default production CLI installs, validates and restarts with legacy imports blocked, real HTTP and graceful SIGTERM',{timeout:180000},async t=>{
 const runtimeRoot=await acceptanceRoot(),manifest=JSON.parse(await fs.readFile(path.join(runtimeRoot,'package.json'),'utf8'));
 assert.deepEqual(Object.keys(manifest.dependencies??{}).sort(),['fs-ext-extra-prebuilt','mysql2']);
 for(const name of ['setup','compile','doctor'])assert.ok(manifest.scripts[name].includes(`native/${name}.mjs`),`${name} must use the native executable`);
 // This final acceptance must fail if its explicitly dedicated fixture is
 // unavailable. Never silently skip or fall back to .env/production settings.
 await fs.access(path.join(project,'var/test-db-credentials.json'));
 const fixture=await isolatedDatabase(t,'default_entry');assert.ok(fixture);assert.deepEqual(await fixture.database.query('SHOW TABLES'),[]);
 const base=path.join(project,'var/tests');await fs.mkdir(base,{recursive:true});const stateRoot=await fs.mkdtemp(path.join(base,'native-default-entry-'));
 t.after(async()=>{assert.ok(path.resolve(stateRoot).startsWith(path.resolve(base)+path.sep));await fs.rm(stateRoot,{recursive:true,force:true});});
 const administrator='入口管理',administratorPassword='NativeDefaultOnly123!',port=await unusedPort(),origin='http://127.0.0.1:'+port;
 const environment={...process.env,DB_HOST:fixture.credentials.host,DB_PORT:String(fixture.credentials.port),DB_NAME:fixture.databaseName,DB_USER:fixture.credentials.user,DB_PASSWORD:fixture.credentials.password,
  TABLE_PREFIX:'bra_',ADMIN_USER:administrator,ADMIN_PASSWORD:administratorPassword,NATIVE_DATA_DIR:stateRoot,DATA_DIR:stateRoot,HOST:'127.0.0.1',PORT:String(port),PUBLIC_URL:origin,AUTO_SETUP:'1',TRUST_PROXY:'0',NATIVE_TICK_MS:'60000',NODE_ENV:'production',NODE_OPTIONS:'',NATIVE_ACCEPTANCE_RUNTIME_ROOT:runtimeRoot,NATIVE_ACCEPTANCE_MODE:'server'};
 const redact=value=>[fixture.credentials.password,administratorPassword,environment.ADMIN_PASSWORD].filter(Boolean).reduce((text,secret)=>text.replaceAll(secret,'[redacted]'),value);
 const runCli=async name=>{
  const child=spawn(process.execPath,['--import',pathToFileURL(path.join(project,'tests/helpers/native-default-entry-preload.mjs')).href,path.join(runtimeRoot,'native',name+'.mjs')],{cwd:runtimeRoot,env:{...environment,NATIVE_ACCEPTANCE_MODE:'cli'},windowsHide:true,stdio:['ignore','pipe','pipe','ipc']});
  let stdout='',stderr='',guard=false;
  child.stdout.on('data',chunk=>{stdout+=chunk.toString();});child.stderr.on('data',chunk=>{stderr+=chunk.toString();});child.on('message',message=>{if(message?.type==='native-import-guard-ready')guard=true;});
  const closed=new Promise((resolve,reject)=>{child.once('error',error=>reject(new Error(redact(error.message))));child.once('close',(code,signal)=>resolve({code,signal}));});
  let result;try{result=await bounded(closed,45000,`Native ${name} CLI did not finish`);}catch(error){if(child.exitCode===null&&child.signalCode===null){child.kill('SIGKILL');await closed.catch(()=>{});}throw error;}
  assert.equal(guard,true,`${name} must run with legacy imports blocked`);assert.equal(result.code,0,`${name} failed: ${redact(stderr)}`);assert.equal(result.signal,null,`${name} must exit naturally`);
  return {stdout:redact(stdout),stderr:redact(stderr)};
 };
 const launch=async()=>{
  const child=spawn(process.execPath,['--import',pathToFileURL(path.join(project,'tests/helpers/native-default-entry-preload.mjs')).href,path.join(runtimeRoot,'server.mjs')],{cwd:runtimeRoot,env:environment,windowsHide:true,stdio:['ignore','pipe','pipe','ipc']});
  let stdout='',stderr='',guard=false,signalListeners=null,resolveReady,rejectReady;
  const ready=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject;}),exited=new Promise(resolve=>child.once('exit',(code,signal)=>resolve({code,signal})));
  child.on('message',message=>{if(message.type==='native-import-guard-ready')guard=true;if(message.type==='native-shutdown-signal')signalListeners=message.listeners;});
  child.stdout.on('data',chunk=>{stdout+=chunk.toString();if(stdout.includes(`Native Node.js game listening on 127.0.0.1:${port}`))resolveReady();});child.stderr.on('data',chunk=>{stderr+=chunk.toString();});
  child.once('error',error=>rejectReady(error));child.once('exit',()=>rejectReady(new Error('Default server exited before readiness: '+redact(stderr))));
  let stopped=false;
  const stop=async()=>{if(stopped)return;stopped=true;
   if(child.exitCode!==null||child.signalCode!==null)throw new Error('Default server exited before the requested graceful shutdown: '+redact(stderr));
   child.send({type:'native-entry-test-stop'});
   let result;try{result=await bounded(exited,35000,'Native graceful shutdown did not finish');}catch(error){child.kill('SIGKILL');await exited;throw error;}
   assert.equal(signalListeners>0,true,'Production SIGTERM handler must exist');assert.equal(result.code,0,redact(stderr));assert.equal(result.signal,null,'Graceful shutdown must not use process termination');
  };
  try{await bounded(ready,45000,'Default native executable did not become ready');assert.equal(guard,true,'Import guard must run before the entry');return {child,stop,diagnostics:()=>redact(stderr)};}
  catch(error){if(child.exitCode===null&&child.signalCode===null){child.kill('SIGKILL');await exited;}throw error;}
 };
 let processHandle;
 try{
  assert.match((await runCli('setup')).stdout,/Native database and private state are ready/);
  const installedOwner=JSON.parse(await fs.readFile(path.join(stateRoot,'native-install.json'),'utf8')).owner;
  assert.match((await runCli('compile')).stdout,/Validated \d+ native modules and \d+ static templates/);
  const diagnostics=JSON.parse((await runCli('doctor')).stdout);assert.equal(diagnostics.runtime,'native-node');assert.equal(diagnostics.ownership,'verified');assert.equal(diagnostics.database,'connected');assert.equal(diagnostics.osLocks,'available');assert.ok(diagnostics.modules>700);
  processHandle=await launch();
  const health=await fetch(origin+'/healthz',{signal:AbortSignal.timeout(10000)});assert.equal(health.status,200);const status=await health.json();assert.equal(status.runtime,'native-node');assert.equal(status.ready,true);assert.ok(status.enabledModules>700);
  const index=await fetch(origin+'/',{signal:AbortSignal.timeout(15000)});assert.equal(index.status,200,processHandle.diagnostics());assert.match(await index.text(),/<(?:html|head|body|form|table)[\s>]/i);
  const journal=JSON.parse(await fs.readFile(path.join(stateRoot,'native-install.json'),'utf8'));assert.equal(journal.status,'ready');assert.equal(journal.database,fixture.databaseName);assert.equal(journal.tablePrefix,'bra_');assert.equal(journal.owner,installedOwner);assert.equal((await fixture.database.query('SELECT owner FROM bra_native_install WHERE singleton=1'))[0].owner,journal.owner);
  await fs.writeFile(path.join(stateRoot,'native-userdb-peers.json'),JSON.stringify({version:1,peers:{fixture:{pass:'private-fixture-peer-secret',ip:'127.0.0.1'}}}));
  await fs.writeFile(path.join(stateRoot,'native-replay-peers.json'),JSON.stringify({version:1,peers:{fixture:'private-fixture-replay-secret'}}));
  for(const route of ['/native-install.json','/native-userdb-peers.json','/native-replay-peers.json','/include/modules/core/sys/config/server.config.sample.php','/gamedata/cache/user_backup/userdb_2.php']){const response=await fetch(origin+route,{signal:AbortSignal.timeout(5000)});assert.equal(response.status,404,route);const body=await response.text();assert.equal(body.includes('private-fixture'),false);}
  await fixture.database.execute("UPDATE bra_users SET gold=87654,motto='根入口持久校验' WHERE uid=1");const before=(await fixture.database.query('SELECT uid,username,password,gold,motto FROM bra_users WHERE uid=1'))[0];assert.equal(before.username,administrator);
  await processHandle.stop();processHandle=null;
  // Reopening the same owned DB/directory must not reset the account or owner.
  environment.ADMIN_PASSWORD='ChangedMustNotReset123!';assert.match((await runCli('setup')).stdout,/Existing owned data was preserved/);
  assert.deepEqual((await fixture.database.query('SELECT uid,username,password,gold,motto FROM bra_users WHERE uid=1'))[0],before);assert.equal(JSON.parse(await fs.readFile(path.join(stateRoot,'native-install.json'),'utf8')).owner,journal.owner);
  processHandle=await launch();const secondHealth=await fetch(origin+'/healthz',{signal:AbortSignal.timeout(10000)});assert.equal((await secondHealth.json()).ready,true);
  assert.deepEqual((await fixture.database.query('SELECT uid,username,password,gold,motto FROM bra_users WHERE uid=1'))[0],before);assert.equal(JSON.parse(await fs.readFile(path.join(stateRoot,'native-install.json'),'utf8')).owner,journal.owner);
  assert.equal((await fetch(origin+'/',{signal:AbortSignal.timeout(15000)})).status,200,processHandle.diagnostics());await processHandle.stop();processHandle=null;
 }finally{await processHandle?.stop();}
});
