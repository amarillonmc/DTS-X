import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createModuleAdminService,validateNativeModuleConfiguration,validateStagedModuleConfiguration,activateStagedModuleConfiguration,readModuleConfiguration,moduleTable} from '../native/accounts/module-admin.mjs';
import {createMaintenanceGate} from '../native/http/maintenance.mjs';
import {createLockServices} from '../native/storage/locks.mjs';
const project=fileURLToPath(new URL('../',import.meta.url));
const definitions=[{name:'fixture_a',functions:{f(){return 'a';}}},{name:'fixture_b',dependencies:['fixture_a'],functions:{f(ctx){return ctx.next();}}},{name:'fixture_c',optionalDependencies:['fixture_a']},{name:'fixture_conflict',conflicts:['fixture_a']}];
const configuration=[{name:'fixture_b',path:'fixture/b/',enabled:true},{name:'fixture_c',path:'fixture/c/',enabled:true},{name:'fixture_a',path:'fixture/a/',enabled:true},{name:'fixture_conflict',path:'fixture/conflict/',enabled:false}];
async function stateDirectory(t){const base=path.join(project,'var/tests');await fs.mkdir(base,{recursive:true});const root=await fs.mkdtemp(path.join(base,'native-module-admin-'));t.after(async()=>{assert.ok(root.startsWith(base+path.sep));await fs.rm(root,{recursive:true,force:true});});return root;}
test('module candidates validate real static code/templates, preserve FIFO dependency order and activate atomically across restart',async t=>{
 const stateRoot=await stateDirectory(t),maintenance=createMaintenanceGate();t.after(()=>maintenance.close());let now=100,applied=null,failApply=false;
 const service=()=>createModuleAdminService({stateRoot,configuration,additionalModules:definitions,accounts:{authorizeAdmin:async()=>({group:9})},maintenance,apply:next=>{if(failApply)throw new Error('Host refused config');applied=next;},clock:()=>now});
 await assert.rejects(validateStagedModuleConfiguration(stateRoot,configuration,{additionalModules:definitions}),/没有已保存/);
 const valid=await validateNativeModuleConfiguration(configuration,{additionalModules:definitions});assert.deepEqual(valid.order,['fixture_a','fixture_b','fixture_c']);assert.ok(valid.templateCount>100);assert.equal(valid.configuration.at(-1).enabled,false);
 let response=await service().page({get:{action:'disable',sid:'2'}},{});assert.match(response.body,/点击保存后修改才能生效/);assert.deepEqual(await readModuleConfiguration(stateRoot,configuration),configuration);
 response=await service().page({get:{action:'save'}},{});assert.match(response.body,/Missing dependency/);assert.equal(applied,null);assert.equal((await service().activate({})).body,'文件不存在。<br>');
 await service().page({get:{action:'reset'}},{});response=await service().page({get:{action:'save'}},{});assert.match(response.body,/modulemng_activate.php/);
 assert.deepEqual((await validateStagedModuleConfiguration(stateRoot,configuration,{additionalModules:definitions})).order,['fixture_a','fixture_b','fixture_c']);
 failApply=true;await assert.rejects(service().activate({}),/Host refused/);assert.deepEqual(await service().readConfiguration(),configuration);failApply=false;
 response=await maintenance.request(()=>service().activate({}));assert.match(response.body,/修改已经被应用/);assert.deepEqual(applied.map(entry=>entry.name),['fixture_a','fixture_b','fixture_c','fixture_conflict']);assert.deepEqual(await service().readConfiguration(),applied);
 await assert.rejects(validateStagedModuleConfiguration(stateRoot,configuration,{additionalModules:definitions}),/没有已保存/);
 await service().page({get:{action:'disable',sid:'1'}},{});now+=86401;response=await service().page({get:{mode:'edit'}},{});assert.match(response.body,/action=disable&sid=1/);
 await assert.rejects(service().page({post:{action:'add',modname:'unregistered',modpath:'../../evil'}},{}),/静态注册/);
 await assert.rejects(validateNativeModuleConfiguration([...configuration,{name:'fixture_a',enabled:false}],{additionalModules:definitions}),/多次加载/);
 await assert.rejects(validateNativeModuleConfiguration(configuration.map(entry=>({...entry,enabled:true})),{additionalModules:definitions}),/conflict/);
 const denied=createModuleAdminService({stateRoot,configuration,accounts:{authorizeAdmin:async()=>({group:8})},maintenance});await assert.rejects(denied.page({},{}),error=>error.code==='no_power');
});

