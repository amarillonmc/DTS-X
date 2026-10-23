import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import snapshots from '../native/system/sys-config.json' with {type:'json'};
import { createAccountsOracle } from './helpers/native-accounts.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';
import { installationSchema } from '../native/install/installer.mjs';
import { createAccountAdminService } from '../native/accounts/admin.mjs';
import { createAccountService } from '../native/accounts/service.mjs';
import { createUserService } from '../native/accounts/users.mjs';
import { createLockServices } from '../native/storage/locks.mjs';
import { createDatabase } from '../native/storage/database.mjs';
import { createCookiePass,createStoredPass } from '../native/accounts/primitives.mjs';
import { gencode,gdecode } from '../native/protocol/codec.mjs';
import { createMaintenanceGate } from '../native/http/maintenance.mjs';
const now=1729612800,resources=snapshots['resources.config.php'],scope={cuser:'管理者',cpass:createCookiePass('password')};
const canonical=value=>value instanceof Map?(value.size?Object.fromEntries(value):[]):Array.isArray(value)&&Object.keys(value).length!==value.length?Object.fromEntries(Object.entries(value)):value;
async function setup(t){
 const fixture=await isolatedDatabase(t,'admin_accounts');if(!fixture)return;
 await fixture.database.execute((await installationSchema()).statements.find(row=>row.name==='bra_users').sql);
 const base=path.join(fixture.root,'var/tests');await fs.mkdir(base,{recursive:true});const stateRoot=await fs.mkdtemp(path.join(base,'native-admin-'));
 t.after(async()=>{assert.ok(path.resolve(stateRoot).startsWith(path.resolve(base)+path.sep));await fs.rm(stateRoot,{recursive:true,force:true});});
 const session=async(maintenance,database=fixture.database)=>{
   const locks=await createLockServices(stateRoot),users=createUserService({database,locks:locks.locks,script:'admin'}),accounts=createAccountService({users,config:{founder:'站长'}});
   const admin=createAccountAdminService({accounts,users,database,stateRoot,founder:'站长',clock:()=>now,maintenance,achievements:{decode:user=>gdecode(user.u_achievements),encode:gencode}});
   return {admin,users,async close(){await users.close();await locks.close();}};
 };
 return {...fixture,stateRoot,session};
}
async function seed(database){await database.execute('DELETE FROM bra_users');await database.execute('ALTER TABLE bra_users AUTO_INCREMENT=1');for(const [username,groupid] of [['管理者',9],['普通人',1],['低级GM',5],['站长',1]])await database.arrayInsert('bra_users',{username,password:createStoredPass(username,createCookiePass('password')),groupid,gold:100,card_data:gencode([{cardid:0,cardenergy:0}]),u_achievements:gencode({326:[]})});}

test('GM management and user ban/unban/edit match original admin handlers on real MySQL',async t=>{
 const oracle=await createAccountsOracle(t);if(!oracle)return;const fixture=await setup(t);if(!fixture)return;const {database,credentials}=fixture;
 const cases=[{mode:'gmlist',command:'gmlist'},{mode:'gmlist',command:'add',addname:'普通人',addgroup:'4'},
 {mode:'gmlist',command:'add',addname:'普通人',addgroup:'9'}, {mode:'gmlist',command:'del',adminuid:'3'},
 {mode:'gmlist',command:'del',adminuid:'4'}, {mode:'gmlist',command:'edit',adminuid:'3','3_group':'7'},
 {mode:'urlist',urcmd:'list',pagecmd:'check',urorder:'uid',urorder2:'ASC'},
 {mode:'urlist',urcmd:'ban',pagecmd:'check',urorder:'uid',urorder2:'ASC',user_0:'1',user_1:'2',user_3:'999'},
 {mode:'urlist',urcmd:'unban',pagecmd:'find',checkinfo:'普通',user_0:'2'},
 {mode:'urlist',urcmd:'edit_1_2',pagecmd:'check',urorder:'uid',urorder2:'ASC',motto_1:'hello',killmsg_1:'bye',lastword_1:'done',icon_1:'2',gender_1:'f',gold_1:'234',pass_1:'newpassword',card_data_1:'[{"cardid":0,"cardenergy":1}]',a_achievements_1:'{"326":[]}'}];
 for(const input of cases){
  await seed(database);const expected=oracle({entry:'admin',input,credentials,globals:{...scope,gamefounder:'站长'},now,errors:resources._ERROR,info:resources._INFO});assert.equal(expected.error,null);
  await seed(database);const request=await fixture.session();try{
   const actual=await request.admin[input.mode==='gmlist'?'gmList':'userList'](input,scope);
   assert.equal(actual.context.cmd_info,expected.cmd_info,JSON.stringify(input));
   if(input.mode==='gmlist')assert.deepEqual(canonical(actual.context.gmdata),expected.gmdata);else{assert.deepEqual(canonical(actual.context.urdata),expected.urdata);assert.equal(actual.context.resultinfo,expected.resultinfo);}
   const rows=await database.query('SELECT * FROM bra_users ORDER BY uid');for(const list of [rows,expected.rows])for(const row of list){row.card_data=gdecode(row.card_data);row.u_achievements=gdecode(row.u_achievements);}assert.deepEqual(rows,expected.rows);
  }finally{await request.close();}
 }
});

