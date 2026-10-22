import assert from 'node:assert/strict';
import test from 'node:test';
import { decodePath, staticAllowed, injectModern, needsModuleManagerNotice, roomLongPoll } from '../runtime/http.mjs';

test('HTTP routing rejects encoded traversal and never publishes PHP/config files as static assets', () => {
  for (const url of ['/img/%2e%2e/include/config.php', '/img/.hidden.png', '/img/x%00.png', '/img%5cfile.png', '/%ZZ']) {
    assert.equal(decodePath(url), null, url);
  }
  assert.equal(decodePath('/'), '/index.php');
  assert.equal(decodePath('/img/%E5%9B%BE%E5%83%8F.png?v=1'), '/img/图像.png');
  for (const file of ['/include/modules/core/sys/config/server.config.php', '/gamedata/modules.list.php', '/gamedata/replays/replay.php', '/runtime/install.php', '/.env']) {
    assert.equal(staticAllowed(file), false, file);
  }
  assert.equal(staticAllowed('/img/avatars/player.png'), true);
  assert.equal(staticAllowed('/gamedata/javascript/datalib.123.js'), true);
});

test('modern shell injection is idempotent and accepts legacy HTML casing', () => {
  const html = '<HTML><HEAD><title>Game</title></HEAD><body>游戏</body></HTML>';
  const injected = injectModern(html);
  assert.match(injected, /modern\/modern.css/);
  assert.match(injected, /modern\/modern.js/);
  assert.equal(injectModern(injected), injected);
  assert.equal(injectModern('{"log":"text"}'), '{"log":"text"}');
});

test('module editor stays available but fixed runtime toggles/activation show authenticated guidance', () => {
  assert.equal(needsModuleManagerNotice('/modulemng.php', '/modulemng.php?mode=edit'), false);
  assert.equal(needsModuleManagerNotice('/modulemng.php', '/modulemng.php?mode=edit&mode=advmng&type=40'), true);
  assert.equal(needsModuleManagerNotice('/modulemng_activate.php', '/modulemng_activate.php?mode=quick'), true);
  assert.equal(needsModuleManagerNotice('/index.php', '/index.php?mode=advmng'), false);
});

test('room polling returns changed state immediately and does not loop after disconnect', async () => {
  let calls = 0;
  const changed = { bytes: Buffer.from('{"room":"changed"}'), exitCode: 0, httpStatusCode: 200 };
  assert.equal(await roomLongPoll(async () => { calls++; return changed; }, {}, () => false), changed);
  assert.equal(calls, 1);
  const empty = { bytes: Buffer.alloc(0), exitCode: 0, httpStatusCode: 200 };
  assert.equal(await roomLongPoll(async () => { calls++; return empty; }, {}, () => true), empty);
  assert.equal(calls, 2);
});
