import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir,mkdtemp,readFile,readdir,rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import inventory from '../native/inventory.json' with {type:'json'};
import { definitions as skills, infoById } from '../native/generated/catalog.mjs';
import { definitions as remaining } from '../native/generated/remaining/catalog.mjs';
import { nativeGameplayModules } from '../native/catalog.mjs';
import { renderPage } from '../native/generated/pages.mjs';
import { createNativeApplication } from '../native/http/application.mjs';
import { installNative } from '../native/install/installer.mjs';
import { createVerificationService } from '../native/accounts/verification.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';
import { gdecode } from '../native/protocol/codec.mjs';
import {launchNativeBrowser} from './helpers/native-browser.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
test('full native HTTP preserves two accounts, original room controls and persistent room commands',{timeout:120000},async t=>{
  const db=await isolatedDatabase(t,'full_http');if(!db)return;
  const parent=path.join(root,'var/tests');await mkdir(parent,{recursive:true});const stateRoot=await mkdtemp(path.join(parent,'native-full-http-'));
  let app;const errors=[];
  t.after(async()=>{await app?.close();assert.ok(path.resolve(stateRoot).startsWith(path.resolve(parent)+path.sep));await rm(stateRoot,{recursive:true,force:true});});
  await installNative({database:db.database,stateRoot,admin:{username:'全服管理',password:'FullHttpAdmin!'}});
  const manual=new Set(nativeGameplayModules.map(module=>module.name));
  let now=1700000000;
  const verification=await createVerificationService({gameUrl:'http://127.0.0.1',clock:()=>now});
  app=createNativeApplication({configuration:inventory.modules.map(({name,enabled})=>({name,enabled})),additionalModules:[...skills,...remaining].filter(module=>!manual.has(module.name)),infoById,
    pages:{roomcmd:(host,scope)=>renderPage('roomcmd',host,scope)},databaseOptions:db.credentials,sourceRoot:path.join(root,'engine'),stateRoot,publicUrl:'http://127.0.0.1',modernRoot:path.join(root,'public/modern'),modern:true,schedulerIntervalMs:0,
    onError:error=>errors.push(error),clock:{now:()=>now},randomSeed:41,systemConfig:{gtablepre:'bra_',gamefounder:'全服管理'}});
  const address=await app.listen(),base=`http://127.0.0.1:${address.port}`,jars=[new Map(),new Map()];
  const send=async(index,route,data)=>{
    const headers={Cookie:[...jars[index]].map(([key,value])=>key+'='+value).join('; ')};if(data)headers['Content-Type']='application/x-www-form-urlencoded';
    const response=await fetch(base+route,{method:data?'POST':'GET',headers,body:data?new URLSearchParams(data):undefined,redirect:'manual'});
    for(const cookie of response.headers.getSetCookie()){const [pair]=cookie.split(';'),at=pair.indexOf('=');jars[index].set(pair.slice(0,at),pair.slice(at+1));}
    const body=await response.text();assert.equal(response.status<500,true,errors.at(-1)?.stack??body);return {response,body};
  };
  for(let index=0;index<2;index++){
    const {body:html}=await send(index,'/register.php');const token=html.match(/name="register_token" value="([^"]+)"/)?.[1];assert.ok(token,'original registration form');
    const answer=verification.question(token,now).correct_i;
    const {body}=await send(index,'/register.php',{cmd:'post_register',username:'房间玩家'+index,npass:'FullHttpPlayer!',rnpass:'FullHttpPlayer!',register_token:token,vq_answer:String(answer),gender:'m',icon:'1',motto:'测试',killmsg:'击杀',lastword:'遗言'});
    assert.match(gdecode(body).innerHTML.info,/成功/);assert.ok(jars[index].has('bra_pass'));
  }
  for(const route of ['index','help','map','cardbook','kuji','kujilist','showcase','itemhelp','donate','instance8_testing_intro','instance10_intro','instance12_intro','updatelist','winner','rank','alive','news']) {
    const page=await send(0,`/${route}.php`);assert.equal(page.response.status,200,route);assert.match(page.body,/<(?:html|div|table|form|head)/i,route);
  }
  const created=await send(0,'/roomcmd.php',{command:'newroom',para1:'0'});assert.equal(created.response.status,302);assert.equal(jars[0].get('bra_roomid'),'1');
  const joined=await send(1,'/roomcmd.php',{command:'enterroom',para1:'1'});assert.equal(joined.response.status,302);assert.equal(jars[1].get('bra_roomid'),'1');
  await send(1,'/roomcmd.php',{command:'pos_enter',para1:'1'});
  let row=(await db.database.query('SELECT roomvars FROM bra_game WHERE groomid=1'))[0],room=gdecode(row.roomvars);
  assert.equal(room.player[0].name,'房间玩家0');assert.equal(room.player[1].name,'房间玩家1');assert.equal(room.readystat,1);
  const update=await send(0,'/roomupdate.php',{timestamp:'0'}),payload=gdecode(update.body);
  assert.match(payload.innerHTML.roommain,/房间玩家0/);assert.match(payload.innerHTML.roommain,/房间玩家1/);assert.ok(payload.value.timestamp>0);
  await send(0,'/roomcmd.php',{command:'newchat',para1:'HTTP持久消息'});
  room=gdecode((await db.database.query('SELECT roomvars FROM bra_game WHERE groomid=1'))[0].roomvars);assert.match(room.chatdata.at(-1).data,/HTTP持久消息/);
  await send(0,'/roomcmd.php',{command:'ready'});
  await send(1,'/roomcmd.php',{command:'ready'});
  const running=(await db.database.query('SELECT gamestate,groomstatus FROM bra_game WHERE groomid=1'))[0];
  assert.equal(running.groomstatus,'40');assert.ok(Number(running.gamestate)>=20);
  for(let index=0;index<2;index++) {
    const valid = await send(index,'/valid.php'); assert.match(valid.body,/card/);
    const entered=await send(index,'/valid.php',{mode:'enter',card:'0',gender:'m',icon:'1',motto:'测试',killmsg:'击杀',lastword:'遗言'});
    assert.equal(entered.response.status,302);assert.equal(entered.response.headers.get('location'),'game.php');
  }
  const players=await db.database.query('SELECT name,hp FROM bra_s1_players WHERE type=0 ORDER BY name');
  assert.deepEqual(players.map(player=>player.name),['房间玩家0','房间玩家1']);assert.ok(players.every(player=>Number(player.hp)>0));
  const game=await send(0,'/game.php');assert.equal(game.response.status,200);assert.match(game.body,/cmd_interface/);
  const initialTiming=Number(game.body.match(/updateTime\('area_timing', (\d+), 0\)/)?.[1]);
  assert.ok(initialTiming>0,'normal room initially renders an enabled forbidden-area countdown');
  const forwardedGame=await send(0,'/command.php',{page:'command_game'});
  assert.ok(forwardedGame.body.includes(`updateTime('area_timing', ${initialTiming}, 0)`));
  const refresh=await send(0,'/command.php',{command:'area_timing_refresh'});
  assert.equal(gdecode(refresh.body).timing.area_timing.on,true);
  assert.equal(gdecode(refresh.body).timing.area_timing.timing,initialTiming);
  const browser=await launchNativeBrowser(t,{outputRoot:parent});
  await browser.send('Page.addScriptToEvaluateOnNewDocument',{source:`window.nativeCommandResponses=[];
    const send=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(...args){
      const command=new URLSearchParams(args[0]).get('command');
      this.addEventListener('loadend',()=>{if(this.responseURL.endsWith('/command.php'))nativeCommandResponses.push({command,status:this.status,body:this.responseText});},{once:true});
      return send.apply(this,args);};`});
  const recordedResponses=[];
  for(const theme of [1,2])for(const modern of [false,true]) {
    await browser.send('Network.setCookies',{cookies:[...jars[0],['templateid',String(theme)]].map(([name,value])=>({name,value,url:base}))});
    await browser.send('Page.navigate',{url:base+'/game.php'});
    await browser.waitFor('document.readyState==="complete" && !!window.DTSModern && nativeCommandResponses.some(response=>response.command==="enter") && !!document.getElementById("gamecmd") && !!document.getElementById("cmd_interface")');
    if(theme===1&&!modern)assert.equal(await browser.evaluate('DTSModern.getState().modern'),false);
    await browser.evaluate(`window.originalGameForm=document.getElementById('gamecmd');window.originalMain=document.getElementById('main');DTSModern.setMode(${modern});`);
    assert.equal(await browser.evaluate(`document.querySelectorAll('#gamecmd').length===1 && document.getElementById('gamecmd')===originalGameForm && document.getElementById('main')===originalMain`),true,`theme ${theme}, modern ${modern}: switching shells preserves controls`);
    assert.equal(await browser.evaluate(`new FormData(document.getElementById('gamecmd')).has('command')`),true);
    assert.equal(await browser.evaluate(`document.querySelectorAll('#area_timing').length`),1);
    const before=await browser.evaluate(`({text:$('area_timing').textContent,time:timinglist.area_timing.timing})`);
    assert.match(before.text,/^\d+:\d{2}$/);assert.ok(before.time>0);
    await browser.waitFor(`timinglist.area_timing.timing < ${before.time} && $('area_timing').textContent !== ${JSON.stringify(before.text)}`);
    now+=5;
    await browser.evaluate(`document.getElementById('command').value='menu';postCmd('gamecmd','command.php');`);
    await browser.waitFor(`nativeCommandResponses.some(response=>response.command==='menu') && document.getElementById('cmd') && document.getElementById('main').textContent.length>0`);
    const response=await browser.evaluate(`nativeCommandResponses.find(response=>response.command==='menu')`);assert.equal(response.status,200);
    const commandResponse=gdecode(response.body);assert.ok(commandResponse.innerHTML,JSON.stringify({keys:Object.keys(commandResponse),url:commandResponse.url,error:commandResponse.errormsg}));
    const timer=commandResponse.timing.area_timing;
    assert.equal(timer.on,true);assert.equal(timer.timing,initialTiming-(now-1700000000)*1000);
    assert.equal(await browser.evaluate('timinglist.area_timing.o_t'),timer.timing);
    assert.equal(await browser.evaluate(`document.querySelectorAll('#area_timing').length`),1);
    assert.match(await browser.evaluate(`$('area_timing').textContent`),/^\d+:\d{2}$/);
    await browser.waitFor(`timinglist.area_timing.timing < ${timer.timing}`);
    recordedResponses.push(response.body);
  }
  const responseDirectory=path.join(stateRoot,'gamedata/tmp/response/1_');
  const savedResponses=await Promise.all((await readdir(responseDirectory)).map(name=>readFile(path.join(responseDirectory,name),'utf8')));
  for(const response of recordedResponses)assert.ok(savedResponses.includes(response),'room countdown response is recorded verbatim');
  assert.deepEqual(browser.errors,[]);
  assert.equal(errors.length,0,errors.map(error=>error.stack).join('\n'));
  assert.deepEqual(browser.networkErrors,[]);
  await browser.close();
  await send(1,'/roomcmd.php',{command:'leave'});assert.equal(jars[1].get('bra_roomid'),'0');
  room=gdecode((await db.database.query('SELECT roomvars FROM bra_game WHERE groomid=1'))[0].roomvars);assert.equal(room.player[1].name,'房间玩家1');
  assert.deepEqual(errors,[]);
});
