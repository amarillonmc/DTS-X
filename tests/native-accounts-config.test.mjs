import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createAdminConfigurationService,defaultAccountBans} from '../native/accounts/configuration.mjs';
import {parseAdminAudit} from '../native/accounts/audit-log.mjs';
import {createAdminConfigOracle} from './helpers/native-admin-config.mjs';
import {gencode,gdecode} from '../native/protocol/codec.mjs';
const project=fileURLToPath(new URL('../',import.meta.url)),now=1729612800;
test('configuration controls preserve original conversions/messages and persist private overrides across service restart',async t=>{
 const oracle=await createAdminConfigOracle(t);if(!oracle)return;const base=path.join(project,'var/tests');await fs.mkdir(base,{recursive:true});const root=await fs.mkdtemp(path.join(base,'native-config-store-'));t.after(async()=>{assert.ok(root.startsWith(base+path.sep));await fs.rm(root,{recursive:true,force:true});});
 // Explicit auth/audit boundaries isolate field conversion; real auth + audit
 // writes and maintenance are exercised by native-accounts-admin/http tests.
 const trace=[],accounts={authorizeAdmin:async()=>({})},admin={recordAudit:async(scope,...args)=>trace.push(args)};
 const service=()=>createAdminConfigurationService({stateRoot:root,accounts,admin,clock:()=>now,defaults:{messages:{adminmsg:'old',systemmsg:'system'}}});
 for(const [page,command,post]of [['configmng','edit',{gtitle:'新eval标题',moveut:'-2.9',moveutmin:'30',errorinfo:'0'}],['globalgamemng','edit',{adminmsg:'&lt;b&gt;公告&nbsp;&amp;&quot;&#039;&lt;/b&gt;',startmode:'2',iplimit:'5',max_room_num:'12'}],['gamecfgmng','edit',{hplimit:'10',areaadd:'6.7',areaesc:'-1',corpseprotect:'5',rest_heal_time:'4',coldtimeon:'0',teamlimit:'9'}],['banlistmng','write',{postnmlmt:'[封禁|eval名字]',postiplmt:'/127\.0\.0\.1/'}]]){
  const before=await service().getSnapshot(),globals={...before.server,...before.game.sys,...Object.assign({},...Object.values(before.game)),...before.room,nmlimit:before.account.nameLimit,iplimit:page==='banlistmng'?before.account.ipLimit:before.game.sys.iplimit};
  const fields=page==='banlistmng'?['nmlimit','iplimit']:Object.keys(post),expected=oracle({page,command,post,request:page==='banlistmng'?post:{},globals,fields,messages:before.messages,now});trace.length=0;
  const actual=await service().page(page,{command,...post},{},{input:{post}});assert.equal(actual.context.cmd_info,expected.info,page);assert.deepEqual(Object.fromEntries(fields.map(key=>[key,actual.context[key]])),expected.fields,page);assert.deepEqual(trace.map(row=>row.map((value,index)=>index?gdecode(value):value)),expected.trace.map(row=>row.map((value,index)=>index?gdecode(value):value)));
 }
 const restored=await service().getSnapshot();assert.equal(restored.server.gtitle,'新标题');assert.equal(restored.account.nameLimit,'[封禁|名字]');assert.equal(restored.account.ipLimit,'/127\.0\.0\.1/');assert.equal(restored.game.sys.iplimit,5);assert.equal(restored.room.max_room_num,12);assert.equal(restored.game.map.areaadd,6);
 assert.ok(defaultAccountBans.nameLimit.includes('小黄'));await assert.rejects(service().page('banlistmng',{command:'write',postnmlmt:'invalid',postiplmt:''},{}));assert.deepEqual(await service().getSnapshot(),restored);
 const saved=JSON.parse(await fs.readFile(path.join(root,'native-admin-config.json'),'utf8'));saved.overrides.game.sys.arbitraryCode='bad';await fs.writeFile(path.join(root,'native-admin-config.json'),JSON.stringify(saved));await assert.rejects(service().getSnapshot(),/Invalid native game override/);
});

test('all legacy audit operation families render exactly as original adminlogcheck',async t=>{
 const oracle=await createAdminConfigOracle(t);if(!oracle)return;
 const operations=[['infomng'],['killafker','',7,gencode(['甲','乙'])],['roomclose',3],...['addgm','delgm','editgm'].map(op=>[op,'甲',4]),['editbanlist',gencode('[甲|乙]'),gencode('/127/')] ,['configmng',gencode({gtitle:'新名',userdb_remote_storage_pass:'secret-fixture-only'})],['globalgamemng',gencode({adminmsg:'<b title="x">公告</b>'})],['gamecfgmng',gencode({map:{areaadd:6}})],...['wthedit','hackedit','gsedit','gameover','addarea','gametypeset'].map(op=>[op,'',7,op==='addarea'?'I':1]),...['killpc','livepc','delpc','delcp','killnpc','livenpc','delnpc','delncp'].map(op=>[op,'',7,'测试角色']),['editpc','_7','测试角色',gencode({hp:20,nskill:'2 20',nskillpara:'{"2_a":1}'})],['downloadurdata'],['uploadurdata'],...['banur','unbanur','delur','delur2'].map(op=>[op,'账号']),['editur','账号',gencode({gender:'f',gold:100,a_achievements:{2:[]}})],['sendmessageur','账号',gencode('标题')],['future-operation','a','b','c']];
 const content='<?php protected ?>\r\n'+operations.map(row=>[now,'管理者',...row,''].join(',')).join('\n'),globals={wthinfo:{1:'晴天'},gstate:{1:'准备'},gtinfo:{1:'测试类型'}};
 const expected=oracle({page:'adminlogcheck',audit:content,globals,now});assert.deepEqual(parseAdminAudit(content,globals),expected.showdata);
});
