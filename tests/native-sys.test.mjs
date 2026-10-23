import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { sysDefaultState, sysModule } from '../native/gameplay/sys.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { gencode, gdecode, protocolJson } from '../native/protocol/codec.mjs';
import snapshots from '../native/system/sys-config.json' with { type: 'json' };

const project = fileURLToPath(new URL('../', import.meta.url));
const configKeys = [...new Set(Object.values(snapshots).flatMap(Object.keys))];
const news = (nid, time, event = 'newpc', a = '甲', b = '男1号', e = '') => ({ nid: String(nid), time: String(time), news: event, a, b, c: '', d: '', e });
const player = (name, hp = '100', teamID = '', changes = {}) => ({ name, pid: String(name === '甲' ? 1 : 2), hp, type: '0', teamID, killnum: '2', npckillnum: '3', lvl: '5', wp: '10', wk: '100', wg: '0', wc: '0', wd: '0', wf: '0', money: '750', winner_flag: '0', ...changes });
const game = (changes = {}) => ({ groomid: '0', groomtype: '0', groomstatus: '40', gamenum: '9', gametype: '0', gamestate: '40', starttime: '1700000000', alivenum: '2', deathnum: '0', validnum: '2', winnum: '0', winner: '', winmode: '0', hdamage: '100', hplayer: '甲', afktime: '1700000000', arealist: '0,2,1', noisevars: gencode([]), roomvars: gencode([]), gamevars: gencode([]), ...changes });
const stateBase = () => ({ ...sysDefaultState(), gtablepre: 'fixture_', tablepre: 'fixture_', ctablepre: 'fixture_', wtablepre: 'fixture_', now: 1700000300, gameinfo: game(), ...game(), arealist: ['0', '2', '1'], noisevars: [], roomvars: [], gamevars: [], hnewsstorage: 1, teamwin_mode: [13], qiegao_ignore_mode: [15] });
const outputFields = ['now', 'sec', 'min', 'hour', 'day', 'month', 'year', 'wday', 'gameinfo', 'groomid', 'groomtype', 'groomstatus', 'gamenum', 'gametype', 'gamestate', 'starttime', 'alivenum', 'deathnum', 'validnum', 'winnum', 'winner', 'winmode', 'hdamage', 'hplayer', 'afktime', 'arealist', 'noisevars', 'roomvars', 'gamevars', 'gameover_plist', 'gameover_ulist', 'plock', 'room_id', 'room_prefix', 'tablepre', 'ctablepre', 'wtablepre', 'u_templateid', 'new_messages', 'userdb_forced_local', 'cudata', 'cuser', 'cpass', 'mode', 'command', 'fixture_user', 'fixture_pass', 'fixture_roomid', 'starthour', 'startmin'];

