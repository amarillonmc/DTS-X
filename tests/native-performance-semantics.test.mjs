import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import * as v from '../native/templates/values.mjs';
import { createGeneratedServices, createModuleContext, cachedModuleContext } from '../native/generated/context.mjs';
import { patchLiteralRows } from '../scripts/native-compiler/patch-literal-rows.mjs';
import { transferOwnedReturns } from '../scripts/native-compiler/transfer-owned-returns.mjs';
import { elideTemporaryCopies } from '../scripts/native-compiler/elide-temporary-copies.mjs';

test('compiled partial literal tables retain random call order, layout and request isolation', async () => {
  const context = new URL('../native/generated/context.mjs', import.meta.url).href;
  const values = new URL('../native/templates/values.mjs', import.meta.url).href;
  const rows = Array.from({ length: 64 }, (_, index) => `[${index * 3}, ${index === 3 || index === 41 ? `r.array([["draw", (await r.call("rand", 0, ${index}))]])` : `r.array([["text", "${'value'.repeat(10)}"], ["nested", r.array([[0, ${index}]])]])`}]`);
  const source = `import { createModuleContext } from ${JSON.stringify(context)};\nexport const definition = {\n  async initialize(ctx) {\n    const r = createModuleContext(ctx, "fixture", "top"), s = ctx.state();\n    r.assign(r.slot(s, ["config"]), r.array([${rows.join(', ')}]));\n  }\n};\n`;
  const optimized = patchLiteralRows(source, values);
  assert.ok(optimized.includes('r.arrayPatch('));
  assert.equal(patchLiteralRows(optimized, values), optimized);
  const load = code => import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
  const [original, compiled] = await Promise.all([load(source), load(optimized)]);
  const run = async definition => {
    const draws = [], state = Object.create(null);
    const generated = createGeneratedServices({ random: { rand(min, max) { draws.push([min, max]); return draws.length; } } });
    await definition.initialize({ state: () => state, services: { generated } });
    return { draws, state };
  };
  const expected = await run(original.definition), first = await run(compiled.definition), second = await run(compiled.definition);
  assert.deepEqual(first, expected); assert.deepEqual(second, expected);
  assert.deepEqual(first.draws, [[0, 3], [0, 41]]);
  assert.deepEqual(v.arrayBucketKeys(first.state.config), v.arrayBucketKeys(expected.state.config));
  first.state.config[0].nested[0] = 999; first.state.config[9].draw = 999;
  assert.equal(second.state.config[0].nested[0], 0); assert.equal(second.state.config[9].draw, 1);
  // Duplicate, computed and implicit keys are not eligible for this transform.
  for (const key of ['0', 'r.APPEND', 'r.get(s, "key")']) assert.equal(patchLiteralRows(source.replace('[3, r.array', `[${key}, r.array`), values), source.replace('[3, r.array', `[${key}, r.array`));
});

test('partial array copies preserve frozen children, dynamic copies and key restrictions', () => {
  const child = v.immutableArray(v.array([['nested', [1]]]));
  const base = v.immutableArray(v.array([['static', child], ['runtime', null]]));
  const row = [2], first = v.arrayPatch(base, [['runtime', row]]), second = v.arrayPatch(base, [['runtime', row]]);
  first.static.nested[0] = 9; first.runtime[0] = 8;
  assert.equal(second.static.nested[0], 1); assert.equal(second.runtime[0], 2); assert.equal(row[0], 2);
  assert.throws(() => v.arrayPatch(base, [['absent', 1]]), /absent/);
  assert.throws(() => v.arrayPatch({}, []), /immutable/);
  const lazy = v.copy(base), descriptor = Object.getOwnPropertyDescriptor(lazy, 'static');
  const read = v.readonlyValues(lazy);
  assert.equal(read[0], child); assert.ok(Object.isFrozen(read[0]));
  assert.deepEqual(Object.getOwnPropertyDescriptor(lazy, 'static'), descriptor);
  const events = [], custom = {};
  for (const key of ['first', 'second']) Object.defineProperty(custom, key, { enumerable: true, get() { events.push(key); return key; } });
  assert.deepEqual(v.readonlyValues(custom), ['first', 'second']); assert.deepEqual(events, ['first', 'second']);
  const removed = { get first() { delete this.second; return 1; }, second: 2 };
  assert.deepEqual(v.readonlyValues(removed), [1]);
  const traced = operation => {
    const trace = [], proxy = new Proxy(v.copy(base), { get(target, key, receiver) { trace.push(String(key)); return Reflect.get(target, key, receiver); } });
    const result = operation(proxy); return { trace, result };
  };
  assert.deepEqual(traced(v.readonlyValues), traced(Object.values));
  Object.seal(lazy); lazy.static.nested[0] = 7;
  assert.equal(v.readonlyValues(lazy)[0].nested[0], 7, 'materialized sealed fields must not return stale frozen sources');
});

