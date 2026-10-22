import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { prepareEngine } from '../runtime/prepare.mjs';
import { compileEngine, sourceFingerprint, needsCompile, runtimeOptions, verifyCompiledTemplates } from '../runtime/lifecycle.mjs';
import { acquireStateLock } from '../runtime/state-lock.mjs';
import { readConfig, projectRoot } from '../runtime/config.mjs';

const sys = 'include/modules/core/sys/config/';
async function write(root, file, value) {
  const target = path.join(root, file);
  await fs.mkdir(path.dirname(target), { recursive:true });
  await fs.writeFile(target, value);
}
async function fixture(t) {
  const parent = path.join(projectRoot, 'var/tests');
  await fs.mkdir(parent, { recursive:true });
  const root = await fs.mkdtemp(path.join(parent, 'lifecycle-'));
  t.after(async () => {
    assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep));
    await fs.rm(root, { recursive:true, force:true });
  });
  const config = { ...readConfig({}), sourceRoot:path.join(root, 'source'), stateRoot:path.join(root, 'state'), engineRoot:path.join(root, 'state/game'), runtimeRoot:path.join(root, 'runtime') };
  for (const kind of ['server', 'system', 'game']) await write(config.sourceRoot, sys + kind + '.config.sample.php', '<?php\n$fixture = 1;\n');
  await write(config.sourceRoot, 'include/modulemng/modulemng.config.sample.php', '<?php\n$___MOD_CODE_ADV1=0;\n$___MOD_CODE_ADV2=0;\n$___MOD_CODE_ADV3=0;\n$___MOD_CODE_COMBINE=1;\n$___MOD_SRV=1;\n');
  await write(config.sourceRoot, 'gamedata/modules.list.php', '<?php // fixture module list\n');
  await write(config.sourceRoot, 'include/modules/test/main.php', '<?php // first module\n');
  await write(config.sourceRoot, 'templates/default/test.htm', '<p>template</p>');
  await write(config.sourceRoot, 'image.png', 'image-fixture');
  await write(config.sourceRoot, 'index.php', '<?php if($___MOD_SRV) { /* HTTP wrapper */ }\n');
  return config;
}

test('source synchronization preserves runtime edits and rejects conflicts before writing', async t => {
  const config = await fixture(t);
  assert.ok((await prepareEngine(config)).changed > 0);
  await write(config.engineRoot, 'include/modules/test/main.php', '<?php // local administrator edit\n');
  assert.equal((await prepareEngine(config)).changed, 0);
  await write(config.sourceRoot, 'image.png', 'new source image');
  await write(config.sourceRoot, 'include/modules/test/main.php', '<?php // developer source edit\n');
  await assert.rejects(prepareEngine(config), /synchronization conflict.*main.php/);
  assert.equal(await fs.readFile(path.join(config.engineRoot, 'image.png'), 'utf8'), 'image-fixture');
  assert.match(await fs.readFile(path.join(config.engineRoot, 'include/modules/test/main.php'), 'utf8'), /local administrator edit/);
  // Explicit reconciliation: make the runtime copy equal the desired source.
  await fs.copyFile(path.join(config.sourceRoot, 'include/modules/test/main.php'), path.join(config.engineRoot, 'include/modules/test/main.php'));
  assert.equal((await prepareEngine(config)).changed, 1);
  await fs.unlink(path.join(config.sourceRoot, 'image.png'));
  await prepareEngine(config);
  await assert.rejects(fs.access(path.join(config.engineRoot, 'image.png')), { code:'ENOENT' });
  await fs.unlink(path.join(config.sourceRoot, 'include/modules/test/main.php'));
  await write(config.engineRoot, 'include/modules/test/main.php', '<?php // retained local change\n');
  await assert.rejects(prepareEngine(config), /synchronization conflict/);
  assert.match(await fs.readFile(path.join(config.engineRoot, 'include/modules/test/main.php'), 'utf8'), /retained local change/);
});

test('internal port refresh updates compiled config without rebuilding modules; real inputs invalidate cache', async t => {
  const config = await fixture(t);
  await prepareEngine(config, { internalUrl:'http://127.0.0.1:32100' });
  const original = await sourceFingerprint(config);
  await write(config.stateRoot, 'compiled-source', original);
  await write(config.engineRoot, 'gamedata/templates/fixture.tpl.php', '<?php // compiled test template');
  await write(config.engineRoot, 'gamedata/compiled-templates.json', JSON.stringify({version:1,templates:['/game/gamedata/templates/fixture.tpl.php']}));
  await write(config.engineRoot, 'gamedata/run/core/sys/config/server.config.adv.php', '<?php // stale compiled config');
  await prepareEngine(config, { internalUrl:'http://127.0.0.1:32101' });
  assert.equal(await sourceFingerprint(config), original);
  assert.equal(await needsCompile(config), false);
  const compiled = await fs.readFile(path.join(config.engineRoot, 'gamedata/run/core/sys/config/server.config.adv.php'), 'utf8');
  assert.match(compiled, /127\.0\.0\.1:32101/);
  assert.doesNotMatch(compiled, /32100/);
  await write(config.sourceRoot, 'image.png', 'different image');
  await write(config.sourceRoot, 'index.php', '<?php if($___MOD_SRV) { /* different HTTP wrapper */ }');
  await prepareEngine(config, { internalUrl:'http://127.0.0.1:32102' });
  assert.equal(await needsCompile(config), false);
  await write(config.engineRoot, sys + 'game.config.php', '<?php $game_setting = 2;');
  assert.equal(await needsCompile(config), true);
  await write(config.stateRoot, 'compiled-source', await sourceFingerprint(config));
  await write(config.sourceRoot, 'include/modules/test/main.php', '<?php // new game logic');
  await prepareEngine(config);
  assert.equal(await needsCompile(config), true);
  await write(config.stateRoot, 'compiled-source', await sourceFingerprint(config));
  await write(config.engineRoot, 'gamedata/modules.list.php', '<?php // activated staged list');
  assert.equal(await needsCompile(config), true);
});

