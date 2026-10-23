import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import inventory from '../native/inventory.json' with {type:'json'};
import {definitions as skills,infoById} from '../native/generated/catalog.mjs';
import {definitions as remaining} from '../native/generated/remaining/catalog.mjs';
import {nativeGameplayModules} from '../native/catalog.mjs';
import {createNativeApplication} from '../native/http/application.mjs';
import {installNative} from '../native/install/installer.mjs';
import {timestampSalt} from '../native/accounts/primitives.mjs';
import {createConfiguredRemoteUserClient} from '../native/accounts/remote-configuration.mjs';
import {gencode,gdecode} from '../native/protocol/codec.mjs';
import {fold,unfold} from '../native/protocol/archive.mjs';
import {isolatedDatabase} from './helpers/native-database.mjs';
import {maintenanceDirectory,seedMaintenanceFiles} from './helpers/native-auto-maintain.mjs';

test('actual native HTTP binds explicit remote users, ranking signatures and replay callbacks to persistent services',{timeout:120000},async t=>{
 const fixture=await isolatedDatabase(t,'peer_http');if(!fixture)return;const stateRoot=await maintenanceDirectory(t,'native-peer-http-'),errors=[],now=Math.floor(Date.now()/1000),sign='fixture-peer',secret='fixture-private-peer-key';
 await installNative({database:fixture.database,stateRoot,admin:{username:'远端管理',password:'PeerHttpAdmin!'}});
 await fs.writeFile(path.join(stateRoot,'native-userdb-peers.json'),JSON.stringify({version:1,peers:{[sign]:{pass:secret,ip:'127.0.0.1'}}}));
 await fs.writeFile(path.join(stateRoot,'native-replay-peers.json'),JSON.stringify({version:1,peers:{[sign]:secret}}));
 const manual=new Set(nativeGameplayModules.map(module=>module.name)),systemConfig={gtablepre:'bra_',gamefounder:'远端管理'};
 const create=()=>createNativeApplication({configuration:inventory.modules.map(({name,enabled})=>({name,enabled})),additionalModules:[...skills,...remaining].filter(module=>!manual.has(module.name)),infoById,databaseOptions:fixture.credentials,sourceRoot:path.join(fixture.root,'engine'),stateRoot,publicUrl:'http://127.0.0.1',schedulerIntervalMs:0,clock:{now:()=>now},systemConfig,onError:error=>errors.push(error)});let app=create();t.after(()=>app.close());
 const address=await app.listen(),base='http://127.0.0.1:'+address.port;
 const send=async(route,data)=>{const response=await fetch(base+route,{method:'POST',body:new URLSearchParams(data),signal:AbortSignal.timeout(30000)}),body=await response.text();assert.equal(response.status,200,errors.at(-1)?.stack??body);return body;};
 const remote=createConfiguredRemoteUserClient({userdb_remote_storage:base+'/userdb_receive.php',userdb_remote_storage_sign:sign,userdb_remote_storage_pass:secret},{clock:()=>now});
 try{assert.equal((await remote.command('fetch_udata','*',"username='远端管理'"))[0].username,'远端管理');}finally{await remote.release();}
 assert.equal(await send('/aranking_receive.php',{asign:sign,apass:'wrong',acmd:'load_aranking',apara1:'fixture'}),'Error: Invalid sign');
 const auth={asign:sign,apass:timestampSalt(secret,0,now)};
 assert.equal(gdecode(await send('/aranking_receive.php',{...auth,acmd:'save_ulist_aranking',apara1:'fixture',apara2:gencode([{username:'甲',score1:10,score2:1},{username:'乙',score1:10,score2:3}])})),'Successed.');
 const ranking=gdecode(await send('/aranking_receive.php',{...auth,acmd:'load_aranking',apara1:'fixture',apara2:'10'}));assert.deepEqual(ranking.map(row=>row.username),['乙','甲']);assert.equal((await fixture.database.query('SELECT COUNT(*) AS n FROM bra_activity_ranking_fixture'))[0].n,'2');
 // .dat is the real gzip/base64 container; the image payload is arbitrary
 // binary and survives both actual generated receive pages and HTTP callbacks.
 const payload=Buffer.from([0,255,128,1,2,13,10]),archive=fold([['1.1.replay.header.js',Buffer.from('中文 replay')],['avatar.png',payload]]);
 await seedMaintenanceFiles(stateRoot,{'gamedata/replays/1.dat':{content:archive},'gamedata/replays/notes.tmp':{content:'delete me'}});
 assert.equal(await send('/replay_receive.php',{sign,pass:'wrong',cmd:'storage_req',filename:'1.dat',callurl:base+'/replay_receive.php'}),'Invalid Sign');
 assert.equal(await send('/replay_receive.php',{sign,pass:secret,cmd:'storage_req',filename:'1.dat',callurl:base+'/replay_receive.php','no-overlap':'1'}),'Successfully Received.');
 const stored=path.join(stateRoot,'gamedata/remote_replays',sign,'1/1.dat');assert.deepEqual(await fs.readFile(stored),archive);assert.deepEqual(unfold(await fs.readFile(stored)).get('avatar.png'),payload);
 assert.match(await send('/replay_receive.php',{sign,pass:secret,cmd:'storage_req',filename:'1.dat',callurl:base+'/replay_receive.php','no-overlap':'1'}),/already/);
 // Restart loads the deployment peer values and keeps all original data.
 // Maintenance reaches the same receiver through the real HTTP command route.
 await app.close();
 Object.assign(systemConfig,{gameurl:base,replay_remote_storage:base+'/replay_receive.php',replay_remote_storage_sign:sign,replay_remote_storage_key:secret});
 app=create();await app.listen({port:address.port});
 assert.equal(await send('/command.php',{command:'maintain'}),'');assert.equal(await fs.stat(path.join(stateRoot,'gamedata/replays/notes.tmp')).then(()=>true,error=>error.code==='ENOENT'?false:Promise.reject(error)),false);
 const progress=JSON.parse(await fs.readFile(path.join(stateRoot,'gamedata/cache/auto_maintain_replay.json'),'utf8'));assert.equal(progress.normal,1);assert.deepEqual(progress.failedNormal,[]);
 assert.equal(await send('/command.php',{command:'maintain'}),'');assert.deepEqual(errors,[]);
});