test('audited recipe returns preserve next-hook and imported reference isolation', async () => {
  for (const name of ['skill531', 'skill559', 'skill583', 'skill735', 'instance10', 'item_slip']) {
    const url = new URL(`../native/generated/${name.startsWith('skill') ? '' : 'remaining/'}modules/${name}.mjs`, import.meta.url);
    const { definition } = await import(url);
    for (const alias of [false, true]) {
      const source = v.array([['recipe', v.array([['stuff', ['original']]])]]), imported = v.array([['imported', [7]]]);
      const holder = { ret: imported };
      const ctx = { services: { generated: createGeneratedServices() }, next: async () => source, call: async () => 0,
        importSelectedInto(scope, fields) { if (alias && fields.includes('ret')) v.bind(v.slot(scope, ['ret']), holder, 'ret'); } };
      const result = await definition.functions.get_mixinfo(ctx);
      if (result.recipe) result.recipe.stuff[0] = 'changed';
      if (result.imported) result.imported[0] = 8;
      assert.equal(source.recipe.stuff[0], 'original', name); assert.equal(holder.ret.imported[0], 7, name);
    }
    const optimized = await readFile(url, 'utf8');
    assert.ok(optimized.includes('return r.returnOwnedLocal(s, "ret");'));
    const unoptimized = optimized.replace(/async function get_mixinfo\(ctx, \.\.\.args\) \{[\s\S]*?\n\}/, body => body.replace('return r.returnOwnedLocal(s, "ret");', 'return r.copy(r.get(s, "ret"));').replaceAll('r.assignOwned(', 'r.assign('));
    assert.equal(elideTemporaryCopies(transferOwnedReturns(unoptimized)), optimized);
    const edited = unoptimized.replace(/async function get_mixinfo\(ctx, \.\.\.args\) \{[\s\S]*?\n\}/, body => body.replace('return r.copy(r.get(s, "ret"));', 'await r.call("custom_extension", s);\n  return r.copy(r.get(s, "ret"));'));
    assert.equal(transferOwnedReturns(edited), edited, 'unreviewed scope escape must keep the copy');
  }
});

test('compiled contexts share only stable request bindings and refresh replaced services', async () => {
  const clock = { nowSeconds: () => 100 }, random = { rand: () => 3 };
  const generated = createGeneratedServices({ clock, random });
  const services = { generated }, ctx = Object.freeze({ services });
  const first = cachedModuleContext(ctx, 'fixture');
  assert.equal(cachedModuleContext(ctx, 'fixture'), first);
  assert.notEqual(createModuleContext(ctx, 'fixture'), createModuleContext(ctx, 'fixture'));
  assert.equal(await first.call('time'), 100);
  clock.nowSeconds = () => 200;
  const later = cachedModuleContext(ctx, 'fixture'); assert.notEqual(later, first); assert.equal(await later.call('time'), 200);
  services.random = { rand: () => 8 };
  const changed = cachedModuleContext(ctx, 'fixture'); assert.equal(await changed.call('rand'), 8); assert.equal(await first.call('rand'), 3);
  generated.globals = { new: 1 }; assert.equal(cachedModuleContext(ctx, 'fixture').globals, generated.globals);
  const other = cachedModuleContext(Object.freeze({ services: { generated: createGeneratedServices({ clock: { nowSeconds: () => 7 } }) } }), 'fixture');
  assert.equal(await other.call('time'), 7);
  const mutable = { services }; assert.notEqual(cachedModuleContext(mutable, 'fixture'), cachedModuleContext(mutable, 'fixture'));
});

test('temporary copy elision preserves reservation, aliases and nested value ownership', async () => {
  const context = new URL('../native/generated/context.mjs', import.meta.url).href;
  const source = `import { createModuleContext } from ${JSON.stringify(context)};\nexport async function run(ctx) {\n const r = createModuleContext(ctx, "fixture"), s = Object.create(null);\n r.alias(r.slot(s, ["alias"]), ctx.alias);\n r.assign(r.slot(s, ["first"]), r.array([[0, r.assign(r.slot(s, ["second"]), r.array([[0, ctx.input]]))]]));\n r.assign(r.slot(s, ["alias"]), r.array([[0, ctx.input]]));\n return [s, r.copy(r.array([[0, r.get(s, "first")]]))];\n}\n`;
  const optimized = elideTemporaryCopies(source); assert.notEqual(optimized, source); assert.equal(elideTemporaryCopies(optimized), optimized);
  const load = code => import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
  const run = async code => {
    const input = [3], holder = { value: null }, generated = createGeneratedServices();
    const r = createModuleContext({ services: { generated } }, 'fixture');
    const result = await (await load(code)).run({ services: { generated }, input, alias: r.argument(v.slot(holder, ['value'])) });
    assert.deepEqual(Object.keys(result[0]), ['alias', 'first', 'second']);
    result[0].first[0][0][0] = 8; assert.equal(result[0].second[0][0], 3); assert.equal(result[1][0][0][0][0], 3); assert.equal(input[0], 3);
    assert.deepEqual(holder.value, [[3]]); return result;
  };
  assert.deepEqual(await run(optimized), await run(source));
  for (const change of ['r.array = ctx.custom;', 'ctx.escape(r);']) {
    const escaped = source.replace(' r.alias(', ` ${change}\n r.alias(`); assert.equal(elideTemporaryCopies(escaped), escaped);
  }
});
