import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { createPhpRuntime } from '../runtime/php-runtime.mjs';
import { applyExactPatch, patches } from '../runtime/patches.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
async function fixture(t) {
  const parent = path.join(project, 'var/tests');
  await fs.mkdir(parent, { recursive:true });
  const root = await fs.mkdtemp(path.join(parent, 'bridge-'));
  const write = async (file, contents) => { const target = path.join(root, file); await fs.mkdir(path.dirname(target), {recursive:true}); await fs.writeFile(target, contents); };
  const php = await createPhpRuntime({engineRoot:root, runtimeRoot:path.join(project, 'runtime'), stateRoot:path.join(root, 'state')});
  t.after(async () => { await php.close(); assert.ok(root.startsWith(parent + path.sep)); await fs.rm(root, {recursive:true, force:true}); });
  return {root, write, php};
}

test('every compatibility patch matches the immutable upstream snapshot exactly', async () => {
  for (const patch of patches) {
    const source = await fs.readFile(path.join(project, 'engine', patch.file), 'utf8');
    const patched = applyExactPatch(source, patch);
    assert.equal(applyExactPatch(patched, patch), patched, patch.file);
  }
});

test('replay callbacks preserve valid archive/datalib reads and reject traversal before filesystem access', async t => {
  const {write, php} = await fixture(t);
  const patch = patches.find(p => p.file === 'replay_receive.php');
  await write('replay_receive.php', applyExactPatch(await fs.readFile(path.join(project, 'engine/replay_receive.php'), 'utf8'), patch));
  await write('include/global.func.php', '<?php');
  await write('include/modules/core/sys/config/server.config.php', '<?php $replay_receive_list = array(); // fixture private content');
  await write('include/modules/core/sys/config/system.config.php', '<?php');
  await write('gamedata/replays/s2_14.dat', 'archive-content');
  await write('gamedata/javascript/datalib.42.js', 'javascript-content');
  await write('gamedata/remote_replays/server-name/s2_14/s2_14.dat', 'remote-archive');
  await write('gamedata/remote_replays/server-name/s2_14/s2_14.datalib.txt', 'datalib.42.js');
  await write('gamedata/remote_replays/server-name/datalib/datalib.42.js', 'remote-datalib');
  const request = post => php.run({scriptPath:'/game/replay_receive.php', method:'POST', headers:{'content-type':'application/x-www-form-urlencoded'}, body:new URLSearchParams(post).toString()});
  for (const [post, expected] of [
    [{cmd:'storage_callback', filename:'s2_14.dat'}, 'archive-content'],
    [{cmd:'storage_callback_datalib', datalibname:'datalib.42.js'}, 'javascript-content'],
    [{cmd:'loadrep', sign:'server-name', filename:'s2_14.dat'}, 'remote-archive'],
    [{cmd:'checkdatalib', sign:'server-name', filename:'s2_14.dat'}, 'datalib.42.js'],
    [{cmd:'loaddatalib', sign:'server-name', filename:'datalib.42.js'}, 'remote-datalib'],
  ]) {
    const response = await request(post);
    assert.equal(response.httpStatusCode, 200, response.errors);
    assert.equal(response.text, expected, response.errors);
  }
  for (const post of [
    {cmd:'storage_callback', filename:'../../include/modules/core/sys/config/server.config.php'},
    {cmd:'storage_callback', filename:'..\\..\\secret.dat'},
    {cmd:'storage_callback', filename:'/absolute.dat'},
    {cmd:'storage_callback', filename:'safe.dat:stream'},
    {cmd:'storage_callback', filename:'safe.dat\0'},
    {cmd:'storage_callback', 'filename[]':'archive.dat'},
    {cmd:'storage_callback_datalib', datalibname:'../secret.js'},
    {cmd:'storage_callback_datalib', datalibname:'config.php'},
    {cmd:'loadrep', sign:'../../..', filename:'s2_14.dat'},
    {cmd:'checkdatalib', sign:'..', filename:'s2_14.dat'},
    {cmd:'loaddatalib', sign:'server-name', filename:'../../secret.js'},
    {cmd:'storage_req', sign:'server-name', filename:'../write.dat'},
    {cmd:'storage_callback_unknown', filename:'s2_14.dat'},
  ]) {
    const response = await request(post);
    assert.equal(response.httpStatusCode, 400, JSON.stringify(post));
    assert.equal(response.text, 'Invalid replay request');
  }
});

test('Node requests retain daemon room selection precedence', async t => {
  const {php} = await fixture(t);
  const code = `<?php $input = array(); dtsx_import_room_input($input); echo json_encode($input);`;
  for (const [body, cookie, room] of [['game_roomid=2','game_roomid=3','2'],['game_roomid=0','game_roomid=3','0'],['','game_roomid=3','3'],['game_roomid%5B%5D=2','',''],['','','']]) {
    const response = await php.run({code, method:'POST', headers:{'content-type':'application/x-www-form-urlencoded',cookie}, body});
    assert.equal(JSON.parse(response.text).___GAME_ROOMID || '', room, response.errors);
  }
});