// These test boundaries expose the original SQL, file operations and user/player
// calls. They do not simulate SQL execution, OS locking, durable user storage,
// HTTP filtering or any other module's game mechanics.
async function runNative(input, modifications = {}) {
  const state = { ...stateBase(), ...structuredClone(input.state ?? {}) }, trace = [], rows = structuredClone(input.rows ?? []);
  const states = { sys: state, input: structuredClone(input.input ?? {}), player: { pls: '2', sdata: [], ...structuredClone(input.playerState ?? {}) }, map: { plsinfo_disp: ['无月之影', '广场', '北门', '森林'] } };
  const serviceTrace = (operation, ...args) => { trace.push([operation, ...structuredClone(args)]); };
  const services = {
    database: {
      async query(sql) { serviceTrace('query', sql); return rows.shift() ?? []; },
      async execute(sql) { serviceTrace('execute', sql); return { affectedRows: 1 }; },
      async queries(sql) { serviceTrace('queries', sql); return []; },
      async arrayInsert(...args) { serviceTrace('arrayInsert', ...args); return true; },
      async arrayUpdate(...args) { serviceTrace('arrayUpdate', ...args); return { affectedRows: 1 }; },
    },
    system: {
      request: input.request ?? {},
      clock: { async now() { return 1700000300; } },
      locks: { async acquire(file) { serviceTrace('acquire', file); return true; }, async release(file) { serviceTrace('release', file); } },
      files: {
        async read(file) { serviceTrace('read', file); return input.sql ?? 'TRUNCATE bra_players;\r\nDELETE FROM bra_chat;'; },
        async write(...args) { serviceTrace('write', ...args); },
        async touch(file) { serviceTrace('touch', file); },
        async clear(...args) { serviceTrace('clear', ...args); },
      },
      users: {
        async fetchByUsername(...args) { serviceTrace('fetchUser', ...args); return structuredClone(input.user ?? []); },
        async fetchMany(...args) { serviceTrace('fetchUsers', ...args); return structuredClone(input.users ?? []); },
        async updateMany(...args) { serviceTrace('updateUsers', ...args); },
      },
      rooms: { async setCurrentId(id) { serviceTrace('room', id); } },
      messages: { async checkNew(name) { serviceTrace('messages', name); return input.newMessages ?? 0; } },
    },
    output: { async take() { serviceTrace('take'); return 'buffer'; } },
    ...modifications,
  };
  const ctx = {
    services, state: (name = 'sys') => states[name], hasModule: name => Object.hasOwn(states, name),
    async call(namespace, fn, ...args) {
      if (namespace === 'player') {
        if (fn === 'fetch_playerdata') { serviceTrace('playerFetch', ...args); return structuredClone(input.players[args[0]]); }
        if (fn === 'player_save') { serviceTrace('playerSave', ...args); return; }
        throw new Error(`Unexpected player dependency ${fn}`);
      }
      assert.equal(namespace, 'sys');
      if (fn === 'user_set_gamevars_list_init' && input.registered) return structuredClone(input.registered);
      return sysModule.functions[fn](ctx, ...args);
    },
  };
  const result = [];
  if (input.initialize) await sysModule.initialize(ctx);
  for (const [name, ...raw] of input.calls ?? []) {
    const args = structuredClone(raw);
    result.push({ value: (await ctx.call('sys', name, ...args)) ?? null, args });
  }
  return { result, trace, state: Object.fromEntries(outputFields.map(key => [key, state[key] ?? null])), remainingRows: rows.length };
}

