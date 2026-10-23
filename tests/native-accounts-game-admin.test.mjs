import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createAccountsOracle} from './helpers/native-accounts.mjs';
import {isolatedDatabase} from './helpers/native-database.mjs';
import {installationSchema} from '../native/install/installer.mjs';
import {createGameAdminService} from '../native/accounts/game-admin.mjs';
import {createAccountAdminService} from '../native/accounts/admin.mjs';
import {createAccountService} from '../native/accounts/service.mjs';
import {createUserService} from '../native/accounts/users.mjs';
import {createLockServices} from '../native/storage/locks.mjs';
import {createMaintenanceGate} from '../native/http/maintenance.mjs';
import {createCookiePass,createStoredPass} from '../native/accounts/primitives.mjs';
import {ModuleRegistry} from '../native/modules/registry.mjs';
import {playerModule} from '../native/gameplay/player.mjs';
import {skillbaseModule,createSkillCatalog} from '../native/gameplay/skills.mjs';
import {protocolJson} from '../native/protocol/codec.mjs';
import snapshots from '../native/system/sys-config.json' with {type:'json'};
import {createFileServices} from '../native/storage/files.mjs';
const now=1729612800,scope={cuser:'管理者',cpass:createCookiePass('password')},resources=snapshots['resources.config.php'];
const globals={...scope,gamefounder:'站长',gamenum:7,room_prefix:'',tablepre:'bra_',gtablepre:'bra_',gamestate:30,validnum:4,alivenum:2,deathnum:2,now,plsinfo:['城市','学校'],pid:0};
async function seed(database){
 for(const table of ['bra_users','bra_players','bra_game']){await database.execute('DELETE FROM '+table);await database.execute('ALTER TABLE '+table+' AUTO_INCREMENT=1');}
 await database.arrayInsert('bra_users',{username:scope.cuser,password:createStoredPass(scope.cuser,scope.cpass),groupid:9,credits:5100,totalcredits:10,elo_rating:1666});
 for(const [groomid,groomstatus,gamestate]of [[1,10,0],[2,0,0],[3,40,0],[4,10,30],[5,10,0]])await database.arrayInsert('bra_game',{groomid,groomstatus,gamestate});
 for(const type of [0,1])for(const [name,hp,state,endtime]of [['甲',100,0,now-300],['乙',0,15,now-500],['丙',80,0,now],['丁',0,16,now-60]])await database.arrayInsert('bra_players',{name:(type?'NPC':'玩家')+name,type,hp,mhp:100,state,endtime,weps:20,money:100,itms1:2,club:2,pls:1,teamID:type?'NPC队':'玩家队',nskill:'acau',nskillpara:'Ml9r,5Lit5paH,'});
}
test('real PC/NPC administrative kill, revival, corpse removal, edit, filters, AFK and rank effects match original PHP',async t=>{
 const oracle=await createAccountsOracle(t);if(!oracle)return;const fixture=await isolatedDatabase(t,'game_admin');if(!fixture)return;const {database,credentials}=fixture;
 for(const table of ['bra_users','bra_players','bra_game'])await database.execute((await installationSchema()).statements.find(row=>row.name===table).sql);
 const base=path.join(fixture.root,'var/tests');await fs.mkdir(base,{recursive:true});const stateRoot=await fs.mkdtemp(path.join(base,'native-game-admin-'));t.after(async()=>{assert.ok(path.resolve(stateRoot).startsWith(path.resolve(base)+path.sep));await fs.rm(stateRoot,{recursive:true,force:true});});
 const gate=createMaintenanceGate();t.after(()=>gate.close());
 const cases=[{mode:'gamecheck'}, {mode:'rankclear'}, {mode:'antiAFKmng',command:'kill',timelimit:'2'}, {mode:'antiAFKmng',command:'kill',timelimit:'3'},...[1,2,3,4,5,9].map(id=>({mode:'roomclose',command:'kill',roomtoclose:String(id)})),
 ...['pcmng','npcmng'].flatMap(mode=>{const p=mode==='pcmng'?'pc':'npc',offset=mode==='pcmng'?0:4;return [{mode,command:'list'},...['kill','live','del'].map(command=>({mode,command,[p+'_0']:String(1+offset),[p+'_1']:String(2+offset),[p+'_2']:'999',[p+'_3']:String(4+offset)})),{mode,command:'list',checkmode:'teamID',checkinfo:'队'},{mode,command:'list',checkmode:p==='pc'?'club':'pls',checkinfo:p==='pc'?'2':'学校'},{mode,command:'list',start:'50'},{mode,command:'edit_1_'+(2+offset),gamestate:0}];})];
 await seed(database);const record=(await database.query("SELECT * FROM bra_players WHERE pid=1"))[0];cases.push({...record,mode:'pcmng',command:'submitedit',hp:'250',wep:'测试兵器',skillv:'[20,64]',skillparav:'{"20_k":"中文","64_n":2}'});
 for(const input of cases){await seed(database);const expected=oracle({entry:'admin',gameAdmin:true,gameRooms:[1,2,3,4],input,credentials,globals:{...globals,gamestate:input.gamestate??30},now,errors:resources._ERROR,info:resources._INFO});assert.equal(expected.error,null,JSON.stringify(input));
  await seed(database);const locks=await createLockServices(stateRoot),users=createUserService({database,locks:locks.locks,script:'admin'}),accounts=createAccountService({users,config:{founder:'站长'}}),admin=createAccountAdminService({accounts,users,database,stateRoot,clock:()=>now,maintenance:gate});
  const trace=[],definitions=[{name:'sys',state:{...globals,gamestate:input.gamestate??30},functions:{async save_gameinfo(ctx){const sys=ctx.state();trace.push(['save',sys.validnum,sys.alivenum,sys.deathnum]);},async addnews(ctx,...args){trace.push(['news',...args]);}}},{name:'map',state:{plsinfo:globals.plsinfo}},{name:'input'},playerModule,skillbaseModule];
  const files=await createFileServices({stateRoot,sourceRoot:path.join(fixture.root,'engine'),locks:locks.locks});for(const id of [1,2,3,4])await files.write(`gamedata/tmp/rooms/${id}.txt`,'fixture room');
  const session=await new ModuleRegistry(definitions).createSession({services:{database,skills:createSkillCatalog(definitions)}}),service=createGameAdminService({accounts,admin,session,database,files,maintenance:gate});
  try{const actual=await service.handle(input.mode,input,scope);assert.equal(actual.context.cmd_info,expected.cmd_info,JSON.stringify(input));assert.deepEqual(await database.query('SELECT * FROM bra_players ORDER BY pid'),expected.players,JSON.stringify(input));assert.deepEqual(await database.query('SELECT * FROM bra_users ORDER BY uid'),expected.rows);assert.deepEqual(trace,expected.trace.filter(row=>['save','news'].includes(row[0])));
   if(input.mode==='pcmng'||input.mode==='npcmng'){const p=input.mode==='pcmng'?'pc':'npc';assert.deepEqual(actual.context[p+'data'],expected[p+'data']);assert.equal(actual.context.resultinfo,expected.resultinfo);if(actual.context[p])assert.deepEqual(JSON.parse(protocolJson(actual.context[p])),expected[p]);}
   if(input.mode==='roomclose'){assert.deepEqual(await database.query('SELECT * FROM bra_game ORDER BY groomid'),expected.games);assert.equal(await files.exists(`gamedata/tmp/rooms/${input.roomtoclose}.txt`),expected.roomExists);}
  }finally{await users.close();await locks.close();}
 }
});
