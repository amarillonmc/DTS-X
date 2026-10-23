import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
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
  const expected = JSON.parse(reference.stdout), assets = await createPlayerAssets(path.join(root, 'engine/img'));
  for (let i = 0; i < files.length; i++) {
    const name = files[i].slice(4);
    assert.equal(await assets.exists(name), true);
    assert.deepEqual(await assets.dimensions(name), expected[i], name);
  }
  t.diagnostic(`Matched ${files.length} original image canvases without changing resources.`);
});
test('player assets reject escaping paths and unavailable or malformed resources', async () => {
  const assets = await createPlayerAssets(path.join(root, 'engine/img'));
  for (const value of ['../config.php', '..\\config.php', '/absolute.png', 'C:\\secret.png', 'f_0.gif:stream', '\0']) await assert.rejects(assets.exists(value), /Invalid|escapes/);
  assert.equal(await assets.exists('missing-player-image-918238.png'), false);
  await assert.rejects(assets.dimensions('missing-player-image-918238.png'), { code: 'ENOENT' });
  await assert.rejects(assets.dimensions('css.css'), /ENOENT|Unsupported or malformed/);
  await assert.rejects(createPlayerAssets('engine/img'), /absolute/);
});
