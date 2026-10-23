// Development benchmark: never reads .env or connects to a deployed game.
// The shared test helper verifies port, database and the dedicated data directory.
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { Session as InspectorSession } from 'node:inspector/promises';
import { defaultConfiguration, additionalModules, infoById } from '../native/bootstrap.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { createNativeApplication } from '../native/http/application.mjs';
import { createNativeRequestHost } from '../native/http/request-host.mjs';
import { prepareInputRequest } from '../native/gameplay/input.mjs';
import { createDatabase } from '../native/storage/database.mjs';
import { createRoomBroadcast } from '../native/system/room-poll.mjs';
import { createMaintenanceGate } from '../native/http/maintenance.mjs';
import { installNative } from '../native/install/installer.mjs';
import { createCookiePass } from '../native/accounts/primitives.mjs';
import { gdecode } from '../native/protocol/codec.mjs';
import { isolatedDatabase } from '../tests/helpers/native-database.mjs';

let samples = 20, profileEnabled = false, schedulerIntervalMs = 0;
let label = new Date().toISOString().replace(/[^0-9T]/g, '');
for (const arg of process.argv.slice(2)) {
  if (/^--samples=\d+$/.test(arg)) samples = Number(arg.slice(10));
  else if (/^--label=[a-z0-9_-]+$/i.test(arg)) label = arg.slice(8);
  else if (/^--scheduler-ms=\d+$/.test(arg)) schedulerIntervalMs = Number(arg.slice(15));
  else if (arg === '--profile') profileEnabled = true;
  else throw new Error('Usage: npm run benchmark:native -- [--samples=20] [--label=name] [--profile] [--scheduler-ms=1000]');
}
assert.ok(samples >= 5 && samples <= 1000, 'Use 5 to 1000 samples per action');
assert.ok(schedulerIntervalMs === 0 || schedulerIntervalMs >= 1000 && schedulerIntervalMs <= 60000, 'Scheduler interval must be 0 or 1000 to 60000 ms');
const root = path.resolve(import.meta.dirname, '..'), parent = path.join(root, 'var/tests');
const cleanup = [], fixture = { after: fn => cleanup.unshift(fn), skip: reason => { throw new Error(reason); } };
const errors = [], originalCreateSession = ModuleRegistry.prototype.createSession;
let active, app, host, inspector;
ModuleRegistry.prototype.createSession = async function (...args) {
  const start = performance.now();
  try { return await originalCreateSession.apply(this, args); }
  finally { if (active) active.sessionMs += performance.now() - start; }
};
try {
  const db = await isolatedDatabase(fixture, 'performance');
  await mkdir(parent, { recursive: true });
  const stateRoot = await mkdtemp(path.join(parent, 'native-performance-'));
  fixture.after(async () => { assert.equal(path.dirname(stateRoot), parent); await rm(stateRoot, { recursive: true, force: true }); });
  const broadcast = createRoomBroadcast(), maintenance = createMaintenanceGate();
  fixture.after(async () => { await host?.close(); await app?.close(); broadcast.close(); await maintenance.close(); });
  const username = '性能回归', password = 'PerformanceFixtureOnly!';
  await installNative({ database: db.database, stateRoot, admin: { username, password } });
  const options = {
    configuration: defaultConfiguration, additionalModules, infoById, databaseOptions: db.credentials,
    sourceRoot: path.join(root, 'engine'), stateRoot, publicUrl: 'http://127.0.0.1', modernRoot: path.join(root, 'public/modern'),
    randomSeed: 77, systemConfig: { gtablepre: 'bra_', gamefounder: username },
    databaseFactory: async () => {
      const start = performance.now(), connection = await createDatabase(db.credentials);
      if (active) active.connectMs += performance.now() - start;
      for (const name of ['query', 'execute', 'queries']) {
        const original = connection[name].bind(connection);
        connection[name] = async (...args) => {
          const start = performance.now();
          try { return await original(...args); }
          finally { if (active) { active.sqlMs += performance.now() - start; active.sqlCount++; } }
        };
      }
      return connection;
    },
  };
  const cookies = { bra_user: username, bra_pass: createCookiePass(password) };
  host = await createNativeRequestHost({ ...options, broadcast, maintenance, request: {
    pathname: '/game.php', input: prepareInputRequest({ cookies }), server: { SERVER_PORT: '80' }, pageStartTime: Date.now() / 1000,
  } });
  const sys = host.session.state('sys'); sys.starttime = sys.now;
  await host.session.call('gameflow_base', 'gamestate_prepare_game');
  await host.session.call('gameflow_base', 'gamestate_start_game');
  await host.session.call('sys', 'save_gameinfo');
  await host.enterBattlefield(username, createCookiePass(password), 'm', 1, 0, '127.0.0.1');
  await host.close(); host = null;
  app = createNativeApplication({ ...options, schedulerIntervalMs, onError: error => errors.push(error) });
  const address = await app.listen(), base = `http://127.0.0.1:${address.port}`;
  const headers = { Cookie: Object.entries(cookies).map(([name, value]) => name + '=' + encodeURIComponent(value)).join('; '), 'Content-Type': 'application/x-www-form-urlencoded' };
  async function action(name, post) {
    active = { name, sessionMs: 0, connectMs: 0, sqlMs: 0, sqlCount: 0 };
    const start = performance.now(), cpu = process.cpuUsage();
    try {
      const response = await fetch(base + '/command.php', { method: 'POST', headers, body: new URLSearchParams(post) });
      const body = await response.text();
      assert.equal(response.status, 200, errors.at(-1)?.stack); assert.ok(gdecode(body).innerHTML);
      const usage = process.cpuUsage(cpu);
      return { ...active, totalMs: performance.now() - start, cpuMs: (usage.user + usage.system) / 1000 };
    } finally { active = null; }
  }
  const actions = { menu: { mode: 'command', command: 'menu' }, itemmix: { mode: 'command', command: 'itemmain', itemcmd: 'itemmix' } };
  const cold = await action('cold menu', actions.menu);
  for (let index = 0; index < 3; index++) for (const [name, post] of Object.entries(actions)) await action(name, post);
  if (profileEnabled) {
    inspector = new InspectorSession(); inspector.connect();
    await inspector.post('Profiler.enable'); await inspector.post('Profiler.start');
  }
  const rows = [];
  for (let index = 0; index < samples; index++) for (const [name, post] of Object.entries(actions)) rows.push(await action(name, post));
  if (inspector) {
    const { profile } = await inspector.post('Profiler.stop');
    await writeFile(path.join(parent, `performance-${label}.cpuprofile`), JSON.stringify(profile));
    inspector.disconnect(); inspector = null;
  }
  assert.deepEqual(errors, []);
  const groups = Object.fromEntries(Object.keys(actions).map(name => {
    const matches = rows.filter(row => row.name === name), times = matches.map(row => row.totalMs).sort((a, b) => a - b);
    const average = key => matches.reduce((sum, row) => sum + row[key], 0) / matches.length;
    return [name, { count: matches.length, p50Ms: times[Math.ceil(times.length * .5) - 1], p95Ms: times[Math.ceil(times.length * .95) - 1],
      sessionMs: average('sessionMs'), connectMs: average('connectMs'), sqlMs: average('sqlMs'), sqlCount: average('sqlCount'), cpuMs: average('cpuMs') }];
  }));
  // Session and SQL durations overlap. With the scheduler enabled these
  // diagnostic totals can also include background work, unlike HTTP latency.
  const result = { label, node: process.version, platform: process.platform, profileEnabled, schedulerIntervalMs, cold, groups, rows };
  const output = path.join(parent, `performance-${label}.json`);
  await writeFile(output, JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ output, cold, groups }, null, 2));
} finally {
  inspector?.disconnect();
  ModuleRegistry.prototype.createSession = originalCreateSession;
  const failures = [];
  for (const close of cleanup) try { await close(); } catch (error) { failures.push(error); }
  if (failures.length) throw new AggregateError(failures, 'Benchmark fixture cleanup failed');
}
