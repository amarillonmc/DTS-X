import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { Readable } from 'node:stream';
import test from 'node:test';
import { parseForm, parseCookies, parseRequest, clientAddress, serializeGameCookie } from '../native/http/request.mjs';
import { createNativeHttpServer, decodeGamePath, publicResource } from '../native/http/server.mjs';

const plain = value => value === null || typeof value !== 'object' ? value : Object.fromEntries(Object.entries(value).map(([key, item]) => [key, plain(item)]));
const fakeRequest = (body, overrides = {}) => Object.assign(Readable.from([Buffer.from(body)]), {
  method: 'POST', url: '/command.php', headers: { 'content-type': 'application/x-www-form-urlencoded' }, socket: { remoteAddress: '127.0.0.1' }, ...overrides,
});

test('native form parser retains source parse_str bracket, duplicate and key semantics', t => {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const cases = [
    '', 'mode=combat&command=WG&message=%E4%BD%A0%E5%A5%BD', 'a=1&a=2', 'a[]=1&a[]=2', 'a[2]=x&a[]=y&a[0]=z&a[]=w',
    'a[-2]=x&a[]=y', 'a[01]=x&a[1]=y&a[]=z', 'a.b=x&a+b=y', 'a[x][y]=z&a[x][]=q', 'a=old&a[x]=new', 'a[x]=old&a=new',
    'a[=1', 'a[b=1', 'a[b][c=1', 'a[b]suffix=1', 'a[b][][]=x', 'a[ ]=x&a[]=y', 'a[  ]=x', 'a\0xx=1',
    '=v&+a=v&%00bad=v', '__proto__[pollution]=x&constructor[prototype][bad]=y', 'a[9223372036854775806]=x&a[]=y',
    'a[+1]=x&a[.]=y&a[%00z]=x', 'x=a+b&y=a%2Bb&z=%ZZ&n=no=more', 'a[\t]=x&a[]=y', 'a[b][c]=x&a[b][d]=y',
  ];
  const result = spawnSync(executable, ['-r', '$cases=json_decode(stream_get_contents(STDIN),true);$out=[];foreach($cases as $s){parse_str($s,$a);$out[]=$a;}echo json_encode($out,JSON_THROW_ON_ERROR);'], { input: JSON.stringify(cases), encoding: 'utf8', windowsHide: true });
  if (result.error?.code === 'ENOENT') { t.skip('Development PHP oracle is unavailable'); return; }
  assert.equal(result.status, 0, result.stderr);
  const expected = JSON.parse(result.stdout);
  for (let i = 0; i < cases.length; i++) assert.deepEqual(plain(parseForm(cases[i])), plain(expected[i]), `parse_str case ${i}: ${cases[i]}`);
  assert.equal({}.pollution, undefined);
});

test('HTTP request merges GET/POST with source input filtering and keeps cookies separate', async () => {
  const parsed = await parseRequest(fakeRequest('mode=combat&cmd[0]=one&cmd[1]=two&___internal=bad', {
    url: '/command.php?mode=enter&query=1', headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: 'bra_user=%E7%94%B2; bra_pass=abc; mode=cookie' },
  }));
  assert.equal(parsed.input.values.mode, 'combat');
  assert.equal(parsed.input.values.bra_user, '甲');
  assert.equal(parsed.input.values.___internal, undefined);
  assert.deepEqual(plain(parsed.input.values.cmd), { 0: 'one', 1: 'two' });
  assert.equal(parsed.input.cookies.mode, 'cookie');
  assert.equal(parsed.input.values.INPUT_VAR_LIST, null);
  assert.equal(parsed.clientAddress, '127.0.0.1');
  const invalid = await parseRequest(fakeRequest('name=%FF&other=ok'));
  assert.equal(invalid.input.values.name, '');
  assert.equal(invalid.input.values.other, 'ok');
});

test('HTTP parsing explicitly rejects truncated bodies, deep arrays and unsupported methods', async () => {
  await assert.rejects(parseRequest(fakeRequest('12345'), { maxBytes: 4 }), { status: 413 });
  await assert.rejects(parseRequest(fakeRequest('x', { method: 'DELETE' })), { status: 405 });
  await assert.rejects(parseRequest(fakeRequest('{}', { headers: { 'content-type': 'application/json' } })), { status: 415 });
  assert.throws(() => parseForm('a[b][c]=x', { maxDepth: 1 }), /deep/);
  assert.throws(() => parseForm('a=1&b=2', { maxVariables: 1 }), /variables/);
  assert.throws(() => parseForm('a[9223372036854775807]=x&a[]=y'), /overflow/);
});

