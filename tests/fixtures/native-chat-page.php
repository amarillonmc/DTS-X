<?php
namespace sys {
  function load_gameinfo() { $GLOBALS['events'][]=['load_gameinfo',[]]; }
  function addchat(...$args) { $GLOBALS['events'][]=['addchat',$args]; }
}
namespace {
  error_reporting(E_ERROR|E_PARSE);define('IN_GAME',true);
  $fixture=json_decode(stream_get_contents(STDIN),true);$events=[];foreach($fixture['scope'] as $key=>$value)$GLOBALS[$key]=$value;
  function room_check_gamenum(...$args){$GLOBALS['events'][]=['checkGameNumber',$args];return $GLOBALS['fixture']['validRoom'];}
  function room_id2prefix($id){return $id?'s'.$id:'';}
  function room_get_tablepre($prefix){return 'bra_'.$prefix.'_';}
  function getchat(...$args){$GLOBALS['events'][]=['getchat',$args];return ['lastcid'=>5,'msg'=>['first','second']];}
  function gencode($data){return base64_encode(json_encode($data));}
  ob_start();ob_start();require $argv[1].'/engine/chat.php';$body='';while(ob_get_level()>0)$body=ob_get_clean().$body;
  echo json_encode(['body'=>json_decode(base64_decode($body),true),'events'=>$events],JSON_THROW_ON_ERROR|JSON_UNESCAPED_UNICODE);
}
