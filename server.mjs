import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { readConfig } from './runtime/config.mjs';
import { prepareEngine } from './runtime/prepare.mjs';
import { createPhpRuntimePool } from './runtime/php-runtime.mjs';
import { acquireStateLock } from './runtime/state-lock.mjs';
import { runtimeOptions, installEngine, compileEngine, isInstalled, needsCompile } from './runtime/lifecycle.mjs';
import { decodePath, staticAllowed, injectModern, readBody, serveStatic, roomLongPoll, needsModuleManagerNotice, requestClientAddress, stripProxyIpHeaders } from './runtime/http.mjs';

const config = readConfig();
const releaseStateLock = acquireStateLock(config);
let externalPool, internalPool, botPool, ready = false, stopping = false;
let publicServer;
const listeners = new Set();
const blocked = new Set(['install_NEW.php','daemonmng.php','gencode_transformer.php','modulemng_activate.php']);
const roots = new Set((await fs.readdir(config.sourceRoot)).filter(name => name.endsWith('.php') && !blocked.has(name)));

function fail(res, status, text) { if (!res.headersSent) res.writeHead(status, { 'Content-Type':'text/plain; charset=utf-8', 'Cache-Control':'no-store' }); res.end(text); }
async function handle(req, res, internal = false) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  const pathname = decodePath(req.url || '/');
  if (!pathname) return fail(res, 400, 'Invalid path');
  if (pathname === '/healthz') { res.writeHead(ready ? 200 : 503, { 'Content-Type':'application/json', 'Cache-Control':'no-store' }); return res.end(JSON.stringify({status:ready?'ready':'starting',runtime:'node-wasm',version:'0.1.0'})); }
  if (!ready && !(internal && stopping && internalPool)) return fail(res, 503, 'DTS-X 正在启动或停止，请稍后重试。');
  if (!['GET','HEAD','POST'].includes(req.method)) return fail(res, 405, 'Method not allowed');
  try {
    if (pathname.startsWith('/modern/')) {
      if (!['/modern/modern.js','/modern/modern.css'].includes(pathname)) return fail(res,404,'Not found');
      if (await serveStatic(req,res,path.join(config.projectRoot,'public'),pathname)) return;
    }
    if (staticAllowed(pathname) && await serveStatic(req,res,config.engineRoot,pathname)) return;
    const moduleNotice = needsModuleManagerNotice(pathname, req.url);
    if (!moduleNotice && (pathname.slice(1).includes('/') || !roots.has(pathname.slice(1)))) return fail(res,404,'Not found');
    const body = await readBody(req, config.maxBody);
    const params = new URLSearchParams(body.toString('utf8'));
    // NPC callbacks may be made while a normal command is holding its VM.
    const pool = internal ? (params.get('mode') === 'bot' ? botPool : internalPool) : externalPool;
    if (pool.pending >= 100) return fail(res,503,'服务器繁忙，请稍后重试。');
    const request = {
      scriptPath:moduleNotice ? '/runtime/module-manager.php' : '/game'+pathname,
      relativeUri:req.url, method:req.method, body, protocol:new URL(config.publicUrl).protocol.slice(0,-1),
      // PHP must return uncompressed HTML for shell injection. The reverse proxy
      // may still compress the final response sent by Node.
      headers:{...stripProxyIpHeaders(req.headers), 'accept-encoding':'identity', host:new URL(config.publicUrl).host},
      server:{ REMOTE_ADDR:requestClientAddress(req, config.trustProxy), SERVER_NAME:new URL(config.publicUrl).hostname, SERVER_PORT:new URL(config.publicUrl).port || (config.publicUrl.startsWith('https:')?'443':'80'), HTTPS:config.publicUrl.startsWith('https:')?'on':'off' },
    };
    let disconnected = false; res.on('close', () => { disconnected = true; });
    let result = pathname === '/roomupdate.php'
      ? await roomLongPoll(r => pool.run(r), request, () => disconnected || stopping)
      : await pool.run(request);
    if (disconnected) return;
    if (result.exitCode || result.httpStatusCode >= 500) {
      await fs.appendFile(path.join(config.stateRoot,'php-errors.log'), `${new Date().toISOString()} ${pathname}\n${result.errors}\n`);
      return fail(res,500,'游戏执行失败，请查看服务器 var/php-errors.log。');
    }
    for (const [key, values] of Object.entries(result.headers)) {
      if (['content-length','connection','transfer-encoding','keep-alive','x-powered-by'].includes(key.toLowerCase())) continue;
      res.setHeader(key.toLowerCase() === 'set-cookie' ? 'Set-Cookie' : key, values);
    }
    let bytes = Buffer.from(result.bytes);
    const contentType = String(res.getHeader('content-type') || '');
    if (!internal && !res.getHeader('content-encoding') && /text\/html/i.test(contentType) && /<head[\s>]/i.test(result.text)) bytes = Buffer.from(injectModern(result.text));
    res.setHeader('Cache-Control','no-store');
    res.setHeader('Content-Length', bytes.length);
    res.writeHead(result.httpStatusCode || 200);
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch (error) { console.error(`Request failed (${pathname}): ${error.message}`); if (!res.destroyed) fail(res,error.status || 500,'请求处理失败。'); }
}
const internalServer = http.createServer((req,res) => { void handle(req,res,true); });
await new Promise((resolve,reject) => { internalServer.once('error',reject); internalServer.listen(0,'127.0.0.1',resolve); });
listeners.add(internalServer);
try {
  const internalUrl = `http://127.0.0.1:${internalServer.address().port}`;
  await prepareEngine(config, { internalUrl });
  if (!await isInstalled(config)) {
    if (!config.autoSetup) throw new Error('Run npm run setup first, or set AUTO_SETUP=1 with an empty database.');
    await installEngine(config);
  }
  if (await needsCompile(config)) await compileEngine(config);
  externalPool = await createPhpRuntimePool({ ...runtimeOptions(config), size:config.workers });
  internalPool = await createPhpRuntimePool({ ...runtimeOptions(config), size:config.internalWorkers });
  botPool = await createPhpRuntimePool({ ...runtimeOptions(config), size:2 });
  ready = true;
  const server = http.createServer((req,res) => { void handle(req,res); });
  publicServer = server;
  server.requestTimeout = 180000;
  await new Promise((resolve,reject) => { server.once('error',reject); server.listen(config.port,config.host,resolve); });
  listeners.add(server);
  console.log(`DTS-X ready at ${config.publicUrl} (${config.host}:${config.port}); ${config.workers}+${config.internalWorkers}+2 isolated PHP workers, no external daemon.`);
  let maintaining = false;
  const maintenance = async () => {
    if (!ready || maintaining) return;
    maintaining = true;
    try { const response = await internalPool.run({scriptPath:'/game/command.php',relativeUri:'/command.php',method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:'command=maintain'}); if(response.exitCode) console.error('Maintenance failed:',response.errors); }
    catch (error) { console.error('Maintenance failed:',error.message); }
    finally { maintaining = false; }
  };
  // Upstream applies its own 24-hour maintenance throttle. Timers only trigger it.
  const timer = config.maintenance ? setInterval(() => { void maintenance(); }, 300000) : null;
  timer?.unref();
  if (config.maintenance) void maintenance();
  async function shutdown() {
    if (stopping) return; stopping = true; ready = false; clearInterval(timer);
    // Outer PHP requests can still need internal curl/NPC callbacks while they
    // drain. Closing all listeners/pools together would break in-flight moves.
    publicServer?.close();
    try {
      await externalPool?.close();
      await internalPool?.close();
      await botPool?.close();
    } catch (error) {
      console.error('Shutdown failed:', error.message);
      process.exitCode = 1;
    } finally {
      internalServer.close();
      releaseStateLock();
      if (process.connected) process.disconnect();
    }
  }
  process.on('SIGTERM',shutdown); process.on('SIGINT',shutdown);
  // A parent Node supervisor/test runner can request the same graceful shutdown
  // on Windows, where process.kill(SIGTERM) does not deliver a POSIX signal.
  if (process.connected) process.on('message', message => { if (message?.type === 'dtsx:shutdown') void shutdown(); });
} catch (error) {
  for (const listener of listeners) listener.close();
  await Promise.allSettled([externalPool?.close(),internalPool?.close(),botPool?.close()]);
  releaseStateLock();
  console.error(error.message); process.exitCode = 1;
}