test('cookies preserve first-value, plus and exact security attributes', () => {
  assert.deepEqual(plain(parseCookies('x=a+b; x=later; y=a%2Bb; z=%E7%94%B2; a.b=first; a_b=last')), { x: 'a+b', y: 'a+b', z: '甲', a_b: 'first' });
  assert.match(serializeGameCookie('pass', 'a b+~', { tablePrefix: 'bra_', now: 100, life: 60 }), /^bra_pass=a\+b%2B%7E; expires=.*; Max-Age=60; path=\/; HttpOnly$/);
  assert.equal(serializeGameCookie('bra_user', '甲', { tablePrefix: 'bra_', secure: true }), 'bra_user=%E7%94%B2; path=/; secure');
  assert.match(serializeGameCookie('pass', '', { tablePrefix: 'bra_' }), /^bra_pass=deleted; expires=.*; Max-Age=0; path=\/; HttpOnly$/);
  assert.throws(() => serializeGameCookie('pass', 'value', { tablePrefix: 'bra_', path: '/\r\nBad: value' }), /attributes/);
});

test('proxy client address is trusted only for an explicitly configured single IP', () => {
  const request = { headers: { 'x-forwarded-for': '203.0.113.5' }, socket: { remoteAddress: '127.0.0.1' } };
  assert.equal(clientAddress(request), '127.0.0.1'); assert.equal(clientAddress(request, true), '203.0.113.5');
  request.headers['x-forwarded-for'] = '203.0.113.5, 127.0.0.1'; assert.equal(clientAddress(request, true), '127.0.0.1');
});

test('original admin multipart forms and backup bytes reach their native controllers', async () => {
  const form = new FormData(); form.append('mode', 'urlist'); form.append('checkinfo', '甲'); form.append('selection[]', '1'); form.append('selection[]', '2');
  const bytes = Buffer.from([0, 255, 1, 10, 13]); form.append('uploadfile', new Blob([bytes]), 'users.dat');
  const transport = new Response(form);
  const parsed = await parseRequest(fakeRequest(Buffer.from(await transport.arrayBuffer()), { headers: { 'content-type': transport.headers.get('content-type') } }));
  assert.equal(parsed.input.values.mode, 'urlist'); assert.equal(parsed.input.values.checkinfo, '甲');
  assert.deepEqual(plain(parsed.input.values.selection), { 0: '1', 1: '2' });
  assert.equal(parsed.files.uploadfile.name, 'users.dat'); assert.equal(parsed.files.uploadfile.error, 0); assert.deepEqual(parsed.files.uploadfile.bytes, bytes);
  assert.equal(parsed.input.values.uploadfile, undefined);
});

test('actual development SAPI agrees on cookie precedence and nested request merging', { timeout: 20_000 }, async t => {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true });
  if (version.stdout !== '7.4') { t.skip('Development PHP 7.4 oracle unavailable'); return; }
  const parent = fileURLToPath(new URL('../var/tests/', import.meta.url)); await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'native-http-'));
  const router = path.join(root, 'oracle.php');
  await writeFile(router, '<?php header("Content-Type: application/json");echo json_encode(["get"=>$_GET,"post"=>$_POST,"cookies"=>$_COOKIE,"request"=>$_REQUEST],JSON_THROW_ON_ERROR);');
  const reserve = createServer(); await new Promise(resolve => reserve.listen(0, '127.0.0.1', resolve));
  const port = reserve.address().port; await new Promise(resolve => reserve.close(resolve));
  const child = spawn(executable, ['-d', 'request_order=GP', '-S', `127.0.0.1:${port}`, router], { windowsHide: true, stdio: 'ignore' });
  let exited = false; child.once('exit', () => { exited = true; });
  t.after(async () => {
    if (!exited) { const closed = new Promise(resolve => child.once('exit', resolve)); child.kill(); await closed; }
    assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let i = 0; i < 50; i++) { try { await fetch(base); ready = true; break; } catch { await delay(50); } }
  assert.ok(ready, 'Dedicated development oracle started');
  const scenarios = [
    { query: 'a[x]=get&mode=query', body: 'a[y]=post&mode=post', cookie: 'mode=cookie; x=first; x=second' },
    { query: 'a[0]=get&a[3]=three', body: 'a[1]=post&a[3]=new', cookie: 'a[b]=first; a[b]=second; a[c]=third' },
    { query: 'a[x]=get', body: 'a=post', cookie: 'x=a+b; y=a%2Bb; a.b=1; a_b=2' },
    { query: 'a=get', body: 'a[y]=post', cookie: 'a[]=x; a[]=y; __proto__[bad]=safe' },
    { query: '', body: '', cookie: 'x%20y=one; x+y=two; x y=three; x=first; x[y]=last' },
  ];
  for (const scenario of scenarios) {
    const headers = { 'content-type': 'application/x-www-form-urlencoded', cookie: scenario.cookie };
    const expected = await (await fetch(`${base}/?${scenario.query}`, { method: 'POST', body: scenario.body, headers })).json();
    const actual = await parseRequest(fakeRequest(scenario.body, { url: `/?${scenario.query}`, headers }));
    assert.deepEqual(plain(actual.get), plain(expected.get), 'GET');
    assert.deepEqual(plain(actual.post), plain(expected.post), 'POST');
    assert.deepEqual(plain(actual.cookies), plain(expected.cookies), 'COOKIE');
    assert.deepEqual(plain(actual.input.request), plain(expected.request), 'REQUEST');
  }
});

