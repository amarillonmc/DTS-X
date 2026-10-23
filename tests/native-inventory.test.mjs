import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const project = fileURLToPath(new URL('../', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [path.join(project, 'scripts/native-inventory.mjs'), ...args], { encoding: 'utf8', windowsHide: true, timeout: 30_000 });
async function removeFixture(root) {
  const resolved = path.resolve(root);
  assert.equal(path.dirname(resolved), path.resolve(tmpdir()));
  assert.ok(path.basename(resolved).startsWith('dtsx-native-inventory-'));
  await rm(resolved, { recursive: true, force: true });
}

test('checked native inventory is reproducible from original source and explicit migration declarations', { timeout: 40_000 }, () => {
  const result = run('--check');
  assert.equal(result.status, 0, result.stderr);
  const summary = JSON.parse(result.stdout);
  assert.equal(summary.checked, true);
  assert.equal(summary.modules, 779);
  assert.equal(summary.enabledModules, 770);
});

test('all original files and declarations can exist while every gameplay module remains unported', { timeout: 40_000 }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'dtsx-native-inventory-'));
  try {
    const status = path.join(root, 'status.json');
    const output = path.join(root, 'inventory.json');
    await writeFile(status, JSON.stringify({ schemaVersion: 1, modules: {} }));
    const result = run('--status', status, '--output', output);
    assert.equal(result.status, 0, result.stderr);
    const inventory = JSON.parse(await readFile(output, 'utf8'));
    const manifest = JSON.parse(await readFile(path.join(project, 'upstream/manifest.json'), 'utf8'));
    assert.deepEqual(inventory.sourceFiles.map(file => file.path), manifest.files.map(file => file.path));
    assert.deepEqual(inventory.missingDeclaredCode, []);
    assert.equal(inventory.migration.nativeGameReady, false);
    assert.equal(inventory.migration.counts.not_ported, 779);
    assert.ok(inventory.modules.every(module => module.migration.status === 'not_ported'));
    const chain = inventory.hookChains.find(chain => chain.name === 'get_hitrate_multiplier');
    assert.equal(chain.verification, 'static_declarations_only');
    assert.ok(chain.declarations.some(declaration => declaration.module === 'skill2'));
  } finally { await removeFixture(root); }
});

test('partial code evidence remains scoped and cannot be promoted to verified gameplay by inventory', { timeout: 40_000 }, async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'dtsx-native-inventory-'));
  try {
    const status = path.join(root, 'status.json');
    const output = path.join(root, 'inventory.json');
    const record = { status: 'partial', implementation: ['native/gameplay/attack.mjs'], evidence: [], remaining: ['Full live hook chain, persistence and replay have not been validated.'] };
    await writeFile(status, JSON.stringify({ schemaVersion: 1, modules: { attack: record } }));
    const result = run('--status', status, '--output', output);
    assert.equal(result.status, 0, result.stderr);
    const inventory = JSON.parse(await readFile(output, 'utf8'));
    assert.deepEqual(inventory.modules.find(module => module.name === 'attack').migration, record);
    assert.equal(inventory.migration.counts.partial, 1);
    assert.equal(inventory.migration.counts.not_ported, 778);
    assert.equal(inventory.migration.nativeGameReady, false);
    await writeFile(status, JSON.stringify({ schemaVersion: 1, modules: { attack: { ...record, status: 'verified' } } }));
    const refused = run('--status', status, '--output', output);
    assert.notEqual(refused.status, 0);
    assert.match(refused.stderr, /cannot certify gameplay completion/);
    assert.equal(JSON.parse(await readFile(output, 'utf8')).migration.counts.partial, 1, 'invalid status must not replace the previous inventory');
  } finally { await removeFixture(root); }
});
