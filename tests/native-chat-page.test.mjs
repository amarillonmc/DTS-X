import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir,mkdtemp,writeFile,rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chatPage } from '../native/http/chat-page.mjs';
import { gdecode } from '../native/protocol/codec.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
test('chat sender permissions, observers, teams and stale rounds match the source',{timeout:30000},async t=>{
  const php=process.env.DTS_REFERENCE_PHP||'php';if(spawnSync(php,['-r','echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'],{encoding:'utf8',windowsHide:true}).stdout!=='7.4'){t.skip('PHP7.4 oracle unavailable');return;}
  const parent=path.join(root,'var/tests');await mkdir(parent,{recursive:true});const work=await mkdtemp(path.join(parent,'native-chat-page-'));await mkdir(path.join(work,'include'));await writeFile(path.join(work,'include/common.inc.php'),'<?php');
  t.after(async()=>{assert.ok(path.resolve(work).startsWith(path.resolve(parent)+path.sep));await rm(work,{recursive:true,force:true});});
  const cases=[];for(const sendmode of ['send','ref','newspage'])for(const chatmsg of ['hello','/post 公告','/invalid'])for(const groupid of [0,2])for(const chattype of [0,1])cases.push({scope:{cuser:'甲',cpass:'pass',sendmode,chatmsg,cudata:{groupid},chattype,teamID:'队',cpls:3,lastcid:2,chatinnews:10,chatpid:1,gamestate:20,gamenum:2,groomid:0},validRoom:true});
  for(const validRoom of [false,true])for(const obsv_flag of [0,1]){const f=structuredClone(cases[0]);Object.assign(f.scope,{cgamenum:1,croomid:5,obsv_flag});f.validRoom=validRoom;cases.push(f);}
  for(let i=0;i<cases.length;i++){
    const f=cases[i],scope=structuredClone(f.scope),events=[];
    const host={session:{async call(module,name,...args){events.push([name,args]);if(name==='getchat')return {lastcid:5,msg:['first','second']};}},rooms:{async checkGameNumber(...args){events.push(['checkGameNumber',args]);return f.validRoom;},tablePrefix(prefix){return 'bra_'+prefix+'_';}},output:{take(){}}};
    const actual={body:gdecode(await chatPage(host,scope)),events};
    const result=spawnSync(php,[fileURLToPath(new URL('./fixtures/native-chat-page.php',import.meta.url)),root],{cwd:work,input:JSON.stringify(f),encoding:'utf8',windowsHide:true,timeout:10000});assert.equal(result.status,0,result.stderr);assert.deepEqual(actual,JSON.parse(result.stdout),`chat source case ${i}`);
  }
  t.diagnostic(`${cases.length} source chat scenarios; database hook effects tested in native sys integration.`);
});
