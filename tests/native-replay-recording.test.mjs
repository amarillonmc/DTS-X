import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { definition as replay } from '../native/generated/remaining/modules/replay.mjs';
import { createGeneratedServices } from '../native/generated/context.mjs';
import { createFileServices } from '../native/storage/files.mjs';
import { createLockServices } from '../native/storage/locks.mjs';
import { recordReplayResponse, NATIVE_REPLAY_DICTIONARY, NATIVE_REPLAY_DICTIONARY_SOURCE } from '../native/system/replay-recording.mjs';
import { gencode, gdecode } from '../native/protocol/codec.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const createRegistry = operations => new ModuleRegistry([
  { name: 'sys', state: () => ({ gametype: 0, replay_ignore_mode: [17], room_id: 3, room_prefix: 's1', starttime: 29800, moveut: 8, moveutmin: 0 }) },
  { name: 'player', state: () => ({ pid: 7, gamedata: { innerHTML: { main: '<div>原样内容</div>' } } }) },
  { name: 'input', state: () => ({ oprecorder: operations }) },
  { name: 'gameflow_base' }, { name: 'bmp_util' }, replay,
]);

test('native replay DOM-path filtering agrees with unchanged PHP replay functions', async t => {
  const php = process.env.DTS_REFERENCE_PHP || 'php', version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires PHP 7.4 development oracle.'); return; }
  const paths = ['', 'e', '1.2.3', '001.002', '.1..2.', '1.2000', '1.A', ',,,', 'e,1.2,3.4.5,bad,-1,0', Array.from({ length: 15 }, (_, i) => `${i}.1`).join(','), '1.'.repeat(100), '1.'.repeat(101)];
  const source = `define('IN_GAME',true);define('GAME_ROOT',$argv[1]);define('__MAGIC__','return false;');require GAME_ROOT.'include/global.func.php';require GAME_ROOT.'include/modules/extra/misc/replay/main.php';$out=[];foreach(json_decode(stream_get_contents(STDIN),true)as $v)$out[]=gdecode(\\replay\\replay_record_op($v),true);echo json_encode($out);`;
  const expected = spawnSync(php, ['-r', source, path.join(root, 'engine').replaceAll('\\', '/') + '/'], { input: JSON.stringify(paths), encoding: 'utf8', windowsHide: true });
  assert.equal(expected.status, 0, expected.stderr); assert.equal(expected.stderr, '');
  const session = await createRegistry('').createSession({ services: { generated: createGeneratedServices({ functions: { gencode } }) } });
  const actual = []; for (const value of paths) actual.push(gdecode(await session.call('replay', 'replay_record_op', value)));
  assert.deepEqual(actual, JSON.parse(expected.stdout));
});

test('concurrent native recordings retain one header, exact responses, timing and exclusions', async t => {
  const parent = path.join(root, 'var/tests'); await mkdir(parent, { recursive: true });
  const stateRoot = await mkdtemp(path.join(parent, 'native-recording-')), owners = [];
  t.after(async () => { for (const owner of owners) await owner.close(); assert.ok(path.resolve(stateRoot).startsWith(path.resolve(parent) + path.sep)); await rm(stateRoot, { recursive: true, force: true }); });
  async function open(index) {
    const owner = await createLockServices(stateRoot); owners.push(owner);
    const files = await createFileServices({ stateRoot, sourceRoot: path.join(root, 'engine'), locks: owner.locks });
    const services = { system: { locks: owner.locks }, generated: createGeneratedServices({ functions: { gencode }, capabilities: { replayRecording: true } }) };
    const session = await createRegistry(`${index}.1,e`).createSession({ services });
    return { session, files, services, request: { pathname: '/command.php', pageStartTime: 1000 + index / 10 } };
  }
  const hosts = await Promise.all(Array.from({ length: 8 }, (_, index) => open(index)));
  const encoded = hosts.map((host, index) => gencode({ innerHTML: { main: `<div>原样${index},'内容</div>` } }));
  const results = await Promise.all(hosts.map((host, index) => recordReplayResponse(host, encoded[index])));
  const files = hosts[0].files, index = await files.readText(results[0].indexFile), lines = index.trim().split('\n');
  assert.equal(lines.length, 9); assert.equal(index.split('Access Denied').length - 1, 1);
  for (const [position, result] of results.entries()) {
    assert.equal(await files.readText(result.responseFile), encoded[position]);
    assert.ok(Math.abs(result.elapsed - position / 10) < 0.00001);
    const line = lines.find(line => line.includes(result.responseFile)); assert.ok(line);
    assert.deepEqual(gdecode(line.split(',')[0]), [[String(position), '1'], ['e']]);
  }
  assert.equal(await files.readText('gamedata/javascript/datalib.current.txt'), NATIVE_REPLAY_DICTIONARY);
  assert.equal(await files.readText('gamedata/javascript/' + NATIVE_REPLAY_DICTIONARY), NATIVE_REPLAY_DICTIONARY_SOURCE);
  const host = hosts[0], player = host.session.state('player'), sys = host.session.state('sys'), input = host.session.state('input');
  for (const mutate of [() => { player.gamedata.url = 'valid.php'; }, () => { player.pid = 0; }, () => { sys.gametype = 17; }, () => { input.page = 'command_news'; }, () => { host.request.pathname = '/news.php'; }, () => { host.services.generated.capabilities.replayRecording = false; }]) {
    player.gamedata = { innerHTML: {} }; player.pid = 7; sys.gametype = 0; input.page = null; host.request.pathname = '/command.php'; host.services.generated.capabilities.replayRecording = true;
    mutate(); assert.equal(await recordReplayResponse(host, encoded[0]), false);
  }
  assert.equal(await files.readText(results[0].indexFile), index);
});
