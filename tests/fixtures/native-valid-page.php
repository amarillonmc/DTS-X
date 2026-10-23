<?php
namespace cardbase {
    function get_user_cardinfo($name) { \event(__FUNCTION__, [$name]); return $GLOBALS['fixture']['cardData']; }
    function card_validate_display(...$args) { \event(__FUNCTION__, $args); return $args; }
    function check_card_in_ownlist(...$args) { \event(__FUNCTION__,$args); return !$GLOBALS['fixture']['notOwned']; }
    function card_validate($user) { \event(__FUNCTION__,[$user]); return [$GLOBALS['fixture']['disabled'],[]]; }
    function save_cardenergy_to_db(...$args) { \event(__FUNCTION__,$args); }
    function pack_filter($packs) { \event(__FUNCTION__,[$packs]); return $packs; }
}
namespace achievement_base {
    function decode_achievements($user) { \event(__FUNCTION__,[$user]); return ['326'=>[1,3]]; }
}
namespace {
    error_reporting(E_ERROR|E_PARSE); define('IN_GAME',true);define('MOD_CARDBASE',true);
    $fixture=json_decode(stream_get_contents(STDIN),true); $events=[];
    function event($name,$args) { $GLOBALS['events'][]=[$name,$args]; }
    function import_module(...$args) { return ''; }
    function gexit($code,...$args) { throw new Exception($code); }
    function udata_check() { event('authenticate',[]);return $GLOBALS['fixture']['user']; }
    function fetch_udata_by_username($name) { event('fetchByUsername',[$name]);return $GLOBALS['fixture']['user']; }
    function update_udata_by_username($data,$name) { event('updateByUsername',[$data,$name]); }
    function enter_battlefield(...$args) { event('enterBattlefield',$args); }
    function template($name) { event('render',[$name]); return $GLOBALS['templateFile']; }
    class DB { function query($sql) { event('sql',[$sql]);return strpos($sql,'AND ip=')!==false ? array_fill(0,$GLOBALS['fixture']['ipPlayers'],[]) : array_fill(0,$GLOBALS['fixture']['players'],[]); } function num_rows($rows) { return count($rows); } }
    $db=new DB(); $templateFile=$argv[2];
    foreach($fixture['scope'] as $key=>$value) $GLOBALS[$key]=$value;
    foreach(['no_login','no_start','valid_stop','no_prepare','ip_limit','player_limit','player_exist'] as $value) $_ERROR[$value]=$value;
    ob_start();try {require $argv[1].'/engine/include/pages/command_valid.php';$body=ob_get_clean();$error=null;}catch(Exception $e){ob_end_clean();$body='';$error=$e->getMessage();}
    $state=[];foreach(['gender','card','card_energy','cardtype_cd_period','no_select','card_achieved_list','select_icon'] as $key)$state[$key]=$GLOBALS[$key]??null;
    echo json_encode(['body'=>$body,'error'=>$error,'events'=>$events,'state'=>$state],JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
}
