import assert from 'node:assert/strict';
import test from 'node:test';
import * as v from '../native/templates/values.mjs';
import { hoistLiterals, isArrayLiteral } from '../scripts/native-compiler/hoist-literals.mjs';
import { playerModule } from '../native/gameplay/player.mjs';
import { npcModule } from '../native/gameplay/base-extra/npc.mjs';
import { createGeneratedServices, createModuleContext } from '../native/generated/context.mjs';
import { moduleBuiltins } from '../native/generated/builtins.mjs';
import { createPhp74Random } from '../native/random.mjs';

test('immutable literal copies isolate nested reads, writes, deletions and copy order', () => {
  const constant = v.immutableArray(v.array([['recipes', v.array([[7, v.array([['stuff', ['a', 'b']], ['result', ['item', 1]]])], [2, ['c']]])], ['empty', []]]));
  const first = v.copy(constant), untouched = v.copy(first);
  first.recipes[7].stuff[0] = 'changed before copy';
  const snapshot = v.copy(first);
  first.recipes[7].stuff[1] = 'changed after copy';
  v.unset(v.slot(first.recipes, [2]));
  first.empty.push(99);
  assert.deepEqual(snapshot.recipes[7].stuff, ['changed before copy', 'b']);
  assert.deepEqual(untouched.recipes[7].stuff, ['a', 'b']);
  assert.deepEqual(snapshot.recipes[2], ['c']);
  assert.deepEqual(untouched.empty, []);
  assert.deepEqual(v.arrayBucketKeys(untouched.recipes), [7, 2]);
  const serialized = structuredClone(untouched);
  assert.deepEqual(serialized.recipes[7].stuff, ['a', 'b']);
  assert.deepEqual(JSON.parse(JSON.stringify(untouched)).recipes[7].result, ['item', 1]);
  assert.throws(() => { constant.recipes[7].stuff[0] = 'bad'; }, TypeError);
});

test('immutable copy retains deletion buckets, numeric layouts, prototype keys and PHP references', () => {
  const source = v.array([['a', [1]], ['b', [2]], ['c', [3]], ['__proto__', [4]]]);
  v.unset(v.slot(source, ['b']));
  const constant = v.immutableArray(source), first = v.copy(constant), second = v.copy(first);
  assert.deepEqual(v.arrayBucketKeys(first), v.arrayBucketKeys(source));
  v.assign(v.slot(first, ['new']), [5]);
  assert.deepEqual(v.arrayBucketKeys(second), v.arrayBucketKeys(source));
  assert.deepEqual(second.__proto__, [4]);
  assert.equal(Object.getPrototypeOf(second), null);
  const owner = { number: 3 };
  v.bind(v.slot(first, ['reference']), owner, 'number');
  const boundCopy = v.copy(first);
  boundCopy.reference = 8;
  assert.equal(owner.number, 8);
  const packed = v.immutableArray(v.array([[v.APPEND, [0]], [v.APPEND, [1]], [v.APPEND, [2]]]));
  const removed = v.copy(packed); v.unset(v.slot(removed, [1]));
  assert.deepEqual(v.arrayBucketKeys(v.copy(removed)), [0, , 2]);
});

test('constant preparation refuses request objects and reference accessors', () => {
  assert.throws(() => v.immutableArray(new Map()), TypeError);
  assert.throws(() => v.immutableArray(Buffer.from('x')), TypeError);
  const reference = {};
  Object.defineProperty(reference, 'x', { enumerable: true, get: () => 1 });
  assert.throws(() => v.immutableArray(reference), TypeError);
});

test('shared lazy descriptors materialize independently and remain readable when sealed', () => {
  const constant = v.immutableArray(v.array([['child', [1, 2]]]));
  const first = v.copy(constant), second = v.copy(constant);
  assert.equal(Object.getOwnPropertyDescriptor(first, 'child').get, Object.getOwnPropertyDescriptor(second, 'child').get);
  first.child[0] = 3; assert.equal(second.child[0], 1);
  assert.equal(Object.getOwnPropertyDescriptor(first, 'child').get, undefined);
  for (const seal of [Object.seal, Object.freeze]) {
    const sealed = seal(v.copy(constant));
    sealed.child[0] = 4;
    assert.equal(sealed.child[0], 4);
    const snapshot = v.copy(sealed); sealed.child[0] = 8;
    assert.equal(snapshot.child[0], 4);
    sealed.child = [9]; assert.deepEqual(v.copy(sealed).child, [9]);
  }
});

