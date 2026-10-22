/** Real-browser regression against the upstream JS, with no npm dependencies.
 * node public/modern/browser-test.mjs
 * Optional: DTS_ENGINE_DIR, CHROME_PATH. Requires Node >= 22 and Chromium/Edge.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp, rm, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const engine = path.resolve(process.env.DTS_ENGINE_DIR || path.join(directory, '../../engine'));
const output = path.join(directory, 'test-output');
await mkdir(output, { recursive: true });
const browserCandidates = [process.env.CHROME_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'].filter(Boolean);
let browserPath;
for (const candidate of browserCandidates) { try { await access(candidate); browserPath = candidate; break; } catch {} }
if (!browserPath) throw new Error('Set CHROME_PATH to a Chromium/Edge executable.');
const requests = [];
const fixture = await readFile(path.join(directory, 'fixture.html'));
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'POST') {
      let body = ''; for await (const chunk of req) body += chunk;
      requests.push({ path: url.pathname, body: Object.fromEntries(new URLSearchParams(body)) });
      res.setHeader('Content-Type', 'text/plain');
      if (url.pathname === '/news.php') res.end(JSON.stringify({ lastnid: 2, news: { n2: '<div id="n2">Updated game news</div>' } }));
      else if (url.pathname === '/chat.php') res.end(JSON.stringify({ lastcid: 2, msg: { c2: '<div id="c2">Updated chat</div>' } }));
      else res.end(JSON.stringify({ value: {}, innerHTML: { log: 'Command accepted' }, src: {} }));
      return;
    }
    if (url.pathname === '/fixture.html' || url.pathname === '/') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(fixture); return; }
    if (url.pathname === '/map.php') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('<!doctype html><html><head><link rel="stylesheet" href="/modern/modern.css"><script defer src="/modern/modern.js"></script></head><body><div class="title">map title</div><div class="headerlink">navigation</div><div style="text-align:center"><center><table id="map_display" style="width:540px;height:240px;color:#a8d5dd;font:13px sans-serif;border-collapse:collapse">' + ['海边', '森林', '学校', '住宅区'].map((name, y) => '<tr>' + Array.from({ length: 4 }, (_, x) => '<td style="border:1px solid #354c5a;padding:14px;color:' + (x === y ? '#ebbe6d' : '#8bc4b0') + '">' + name + ' ' + (x + 1) + '</td>').join('') + '</tr>').join('') + '</table></center><div><div><div id="copyright">footer</div></div></div></div></body></html>'); return;
    }
    const base = url.pathname.startsWith('/modern/') ? directory : engine;
    const relative = url.pathname.startsWith('/modern/') ? url.pathname.slice(8) : url.pathname.slice(1);
    const filename = path.resolve(base, relative);
    if (!filename.startsWith(path.resolve(base) + path.sep)) { res.writeHead(403).end(); return; }
    const types = { '.js': 'application/javascript', '.css': 'text/css', '.gif': 'image/gif', '.png': 'image/png' };
    res.setHeader('Content-Type', types[path.extname(filename)] || 'application/octet-stream');
    res.end(await readFile(filename));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
const profile = await mkdtemp(path.join(output, 'profile-'));
const child = spawn(browserPath, ['--headless=new', '--disable-gpu', ...(process.env.DTS_BROWSER_NO_SANDBOX === '1' ? ['--no-sandbox'] : []), '--no-first-run', '--no-default-browser-check',
  '--disable-background-networking', '--remote-debugging-port=0', '--user-data-dir=' + profile, '--window-size=1440,1000', 'about:blank'],
  { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
try {
  const wsURL = await new Promise((resolve, reject) => {
    let data = '';
    const timer = setTimeout(() => reject(new Error('Browser startup timed out')), 20000);
    child.stderr.on('data', chunk => { data += chunk; const found = data.match(/DevTools listening on (ws:\/\/[^\s]+)/); if (found) { clearTimeout(timer); resolve(found[1]); } });
    child.once('error', reject); child.once('exit', code => reject(new Error('Browser exited: ' + code + ' ' + data)));
  });
  socket = new WebSocket(wsURL);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let sequence = 0; const pending = new Map(), errors = [];
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) { const job = pending.get(message.id); if (job) { pending.delete(message.id); clearTimeout(job.timer); message.error ? job.reject(message.error) : job.resolve(message.result); } }
    else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text + ': ' + (message.params.exceptionDetails.exception?.description || ''));
  });
  function cdp(method, params = {}, sessionId) { return new Promise((resolve, reject) => { const id = ++sequence; const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 15000); pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params, sessionId })); }); }
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp('Target.attachToTarget', { targetId, flatten: true });
  const send = (method, params) => cdp(method, params, sessionId);
  await send('Runtime.enable'); await send('Page.enable');
  async function evaluate(expression) {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  }
  async function waitFor(expression, timeout = 10000) {
    const until = Date.now() + timeout;
    while (Date.now() < until) { if (await evaluate(expression)) return; await new Promise(resolve => setTimeout(resolve, 40)); }
    throw new Error('Timed out: ' + expression);
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: origin + '/fixture.html' });
  await waitFor('!!window.DTSModern && !!document.getElementById("dts-mode-toggle")');
  assert.equal(await evaluate('DTSModern.getState().modern'), false, 'classic remains default');
  await evaluate(`window.originalMain=$('main');window.originalForm=$('gamecmd');window.originalChat=$('chatmsg');window.originalButton=$('zz');
    window.originalTree=$('game_interface').innerHTML;window.listenerClicks=0;$('zz').addEventListener('click',()=>listenerClicks++);
    $('oprecorder').value='';last_sender='';replay_record_DOM_path($('zz'));window.classicPath=$('oprecorder').value;
    $('chatmsg').value='unsent draft';$('chatmsg').focus();$('chatmsg').setSelectionRange(2,7);
    DTSModern.setMode(true);`);
  assert.deepEqual(await evaluate(`({modern:DTSModern.getState().modern,main:$('main')===originalMain,form:$('gamecmd')===originalForm,chat:$('chatmsg')===originalChat,
    focus:document.activeElement===originalChat,selection:[originalChat.selectionStart,originalChat.selectionEnd],draft:originalChat.value})`),
    { modern: true, main: true, form: true, chat: true, focus: true, selection: [2, 7], draft: 'unsent draft' });
  await waitFor(`document.querySelector('.dts-map-frame').contentDocument?.getElementById('map_display')?.getBoundingClientRect().height > 0`);
  assert.equal(await evaluate(`$('oprecorder').value='';last_sender='';replay_record_DOM_path($('zz'));$('oprecorder').value===classicPath`), true, 'replay recording path unchanged');
  await evaluate(`in_replay_mode=1;replay_stimulate_click(classicPath.replace(/,$/,'').split('.').filter(Boolean));in_replay_mode=0;`);
  assert.equal(await evaluate('window.listenerClicks'), 1, 'replay clicks the original node and its event listener');
  assert.equal(await evaluate(`new FormData($('gamecmd')).get('destination')`), '0', 'form control ownership preserved');
  assert.equal(await evaluate(`getComputedStyle($('newslist')).display==='block' && getComputedStyle($('chatlist')).display==='block'`), true, 'both feeds visible');
  await waitFor(`!!$('n2')`);
  assert.equal(requests.some(item => item.path === '/news.php' && item.body.sendmode === 'news' && item.body.chatmsg === ''), true, 'companion poll cannot send chat');
  await evaluate(`$('sendmode').value='send';chat('send',3000);clearTimeout(refchat);`);
  await waitFor(`!!$('c2')`);
  assert.equal(requests.some(item => item.path === '/chat.php' && item.body.chatmsg === 'unsent draft'), true, 'legacy send serializes original form');
  await evaluate(`postCmd('gamecmd','command.php');`);
  await waitFor(`$('log').textContent==='Command accepted'`);
  assert.equal(requests.some(item => item.path === '/command.php' && item.body.destination === '0' && item.body.game_roomid === '1'), true, 'legacy command sends unchanged form fields');
  await evaluate(`document.querySelector('[data-panel="equipment"] .dts-panel-minimize').click()`);
  assert.equal(await evaluate(`DTSModern.getState().panels.find(x=>x.id==='equipment').layout.minimized`), true);
  await evaluate(`document.querySelector('.dts-dock-item[data-panel="equipment"]').click()`);
  assert.equal(await evaluate(`DTSModern.getState().panels.find(x=>x.id==='equipment').layout.minimized`), false);
  await evaluate(`window.beforeX=DTSModern.getState().panels.find(x=>x.id==='status').layout.x;document.querySelector('[data-panel="status"] .dts-panel-handle').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));`);
  assert.equal(await evaluate(`DTSModern.getState().panels.find(x=>x.id==='status').layout.x-beforeX`), 12, 'keyboard moves window');
  // Native pointer events exercise capture, geometry and the resize handle in Chromium.
  const header = await evaluate(`(()=>{let r=document.querySelector('[data-panel="commands"] .dts-panel-handle').getBoundingClientRect();return {x:r.x+45,y:r.y+16}})()`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: header.x, y: header.y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: header.x + 38, y: header.y + 45, button: 'left', buttons: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: header.x + 38, y: header.y + 45, button: 'left', clickCount: 1 });
  assert.equal(await evaluate(`DTSModern.getState().panels.find(x=>x.id==='commands').layout.y`), 45, 'pointer drags window');
  const grip = await evaluate(`(()=>{let r=document.querySelector('[data-panel="commands"] .dts-panel-resize').getBoundingClientRect();return {x:r.x+10,y:r.y+10}})()`);
  const beforeHeight = await evaluate(`DTSModern.getState().panels.find(x=>x.id==='commands').layout.h`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: grip.x, y: grip.y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: grip.x, y: grip.y + 30, button: 'left', buttons: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: grip.x, y: grip.y + 30, button: 'left', clickCount: 1 });
  assert.equal(await evaluate(`DTSModern.getState().panels.find(x=>x.id==='commands').layout.h`), beforeHeight + 30, 'pointer resizes window');
  await evaluate(`DTSModern.setMode(false);`);
  assert.equal(await evaluate(`$('zz')===originalButton && $('gamecmd')===originalForm && $('chatmsg')===originalChat && $('zz').closest('#game_interface')!==null`), true);
  assert.equal(await evaluate(`getComputedStyle($('newslist')).display`), 'none', 'classic feed visibility restored');
  assert.equal(await evaluate(`document.querySelector('meta[name="viewport"]').content`), 'width=1050px,initial-scale=1.0');
  // AJAX replaces the whole main and command roots, as real command_act.php does.
  await evaluate(`DTSModern.setMode(true);in_replay_mode=1;showData(JSON.stringify({value:{},src:{},innerHTML:{main:'<div id="new-main">Fresh server main</div>',cmd_interface:'<div id="log">fresh log</div><form id="gamecmd" name="gamecmd"><input id="oprecorder" name="oprecorder"><input id="templateid" value="1"><div id="cmd"><input id="zz" type="button" value="Fresh command" onclick="window.freshClick=true"></div></form>'}}));in_replay_mode=0;`);
  assert.equal(await evaluate(`document.querySelectorAll('#gamecmd').length===1 && document.querySelectorAll('#zz').length===1 && $('new-main').closest('[data-panel="status"]')!==null && $('zz').closest('[data-panel="commands"]')!==null`), true, 'AJAX replacements remount without stale IDs');
  await evaluate(`$('zz').click();DTSModern.setMode(false);`);
  assert.equal(await evaluate(`freshClick && $('new-main').closest('#game_interface')!==null`), true);
  await evaluate(`DTSModern.setMode(true);DTSModern.resetLayout();document.querySelector('[data-panel="status"] .dts-panel-handle').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));`);
  await send('Page.reload', {}); await waitFor(`window.DTSModern && document.getElementById('dts-mode-toggle') && DTSModern.getState().modern`);
  assert.equal(await evaluate(`DTSModern.getState().modern`), true, 'mode survives reload');
  assert.equal(await evaluate(`DTSModern.getState().panels.find(x=>x.id==='status').layout.y`), 12, 'window geometry survives reload');
  await evaluate(`DTSModern.resetLayout();`);
  await waitFor(`document.querySelector('.dts-map-frame').contentDocument?.getElementById('map_display')?.getBoundingClientRect().height > 0`);
  assert.equal(await evaluate(`document.querySelector('.dts-map-frame').contentDocument.querySelector('#dts-toolbar')===null`), true, 'embedded map does not nest another workspace');
  await writeFile(path.join(output, 'desktop.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await waitFor(`document.documentElement.classList.contains('dts-compact')`);
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=window.innerWidth`), true, 'mobile shell has no page-level horizontal overflow');
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  const touchStart = await evaluate(`(()=>{let r=document.querySelector('[data-panel="status"] .dts-panel-handle').getBoundingClientRect();return {x:r.x+45,y:r.y+16}})()`);
  const touchEnd = await evaluate(`(()=>{let r=document.querySelector('[data-panel="commands"]').getBoundingClientRect();return {x:r.x+45,y:r.y+r.height*.7}})()`);
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...touchStart, id: 1 }] });
  await send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...touchEnd, id: 1 }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  assert.equal(await evaluate(`(()=>{let p=DTSModern.getState().panels;return p.find(x=>x.id==='status').layout.order>p.find(x=>x.id==='commands').layout.order})()`), true, 'touch drag reorders compact windows');
  await evaluate(`document.querySelector('[data-panel="status"] .dts-panel-handle').dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));`);
  assert.equal(await evaluate(`DTSModern.getState().panels.find(x=>x.id==='status').layout.minimized`), true, 'keyboard minimizes window');
  await evaluate(`DTSModern.resetLayout();window.scrollTo(0,0);`);
  await writeFile(path.join(output, 'mobile.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
  assert.deepEqual(errors, [], 'no browser runtime exceptions');
  const report = { result: 'PASS', checks: ['legacy identity and event listeners', 'draft/focus/selection', 'recording path', 'replay target', 'form ownership and command submission', 'chat/news requests', 'minimize/restore', 'keyboard movement and minimization', 'pointer drag/resize', 'classic restoration', 'whole-root AJAX replacement', 'mode and geometry persistence', 'real map iframe', 'mobile overflow', 'touch reordering'], screenshots: ['desktop.png', 'mobile.png'] };
  await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await cdp('Browser.close').catch(() => {});
} finally {
  socket?.close(); child.kill(); await new Promise(resolve => server.close(resolve));
  // Only remove the fresh temporary profile inside this test output directory.
  if (path.resolve(profile).startsWith(path.resolve(output) + path.sep)) await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(() => {});
}
