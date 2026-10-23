import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { commandValid } from '../native/http/valid-page.mjs';

const project=fileURLToPath(new URL('../',import.meta.url));
const canonical=value=>value==null?null:typeof value!=='object'?value:Object.fromEntries(Object.entries(value).map(([key,item])=>[key,canonical(item)]));
function fixture(){return {scope:{cuser:'甲',cpass:'pass',username:'甲',mode:'enter',tablepre:'bra_',gamestate:20,gametype:1,gamefounder:'创始人',gamevars:{},iplimit:0,validnum:0,validlimit:100,gender:'m',icon:2,motto:'信条',killmsg:'击杀',lastword:'遗言',card:1,cards:{1:{rare:'S',energy:100}},card_need_charge_gtype:[1,2],card_cooldown_discount_gtype:{2:0.5},cardtypecd:{S:1000},now:1700000000,packlist:[]},user:{username:'甲',groupid:0,ip:'127.0.0.1',icon:3,gender:'f'},cardData:{cardlist:[1],cardenergy:{1:100},card_data:[],cardchosen:1},notOwned:false,disabled:[],ipPlayers:0,players:0};}
async function native(f){const scope=structuredClone(f.scope),events=[],event=(name,args)=>events.push([name,structuredClone(args)]);
  const host={database:{async query(sql){event('sql',[sql]);return Array(sql.includes('AND ip=')?f.ipPlayers:f.players).fill({});}},accounts:{async authenticate(){event('authenticate',[]);return f.user;}},
    users:{async fetchByUsername(name){event('fetchByUsername',[name]);return f.user;},async updateByUsername(...args){event('updateByUsername',args);}},
    async enterBattlefield(...args){event('enterBattlefield',args);}, templates:{async render(name){event('render',[name]);return '<template>';}},
    session:{hasModule(){return true;},importInto(){},async call(module,name,...args){event(module+'\\'+name,args);switch(name){case 'get_user_cardinfo':return structuredClone(f.cardData);case 'card_validate_display':return args;case 'check_card_in_ownlist':return !f.notOwned;case 'card_validate':return [f.disabled,[]];case 'pack_filter':return args[0];case 'decode_achievements':return {'326':[1,3]};}}}};
  let body='',error=null;try{body=await commandValid(host,scope);}catch(e){error=e.message;}
  return {body,error,events,state:Object.fromEntries(['gender','card','card_energy','cardtype_cd_period','no_select','card_achieved_list','select_icon'].map(key=>[key,scope[key]??null]))};
}
test('entry controller matches original account, card, cooldown and redirect branches',{timeout:30000},async t=>{
  const php=process.env.DTS_REFERENCE_PHP||'php';if(spawnSync(php,['-r','echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'],{encoding:'utf8',windowsHide:true}).stdout!=='7.4'){t.skip('PHP 7.4 oracle unavailable');return;}
  const parent=path.join(project,'var/tests');await mkdir(parent,{recursive:true});const root=await mkdtemp(path.join(parent,'native-valid-page-'));await mkdir(path.join(root,'include'));await writeFile(path.join(root,'include/valid.func.php'),'<?php');
  const template=path.join(root,'template.php');await writeFile(template,'<template>');
  t.after(async()=>{assert.ok(path.resolve(root).startsWith(path.resolve(parent)+path.sep));await rm(root,{recursive:true,force:true});});
  const cases=[],add=patch=>{const f=fixture();patch(f);cases.push(f);};
  for(const mode of ['enter','notice','display'])for(const gamestate of [10,20,30])for(const groupid of [0,6])add(f=>{Object.assign(f.scope,{mode,gamestate});f.user.groupid=groupid;});
  for(const gametype of [0,1,2])for(const energy of [0,25,100])for(const state of ['owned','missing','disabled'])add(f=>{f.scope.gametype=gametype;f.scope.cards[1].energy=energy;f.notOwned=state==='missing';if(state==='disabled')f.disabled={1:1};});
  add(f=>f.scope.cuser='');add(f=>f.scope.cpass='');add(f=>f.scope.gamevars={seat_info:['乙']});add(f=>f.scope.gamevars={seat_info:['甲']});
  add(f=>{f.scope.iplimit=1;f.ipPlayers=1;});add(f=>{f.scope.iplimit=2;f.ipPlayers=1;f.scope.valid_ip='::1';});add(f=>f.scope.validnum=100);add(f=>f.players=1);
  add(f=>f.scope.gender='bad');add(f=>{f.scope.mode='display';f.players=1;});add(f=>{f.scope.mode='display';f.scope.validnum=100;});add(f=>f.scope.userdb_remote_storage='remote');
  for(let i=0;i<cases.length;i++){const result=spawnSync(php,[fileURLToPath(new URL('./fixtures/native-valid-page.php',import.meta.url)),project,template],{cwd:root,input:JSON.stringify(cases[i]),encoding:'utf8',windowsHide:true,timeout:10000});assert.equal(result.status,0,result.stderr);assert.deepEqual(canonical(await native(cases[i])),canonical(JSON.parse(result.stdout)),`entry controller source case ${i}`);}
  t.diagnostic(`${cases.length} original controller branches; card hooks, templates and entry implementation are explicit boundaries.`);
});
