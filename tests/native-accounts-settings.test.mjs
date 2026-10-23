import test from 'node:test';
import assert from 'node:assert/strict';
import { createAccountsOracle } from './helpers/native-accounts.mjs';
import { createUserSettingsService, userSettingsModule } from '../native/accounts/settings.mjs';
import { gencode,gdecode } from '../native/protocol/codec.mjs';
import { ModuleRegistry,reference } from '../native/modules/registry.mjs';

test('user settings cache, copy behavior and save references match original PHP module',async t=>{
  const oracle=await createAccountsOracle(t);if(!oracle)return;
  const current={username:'123',u_settings:gencode({skip_opening:1})};
  const operations=[{function:'get'}, {function:'get',ud:{username:'123',u_settings:gencode({skip_opening:9})}},
    {function:'save',settings:{item_auto_merge:2}}, {function:'get'}, {function:'get',ud:{username:'__proto__',u_settings:'broken'}}];
  const expected=oracle({mode:'settings',globals:{cudata:current},operations});assert.equal(expected.error,undefined);
  const row=structuredClone(current),settings=createUserSettingsService({currentUser:()=>row}),results=[];
  for(const operation of operations){if(operation.function==='get')results.push(settings.get(operation.ud));else{settings.save(operation.settings,operation.ud);results.push(operation.ud??null);}}
  const normalize=value=>JSON.parse(JSON.stringify(value,(_key,v)=>v));
  assert.deepEqual(normalize(results),expected.result.results); assert.deepEqual(row,expected.result.current);
  const changed=settings.get();changed.item_auto_merge=77;assert.equal(settings.get().item_auto_merge,2);
});

test('settings hooks preserve chain order, item merging and UI flags with explicit player reference slots',async()=>{
  const trace=[],user={username:'settings',u_settings:gencode({skip_opening:1,item_auto_merge:1,gscroll_type:2})};
  const registry=new ModuleRegistry([{name:'sys',state:()=>({cudata:user,uip:{}}),functions:{parse_interface_gameinfo(ctx){trace.push('parse');}}},
    {name:'player'},{name:'logger',state:()=>({log:''})},{name:'opening',functions:{opening_by_shootings_available(){trace.push('opening');return true;}}},
    {name:'itemmain',functions:{itemget_mergable_type2_process(ctx,items){trace.push(['base',items]);},itemmerge(ctx,a,b){trace.push(['merge',a,b]);}}},userSettingsModule]);
  const session=await registry.createSession();assert.equal(await session.call('opening','opening_by_shootings_available'),false);
  await session.call('itemmain','itemget_mergable_type2_process',[3,4]);await session.call('sys','parse_interface_gameinfo');
  assert.deepEqual(trace,['opening',['merge',0,3],'parse']);assert.deepEqual(session.state('sys').uip.effect.class_changeto,['gscroll','gscroll_2']);
  assert.match(session.state('logger').log,/自动合并/);
  const holder={user:null};await session.call('user_settings','save_u_settings',[],reference(holder,'user'));
  assert.equal(holder.user,null);assert.deepEqual(gdecode(session.state('sys').cudata.u_settings),[]);
});
