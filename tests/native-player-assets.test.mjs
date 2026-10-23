import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { readFile, mkdir, mkdtemp, writeFile, rm, symlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPlayerAssets } from '../native/storage/player-assets.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
test('native player image service matches PHP dimensions for every original GIF, PNG and JPEG', async t => {
  const php = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', timeout: 10_000, windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires PHP 7.4 reference.'); return; }
  const manifest = JSON.parse(await readFile(path.join(root, 'upstream/manifest.json'), 'utf8'));
  const files = manifest.files.map(file => file.path).filter(file => file.startsWith('img/') && /\.(gif|gif1|png|jpg)$/i.test(file));
  const paths = files.map(file => path.join(root, 'engine', file));
  const reference = spawnSync(php, ['-r', '$paths=json_decode(stream_get_contents(STDIN),true);$out=[];foreach($paths as $path){$size=getimagesize($path);$out[]=array_slice($size,0,2);}echo json_encode($out);'], { input: JSON.stringify(paths), encoding: 'utf8', timeout: 20_000, maxBuffer: 1024 * 1024, windowsHide: true });
  assert.equal(reference.status, 0, reference.stderr); assert.equal(reference.stderr, '');
  const expected = JSON.parse(reference.stdout), assets = await createPlayerAssets(path.join(root, 'engine/img'), { indexNames: true });
  for (let i = 0; i < files.length; i++) {
    const name = files[i].slice(4);
    assert.equal(await assets.exists(name), true);
    assert.deepEqual(await assets.dimensions(name), expected[i], name);
  }
  t.diagnostic(`Matched ${files.length} original image canvases without changing resources.`);
});
test('player assets reject escaping paths and unavailable or malformed resources', async () => {
  const assets = await createPlayerAssets(path.join(root, 'engine/img'), { indexNames: true });
  for (const value of ['../config.php', '..\\config.php', '/absolute.png', 'C:\\secret.png', 'f_0.gif:stream', '\0']) await assert.rejects(assets.exists(value), /Invalid|escapes/);
  assert.equal(await assets.exists('missing-player-image-918238.png'), false);
  await assert.rejects(assets.dimensions('missing-player-image-918238.png'), { code: 'ENOENT' });
  await assert.rejects(assets.dimensions('css.css'), /ENOENT|Unsupported or malformed/);
  await assert.rejects(createPlayerAssets('engine/img'), /absolute/);
});

test('request image index refreshes on a new host and still validates existing files and symlinks', async t => {
  const parent = path.join(root, 'var/tests'); await mkdir(parent, { recursive: true });
  const temporary = await mkdtemp(path.join(parent, 'player-image-index-'));
  t.after(async () => { assert.ok(temporary.startsWith(parent + path.sep)); await rm(temporary, { recursive: true, force: true }); });
  const images = path.join(temporary, 'img'), outside = path.join(temporary, 'outside');
  await mkdir(images); await mkdir(outside);
  const bytes = Buffer.from('GIF89a\x02\x00\x03\x00', 'latin1');
  await writeFile(path.join(images, 'f_0.gif'), bytes);
  await writeFile(path.join(outside, 'private.gif'), bytes);
  await mkdir(path.join(images, 'nested'));
  await writeFile(path.join(images, 'nested', 'n_0.gif'), bytes);
  await symlink(outside, path.join(images, 'escaped'), process.platform === 'win32' ? 'junction' : 'dir');
  const first = await createPlayerAssets(images, { indexNames: true });
  assert.equal(await first.exists('f_0.gif'), true);
  assert.deepEqual(await first.dimensions('f_0.gif'), [2, 3]);
  assert.equal(await first.exists('nested/n_0.gif'), true);
  assert.equal(await first.exists('new.gif'), false);
  await writeFile(path.join(images, 'new.gif'), bytes);
  assert.equal(await first.exists('new.gif'), false, 'names are a request snapshot');
  const next = await createPlayerAssets(images, { indexNames: true });
  assert.equal(await next.exists('new.gif'), true);
  if (process.platform === 'win32') assert.equal(await next.exists('F_0.GIF'), true);
  await rm(path.join(images, 'f_0.gif'));
  assert.equal(await first.exists('f_0.gif'), false, 'positive names do not bypass stat');
  for (const service of [first, next]) {
    await assert.rejects(service.exists('escaped'), /escapes/);
    await assert.rejects(service.exists('escaped/private.gif'), /escapes/);
    await assert.rejects(service.dimensions('escaped/private.gif'), /escapes/);
    for (const name of ['.', '..', '../outside/private.gif', 'f_0.gif:stream']) await assert.rejects(service.exists(name), /Invalid|escapes/);
  }
});
