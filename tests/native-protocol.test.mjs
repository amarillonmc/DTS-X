import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { gzipSync } from 'node:zlib';
import test from 'node:test';
import { base64CharDecode, base64CharEncode, base64DecodeNumber, base64EncodeNumber, gdecode, gencode, mgzdecode, protocolJson } from '../native/protocol/codec.mjs';
import { fold, unfold } from '../native/protocol/archive.mjs';
import { buildReplayPlayerFiles, genBmp, getHtmlColor, getIdentTextcolor, parseReplayIndex, replayClicks, replayIndexLine, replayRecordOp, replayThumbnail, replayValidifyRecord, REPLAY_INDEX_HEADER, shouldArchiveReplay } from '../native/protocol/replay.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const executable = process.env.DTS_REFERENCE_PHP || 'php';
const sources = [
  'include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', 'include/roommng/room.func.php',
  'include/modules/modules.func.php', 'include/modules/core/sys/gamectl.php',
  'include/modules/extra/misc/replay/main.php', 'include/modules/extra/misc/bmp_util/main.php',
];

// The fixture executes unchanged source algorithms. Its narrow in-memory query
// fixture supplies archive metadata only, never gameplay or a production DB.
const phpFixture = String.raw`<?php
define('IN_GAME', true);
define('IN_MODULEMNG', true);
define('GAME_ROOT', __DIR__.'/engine/');
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
require GAME_ROOT.'include/global.func.php';
require GAME_ROOT.'include/modules/modules.func.php';
require GAME_ROOT.'include/modules/extra/misc/replay/main.php';
require GAME_ROOT.'include/modules/extra/misc/bmp_util/main.php';
require GAME_ROOT.'include/modules/core/sys/gamectl.php';
require GAME_ROOT.'include/roommng/room.func.php';
$in = json_decode(stream_get_contents(STDIN), true);
$action = $in['action'];
if ($action === 'functions') {
    $out = array();
    $out['numbers'] = array();
    foreach ($in['numbers'] as $case) {
        $code = base64_encode_number($case[0], $case[1]);
        $out['numbers'][] = array($code, base64_decode_number($code));
    }
    $out['characters'] = array();
    for ($i=-1; $i<=64; $i++) $out['characters'][]=base64_char_encode($i);
    $out['decodedCharacters'] = array_map('base64_char_decode', $in['characters']);
    $out['paths'] = array_map('replay\replay_validify_record', $in['paths']);
    $out['clicks'] = array();
    foreach ($in['clicks'] as $clicks) $out['clicks'][]=gdecode(\replay\replay_record_op($clicks), true);
    $out['colors'] = array();
    foreach ($in['colors'] as $color) $out['colors'][]=\replay\get_html_color($color[0],$color[1],$color[2]);
    $out['identColors'] = array_map('replay\get_ident_textcolor', $in['names']);
    $out['bitmaps'] = array();
    foreach ($in['bitmaps'] as $case) $out['bitmaps'][]=base64_encode(\bmp_util\gen_bmp($case['pixels'],$case['width'],$case['height']));
    $out['json'] = json_encode($in['payload']);
    $out['encoded'] = gencode($in['payload']);
    $out['peerDecoded'] = gdecode($in['peer'], true);
    echo json_encode($out, JSON_UNESCAPED_UNICODE);
} elseif ($action === 'archive') {
    $dir=__DIR__.'/containers'; mkdir($dir);
    $list=array();
    foreach ($in['entries'] as $name=>$value) { file_put_contents($dir.'/'.$name,base64_decode($value)); $list[]=$dir.'/'.$name; }
    fold($dir.'/current.dat',$list); fold_core($dir.'/legacy.dat',$list);
    $out=array('current'=>base64_encode(file_get_contents($dir.'/current.dat')),'legacy'=>base64_encode(file_get_contents($dir.'/legacy.dat')),'peers'=>array());
    foreach ($in['peers'] as $index=>$peer) {
        $sub=$dir.'/peer'.$index; mkdir($sub); file_put_contents($sub.'/game.dat',base64_decode($peer)); unfold($sub.'/game.dat');
        $files=array(); foreach ($in['entries'] as $name=>$value) $files[$name]=base64_encode(file_get_contents($sub.'/'.$name));
        $out['peers'][]=$files;
    }
    echo json_encode($out);
} elseif ($action === 'build') {
    // Only SELECT history and SELECT players are used by this unchanged
    // serializer. Reject any extra DB use so this remains a protocol oracle.
    class NativeProtocolMetadata {
        public $input; public $rows=array();
        function __construct($input) { $this->input=$input; }
        function query($sql) {
            if (strpos($sql,'SELECT winner,gstime,getime FROM fixture_history WHERE gid=')===0) {
                $this->rows=array(array('winner'=>$this->input['playerName'],'gstime'=>0,'getime'=>$this->input['duration']));
            } elseif ($sql==='SELECT name,pid FROM fixture_players WHERE type = 0') {
                $this->rows=array(array('name'=>$this->input['playerName'],'pid'=>$this->input['playerId']));
            } else throw new Exception('Unexpected archive query');
            return true;
        }
        function fetch_array($query) { return array_shift($this->rows); }
    }
    define('IMPORT_MODULE_REPLAY_GLOBALS','global $partsize;');
    define('IMPORT_MODULE_SYS_GLOBALS','global $winmode,$gametype,$hdamage,$validnum,$replay_ignore_mode,$db,$wtablepre,$tablepre,$gamenum,$room_prefix,$replay_remote_storage,$replay_remote_send;');
    $___MOD_SRV=1; $___MOD_CODE_ADV3=1;
    $winmode=$in['winmode']; $gametype=$in['gametype']; $hdamage=$in['highDamage']; $validnum=$in['validPlayers']; $replay_ignore_mode=$in['ignoredModes'];
    $gamenum=$in['gameNumber']; $room_prefix=$in['roomPrefix']; $partsize=$in['partSize'];
    $replay_remote_storage=''; $replay_remote_send=0; $tablepre=$wtablepre='fixture_';
    $db=new NativeProtocolMetadata($in);
    $replay=GAME_ROOT.'gamedata/tmp/replay/'.$room_prefix.'_/'.$in['playerId'];
    mkdir($replay,0777,true); mkdir(GAME_ROOT.'gamedata/replays',0777,true); mkdir(GAME_ROOT.'gamedata/javascript',0777,true);
    file_put_contents(GAME_ROOT.'gamedata/javascript/datalib.current.txt',$in['dictionary']);
    $index=$in['index'];
    foreach ($in['responses'] as $name=>$response) {
        $target=__DIR__.'/response-'.md5($name); file_put_contents($target,$response); $index=str_replace($name.',',$target.',',$index);
    }
    file_put_contents($replay.'/replay.php',$index);
    \replay\post_gameover_events();
    $archive=GAME_ROOT.'gamedata/replays/'.(room_check_subroom($room_prefix)?'s.':'').$gamenum.'.dat';
    echo json_encode(array('archive'=>file_exists($archive)?base64_encode(file_get_contents($archive)):null));
}
`;

