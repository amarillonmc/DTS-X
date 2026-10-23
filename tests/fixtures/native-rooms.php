<?php
// Development oracle only. Execute unchanged room rules; database, templates
// and transport are exercised separately by integration tests.
error_reporting(E_ERROR | E_PARSE);
function import_module(...$names) { return 'global $cuser, $now;'; }
function gsetcookie_comp($name, $value) { $GLOBALS['cookies'][] = [$name, $value]; }
require $argv[1].'/engine/include/roommng/room.func.php';
require $argv[1].'/engine/include/roommng/roommng.func.php';
$cases = json_decode(stream_get_contents(STDIN), true);
$results = [];
foreach ($cases as $case) {
    require $argv[1].'/engine/include/roommng/roommng.config.php';
    $cuser = '甲'; $now = 1800000000; $gtablepre = 'bra_'; $room_prefix = $case['prefix'] ?? '';
    $data = room_init($case['type']);
    foreach (($case['set'] ?? []) as $key => $value) $data[$key] = $value;
    $returns = [];
    foreach ($case['ops'] as $op) {
        switch ($op[0]) {
            case 'chat': $returns[] = room_new_chat($data, $op[1]); break;
            case 'tick': $returns[] = room_timestamp_tick($data); break;
            case 'update': $returns[] = update_roomstate($data, $op[1]); break;
            case 'kick': $returns[] = room_auto_kick_check($data); break;
            case 'refresh': $returns[] = room_refresh_team_pos($data, $op[1]); break;
            case 'setoption': $returns[] = room_set_game_option($data, $op[1], $op[2]); break;
            case 'get': $returns[] = room_get_vars($data, $op[1]); break;
            case 'reference': $ref = &room_get_vars($data, $op[1]); $ref = $op[2]; unset($ref); $returns[] = room_get_vars($data, $op[1]); break;
            case 'participants': $returns[] = room_participant_get($data); break;
            case 'position': $returns[] = room_upos_check($data, $op[1]); break;
            case 'team': $returns[] = room_getteamhtml($data, $op[1]); break;
            case 'checkoption': $returns[] = room_check_game_option($case['type'], $op[1], $op[2]); break;
            case 'prefix': $returns[] = [room_get_tablepre(),room_get_tablepre(NULL,true),room_prefix2id($room_prefix),room_prefix_kind($room_prefix),room_check_subroom($room_prefix),room_id2prefix($op[1])]; break;
        }
    }
    $results[] = ['data' => $data, 'returns' => $returns, 'now' => time()];
}
echo json_encode($results, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