test('lazy copies remain isolated beyond the shared descriptor cache capacity', () => {
  const child = v.immutableArray([1, 2]);
  for (let index = 0; index < 300; index++) {
    const key = 'dynamic_' + index;
    const first = v.array([[key, child]]), second = v.copy(first);
    first[key][0] = index + 3;
    assert.deepEqual(second[key], [1, 2]);
    assert.equal(v.isReferenceDescriptor(Object.getOwnPropertyDescriptor(v.array([[key, child]]), key)), false);
  }
});

test('real player and NPC parameter copies distinguish lazy values from PHP reference aliases', async () => {
  const constant = v.immutableArray(v.array([['nested', v.array([['hp', 5]])], ['value', [9]]]));
  for (const invoke of [input => playerModule.functions.playerdata_construct_process({}, input), input => npcModule.functions.get_npclist({ state: () => ({ npcinfo: input }) })]) {
    const input = v.copy(constant), holder = { hp: 1 };
    v.bind(v.slot(input, ['reference']), holder, 'hp');
    const output = await invoke(input);
    output.nested.hp = 99; output.value[0] = 0;
    assert.equal(input.nested.hp, 5); assert.equal(input.value[0], 9);
    output.reference = 7; assert.equal(holder.hp, 7);
  }
  const input = v.copy(constant), r = createModuleContext({ services: { generated: createGeneratedServices() } }, 'fixture');
  assert.equal(r.readReference(input), input);
});

test('truth, count, keys and random keys do not read array values or reference accessors', async () => {
  let reads = 0;
  const values = v.array([['first', [1]], ['second', [2]], ['third', [3]]]);
  v.unset(v.slot(values, ['second']));
  for (const name of ['first', 'third']) Object.defineProperty(values, name, { enumerable: true, configurable: true, get() { reads++; throw new Error('key-only operation read a value'); }, set() {} });
  const builtins = moduleBuiltins();
  assert.equal(v.truth(values), true);
  assert.equal(builtins.count(values), 2); assert.equal(builtins.sizeof(values), 2);
  assert.deepEqual(builtins.array_keys(values), ['first', 'third']);
  assert.equal(builtins.array_key_exists('third', values), true);
  const r = createModuleContext({ services: { generated: createGeneratedServices(), random: createPhp74Random(17) } }, 'fixture');
  assert.ok(['first', 'third'].includes(await r.call('array_rand', values)));
  assert.equal(reads, 0);
  const lazy = v.copy(v.immutableArray(v.array([['nested', [1, 2]]])));
  const before = Object.getOwnPropertyDescriptor(lazy, 'nested');
  assert.equal(builtins.count(lazy), 1); assert.deepEqual(builtins.array_keys(lazy), ['nested']);
  assert.deepEqual(Object.getOwnPropertyDescriptor(lazy, 'nested'), before);
});

test('literal hoisting accepts inert arrays only and never changes string contents or functions', () => {
  assert.equal(isArrayLiteral('r.array([[r.APPEND, r.array([["a", -1], [0, true]])]])'), true);
  for (const value of ['r.array([[0, r.get(s, "x")]])', 'r.array([[0, await r.call("time")]])', 'r.array([[0, r.argument(s)]])', 'r.array([]); process.exit()']) assert.equal(isArrayLiteral(value), false);
  const literal = `r.array([[0, "${'r.array r.APPEND '.repeat(100)}"]])`;
  const code = `import { createModuleContext } from './context.mjs';\nasync function untouched() { return ${literal}; }\nexport const definition = {\n  async initialize(ctx) {\n    r.assign(r.slot(s, ["config"]), ${literal});\n  }\n};\n`;
  const result = hoistLiterals(code, './values.mjs');
  assert.ok(result.includes(`async function untouched() { return ${literal}; }`));
  assert.ok(result.includes('r.assign(r.slot(s, ["config"]), literal0);'));
  assert.ok(result.includes('"r.array r.APPEND r.array r.APPEND'));
  assert.equal(hoistLiterals(result, './values.mjs'), result);
  const dynamic = `r.array([[0, ${literal}], [1, r.array([["random", (await r.call("rand", 0, 31))]])]])`;
  const nested = hoistLiterals(code.replaceAll(literal, dynamic), './values.mjs');
  assert.ok(nested.includes('r.array([[0, literal0], [1, r.array([["random", (await r.call("rand", 0, 31))]])]])'));
  assert.equal(nested.match(/await r.call\("rand", 0, 31\)/g).length, 2);
});
