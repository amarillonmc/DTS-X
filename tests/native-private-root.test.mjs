import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { privateStateRoot } from '../native/storage/private-root.mjs';
import { createLockServices } from '../native/storage/locks.mjs';
import { createFileServices } from '../native/storage/files.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
async function fixture(t) {
  const base = path.join(project, 'var/tests'); await fs.mkdir(base, { recursive: true });
  const root = await fs.mkdtemp(path.join(base, 'native-private-root-'));
  t.after(async () => { assert.equal(path.dirname(root), base); await fs.rm(root, { recursive: true, force: true }); });
  return root;
}
const link = (target, name) => fs.symlink(target, name, process.platform === 'win32' ? 'junction' : 'dir');

test('state validation rejects direct links and source paths before creating locks or descendants', async t => {
  const root = await fixture(t), outside = path.join(root, 'private-target'); await fs.mkdir(outside);
  const direct = path.join(root, 'direct'); await link(outside, direct);
  await assert.rejects(createLockServices(direct), /symlink/);
  assert.deepEqual(await fs.readdir(outside), []);
  for (const resource of ['engine', 'public']) {
    const target = path.join(project, resource), linked = path.join(root, resource);
    await link(target, linked);
    const child = 'native-must-not-create-' + path.basename(root), original = await fs.readdir(target);
    await assert.rejects(createLockServices(path.join(linked, child)), /web\/source/);
    await assert.rejects(privateStateRoot(path.join(target, child), { create: true }), /web\/source/);
    assert.deepEqual(await fs.readdir(target), original, 'Rejected root must leave original resources untouched');
  }
  await assert.rejects(privateStateRoot(project, { create: true }), /web\/source/);
  await assert.rejects(privateStateRoot(path.dirname(project), { create: true }), /web\/source/);
});

test('private roots support safe parent links and never create a missing root during validation', async t => {
  const root = await fixture(t), target = path.join(root, 'target'); await fs.mkdir(target);
  const parent = path.join(root, 'parent'); await link(target, parent);
  const requested = path.join(parent, 'new', 'state'), actual = path.join(target, 'new', 'state');
  assert.equal(await privateStateRoot(requested), actual);
  await assert.rejects(fs.access(path.join(target, 'new')), { code: 'ENOENT' });
  const locks = await createLockServices(requested);
  try {
    assert.equal(await fs.realpath(requested), actual);
    if (process.platform !== 'win32') {
      assert.equal((await fs.stat(actual)).mode & 0o777, 0o700);
      assert.equal((await fs.stat(path.dirname(actual))).mode & 0o777, 0o700);
    }
    const token = await locks.locks.acquire('probe'); await locks.locks.release('probe', token);
    assert.equal((await fs.readdir(path.join(actual, '.native-locks'))).length, 1);
  } finally { await locks.close(); }
});

test('file services reject a parent link into their resource tree before creating mutable state', async t => {
  const root = await fixture(t), source = path.join(root, 'resources'); await fs.mkdir(source);
  const parent = path.join(root, 'link'); await link(source, parent);
  const state = path.join(parent, 'new-state');
  await assert.rejects(createFileServices({ stateRoot: state, sourceRoot: source, locks: { acquire() {}, release() {} } }), /web\/source/);
  assert.deepEqual(await fs.readdir(source), []);
});
