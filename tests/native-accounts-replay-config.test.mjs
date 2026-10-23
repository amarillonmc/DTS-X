import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {maintenanceDirectory} from './helpers/native-auto-maintain.mjs';
import {readRemoteReplayPeers} from '../native/accounts/remote-configuration.mjs';
test('replay peer secrets are explicitly provisioned, private and validated before becoming directory segments',async t=>{
 const root=await maintenanceDirectory(t,'native-replay-peers-'),file=path.join(root,'native-replay-peers.json');assert.deepEqual(await readRemoteReplayPeers(root),new Map());
 const peers={'测试服':'fixture-private-secret','another.server':'other-fixture-secret'};await fs.writeFile(file,JSON.stringify({version:1,peers}));assert.deepEqual(await readRemoteReplayPeers(root),new Map(Object.entries(peers)));
 assert.deepEqual(await readRemoteReplayPeers(root,{configured:new Map([['explicit','fixture-secret']])}),new Map([['explicit','fixture-secret']]));
 for(const bad of [{version:2,peers},{version:1,peers,extra:true},{version:1,peers:{bad:''}},{version:1,peers:{'../escape':'secret'}},{version:1,peers:{'/absolute':'secret'}},{version:1,peers:{'bad\\name':'secret'}},{version:1,peers:{'bad:stream':'secret'}},{version:1,peers:{'.hidden':'secret'}},{version:1,peers:{bad:{pass:'secret'}}}]){await fs.writeFile(file,JSON.stringify(bad));await assert.rejects(readRemoteReplayPeers(root),error=>error.message==='Invalid private remote replay peer configuration'&&!error.message.includes('secret'));}
 await fs.writeFile(file,'{ malformed secret');await assert.rejects(readRemoteReplayPeers(root),error=>error.message==='Invalid private remote replay peer configuration');
});
