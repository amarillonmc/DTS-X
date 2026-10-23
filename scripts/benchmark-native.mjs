// Development benchmark: never reads .env or connects to a deployed game.
// The shared test helper verifies port, database and the dedicated data directory.
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { performance, PerformanceObserver, monitorEventLoopDelay } from 'node:perf_hooks';
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

let samples = 20, profileEnabled = false, phaseEnabled = false, diagnosticsEnabled = false, schedulerIntervalMs = 0, extended = false, concurrency = 1;
let label = new Date().toISOString().replace(/[^0-9T]/g, '');
for (const arg of process.argv.slice(2)) {
  if (/^--samples=\d+$/.test(arg)) samples = Number(arg.slice(10));
  else if (/^--label=[a-z0-9_-]+$/i.test(arg)) label = arg.slice(8);
  else if (/^--scheduler-ms=\d+$/.test(arg)) schedulerIntervalMs = Number(arg.slice(15));
  else if (/^--concurrency=\d+$/.test(arg)) concurrency = Number(arg.slice(14));
  else if (arg === '--actions=all') extended = true;
  else if (arg === '--profile') profileEnabled = true;
  else if (arg === '--phases') phaseEnabled = true;
  else if (arg === '--diagnostics') diagnosticsEnabled = true;
  else throw new Error('Usage: npm run benchmark:native -- [--samples=20] [--label=name] [--profile] [--phases] [--diagnostics] [--scheduler-ms=1000] [--actions=all] [--concurrency=4]');
}
assert.ok(samples >= 5 && samples <= 1000, 'Use 5 to 1000 samples per action');
assert.ok(schedulerIntervalMs === 0 || schedulerIntervalMs >= 1000 && schedulerIntervalMs <= 60000, 'Scheduler interval must be 0 or 1000 to 60000 ms');
assert.ok(concurrency >= 1 && concurrency <= 16, 'Use 1 to 16 simultaneous requests');
const root = path.resolve(import.meta.dirname, '..'), parent = path.join(root, 'var/tests');
const cleanup = [], fixture = { after: fn => cleanup.unshift(fn), skip: reason => { throw new Error(reason); } };
const errors = [], originalCreateSession = ModuleRegistry.prototype.createSession;
let active, app, host, inspector;
const gc = [], observer = diagnosticsEnabled ? new PerformanceObserver(list => {
  for (const entry of list.getEntries()) gc.push({ startMs: entry.startTime, durationMs: entry.duration, kind: entry.detail.kind });
}) : null;
const loopDelay = diagnosticsEnabled ? monitorEventLoopDelay({ resolution: 10 }) : null;
observer?.observe({ entryTypes: ['gc'] }); loopDelay?.enable();
function instrument(object, name, category, label = (...args) => name) {
  const original = object[name];
  object[name] = async function (...args) {
    const measured = active, start = performance.now();
    try { return await original.apply(this, args); }
    finally {
      if (measured) {
        const key = category + ':' + label(...args), record = measured.phases[key] ??= { count: 0, ms: 0 };
        record.count++; record.ms += performance.now() - start;
      }
    }
  };
}
ModuleRegistry.prototype.createSession = async function (...args) {
  const start = performance.now();
  if (phaseEnabled && active) active.sessionStartOffsetMs = start - active.startedAt;
  if (phaseEnabled) {
    const options = args[0] ?? {}, onCreate = options.onCreate;
    args[0] = { ...options, onCreate: async session => {
      instrument(session, 'load', 'initialize', definition => definition.name);
      instrument(session, 'call', 'call', (module, method) => module + '.' + method);
      // The files object is shared by this request's host and generated helpers.
      // Keep the production filesystem/lock implementation, only time its calls.
      for (const name of Object.keys(options.services?.files ?? {})) instrument(options.services.files, name, 'file', file => name + ':' + file);
      await onCreate?.(session);
    } };
  }
  try { return await originalCreateSession.apply(this, args); }
  finally { if (active) { active.sessionMs += performance.now() - start; if (phaseEnabled) active.sessionEndOffsetMs = performance.now() - active.startedAt; } }
};
try {
  const db = await isolatedDatabase(fixture, 'performance');
  await mkdir(parent, { recursive: true });
  const stateRoot = await mkdtemp(path.join(parent, 'native-performance-'));
  fixture.after(async () => { assert.equal(path.dirname(stateRoot), parent); await rm(stateRoot, { recursive: true, force: true }); });
  const broadcast = createRoomBroadcast(), maintenance = createMaintenanceGate();
  fixture.after(async () => { await host?.close(); await app?.close(); broadcast.close(); await maintenance.close(); });
  const username = '性能回归', password = 'PerformanceFixtureOnly!';
  let now = Math.floor(Date.now() / 1000);
  await installNative({ database: db.database, stateRoot, admin: { username, password } });
  const options = {
    configuration: defaultConfiguration, additionalModules, infoById, databaseOptions: db.credentials,
    sourceRoot: path.join(root, 'engine'), stateRoot, publicUrl: 'http://127.0.0.1', modernRoot: path.join(root, 'public/modern'),
    randomSeed: 77, systemConfig: { gtablepre: 'bra_', gamefounder: username },
    clock: { now: () => now },
    databaseFactory: async () => {
      const start = performance.now();
      if (phaseEnabled && active) active.databaseStartOffsetMs = start - active.startedAt;
      const connection = await createDatabase(db.credentials);
      if (active) active.connectMs += performance.now() - start;
      if (phaseEnabled && active) active.databaseReadyOffsetMs = performance.now() - active.startedAt;
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
  const player = (await db.database.query("SELECT * FROM bra_players WHERE name='性能回归' AND type=0"))[0];
  assert.ok(player && Number.isSafeInteger(Number(player.pid)));
  const destination = (await host.session.call('map', 'get_safe_plslist')).find(place => Number(place) !== Number(player.pls));
  assert.ok(destination !== undefined);
  await host.close(); host = null;
  now += 5;
  app = createNativeApplication({ ...options, schedulerIntervalMs, onError: error => errors.push(error) });
  const address = await app.listen(), base = `http://127.0.0.1:${address.port}`;
  const headers = { Cookie: Object.entries(cookies).map(([name, value]) => name + '=' + encodeURIComponent(value)).join('; '), 'Content-Type': 'application/x-www-form-urlencoded' };
  let requestCount = 0;
  async function action(name, post, check, measurePhases = true) {
    if (measurePhases) active = { name, sessionMs: 0, connectMs: 0, sqlMs: 0, sqlCount: 0, ...(phaseEnabled ? { phases: {} } : {}) };
    const start = performance.now(), cpu = process.cpuUsage();
    if (measurePhases) Object.defineProperty(active, 'startedAt', { value: start });
    try {
      const response = await fetch(base + '/command.php', { method: 'POST', headers, body: new URLSearchParams(post) });
      const body = await response.text(), payload = gdecode(body);
      assert.equal(response.status, 200, errors.at(-1)?.stack); assert.ok(payload.innerHTML);
      const usage = process.cpuUsage(cpu);
      const row = { ...(measurePhases ? { ...active, cpuMs: (usage.user + usage.system) / 1000 } : { name }), totalMs: performance.now() - start };
      // Diagnostics are sampled only after the timed request and are optional.
      if (diagnosticsEnabled) Object.assign(row, { startMs: start, memory: process.memoryUsage(), eventLoop: performance.eventLoopUtilization() });
      requestCount++;
      if (measurePhases) active = null;
      await check?.(payload);
      return row;
    } finally { if (measurePhases) active = null; }
  }
  const currentPlayer = async () => (await db.database.query('SELECT * FROM bra_players WHERE pid=' + Number(player.pid)))[0];
  const resetPlayer = fields => db.database.arrayUpdate('bra_players', { ...player, ...fields }, 'pid=' + Number(player.pid));
  const actions = {
    menu: { post: { mode: 'command', command: 'menu' } },
    itemmix: { post: { mode: 'command', command: 'itemmain', itemcmd: 'itemmix' } },
  };
  if (extended) Object.assign(actions, {
    move: { prepare: () => resetPlayer({ hp: 1000, mhp: 1000, sp: 1000, msp: 1000, action: '' }),
      post: { mode: 'command', command: 'move', moveto: String(destination) },
      check: async payload => { assert.match(payload.innerHTML.log, /移动到了/); assert.equal(Number((await currentPlayer()).pls), Number(destination)); } },
    search: { prepare: () => resetPlayer({ hp: 1000, mhp: 1000, sp: 1000, msp: 1000, action: '', pls: destination }),
      post: { mode: 'command', command: 'search' },
      check: async payload => { assert.match(payload.innerHTML.log, /搜索着周围/); assert.ok(Number((await currentPlayer()).sp) < 1000); } },
    itemuse: { prepare: () => resetPlayer({ hp: 100, mhp: 1000, action: '', itm1: '性能测试补给', itmk1: 'HB', itme1: 50, itms1: 2, itmsk1: '' }),
      post: { mode: 'command', command: 'itm1' },
      check: async () => { const saved = await currentPlayer(); assert.ok(Number(saved.hp) > 100); assert.equal(Number(saved.itms1), 1); } },
    mixsubmit: { prepare: () => resetPlayer({ hp: 1000, mhp: 1000, sp: 1000, msp: 1000, action: '',
      itm1: '【红杀铁剑】', itmk1: 'WK', itme1: 180, itms1: 30, itmsk1: 'u',
      itm2: '电磁充能手套', itmk2: 'DA', itme2: 45, itms2: 15, itmsk2: 'E' }),
      post: { mode: 'itemmain', command: 'itemmix', mitm1: '1', mitm2: '2' },
      check: async payload => { assert.match(payload.innerHTML.log, /合成了/); const saved = await currentPlayer(); assert.ok(Array.from({ length: 6 }, (_, i) => saved['itm' + (i + 1)]).includes('【红杀铁剑·雷击】')); } },
  });
  async function measure(name, spec) {
    await spec.prepare?.(); // Controlled fixture writes and verification are outside the timed HTTP request.
    return action(name, spec.post, spec.check);
  }
  const cold = await measure('cold menu', actions.menu);
  const coldActions = {};
  for (const [name, spec] of Object.entries(actions)) coldActions[name] = await measure(name, spec);
  for (let index = 0; index < 3; index++) for (const [name, spec] of Object.entries(actions)) await measure(name, spec);
  if (profileEnabled) {
    inspector = new InspectorSession(); inspector.connect();
    await inspector.post('Profiler.enable'); await inspector.post('Profiler.start');
  }
  const rows = [];
  for (let index = 0; index < samples; index++) for (const [name, spec] of Object.entries(actions)) rows.push(await measure(name, spec));
  if (inspector) {
    const { profile } = await inspector.post('Profiler.stop');
    await writeFile(path.join(parent, `performance-${label}.cpuprofile`), JSON.stringify(profile));
    inspector.disconnect(); inspector = null;
  }
  function summarize(matches) {
    const times = matches.map(row => row.totalMs).sort((a, b) => a - b);
    const average = key => matches.reduce((sum, row) => sum + row[key], 0) / matches.length;
    return { count: matches.length, minMs: times[0], p50Ms: times[Math.ceil(times.length * .5) - 1], p95Ms: times[Math.ceil(times.length * .95) - 1],
      p99Ms: times[Math.ceil(times.length * .99) - 1], maxMs: times.at(-1),
      sessionMs: average('sessionMs'), connectMs: average('connectMs'), sqlMs: average('sqlMs'), sqlCount: average('sqlCount'), cpuMs: average('cpuMs'),
      above50Ms: times.filter(time => time > 50).length, above120Ms: times.filter(time => time > 120).length };
  }
  const groups = Object.fromEntries(Object.keys(actions).map(name => [name, summarize(rows.filter(row => row.name === name))]));
  const phaseGroups = phaseEnabled ? Object.fromEntries(Object.keys(actions).map(name => {
    const matches = rows.filter(row => row.name === name), totals = {};
    for (const row of matches) for (const [key, value] of Object.entries(row.phases)) {
      const total = totals[key] ??= { meanMs: 0, meanCount: 0 };
      total.meanMs += value.ms / matches.length; total.meanCount += value.count / matches.length;
    }
    return [name, Object.fromEntries(Object.entries(totals).sort((a, b) => b[1].meanMs - a[1].meanMs))];
  })) : null;
  const concurrentRows = [];
  if (concurrency > 1) {
    await resetPlayer({ hp: 1000, mhp: 1000, sp: 1000, msp: 1000, action: '' });
    for (let index = 0; index < samples; index++) concurrentRows.push(...await Promise.all(Array.from({ length: concurrency }, () => action('concurrent menu', actions.menu.post, null, false))));
  }
  assert.deepEqual(errors, []);
  // Session and SQL durations overlap. With the scheduler enabled these
  // diagnostic totals can also include background work, unlike HTTP latency.
  // Same-player bursts deliberately include player-lock contention. Phase and
  // CPU figures cannot be attributed to individual overlapping requests.
  const concurrent = concurrentRows.length ? summarize(concurrentRows) : null;
  if (concurrent) for (const key of ['sessionMs', 'connectMs', 'sqlMs', 'sqlCount', 'cpuMs']) delete concurrent[key];
  const diagnostics = diagnosticsEnabled ? { gc, loopDelayMs: { mean: loopDelay.mean / 1e6, p99: loopDelay.percentile(99) / 1e6, max: loopDelay.max / 1e6 } } : null;
  const result = { label, node: process.version, platform: process.platform, profileEnabled, phaseEnabled, diagnosticsEnabled, diagnostics, schedulerIntervalMs, extended,
    requestCount, concurrency, cold, coldActions, groups, phaseGroups, concurrent, rows, concurrentRows };
  const output = path.join(parent, `performance-${label}.json`);
  await writeFile(output, JSON.stringify(result, null, 2));
  const brief = ({ phases, ...row }) => row;
  console.log(JSON.stringify({ output, cold: brief(cold), coldActions: Object.fromEntries(Object.entries(coldActions).map(([name, row]) => [name, brief(row)])), groups, concurrent }, null, 2));
} finally {
  observer?.disconnect(); loopDelay?.disable();
  inspector?.disconnect();
  ModuleRegistry.prototype.createSession = originalCreateSession;
  const failures = [];
  for (const close of cleanup) try { await close(); } catch (error) { failures.push(error); }
  if (failures.length) throw new AggregateError(failures, 'Benchmark fixture cleanup failed');
}
