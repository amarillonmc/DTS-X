import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'node:http';
import { compileFunction } from 'node:vm';
import test from 'node:test';
import { createPhpRuntime } from '../runtime/php-runtime.mjs';
import { projectRoot } from '../runtime/config.mjs';

test('actual Node header forwarding preserves cookies through original curl_post and render_page', async t => {
  // Exercise the production block itself, without importing server.mjs: its
  // top-level startup would acquire/initialize the user's persistent game.
  const serverSource = await fs.readFile(path.join(projectRoot,'server.mjs'), 'utf8');
  const start = serverSource.indexOf('    for (const [key, values] of Object.entries(result.headers)) {');
  const end = serverSource.indexOf('    let bytes = Buffer.from(result.bytes);', start);
  assert.ok(start >= 0 && end > start, 'Locate the real server response-header block');
  const forwardHeaders = compileFunction(serverSource.slice(start,end), ['res','result']);
  const parent = path.join(projectRoot,'var/tests');
  await fs.mkdir(parent,{recursive:true});
  const root = await fs.mkdtemp(path.join(parent,'cookies-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent)+path.sep)); await fs.rm(root,{recursive:true,force:true}); });
  const engineRoot = path.join(root,'engine'); const runtimeRoot = path.join(root,'runtime');
  for (const file of ['include/global.func.php','include/bubblebox.func.php','include/roommng/roommng.config.php']) {
    await fs.mkdir(path.dirname(path.join(engineRoot,file)),{recursive:true});
    await fs.copyFile(path.join(projectRoot,'engine',file),path.join(engineRoot,file));
  }
  await fs.mkdir(runtimeRoot);
  await fs.writeFile(path.join(runtimeRoot,'prepend.php'),'<?php');
  const php = await createPhpRuntime({engineRoot,runtimeRoot,stateRoot:path.join(root,'php')});
  const listeners = [];
  try {
    const inner = await php.run({code:`<?php
      setcookie('fixture_roomid','0'); setcookie('fixture_roomid','7');
      setcookie('fixture_user','Tester'); setcookie('fixture_status','ready');
      echo '<head><title>Room</title></head><body>Room entered</body>';`});
    assert.equal(inner.headers['set-cookie'].length,4,'PHPResponse supplies four lowercase-key cookie values');
    let innerCalls=0;
    const command = createServer((request,response) => {
      innerCalls++; assert.equal(request.method,'POST');
      forwardHeaders(response,inner); response.end(inner.bytes);
    });
    listeners.push(command);
    await new Promise(resolve=>command.listen(0,'127.0.0.1',resolve));
    const origin = `http://127.0.0.1:${command.address().port}`;
    const outer = createServer(async (request,response) => {
      try {
        const rendered = await php.run({code:`<?php
          define('IN_GAME',true); define('GAME_ROOT','/game/');
          require '/game/include/global.func.php';
          $server_address=$_SERVER['DTS_TEST_COMMAND_ORIGIN'];
          $tablepre=$gtablepre='fixture_'; $cookiepath='/'; $cookiedomain=''; $now=time();
          echo render_page('roomcmd');`,server:{DTS_TEST_COMMAND_ORIGIN:origin,SERVER_PORT:'80'}});
        assert.equal(rendered.exitCode,0,rendered.errors);
        forwardHeaders(response,rendered); response.end(rendered.bytes);
      } catch(error) { response.writeHead(500); response.end(error.message); }
    });
    listeners.push(outer);
    await new Promise(resolve=>outer.listen(0,'127.0.0.1',resolve));
    const browserResponse = await fetch(`http://127.0.0.1:${outer.address().port}/roomcmd.php`);
    assert.equal(browserResponse.status,200);
    assert.match(await browserResponse.text(),/Room entered/);
    assert.equal(innerCalls,1);
    const cookies = browserResponse.headers.getSetCookie();
    assert.equal(cookies.length,3,'Original parser keeps the last duplicate and all distinct cookies');
    assert.ok(cookies.some(cookie=>cookie.startsWith('fixture_roomid=7;')),cookies.join('\n'));
    assert.ok(cookies.some(cookie=>cookie.startsWith('fixture_user=Tester;')));
    assert.ok(cookies.some(cookie=>cookie.startsWith('fixture_status=ready;')));
  } finally {
    for (const server of listeners.reverse()) { server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); }
    await php.close();
  }
});
