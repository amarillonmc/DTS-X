import assert from 'node:assert/strict';
import test from 'node:test';
import * as v from '../native/templates/values.mjs';

test('array copies isolate nested data and bytes while retaining explicit references and opaque objects', () => {
  const referenced = { value: 1 }, opaque = v.opaque({ value: 2 });
  const source = v.array([['nested', { list: [1, 2], bytes: Buffer.from([0, 255]) }], ['opaque', opaque]]);
  v.bind(v.slot(source, ['reference']), referenced, 'value');
  const clone = v.copy(source);
  clone.nested.list[0] = 9; clone.nested.bytes[0] = 9;
  assert.deepEqual(source.nested.list, [1, 2]);
  assert.deepEqual(source.nested.bytes, Buffer.from([0, 255]));
  assert.equal(clone.opaque, opaque);
  clone.reference = 3;
  assert.equal(referenced.value, 3); assert.equal(source.reference, 3);
  referenced.value = 4;
  assert.equal(clone.reference, 4);
  for (const value of [undefined, null, false, true, 0, -0, NaN, 1n, '', '文字', Symbol(), () => {}]) assert.ok(Object.is(v.copy(value), value));
});

test('copies preserve sparse numeric keys, deleted buckets and insertion order independently of their source', () => {
  for (const rows of [
    [[0, 'a'], [2, 'b'], [5, 'c']],
    [[400, 'a'], [58, 'b'], [509, 'c'], [401, 'd']],
    [['z', 'a'], ['a', 'b'], ['m', 'c'], ['n', 'd']],
  ]) {
    for (const asMap of [false, true]) {
      const source = asMap ? new Map(rows) : v.array(rows);
      v.unset(v.slot(source, [rows[1][0]]));
      const before = v.arrayBucketKeys(source), clone = v.copy(source);
      assert.deepEqual(v.entries(clone), v.entries(source));
      assert.deepEqual(v.arrayBucketKeys(clone), before);
      v.unset(v.slot(clone, [rows[0][0]]));
      v.assign(v.slot(clone, ['new']), [9]);
      assert.deepEqual(v.arrayBucketKeys(source), before);
      assert.equal(v.get(source, rows[0][0]), 'a');
      assert.equal(v.get(source, 'new'), null);
    }
  }
});

test('copy keeps reference descriptors without invoking getters, and treats special names as data', () => {
  for (const source of [[], Object.create(null), {}]) {
    let reference = 2, reads = 0;
    Object.defineProperties(source, {
      data: { value: { x: 1 }, enumerable: true },
      alias: { get() { reads++; return reference; }, set(value) { reference = value; }, enumerable: true },
      getter: { get() { throw new Error('must not evaluate accessors while copying'); }, enumerable: true },
      hidden: { value: 7 },
    });
    // An own __proto__ descriptor must not be interpreted as the literal's prototype.
    Object.defineProperty(source, '__proto__', { value: { value: 8 }, enumerable: true });
    const clone = v.copy(source);
    assert.equal(reads, 0);
    assert.equal(Object.getPrototypeOf(clone), Array.isArray(source) ? Array.prototype : null);
    assert.deepEqual(Object.keys(clone), Object.keys(source));
    assert.deepEqual(clone.__proto__, Object.assign(Object.create(null), { value: 8 }));
    assert.equal(clone.getter, undefined); assert.equal(Object.hasOwn(clone, 'hidden'), false);
    assert.deepEqual(Object.getOwnPropertyDescriptor(clone, 'alias'), Object.getOwnPropertyDescriptor(source, 'alias'));
    clone.data.x = 9; assert.equal(source.data.x, 1);
    clone.alias = 5; assert.equal(reference, 5); assert.equal(source.alias, 5);
  }
});