const fixture = String.raw`<?php
namespace sys {
    function get_now() { return 1700000300 + (int)$GLOBALS['moveut']*3600 + (int)$GLOBALS['moveutmin']*60; }
    function check_lock($dir,$file,$timeout=0,$key='') { return false; }
    function create_lock($dir,$file,$key='') { $GLOBALS['trace'][]=array('acquire',\relative($dir.$file)); return true; }
    function release_lock($dir,$file,$key='') { $GLOBALS['trace'][]=array('release',\relative($dir.$file)); }
    function file_get_contents($file) { $GLOBALS['trace'][]=array('read',\relative($file)); return $GLOBALS['input']['sql']??"TRUNCATE bra_players;\r\nDELETE FROM bra_chat;"; }
    function writeover($file,$data,$mode='wb') { $GLOBALS['trace'][]=array('write',\relative($file),$data,$mode); }
    function touch($file) { $GLOBALS['trace'][]=array('touch',\relative($file)); }
    function clear_dir($file,$keep=0,$expire=0) { $GLOBALS['trace'][]=array('clear',\relative($file),array('keepRoot'=>(bool)$keep,'expireSeconds'=>$expire)); }
    function ob_clean() { $GLOBALS['trace'][]=array('take'); }
    function ob_start() {}
    function set_current_roomid($id) { $GLOBALS['trace'][]=array('room',$id); }
    function fetch_udata_by_username($name) { $GLOBALS['trace'][]=array('fetchUser',$name,array('forcedLocal'=>$GLOBALS['userdb_forced_local'])); return $GLOBALS['input']['user']??array(); }
    function fetch_udata_multilist(...$args) { $GLOBALS['trace'][]=array_merge(array('fetchUsers'),$args); return $GLOBALS['input']['users']??array(); }
    function update_udata_multilist(...$args) { $GLOBALS['trace'][]=array_merge(array('updateUsers'),$args); }
    function message_check_new($name) { $GLOBALS['trace'][]=array('messages',$name); return $GLOBALS['input']['newMessages']??0; }
}
namespace player {
    function fetch_playerdata($name) { $GLOBALS['trace'][]=array('playerFetch',$name); return $GLOBALS['input']['players'][$name]; }
    function player_save(&$data) { $GLOBALS['trace'][]=array('playerSave',$data); }
}
namespace fixture_sys {
    function user_set_gamevars_list_init($registered=array()) { if(eval(__MAGIC__)) return $___RET_VALUE; return $GLOBALS['input']['registered']; }
}
namespace {
    define('IN_GAME',true); define('IN_MODULEMNG',true); define('MOD_SYS',true); define('MOD_INPUT',true); define('MOD_PLAYER',true); define('GAME_ROOT',__DIR__.'/engine/');
    require_once GAME_ROOT.'include/global.func.php'; require_once GAME_ROOT.'include/bubblebox.func.php'; require_once GAME_ROOT.'include/roommng/room.func.php'; require_once GAME_ROOT.'include/modules/modules.func.php';
    foreach(array('global','gamectl','init','news') as $source) require GAME_ROOT.'include/modules/core/sys/'.$source.'.php';
    $input=json_decode(stream_get_contents(STDIN),true); $trace=array(); $rows=$input['rows']??array();
    date_default_timezone_set('Etc/GMT');
    foreach($input['configs'] as $source) require GAME_ROOT.'include/modules/core/sys/config/'.$source;
    if(!empty($input['configOnly'])) { $config=array(); foreach($input['configKeys'] as $key) $config[$key]=$GLOBALS[$key]; echo json_encode($config,JSON_UNESCAPED_UNICODE); exit; }
    foreach($input['base'] as $key=>$value) $GLOBALS[$key]=$value;
    foreach($input['state']??array() as $key=>$value) $GLOBALS[$key]=$value;
    $keys=array_unique(array_merge(array_keys($input['base']),array_keys($input['state']??array()),$input['outputFields'],array('db')));
    define('IMPORT_MODULE_SYS_GLOBALS','global $'.implode(',$',$keys).';');
    define('IMPORT_MODULE_PLAYER_GLOBALS','global $sdata;'); define('IMPORT_MODULE_MAP_GLOBALS','global $plsinfo_disp;');
    $sdata=$input['playerState']['sdata']??array(); $___LOCAL_PLAYER__VARS__pls=$input['playerState']['pls']??'2';
    $plsinfo_disp=array('无月之影','广场','北门','森林');
    $___LOCAL_INPUT__VARS__INPUT_VAR_LIST=$input['input']['INPUT_VAR_LIST']??array();
    $___LOCAL_INPUT__VARS__mode=$input['input']['mode']??null; $___LOCAL_INPUT__VARS__command=$input['input']['command']??null;
    $_COOKIE=$input['request']['cookies']??array(); $_POST=$input['request']['post']??array();
    if(isset($input['request']['script'])) define('CURSCRIPT',$input['request']['script']);
    $___MOD_SRV=$input['request']['daemon']??false;
    if(!empty($input['request']['loadCoreOnly'])) define('LOAD_CORE_ONLY',true);
    function relative($path) { return str_replace(str_replace('\\','/',GAME_ROOT).'./','',str_replace('\\','/',$path)); }
    class Rows { public $rows; public $offset=0; function __construct($rows) { $this->rows=$rows; } }
    class FixtureDB {
        function query($sql) { if(preg_match('/^SELECT /',$sql)) { $GLOBALS['trace'][]=array('query',$sql); return new Rows(array_shift($GLOBALS['rows'])??array()); } $GLOBALS['trace'][]=array('execute',$sql); return true; }
        function num_rows($result) { return count($result->rows); }
        function fetch_array($result) { return $result->rows[$result->offset++]??false; }
        function result($result,$index) { return isset($result->rows[$index])?array_values($result->rows[$index])[0]:false; }
        function array_insert(...$args) { $GLOBALS['trace'][]=array_merge(array('arrayInsert'),$args); return true; }
        function array_update(...$args) { $GLOBALS['trace'][]=array_merge(array('arrayUpdate'),$args); return true; }
        function queries(...$args) { $GLOBALS['trace'][]=array_merge(array('queries'),$args); }
    }
    $db=new FixtureDB();
    foreach(get_defined_functions()['user'] as $function) if(strpos($function,'sys\\')===0 && !in_array(substr($function,4),array('init','get_now','check_lock','create_lock','release_lock','file_get_contents','writeover','touch','clear_dir','ob_clean','ob_start','set_current_roomid','fetch_udata_by_username','fetch_udata_multilist','update_udata_multilist','message_check_new'))) hook_register('sys',substr($function,4));
    if(!empty($input['functionsOnly'])) { echo json_encode(array_keys($module_hook_list)); exit; }
    if(isset($input['registered'])) hook_register('fixture_sys','user_set_gamevars_list_init');
    if(!empty($input['initialize'])) \sys\init();
    $out=array();
    foreach($input['calls']??array() as $call) {
        $name=array_shift($call); $fn='sys\\'.$name;
        $retval=$fn(...$call); $out[]=array('value'=>$retval,'args'=>$call);
    }
    $state=array(); foreach($input['outputFields'] as $key) $state[$key]=$GLOBALS[$key]??null;
    if(!empty($state['plock'])) $state['plock'][0]=relative($state['plock'][0]);
    echo json_encode(array('result'=>$out,'trace'=>$trace,'state'=>$state,'remainingRows'=>count($rows)),JSON_UNESCAPED_UNICODE);
}
`;