test('native HTTP transport protects source and state, preserves wire bytes/cookies and drains requests', { timeout: 15000 }, async t => {
  const project = fileURLToPath(new URL('../', import.meta.url)), seen = [], errors = [];
  let released = false, started; const begin = new Promise(resolve => { started = resolve; });
  const app = createNativeHttpServer({ sourceRoot:path.join(project,'engine'),modernRoot:path.join(project,'public/modern'),publicUrl:'https://game.example',maxBytes:100,
    onError:error=>errors.push(error),dispatch:async request=>{
      seen.push(request);
      if(request.pathname==='/login.php')return {status:302,headers:{Location:'index.php','Set-Cookie':['bra_user=%E7%94%B2; path=/','bra_pass=abc; path=/; HttpOnly']},body:''};
      if(request.pathname==='/command.php')return {body:request.input.values.command??'none'};
      if(request.pathname==='/index.php')return {body:'<html><head></head><body>经典</body></html>'};
      if(request.pathname==='/replay.php')return {body:Buffer.from([0,255,2]),headers:{'Content-Type':'application/octet-stream'}};
      if(request.pathname==='/error.php')throw new Error('private database credential must stay private');
      if(request.pathname==='/roomupdate.php'){started();await delay(60);released=true;return {body:'saved'};}
      return null;
    }});
  t.after(()=>app.close());const address=await app.listen(),base=`http://127.0.0.1:${address.port}`;
  const login=await fetch(base+'/login.php',{redirect:'manual'});assert.equal(login.status,302);assert.equal(login.headers.getSetCookie().length,2);
  assert.equal(seen[0].server.HTTP_HOST,'game.example');assert.equal(seen[0].server.SERVER_PORT,'443');
  assert.ok(seen[0].pageStartTime>0);
  const action=await fetch(base+'/command.php',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','X-Forwarded-For':'203.0.113.1'},body:'command=enter'});
  assert.equal(await action.text(),'enter');assert.equal(seen.at(-1).server.REMOTE_ADDR,'127.0.0.1');
  assert.equal(seen.at(-1).server.HTTP_X_FORWARDED_FOR,undefined);
  const html=await(await fetch(base+'/')).text();assert.match(html,/data-dtsx-shell/);assert.match(html,/经典/);
  const head=await fetch(base+'/',{method:'HEAD'});assert.equal(await head.text(),'');assert.ok(Number(head.headers.get('content-length'))>0);
  assert.deepEqual(Buffer.from(await(await fetch(base+'/replay.php')).arrayBuffer()),Buffer.from([0,255,2]));
  for(const url of ['/include/modules/core/sys/config/server.config.php','/gamedata/sql/players.sql','/.env','/native-install.json','/install_NEW.php','/daemonmng.php'])assert.ok([400,404].includes((await fetch(base+url)).status),url);
  const fail=await fetch(base+'/error.php');assert.equal(fail.status,500);assert.equal(await fail.text(),'Internal server error');assert.equal(errors.length,1);
  const tooBig=await fetch(base+'/command.php',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'x'.repeat(101)});assert.equal(tooBig.status,413);
  assert.equal((await fetch(base+'/command.php',{method:'DELETE'})).status,405);
  const resource=await fetch(base+'/include/javascript/common.20240405.js');assert.equal(resource.status,200);const etag=resource.headers.get('etag');await resource.arrayBuffer();
  assert.equal((await fetch(base+'/include/javascript/common.20240405.js',{headers:{'If-None-Match':etag}})).status,304);
  assert.equal(decodeGamePath('/%2e%2e/config'),null);assert.equal(publicResource('/gamedata/cache/private.js'),false);
  const inflight=fetch(base+'/roomupdate.php');await begin;await app.close();assert.equal(released,true);assert.equal(await(await inflight).text(),'saved');
});
