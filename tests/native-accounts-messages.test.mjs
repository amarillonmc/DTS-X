import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import snapshots from '../native/system/sys-config.json' with { type:'json' };
import { isolatedDatabase } from './helpers/native-database.mjs';
import { createAccountsOracle } from './helpers/native-accounts.mjs';
import { installationSchema } from '../native/install/installer.mjs';
import { createMessageService,messageEnclosureNumber } from '../native/system/messages.mjs';
import { createUserService } from '../native/accounts/users.mjs';
import { createAccountService } from '../native/accounts/service.mjs';
import { createLockServices } from '../native/storage/locks.mjs';
import { createCookiePass,createStoredPass } from '../native/accounts/primitives.mjs';
import { gencode,gdecode } from '../native/protocol/codec.mjs';
const now=1729612800,username='收信者',resources=snapshots['resources.config.php'];
const canonical=value=>value instanceof Map ? (value.size ? Object.fromEntries(value):[]) : value===undefined?null:value;
async function setup(t) {
 const fixture=await isolatedDatabase(t,'messages');if(!fixture)return null;
 for(const row of (await installationSchema()).statements.filter(row=>['bra_users','bra_messages','bra_del_messages'].includes(row.name)))await fixture.database.execute(row.sql);
 const base=path.join(fixture.root,'var/tests');await fs.mkdir(base,{recursive:true});const stateRoot=await fs.mkdtemp(path.join(base,'native-messages-'));
 t.after(async()=>{assert.ok(path.resolve(stateRoot).startsWith(path.resolve(base)+path.sep));await fs.rm(stateRoot,{recursive:true,force:true});});
 return {...fixture,stateRoot};
}
async function seed(database,gold=500) {
 for(const table of ['bra_users','bra_messages','bra_del_messages']){await database.execute(`DELETE FROM ${table}`);await database.execute(`ALTER TABLE ${table} AUTO_INCREMENT=1`);}
 await database.arrayInsert('bra_users',{username,password:createStoredPass(username,createCookiePass('password')),groupid:1,gold,gold2:3,card_data:gencode([{cardid:0,cardenergy:0}])});
 await database.arrayInsert('bra_messages',[{receiver:username,sender:'sys',timestamp:now-3,title:'奖励',content:'original',enclosure:'getqiegao_12;getkarma_7'},{receiver:username,sender:'sys',timestamp:now-4,title:'信件',content:'',enclosure:''},{receiver:'other',sender:'sys',timestamp:now,title:'private',content:'',enclosure:'getqiegao_999'}]);
 await database.arrayInsert('bra_del_messages',{receiver:username,sender:'sys',timestamp:now-100,dtimestamp:now-2,title:'旧邮件',enclosure:'',checked:1});
}

test('message creation/load/order/enclosure and currency claims match original functions on real MySQL',async t=>{
 const oracle=await createAccountsOracle(t);if(!oracle)return;const fixture=await setup(t);if(!fixture)return;
 const {database,credentials}=fixture;await seed(database);const user=(await database.query('SELECT * FROM bra_users'))[0];
 const operations=[{function:'message_create',args:[username,'补发','content','getqiegao_005','sys',now]}, {function:'message_check_new',args:[username]}, {function:'message_load',args:[]},{function:'deleted_message_load',args:[]}, {function:'deleted_message_load',args:[1]}];
 const expected=oracle({mode:'messages',operations,credentials,now,globals:{udata:user}});assert.equal(expected.error,undefined);await seed(database);
 const users=createUserService({database,script:'rank'}), service=createMessageService({database,users,clock:()=>now});const actual=[];
 for(const op of operations){let value;if(op.function==='message_load')value=await service.load(user);else if(op.function==='deleted_message_load')value=await service.load(user,op.args[0]??0,true);else value=await service[op.function](...op.args);actual.push(canonical(value));}
 assert.deepEqual(actual,expected.result.results);assert.deepEqual(await database.query('SELECT * FROM bra_messages ORDER BY mid'),expected.result.messages);
 for(const [value,prefix] of [['getcardblink_2;getcard_001','getcard'],['getqiegao_0x20','getqiegao'],['getkarma_-1','getkarma'],['prefixgetqiegao_12tail','getqiegao']])assert.equal(messageEnclosureNumber(value,prefix),oracle({function:'message_get_encl_num',args:[value,prefix]}).result);
});

test('messages.php show/claim/delete/recover/permanent delete match original rows and response data',async t=>{
 const oracle=await createAccountsOracle(t);if(!oracle)return;const fixture=await setup(t);if(!fixture)return;
 const {database,credentials,stateRoot}=fixture,scope={cuser:username,cpass:createCookiePass('password')};
 for(const [input,gold] of [[{},500],[{mode:'check',sl1:'1',sl3:'1'},500],[{mode:'del',sl1:'1'},500],[{mode:'del2',sl1:'1'},500],[{mode:'recover',sl1:'1'},500],[{mode:'recover',sl1:'1'},20],[{mode:'check'},500]]){
   await seed(database,gold);const expected=oracle({entry:'messages',input,globals:scope,credentials,now,errors:resources._ERROR,info:resources._INFO});assert.equal(expected.error,null);
   await seed(database,gold);const locks=await createLockServices(stateRoot),users=createUserService({database,locks:locks.locks,script:'messages'}),accounts=createAccountService({users});
   // Card selection and qiegao are explicit fixture boundaries here. The PHP
   // side executes real cardbase methods; this test verifies messages and its
   // persisted argument/result contract, not all card acquisition mechanics.
   const cards={getCardList:user=>Object.values(gdecode(user.card_data)).map(row=>row.cardid),async getQiegao(amount,user){const row=await users.fetchByUsername(user.username);user.gold=Math.max(0,Number(row.gold)+amount);await users.writeRaw({gold:user.gold},user.username);}};
   const service=createMessageService({database,users,accounts,clock:()=>now,cards,templates:{render:async()=>''}});
   try{
     const actual=await service.page(input,scope);assert.equal(actual.context.mode,expected.mode);assert.deepEqual(actual.context.info,expected.info);assert.deepEqual(canonical(actual.context.messages),expected.messages);
     if(actual.data)assert.deepEqual(actual.data,expected.data);assert.deepEqual(await database.query('SELECT * FROM bra_messages ORDER BY mid'),expected.storedMessages);assert.deepEqual(await database.query('SELECT * FROM bra_del_messages ORDER BY mid'),expected.storedDeleted);
     const rows=await database.query('SELECT * FROM bra_users ORDER BY uid');for(const list of [rows,expected.rows])for(const row of list)row.card_data=gdecode(row.card_data);assert.deepEqual(rows,expected.rows);
   }finally{await users.close();await locks.close();}
 }
});