test('classic module dependency table is byte-identical to the original PHP renderer',async t=>{
 const executable=process.env.DTS_REFERENCE_PHP||'php',version=spawnSync(executable,['-r','echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'],{encoding:'utf8',windowsHide:true});if(version.stdout?.trim()!=='7.4'){t.skip('Development PHP 7.4 oracle unavailable');return;}
 const root=await stateDirectory(t);await fs.copyFile(path.join(project,'engine/include/modulemng/modulemng.func.php'),path.join(root,'functions.php'));
 for(let index=0;index<definitions.length;index++){const entry=definitions[index],dir=path.join(root,'include/modules/fixture',entry.name.slice(8));await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,'module.inc.php'),`<?php $___MODULE_dependency='${(entry.dependencies??[]).join(' ')}';$___MODULE_dependency_optional='${(entry.optionalDependencies??[]).join(' ')}';$___MODULE_conflict='${(entry.conflicts??[]).join(' ')}';`);}
 const list=path.join(root,'list.txt');await fs.writeFile(list,configuration.map(entry=>`${entry.name},${entry.path},${entry.enabled?1:0}`).join('\n'));
 await fs.writeFile(path.join(root,'main.php'),`<?php define('GAME_ROOT',__DIR__.'/');function openfile($file){return file($file,FILE_IGNORE_NEW_LINES);}require __DIR__.'/functions.php';printmodtable(__DIR__.'/list.txt');`);
 const result=spawnSync(executable,[path.join(root,'main.php')],{encoding:'utf8',windowsHide:true,timeout:10000});assert.equal(result.status,0,result.stderr);assert.equal(moduleTable(configuration,definitions),result.stdout);
});

test('daemon controls expose the real scheduler contract and redact operational errors',async t=>{
 const stateRoot=await stateDirectory(t),trace=[],status={enabled:true,running:false,intervalMs:1000,lastRunAt:42,lastError:'secret error detail'};
 const scheduler={status:()=>status,start:()=>{trace.push('start');status.enabled=true;},stop:async()=>{trace.push('stop');status.enabled=false;},restart:async()=>{trace.push('restart');status.enabled=true;}};
 const service=createModuleAdminService({stateRoot,configuration,accounts:{authorizeAdmin:async()=>({group:9})},scheduler});
 const page=await service.daemon({},{});assert.match(page.body,/Node.js 游戏调度器/);assert.doesNotMatch(page.body,/secret error detail/);
 for(const action of ['start','stopall','restart'])assert.equal((await service.daemon({get:{action}},{})).headers.Location,'daemonmng.php');assert.deepEqual(trace,['start','stop','restart']);await assert.rejects(service.daemon({get:{action:'stop1234'}},{}),/旧 PHP/);
});

test('offline CLI activation requires a checked candidate and atomically installs the same validated order',async t=>{
 const stateRoot=await stateDirectory(t),service=createModuleAdminService({stateRoot,configuration,additionalModules:definitions,accounts:{authorizeAdmin:async()=>({group:9})}}),locks=await createLockServices(stateRoot),token=await locks.locks.acquire('native-process-owner');
 try{await assert.rejects(activateStagedModuleConfiguration(stateRoot,configuration,{additionalModules:definitions}),/没有已保存/);await service.page({get:{action:'save'}},{});
  const next=await activateStagedModuleConfiguration(stateRoot,configuration,{additionalModules:definitions});assert.deepEqual(next.order,['fixture_a','fixture_b','fixture_c']);assert.deepEqual(await readModuleConfiguration(stateRoot,configuration),next.configuration);await assert.rejects(validateStagedModuleConfiguration(stateRoot,configuration,{additionalModules:definitions}),/没有已保存/);
 }finally{await locks.locks.release('native-process-owner',token);await locks.close();}
});