test('failed compilation removes old success stamp and staged selection reaches PHP', async t => {
  const config = await fixture(t);
  await prepareEngine(config);
  await write(config.stateRoot, 'compiled-source', await sourceFingerprint(config));
  await write(config.runtimeRoot, 'prepend.php', '<?php');
  await write(config.runtimeRoot, 'compile-engine.php', '<?php echo "staged=" . $_SERVER["DTS_COMPILE_STAGED"]; http_response_code(500);');
  await assert.rejects(compileEngine(config, { staged:true }), /Module validate failed/);
  await assert.rejects(fs.access(path.join(config.stateRoot, 'compiled-source')), { code:'ENOENT' });
  assert.match(await fs.readFile(path.join(config.stateRoot, 'compile-validate.log'), 'utf8'), /staged=1/);
  assert.equal(await needsCompile(config), true);
});

test('native state lock excludes a second process and releases after close', async t => {
  const config = await fixture(t);
  const child = `import { acquireStateLock } from ${JSON.stringify(new URL('../runtime/state-lock.mjs', import.meta.url).href)}; try { const release=acquireStateLock({stateRoot:process.argv[1]}); release(); } catch (e) { console.error(e.message); process.exitCode=23; }`;
  const run = () => spawnSync(process.execPath, ['--input-type=module', '-e', child, config.stateRoot], { encoding:'utf8', timeout:10000 });
  const release = acquireStateLock(config);
  try { const blocked = run(); assert.equal(blocked.status, 23, blocked.stderr); assert.match(blocked.stderr, /state is in use/); }
  finally { release(); }
  const available = run(); assert.equal(available.status, 0, available.stderr);
  release(); // release is idempotent.
});

test('compiler success cannot authorize missing host templates, and manifest paths stay inside the cache', async t => {
  const config = await fixture(t);
  await prepareEngine(config);
  await write(config.runtimeRoot, 'prepend.php', '<?php');
  await write(config.runtimeRoot, 'compile-engine.php', `<?php
    if ($_SERVER['DTS_COMPILE_PHASE'] === 'validate') echo 'DTS_VALIDATE_OK';
    else {
      file_put_contents('/game/gamedata/compiled-templates.json', json_encode(array('version'=>1,'templates'=>array('/game/./gamedata/templates/weather.tpl.php'))));
      echo 'DTS_COMPILE_OK';
    }`);
  await write(config.stateRoot, 'compiled-source', await sourceFingerprint(config));
  await assert.rejects(compileEngine(config), /missing or empty on the host.*weather/);
  await assert.rejects(fs.access(path.join(config.stateRoot,'compiled-source')), { code:'ENOENT' });
  await write(config.engineRoot, 'gamedata/templates/weather.tpl.php', '<?php echo "weather";');
  assert.equal(await verifyCompiledTemplates(config), 1);
  await write(config.stateRoot,'compiled-source',await sourceFingerprint(config));
  assert.equal(await needsCompile(config), false);
  await write(config.engineRoot, 'gamedata/templates/weather.tpl.php', '');
  await assert.rejects(verifyCompiledTemplates(config), /missing or empty/);
  assert.equal(await needsCompile(config), true, 'startup must not trust a stamp if a template later disappears');
  await write(config.engineRoot, 'gamedata/compiled-templates.json', JSON.stringify({ version:1, templates:['/game/gamedata/templates/../../include/secret.tpl.php'] }));
  await assert.rejects(verifyCompiledTemplates(config), /escapes its cache directory/);
});

test('configuration refuses overlapping state paths and shares upload limits with PHP', () => {
  for (const DATA_DIR of ['.', 'engine', 'engine/state', '..']) assert.throws(() => readConfig({ DATA_DIR }), /DATA_DIR/);
  assert.equal(readConfig({}).maxBody, 64 * 1024 * 1024);
  const config = readConfig({ MAX_BODY_MB:'96' });
  assert.equal(config.maxBody, 96 * 1024 * 1024);
  assert.deepEqual(runtimeOptions(config).phpIni, { post_max_size:'96M', upload_max_filesize:'96M' });
  assert.throws(() => readConfig({ MAX_BODY_MB:'0' }), /MAX_BODY_MB/);
});