function canonical(value) {
  if (value instanceof Map) return canonical(JSON.parse(protocolJson(value)));
  if (typeof value === 'string') {
    if (/^H4sI[A-Za-z0-9+/=]+$/.test(value)) return { encoded: canonical(gdecode(value)) };
    return value.replace(/H4sI[A-Za-z0-9+/=]+/g, encoded => `encoded(${protocolJson(gdecode(encoded))})`);
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value).map(([key, item]) => [key, canonical(item)]);
    return Array.isArray(value) && entries.every(([key], i) => key === String(i)) ? entries.map(([, item]) => item) : Object.fromEntries(entries);
  }
  return value;
}

async function oracle(t) {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', timeout: 10_000, windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout.trim() !== '7.4') { t.skip('Development-only PHP 7.4 oracle unavailable; set DTS_REFERENCE_PHP.'); return; }
  assert.equal(version.status, 0, version.error?.message || version.stderr);
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'native-sys-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  const sources = ['include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', 'include/roommng/room.func.php', 'include/modules/modules.func.php', ...['global.php', 'gamectl.php', 'init.php', 'news.php', ...Object.keys(snapshots).map(file => `config/${file}`)].map(file => `include/modules/core/sys/${file}`)];
  for (const source of sources) { const target = path.join(root, 'engine', source); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', source), target); }
  await mkdir(path.join(root, 'engine/include/modulemng'), { recursive: true });
  await copyFile(path.join(project, 'engine/include/modulemng/modulemng.config.sample.php'), path.join(root, 'engine/include/modulemng/modulemng.config.php'));
  const file = path.join(root, 'oracle.php'); await writeFile(file, fixture);
  return input => {
    const result = spawnSync(executable, ['-d', 'display_errors=stderr', '-d', 'error_reporting=22519', file], { input: JSON.stringify({ base: stateBase(), configs: Object.keys(snapshots), configKeys, outputFields, ...input }), encoding: 'utf8', timeout: 10_000, windowsHide: true, maxBuffer: 8 * 1024 * 1024 });
    assert.equal(result.status, 0, result.error?.message || result.stderr);
    try { return JSON.parse(result.stdout); } catch (error) { assert.fail(`PHP oracle emitted invalid JSON: ${result.stderr}\n${result.stdout.slice(0, 200)}`); }
  };
}

test('native sys config preserves every original scalar, array key and resource string', async t => {
  const reference = await oracle(t); if (!reference) return;
  const expected = reference({ configOnly: true });
  const actual = Object.fromEntries(configKeys.map(key => [key, sysDefaultState()[key]]));
  // A hash avoids accidentally exposing server configuration in failure output.
  const digest = value => createHash('sha256').update(protocolJson(value)).digest('hex');
  for (const key of configKeys) assert.equal(digest(actual[key]), digest(expected[key]), `source config ${key}`);
  assert.deepEqual(Object.keys(sysModule.functions).sort(), reference({ functionsOnly: true }).sort(), 'all executable functions from the four original files');
});

test('native sys global state, news and chat agree with actual PHP source', async t => {
  const reference = await oracle(t); if (!reference) return;
  const cases = [
    { label: 'load, audit, first save and combat-only save', state: { alivenum: -4, deathnum: -3, afktime: 0, hdamage: '', hplayer: '' }, calls: [['save_gameinfo'], ['save_combatinfo']] },
    { label: 'load decodes all fields', rows: [game({ roomvars: gencode({ nested: ['a', 2] }) })].map(row => [row]), calls: [['load_gameinfo']] },
    { label: 'save absent game header does nothing', state: { gamenum: null }, calls: [['save_gameinfo']] },
    { label: 'locked routine and no-op hooks', rows: [[game()]], calls: [['routine'], ['updategame'], ['prepare_new_game'], ['rs_game', 1], ['post_gameover_events'], ['post_winnercheck_events', '甲']] },
    { label: 'repeated process lock has null result', calls: [['process_lock', true], ['process_lock'], ['process_unlock'], ['process_unlock']] },
    { label: 'news death defaults and lastword chat', rows: [[{ lastword: '遗言' }], [{ lastword: '', pls: '3' }]], calls: [['addnews', 0, 'death11', '甲', 0, 0], ['addnews', 12, 'death16', '乙'], ['addnews', 0, 'custom', ['甲', '乙'], 'b', 'c', 'd', 'e'], ['addchat', '1', '消息', '甲', 'team', 0, '3']] },
    { label: 'getchat escapes and expands original emoticons', rows: [[{ cid: '8', type: '0', msg: `[${Object.keys(sysDefaultState().emoticon_list)[0]}]<script>"'&`, send: '甲', time: '1700000300', pls: '2' }, { cid: '7', type: '3', msg: '', send: '乙', time: '1700000200', pls: '3' }], []], calls: [['getchat', 2, '队伍', '1'], ['getchat', '8', 'all', 0, 2]] },
    { label: 'chat all eight types and original preset text', calls: Array.from({ length: 8 }, (_, type) => ['parse_chat', { cid: type, type: String(type), msg: `[${Object.keys(sysDefaultState().on_premise_chat)[0]}]`, send: '甲', time: 1700000300, pls: '2' }]) },
    { label: 'all system chat messages', calls: ['areaadd', 'areawarn', 'combo', 'comboupdate', 'duel', 'newgame', 'gameover', 'hack', 'hack2', 'hack3', 'hack4', 'other'].map(name => ['systemputchat', 0, name, name.startsWith('area') ? [1, 2] : '测试']) },
    { label: 'settings hooks by reference and whole-array replacement', registered: ['keep', 'mode'], state: { gamevars: { keep: 3, stale: 'old' }, gamevarsinfo: { keep: '旧值', mode: '模式' } }, calls: [['user_set_gamevars', { keep: 4, mode: { x: 2 }, ignored: 1 }], ['user_display_gamevars_setting', { setting: 1 }], ['user_set_gamevars_process', 'mode', ['7'], {}]] },
    { label: 'news day transitions and room prefix SQL', state: { groomtype: '1' }, rows: [[news(5, 1700086700), news(4, 1700000300, 'death16', '甲', '1', '再见'), news(3, 1699913900, 'unknown')], [news(5, 1700086700)], []], calls: [['load_news', 1, 20, 0, 's2'], ['getnews', 1, 10], ['getnews', '5']] },
    { label: 'all base news render branches and imported time rebinding', state: { hour: '21', min: '54', sec: '09' }, calls: ['newgame', 'gameover', 'newpc', 'newgm', ...Array.from({ length: 9 }, (_, i) => `end${i}`), 'wintutorial', 'death15', 'death16', 'death99', 'corpseclear', 'sysaddarea', 'alive', 'delcp', 'editpc', 'roominfo', 'unknown'].map(name => ['parse_news', '3', name, '12', '03', '04', '甲', '乙', 'c', 'd', 'e', { dword: '<em>遗言</em>' }]).concat([0, 1].map(value => ['parse_news', 3, 'syshackchg', 12, 3, 4, value, '', '', '', '']), [20, 30, 40, 50, 99].map(value => ['parse_news', 3, 'sysgschg', 12, 3, 4, value, '', '', '', '']), [['parse_news_prepare', 3, 'death15', 12, 3, 4, '甲', '1', '', '', ''], ['get_valid_disp_user_info', { name: '甲', gd: 'm', sNo: '12' }]]) },
  ];
  for (const input of cases) await t.test(input.label, async () => assert.deepEqual(canonical(await runNative(input)), canonical(reference(input))));
});

test('native sys scheduling, reset, teams and full gameover agree with PHP source', async t => {
  const reference = await oracle(t); if (!reference) return;
  const people = { 甲: player('甲'), 乙: player('乙', '0') };
  const users = Object.fromEntries(Object.keys(people).map(name => [name, { username: name, validgames: '3', wingames: '1', lastwin: '100', credits: '10', gold: '1', u_achievements: '', private_unused: 'removed' }]));
  const cases = [
    { label: 'main reset keeps only registered variables', state: { gametype: 13, gamevars: { keep: 'yes', drop: 5 } }, registered: ['keep'], rows: [[{ gid: '20' }]], calls: [['reset_game']] },
    { label: 'room reset preserves room type and gametype', state: { groomid: '2', room_id: '2', room_prefix: 's2', tablepre: 'fixture_s2_', wtablepre: 'fixture_s', gametype: '13', roomvars: { value: 1 } }, rows: [[]], calls: [['reset_game']] },
    ...[0, 1, 2, 3, 99].map(startmode => ({ label: `start schedule mode ${startmode}`, state: { startmode, starthour: 0, startmin: 40, now: 1700000400 }, calls: [['rs_sttime']] })),
    { label: 'invalid schedule configuration and disabled room', state: { startmode: 2, starthour: -2, startmin: -2 }, calls: [['rs_sttime']] },
    { label: 'subroom schedule never starts', state: { startmode: 3, room_prefix: 's2' }, calls: [['rs_sttime']] },
    { label: 'team winner preserves SQL string IDs', rows: [[], [{ teamID: '' }], [{ teamID: '' }, { teamID: '' }], [{ teamID: '1' }, { teamID: '1' }], [{ teamID: '1' }, { teamID: '2' }]], calls: Array.from({ length: 5 }, () => ['check_alivelist_teamwin']) },
    { label: 'credit parameters are rebound to exported winner and mode', calls: [0, 1, 2, 3, 5, 7, 8].flatMap(mode => ['甲', '甲,乙', '丙'].flatMap(winner => [['gameover_get_credit_up', people.甲, winner, mode], ['gameover_get_gold_up', people.甲, winner, mode]])).concat([['gameover_get_credit_up', player('甲', '0', '', { wp: '100000', money: '2000000', lvl: '-3' })], ['get_gameover_udata_update_fields'], ['is_winner', '1', '01,02']]) },
    ...[0, 1, 2, 3, 5, 7, 8].map(winmode => ({ label: `credit/gold winner rewards mode ${winmode}`, state: { winner: '甲,乙', winmode }, calls: [['gameover_get_credit_up', people.甲], ['gameover_get_gold_up', people.甲], ['gameover_get_credit_up', player('丙', '100')], ['gameover_get_gold_up', player('丙', '0')], ['gameover_get_credit_up', player('甲', '0', '', { money: '2000000', wp: '100000' })]] })),
    { label: 'ignored mode never awards currency or participation', state: { gametype: '15', gameover_plist: people, gameover_ulist: users, winner: '甲', winmode: 2 }, calls: [['gameover_set_credits']] },
    { label: 'team winner string does not increment individual wins', state: { gameover_plist: people, gameover_ulist: users, winner: '甲,乙', winmode: 2 }, calls: [['gameover_set_credits']] },
  ];
  const full = (label, changes = {}) => ({ label, players: people, users, rows: [[game()], [{ name: '甲' }, { name: '乙' }], [{ gid: '12' }], [{ name: '甲', killnum: '2' }], [news(10, 1700000300, 'end2'), news(9, 1700000000, 'newgame')]], calls: [['gameover']], ...changes });
  cases.push(
    full('single survivor full persistence and rewards'),
    full('specified end and winner with file history', { state: { hnewsstorage: 0 }, calls: [['gameover', 1700000250, 'end3', '乙']] }),
    full('all dead retains upstream AND update SQL', { players: { 甲: player('甲', '0'), 乙: player('乙', '0') } }),
    full('GM stop mode preserves scalar string type', { calls: [['gameover', 0, 'end6']] }),
    full('team victory includes dead teammates', { players: { 甲: player('甲', '100', '1'), 乙: player('乙', '0', '1') }, rows: [[game({ gametype: '13' })], [{ name: '甲' }, { name: '乙' }], [{ teamID: '1' }], [{ gid: '12' }], [{ name: '甲', killnum: '2' }], []] }),
    full('team mode solo survivor without team', { rows: [[game({ gametype: '13' })], [{ name: '甲' }, { name: '乙' }], [{ teamID: '' }], [], [{ name: '甲', killnum: '2' }], []] }),
    full('explicit team victory', { players: { 甲: player('甲', '100', '2'), 乙: player('乙', '0', '2') }, rows: [[game({ gametype: '13' })], [{ name: '甲' }, { name: '乙' }], [], [{ name: '甲', killnum: '2' }], []], calls: [['gameover', 0, 'end7', '甲']] }),
    full('no participants', { rows: [[game()], [], [], []] }),
    full('unprepared game early return retains request lock', { rows: [[game({ gamestate: '0' })]] }),
    full('two survivors early return', { players: { 甲: player('甲'), 乙: player('乙') }, rows: [[game()], [{ name: '甲' }, { name: '乙' }]] }),
    full('missing user storage response early return', { users: [], rows: [[game()], [{ name: '甲' }, { name: '乙' }]] }),
    full('two teams early return', { players: { 甲: player('甲', '100', '1'), 乙: player('乙', '100', '2') }, rows: [[game({ gametype: '13' })], [{ name: '甲' }, { name: '乙' }], [{ teamID: '1' }, { teamID: '2' }]] }),
  );
  for (const names of [['10', '2'], ['0', '1'], ['__proto__', 'constructor'], ['length', 'toString']]) {
    const numericPeople = Object.fromEntries(names.map(name => [name, player(name, '100', '1')]));
    const numericUsers = Object.fromEntries(names.map(name => [name, { ...users.甲, username: name }]));
    cases.push(full(`arbitrary username keys ${names.join('/')}`, { players: numericPeople, users: numericUsers, rows: [[game({ gametype: '13' })], names.map(name => ({ name })), names.map(() => ({ teamID: '1' })), [], [], []] }));
  }
  for (const input of cases) await t.test(input.label, async () => assert.deepEqual(canonical(await runNative(input)), canonical(reference(input))));
});

test('native sys initialization preserves cookie, input and room selection priority', async t => {
  const reference = await oracle(t); if (!reference) return;
  const cases = [
    { label: 'anonymous main room', rows: [[game()], [game()]], input: { mode: 'command', command: 'move' } },
    { label: 'cookie login forced local and stored template', request: { script: 'game', cookies: { fixture_user: '甲', fixture_pass: 'hash', fixture_roomid: '3', ignored: 'x' } }, user: { u_templateid: 'modern' }, newMessages: '2', rows: [[game({ groomid: '3', gamestate: '0', groomstatus: '20' })]] },
    { label: 'daemon input overrides cookies, POST template and mode', request: { daemon: true, script: 'chat', cookies: { fixture_user: 'cookie', fixture_pass: 'cookie-hash', fixture_roomid: '1', templateid: 'old' }, post: { templateid: 'post' } }, input: { mode: 'direct', command: 'direct', INPUT_VAR_LIST: { fixture_user: '甲', fixture_pass: 'new-hash', fixture_roomid: '1', templateid: 'input', ___GAME_ROOMID: '2suffix', mode: 'command', command: 'search' } }, rows: [[game({ groomid: '2' })]] },
    { label: 'missing room falls back to main', request: { cookies: { fixture_roomid: '5' } }, rows: [[], [game()]] },
    { label: 'closed room falls back without rewriting cookie', request: { cookies: { fixture_roomid: '5' } }, rows: [[game({ groomid: '5', groomstatus: '0' })], [game()]] },
    { label: 'zero template falls back to saved user preference', request: { cookies: { fixture_user: '甲', templateid: '0' } }, user: { u_templateid: 'classic' }, rows: [[game()], [game()]], state: { moveut: 2, moveutmin: -15 } },
  ];
  for (const item of cases) { const input = { ...item, initialize: true }; await t.test(item.label, async () => assert.deepEqual(canonical(await runNative(input)), canonical(reference(input)))); }
});

test('native sys requires real host capabilities and fails missing storage or locks', async () => {
  await assert.rejects(runNative({ initialize: true }, { system: {} }), /system.request/);
  await assert.rejects(runNative({ initialize: true }, { database: {} }), /connected database/);
  await assert.rejects(runNative({ initialize: true, rows: [[], []] }), /Main game state row is missing/);
  await assert.rejects(runNative({ calls: [['process_lock']] }, { system: { locks: { async acquire() { return false; } } } }), /lock acquisition failed/);
  await assert.rejects(runNative({ calls: [['process_lock']] }, { system: {} }), /system.locks.acquire/);
  await assert.rejects(runNative({ calls: [['save_gameinfo']] }, { database: {} }), /database.arrayUpdate/);
  await assert.rejects(runNative({ calls: [['load_gameinfo']], rows: [[]] }), /Game state row is missing/);
});

test('native sys asynchronous hooks use the registry and preserve base update sequencing', async () => {
  const trace = [];
  const database = {
    async query(sql) { trace.push('query'); return [game()]; },
    async arrayUpdate(table, data, where) { trace.push('update'); assert.equal(data.gamestate, 30); },
  };
  const services = { database, system: {
    config: { gtablepre: 'fixture_' }, request: {}, clock: { async now() { return 1700000300; } },
    locks: { async acquire() { trace.push('lock'); return { token: 'owned' }; }, async release(file, token) { assert.equal(token.token, 'owned'); trace.push('unlock'); } },
  }, output: { async take() {} } };
  const session = await new ModuleRegistry([
    { name: 'input' }, sysModule,
    { name: 'fixture_sys', dependencies: ['sys'], functions: {
      async load_gameinfo_post_work_extra(ctx) { await Promise.resolve(); trace.push('extra'); await ctx.next(); },
      async updategame(ctx) { await Promise.resolve(); await ctx.next(); ctx.state('sys').gamestate = 30; trace.push('hook'); },
    } },
  ]).createSession({ services });
  trace.length = 0;
  await session.call('sys', 'routine');
  assert.deepEqual(trace, ['lock', 'query', 'extra', 'hook', 'update', 'unlock']);
});
