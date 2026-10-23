import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPlayerSchemaCache } from '../native/storage/player-schema.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { playerModule } from '../native/gameplay/player.mjs';
import { nativeGameplayModules } from '../native/catalog.mjs';
import { createNativeApplication } from '../native/http/application.mjs';
import { createDatabase } from '../native/storage/database.mjs';
import { installNative } from '../native/install/installer.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const row = (Field = 'pid', Type = 'int') => ({ Field, Type });
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }

test('player schema cache shares an in-flight describe and retains only immutable metadata', async () => {
  const cache = createPlayerSchemaCache(), query = deferred(), input = [row()];
  let calls = 0;
  const database = { query(sql) { assert.equal(sql, 'DESCRIBE bra_players'); calls++; return query.promise; } };
  const first = cache.describe(database, 'bra_players'), second = cache.describe(database, 'bra_players');
  await Promise.resolve(); assert.equal(calls, 1);
  query.resolve(input);
  const [a, b] = await Promise.all([first, second]);
  assert.equal(a, b); assert.deepEqual(a, input); assert.notEqual(a, input); assert.notEqual(a[0], input[0]);
  assert.equal(Object.isFrozen(a), true); assert.equal(Object.isFrozen(a[0]), true);
  input[0].Type = 'changed'; input.push(row('hp'));
  assert.deepEqual(await cache.describe({query() { throw new Error('cached metadata must not query another connection'); }}, 'bra_players'), [row()]);
});

test('missing, failed and invalid schemas are rejected without caching the failure', async () => {
  const invalid = [null, {}, [], [null], new Array(1), [row('bad-name')], [row('1pid')], [row('pid', 7)], [row(), row()]];
  for (const bad of invalid) {
    const cache = createPlayerSchemaCache(); let calls = 0;
    const database = {async query() { calls++; return calls === 1 ? bad : [row()]; }};
    await assert.rejects(cache.describe(database, 'bra_players'));
    assert.deepEqual(await cache.describe(database, 'bra_players'), [row()]);
    assert.equal(calls, 2);
  }
  const cache = createPlayerSchemaCache(); let calls = 0;
  const database = {async query() { calls++; if (calls === 1) throw Object.assign(new Error('no table'), {code:'ER_NO_SUCH_TABLE'}); return [row()]; }};
  await assert.rejects(cache.describe(database, 'bra_players'), {code:'ER_NO_SUCH_TABLE'});
  assert.deepEqual(await cache.describe(database, 'bra_players'), [row()]);
  for (const table of ['', 'bra_players;SELECT 1', '../players', null, 3]) await assert.rejects(cache.describe(database, table), /Invalid players schema table/);
  assert.equal(calls, 2, 'invalid table names never reach the database');
});

test('schema invalidation cannot let an older resolve or rejection replace a newer pending query', async () => {
  for (const failOld of [false, true]) {
    const cache = createPlayerSchemaCache(), old = deferred(), fresh = deferred(); let calls = 0;
    const database = {query() { return ++calls === 1 ? old.promise : fresh.promise; }};
    const previous = cache.describe(database, 'bra_players');
    const observed = previous.then(value => ({value}), error => ({error}));
    await Promise.resolve(); cache.invalidate('bra_players');
    const next = cache.describe(database, 'bra_players'); await Promise.resolve();
    assert.equal(calls, 2);
    if (failOld) old.reject(new Error('old failure')); else old.resolve([row('old')]);
    const priorResult = await observed;
    if (failOld) assert.match(priorResult.error.message, /old failure/); else assert.deepEqual(priorResult.value, [row('old')]);
    const concurrent = cache.describe(database, 'bra_players'); await Promise.resolve();
    assert.equal(calls, 2, 'old completion cannot evict the fresh pending entry');
    fresh.resolve([row('new')]);
    assert.deepEqual(await next, [row('new')]); assert.equal(await next, await concurrent);
    assert.deepEqual(await cache.describe(database, 'bra_players'), [row('new')]);
    cache.invalidate();
    assert.deepEqual(await cache.describe({query: async () => [row('reset')]}, 'bra_players'), [row('reset')]);
  }
});

