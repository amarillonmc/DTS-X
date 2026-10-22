import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createPhpRuntime, createPhpRuntimePool } from '../runtime/php-runtime.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));

async function fixture(t) {
  const parent = path.join(project, 'var', 'tests');
  await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'php-'));
  const engineRoot = path.join(root, 'engine');
  const runtimeRoot = path.join(root, 'runtime');
  await Promise.all([mkdir(engineRoot), mkdir(runtimeRoot)]);
  await writeFile(path.join(runtimeRoot, 'prepend.php'), '<?php define("DTS_TEST_PREPENDED", true);');
  t.after(async () => {
    // root came directly from mkdtemp inside this test's workspace directory.
    assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep));
    await rm(root, { recursive: true, force: true });
  });
  return { engineRoot, runtimeRoot, stateRoot: path.join(root, 'state') };
}

test('embedded PHP keeps filesystem, form data and request state correct across rotation', async t => {
  const options = await fixture(t);
  const php = await createPhpRuntime({ ...options, maxRequests: 3 });
  try {
    const code = `<?php
      function same_name_each_request() { return 42; }
      define('REQUEST_LOCAL_CONSTANT', true);
      $handle = fopen('/game/persistent.txt', 'a');
      flock($handle, LOCK_EX); fwrite($handle, 'X'); fclose($handle);
      echo json_encode(array('version'=>PHP_VERSION, 'cwd'=>getcwd(),
        'prepended'=>defined('DTS_TEST_PREPENDED'), 'get'=>$_GET, 'post'=>$_POST,
        'cookie'=>$_COOKIE, 'server'=>isset($_SERVER['DTS_SENTINEL']),
        'env'=>getenv('DTS_SENTINEL'), 'extensions'=>get_loaded_extensions()));`;
    const first = await php.run({ code, relativeUri: '/index.php?a=one', method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: 'player=one' },
      body: 'form=first', server: { DTS_SENTINEL: 'first' }, env: { DTS_SENTINEL: 'first' } });
    assert.equal(first.exitCode, 0, first.errors);
    const initial = JSON.parse(first.text);
    assert.equal(initial.version, '7.4.33');
    assert.equal(initial.cwd, '/game');
    assert.equal(initial.prepended, true);
    assert.deepEqual(initial.post, { form: 'first' });
    assert.deepEqual(initial.cookie, { player: 'one' });
    assert.equal(initial.env, 'first');
    for (const extension of ['mysqli', 'curl', 'gd', 'mbstring', 'zip', 'session']) {
      assert.ok(initial.extensions.includes(extension), extension);
    }
    for (let request = 0; request < 8; request++) {
      const next = await php.run({ code, relativeUri: '/index.php?a=' + request });
      assert.equal(next.exitCode, 0, next.errors);
      const output = JSON.parse(next.text);
      assert.deepEqual(output.get, { a: String(request) });
      assert.deepEqual(output.post, []);
      assert.deepEqual(output.cookie, []);
      assert.equal(output.server, false);
      assert.equal(output.env, false);
      assert.equal(output.cwd, '/game');
      assert.equal(output.prepended, true);
    }
    assert.equal(await readFile(path.join(options.engineRoot, 'persistent.txt'), 'utf8'), 'X'.repeat(9));
    const sharedLock = await php.run({ code: `<?php
      $f = fopen('/game/persistent.txt', 'rb');
      if (!flock($f, LOCK_SH)) throw new Exception('read-only shared lock failed');
      echo stream_get_contents($f); fclose($f);
      $f = fopen('/game/persistent.txt', 'rb');
      if (!flock($f, LOCK_SH | LOCK_NB)) throw new Exception('implicit close did not release lock');
      fclose($f);` });
    assert.equal(sharedLock.text, 'X'.repeat(9), sharedLock.errors);
    await writeFile(path.join(options.engineRoot, 'entry.php'), '<?php echo DTS_TEST_PREPENDED ? "prepend_on_file_ok" : "missing";');
    const fileRequest = await php.run({ scriptPath: '/game/entry.php', relativeUri: '/entry.php' });
    assert.equal(fileRequest.text, 'prepend_on_file_ok', fileRequest.errors);
    await writeFile(path.join(options.engineRoot, 'short.php'), '<? echo "legacy_short_tags_ok"; ?>');
    const shortTags = await php.run({ scriptPath: '/game/short.php' });
    assert.equal(shortTags.text, 'legacy_short_tags_ok', shortTags.errors);
    const integers = await php.run({ code: `<?php echo json_encode(array(
      PHP_INT_SIZE, (string)PHP_INT_MAX, (string)(9007199254740992 + 1),
      (string)(1 << 40), (string)rand(4000000000, 4000000000),
      (string)mt_rand(4000000000, 4000000000)));` });
    assert.deepEqual(JSON.parse(integers.text), [8, '9223372036854775807', '9007199254740993',
      '1099511627776', '4000000000', '4000000000']);
  } finally { await php.close(); }
});

