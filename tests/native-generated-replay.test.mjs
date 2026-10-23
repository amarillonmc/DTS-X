import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, readFile } from 'node:fs/promises';
import path from 'node:path';
import inventory from '../native/inventory.json' with { type: 'json' };
import { definitions as skills, infoById } from '../native/generated/catalog.mjs';
import { definitions as remaining } from '../native/generated/remaining/catalog.mjs';
import { nativeGameplayModules } from '../native/catalog.mjs';
import { createNativeRequestHost } from '../native/http/request-host.mjs';
import { prepareInputRequest } from '../native/gameplay/input.mjs';
import { createRoomBroadcast } from '../native/system/room-poll.mjs';
import { createMaintenanceGate } from '../native/http/maintenance.mjs';
import { installNative } from '../native/install/installer.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

test('replay CURSCRIPT imports the dummy player profile and original PHP resolves its real image', { timeout: 60000 }, async t => {
  const db = await isolatedDatabase(t, 'replay_profile'); if (!db) return;
  const parent = path.resolve('var/tests'); await mkdir(parent, { recursive: true }); const stateRoot = await mkdtemp(path.join(parent, 'replay-profile-'));
  const broadcast = createRoomBroadcast(), maintenance = createMaintenanceGate(); let host;
  t.after(async () => { await host?.close(); broadcast.close(); await maintenance.close(); assert.ok(stateRoot.startsWith(parent + path.sep)); await rm(stateRoot, { recursive: true, force: true }); });
  await installNative({ database: db.database, stateRoot, admin: { username: '录像图像测试', password: 'ReplayFixtureOnly!' } });
  const manual = new Set(nativeGameplayModules.map(module => module.name));
  host = await createNativeRequestHost({ configuration: inventory.modules.map(({ name, enabled }) => ({ name, enabled })), additionalModules: [...skills, ...remaining].filter(module => !manual.has(module.name)), infoById,
    databaseOptions: db.credentials, sourceRoot: path.resolve('engine'), stateRoot, publicUrl: 'http://127.0.0.1', broadcast, maintenance,
    request: { pathname: '/replay.php', input: prepareInputRequest({}), server: { SERVER_PORT: '80' }, pageStartTime: 1700000000 },
    clock: { now: () => 1700000000 }, randomSeed: 77, systemConfig: { gtablepre: 'bra_', gamefounder: '录像图像测试' },
  });
  assert.equal(host.constants.CURSCRIPT, 'game'); assert.equal(host.constants.IN_REPLAY, true);
  assert.equal(typeof Object.getOwnPropertyDescriptor(host.scope, 'sdata')?.set, 'function');
  host.scope.sdata = await host.session.call('player', 'create_dummy_playerdata'); host.scope.sdata.gd = 'f'; host.scope.sdata.icon = 0;
  assert.equal(host.scope.sdata, host.session.state('player').sdata);
  await host.session.call('player', 'init_playerdata');
  const actual = [host.scope.iconImg, host.scope.iconImgB, host.scope.iconImgBwidth];
  const replay = await readFile('engine/replay.php', 'utf8'), start = replay.indexOf('$sdata = \\player\\create_dummy_playerdata();'), end = replay.indexOf('\\player\\parse_interface_profile();', start);
  assert.ok(start > 0 && end > start);
  const oracleRoot = path.join(stateRoot, 'oracle'); await mkdir(path.join(oracleRoot, 'gamedata/cache'), { recursive: true });
  const code = String.raw`$input=json_decode(stream_get_contents(STDIN),true);define('IN_GAME',true);define('CURSCRIPT','game');define('__MAGIC__','return false;');define('GAME_ROOT',$input['root'].'/');
    function import_module(...$names){return 'global $db_player_structure_types,$sdata,$iconImg,$iconImgB,$iconImgBwidth,$icon_list,$icon_list_contents_to_frontend,$pc_icon_range,$weps,$wep,$wepk,$wepsk,$wepe,$arbs,$arb,$arbk,$arbsk,$arbe,$nowep,$noarb,$nosta,$fog;';}
    require 'include/modules/core/player/main.php';require 'include/modules/core/player/config/player.config.php';
    $db_player_structure_types=$input['types'];$nowep='拳头';$noarb='内衣';$nosta='∞';` + replay.slice(start, end) + 'echo json_encode([$iconImg,$iconImgB,$iconImgBwidth]);';
  const php = spawnSync(process.env.DTS_REFERENCE_PHP || 'php', ['-d', 'display_errors=stderr', '-r', code], { cwd: path.resolve('engine'), input: JSON.stringify({ root: oracleRoot.replaceAll('\\', '/'), types: host.session.state('player').db_player_structure_types }), encoding: 'utf8', windowsHide: true, timeout: 20000 });
  assert.equal(php.status, 0, php.stderr); assert.deepEqual(actual, JSON.parse(php.stdout)); assert.equal(actual[0], 'f_0.gif');
  await host.session.call('player', 'parse_interface_profile');
  const profile = await host.templates.render('profile', host.scope); assert.match(profile, /src="img\/f_0\.gif"/); assert.doesNotMatch(profile, /src="img\/"/);
});