async function oracle(t) {
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', timeout: 10_000, windowsHide: true });
  if (version.error?.code === 'ENOENT') { t.skip('Differential oracle requires development-only PHP 7.4; set DTS_REFERENCE_PHP. Native protocol code needs no PHP.'); return null; }
  assert.equal(version.status, 0, version.error?.message || version.stderr);
  if (version.stdout.trim() !== '7.4') { t.skip(`Oracle is PHP ${version.stdout.trim()}; this source baseline uses PHP 7.4.`); return null; }
  const parent = path.join(project, 'var/tests');
  await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'native-protocol-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  for (const source of sources) {
    const target = path.join(root, 'engine', source);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(path.join(project, 'engine', source), target);
  }
  await mkdir(path.join(root, 'engine/include/modulemng'), { recursive: true });
  await copyFile(path.join(project, 'engine/include/modulemng/modulemng.config.sample.php'), path.join(root, 'engine/include/modulemng/modulemng.config.php'));
  const script = path.join(root, 'oracle.php');
  await writeFile(script, phpFixture);
  return input => {
    const result = spawnSync(executable, ['-d', 'display_errors=stderr', script], { input: JSON.stringify(input), encoding: 'utf8', timeout: 20_000, windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
    assert.equal(result.status, 0, result.error?.message || result.stderr);
    assert.equal(result.stderr, '', result.stderr);
    return JSON.parse(result.stdout);
  };
}

test('native protocol round trips and rejects values that would lose precision', () => {
  const sparse = []; sparse[0] = '水'; sparse[3] = '刀';
  const payload = { 玩家: '电波😀', items: sparse, bool: false, null: null, empty: [], path: '/game/\n' };
  assert.deepEqual(gdecode(gencode(payload)), { ...payload, items: { 0: '水', 3: '刀' } });
  assert.equal(protocolJson(new Map([['z', 1], [3, '三'], [0, '零']])), '{"z":1,"3":"\\u4e09","0":"\\u96f6"}');
  assert.equal(base64EncodeNumber(4095, 1), '-');
  assert.throws(() => base64EncodeNumber(2 ** 53, 10), /safe integers/);
  assert.throws(() => base64DecodeNumber('----------'), /precision/);
  assert.throws(() => gdecode(gzipSync('{"value":9007199254740993}').toString('base64')), /precision/);
  assert.throws(() => gencode({ value: Infinity }), /finite/);
  assert.throws(() => gencode({ value: '\ud800' }), /Unicode/);
  const cycle = {}; cycle.self = cycle;
  assert.throws(() => gencode(cycle), /recursive/);
  assert.deepEqual(gdecode(''), []);
  assert.deepEqual(gdecode('0'), []);
  assert.equal(gdecode('corrupt'), null);
  const bmp = genBmp([[255, 0, 0]], 1, 1);
  assert.equal(bmp.length, 59);
  assert.equal(bmp.readUInt32LE(2), 57);
  assert.deepEqual([...bmp.subarray(54)], [0, 0, 255, 0, 0]);
  assert.throws(() => unfold(Buffer.from('../escape;4;abcd')), /basename/);
  assert.throws(() => unfold(Buffer.from('file;99;abcd')), /Truncated/);
  assert.throws(() => fold([['../escape', 'value']]), /basename/);
});

test('native numeric, wire, click, color and BMP algorithms match unchanged PHP 7.4', async t => {
  const run = await oracle(t); if (!run) return;
  const input = {
    action: 'functions',
    numbers: [0, 1, 25, 26, 51, 52, 61, 62, 63, 64, 4095, 2147483647, 4294967295, Number.MAX_SAFE_INTEGER].flatMap(value => [0, 1, 8, 10].map(width => [value, width])),
    characters: [...'azAZ09+-/?电'],
    paths: ['', '.', '..', 'e', '.e.', '0', '001.999', '1..2.', '0000', '１', '1\n', 'a', '-1', ' 1'],
    clicks: ['', 'e,1.2.3,invalid,2.5,9999,3.4', ',.,,1..2,e,', Array.from({ length: 20 }, (_, index) => `${index}.1`).join(','), `${'1.'.repeat(101)},0.1`],
    colors: [[-1, 127.5, 280], [0.49, 0.5, 0.51], [254.5, -0.5, 255], [44.1, 79.9, 132]],
    names: ['', '中文角色', '玩家😀', ...Array.from({ length: 400 }, (_, index) => `player-${index}`)],
    bitmaps: [1, 2, 3, 4, 5, 13].flatMap(width => [1, 2].map(height => ({ width, height, pixels: Array.from({ length: width * height }, (_, index) => [index * 71 % 256, index * 121 % 256, index * 139 % 256]) }))),
    payload: { 玩家: '中文电波😀', items: { 0: '水', 3: '★测试武器★' }, hp: 117, fraction: 1.25, small: 0.00001, slash: '</p>', false: false, null: null, empty: [] },
  };
  input.peer = gencode(input.payload);
  const expected = run(input);
  assert.deepEqual(input.numbers.map(([value, width]) => { const code = base64EncodeNumber(value, width); return [code, base64DecodeNumber(code)]; }), expected.numbers);
  assert.deepEqual(Array.from({ length: 66 }, (_, index) => base64CharEncode(index - 1)), expected.characters);
  assert.deepEqual(input.characters.map(base64CharDecode), expected.decodedCharacters);
  assert.deepEqual(input.paths.map(replayValidifyRecord), expected.paths);
  assert.deepEqual(input.clicks.map(replayClicks), expected.clicks);
  assert.deepEqual(input.clicks.map(value => gdecode(replayRecordOp(value))), expected.clicks);
  assert.deepEqual(input.colors.map(value => getHtmlColor(...value)), expected.colors);
  assert.deepEqual(input.names.map(getIdentTextcolor), expected.identColors);
  assert.deepEqual(input.bitmaps.map(({ pixels, width, height }) => genBmp(pixels, width, height).toString('base64')), expected.bitmaps);
  assert.equal(protocolJson(input.payload), expected.json);
  assert.equal(mgzdecode(Buffer.from(input.peer, 'base64')).toString(), expected.json);
  assert.deepEqual(gdecode(expected.encoded), input.payload);
  assert.deepEqual(expected.peerDecoded, input.payload);
  // Exercise the shipped browser decoder unchanged. This detects incompatibility
  // that a Node-only round trip would miss (notably non-ASCII JSON handling).
  const sandbox = { window: {} };
  vm.runInNewContext(await readFile(path.join(project, 'engine/include/javascript/gzip.util.js'), 'utf8'), sandbox);
  assert.deepEqual(JSON.parse(sandbox.window.JXG.decompress(input.peer)), input.payload);
});

test('both replay container generations cross-decode with unchanged PHP', async t => {
  const run = await oracle(t); if (!run) return;
  const entries = new Map([
    ['s.402.rep.index', Buffer.from('102,101,')],
    ['s.402.101.replay.header.js', Buffer.from('中文😀 / replay_header = {};\n')],
    ['s.402.101.rep.bmp', genBmp([[255, 0, 0], [0, 255, 0], [0, 0, 255]], 3, 1)],
    ['empty.js', Buffer.alloc(0)],
  ]);
  const encodedEntries = Object.fromEntries([...entries].map(([name, data]) => [name, data.toString('base64')]));
  const peers = [fold(entries), fold(entries, { legacy: true })];
  const expected = run({ action: 'archive', entries: encodedEntries, peers: peers.map(bytes => bytes.toString('base64')) });
  for (const bytes of [Buffer.from(expected.current, 'base64'), Buffer.from(expected.legacy, 'base64'), ...peers]) assert.deepEqual(unfold(bytes), entries);
  assert.deepEqual(expected.peers, [encodedEntries, encodedEntries]);
  assert.equal(fold([]), false);
});

function evaluatePlayer(files, base) {
  const calls = [];
  const scope = { JXG: { decompress: value => mgzdecode(Buffer.from(String(value), 'base64')).toString() }, replayload_progressbar: value => calls.push(['progress', value]), jQuery: { cachedScript: value => calls.push(['load', value]) }, replay_init: () => calls.push(['init']) };
  const context = vm.createContext(scope);
  vm.runInContext(files.get(`${base}.replay.header.js`).toString(), context);
  vm.runInContext(files.get(`${base}.replay.oprecord.js`).toString(), context);
  for (let part = 0; part < scope.replay_header.replay_datapart; part++) vm.runInContext(files.get(`${base}.replay.data.${part}.js`).toString(), context);
  return JSON.parse(JSON.stringify({ header: scope.replay_header, clicks: scope.replay_oprecord, data: scope.replay_data, calls }));
}

test('native replay files preserve PHP archive parts, clicks, thumbnail and browser sequence', async t => {
  // 199/200 responses straddle the original count+protection-header boundary.
  for (const count of [0, 1, 199, 200, 205]) await t.test(`${count} responses`, async t => {
    const run = await oracle(t); if (!run) return;
    const responses = new Map();
    let index = REPLAY_INDEX_HEADER;
    for (let operation = 0; operation < count; operation++) {
      const response = `response-${operation}`;
      responses.set(response, gencode({ innerHTML: { main: `<p>录像 ${operation}</p>` }, value: { hp: 100 - operation }, src: [], timing: operation }));
      index += replayIndexLine({ clicks: '1.2,e,invalid', requestStart: 1000 - 8 * 3600 - 30 * 60 + operation * 0.25, gameStart: 1000, offsetHours: 8, offsetMinutes: 30, response });
    }
    const input = { gameNumber: 402, roomPrefix: 's7', playerId: 101, playerName: '录像甲', duration: count === 199 ? 2500 : count === 200 ? 3500 : count === 205 ? 1800 : 300, dictionary: 'datalib.fixture.js', index, responses, partSize: 200 };
    const native = buildReplayPlayerFiles(input);
    const expected = run({ action: 'build', ...input, responses: Object.fromEntries(responses), winmode: 2, gametype: 10, highDamage: 0, validPlayers: 2, ignoredModes: [] });
    const reference = unfold(Buffer.from(expected.archive, 'base64'));
    assert.deepEqual(evaluatePlayer(native.files, 's.402.101'), evaluatePlayer(reference, 's.402.101'));
    assert.deepEqual(native.files.get('s.402.101.rep.bmp'), reference.get('s.402.101.rep.bmp'));
    const nativeMeta = native.files.get('s.402.101.rep').toString().split(',');
    const referenceMeta = reference.get('s.402.101.rep').toString().split(',');
    assert.deepEqual(nativeMeta.filter((_, index) => index !== 3), referenceMeta.filter((_, index) => index !== 3));
    assert.equal(native.operationCount, count + 1);
    assert.equal(native.header.replay_datapart, Math.ceil((count + 1) / 200));
    const evaluated = evaluatePlayer(native.files, 's.402.101');
    assert.equal(evaluated.data.length, count + 1);
    assert.deepEqual(evaluated.data.at(-1), []);
    assert.deepEqual(parseReplayIndex(index).operations.map(value => value.time), Array.from({ length: count }, (_, operation) => operation * 0.25));
  });
});

test('native archive eligibility preserves success and excluded end conditions', async t => {
  const cases = [
    [1, 0, 400, 2, false], [1, 0, 401, 0, true], [1, 10, 0, 0, true],
    [2, 0, 400, 1, false], [2, 0, 401, 1, true], [2, 0, 0, 2, true],
    [3, 0, 0, 0, true], [4, 0, 999, 9, false], [5, 0, 0, 0, true], [6, 0, 999, 9, false],
    [7, 0, 0, 0, true], [8, 0, 0, 0, true], [8, 10, 400, 9, false], [8, 10, 401, 0, true],
  ];
  for (const [winmode, gametype, highDamage, validPlayers, expected] of cases) {
    assert.equal(shouldArchiveReplay({ winmode, gametype, highDamage, validPlayers }), expected);
    assert.equal(shouldArchiveReplay({ winmode, gametype, highDamage, validPlayers, ignoredModes: [gametype] }), false);
  }
  for (const [name, condition] of [['low activity', { winmode: 2, gametype: 0, highDamage: 400, validPlayers: 1 }], ['GM abort', { winmode: 6, gametype: 0, highDamage: 999, validPlayers: 9 }], ['excluded mode', { winmode: 7, gametype: 9, highDamage: 999, validPlayers: 9, ignoredModes: [9] }]]) await t.test(name, async t => {
    const run = await oracle(t); if (!run) return;
    const result = run({ action: 'build', gameNumber: 401, roomPrefix: '', playerId: 101, playerName: '甲', duration: 300, dictionary: 'dict.js', index: REPLAY_INDEX_HEADER, responses: {}, partSize: 200, ignoredModes: [], ...condition });
    assert.equal(result.archive, null);
  });
  assert.throws(() => replayThumbnail([], 0), /positive game duration/);
});
