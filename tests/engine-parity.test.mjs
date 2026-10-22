import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createPhpRuntime } from '../runtime/php-runtime.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const fixturePhp = path.join(project, 'tests', 'fixtures', 'engine-parity.php');
const files = [
  'include/global.func.php',
  'include/bubblebox.func.php',
  'include/roommng/roommng.config.php',
  'include/modules/modules.func.php',
  'include/modulemng/modulemng.config.sample.php',
  'include/modules/base/weapon/weapon/main.php',
  'include/modules/extra/misc/replay/main.php',
  'include/modules/extra/misc/bmp_util/main.php',
  'include/modules/core/sys/config/gamemode.config.php',
  'include/modules/base/lvlctl/config/lvlctl.config.php',
];

test('real upstream functions and hook dispatch agree with native PHP 7.4', { timeout: 120_000 }, async t => {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', timeout: 10_000, windowsHide: true });
  if (version.error?.code === 'ENOENT') {
    t.skip('Native PHP is unavailable; set DTS_REFERENCE_PHP to PHP 7.4 for differential verification. Production needs no native PHP.');
    return;
  }
  assert.equal(version.status, 0, version.error?.message || version.stderr);
  if (version.stdout.trim() !== '7.4') {
    t.skip(`Reference PHP is ${version.stdout.trim()}, but the embedded engine is 7.4; set DTS_REFERENCE_PHP to a matching interpreter.`);
    return;
  }

  const parent = path.join(project, 'var', 'tests');
  await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'parity-'));
  const engineRoot = path.join(root, 'engine');
  const runtimeRoot = path.join(project, 'tests', 'fixtures');
  try {
    // Copy unchanged engine implementations, with the distributed sample config
    // used as the fixture's local config. No installation or database is needed.
    for (const file of files) {
      const destination = path.join(engineRoot, file);
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(path.join(project, 'engine', file), destination);
    }
    await copyFile(path.join(engineRoot, 'include/modulemng/modulemng.config.sample.php'), path.join(engineRoot, 'include/modulemng/modulemng.config.php'));
    const runNative = peer => {
      const result = spawnSync(executable, ['-d', 'display_errors=stderr', fixturePhp], {
        encoding: 'utf8', timeout: 30_000, windowsHide: true,
        env: { ...process.env, DTS_ENGINE_ROOT: engineRoot, DTS_PARITY_INPUT: peer || '' },
      });
      assert.equal(result.status, 0, result.error?.message || result.stderr);
      assert.equal(result.stderr, '', result.stderr);
      return JSON.parse(result.stdout);
    };
    const native = runNative();
    const php = await createPhpRuntime({ engineRoot, runtimeRoot, stateRoot: path.join(root, 'state'), prependFile: false });
    try {
      const execute = async peer => {
        const result = await php.run({ scriptPath: '/runtime/engine-parity.php', server: { DTS_PARITY_INPUT: peer || '' } });
        assert.equal(result.exitCode, 0, result.errors);
        assert.equal(result.errors, '', result.errors);
        return JSON.parse(result.text);
      };
      const wasm = await execute();
      assert.deepEqual(wasm.metadata, native.metadata, 'PHP ABI/major-minor mismatch');
      for (const [name, expected] of Object.entries(native.results)) {
        assert.deepEqual(wasm.results[name], expected, `Upstream parity category: ${name}`);
      }
      assert.deepEqual(wasm.results.baseCombat, [103, 54, 8, 17]);
      assert.deepEqual(wasm.results.hookedCombat, [38, 10]);
      // gzip headers can encode the producer's operating system. Interoperability
      // is measured by decoding each runtime's actual wire payload on the other.
      assert.deepEqual((await execute(native.encoded)).peerDecoded, native.results.roundtrip);
      assert.deepEqual(runNative(wasm.encoded).peerDecoded, wasm.results.roundtrip);
      t.diagnostic(`Compared ${Object.keys(native.results).length} upstream behavior groups, real __MAGIC__ hooks, and both wire-format directions.`);
    } finally { await php.close(); }
  } finally {
    assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep));
    await rm(root, { recursive: true, force: true });
  }
});

test('every declared module references existing upstream code and templates', async () => {
  const engine = path.join(project, 'engine');
  const lines = (await readFile(path.join(engine, 'gamedata/modules.list.php'), 'utf8')).split(/\r?\n/).filter(Boolean);
  assert.ok(lines.length >= 779, 'Unexpectedly reduced upstream module list');
  const missing = [];
  const names = new Set();
  for (const line of lines) {
    const [name, relative] = line.split(',');
    assert.ok(name && relative, `Malformed module record: ${line}`);
    assert.ok(!names.has(name), `Duplicate module name: ${name}`);
    names.add(name);
    const moduleRoot = path.resolve(engine, 'include', 'modules', relative);
    assert.ok(moduleRoot.startsWith(path.resolve(engine, 'include', 'modules') + path.sep), `Escaping module path: ${relative}`);
    let declaration;
    try { declaration = await readFile(path.join(moduleRoot, 'module.inc.php'), 'utf8'); }
    catch { missing.push(`${name}: module.inc.php`); continue; }
    for (const kind of ['codelist', 'templatelist']) {
      const match = declaration.match(new RegExp(`\\$___MODULE_${kind}\\s*=\\s*['"]([^'"]*)['"]`));
      assert.ok(match, `${name} has no ${kind} declaration`);
      for (const value of match[1].split(/\s+/).filter(Boolean)) {
        const file = path.join(moduleRoot, kind === 'templatelist' ? `${value}.htm` : value);
        try { await readFile(file); }
        catch {
          // These three local configurations are generated during setup; their
          // distributed samples are the committed source-of-truth before setup.
          if (name === 'sys' && /^config\/(server|system|game)\.config\.php$/.test(value)) {
            try { await readFile(file.replace('.config.php', '.config.sample.php')); continue; } catch { /* report below */ }
          }
          missing.push(`${name}: ${value}`);
        }
      }
    }
  }
  assert.deepEqual(missing, [], 'Missing source files declared by module headers');
});