test('private backups restore through staged atomic replacement and reject invalid data before touching users',async t=>{
 const oracle=await createAccountsOracle(t);if(!oracle)return;const fixture=await setup(t);if(!fixture)return;const {database,stateRoot,credentials}=fixture;await seed(database);
 const original=oracle({entry:'admin',input:{mode:'urlist',pagecmd:'download'},credentials,globals:{...scope,gamefounder:'站长',gameurl:'https://game.fixture.test/'},server:{HTTP_HOST:'fixture.test',SCRIPT_NAME:'/admin.php',PHP_SELF:'/admin.php'},now,errors:resources._ERROR,info:resources._INFO});assert.equal(original.error,null);
 const gate=createMaintenanceGate();t.after(()=>gate.close());
 const trace=[],maintenance={run:fn=>gate.run(async()=>{trace.push('enter');try{return await fn();}finally{trace.push('exit');}})};
 const request=await fixture.session(maintenance);try{
  const before=await database.query('SELECT * FROM bra_users ORDER BY uid'),backup=await request.admin.backup(scope);
  assert.match(backup.filename,/^userdb_[a-f0-9]+\.php$/);assert.equal(backup.count,4);assert.ok(backup.bytes.toString().startsWith('<?php '));
  assert.ok(backup.bytes.toString()===original.body,'Backup bytes retain the original guarded JSON-lines format');
  await database.execute("UPDATE bra_users SET gold=999,motto='changed' WHERE username='普通人'");
  const restored=await request.admin.restore(scope,backup.filename);assert.equal(restored.count,4);assert.deepEqual(trace,['enter','exit']);assert.deepEqual(await database.query('SELECT * FROM bra_users ORDER BY uid'),before);
  const preserved=await database.query('SELECT * FROM bra_users ORDER BY uid');
  for(const bytes of ['not-json','{"username":"missing-password"}',backup.bytes.toString().replace('"groupid":"9"','"groupid":"1"'),backup.bytes.toString()+'\n{"username":"bogus","password":"x","unexpected":1}'])await assert.rejects(request.admin.upload(scope,bytes));
  await assert.rejects(request.admin.restore(scope,'../outside.php'),/恢复参数错误/);
  assert.deepEqual(await database.query('SELECT * FROM bra_users ORDER BY uid'),preserved);
  const badRows=backup.bytes.toString().trim().split(/\r?\n/);badRows.push(badRows[1]);await assert.rejects(request.admin.upload(scope,badRows.join('\n')),error=>error.code==='ER_DUP_ENTRY');assert.deepEqual(await database.query('SELECT * FROM bra_users ORDER BY uid'),preserved);
  assert.equal((await database.query('SHOW TABLES')).length,1);
  const reopened=await createDatabase(credentials);try{assert.deepEqual(await reopened.query('SELECT * FROM bra_users ORDER BY uid'),preserved);}finally{await reopened.close();}
  const listings=await request.admin.listBackups(scope);assert.ok(listings.length>=3);assert.equal((await fs.stat(path.join(stateRoot,'gamedata/adminlog_nf.php'))).isFile(),true);
 }finally{await request.close();}
});
