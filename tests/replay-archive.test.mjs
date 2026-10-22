import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import test from 'node:test';
import { createPhpRuntime } from '../runtime/php-runtime.mjs';
import { projectRoot } from '../runtime/config.mjs';
import { patches, applyExactPatch } from '../runtime/patches.mjs';

test('Node replay bridge feeds real upstream archive, packing and replay reader with an isolated MariaDB', async t => {
  const credentialFile = path.join(projectRoot, 'var/test-db-credentials.json');
  let credentials;
  try { credentials = JSON.parse(await fs.readFile(credentialFile, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') { t.skip('Requires the dedicated local scripts/test-db.ps1 MariaDB fixture; no production database is used.'); return; } throw error; }
  assert.equal(credentials.host, '127.0.0.1'); assert.equal(credentials.port, 33317); assert.equal(credentials.database, 'dtsx_test');
  const parent = path.join(projectRoot, 'var/tests');
  await fs.mkdir(parent, { recursive:true });
  const root = await fs.mkdtemp(path.join(parent, 'replay-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await fs.rm(root, { recursive:true, force:true }); });
  const engineRoot = path.join(root, 'engine'); const runtimeRoot = path.join(root, 'runtime');
  const sourceFiles = [
    'include/global.func.php','include/template.func.php','include/bubblebox.func.php',
    'include/db/db_mysqli.class.php','include/db/db_mysqli_error.inc.php',
    'include/modules/modules.func.php','include/roommng/room.func.php','include/roommng/roommng.config.php',
    'include/modules/core/sys/gamectl.php','include/modules/core/sys/config/gamemode.config.php',
    'include/modules/extra/misc/replay/main.php','include/modules/extra/misc/replay/gnum_data.htm','include/modules/extra/misc/replay/gnum_no_replay.htm',
    'include/modules/extra/misc/bmp_util/main.php','templates/default/templates.lang.php','templates/default/bubblebox_start.htm','templates/default/bubblebox_end.htm',
    'install/bra.install.sql','gamedata/sql/players.sql','gamedata/sql/shopitem.sql','gamedata/sql/reset.sql',
  ];
  for (const file of sourceFiles) {
    let contents = await fs.readFile(path.join(projectRoot, 'engine', file));
    for (const patch of patches.filter(patch => patch.file === file)) contents = Buffer.from(applyExactPatch(contents.toString('utf8'), patch));
    const target = path.join(engineRoot, file); await fs.mkdir(path.dirname(target), { recursive:true }); await fs.writeFile(target, contents);
  }
  await fs.mkdir(path.join(engineRoot, 'include/modulemng'), { recursive:true });
  await fs.copyFile(path.join(projectRoot, 'engine/include/modulemng/modulemng.config.sample.php'), path.join(engineRoot, 'include/modulemng/modulemng.config.php'));
  for (const directory of ['gamedata/tmp/response','gamedata/tmp/replay','gamedata/replays','gamedata/javascript','gamedata/templates']) await fs.mkdir(path.join(engineRoot,directory), { recursive:true });
  await fs.mkdir(runtimeRoot);
  await fs.writeFile(path.join(runtimeRoot,'prepend.php'), '<?php');
  await fs.copyFile(path.join(projectRoot,'runtime/replay-bridge.php'),path.join(runtimeRoot,'replay-bridge.php'));
  await fs.copyFile(path.join(projectRoot,'runtime/request-bridge.php'),path.join(runtimeRoot,'request-bridge.php'));
  await fs.copyFile(path.join(projectRoot,'tests/fixtures/replay-archive.php'),path.join(runtimeRoot,'replay-archive.php'));
  const databaseName = 'dtsx_replay_'+randomBytes(8).toString('hex');
  await fs.writeFile(path.join(root,'fixture-database.txt'), databaseName);
  const runtime = await createPhpRuntime({ engineRoot, runtimeRoot, stateRoot:path.join(root,'php') });
  try {
    const response = await runtime.run({ scriptPath:'/runtime/replay-archive.php', server:{ DTS_REPLAY_DATABASE:databaseName, DTS_REPLAY_CREDENTIALS:JSON.stringify(credentials) } });
    assert.equal(response.exitCode, 0, response.errors);
    assert.equal(response.httpStatusCode, 200, response.errors);
    const result = JSON.parse(response.text);
    assert.deepEqual(result.cases.map(item=>item.game), ['401','s.402']);
    assert.equal(result.excludedCases, 3);
    assert.equal(result.databaseIsolated, true);
    for (const item of result.cases) { assert.equal(item.recordedOperations,208); assert.equal(item.partsForFirstPlayer,2); assert.equal(item.realReaderRendered,true); }
    t.diagnostic('Recorded and archived 416 responses, checked main/subroom names, winner ordering, 200-operation split, original list reader, decoded headers/clicks/data and BMP; fixture database dropped.');
  } finally { await runtime.close(); }
});
