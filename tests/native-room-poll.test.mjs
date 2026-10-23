import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoomBroadcast } from '../native/system/room-poll.mjs';
import { roomUpdate } from '../native/http/room-update.mjs';
import { gencode, gdecode } from '../native/protocol/codec.mjs';

const turn=()=>new Promise(resolve=>setImmediate(resolve));
test('room broadcasts recheck persistence, including lost and cross-process notifications',async()=>{
  const hub=createRoomBroadcast({intervalMs:5,timeoutMs:1000});let timestamp=1,reads=0;
  const waiter=hub.wait(2,async()=>{reads++;return timestamp>1?{timestamp}:null;});
  await turn();timestamp=2; // Another process updates the row without a local event.
  assert.deepEqual(await waiter,{timestamp:2});assert.ok(reads>=2);
  timestamp=1;
  const raced=hub.wait(2,async()=>{const value=timestamp;if(value===1){timestamp=3;hub.notify(2);}return value>1?{timestamp:value}:null;});
  assert.deepEqual(await raced,{timestamp:3});
  const aborted=new AbortController(), waiting=hub.wait(2,async()=>null,{signal:aborted.signal});aborted.abort();assert.equal(await waiting,null);
  assert.equal(await hub.wait(2,async()=>null,{timeout:10}),null);
  const closing=hub.wait(2,async()=>null);hub.close();assert.equal(await closing,null);
});

test('room update preserves redirect, timestamp, timeout and removal protocol branches',async()=>{
  let row={groomid:1,groomstatus:10,roomvars:gencode({timestamp:1})},exists=true,auth=0;const cookies=[];
  const hub=createRoomBroadcast({intervalMs:5,timeoutMs:20});
  const host={database:{async query(){return row?[row]:[];}},accounts:{async authenticate(){auth++;}},files:{async exists(){return exists;}},broadcast:hub,
    rooms:{async setCurrentId(id){cookies.push(id);},async showData(data,user){return gencode({timestamp:data.timestamp,user});}}};
  const scope={room_id:1,gtablepre:'bra_',cuser:'甲'};
  assert.deepEqual(gdecode(await roomUpdate(host,scope)),{timestamp:1,user:'甲'});
  assert.equal(await roomUpdate(host,scope,{timestamp:1}),'');
  const pending=roomUpdate(host,scope,{timestamp:1});await turn();row.roomvars=gencode({timestamp:2});hub.notify(1);
  assert.deepEqual(gdecode(await pending),{timestamp:2,user:'甲'});
  const started=roomUpdate(host,scope,{timestamp:2});await turn();row.groomstatus=40;hub.notify(1);assert.deepEqual(gdecode(await started),{url:'game.php'});
  row.groomstatus=10;
  const removed=roomUpdate(host,scope,{timestamp:2});await turn();exists=false;hub.notify(1);assert.equal(await removed,'');
  assert.deepEqual(gdecode(await roomUpdate(host,scope)),{url:'index.php'});assert.deepEqual(cookies,[0]);assert.equal(auth,6);hub.close();
});
