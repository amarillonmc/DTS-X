<?php
// Real upstream archive/read functions, original SQL schema and mysqli driver.
// All files and the randomly named database belong to this isolated test only.
// Connection failures must not print mysqli password arguments in stack traces.
ini_set('zend.exception_ignore_args', '1');
define('IN_GAME', true);
define('IN_MODULEMNG', true);
define('DTS_NODE_RUNTIME', true);
define('MOD_REPLAY', true);
define('GAME_ROOT', '/game/');
define('TEMPLATEID', 1);
define('TPLDIR', './templates/default');
chdir(GAME_ROOT);
require 'include/global.func.php';
require 'include/modules/modules.func.php';
require 'include/modules/core/sys/gamectl.php';
require 'include/modules/extra/misc/replay/main.php';
require 'include/modules/extra/misc/bmp_util/main.php';
require 'include/modules/core/sys/config/gamemode.config.php';
require 'include/roommng/room.func.php';
require_once 'include/bubblebox.func.php';
require 'include/db/db_mysqli.class.php';
require '/runtime/replay-bridge.php';
require '/runtime/request-bridge.php';
$___MOD_CODE_ADV2 = 0;
$___MOD_CODE_ADV3 = 1;
$___MOD_SRV = 0;
$tplrefresh = 1;
define('IMPORT_MODULE_REPLAY_GLOBALS', 'global $partsize;');
define('IMPORT_MODULE_SYS_GLOBALS', 'global $winmode,$gametype,$hdamage,$validnum,$replay_ignore_mode,$db,$wtablepre,$tablepre,$gamenum,$room_prefix,$replay_remote_storage,$replay_remote_send;');
define('MOD_REPLAY_GNUM_DATA', GAME_ROOT.'./include/modules/extra/misc/replay/gnum_data');
define('MOD_REPLAY_GNUM_NO_REPLAY', GAME_ROOT.'./include/modules/extra/misc/replay/gnum_no_replay');
hook_register('sys', 'post_gameover_events');
hook_register('replay', 'post_gameover_events');

function check_replay($condition, $message) {
    if (!$condition) throw new RuntimeException($message);
}
function read_js_payload($file) {
    $js = file_get_contents($file);
    check_replay((bool)preg_match('/new String\(\x27([^\x27]+)\x27\)/', $js, $match), 'Missing compressed JavaScript payload');
    return json_decode(gzdecode(base64_decode($match[1])), true);
}

