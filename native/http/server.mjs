import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseRequest, RequestError } from './request.mjs';
import { createMaintenanceGate } from './maintenance.mjs';

const mime = { '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.bmp':'image/bmp', '.png':'image/png', '.gif':'image/gif', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.woff':'font/woff', '.woff2':'font/woff2', '.ttf':'font/ttf', '.mp3':'audio/mpeg', '.ogg':'audio/ogg', '.wav':'audio/wav', '.mp4':'video/mp4', '.webmanifest':'application/manifest+json' };
export function decodeGamePath(url) {
  let decoded;
  try { decoded = decodeURIComponent(url.split('?',1)[0]); } catch { return null; }
  if (!decoded.startsWith('/') || /[\\\0]/.test(decoded) || decoded.split('/').some(part => part === '..' || part.startsWith('.'))) return null;
  return decoded === '/' ? '/index.php' : decoded;
}
export function publicResource(relative) {
  const ext = path.posix.extname(relative).toLowerCase();
  if (!mime[ext]) return false;
  if (/^\/(?:img|map)\//.test(relative)) return true;
  if (/^\/include\/javascript\//.test(relative)) return ['.js','.css','.png','.gif'].includes(ext);
  if (/^\/gamedata\/(?:replays|remote_replays)\//.test(relative)) return ['.js','.png','.gif','.bmp'].includes(ext);
  if (/^\/gamedata\/(?:css|javascript)\//.test(relative)) return ['.js','.css','.png','.gif'].includes(ext);
  return /^\/[\w.-]+$/.test(relative) && ['.png','.ico','.webmanifest'].includes(ext);
}
const contained = (target, root) => target.startsWith(root + path.sep);
export async function serveResource(request, response, root, relative) {
  const absolute = path.resolve(root, '.' + relative);
  if (!contained(absolute, path.resolve(root))) return false;
  let file, stat;
  try {
    file = await fs.realpath(absolute);
    if (!contained(file, await fs.realpath(root))) return false;
    stat = await fs.stat(file); if (!stat.isFile()) return false;
  } catch (error) { if (['ENOENT','ENOTDIR'].includes(error.code)) return false; throw error; }
  const etag = `"${stat.size.toString(16)}-${Math.trunc(stat.mtimeMs).toString(16)}"`;
  response.setHeader('ETag', etag); response.setHeader('Cache-Control', 'public, max-age=300');
  response.setHeader('Content-Type', mime[path.extname(file).toLowerCase()] ?? 'application/octet-stream');
  if (request.headers['if-none-match'] === etag) { response.writeHead(304).end(); return true; }
  const body = request.method === 'HEAD' ? undefined : await fs.readFile(file);
  response.setHeader('Content-Length', body?.length ?? stat.size); response.writeHead(200).end(body); return true;
}

/** HTTP transport for native controllers. dispatch owns one request session
 * and releases its database/user/player locks in finally. Private state is
 * never a general document root, and source/configuration code is not served.
 */
export function createNativeHttpServer({ sourceRoot, stateRoot, modernRoot, publicUrl, dispatch, maxBytes = 64 * 1024 * 1024, trustProxy = false,
  onError = () => {}, modern = true, health = () => ({ runtime: 'native-node', ready: false }), shutdownTimeoutMs = 30_000, maintenance = createMaintenanceGate(), clock = { now: () => Date.now() / 1000 } } = {}) {
  if (typeof dispatch !== 'function') throw new TypeError('Native HTTP requires real request controllers');
  if (typeof sourceRoot !== 'string' || !path.isAbsolute(sourceRoot)) throw new TypeError('Native HTTP requires an absolute source resource root');
  if (typeof clock?.now !== 'function') throw new TypeError('Native HTTP requires a clock.now() function');
  const origin = new URL(publicUrl);
  if (!['http:','https:'].includes(origin.protocol) || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw new TypeError('Public URL must be an HTTP origin');
  const requests = new Map(); let closing = false, closed;
  const server = http.createServer(async (request, response) => {
    response.setHeader('Referrer-Policy','same-origin');response.setHeader('X-Frame-Options','SAMEORIGIN');
    const abort = new AbortController(); let finished;
    requests.set(abort, new Promise(resolve => { finished = resolve; }));
    response.on('close', () => { if (!response.writableEnded) abort.abort(); });
    const send = (status, body, headers = {}) => {
      const bytes = Buffer.isBuffer(body) ? body : Buffer.from(body ?? '');
      const normalized={};
      for(const [name,value] of Object.entries(headers)) {
        // Original curl_post matches the canonical spelling case-sensitively.
        // Each cookie stays a separate header; commas also occur in Expires.
        if(name.toLowerCase()==='set-cookie')normalized['Set-Cookie']=[...(normalized['Set-Cookie']??[]),...([].concat(value))];
        else normalized[name]=value;
      }
      response.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', ...normalized, 'Content-Length':bytes.length });
      response.end(request.method === 'HEAD' ? undefined : bytes);
    };
    try {
      const pageStartTime = clock.now();
      if (!Number.isFinite(pageStartTime)) throw new TypeError('Native HTTP clock must return finite epoch seconds');
      if (closing) { send(503, 'Server is shutting down'); return; }
      if (!['GET','HEAD','POST'].includes(request.method)) { send(405, 'Method not allowed', { Allow:'GET, HEAD, POST' }); return; }
      const pathname = decodeGamePath(request.url);
      if (!pathname) { send(400, 'Invalid request path'); return; }
      if (pathname === '/healthz') { const status=await health();send(status.ready?200:503, JSON.stringify(status), { 'Content-Type':'application/json; charset=utf-8' }); return; }
      if (request.method !== 'POST') {
        if (modernRoot && ['/modern/modern.css','/modern/modern.js'].includes(pathname)) {
          if (await serveResource(request,response,modernRoot,pathname.slice('/modern'.length))) return;
        }
        if (publicResource(pathname)) {
          if (/^\/gamedata\/(?:javascript|replays|remote_replays)\//.test(pathname) && stateRoot && await serveResource(request,response,stateRoot,pathname)) return;
          if (await serveResource(request,response,sourceRoot,pathname)) return;
        }
      }
      // Install, transport daemons and source files are not public controllers.
      if (!/^\/[a-z0-9_]+\.php$/i.test(pathname) || pathname==='/install_NEW.php') { send(404,'Not found'); return; }
      const parsed = await parseRequest(request, { maxBytes, trustProxy });
      const serverVariables = { REMOTE_ADDR:parsed.clientAddress, SERVER_PORT:origin.port || (origin.protocol === 'https:' ? '443' : '80'), SERVER_NAME:origin.hostname,
        HTTP_HOST:origin.host, SCRIPT_NAME:pathname, REQUEST_METHOD:request.method, REQUEST_URI:request.url, HTTPS:origin.protocol === 'https:' ? 'on' : '' };
      const result = await maintenance.request(() => dispatch({ pathname, ...parsed, server:serverVariables, pageStartTime, signal:abort.signal, method:request.method }), { signal:abort.signal });
      if (!result) { send(404,'Not found'); return; }
      let body = result.body ?? '', headers = result.headers ?? {};
      if (modern && typeof body === 'string' && /<head[\s>]/i.test(body) && !body.includes('data-dtsx-shell')) body = body.replace(/<\/head>/i, '<link data-dtsx-shell rel="stylesheet" href="/modern/modern.css"><script defer src="/modern/modern.js"></script></head>');
      send(result.status ?? 200, body, headers);
    } catch (error) {
      if (!abort.signal.aborted) {
        if (error instanceof RequestError || error.code === 'NATIVE_SHUTDOWN') send(error.status,error.message);
        else { onError(error); if (!response.headersSent) send(500,'Internal server error'); else response.destroy(); }
      }
    } finally { requests.delete(abort); finished(); }
  });
  server.requestTimeout = 60_000; server.headersTimeout = 15_000;
  return { server, maintenance,
    async listen({ port = 0, host = '127.0.0.1' } = {}) {
      await new Promise((resolve,reject) => { const failed = error => reject(error); server.once('error',failed); server.listen(port,host,() => { server.removeListener('error',failed); resolve(); }); });
      return server.address();
    },
    async close() {
      if (closed) return closed; closing = true;
      closed = (async () => {
        const drained = maintenance.close();
        const timer = setTimeout(() => { for (const abort of requests.keys()) abort.abort(); server.closeAllConnections(); },shutdownTimeoutMs); timer.unref();
        try {
          await new Promise((resolve,reject) => server.close(error => error && error.code !== 'ERR_SERVER_NOT_RUNNING' ? reject(error) : resolve()));
          await Promise.allSettled([...requests.values()]);
          await drained;
        } finally { clearTimeout(timer); }
      })();
      return closed;
    },
  };
}
