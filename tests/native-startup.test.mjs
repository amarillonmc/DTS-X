import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {isolatedDatabase} from './helpers/native-database.mjs';
import {startNative} from '../native/server.mjs';
import {compileNative} from '../native/compile.mjs';
import {doctorNative} from '../native/doctor.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
test('native executable lifecycle installs an empty owned instance, rejects double owners, schedules and restarts without resetting data',{timeout:120000},async t=>{
  const db=await isolatedDatabase(t,'startup');if(!db)return;
  const parent=path.join(root,'var/tests');await mkdir(parent,{recursive:true});const stateRoot=await mkdtemp(path.join(parent,'native-startup-'));let runtime;
  t.after(async()=>{await runtime?.close();assert.ok(path.resolve(stateRoot).startsWith(path.resolve(parent)+path.sep));await rm(stateRoot,{recursive:true,force:true});});
  const config={sourceRoot:path.join(root,'engine'),stateRoot,modernRoot:path.join(root,'public/modern'),publicUrl:'http://127.0.0.1',host:'127.0.0.1',port:0,tablePrefix:'bra_',databaseOptions:db.credentials,
    admin:{username:'原生部署',password:'StartupFixtureOnly!'},autoSetup:true,systemConfig:{gtablepre:'bra_',gamefounder:'原生部署',moveut:0,startmode:0},schedulerIntervalMs:100};
  const errors=[];runtime=await startNative(config,{onError:error=>errors.push(error)});
  const first=await fetch(`http://127.0.0.1:${runtime.address.port}/index.php`);assert.equal(first.status,200);assert.match(await first.text(),/<html>/);
  await assert.rejects(startNative(config),/lock wait timed out/i);
  await assert.rejects(compileNative(config),/lock wait timed out/i);
  const diagnostics=await doctorNative(config);assert.equal(diagnostics.runtime,'native-node');assert.equal(diagnostics.modules,770);assert.equal(diagnostics.templates,882);assert.equal(diagnostics.ownership,'verified');
  const until=Date.now()+15000;while(!runtime.scheduler.status().lastRunAt&&Date.now()<until)await new Promise(resolve=>setTimeout(resolve,25));
  assert.ok(runtime.scheduler.status().lastRunAt);await runtime.scheduler.stop();assert.equal(runtime.scheduler.status().running,false);
  await db.database.execute("UPDATE bra_users SET gold=713 WHERE username='原生部署'");
  const before=(await db.database.query("SELECT password,gold FROM bra_users WHERE username='原生部署'"))[0];
  await runtime.close();assert.equal((await compileNative(config)).order.length,770);
  runtime=await startNative({...config,autoSetup:false},{onError:error=>errors.push(error)});await runtime.scheduler.stop();
  assert.deepEqual((await db.database.query("SELECT password,gold FROM bra_users WHERE username='原生部署'"))[0],before);
  const response=await fetch(`http://127.0.0.1:${runtime.address.port}/modulemng.php`);assert.equal(response.status,200);assert.doesNotMatch(await response.text(),/Node.js 原生模块及静态模板/,'unauthenticated module administration is denied');
  assert.deepEqual(errors,[]);
});
