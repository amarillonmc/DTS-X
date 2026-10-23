import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { nativeGameplayModules, createNativeGameRegistry } from '../native/index.mjs';
import { createNativeGamePlan } from '../native/catalog.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const descriptors = nativeGameplayModules;

test('ported gameplay descriptors retain every source function and dependency declaration', async () => {
  const inventory = JSON.parse(await readFile(path.join(project, 'native/inventory.json'), 'utf8'));
  for (const definition of descriptors) {
    const source = inventory.modules.find(module => module.name === definition.name);
    assert.ok(source, definition.name);
    assert.deepEqual(definition.dependencies, source.dependencies, `${definition.name} required dependencies`);
    assert.deepEqual(definition.optionalDependencies ?? [], source.optionalDependencies, `${definition.name} optional dependencies`);
    assert.deepEqual(definition.conflicts ?? [], source.conflicts, `${definition.name} conflicts`);
    const names = source.functions.map(fn => fn.name.toLowerCase()).filter(name => !['init','___pre_init','___post_init'].includes(name));
    assert.deepEqual(Object.keys(definition.functions).map(name=>name.toLowerCase()).sort(), names.sort(), `${definition.name} exported rules`);
  }
});

test('native library has no PHP execution, dynamic code evaluation or old-runtime imports', async () => {
  async function inspect(folder) {
    for (const entry of await readdir(folder, {withFileTypes:true})) {
      const filename=path.join(folder,entry.name);
      if(entry.isDirectory()) await inspect(filename);
      else if(entry.name.endsWith('.mjs')) {
        const source=await readFile(filename,'utf8');
        const imports=[...source.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)['"]([^'"]+)['"]/g)].map(match=>match[1]);
        for(const specifier of imports) assert.doesNotMatch(specifier, /php-wasm|php-runtime|child_process|\/runtime\//, filename);
        assert.doesNotMatch(source,/\beval\s*\(|\bnew\s+Function\s*\(|\bWebAssembly\s*\./,filename);
      }
    }
  }
  await inspect(path.join(project,'native'));
});

test('full source configuration rejects every missing port before a partial game can initialize', async () => {
  const inventory = JSON.parse(await readFile(path.join(project, 'native/inventory.json'), 'utf8'));
  const available = new Set(descriptors.map(module => module.name));
  assert.throws(() => createNativeGameRegistry(inventory.modules), error => {
    assert.equal(error.code, 'NATIVE_MODULES_UNAVAILABLE');
    assert.deepEqual(error.missingModules, inventory.modules.filter(module => module.enabled && !available.has(module.name)).map(module => module.name));
    return true;
  });
  const developmentSelection = inventory.modules.filter(module => available.has(module.name));
  assert.equal(createNativeGameRegistry(developmentSelection).order.length, descriptors.length);
  assert.throws(() => createNativeGameRegistry(), /explicit module configuration/);
});

test('native game plans reuse immutable skill metadata without retaining live request state', async () => {
  const definitions = [{name:'skill9999',state:{count:0},functions:{work(ctx){return ++ctx.state().count;}}}];
  const config = [{name:'skill9999',enabled:true}], info = {9999:'fixture;'};
  const plan = createNativeGamePlan(config, definitions, info);
  assert.deepEqual(plan.enabled,['skill9999']); assert.deepEqual(plan.selected,definitions);
  const [one,two] = await Promise.all([plan.registry.createSession(),plan.registry.createSession()]);
  assert.equal(one.call('skill9999','work'),1); assert.equal(one.call('skill9999','work'),2);
  assert.equal(two.call('skill9999','work'),1);
  info[9999]='updated;'; config[0].enabled=false;
  assert.equal(plan.skills.getInfo(9999),'fixture;'); assert.equal(plan.skills.hasFunction(9999,'work'),true);
  const next = createNativeGamePlan(config,definitions,info);
  assert.equal(next.skills.getInfo(9999),null); assert.deepEqual(next.registry.order,[]);
});
