import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdir, mkdtemp, rm, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import inventory from '../native/inventory.json' with { type: 'json' };
import { definitions as skills, infoById } from '../native/generated/catalog.mjs';
import { definitions as remaining } from '../native/generated/remaining/catalog.mjs';
import { nativeGameplayModules } from '../native/catalog.mjs';
import { renderPage } from '../native/generated/pages.mjs';
import { createNativeRequestHost } from '../native/http/request-host.mjs';
import { prepareInputRequest } from '../native/gameplay/input.mjs';
import { createRoomBroadcast } from '../native/system/room-poll.mjs';
import { createMaintenanceGate } from '../native/http/maintenance.mjs';
import { installNative } from '../native/install/installer.mjs';
import { createCookiePass } from '../native/accounts/primitives.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';
import { auditGeneratedGlobals } from '../scripts/native-compiler/audit-globals.mjs';

test('original cardbook and help pages render through all enabled modules and reload inert derived caches', { timeout: 120000 }, async t => {
  const db = await isolatedDatabase(t, 'generated_pages'); if (!db) return;
  const parent = path.resolve('var/tests'); await mkdir(parent, { recursive: true }); const stateRoot = await mkdtemp(path.join(parent, 'generated-pages-'));
  const broadcast = createRoomBroadcast(), maintenance = createMaintenanceGate(), hosts = [];
  t.after(async () => { for (const host of hosts) await host.close(); broadcast.close(); await maintenance.close(); assert.ok(stateRoot.startsWith(parent + path.sep)); await rm(stateRoot, { recursive: true, force: true }); });
  await installNative({ database: db.database, stateRoot, admin: { username: '页面测试', password: 'PageFixtureOnly!' } });
  const manual = new Set(nativeGameplayModules.map(module => module.name));
  async function makeHost(name) {
    const host = await createNativeRequestHost({ configuration: inventory.modules.map(({ name, enabled }) => ({ name, enabled })), additionalModules: [...skills, ...remaining].filter(module => !manual.has(module.name)), infoById,
      databaseOptions: db.credentials, sourceRoot: path.resolve('engine'), stateRoot, publicUrl: 'http://127.0.0.1', broadcast, maintenance, clock: { now: () => 1700000000 }, randomSeed: 77,
      request: { pathname: `/${name}.php`, input: prepareInputRequest({ cookies: { bra_user: '页面测试', bra_pass: createCookiePass('PageFixtureOnly!') } }), server: { SERVER_PORT: '80' }, pageStartTime: 1700000000 },
      systemConfig: { gtablepre: 'bra_', gamefounder: '页面测试' },
    }); hosts.push(host); return host;
  }
  for (const name of ['cardbook', 'help', 'itemhelp']) {
    const bodies = [];
    for (let iteration = 0; iteration < 2; iteration++) {
      const host = await makeHost(name); host.globals.___IN_HELP = name === 'help' ? 1 : 0;
      if (name === 'cardbook' && iteration === 0) {
        const report = await auditGeneratedGlobals({ functions: host.functions, enabledModules: inventory.modules.filter(row => row.enabled).map(row => row.name) });
        // Both bare skill_lost calls also fail in the original namespaces. A
        // migration must not silently invent a global skill implementation.
        assert.deepEqual(report.unresolved.map(row => [row.name, row.count]), [['decode_achievements_o', 1], ['encode_achievements_o', 1], ['skill_lost', 2]]);
        t.diagnostic(`Global binding audit: ${report.files} generated files, ${report.totalCalls} calls, ${report.names} names, ${report.dynamic.length} dynamic sites; original undefined skill_lost and standalone legacy achievement helpers retained.`);
      }
      if (name === 'cardbook') host.scope._REQUEST = { packName: 'Standard Pack' };
      bodies.push(await renderPage(name, host)); await host.close(); hosts.splice(hosts.indexOf(host), 1);
    }
    if (bodies[0] !== bodies[1]) { let index = 0; while (bodies[0][index] === bodies[1][index]) index++; assert.fail(`${name} cold/warm differ at ${index}: ${JSON.stringify(bodies[0].slice(index - 100, index + 200))} / ${JSON.stringify(bodies[1].slice(index - 100, index + 200))}`); } assert.ok(bodies[0].length > 10000, `${name} original content rendered`);
    t.diagnostic(`${name}: ${Buffer.byteLength(bodies[0])} bytes, cold and warm results identical.`);
  }
  const files = await readdir(path.join(stateRoot, 'gamedata/cache')); assert.ok(files.some(name => name === 'card_index.config.native.json'));
  assert.ok(!files.some(name => name.endsWith('.php')), 'native derived cache stores data only');
  const directory = path.join(stateRoot, 'gamedata/templates/default');
  const cached = (await readdir(directory)).filter(name => name.endsWith('.htm'));
  const host = await makeHost('help');
  for (const name of cached) {
    const filename = path.join(directory, name), compiled = path.join(stateRoot, 'oracle-template.php');
    const code = 'define("IN_GAME",true);function language(...$args){return getcwd()."/engine/templates/default/templates.lang.php";}function gexit($message){throw new Exception($message);}require "engine/include/template.func.php";$a=json_decode(stream_get_contents(STDIN),true);parse_template($a[0],$a[1],1,"",1);include $a[1];';
    const php = spawnSync(process.env.DTS_REFERENCE_PHP || 'php', ['-d', 'display_errors=stderr', '-r', code], { input: JSON.stringify([filename, compiled]), encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
    assert.equal(php.status, 0, php.stderr);
    const actual = await host.templates.render(path.basename(name, '.htm'));
    if (actual !== php.stdout) { let index = 0; while (actual[index] === php.stdout[index]) index++; assert.fail(`${name}: derived PHP rendering differs at ${index}: ${JSON.stringify(actual.slice(Math.max(0,index-100),index+150))} / ${JSON.stringify(php.stdout.slice(Math.max(0,index-100),index+150))}`); }
  }
  t.diagnostic(`Compared ${cached.length} complete derived help cache files with actual PHP template compilation and rendering.`);
});