$credentials = json_decode($_SERVER['DTS_REPLAY_CREDENTIALS'], true);
$fixtureDatabase = $_SERVER['DTS_REPLAY_DATABASE'];
check_replay(preg_match('/^dtsx_replay_[a-f0-9]{16}$/D', $fixtureDatabase), 'Unsafe fixture database name');
check_replay($credentials['host'] === '127.0.0.1' && $credentials['port'] === 33317 && $credentials['database'] === 'dtsx_test', 'Not the dedicated local integration service');
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$control = mysqli_connect($credentials['host'], $credentials['user'], $credentials['password'], '', $credentials['port']);
$actualDir = mysqli_fetch_row(mysqli_query($control, 'SELECT @@datadir'))[0];
$canonicalDir = function($value) { return strtolower(rtrim(str_replace('\\', '/', $value), '/')); };
check_replay($canonicalDir($actualDir) === $canonicalDir($credentials['dataDir']), 'Database service identity does not match the fixture');
mysqli_query($control, 'CREATE DATABASE `'.$fixtureDatabase.'` CHARACTER SET utf8 COLLATE utf8_general_ci');
$db = null;
$results = array();
try {
    mysqli_select_db($control, $fixtureDatabase);
    mysqli_set_charset($control, 'utf8');
    mysqli_query($control, "SET sql_mode=''");
    $sql = '';
    foreach (array('install/bra.install.sql','gamedata/sql/players.sql','gamedata/sql/shopitem.sql','gamedata/sql/reset.sql') as $file) $sql .= "\n".file_get_contents($file);
    $sql = preg_replace('/\bbra_/', 'fixture_', $sql);
    mysqli_multi_query($control, $sql);
    do { if ($result = mysqli_store_result($control)) mysqli_free_result($result); } while (mysqli_more_results($control) && mysqli_next_result($control));
    $dbcharset = 'utf8'; $charset = 'utf-8';
    $db = new dbstuff();
    $db->connect($credentials['host'].':'.$credentials['port'], $credentials['user'], $credentials['password'], $fixtureDatabase);
    $db->query("INSERT INTO fixture_players (pid,name,type) VALUES (101,'录像甲',0),(102,'录像乙',0),(999,'NPC',1)");
    $wtablepre = $tablepre = 'fixture_';
    $replay_remote_storage = ''; $replay_remote_send = 0;
    $page = 'command'; $starttime = 1000; $moveut = 8; $moveutmin = 30;
    $___MOD_TMP_FILE_DIRECTORY = GAME_ROOT.'gamedata/tmp/response/';
    file_put_contents('gamedata/javascript/datalib.current.txt', 'datalib.fixture.js');
    file_put_contents('gamedata/javascript/datalib.fixture.js', '// isolated archive dictionary');

    foreach (array(array('',0,401,0,2,2,0), array('s7',7,402,10,1,1,401)) as $case) {
        list($room_prefix,$room_id,$gamenum,$gametype,$winmode,$validnum,$hdamage) = $case;
        $db->query("INSERT INTO fixture_history (gid,winner,gstime,getime) VALUES ($gamenum,'录像乙',1000,1300)");
        $counts = array(101=>205, 102=>3);
        foreach ($counts as $pid=>$count) {
            for ($operation=0; $operation<$count; $operation++) {
                $pagestartime = $starttime - $moveut*3600 - $moveutmin*60 + $operation*0.25;
                $gamedata = array('innerHTML'=>array('main'=>'<p>真实录像 '.$pid.'-'.$operation.'</p>'), 'value'=>array('hp'=>100-$operation), 'src'=>array(), 'timing'=>$operation);
                $jgamedata = gencode($gamedata);
                $oprecorder = '1.2,e,invalid';
                check_replay(dtsx_record_replay_response(), 'Node bridge did not record command');
            }
        }
        $prefix = $room_prefix ? 's.' : '';
        $base = 'gamedata/replays/'.$prefix.$gamenum;
        \sys\post_gameover_events();
        check_replay(is_file($base.'.dat') && !is_file($base.'.rep.index'), 'Archive was not packed and loose files removed');
        // The real replay list reader must unpack .dat and render its original
        // template, including correct winner ordering and per-player links.
        ob_start(); \replay\get_replay_by_gnum($gamenum, $winmode); $html = ob_get_clean();
        check_replay(strpos($html, 'replay.php?repid='.$prefix.$gamenum) !== false, 'Original replay list did not render game link');
        check_replay(strpos($html, '录像甲') !== false && strpos($html, '录像乙') !== false, 'Original replay list lost a player');
        check_replay(file_get_contents($base.'.rep.index') === '102,101,', 'Winner must be first in replay index; NPC must be absent');
        foreach ($counts as $pid=>$count) {
            $filebase = $base.'.'.$pid;
            $header = read_js_payload($filebase.'.replay.header.js');
            $clicks = read_js_payload($filebase.'.replay.oprecord.js');
            check_replay($header['replay_gamenum'] === $prefix.$gamenum && $header['replay_timelen'] === 300, 'Archive header game identity or duration differs');
            check_replay(count($header['replay_optime']) === $count && count($clicks) === $count, 'Header/click count lost an operation');
            check_replay(abs($header['replay_optime'][$count-1] - ($count-1)*0.25) < 0.00001, 'Bridge timezone/elapsed time conversion differs');
            check_replay($clicks[0] === array(array('1','2'),array('e')), 'Original click filter did not reject invalid input');
            $data = array();
            for ($part=0; $part<$header['replay_datapart']; $part++) $data = array_merge($data, read_js_payload($filebase.'.replay.data.'.$part.'.js'));
            for ($operation=0; $operation<$count; $operation++) check_replay($data[$operation]['innerHTML']['main'] === '<p>真实录像 '.$pid.'-'.$operation.'</p>', 'Response payload was lost or reordered');
            // Upstream counts the protected index header as one extra entry;
            // retain and expose that existing trailing-empty-record behavior.
            check_replay(count($data) === $count+1 && $data[$count] === array(), 'Unexpected change in upstream protected-header counting');
            $metadata = explode(',', file_get_contents($filebase.'.rep'));
            check_replay(base64_decode($metadata[0]) === 'datalib.fixture.js' && (int)$metadata[4] === $count+1, 'Archive metadata differs');
            check_replay(substr(file_get_contents($filebase.'.rep.bmp'),0,2) === 'BM', 'Original BMP thumbnail was not saved');
        }
        $results[] = array('game'=>$prefix.$gamenum, 'players'=>2, 'recordedOperations'=>208, 'partsForFirstPlayer'=>2, 'realReaderRendered'=>true);
    }

    // Original archive-selection rules: weak survival, ignored endless mode,
    // and a GM abort must not create archives even when response records exist.
    foreach (array(array(0,2,1,0), array(17,5,2,1000), array(0,6,2,1000)) as $offset=>$rule) {
        list($gametype,$winmode,$validnum,$hdamage) = $rule; $gamenum = 410+$offset;
        $room_prefix = ''; $room_id = 0;
        \sys\post_gameover_events();
        check_replay(!is_file('gamedata/replays/'.$gamenum.'.dat'), 'Original archive exclusion rule was bypassed');
    }
    $gametype = 17;
    check_replay(dtsx_record_replay_response() === false, 'Bridge recorded excluded mode');
    $gametype = 0; $gamedata['url'] = 'index.php';
    check_replay(dtsx_record_replay_response() === false, 'Bridge recorded a redirect');
    echo json_encode(array('cases'=>$results, 'excludedCases'=>3, 'databaseIsolated'=>true), JSON_UNESCAPED_UNICODE);
} finally {
    if ($db) $db->close();
    mysqli_query($control, 'DROP DATABASE `'.$fixtureDatabase.'`');
    mysqli_close($control);
}
