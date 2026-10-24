import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultConfiguration, additionalModules, infoById } from '../native/bootstrap.mjs';
import { createNativeApplication } from '../native/http/application.mjs';
import { createNativeRequestHost } from '../native/http/request-host.mjs';
import { prepareInputRequest } from '../native/gameplay/input.mjs';
import { createRoomBroadcast } from '../native/system/room-poll.mjs';
import { createMaintenanceGate } from '../native/http/maintenance.mjs';
import { installNative } from '../native/install/installer.mjs';
import { createCookiePass } from '../native/accounts/primitives.mjs';
import { gdecode } from '../native/protocol/codec.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';
import { launchNativeBrowser } from './helpers/native-browser.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const fields = ['itm', 'itmk', 'itme', 'itms', 'itmsk'];
const item = (slot, name, kind, effect = 100, count = 2, special = '') =>
  Object.fromEntries(fields.map((field, i) => [field + slot, [name, kind, effect, count, special][i]]));

test('full-module basic interactions preserve success, rejection, player state and replay over real HTTP', { timeout: 240000 }, async t => {
  const db = await isolatedDatabase(t, 'interaction_http'); if (!db) return;
  const parent = path.join(root, 'var/tests'); await mkdir(parent, { recursive: true });
  const stateRoot = await mkdtemp(path.join(parent, 'native-interactions-'));
  const broadcast = createRoomBroadcast(), maintenance = createMaintenanceGate(), errors = [], responses = [];
  let app, browser, now = 1700000000;
  t.after(async () => {
    await browser?.close(); await app?.close(); broadcast.close(); await maintenance.close();
    assert.ok(path.resolve(stateRoot).startsWith(path.resolve(parent) + path.sep));
    await rm(stateRoot, { recursive: true, force: true });
  });
  const username = '交互回归', password = 'InteractionFixtureOnly!';
  await installNative({ database: db.database, stateRoot, admin: { username, password } });
  const cookies = { bra_user: username, bra_pass: createCookiePass(password), bra_roomid: '0' };
  const options = { configuration: defaultConfiguration, additionalModules, infoById, databaseOptions: db.credentials,
    sourceRoot: path.join(root, 'engine'), stateRoot, publicUrl: 'http://127.0.0.1', modernRoot: path.join(root, 'public/modern'),
    clock: { now: () => now }, randomSeed: 77, systemConfig: { gtablepre: 'bra_', gamefounder: username } };
  async function withHost(fn, load = true) {
    const request = { pathname: '/game.php', input: prepareInputRequest({ cookies }), server: { SERVER_PORT: '80' }, pageStartTime: now };
    const host = await createNativeRequestHost({ ...options, request, broadcast, maintenance });
    try {
      if (load) await host.session.call('player', 'load_playerdata', await host.session.call('player', 'fetch_playerdata', username));
      return await fn(host);
    } finally { await host.close(); }
  }
  const places = await withHost(async host => {
    const sys = host.session.state('sys'); sys.starttime = sys.now;
    await host.session.call('gameflow_base', 'gamestate_prepare_game');
    await host.session.call('gameflow_base', 'gamestate_start_game');
    await host.session.call('sys', 'save_gameinfo');
    await host.enterBattlefield(username, createCookiePass(password), 'm', 1, 0, '127.0.0.1');
    return { safe: await host.session.call('map', 'get_safe_plslist'), hospital: host.session.state('rest').rest_hospital_list[0] };
  }, false);
  const player = async () => (await db.database.query(`SELECT * FROM bra_players WHERE name='${username}' AND type=0`))[0];
  const initial = await player(), where = `pid='${initial.pid}'`, destination = places.safe.find(p => Number(p) > 0);
  const emptyPack = Object.assign({}, ...Array.from({ length: 7 }, (_, i) => item(i, '', '', 0, 0)));
  async function reset(changes = {}, acquired = []) {
    await db.database.arrayUpdate('bra_players', { ...emptyPack, action: '', state: 0, hp: 1000, mhp: 1000, sp: 1000, msp: 1000,
      lvl: 1, exp: 0, wd: 0, inf: '', pls: destination, club: 0, money: 10000, pose: 0, tactic: 0,
      nskill: initial.nskill, nskillpara: initial.nskillpara, ...changes }, where);
    if (acquired.length) await withHost(async host => {
      for (const id of acquired) await host.session.call('skillbase', 'skill_acquire', id, host.session.state('player').sdata);
      await host.session.call('player', 'player_save', host.session.state('player').sdata);
    });
  }
  app = createNativeApplication({ ...options, schedulerIntervalMs: 0, onError: error => errors.push(error) });
  const address = await app.listen(), base = `http://127.0.0.1:${address.port}`;
  const headers = { Cookie: Object.entries(cookies).map(([k, v]) => k + '=' + encodeURIComponent(v)).join('; '), 'Content-Type': 'application/x-www-form-urlencoded' };
  async function action(post, log) {
    now += 5;
    const response = await fetch(base + '/command.php', { method: 'POST', headers,
      body: new URLSearchParams({ mode: 'command', oprecorder: '1.2.3,e', ...post }) });
    const body = await response.text(); assert.equal(response.status, 200, errors.at(-1)?.stack ?? body);
    const payload = gdecode(body); assert.ok(payload.innerHTML?.main, JSON.stringify(payload));
    if (log) assert.match(payload.innerHTML.log, log);
    responses.push(body); return { payload, saved: await player() };
  }
  async function check(name, fn) { await t.test(name, fn); }

  for (const exp of [0, 26]) await check(`set trap with exp=${exp}`, async () => {
    await reset({ exp, ...item(1, '交互陷阱', 'TN', 200) });
    const count = Number((await db.database.query(`SELECT COUNT(*) AS n FROM bra_maptrap WHERE itmsk='${initial.pid}'`))[0].n);
    const { saved } = await action({ command: 'itm1' }, /设置了陷阱/);
    assert.equal(Number(saved.exp), exp + 1); assert.equal(Number(saved.lvl), exp === 26 ? 2 : 1);
    assert.equal(Number(saved.itms1), 1); assert.equal(Number(saved.wd), 1);
    const rows = await db.database.query(`SELECT * FROM bra_maptrap WHERE itmsk='${initial.pid}'`);
    assert.equal(rows.length, count + 1); assert.equal(rows.at(-1).itmk, 'TO');
    assert.equal(Number(rows.at(-1).itme), 175, 'trap limit is computed before gaining the new level');
    const reload = await action({ command: 'menu' }); assert.equal(reload.saved.exp, saved.exp);
  });
  await check('trap skill19 bonus traverses the same current-player leveling chain', async () => {
    await reset(item(1, '巧设陷阱', 'TN'), [19]);
    const { saved } = await action({ command: 'itm1' }, /设置了陷阱/);
    assert.ok(Number(saved.exp) >= 2 && Number(saved.exp) <= 3);
    assert.ok(Number(saved.wd) >= 2); assert.equal(Number(saved.itms1), 1);
  });
  for (const sanity of [2, 4]) await check(`skill108 experience gate sanity=${sanity}`, async () => {
    await reset({ exp: 26, ...item(1, '理智陷阱', 'TN') }, [107, 108]);
    await withHost(async host => {
      await host.session.call('skillbase', 'skill_setvalue', 107, 'sanity', sanity);
      await host.session.call('player', 'player_save', host.session.state('player').sdata);
    });
    const { saved } = await action({ command: 'itm1' }, /设置了陷阱/);
    assert.equal(Number(saved.exp), sanity < 3 ? 26 : 27);
    assert.equal(Number(saved.itms1), 1);
  });
  await check('invalid item slot is rejected before trap insertion or experience', async () => {
    await reset(); const { saved } = await action({ command: 'itm7' }, /不存在/);
    assert.equal(Number(saved.exp), 0); assert.equal(Number(saved.itms1), 0);
  });
  await check('experience medicine levels up and runs skill181 song hooks', async () => {
    await reset(item(1, '经验药剂', 'ME', 100), [181]);
    const before = await player(), { saved } = await action({ command: 'itm1' }, /经验值提高了/);
    assert.ok(Number(saved.exp) > 100); assert.ok(Number(saved.lvl) > 1);
    assert.ok(Number(saved.mss) > Number(before.mss)); assert.equal(Number(saved.itms1), 1);
  });
  await check('experience medicine at level cap retains cap and consumes item', async () => {
    const cap = await withHost(host => host.session.call('lvlctl', 'get_lvllimit', host.session.state('player').sdata));
    await reset({ lvl: cap, exp: 2 * cap * 9 + 9, ...item(1, '满级药剂', 'ME', 100) });
    const { saved } = await action({ command: 'itm1' }, /没有任何提升/);
    assert.equal(Number(saved.lvl), Number(cap)); assert.equal(Number(saved.exp), 2 * cap * 9 + 9); assert.equal(Number(saved.itms1), 1);
  });
  await check('crafting skill431 grants experience through the actual mix request', async () => {
    await reset({ ...item(1, '【红杀铁剑】', 'WK', 180, 30, 'u'), ...item(2, '电磁充能手套', 'DA', 45, 15, 'E') }, [431]);
    const { saved } = await action({ mode: 'itemmain', command: 'itemmix', mitm1: '1', mitm2: '2' }, /合成了/);
    assert.equal(Number(saved.exp), 6); assert.ok(Array.from({ length: 6 }, (_, i) => saved['itm' + (i + 1)]).includes('【红杀铁剑·雷击】'));
  });
  await check('crafting rejects empty and incompatible selections', async () => {
    await reset({ ...item(1, '石头', 'WC'), ...item(2, '面包', 'HB') });
    await action({ mode: 'itemmain', command: 'itemmix' }, /至少需要2个道具/);
    const { saved } = await action({ mode: 'itemmain', command: 'itemmix', mitm1: '1', mitm2: '2' }, /不能合成/);
    assert.equal(Number(saved.itms1), 2); assert.equal(Number(saved.itms2), 2);
  });
  await check('gemming grants experience and consumes the selected gem', async () => {
    await reset({ wep: '强化刀', wepk: 'WK', wepe: 100, weps: 30, wepsk: '', ...item(1, '红宝石方块', 'Y', 10) }, [23]);
    const { saved, payload } = await action({ mode: 'special', command: 'skill23_special', subcmd: 'gemming', skill23_t1: 'wep', skill23_t2: '1' });
    assert.ok(Number(saved.exp) >= 4, payload.innerHTML.log); assert.equal(Number(saved.itms1), 1); assert.ok(Number(saved.wepe) > 100);
  });
  await check('combat cancellation skill437 grants current-player experience', async () => {
    const enemy = (await db.database.query('SELECT pid FROM bra_players WHERE type>0 AND hp>0 LIMIT 1'))[0];
    await reset({ action: 'enemy' + enemy.pid, wepk: 'WK' }, [437]);
    const { saved } = await action({ mode: 'combat', command: 'back' });
    assert.equal(Number(saved.exp), 2);
  });
  await check('gemming rejects missing ability and invalid material without spending it', async () => {
    const post = { mode: 'special', command: 'skill23_special', subcmd: 'gemming', skill23_t1: 'wep', skill23_t2: '1' };
    await reset(item(1, '石头', 'WC')); await action(post, /没有这个技能/);
    await reset({ wep: '强化刀', wepk: 'WK', wepe: 100, weps: 30, wepsk: '', ...item(1, '石头', 'WC') }, [23]);
    const { saved } = await action(post, /不是有效的宝石/); assert.equal(Number(saved.exp), 0); assert.equal(Number(saved.itms1), 2);
  });
  for (const [kind, changed] of [['HB', 'hp'], ['HS', 'sp'], ['MH', 'mhp'], ['MS', 'msp'], ['MA', 'att'], ['MD', 'def'], ['MV', 'wk']]) {
    await check(`consumable ${kind} updates ${changed}`, async () => {
      await reset({ hp: 100, sp: 100, att: 20, def: 20, wk: 0, ...item(1, '交互药剂' + kind, kind, 50) });
      const before = await player(), { saved } = await action({ command: 'itm1' });
      assert.ok(Number(saved[changed]) > Number(before[changed]), kind); assert.equal(Number(saved.itms1), 1);
    });
  }
  for (const [kind, position] of [['WK', 'wep'], ['DB', 'arb'], ['DH', 'arh'], ['DA', 'ara'], ['DF', 'arf'], ['A', 'art']]) {
    await check(`equip ${kind} and unequip ${position}`, async () => {
      await reset(item(1, '交互装备' + kind, kind));
      const { saved } = await action({ command: 'itm1' }); assert.equal(saved[position], '交互装备' + kind);
      const off = await action({ mode: 'itemmain', command: 'off' + position });
      assert.ok(Array.from({ length: 6 }, (_, i) => off.saved['itm' + (i + 1)]).includes('交互装备' + kind));
    });
  }
  await check('move, merge and drop inventory preserve item counts', async () => {
    await reset({ ...item(1, '交互石头', 'WC', 5), ...item(2, '交互石头', 'WC', 5, 3) });
    const moved = await action({ mode: 'itemmain', command: 'itemmove', from: '1', to: '3' }); assert.equal(moved.saved.itm3, '交互石头');
    const merged = await action({ mode: 'itemmain', command: 'itemmerge', merge1: '3', merge2: '2' }); assert.equal(Number(merged.saved.itms2), 5);
    const dropped = await action({ mode: 'itemmain', command: 'dropitm2' }); assert.equal(Number(dropped.saved.itms2), 0);
  });
  await check('shop menus, purchase and insufficient funds preserve stock and money', async () => {
    const stock = (await db.database.query("SELECT * FROM bra_shopitem WHERE kind=1 AND area=0 AND num>2 AND price>0 ORDER BY sid LIMIT 1"))[0]; assert.ok(stock);
    await reset({ pls: 0 });
    await action({ command: 'special', sp_cmd: 'sp_shop' });
    await action({ mode: 'special', command: 'shop1' });
    const { saved } = await action({ mode: 'shop', command: stock.sid, shoptype: stock.kind, buynum: '1' }, /购买成功/);
    assert.equal(Number(saved.money), 10000 - Number(stock.price));
    assert.ok(Array.from({ length: 6 }, (_, i) => saved['itm' + (i + 1)]).includes(stock.item));
    const left = Number((await db.database.query(`SELECT num FROM bra_shopitem WHERE sid='${stock.sid}'`))[0].num);
    assert.equal(left, Number(stock.num) - 1);
    await reset({ pls: 0, money: 0 });
    const denied = await action({ mode: 'shop', command: stock.sid, shoptype: stock.kind, buynum: '1' }, /钱不够/);
    assert.equal(Number(denied.saved.money), 0);
    assert.equal(Number((await db.database.query(`SELECT num FROM bra_shopitem WHERE sid='${stock.sid}'`))[0].num), left);
  });
  await check('rest starts, renders timer, restores stamina and stops', async () => {
    await reset({ sp: 100 });
    const started = await action({ command: 'rest1' }); assert.equal(Number(started.saved.state), 1); assert.equal(started.payload.timing.rest_timing.on, true);
    now += 60; const rested = await action({ mode: 'rest', command: 'rest' }); assert.ok(Number(rested.saved.sp) > 100);
    const stopped = await action({ mode: 'rest', command: 'back' }); assert.equal(Number(stopped.saved.state), 0);
  });
  await check('hospital rest rejects the wrong location', async () => {
    await reset({ pls: places.safe.find(p => Number(p) !== Number(places.hospital)) });
    const { saved } = await action({ command: 'rest3' }, /并非医院/); assert.equal(Number(saved.state), 0);
  });
  await check('stance and tactic accept valid and reject invalid commands', async () => {
    await reset();
    assert.equal(Number((await action({ mode: 'special', command: 'pose3' })).saved.pose), 3);
    assert.equal(Number((await action({ mode: 'special', command: 'tac2' })).saved.tactic), 2);
    assert.equal(Number((await action({ mode: 'special', command: 'pose9' }, /奇怪/)).saved.pose), 3);
  });
  await check('move/search success and insufficient-stamina rejection', async () => {
    await reset({ pls: places.safe.find(p => Number(p) !== Number(destination)) }); const moved = await action({ command: 'move', moveto: String(destination) }, /移动到了/);
    assert.equal(Number(moved.saved.pls), Number(destination));
    await reset(); const searched = await action({ command: 'search' }, /搜索着周围/); assert.ok(Number(searched.saved.sp) < 1000);
    await reset({ sp: 0 }); const denied = await action({ command: 'search' }, /体力不足/); assert.equal(Number(denied.saved.sp), 0);
  });

  await check('every accepted HTTP response is saved verbatim in the original replay format', async () => {
    const directory = path.join(stateRoot, 'gamedata/tmp/response/0_');
    const recorded = await Promise.all((await readdir(directory)).map(name => readFile(path.join(directory, name), 'utf8')));
    for (const response of responses) assert.ok(recorded.includes(response), 'accepted response is replayable');
    const index = await readFile(path.join(stateRoot, 'gamedata/tmp/replay/_/' + initial.pid + '/replay.php'), 'utf8');
    assert.equal(index.trim().split('\n').length, responses.length + 1);
  });
  await check('trap and medicine real browser clicks work in both themes and both shells after restarting', async () => {
    await app.close();
    app = createNativeApplication({ ...options, schedulerIntervalMs: 0, onError: error => errors.push(error) });
    const address = await app.listen(), browserBase = `http://127.0.0.1:${address.port}`;
    browser = await launchNativeBrowser(t, { outputRoot: parent });
    await browser.send('Page.addScriptToEvaluateOnNewDocument', { source: `window.commandResponses=[];
      const send=XMLHttpRequest.prototype.send;XMLHttpRequest.prototype.send=function(body){
        this.addEventListener('loadend',()=>{if(this.responseURL.endsWith('/command.php'))commandResponses.push({status:this.status,body:this.responseText});},{once:true});return send.apply(this,arguments);};` });
    for (const theme of [1, 2]) for (const modern of [false, true]) {
      await reset({ exp: 26, ...item(1, '浏览器陷阱', 'TN', 200), ...item(2, '浏览器经验药', 'ME', 100) });
      await browser.send('Network.setCookies', { cookies: Object.entries({ ...cookies, templateid: String(theme) }).map(([name, value]) => ({ name, value, url: browserBase })) });
      now += 5; await browser.send('Page.navigate', { url: browserBase + '/game.php' });
      await browser.waitFor(`document.readyState==='complete' && !!window.DTSModern && !!document.getElementById('gamecmd')`);
      await browser.evaluate(`DTSModern.setMode(${modern});`);
      for (const slot of [1, 2]) {
        const selector = `${theme === 2 ? '#item_cmd_subpage' : '#cmd'} input[onclick*="'itm${slot}'"]`;
        if (theme === 2) await browser.evaluate(`document.getElementById('item_cmd_tag').click()`);
        await browser.evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center'})`);
        await browser.evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
        const point = await browser.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,hit:e.contains(document.elementFromPoint(x,y))}})()`);
        assert.equal(point.hit, true, `${theme}/${modern}/${slot}`);
        const before = await browser.evaluate('commandResponses.length'); now += 5;
        await browser.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
        await browser.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
        await browser.waitFor(`commandResponses.length>${before}`);
        const result = await browser.evaluate(`commandResponses[${before}]`); assert.equal(result.status, 200, errors.at(-1)?.stack);
        const payload = gdecode(result.body); assert.match(payload.innerHTML.log, slot === 1 ? /设置了陷阱/ : /经验值提高了/);
        const saved = await player(); assert.equal(Number(saved['itms' + slot]), 1); assert.ok(Number(saved.lvl) >= 2);
        const recorded = await Promise.all((await readdir(path.join(stateRoot, 'gamedata/tmp/response/0_'))).map(name => readFile(path.join(stateRoot, 'gamedata/tmp/response/0_', name), 'utf8')));
        assert.ok(recorded.includes(result.body));
        await browser.waitFor('!window.disableAllCommands');
      }
      const beforeReload = await player(); now += 5; await browser.send('Page.navigate', { url: browserBase + '/game.php' });
      await browser.waitFor(`document.readyState==='complete' && !!document.getElementById('gamecmd')`);
      const reloaded = await player(); for (const key of ['lvl', 'exp', 'itms1', 'itms2', 'wd']) assert.equal(reloaded[key], beforeReload[key]);
    }
    assert.deepEqual(browser.errors, []); assert.deepEqual(browser.networkErrors, []); await browser.close(); browser = null;
  });
  assert.deepEqual(errors, []);
});
