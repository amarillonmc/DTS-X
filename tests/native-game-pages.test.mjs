import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { commandAct, commandGame } from '../native/http/game-pages.mjs';
import { commandAlive, commandEnd, commandRank } from '../native/http/information-pages.mjs';
import { gdecode } from '../native/protocol/codec.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const canonical = value => value == null ? null : typeof value !== 'object' ? value : Object.fromEntries(Object.entries(value).map(([key,item])=>[key,canonical(item)]));
const defaults = () => ({ page:'act', scope: { cuser:'甲',cpass:'token',tablepre:'bra_',gamestate:20,gametype:0,now:1700000000,mode:'command',command:'enter',uip:{},sdata:{},newslimit:20 }, player:{pid:1,pass:'oldpass',hp:100,state:0,endtime:20,itms0:0,bid:0,player_dead_flag:0,teamID:''} });

async function native(fixture) {
  const scope=structuredClone(fixture.scope),events=[];
  const host={
    database:{async query(sql){events.push(['sql',sql]);if(sql.startsWith('UPDATE '))return [];if(sql.startsWith('SELECT nid'))return [{nid:'5'}];if(sql.startsWith('SELECT name'))return [{name:'乙'}];if(fixture.page==='alive')return fixture.players??[];return fixture.missing?[]:[fixture.player];}},
    users:{async fetch(fields='*',where='1',sort=''){events.push(['users',fields,where,sort]);return fields==='COUNT(*)'?[{'COUNT(*)':(fixture.users??[]).length}]:fixture.users??[];}},
    accounts:{async authenticate(){events.push('authenticate');return {password:'newpass'};}},
    session:{importInto(target){return target;},state(){return scope;},hasModule(name){return name==='tutorial'&&!!fixture.tutorial;}, async call(module,name,...args){
      events.push(name);
      if(name==='fetch_playerdata')return structuredClone(fixture.player);
      if(name==='load_playerdata')Object.assign(scope,args[0]);
      if(name==='act')Object.assign(scope,structuredClone(fixture.action??{}));
      if(name==='prepare_response_content')scope.gamedata.innerHTML.notice='notice';
      if(name==='getchat')return {msg:[]};
      if(name==='icon_parser_shell')return ['icon'+args[0].pid+'.gif',''];
      if(name==='get_valid_disp_user_info')return [args[0].name,'ID'+args[0].pid];
      if(name==='user_display_gamevars_setting')return '<settings>';
    }},
    templates:{names:{MOD_ITEMMAIN_ITEMFIND:'itemfind',MOD_TUTORIAL_TUTORIAL:'tutorial'},has(name){return ['death','rest','command','profile'].includes(name);},async render(name){events.push('template:'+name);return '<'+name+'>';}},
    output:{async take(){return '';},async peek(){return '';}}
  };
  let body='',error=null;
  try{body=await ({act:commandAct,game:commandGame,alive:commandAlive,rank:commandRank,end:commandEnd}[fixture.page])(host,scope);if((fixture.page==='act'||fixture.encoded)&&body)body=gdecode(body);}catch(caught){error=caught.message;}
  const state=Object.fromEntries(['hp','mode','endtime','dtime','kname','chatdata'].map(key=>[key,scope[key]??null]));
  return {body,error,events,state};
}

test('native action and initial-game controllers retain complete original branch and hook ordering', {timeout:30000},async t=>{
  const executable=process.env.DTS_REFERENCE_PHP||'php';
  const version=spawnSync(executable,['-r','echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'],{encoding:'utf8',windowsHide:true});
  if(version.stdout!=='7.4'){t.skip('Development PHP 7.4 oracle unavailable');return;}
  const parent=path.join(project,'var/tests');await mkdir(parent,{recursive:true});const root=await mkdtemp(path.join(parent,'native-game-pages-'));
  t.after(async()=>{assert.ok(path.resolve(root).startsWith(path.resolve(parent)+path.sep));await rm(root,{recursive:true,force:true});});
  const template=path.join(root,'template.php');await writeFile(template,'<?php echo dump_template($fixtureTemplate);');
  const cases=[];
  for(const page of ['act','game']){
    const add=(scope={},player={},extra={})=>{const base=defaults();cases.push({...base,page,...extra,scope:{...base.scope,...scope},player:{...base.player,...player}});};
    add();add({cuser:''});add({}, {}, {missing:true});add({gamestate:0});
    for(const hp of [0,-1,100])for(const state of [0,1,2,3,4,5,6,10])add({}, {hp,state,bid:hp<=0?2:0});
    add({}, {itms0:1});add({uip:{innerHTML:{log:'action log'},value:{test:'value'},src:{image:'x.gif'},timing:{a:1},display:{x:'none'},effect:['blink']},url:'news.php',error:'detail'});
    add({gamestate:10});add({}, {endtime:-5});
    if(page==='act'){add({}, {}, {action:{cmd:'custom',main:'death'}});add({mode:'death'});add({mode:'unknown'});add({gametype:17,mode:'unknown'}, {}, {tutorial:true});add({}, {}, {action:{hp:0,bid:2}});}
  }
  for(const gametype of [0,17])for(const alivemode of [undefined,'last','all']){
    const base=defaults();const scope={...base.scope,gametype,alivelimit:20};if(alivemode!==undefined)scope.alivemode=alivemode;
    const players=[{pid:1,name:'甲',killnum:'3',npckillnum:'4'},{pid:2,name:'乙',killnum:'3',npckillnum:'5'},{pid:3,name:'丙',killnum:'3',npckillnum:'5'}];
    cases.push({...base,page:'alive',scope,players,encoded:alivemode!==undefined});
  }
  for(const command of [undefined,'next','last'])for(const checkmode of ['credits','total','winrate','elorate']){
    const base=defaults(),scope={...base.scope,ranklimit:2,winratemingames:5,start:1,checkmode};delete scope.command;if(command!==undefined)scope.command=command;
    cases.push({...base,page:'rank',scope,encoded:command!==undefined,users:[{pid:1,wingames:'1',validgames:'3'},{pid:2,wingames:'0',validgames:'5'},{pid:3,wingames:'3',validgames:'10'}]});
  }
  for(const ecommand of [undefined,'nextgamevars'])for(const hp of [0,100]){const base=defaults();cases.push({...base,page:'end',scope:{...base.scope,ecommand},player:{...base.player,hp,bid:2},encoded:ecommand!==undefined});}
  for(let i=0;i<cases.length;i++){
    const result=spawnSync(executable,[fileURLToPath(new URL('./fixtures/native-game-pages.php',import.meta.url)),project,template],{input:JSON.stringify(cases[i]),encoding:'utf8',windowsHide:true,timeout:10000});
    assert.equal(result.status,0,result.stderr);
    assert.deepEqual(canonical(await native(cases[i])),canonical(JSON.parse(result.stdout)),`controller source case ${i}`);
  }
  t.diagnostic(`${cases.length} source controller scenarios; module-hook effects and rendering are explicit test boundaries here.`);
});
