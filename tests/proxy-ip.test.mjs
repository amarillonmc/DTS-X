import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { readConfig, projectRoot } from '../runtime/config.mjs';
import { requestClientAddress, stripProxyIpHeaders } from '../runtime/http.mjs';
import { createPhpRuntime } from '../runtime/php-runtime.mjs';

const peer = '198.51.100.10';
const request = headers => ({ headers, socket:{ remoteAddress:peer } });

test('proxy trust is opt-in and accepts one validated IP only', () => {
  assert.equal(readConfig({}).trustProxy, false);
  assert.equal(readConfig({ TRUST_PROXY:'0' }).trustProxy, false);
  assert.equal(readConfig({ TRUST_PROXY:'true' }).trustProxy, false);
  assert.equal(readConfig({ TRUST_PROXY:'1' }).trustProxy, true);
  const spoofed = request({ 'x-forwarded-for':'203.0.113.20' });
  assert.equal(requestClientAddress(spoofed), peer);
  assert.equal(requestClientAddress(spoofed, false), peer);
  assert.equal(requestClientAddress(spoofed, true), '203.0.113.20');
  assert.equal(requestClientAddress(request({ 'x-forwarded-for':' 2001:db8::1234 ' }), true), '2001:db8::1234');
  for (const header of [undefined, '', 'unknown', 'example.com', '203.0.113.20:443', '999.1.2.3', '203.0.113.20, 198.51.100.2', ['203.0.113.20'], '[2001:db8::1]', '1.2.3.4\r\nSpoof: 1']) {
    assert.equal(requestClientAddress(request({ 'x-forwarded-for':header }), true), peer, String(header));
  }
});

test('PHP cannot independently trust forged proxy aliases or Cloudflare headers', () => {
  const headers = {
    cookie:'fixture_user=Example', 'content-type':'application/x-www-form-urlencoded',
    'x-forwarded-for':'203.0.113.1', 'Client-IP':'203.0.113.2', 'CF-Connecting-IP':'203.0.113.3',
    X_Forwarded_For:'203.0.113.4', CLIENT_IP:'203.0.113.5', cf_connecting_ip:'203.0.113.6',
  };
  assert.deepEqual(stripProxyIpHeaders(headers), { cookie:headers.cookie, 'content-type':headers['content-type'] });
  assert.equal(Object.keys(headers).length, 8, 'Sanitizing does not mutate the incoming request');
});

test('real upstream real_ip uses only the Node-resolved address, including across reused PHP requests', async t => {
  const parent = path.join(projectRoot,'var/tests');
  await fs.mkdir(parent,{recursive:true});
  const root = await fs.mkdtemp(path.join(parent,'proxy-ip-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent)+path.sep)); await fs.rm(root,{recursive:true,force:true}); });
  const engineRoot = path.join(root,'engine'); const runtimeRoot = path.join(root,'runtime');
  await fs.mkdir(path.join(engineRoot,'include'),{recursive:true});
  await fs.copyFile(path.join(projectRoot,'engine/include/user.func.php'),path.join(engineRoot,'include/user.func.php'));
  await fs.mkdir(runtimeRoot);
  await fs.writeFile(path.join(runtimeRoot,'prepend.php'),'<?php');
  const php = await createPhpRuntime({engineRoot,runtimeRoot,stateRoot:path.join(root,'php')});
  try {
    const cases = [
      { trust:false, headers:{'x-forwarded-for':'203.0.113.20','client-ip':'203.0.113.21','cf-connecting-ip':'203.0.113.22'}, expected:peer },
      { trust:true, headers:{'x-forwarded-for':'203.0.113.20','client-ip':'203.0.113.21'}, expected:'203.0.113.20' },
      { trust:true, headers:{'x-forwarded-for':'203.0.113.20, 198.51.100.2'}, expected:peer },
      { trust:true, headers:{'x-forwarded-for':'not-an-ip','cf-connecting-ip':'203.0.113.22'}, expected:peer },
      { trust:true, headers:{'client-ip':'203.0.113.21','cf-connecting-ip':'203.0.113.22'}, expected:peer },
      { trust:false, headers:{x_forwarded_for:'203.0.113.20',client_ip:'203.0.113.21',cf_connecting_ip:'203.0.113.22'}, expected:peer },
      // Preserve the upstream IPv4-only real_ip parser; the VM still receives
      // the correct IPv6 REMOTE_ADDR. Changing that parser is a separate task.
      { trust:true, headers:{'x-forwarded-for':'2001:db8::1234'}, expected:'0.0.0.0' },
    ];
    for (const entry of cases) {
      const remote = requestClientAddress(request(entry.headers),entry.trust);
      const result = await php.run({
        code:`<?php define('IN_GAME',true); require '/game/include/user.func.php'; echo json_encode(array('ip'=>real_ip(),'remote'=>$_SERVER['REMOTE_ADDR'],'raw'=>array_intersect_key($_SERVER,array_flip(array('HTTP_X_FORWARDED_FOR','HTTP_CLIENT_IP','HTTP_CF_CONNECTING_IP')))));`,
        headers:stripProxyIpHeaders(entry.headers), server:{REMOTE_ADDR:remote},
      });
      assert.equal(result.exitCode,0,result.errors);
      assert.equal(result.errors,'');
      const actual = JSON.parse(result.text);
      assert.equal(actual.remote,remote);
      assert.equal(actual.ip,entry.expected);
      assert.deepEqual(actual.raw,[],'Raw proxy headers must not reach the legacy trust decision');
    }
  } finally { await php.close(); }
});