test('PHP emits binary responses/cookies, cleans fatal requests, and connects through curl', async t => {
  const options = await fixture(t);
  const php = await createPhpRuntime(options);
  const server = createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Node TCP bridge works');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const result = await php.run({ code: '<?php http_response_code(201); setcookie("a", "one"); setcookie("b", "two"); header("Content-Type: application/octet-stream"); echo "A\\0B";' });
    assert.equal(result.httpStatusCode, 201);
    assert.deepEqual([...result.bytes], [65, 0, 66]);
    assert.equal(result.headers['set-cookie'].length, 2);
    const failed = await php.run({ code: '<?php throw new Exception("isolated_failure");' });
    assert.notEqual(failed.exitCode, 0);
    assert.match(failed.errors, /isolated_failure/);
    const clean = await php.run({ code: '<?php echo "next_request_ok";' });
    assert.equal(clean.text, 'next_request_ok');
    const network = await php.run({ code: `<?php $curl = curl_init('http://127.0.0.1:${server.address().port}/'); curl_setopt($curl, CURLOPT_RETURNTRANSFER, true); curl_setopt($curl, CURLOPT_TIMEOUT, 5); echo curl_exec($curl); if (curl_errno($curl)) throw new Exception(curl_error($curl)); curl_close($curl);` });
    assert.equal(network.exitCode, 0, network.errors);
    assert.equal(network.text, 'Node TCP bridge works');
  } finally {
    await php.close();
    await new Promise(resolve => server.close(resolve));
  }
});

test('runtime pool coordinates file locks and drains queued requests on close', async t => {
  const options = await fixture(t);
  await writeFile(path.join(options.engineRoot, 'counter.txt'), '0');
  const pool = await createPhpRuntimePool({ ...options, size: 2, maxRequests: 3 });
  const requests = Array.from({ length: 8 }, () => pool.run({ code: `<?php
    $f = fopen('/game/counter.txt', 'r+');
    if (!flock($f, LOCK_EX)) throw new Exception('lock failed');
    $n = intval(stream_get_contents($f)); usleep(10000);
    rewind($f); ftruncate($f, 0); fwrite($f, strval($n+1)); fflush($f);
    flock($f, LOCK_UN); fclose($f); echo 'ok';` }));
  const closing = pool.close();
  const results = await Promise.all(requests);
  await closing;
  for (const result of results) assert.equal(result.text, 'ok', result.errors);
  assert.equal(await readFile(path.join(options.engineRoot, 'counter.txt'), 'utf8'), '8');
  await assert.rejects(pool.run({ code: '<?php echo "closed";' }), /closed/);
});

test('a timed-out PHP worker is terminated and replaced for the next request', async t => {
  const options = await fixture(t);
  const pool = await createPhpRuntimePool({ ...options, size: 1, requestTimeoutMs: 300,
    phpIni: { max_execution_time: 0 } });
  try {
    await assert.rejects(pool.run({ code: '<?php while (true) {}' }), /exceeded 300 ms/);
    const result = await pool.run({ code: '<?php echo "replacement_ok";' });
    assert.equal(result.text, 'replacement_ok');
  } finally { await pool.close(); }
});

test('upstream-style repeated implicit close releases both read and write locks', async t => {
  const options = await fixture(t);
  const php = await createPhpRuntime(options);
  try {
    const response = await php.run({ code: `<?php
      $filename = '/game/rewrite.tpl.php';
      for ($i = 0; $i < 1000; $i++) {
        $data = '<? echo "iteration ' . $i . '"; ?>';
        touch($filename); $f = fopen($filename, 'rb+');
        if (!flock($f, LOCK_EX)) throw new Exception('write lock failed at ' . $i);
        fwrite($f, $data); ftruncate($f, strlen($data)); fclose($f); chmod($filename, 0777);
        $f = fopen($filename, 'rb');
        if (!flock($f, LOCK_SH)) throw new Exception('read lock failed at ' . $i);
        $read = ''; while (!feof($f)) $read .= fread($f, 8192); fclose($f);
        if ($read !== $data) throw new Exception('corrupt data at ' . $i);
        $f = fopen($filename, 'w');
        if (!$f) throw new Exception('template overwrite failed at ' . $i);
        fwrite($f, $data); fclose($f);
      }
      echo '1000_rewrites_ok';` });
    assert.equal(response.exitCode, 0, response.errors);
    assert.equal(response.text, '1000_rewrites_ok');
  } finally { await php.close(); }
});
