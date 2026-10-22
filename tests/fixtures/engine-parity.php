<?php
// A small test extension exercises the real upstream hook dispatcher. It does
// not replace any engine function implementation or write the source checkout.
namespace dtsx_parity_extension {
    function calculate_attack_lvl(&$pdata) {
        if (eval(__MAGIC__)) return $___RET_VALUE;
        return $chprocess($pdata) + ($pdata['parity_level_bonus'] ?? 0);
    }
}

namespace {
    define('IN_GAME', true);
    define('IN_MODULEMNG', true);
    $fixtureRoot = $_SERVER['DTS_ENGINE_ROOT'] ?? getenv('DTS_ENGINE_ROOT');
    define('GAME_ROOT', rtrim($fixtureRoot ?: '/game', '/\\') . '/');
    date_default_timezone_set('UTC');
    error_reporting(E_ALL);
    ini_set('display_errors', 'stderr');
    require GAME_ROOT . 'include/global.func.php';
    require GAME_ROOT . 'include/modules/modules.func.php';
    require GAME_ROOT . 'include/modules/base/weapon/weapon/main.php';
    require GAME_ROOT . 'include/modules/extra/misc/replay/main.php';
    require GAME_ROOT . 'include/modules/extra/misc/bmp_util/main.php';
    require GAME_ROOT . 'include/modules/core/sys/config/gamemode.config.php';
    require GAME_ROOT . 'include/modules/base/lvlctl/config/lvlctl.config.php';

    // Preserve PHP associative/numeric keys, references, UTF-8 and null/false.
    $payload = array('玩家'=>'中文电波😀', 'items'=>array(0=>'水', 3=>'★测试武器★'),
        'hp'=>117, 'fraction'=>1.25, 'false'=>false, 'null'=>null, 'empty'=>array());
    $encoded = gencode($payload);
    $numeric = array();
    foreach (array(0, 1, 63, 64, 4095, 2147483647, 4294967295) as $value) {
        $code = base64_encode_number($value, 8);
        $numeric[] = array($code, base64_decode_number($code));
    }
    $seeds = array();
    foreach (array('电波', 'player-0001', '0', '999999999999999999') as $seed) {
        $seeds[] = array(fatenum_create($seed), fatenum_create($seed, 16));
    }
    mt_srand(20261022);
    $picks = array();
    for ($i = 0; $i < 12; $i++) {
        $picks[] = array_randompick(array('knife'=>'刀', 'bread'=>'面包', 'battery'=>'电池', 'water'=>'水'), 2);
    }

    $pa = array('att'=>103, 'wepe'=>27, 'lvl'=>8, 'parity_level_bonus'=>0);
    $pd = array('def'=>72, 'lvl'=>32, 'parity_level_bonus'=>6);
    $combatBefore = array(
        \weapon\get_internal_att($pa, $pd, true),
        \weapon\get_external_att($pa, $pd, true),
        \weapon\calculate_attack_exp_gain($pa, $pd, true),
        \weapon\calculate_attack_exp_gain($pa, $pd, false, 17)
    );
    // The same registration path is used by generated module initialization.
    hook_register('weapon', 'calculate_attack_lvl');
    hook_register('dtsx_parity_extension', 'calculate_attack_lvl');
    $combatAfter = array(\weapon\calculate_attack_lvl($pd), \weapon\calculate_attack_exp_gain($pa, $pd, true));

    $pixels = array(array(255, 0, 0), array(0, 255, 0), array(0, 0, 255), array(255, 255, 255));
    $bitmap = \bmp_util\gen_bmp($pixels, 4, 1);
    $clicks = \replay\replay_record_op('e,1.2.3,invalid,2.5,9999,3.4');
    $copy = array('hp'=>&$pa['att'], 'name'=>'A');
    $clone = array_clone($copy);
    $pa['att'] = 200;
    $left = 'left'; $right = array('right'); swap($left, $right);
    $peer = $_SERVER['DTS_PARITY_INPUT'] ?? getenv('DTS_PARITY_INPUT');

    echo json_encode(array(
        'metadata'=>array('php'=>PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION, 'intSize'=>PHP_INT_SIZE),
        'encoded'=>$encoded,
        'results'=>array(
            'roundtrip'=>gdecode($encoded, true),
            'json'=>mgzdecode(base64_decode($encoded)),
            'numberCodec'=>$numeric,
            'fatenums'=>$seeds,
            'seededPicks'=>$picks,
            'strings'=>array(mb_strlen('电波DTS😀'), mb_substr('测试角色名字', 1, 3), middle_abbr('新电波DTS测试角色', 3, 2), gshow_len('abc电波'), md5sub('角色名', 12)),
            'validation'=>array_map('check_alnumudline', array('abc_123', '角色名', 'x-y', '__GAME_ROOMID')),
            'combinations'=>full_combination(array('刀', '电池', '水'), 2),
            'timeFormat'=>array_map('seconds2hms', array(1, 65, 3661, 90061)),
            'versions'=>array(gversion_compare('N.E.W 3.2.1', '3.1.9 stable'), gversion_compare('3.2.1', '3.2.1')),
            'references'=>array($copy, $clone, $left, $right),
            'config'=>array('roomModes'=>$room_mode, 'teamModes'=>$teamwin_mode, 'replayExclusions'=>$replay_ignore_mode, 'baseExperience'=>$baseexp),
            'baseCombat'=>$combatBefore,
            'hookedCombat'=>$combatAfter,
            'replayClicks'=>gdecode($clicks, true),
            'replayColor'=>array(\replay\get_html_color(-1, 127.5, 280), \replay\get_ident_textcolor('中文角色')),
            'bitmap'=>array('bytes'=>strlen($bitmap), 'sha256'=>hash('sha256', $bitmap)),
        ),
        'peerDecoded'=>$peer ? gdecode($peer, true) : null,
    ), JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION);
}
