import assert from 'node:assert/strict';
import test from 'node:test';
import { createPlayerIconCatalog } from '../native/storage/player-icon-catalog.mjs';
import { spawnSync } from 'node:child_process';
import { readFile, mkdir, mkdtemp, writeFile, rm, symlink, stat, utimes } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPlayerAssets } from '../native/storage/player-assets.mjs';
import { playerModule } from '../native/gameplay/player.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';

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
  await symlink(outside, path.join(images, 'f_9.gif'), process.platform === 'win32' ? 'junction' : 'dir');
  const first = await createPlayerAssets(images, { indexNames: true });
  assert.equal(await first.exists('f_0.gif'), true);
  assert.equal(await first.snapshotExists('f_0.gif'), true);
  assert.deepEqual(await first.dimensions('f_0.gif'), [2, 3]);
  const originalInfo = await stat(path.join(images, 'f_0.gif'));
  const returned = await first.dimensions('f_0.gif'); returned[0] = 999;
  assert.deepEqual(await first.dimensions('f_0.gif'), [2, 3], 'cached dimensions are value copies');
  await writeFile(path.join(images, 'f_0.gif'), Buffer.from('GIF89a\x04\x00\x05\x00', 'latin1'));
  await utimes(path.join(images, 'f_0.gif'), originalInfo.atime, originalInfo.mtime);
  assert.deepEqual(await first.dimensions('f_0.gif'), [4, 5], 'same-size writes are detected even with restored modification time');
  assert.equal(await first.exists('nested/n_0.gif'), true);
  assert.equal(await first.exists('new.gif'), false);
  assert.deepEqual(await first.numberedCandidates('f', 3, -1), [0]);
  await writeFile(path.join(images, 'new.gif'), bytes);
  assert.equal(await first.exists('new.gif'), false, 'names are a request snapshot');
  const next = await createPlayerAssets(images, { indexNames: true });
  assert.equal(await next.exists('new.gif'), true);
  if (process.platform === 'win32') assert.equal(await next.exists('F_0.GIF'), true);
  await rm(path.join(images, 'f_0.gif'));
  assert.equal(await first.exists('f_0.gif'), false, 'positive names do not bypass stat');
  assert.equal(await first.snapshotExists('f_0.gif'), true, 'ordinary positive names remain in this request snapshot');
  await assert.rejects(first.dimensions('f_0.gif'), {code:'ENOENT'}, 'image bytes are never read from a stale snapshot');
  const latest = await createPlayerAssets(images, { indexNames: true });
  assert.equal(await latest.snapshotExists('f_0.gif'), false);
  assert.equal(await latest.snapshotExists('new.gif'), true);
  for (const service of [first, next]) {
    await assert.rejects(service.exists('escaped'), /escapes/);
    await assert.rejects(service.exists('escaped/private.gif'), /escapes/);
    await assert.rejects(service.dimensions('escaped/private.gif'), /escapes/);
    await assert.rejects(service.snapshotExists('escaped/private.gif'), /escapes/);
    await assert.rejects(service.snapshotExists('f_9.gif'), /escapes/);
    for (const name of ['.', '..', '../outside/private.gif', 'f_0.gif:stream']) await assert.rejects(service.exists(name), /Invalid|escapes/);
  }
});

