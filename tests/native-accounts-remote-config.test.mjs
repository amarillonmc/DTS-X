import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {isolatedDatabase} from './helpers/native-database.mjs';
import {createAccountsOracle} from './helpers/native-accounts.mjs';
import {installationSchema} from '../native/install/installer.mjs';
import {createConfiguredRemoteUserClient,readRemoteUserPeers} from '../native/accounts/remote-configuration.mjs';
import {createRemoteUserReceiver} from '../native/accounts/remote.mjs';
import {createUserService} from '../native/accounts/users.mjs';
import {createAccountService} from '../native/accounts/service.mjs';
import {createLockServices} from '../native/storage/locks.mjs';
import {createStoredPass,createCookiePass} from '../native/accounts/primitives.mjs';
import {createDatabase} from '../native/storage/database.mjs';

test('explicit private peers and per-request configured remote clients preserve PHP local-cache fill and stale password refresh',async t=>{
 const oracle=await createAccountsOracle(t);if(!oracle)return;const origin=await isolatedDatabase(t,'user_origin'),local=await isolatedDatabase(t,'user_cache');if(!origin||!local)return;
 const sql=(await installationSchema()).statements.find(row=>row.name==='bra_users').sql;await origin.database.execute(sql);await local.database.execute(sql);
 const base=path.join(origin.root,'var/tests');await fs.mkdir(base,{recursive:true});const root=await fs.mkdtemp(path.join(base,'native-peer-config-'));t.after(async()=>{assert.ok(root.startsWith(base+path.sep));await fs.rm(root,{recursive:true,force:true});});
 assert.equal((await readRemoteUserPeers(root)).size,0);assert.equal(createConfiguredRemoteUserClient({}),null);
 const sign='fixture-origin',password='private-test-fixture-only',now=1729612800;await fs.writeFile(path.join(root,'native-userdb-peers.json'),JSON.stringify({version:1,peers:{[sign]:{pass:password,ip:'127.0.0.1'}}}));
 const peers=await readRemoteUserPeers(root),receiver=createRemoteUserReceiver({database:origin.database,stateRoot:path.join(root,'origin'),peers,clock:()=>now,leaseMs:100,lockTimeoutMs:100});
 const server=http.createServer(async(request,response)=>{try{const chunks=[];for await(const chunk of request)chunks.push(chunk);response.end(await receiver.handle(Object.fromEntries(new URLSearchParams(Buffer.concat(chunks).toString())),{REMOTE_ADDR:request.socket.remoteAddress}));}catch{response.statusCode=500;response.end('Error: Request failed');}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(async()=>{await new Promise(resolve=>server.close(resolve));await receiver.close();});
 const config={userdb_remote_storage:`http://127.0.0.1:${server.address().port}/userdb_receive.php`,userdb_remote_storage_sign:sign,userdb_remote_storage_pass:password,userdb_remote_reconnect_times:1,userdb_remote_reconnect_duration:0};
 const name='远端缓存用户',cookiePass=createCookiePass('new-password'),data={username:name,password:createStoredPass(name,cookiePass),groupid:1,gold:123,motto:'cache metadata'};await origin.database.arrayInsert('bra_users',data);
 const clear=async()=>{await local.database.execute('DELETE FROM bra_users');await local.database.execute('ALTER TABLE bra_users AUTO_INCREMENT=1');};
 for(const missing of [true,false]){
  await clear();if(!missing)await local.database.arrayInsert('bra_users',{username:name,password:'',groupid:1,gold:0});
  const expected=await oracle.async({mode:'storage',operations:[{function:'fetch_udata_by_username',args:[name]}],credentials:local.credentials,globals:{...config,userdb_forced_local:1},now,script:'game'});
  assert.equal(expected.error,undefined);await clear();if(!missing)await local.database.arrayInsert('bra_users',{username:name,password:'',groupid:1,gold:0});
  // Original PHP fixture cannot run shutdown release hooks; let its genuine
  // receiver lease expire before opening a different native request owner.
  await new Promise(resolve=>setTimeout(resolve,130));
  const locks=await createLockServices(path.join(root,'local')),remote=createConfiguredRemoteUserClient(config,{clock:()=>now}),users=createUserService({database:local.database,locks:locks.locks,remote,forcedLocal:true,script:'game'});
  try{assert.deepEqual(await users.fetchByUsername(name),expected.result.results[0]);assert.deepEqual(await local.database.query('SELECT * FROM bra_users ORDER BY uid'),expected.result.rows);}finally{await users.close();await locks.close();}
 }
 await clear();await local.database.arrayInsert('bra_users',{...data,password:createStoredPass(name,createCookiePass('old-password'))});
 const old=(await local.database.query('SELECT * FROM bra_users'))[0],expected=await oracle.async({function:'udata_check',credentials:local.credentials,globals:{...config,cuser:name,cpass:cookiePass,cudata:old},now,script:'game'});assert.equal(expected.error,undefined);
 await local.database.arrayUpdate('bra_users',{password:old.password},'1');await new Promise(resolve=>setTimeout(resolve,130));
 const locks=await createLockServices(path.join(root,'local')),users=createUserService({database:local.database,locks:locks.locks,remote:createConfiguredRemoteUserClient(config,{clock:()=>now}),forcedLocal:true,script:'game'}),accounts=createAccountService({users});
 try{const actual=await accounts.authenticate({cuser:name,cpass:cookiePass,cudata:old,script:'game'});assert.deepEqual(actual,expected.result);assert.equal((await local.database.query('SELECT password FROM bra_users'))[0].password,data.password);}finally{await users.close();await locks.close();}
 const reopened=await createDatabase(local.credentials);try{assert.equal((await reopened.query('SELECT password FROM bra_users'))[0].password,data.password);}finally{await reopened.close();}
 for(const bad of ['file:///private/path','https://user:secret@example.test/','invalid-sensitive-value'])assert.throws(()=>createConfiguredRemoteUserClient({...config,userdb_remote_storage:bad}),error=>error.message==='Invalid native remote user configuration');
 await fs.writeFile(path.join(root,'native-userdb-peers.json'),JSON.stringify({version:1,peers:{bad:{pass:password,ip:'999.0.0.1'}}}));await assert.rejects(readRemoteUserPeers(root),error=>error.message==='Invalid private remote user peer configuration');
 const rejected=createConfiguredRemoteUserClient({...config,userdb_remote_storage_pass:'wrong'},{clock:()=>now});await assert.rejects(rejected.command('get_ip'),error=>error.code==='REMOTE_USER_REJECTED'&&!error.message.includes(config.userdb_remote_storage)&&!error.message.includes(password));
});
