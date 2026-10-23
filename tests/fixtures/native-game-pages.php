<?php
namespace player {
    function fetch_playerdata($name) { \fixture_event('fetch_playerdata'); return $GLOBALS['fixture']['player']; }
    function load_playerdata($data) { \fixture_event('load_playerdata'); foreach($data as $key=>$value) $GLOBALS[$key]=$value; }
    function post_load_profile_event() { \fixture_event(__FUNCTION__); }
    function init_playerdata() { \fixture_event(__FUNCTION__); }
    function pre_act() { \fixture_event(__FUNCTION__); }
    function act() { \fixture_event(__FUNCTION__); foreach(($GLOBALS['fixture']['action']??[]) as $key=>$value) $GLOBALS[$key]=$value; }
    function post_act() { \fixture_event(__FUNCTION__); }
    function prepare_response_content() { \fixture_event(__FUNCTION__); $GLOBALS['gamedata']['innerHTML']['notice']='notice'; }
    function parse_interface_profile() { \fixture_event(__FUNCTION__); }
    function parse_interface_gameinfo() { \fixture_event(__FUNCTION__); }
    function update_sdata() { \fixture_event(__FUNCTION__); }
    function before_last_player_save_event() { \fixture_event(__FUNCTION__); }
    function player_save($data) { \fixture_event(__FUNCTION__); }
    function prepare_initial_response_content() { \fixture_event(__FUNCTION__); }
    function icon_parser_shell($data) { \fixture_event(__FUNCTION__); return ['icon'.$data['pid'].'.gif','']; }
}
namespace sys {
    function get_valid_disp_user_info($data) { \fixture_event('get_valid_disp_user_info'); return [$data['name'],'ID'.$data['pid']]; }
    function user_display_gamevars_setting() { \fixture_event('user_display_gamevars_setting'); return '<settings>'; }
}
namespace {
    error_reporting(E_ERROR|E_PARSE); date_default_timezone_set('UTC');
    define('IN_GAME', true); define('GAME_ROOT', $argv[1].'/engine/'); define('TPLDIR','templates/default');
    function import_module(...$names) { return ''; }
    function fixture_event($name) { $GLOBALS['events'][]=str_replace('player\\','',$name); }
    function gexit($message, ...$args) { throw new \Exception($message); }
    function udata_check() { fixture_event('authenticate'); return ['password'=>'newpass']; }
    function gencode($data) { return base64_encode(json_encode($data)); }
    function dump_template($name) { fixture_event('template:'.$name); return '<'.$name.'>'; }
    function template($name) { $GLOBALS['fixtureTemplate']=$name; return $GLOBALS['fixtureTemplateFile']; }
    function getchat(...$args) { fixture_event('getchat'); return ['msg'=>[]]; }
    function get_var_input($name) { return $GLOBALS[$name]??null; }
    function fetch_udata($fields='*',$where='1',$sort='') { $GLOBALS['events'][]=['users',$fields,$where,$sort];return $fields==='COUNT(*)' ? [['COUNT(*)'=>count($GLOBALS['fixture']['users']??[])]] : ($GLOBALS['fixture']['users']??[]); }
    class FixtureDatabase {
        function query($sql) {
            $GLOBALS['events'][]=['sql',$sql];
            if(strpos($sql,'UPDATE ')===0) return [];
            if(strpos($sql,'SELECT nid')===0) return [['nid'=>'5']];
            if(strpos($sql,'SELECT name')===0) return [['name'=>'乙']];
            if($GLOBALS['fixture']['page']==='alive') return $GLOBALS['fixture']['players']??[];
            return empty($GLOBALS['fixture']['missing']) ? [$GLOBALS['fixture']['player']] : [];
        }
        function num_rows($rows) { return count($rows); }
        private $cursor=0;
        function fetch_array($rows) { return $GLOBALS['fixture']['page']==='alive' ? ($rows[$this->cursor++]??false) : ($rows[0]??false); }
        function result($rows,$index) { return array_values($rows[$index])[0]; }
    }
    $fixture=json_decode(stream_get_contents(STDIN),true);
    $fixtureTemplateFile=$argv[2];
    $events=[]; $db=new FixtureDatabase(); $_ERROR=['no_login'=>'no_login'];
    foreach($fixture['scope'] as $key=>$value) $GLOBALS[$key]=$value;
    define('MOD_ITEMMAIN_ITEMFIND','itemfind');
    if(!empty($fixture['tutorial'])) { define('MOD_TUTORIAL',true); define('MOD_TUTORIAL_TUTORIAL','tutorial'); }
    ob_start(); ob_start();
    try { require GAME_ROOT.'include/pages/command_'.$fixture['page'].'.php'; $body=''; while(ob_get_level()>0) $body=ob_get_clean().$body; $error=null; }
    catch(\Exception $e) { while(ob_get_level()>0) ob_end_clean(); $body=''; $error=$e->getMessage(); }
    $selected=[]; foreach(['hp','mode','endtime','dtime','kname','chatdata'] as $key) $selected[$key]=$GLOBALS[$key]??null;
    echo json_encode(['body'=>($fixture['page']==='act'||!empty($fixture['encoded']))&&$body ? json_decode(base64_decode($body),true) : $body,'error'=>$error,'events'=>$events,'state'=>$selected],JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
}
