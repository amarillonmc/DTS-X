import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,rm,readdir} from 'node:fs/promises';
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
test('tutorial wound clicks survive AJAX in both themes and shells, reject low stamina and persist progress',{timeout:180000},async t=>{
  const db=await isolatedDatabase(t,'tutorial_http');if(!db)return;
  const parent=path.join(root,'var/tests');await mkdir(parent,{recursive:true});
  const stateRoot=await mkdtemp(path.join(parent,'native-tutorial-http-'));
  const broadcast=createRoomBroadcast(),maintenance=createMaintenanceGate(),hosts=[],errors=[];
  let app,browser,roomId=0,now=Math.floor(Date.now()/1000);
  t.after(async()=>{
    await browser?.close();await app?.close();for(const host of hosts)await host.close();
    broadcast.close();await maintenance.close();
    assert.ok(path.resolve(stateRoot).startsWith(path.resolve(parent)+path.sep));await rm(stateRoot,{recursive:true,force:true});
  });
  const username='教学回归',password='TutorialFixtureOnly!';
  await installNative({database:db.database,stateRoot,admin:{username,password}});
  const cookies=()=>({bra_user:username,bra_pass:createCookiePass(password),bra_roomid:String(roomId)});
  const options={configuration:defaultConfiguration,additionalModules,infoById,databaseOptions:db.credentials,
    sourceRoot:path.join(root,'engine'),stateRoot,publicUrl:'http://127.0.0.1',modernRoot:path.join(root,'public/modern'),
    clock:{now:()=>now},randomSeed:77,systemConfig:{gtablepre:'bra_',gamefounder:username}};
  const open=async()=>{
    const request={pathname:'/game.php',input:prepareInputRequest({cookies:cookies()}),server:{SERVER_PORT:'80'},pageStartTime:now};
    const host=await createNativeRequestHost({...options,request,broadcast,maintenance});hosts.push(host);return host;
  };
  let host=await open();roomId=Number(await host.rooms.create(7));await host.close();
  host=await open();await host.rooms.initializeDatabase(roomId);
  const sys=host.session.state('sys');sys.starttime=sys.now;sys.groomstatus=40;
  await host.session.call('gameflow_base','gamestate_prepare_game');
  await host.session.call('gameflow_base','gamestate_start_game');await host.session.call('sys','save_gameinfo');
  assert.equal(Number(sys.gametype),17);
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
  async function snapshot(){const host=await loadPlayer();try{return {inf:host.scope.inf,sp:Number(host.scope.sp),
    step:Number(await host.session.call('skillbase','skill_getvalue',1000,'step')),
    wounded:!!await host.session.call('skillbase','skill_query',host.session.state('wound').infskillinfo.f)};}finally{await host.close();}}
  async function page(modern){now+=5;await browser.send('Page.navigate',{url:base+'/game.php'});
    await browser.waitFor(`!!window.DTSModern && !!document.getElementById('inff') && !!document.getElementById('gamecmd') && !!document.getElementById('command')`);
    await browser.evaluate(`DTSModern.setMode(${modern});`);}
  async function responseAfter(action,command){
    const before=await browser.evaluate('commandResponses.length');now+=5;await action();
    await browser.waitFor(`commandResponses.slice(${before}).some(r=>r.command===${JSON.stringify(command)})`);
    const result=await browser.evaluate(`commandResponses.slice(${before}).find(r=>r.command===${JSON.stringify(command)})`);
    assert.equal(result.status,200,errors.at(-1)?.stack);return gdecode(result.body);
  }
  const command=name=>responseAfter(()=>browser.evaluate(`$('mode').value='command';$('command').value=${JSON.stringify(name)};postCmd('gamecmd','command.php');`),name);
  async function clickWound(){
    assert.equal(await browser.evaluate(`typeof $('inff').onclick`),'function','AJAX profile retains its original wound handler');
    await browser.evaluate(`$('inff').scrollIntoView({block:'center'});`);
    const point=await browser.evaluate(`(()=>{const r=$('inff').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    return responseAfter(async()=>{
      await browser.send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});
      await browser.send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});
    },'inff');
  }
  for(const theme of [1,2])for(const modern of [false,true]){
    t.diagnostic(`theme ${theme}, ${modern?'modern':'classic'} shell: bread -> wound -> rejection -> healing`);
    host=await loadPlayer();
    const player=host.session.state('player'),cost=Number(host.session.state('wound').inf_recover_sp_cost);
    // Seed only the precondition; advancement, refusal and healing go through
    // the real tutorial hooks, HTTP requests and original browser handlers.
    Object.assign(player,{hp:100,sp:cost,inf:'',state:0,action:'',itms0:0,itm1:'面包',itmk1:'HH',itme1:30,itms1:1,itmsk1:''});
    await host.session.call('wound','get_inf','f');
    await host.session.call('skillbase','skill_setvalue',1000,'step','1500');
    await host.session.call('skillbase','skill_setvalue',1000,'prog','0');
    await host.session.call('skillbase','skill_setvalue',1000,'showtips','1');
    await host.session.call('player','update_sdata');await host.session.call('player','player_save',player.sdata);await host.close();
    await browser.send('Network.setCookies',{cookies:Object.entries({...cookies(),templateid:String(theme)}).map(([name,value])=>({name,value,url:base}))});
    await page(modern);assert.equal(await browser.evaluate(`$('templateid').value`),String(theme));
    const consumed=await command('itm1');
    assert.equal(await browser.evaluate(`$('templateid').value`),String(theme),'AJAX keeps the selected original theme');
    assert.deepEqual(await snapshot(),{inf:'f',sp:cost,step:1600,wounded:true},consumed.innerHTML.log);
    const refused=await clickWound();assert.match(refused.innerHTML.log,/包扎伤口需要/);
    assert.deepEqual(await snapshot(),{inf:'f',sp:cost,step:1600,wounded:true});
    host=await loadPlayer();host.scope.sp=200;
    await host.session.call('player','update_sdata');await host.session.call('player','player_save',host.scope.sdata);await host.close();
    await page(modern);await command('menu');
    const healed=await clickWound();assert.match(healed.innerHTML.log,/伤口已经包扎好了/);
    assert.deepEqual(await snapshot(),{inf:'',sp:200-cost,step:1700,wounded:false});
    await command('menu');assert.equal(await browser.evaluate(`!!$('inff')`),false);
    assert.deepEqual(await snapshot(),{inf:'',sp:200-cost,step:1700,wounded:false});
  }
  // Tutorial mode 17 is deliberately excluded from original replay recording.
  const replayFiles=await readdir(path.join(stateRoot,'gamedata/tmp/replay'),{recursive:true}).catch(error=>{if(error.code==='ENOENT')return [];throw error;});
  assert.equal(replayFiles.some(file=>file.endsWith('replay.php')),false);
  assert.deepEqual(browser.errors,[]);assert.deepEqual(browser.networkErrors,[]);assert.deepEqual(errors,[]);
});