test('indexed icon lists match sequential reads, refresh images and preserve overridden hooks', async t => {
  const parent = path.join(root, 'var/tests'); await mkdir(parent, { recursive: true });
  const temporary = await mkdtemp(path.join(parent, 'player-image-list-'));
  t.after(async () => { assert.ok(temporary.startsWith(parent + path.sep)); await rm(temporary, { recursive: true, force: true }); });
  const gif = (width, height) => { const bytes = Buffer.from('GIF89a\0\0\0\0', 'latin1'); bytes.writeUInt16LE(width, 6); bytes.writeUInt16LE(height, 8); return bytes; };
  for (const [name, width, height] of [['f_0.gif',80,80],['f_01.gif',80,80],['f_1.png',80,80],['f_1a.jpg',300,600],['F_2.JPG',80,80],['m_2.gif',80,80],['m_2a.gif',40,80],['n_2.gif',80,80],['n_2a.gif',200,200]]) {
    await writeFile(path.join(temporary, name), gif(width, height));
  }
  const ranges = { f: [0, 3], m: [3, 0], n: [0, 4] };
  const create = async (indexNames, hooks = [], playerIconCatalog) => new ModuleRegistry([
    { name: 'sys', state: { tablepre: 'bra_', gtablepre: 'bra_' } }, { name: 'map' }, { name: 'input' }, playerModule, ...hooks,
  ]).createSession({ services: { database: { query: async () => [{Field:'pid',Type:'int'}] }, playerAssets: await createPlayerAssets(temporary, {indexNames}), playerIconCatalog }, states: { player: { pc_icon_range: ranges } } });
  const original = await create(false), fast = await create(true);
  const result = await fast.call('player', 'get_pc_icon_selecting_list');
  const catalog = createPlayerIconCatalog();
  const cachedFirst = await create(true, [], catalog), cachedOther = await create(true, [], catalog);
  assert.deepEqual(await cachedFirst.call('player', 'get_pc_icon_selecting_list'), result);
  assert.deepEqual(await cachedOther.call('player', 'get_pc_icon_selecting_list'), result);
  cachedFirst.state('player').icon_list.f[1][2] = -99;
  assert.equal(cachedOther.state('player').icon_list.f[1][2], 170);
  assert.deepEqual(result, await original.call('player', 'get_pc_icon_selecting_list'));
  assert.deepEqual(fast.state('player').icon_list_contents_to_frontend, original.state('player').icon_list_contents_to_frontend);
  assert.deepEqual(result.f[1], ['f_1.png','f_1a.jpg',170]);
  if (process.platform === 'win32') assert.deepEqual(result.f[2], ['f_2.jpg','',0]);
  else assert.equal(result.f[2], undefined);
  result.f[1][2] = -1;
  assert.equal(fast.state('player').icon_list.f[1][2], 170, 'returned values do not alias session state');
  await writeFile(path.join(temporary, 'f_1a.jpg'), gif(100, 200));
  await writeFile(path.join(temporary, 'f_3.gif'), gif(80, 80));
  await rm(path.join(temporary, 'm_2.gif'));
  const next = await create(true), updated = await next.call('player', 'get_pc_icon_selecting_list');
  assert.deepEqual(updated.f[1], ['f_1.png','f_1a.jpg',100]);
  assert.ok(updated.f[3]); assert.deepEqual(updated.m, {});
  const deployed = await create(true, [], catalog);
  assert.equal((await deployed.call('player', 'get_pc_icon_selecting_list')).f[1][2], 170, 'compiled static catalog lives until deployment refresh');
  catalog.invalidate();
  assert.deepEqual(await (await create(true, [], catalog)).call('player', 'get_pc_icon_selecting_list'), updated);
  const visited = [];
  const hooked = await create(true, [{name:'custom_icons',dependencies:['player'],functions:{
    async icon_parser_name_format(ctx, type, gender, index) { visited.push([gender,index]); return ctx.next(type,gender,index); },
    async icon_parser_file_check(ctx, small, big) { return small === 'f_2.gif' ? ['generated-by-hook.png','',0] : ctx.next(small,big); },
  }}], catalog);
  const hookedResult = await hooked.call('player', 'get_pc_icon_selecting_list');
  assert.deepEqual(hookedResult.f[2], ['generated-by-hook.png','',0]);
  assert.deepEqual(visited, [['f',0],['f',1],['f',2],['f',3],['m',3],['m',2],['m',1],['m',0],['n',0],['n',1],['n',2],['n',3],['n',4]]);
  await writeFile(path.join(temporary,'f_1a.jpg'), 'bad image');
  for (const indexed of [false,true]) await assert.rejects((await create(indexed)).call('player','get_pc_icon_selecting_list'), /Unsupported or malformed/);
});

test('avatar catalogs isolate applications and retry failed or invalidated builds', async () => {
  const first = createPlayerIconCatalog(), other = createPlayerIconCatalog();
  let builds = 0;
  const build = async () => { builds++; return { list: [1] }; };
  const [a, b] = await Promise.all([first.read('range', build), first.read('range', build)]);
  assert.equal(builds, 1); a.list[0] = 99; assert.equal(b.list[0], 1);
  assert.deepEqual(await other.read('range', async () => ({ list: [2] })), { list: [2] });
  await assert.rejects(first.read('error', async () => { throw new Error('invalid image'); }), /invalid image/);
  assert.deepEqual(await first.read('error', build), { list: [1] });
  let reject;
  const pending = first.read('pending', () => new Promise((resolve, fail) => { reject = fail; }));
  await Promise.resolve(); first.invalidate();
  const newer = first.read('pending', async () => ({ list: [3] }));
  reject(new Error('old build failed')); await assert.rejects(pending, /old build/);
  assert.deepEqual(await newer, { list: [3] });
  assert.deepEqual(await first.read('pending', build), { list: [3] });
});
