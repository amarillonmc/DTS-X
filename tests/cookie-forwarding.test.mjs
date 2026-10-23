import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { createPhpRuntime } from '../runtime/php-runtime.mjs';
import { projectRoot } from '../runtime/config.mjs';
import {createNativeHttpServer} from '../native/http/server.mjs';

test('actual Node header forwarding preserves cookies through original curl_post and render_page', async t => {
  // The original PHP client is only an oracle. Actual native HTTP transport
  // forwards every cookie across two real listeners without executing a copied
  // fragment of the retired server.
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
    const command = createNativeHttpServer({sourceRoot:engineRoot,publicUrl:'http://127.0.0.1',modern:false,dispatch:async request => {
      innerCalls++; assert.equal(request.method,'POST');
      return {headers:inner.headers,body:Buffer.from(inner.bytes)};
    }});
    listeners.push(command);
    const commandAddress=await command.listen();
    const origin = `http://127.0.0.1:${commandAddress.port}`;
    const outer = createNativeHttpServer({sourceRoot:engineRoot,publicUrl:'http://127.0.0.1',modern:false,dispatch:async () => {
        const rendered = await php.run({code:`<?php
          define('IN_GAME',true); define('GAME_ROOT','/game/');
          require '/game/include/global.func.php';
          $server_address=$_SERVER['DTS_TEST_COMMAND_ORIGIN'];
          $tablepre=$gtablepre='fixture_'; $cookiepath='/'; $cookiedomain=''; $now=time();
          echo render_page('roomcmd');`,server:{DTS_TEST_COMMAND_ORIGIN:origin,SERVER_PORT:'80'}});
        assert.equal(rendered.exitCode,0,rendered.errors);
        return {headers:rendered.headers,body:Buffer.from(rendered.bytes)};
    }});
    listeners.push(outer);
    const outerAddress=await outer.listen();
    const browserResponse = await fetch(`http://127.0.0.1:${outerAddress.port}/roomcmd.php`);
    assert.equal(browserResponse.status,200);
    assert.match(await browserResponse.text(),/Room entered/);
    assert.equal(innerCalls,1);
    const cookies = browserResponse.headers.getSetCookie();
    assert.equal(cookies.length,3,'Original parser keeps the last duplicate and all distinct cookies');
    assert.ok(cookies.some(cookie=>cookie.startsWith('fixture_roomid=7;')),cookies.join('\n'));
    assert.ok(cookies.some(cookie=>cookie.startsWith('fixture_user=Tester;')));
    assert.ok(cookies.some(cookie=>cookie.startsWith('fixture_status=ready;')));
  } finally {
    for (const server of listeners.reverse()) await server.close();
    await php.close();
  }
});
