/** Opt-in local integration test. It starts/joins a game ONLY in an isolated test DB.
 * DTS_LIVE_TEST_ACK=isolated node public/modern/live-test.mjs
 * Reads root .env without logging credentials. All browser requests outside the
 * configured localhost origin are blocked, including legacy analytics resources.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir, mkdtemp, rm, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(directory, '../..');
try { process.loadEnvFile(path.join(project, '.env')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const origin = new URL(process.env.DTS_LIVE_URL || process.env.PUBLIC_URL || 'http://localhost:3000');
if (!['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname)) throw new Error('Live tests only accept a localhost service.');
if (process.env.DTS_LIVE_TEST_ACK !== 'isolated' || !/(?:test|smoke|dev)/i.test(process.env.DB_NAME || '')) {
  throw new Error('Use an isolated test DB and set DTS_LIVE_TEST_ACK=isolated. This test changes only that game.');
}
const username = process.env.ADMIN_USER, password = process.env.ADMIN_PASSWORD;
if (!username || !password) throw new Error('Test admin credentials are missing from .env.');
const health = await fetch(new URL('/healthz', origin), { signal: AbortSignal.timeout(5000) });
if (!health.ok || (await health.json()).status !== 'ready') throw new Error('Local service is not ready yet.');
const output = path.join(project, 'artifacts', 'ui-live');
await mkdir(output, { recursive: true });
const candidates = [process.env.CHROME_PATH, path.join(project, 'var/tools/playwright/chromium-1234/chrome-win64/chrome.exe'),
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/chromium'].filter(Boolean);
let executable;
for (const candidate of candidates) { try { await access(candidate); executable = candidate; break; } catch {} }
if (!executable) throw new Error('Set CHROME_PATH to a Chromium executable.');
const temporary = path.join(directory, 'test-output');
await mkdir(temporary, { recursive: true });
const profile = await mkdtemp(path.join(temporary, 'live-profile-'));
const child = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  ...(process.env.DTS_BROWSER_NO_SANDBOX === '1' ? ['--no-sandbox'] : []), '--disable-background-networking',
  '--remote-debugging-port=0', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let socket, captureFailure;
const captureOnly = process.env.DTS_LIVE_CAPTURE_ONLY === '1';
const scenario = captureOnly ? 'capture' : process.env.DTS_LIVE_ROOM_ONLY === '1' ? 'room' : 'game';
const report = { result: 'RUNNING', scenario, checks: [], screenshots: [], blockedExternalRequests: 0, actions: [], browserErrors: [], requests: [] };
async function saveReport() {
  const serialized = JSON.stringify(report, null, 2);
  await writeFile(path.join(output, 'report-' + scenario + '.json'), serialized);
  await writeFile(path.join(output, 'report.json'), serialized);
}
try {
  const address = await new Promise((resolve, reject) => {
    let buffer = ''; const timer = setTimeout(() => reject(new Error('Chromium startup timeout')), 20000);
    child.stderr.on('data', chunk => { buffer += chunk; const match = buffer.match(/DevTools listening on (ws:\/\/[^\s]+)/); if (match) { clearTimeout(timer); resolve(match[1]); } });
    child.once('error', reject); child.once('exit', code => reject(new Error('Chromium exited: ' + code)));
  });
  socket = new WebSocket(address);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  const pending = new Map(); let sequence = 0, session;
  function cdp(method, params = {}, sessionId) {
    return new Promise((resolve, reject) => {
      const id = ++sequence, timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 30000);
      pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params, sessionId }));
    });
  }
  const send = (method, params) => cdp(method, params, session);
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const item = pending.get(message.id); if (!item) return;
      clearTimeout(item.timer); pending.delete(message.id);
      message.error ? item.reject(message.error) : item.resolve(message.result);
    } else if (message.method === 'Runtime.exceptionThrown') {
      const error = message.params.exceptionDetails;
      report.browserErrors.push(error.exception?.description || error.text);
    } else if (message.method === 'Network.responseReceived') {
      const response = message.params.response, pathname = new URL(response.url).pathname;
      if (pathname.endsWith('.php')) {
        report.requests.push({ path: pathname, status: response.status, bytes: response.encodedDataLength, duration: response.timing?.receiveHeadersEnd });
      }
    } else if (message.method === 'Fetch.requestPaused') {
      const request = message.params, url = new URL(request.request.url);
      const allowed = url.origin === origin.origin || ['data:', 'blob:', 'about:'].includes(url.protocol);
      if (!allowed) report.blockedExternalRequests++;
      cdp(allowed ? 'Fetch.continueRequest' : 'Fetch.failRequest', allowed ? { requestId: request.requestId } : { requestId: request.requestId, errorReason: 'BlockedByClient' }, message.sessionId).catch(() => {});
    }
  });
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank' });
  session = (await cdp('Target.attachToTarget', { targetId, flatten: true })).sessionId;
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1100, deviceScaleFactor: 1, mobile: false });
  async function evaluate(expression) {
    const data = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
    if (data.exceptionDetails) throw new Error(data.exceptionDetails.exception?.description || data.exceptionDetails.text);
    return data.result.value;
  }
  async function waitFor(expression, timeout = 60000) {
    const until = Date.now() + timeout;
    while (Date.now() < until) {
      try { if (await evaluate(expression)) return; } catch (error) { if (!/context|Execution/.test(String(error))) throw error; }
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    const body = await evaluate('document.body?.innerText.slice(0,2400)').catch(() => 'Unavailable');
    throw new Error('Timed out waiting for page condition. Visible page: ' + body);
  }
  async function navigate(relative) {
    await send('Page.navigate', { url: new URL(relative, origin).href });
    await waitFor(`document.readyState === 'complete' && location.origin === ${JSON.stringify(origin.origin)} && location.pathname !== '/blank'`);
  }
  async function click(selector) {
    await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});if(!n)throw new Error('UI control unavailable');n.click()})()`);
  }
  async function screenshot(filename) {
    await writeFile(path.join(output, filename), Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
    report.screenshots.push(filename);
  }
  captureFailure = () => screenshot('live-failure.png');
  async function inspect() {
    return evaluate(`({path:location.pathname,mode:document.getElementById('mode')?.value,command:document.getElementById('command')?.value,
      buttons:Array.from(document.querySelectorAll('#cmd input[type="button"]')).map(n=>({id:n.id,value:n.value,disabled:n.disabled})),
      log:document.getElementById('log')?.innerText.slice(0,1800),notice:document.getElementById('notice')?.innerText,
      error:document.getElementById('error')?.innerText.slice(0,1800),location:document.getElementById('pls')?.innerText})`);
  }
  async function arm() {
    await evaluate(`(()=>{if(window.__dtsLiveArmed)return;window.__dtsLiveArmed=true;window.__dtsLiveResponses=0;const original=window.showData;
      const wrapped=function(){try{return original.apply(this,arguments)}finally{window.__dtsLiveResponses++}};wrapped.dtsModernWrapped=true;window.showData=wrapped})()`);
  }
  async function action(label, expression) {
    console.log('ACTION ' + label);
    await waitFor(`typeof hotkey_ok==='undefined'||hotkey_ok`);
    await waitFor(`typeof ms==='undefined'||ms<=0`, 15000);
    const before = await evaluate('window.__dtsLiveResponses||0');
    await evaluate(expression);
    await waitFor(`(window.__dtsLiveResponses>${before} && hotkey_ok) || /Internal Server Error|Bad Gateway|Service Unavailable/.test(document.getElementById('notice')?.textContent || '')`);
    const snapshot = await inspect();
    report.actions.push({ label, ...snapshot });
    if (/Internal Server Error|Bad Gateway|Service Unavailable/.test(snapshot.notice || '') || snapshot.error && /Fatal error|Uncaught|Warning:/.test(snapshot.error)) throw new Error('Server-side failure after ' + label);
    console.log('PASS action: ' + label);
  }
  async function settle() {
    for (let attempt = 0; attempt < 8; attempt++) {
      if (await evaluate(`!!document.getElementById('shooting_skip')`)) {
        await action('skip opening through original control', `document.getElementById('shooting_skip').click()`);
        continue;
      }
      if (await evaluate(`!!document.getElementById('moveto') && !!document.getElementById('zz')`)) return;
      const candidate = await evaluate(`(()=>{const nodes=Array.from(document.querySelectorAll('#cmd input[type="button"]')).filter(n=>!n.disabled);
        for(const text of ['跳过剧情','拾取','逃跑','返回','继续']){const n=nodes.find(n=>n.value.includes(text));if(n)return {id:n.id,value:n.value}}
        return null})()`);
      if (!candidate) throw new Error('Game requires a decision outside the safe test actions: ' + JSON.stringify(await inspect()));
      await action(candidate.value, `Array.from(document.querySelectorAll('#cmd input[type="button"]')).find(n=>n.value===${JSON.stringify(candidate.value)}).click()`);
    }
    throw new Error('Could not return to ordinary command screen.');
  }
  async function roomScenario() {
    await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1100, deviceScaleFactor: 1, mobile: false });
    await navigate('/index.php');
    await waitFor(`location.pathname==='/index.php' && !!window.DTSModern && !!document.forms.togame`);
    await evaluate(`DTSModern.setMode(true)`);
    const inRoom = await evaluate(`!!document.forms.roomcmd`);
    let roomEntry = 'rejoined existing local waiting room';
    if (!inRoom) {
      const existing = await evaluate(`(()=>{const entry=Array.from(document.querySelectorAll('input[onclick]')).find(n=>n.getAttribute('onclick').includes('room_enter(')&&n.closest('tr')?.textContent.includes('SOLO模式')&&n.closest('tr')?.textContent.includes(${JSON.stringify(username)}));if(entry){entry.click();return true}return false})()`);
      if (existing) roomEntry = 'entered existing SOLO waiting room through original UI';
      else {
        await evaluate(`Array.from(document.querySelectorAll('input[type="button"]')).find(n=>n.value==='新建一个房间').click()`);
        await evaluate(`Array.from(document.querySelectorAll('a[onclick]')).find(n=>n.textContent.trim()==='SOLO模式'&&n.getAttribute('onclick').includes('command=newroom')).click()`);
        roomEntry = 'created and entered SOLO waiting room through original UI';
      }
    }
    await waitFor(`!!document.forms.roomcmd && document.getElementById('roommain')?.innerText.includes('离开房间')`, 120000);
    report.checks.push(roomEntry);
    const message = 'LOCAL UI TEST ' + Date.now();
    await evaluate(`(()=>{const input=document.getElementById('chatmsg');window.__roomChat=input;input.value=${JSON.stringify(message)};DTSModern.setMode(false);DTSModern.setMode(true);if(input!==document.getElementById('chatmsg')||input.value!==${JSON.stringify(message)})throw new Error('Room chat input was replaced');document.querySelector('#sendchat button').click()})()`);
    await waitFor(`document.getElementById('chatdata-text')?.innerText.includes(${JSON.stringify(message)})`, 120000);
    assert.equal(await evaluate(`document.getElementById('chatdata-text').innerText.split(${JSON.stringify(message)}).length-1`), 1, 'room chat sent exactly once');
    report.checks.push('local room chat delivered exactly once and mode switch preserved draft/node');
    await screenshot('live-room.png');
    await evaluate(`Array.from(document.querySelectorAll('#roommain .glow_buttons')).find(n=>n.textContent.trim()==='离开房间').click()`);
    await waitFor(`location.pathname==='/index.php' && !document.forms.roomcmd && document.body.innerText.includes('你不在任何一个房间中')`, 120000);
    report.checks.push('left waiting room through original UI');
    console.log('PASS room creation, local chat and leave');
  }

  await navigate('/login.php'); await waitFor(`!!document.querySelector('form[name="login"]')`);
  // Values are passed directly to the local page, never to a log or an artifact.
  await evaluate(`(()=>{const form=document.forms.login;form.elements.username.value=${JSON.stringify(username)};form.elements.password.value=${JSON.stringify(password)};form.requestSubmit()})()`);
  await waitFor(`location.pathname.endsWith('/index.php') && !!document.forms.togame`);
  report.checks.push('real administrator login'); console.log('PASS login');
  let item;
  if (process.env.DTS_LIVE_ROOM_ONLY !== '1') {
  if (await evaluate(`!!document.forms.roomcmd`)) {
    if (captureOnly) throw new Error('Capture-only mode requires the test user to be outside a waiting room.');
    await waitFor(`document.getElementById('roommain')?.innerText.includes('离开房间')`, 120000);
    await evaluate(`Array.from(document.querySelectorAll('#roommain .glow_buttons')).find(n=>n.textContent.trim()==='离开房间').click()`);
    await waitFor(`location.pathname==='/index.php' && !document.forms.roomcmd`, 120000);
    report.checks.push('left previous waiting room through original UI before main game test');
  }
  if (!captureOnly) {
  await navigate('/admin.php?mode=gameinfomng'); await waitFor(`!!document.forms.gameinfomng`);
  if (process.env.DTS_LIVE_RESTART_GAME === '1' && await evaluate(`!!document.querySelector('form[name="gameinfomng"] input[value="结束游戏"]')`)) {
    await click(`form[name="gameinfomng"] input[value="结束游戏"]`);
    await waitFor(`!!document.querySelector('form[name="gameinfomng"] input[value="开始游戏"]')`, 120000);
    report.checks.push('ended previous isolated test round through original administrator form');
  }
  const canStart = await evaluate(`!!Array.from(document.forms.gameinfomng.querySelectorAll('input[type="submit"]')).find(n=>n.value==='开始游戏')`);
  if (canStart) {
    await click(`form[name="gameinfomng"] input[value="开始游戏"]`);
    await waitFor(`document.body.innerText.includes('游戏立即开始')`);
    report.checks.push('game started through original administrator form');
  } else report.checks.push('existing test game already active');
  }
  await navigate('/game.php');
  await waitFor(`!!document.forms.valid || !!document.getElementById('game_interface') || document.body.innerText.includes('游戏尚未')`);
  if (await evaluate('!!document.forms.valid')) {
    if (captureOnly) throw new Error('Capture-only mode requires an already active test participant.');
    await click(`form[name="valid"] input[type="submit"]`);
    await waitFor(`location.pathname.endsWith('/game.php') && !!document.getElementById('game_interface')`, 120000);
    report.checks.push('participant activation through original card/profile form');
  }
  await waitFor(`!!window.DTSModern && !!document.getElementById('gamecmd') && hotkey_ok`, 120000);
  await arm(); if (!captureOnly) await settle();
  await evaluate(`DTSModern.setMode(true);DTSModern.resetLayout();window.__originalGameForm=document.getElementById('gamecmd');window.__originalChatInput=document.getElementById('chatmsg');`);
  assert.equal(await evaluate(`DTSModern.getState().modern`), true);
  report.checks.push('modern workspace mounts real game');
  if (!captureOnly) {
  const previousLocation = await evaluate(`document.getElementById('pls')?.innerText`);
  const destination = await evaluate(`Array.from(document.getElementById('moveto').options).find(n=>/^[0-9]+$/.test(n.value) && !n.disabled)?.value`);
  assert.ok(destination, 'a real destination is available');
  await action('move', `(()=>{const select=document.getElementById('moveto');select.value=${JSON.stringify(destination)};select.dispatchEvent(new Event('change',{bubbles:true}))})()`); await settle();
  assert.notEqual(await evaluate(`document.getElementById('pls')?.innerText`), previousLocation, 'server move changes the actual location');
  assert.equal(await evaluate(`document.getElementById('zz').disabled`), false, 'exploration is permitted at the destination');
  await action('explore', `document.getElementById('zz').click()`); await settle();
  item = await evaluate(`(()=>{const nodes=Array.from(document.querySelectorAll('#cmd .itmsingle input[type="button"]')).filter(n=>n.value.includes('使用')&&!n.disabled);
    return (nodes.find(n=>n.parentElement.textContent.includes('矿泉水'))||nodes.find(n=>n.title.includes('体力'))||nodes[0])?.id})()`);
  if (item) {
    const beforeItem = await evaluate(`document.getElementById(${JSON.stringify(item)}).parentElement.textContent`);
    await action('use carried item', `document.getElementById(${JSON.stringify(item)}).click()`); await settle();
    assert.notEqual(await evaluate(`document.getElementById(${JSON.stringify(item)})?.parentElement.textContent`), beforeItem, 'server item use changes carried stack');
    report.checks.push('carried consumable stack changed through original item command');
  }
  else report.checks.push('no usable carried item; item check pending');
  }
  await evaluate(`document.getElementById('chatmsg').value='local unsent test draft';DTSModern.setMode(false);`);
  assert.equal(await evaluate(`document.getElementById('chatmsg')===window.__originalChatInput && document.getElementById('chatmsg').value==='local unsent test draft'`), true);
  report.checks.push('classic switch preserves original chat node and unsent draft');
  await screenshot('live-classic.png');
  if (!captureOnly) { await action('classic explore', `document.getElementById('zz').click()`); await settle(); }
  await evaluate(`DTSModern.setMode(true);document.getElementById('chatmsg').value='';DTSModern.resetLayout();window.scrollTo(0,0);`);
  await waitFor(`document.querySelector('.dts-map-frame')?.contentDocument?.getElementById('map_display')?.getBoundingClientRect().height > 0`, 60000);
  report.checks.push('real same-origin map rendered using session cookies');
  await waitFor(`(()=>{const text=document.getElementById('newslist')?.innerText||'';return text.trim().length>0&&!text.includes('正在拉取')})()`, 60000);
  report.checks.push('real game news feed is visible beside chat');
  await screenshot('live-desktop.png');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await waitFor(`document.documentElement.classList.contains('dts-compact')`);
  assert.equal(await evaluate('document.documentElement.scrollWidth<=window.innerWidth'), true);
  report.checks.push('real game mobile workspace fits viewport');
  await screenshot('live-mobile.png');
  }
  if (process.env.DTS_LIVE_ROOMS === '1' || process.env.DTS_LIVE_ROOM_ONLY === '1') await roomScenario();
  assert.deepEqual(report.browserErrors, [], 'no real-page JavaScript exceptions');
  report.result = captureOnly || item || process.env.DTS_LIVE_ROOM_ONLY === '1' ? 'PASS' : 'PARTIAL';
  await saveReport();
  console.log(JSON.stringify({ result: report.result, checks: report.checks, screenshots: report.screenshots, blockedExternalRequests: report.blockedExternalRequests, browserErrorCount: report.browserErrors.length }, null, 2));
  await cdp('Browser.close').catch(() => {});
} catch (error) {
  report.result = 'FAILED'; report.failure = String(error.message || error);
  await captureFailure?.().catch(() => {});
  await saveReport();
  throw error;
} finally {
  socket?.close(); child.kill();
  if (path.resolve(profile).startsWith(path.resolve(temporary) + path.sep)) await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(() => {});
}