test('template compilation preserves persistent failure diagnostics', async t => {
  const {php,write} = await fixture(t);
  let source=await fs.readFile(path.join(project,'engine/include/template.func.php'),'utf8');
  for(const patch of patches.filter(p=>p.file==='include/template.func.php')) source=applyExactPatch(source,patch);
  await write('template.func.php',source);
  await write('source.htm','template payload');
  await write('language.php','<?php');
  const code=`<?php
    define('IN_GAME',true); if (isset($_POST['compile'])) define('DTS_NODE_COMPILE',true);
    class FixtureTemplateStream {
      public $context; static $attempts=0;
      function stream_open($path,$mode,$options,&$opened) {
        self::$attempts++;
        if (self::$attempts <= (int)$_POST['failures']) { trigger_error('fixture template open denied',E_USER_WARNING); return false; }
        return true;
      }
      function stream_lock($operation) {return true;}
      function stream_write($data) {return strlen($data);}
      function stream_close() {}
    }
    stream_wrapper_register('fixture','FixtureTemplateStream');
    function language($a,$b,$c){return '/game/language.php';}
    require '/game/template.func.php';
    try {parse_template('/game/source.htm','fixture://cache.tpl.php','1','/game');echo json_encode(array('ok'=>true,'attempts'=>FixtureTemplateStream::$attempts));}
    catch (RuntimeException $e) {echo json_encode(array('ok'=>false,'attempts'=>FixtureTemplateStream::$attempts,'error'=>$e->getMessage()));}
  `;
  for(const [body,expectedAttempts,ok] of [['compile=1&failures=0',1,true],['compile=1&failures=99',1,false],['failures=1',1,false]]) {
    const response=await php.run({code,method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
    assert.equal(response.exitCode,0,response.errors);
    const result=JSON.parse(response.text);
    assert.equal(result.attempts,expectedAttempts);
    assert.equal(result.ok,ok);
    if(!ok) {assert.match(result.error,/Cannot write template cache: fixture:\/\/cache\.tpl\.php/);assert.match(result.error,/"type"/);}
  }
});

test('the actual homepage sends one independent routine request for each active room', async t => {
  const {write, php} = await fixture(t);
  const requests = [];
  const server = createServer(async (req,res) => { let body=''; for await (const part of req) body+=part; requests.push(Object.fromEntries(new URLSearchParams(body))); res.end(''); });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/`;
  await write('index.php', applyExactPatch(await fs.readFile(path.join(project,'engine/index.php'),'utf8'),patches.find(p => p.file === 'index.php')));
  await write('include/common.inc.php', `<?php
    namespace map { function get_area_interval() { return 600; } }
    namespace {
      define('GAME_ROOT', '/game/'); $___MOD_SRV=0; $gamestate=20; $now=100; $starttime=1;
      $gametype=0; $disable_newgame=$disable_newroom=0; $gtablepre='fixture_';
      class FixtureDatabase {
        function query($sql) { return strpos($sql, 'groomid>0') !== false ? new ArrayIterator(array(
          array('groomid'=>2,'groomstatus'=>40,'gamestate'=>20,'starttime'=>1,'roomvars'=>'[]'),
          array('groomid'=>5,'groomstatus'=>40,'gamestate'=>20,'starttime'=>1,'roomvars'=>'[]')
        )) : new ArrayIterator(array()); }
        function fetch_array($rows) { if (!$rows->valid()) return false; $row=$rows->current(); $rows->next(); return $row; }
      }
      $db=new FixtureDatabase();
      function gdecode($data,$flag) { return array('roomtype'=>0); }
      function url_dir() { return '${url}'; }
      function curl_post($url,$data,$unused=NULL,$timeout=0.1) { $c=curl_init($url); curl_setopt_array($c,array(CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>http_build_query($data),CURLOPT_RETURNTRANSFER=>true)); $r=curl_exec($c); curl_close($c); return $r; }
      function template($name) { return '/game/template.php'; }
    }`);
  await write('include/roommng/roommng.func.php', '<?php function update_roomstate($data,$active){return false;} function room_get_vars($data,$key){return 0;}');
  await write('template.php','<?php echo "homepage-ok";');
  for (const file of ['gamedata/tmp/rooms/2.txt','gamedata/tmp/rooms/5.txt','gamedata/adminmsg.htm','gamedata/systemmsg.htm']) await write(file,'');
  const response = await php.run({scriptPath:'/game/index.php'});
  assert.equal(response.exitCode,0,response.errors);
  assert.match(response.text,/homepage-ok/);
  assert.deepEqual(requests,[{command:'room_routine_single',game_roomid:'2'},{command:'room_routine_single',game_roomid:'5'}]);
});