test('player initialization copies cached schema into independent states and observes refreshes', async () => {
  const registry = new ModuleRegistry([{name:'sys',state:{gtablepre:'bra_',tablepre:'room_'}},{name:'map'},{name:'input'},playerModule]);
  const playerSchema = createPlayerSchemaCache(); let calls = 0, rows = [row(), row('hp')];
  const database = {async query(sql) { assert.equal(sql,'DESCRIBE bra_players'); calls++; return rows; }};
  const create = cache => registry.createSession({services:{database,...(cache ? {playerSchema:cache} : {})}});
  const [a,b] = await Promise.all([create(playerSchema),create(playerSchema)]);
  assert.equal(calls,1);
  const one = a.state('player'), two = b.state('player');
  assert.deepEqual(one.db_player_structure,['pid','hp']); assert.equal(one.hp,null);
  one.db_player_structure.push('local'); one.db_player_structure_types.hp = 'changed'; one.hp = 20;
  assert.deepEqual(two.db_player_structure,['pid','hp']); assert.equal(two.db_player_structure_types.hp,'int'); assert.equal(two.hp,null);
  rows = [row(),row('hp','bigint'),row('custom_value','varchar(20)')];
  assert.equal((await create(playerSchema)).state('player').custom_value, undefined);
  playerSchema.invalidate('bra_players');
  const next = (await create(playerSchema)).state('player');
  assert.deepEqual(next.db_player_structure,['pid','hp','custom_value']); assert.equal(next.custom_value,null); assert.equal(next.db_player_structure_types.hp,'bigint');
  assert.equal(calls,2);
  await create(); await create(); assert.equal(calls,4,'hosts without the optional service keep per-request DESCRIBE');
});

test('two actual applications keep independent schema caches across requests and explicit refresh', {timeout:60000}, async t => {
  const fixture = await isolatedDatabase(t,'player_schema'); if (!fixture) return;
  const parent = path.join(root,'var/tests'); await mkdir(parent,{recursive:true});
  const temporary = await mkdtemp(path.join(parent,'player-schema-apps-'));
  const apps = [], errors = [], counts = [0,0], fields = ['application_a','application_b'];
  t.after(async () => { for (const app of apps) await app.close(); assert.ok(temporary.startsWith(parent + path.sep)); await rm(temporary,{recursive:true,force:true}); });
  const stateRoot = path.join(temporary,'state');
  await installNative({database:fixture.database,stateRoot,admin:{username:'结构测试',password:'SchemaFixtureOnly!'}});
  for (let index = 0; index < 2; index++) {
    const app = createNativeApplication({
      configuration:nativeGameplayModules.map(module => ({name:module.name,enabled:true})),
      databaseOptions:fixture.credentials,sourceRoot:path.join(root,'engine'),stateRoot,publicUrl:'http://127.0.0.1',
      schedulerIntervalMs:0,remoteUsers:{},systemConfig:{gtablepre:'bra_',gamefounder:'结构测试'},onError:error=>errors.push(error),
      databaseFactory:async () => {
        const database = await createDatabase(fixture.credentials), query = database.query.bind(database);
        database.query = async sql => {
          const rows = await query(sql);
          if (sql === 'DESCRIBE bra_players') { counts[index]++; return [...rows,row(fields[index])]; }
          return rows;
        };
        return database;
      },
      pages:{help:async host => {
        if (host.request.get.refresh) host.services.playerSchema.invalidate('bra_players');
        return JSON.stringify(host.session.state('player').db_player_structure);
      }},
    });
    apps.push(app);
  }
  const urls = [];
  for (const app of apps) { const address = await app.listen(); urls.push(`http://127.0.0.1:${address.port}`); }
  const send = async (index, suffix = '') => {
    const response = await fetch(urls[index] + '/help.php' + suffix);
    const body = await response.text(); assert.equal(response.status,200,errors.at(-1)?.stack ?? body); return JSON.parse(body);
  };
  assert.ok((await send(0)).includes('application_a'));
  assert.ok((await send(1)).includes('application_b'));
  assert.ok(!(await send(0)).includes('application_b'));
  assert.ok(!(await send(1)).includes('application_a'));
  assert.deepEqual(counts,[1,1]);
  fields[0] = 'application_a_updated'; await send(0,'?refresh=1');
  assert.ok((await send(0)).includes('application_a_updated'));
  assert.ok((await send(1)).includes('application_b'));
  assert.deepEqual(counts,[2,1]); assert.deepEqual(errors,[]);
});
