import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,rm,readdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {defaultConfiguration,additionalModules,infoById} from '../native/bootstrap.mjs';
import {createNativeApplication} from '../native/http/application.mjs';
import {createNativeRequestHost} from '../native/http/request-host.mjs';
import {prepareInputRequest} from '../native/gameplay/input.mjs';
import {createRoomBroadcast} from '../native/system/room-poll.mjs';
import {createMaintenanceGate} from '../native/http/maintenance.mjs';
import {installNative} from '../native/install/installer.mjs';
import {createCookiePass} from '../native/accounts/primitives.mjs';
import {gdecode} from '../native/protocol/codec.mjs';
import {isolatedDatabase} from './helpers/native-database.mjs';
import {launchNativeBrowser} from './helpers/native-browser.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const fields=['itm','itmk','itme','itms','itmsk'];
const materials=[['【红杀铁剑】','WK',180,30,'u'],['电磁充能手套','DA',45,15,'E'],['石头','WC',1,1,'']];
for(const tutorial of [true,false])test(`${tutorial?'tutorial':'normal game'} itemmix opens, rejects invalid materials and persists real crafting in both themes and shells`,{timeout:240000},async t=>{
  const db=await isolatedDatabase(t,'itemmix_http');if(!db)return;
  const parent=path.join(root,'var/tests');await mkdir(parent,{recursive:true});
  const stateRoot=await mkdtemp(path.join(parent,'native-itemmix-http-'));
  const broadcast=createRoomBroadcast(),maintenance=createMaintenanceGate(),hosts=[],errors=[];
  let app,browser,roomId=0,now=Math.floor(Date.now()/1000);
  t.after(async()=>{
    await browser?.close();await app?.close();for(const host of hosts)await host.close();
    broadcast.close();await maintenance.close();
    assert.ok(path.resolve(stateRoot).startsWith(path.resolve(parent)+path.sep));await rm(stateRoot,{recursive:true,force:true});
  });
  const username='合成回归',password='MixFixtureOnly!';
  await installNative({database:db.database,stateRoot,admin:{username,password}});
  const cookies=()=>({bra_user:username,bra_pass:createCookiePass(password),bra_roomid:String(roomId)});
  const options={configuration:defaultConfiguration,additionalModules,infoById,databaseOptions:db.credentials,
    sourceRoot:path.join(root,'engine'),stateRoot,publicUrl:'http://127.0.0.1',modernRoot:path.join(root,'public/modern'),
    clock:{now:()=>now},randomSeed:77,systemConfig:{gtablepre:'bra_',gamefounder:username}};
  const open=async()=>{
    const request={pathname:'/game.php',input:prepareInputRequest({cookies:cookies()}),server:{SERVER_PORT:'80'},pageStartTime:now};
    const host=await createNativeRequestHost({...options,request,broadcast,maintenance});hosts.push(host);return host;
  };
  let host=await open();
  if(tutorial){roomId=Number(await host.rooms.create(7));await host.close();host=await open();await host.rooms.initializeDatabase(roomId);}
  const sys=host.session.state('sys');sys.starttime=sys.now;if(tutorial)sys.groomstatus=40;
  await host.session.call('gameflow_base','gamestate_prepare_game');
  await host.session.call('gameflow_base','gamestate_start_game');await host.session.call('sys','save_gameinfo');
  assert.equal(Number(sys.gametype),tutorial?17:0);
  await host.enterBattlefield(username,createCookiePass(password),'m',1,0,'127.0.0.1');await host.close();
  app=createNativeApplication({...options,schedulerIntervalMs:0,onError:error=>errors.push(error)});
  const address=await app.listen(),base=`http://127.0.0.1:${address.port}`;
  browser=await launchNativeBrowser(t,{outputRoot:parent});
  await browser.send('Page.addScriptToEvaluateOnNewDocument',{source:`window.commandResponses=[];
    const send=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(body){
      const command=new URLSearchParams(body).get('command');this.addEventListener('loadend',()=>{
        if(this.responseURL.endsWith('/command.php'))commandResponses.push({command,status:this.status,body:this.responseText});
      },{once:true});return send.apply(this,arguments);};`});
  async function loadPlayer(){const host=await open();await host.session.call('player','load_playerdata',await host.session.call('player','fetch_playerdata',username));return host;}
  async function snapshot(){const host=await loadPlayer();try{return {
    pack:Array.from({length:6},(_,i)=>fields.map(field=>host.scope[field+(i+1)])),
    step:tutorial?Number(await host.session.call('skillbase','skill_getvalue',1000,'step')):null,
  };}finally{await host.close();}}
  async function click(selector){
    await browser.evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'});`);
    await browser.evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const point=await browser.evaluate(`(()=>{const node=document.querySelector(${JSON.stringify(selector)}),r=node.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);return {x,y,hit:node.contains(hit),expected:node.outerHTML,actual:hit?.outerHTML.slice(0,300)}})()`);
    if(!point.hit){const screenshot=await browser.send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(parent,`itemmix-${tutorial?'tutorial':'normal'}-click.png`),Buffer.from(screenshot.data,'base64'));}
    assert.equal(point.hit,true,JSON.stringify(point));
    await browser.send('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});
    await browser.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1});
  }
  async function responseAfter(selector,command){
    const before=await browser.evaluate('commandResponses.length');now+=5;await click(selector);
    try{await browser.waitFor(`commandResponses.slice(${before}).some(r=>r.command===${JSON.stringify(command)})`);}
    catch(error){throw new Error(error.message+' '+JSON.stringify({errors:browser.errors,state:await browser.evaluate(`({command:$('command')?.value,disabled:disableAllCommands,responses:commandResponses,button:document.querySelector(${JSON.stringify(selector)})?.outerHTML})`)}));}
    const result=await browser.evaluate(`commandResponses.slice(${before}).find(r=>r.command===${JSON.stringify(command)})`);
    assert.equal(result.status,200,errors.at(-1)?.stack);return {encoded:result.body,payload:gdecode(result.body)};
  }
  const mixButton='#cmd input[onclick*="itemmix"]';
  async function page(modern){
    now+=5;await browser.send('Page.navigate',{url:base+'/game.php'});
    await browser.waitFor(`document.readyState==='complete' && !!window.DTSModern && !!document.querySelector(${JSON.stringify(mixButton)})`);
    await browser.evaluate(`DTSModern.setMode(${modern});`);
  }
  for(const theme of [2,1])for(const modern of [false,true]){
    t.diagnostic(`theme ${theme}, ${modern?'modern':'classic'}: open -> invalid recipe -> craft -> reload`);
    // The second original theme puts crafting under its real "items" tab.
    const openMix=async()=>{if(theme===2)await click('#item_cmd_tag');return responseAfter(mixButton,'itemmain');};
    host=await loadPlayer();const player=host.session.state('player');
    Object.assign(player,{hp:500,mhp:500,sp:500,msp:500,club:0,state:0,action:'',itms0:0});
    for(let slot=1;slot<=6;slot++)fields.forEach((field,index)=>{player[field+slot]=materials[slot-1]?.[index]??(index===2||index===3?0:'');});
    if(tutorial){
      await host.session.call('skillbase','skill_setvalue',1000,'step','3200');
      await host.session.call('skillbase','skill_setvalue',1000,'prog','0');
      await host.session.call('skillbase','skill_setvalue',1000,'showtips','1');
    }
    await host.session.call('player','update_sdata');await host.session.call('player','player_save',player.sdata);await host.close();
    await browser.send('Network.setCookies',{cookies:Object.entries({...cookies(),templateid:String(theme)}).map(([name,value])=>({name,value,url:base}))});
    await page(modern);
    assert.equal(await browser.evaluate(`$('templateid').value`),String(theme));
    const opened=await openMix();
    assert.match(opened.payload.innerHTML.main,/【红杀铁剑·雷击】/,'actual available-recipe hints');
    assert.equal(await browser.evaluate(`$('mode').value`),'itemmain');
    const before=await snapshot();assert.equal(before.step,tutorial?3300:null);
    const select=slot=>click(theme===1?'#mitm'+slot:'#mitmtick'+slot);
    const insufficient=await responseAfter('#z','itemmix');assert.match(insufficient.payload.innerHTML.log,/至少需要2个道具/);
    assert.deepEqual(await snapshot(),before,'empty selection is rejected without consuming materials');
    await page(modern);await openMix();
    await select(1);await select(3);
    const invalid=await responseAfter('#z','itemmix');assert.match(invalid.payload.innerHTML.log,/不能合成/);
    assert.deepEqual(await snapshot(),before,'rejected recipe does not consume items or advance tutorial');
    await responseAfter('#x','menu');await openMix();
    await select(1);await select(2);
    const crafted=await responseAfter('#z','itemmix');assert.match(crafted.payload.innerHTML.log,/合成了.*【红杀铁剑·雷击】/);
    const after=await snapshot();assert.equal(after.step,tutorial?3400:null);
    assert.deepEqual(after.pack[0],['【红杀铁剑·雷击】','WK','300',45,'eu^ac1']);
    assert.deepEqual(after.pack[1],['','','0',0,'']);assert.deepEqual(after.pack[2],before.pack[2]);
    now+=5;await browser.send('Page.navigate',{url:base+'/game.php'});
    await browser.waitFor(`!!document.getElementById('gamecmd') && document.body.textContent.includes('【红杀铁剑·雷击】')`);
    assert.deepEqual(await snapshot(),after,'crafting survives a new page and request host');
    if(!tutorial){
      const responses=await readdir(path.join(stateRoot,'gamedata/tmp/response/0_'));
      const recorded=await Promise.all(responses.map(file=>readFile(path.join(stateRoot,'gamedata/tmp/response/0_',file),'utf8')));
      const offset=recorded.indexOf(crafted.encoded);assert.ok(offset>=0,'the successful real HTTP response is recorded for replay');
      const replayRoot=path.join(stateRoot,'gamedata/tmp/replay'),indexFile=(await readdir(replayRoot,{recursive:true})).find(file=>file.endsWith('replay.php'));
      const line=(await readFile(path.join(replayRoot,indexFile),'utf8')).split('\n').find(line=>line.includes('/'+responses[offset]+','));
      assert.ok(line,'the successful response is referenced by the original replay index');
      const operations=gdecode(line.split(',')[0]);assert.equal(operations.length,3,'two material clicks and one submit are recorded');
      assert.ok(operations.every(operation=>operation.length>0&&operation.every(part=>/^\d+$/.test(part))));
    }
  }
  const replayRoot=path.join(stateRoot,'gamedata/tmp/replay');
  const replayFiles=await readdir(replayRoot,{recursive:true}).catch(error=>{if(error.code==='ENOENT')return [];throw error;});
  const indexes=replayFiles.filter(file=>file.endsWith('replay.php'));assert.equal(indexes.length,tutorial?0:1);
  assert.deepEqual(browser.errors,[]);assert.deepEqual(browser.networkErrors,[]);assert.deepEqual(errors,[]);
});
