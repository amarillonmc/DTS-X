import test from 'node:test';
import assert from 'node:assert/strict';
import { createMaintenanceGate } from '../native/http/maintenance.mjs';

function deferred() { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; }
const turn = () => new Promise(resolve => setImmediate(resolve));

test('maintenance drains other requests, pauses arrivals and resumes after failure', async () => {
  const gate = createMaintenanceGate(), started = deferred(), finish = deferred(), events = [];
  const first = gate.request(async () => { started.resolve(); await finish.promise; events.push('writer done'); });
  await started.promise;
  const maintenance = gate.request(async () => {
    await assert.rejects(gate.run(async () => { events.push('maintenance'); throw new Error('failure'); }), /failure/);
    events.push('maintenance returned');
  });
  await turn();
  const arrival = gate.request(async () => { events.push('arrival'); });
  await turn(); assert.deepEqual(events, []);
  finish.resolve(); await Promise.all([first, maintenance, arrival]);
  assert.deepEqual(events.slice(0,2), ['writer done', 'maintenance']);
  assert.deepEqual(events.slice(2).sort(), ['arrival','maintenance returned']);
  await gate.close(); await assert.rejects(gate.request(() => {}), { code: 'NATIVE_SHUTDOWN' });
});

test('simultaneous upgrades queue without counting each other as active writers', async () => {
  const gate = createMaintenanceGate(), ready = deferred(), events = [];
  const work = name => gate.request(async () => { await ready.promise; await gate.run(async () => { events.push(name); await assert.rejects(gate.run(() => {}), /Nested/); }); events.push(`${name} done`); });
  const first = work('a'), second = work('b');
  await turn(); ready.resolve();
  await Promise.all([first,second]);
  assert.deepEqual(events, ['a','a done','b','b done']);
  await gate.close();
});

test('aborted waiting requests never enter and shutdown drains an active maintenance job', async () => {
  const gate = createMaintenanceGate(), started = deferred(), finish = deferred(), abort = new AbortController();
  const maintenance = gate.run(async () => { started.resolve(); await finish.promise; });
  await started.promise;
  const waiting = gate.request(() => assert.fail('aborted request entered'), { signal: abort.signal });
  abort.abort(new Error('cancelled')); await assert.rejects(waiting, /cancelled/);
  let closed = false; const shutdown = gate.close().then(() => { closed = true; });
  await turn(); assert.equal(closed, false);
  finish.resolve(); await maintenance; await shutdown;
  assert.equal(closed,true);
});
