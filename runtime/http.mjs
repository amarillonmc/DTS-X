import fs from 'node:fs/promises';
import path from 'node:path';
import { isIP } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';

export function requestClientAddress(request, trustProxy = false) {
  const peer = request.socket.remoteAddress || '127.0.0.1';
  const forwarded = request.headers['x-forwarded-for'];
  // The configured single proxy must replace this header, never append a chain.
  // Arrays, comma-separated lists, hostnames and host:port are not IP addresses.
  if (trustProxy && typeof forwarded === 'string' && isIP(forwarded.trim())) return forwarded.trim();
  return peer;
}
export function stripProxyIpHeaders(headers) {
  // Upstream real_ip() trusts these headers before REMOTE_ADDR. Consume the
  // permitted proxy value in Node, then prevent PHP from making a second,
  // unconditional trust decision (including equivalent underscore spellings).
  const blocked = new Set(['x-forwarded-for', 'client-ip', 'cf-connecting-ip']);
  return Object.fromEntries(Object.entries(headers).filter(([key]) => !blocked.has(key.toLowerCase().replaceAll('_', '-'))));
}

const types = { '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.png':'image/png', '.gif':'image/gif', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.woff':'font/woff', '.woff2':'font/woff2', '.ttf':'font/ttf', '.mp3':'audio/mpeg', '.ogg':'audio/ogg', '.wav':'audio/wav', '.mp4':'video/mp4', '.webmanifest':'application/manifest+json' };
export function decodePath(rawUrl) {
  const raw = rawUrl.split('?')[0];
  let decoded; try { decoded = decodeURIComponent(raw); } catch { return null; }
  if (!decoded.startsWith('/') || /[\\\0]/.test(decoded) || decoded.split('/').some(part => part === '..' || part.startsWith('.'))) return null;
  return decoded === '/' ? '/index.php' : decoded;
}
export function staticAllowed(relative) {
  const ext = path.posix.extname(relative).toLowerCase();
  if (!types[ext]) return false;
  if (/^\/(?:img|map)\//.test(relative)) return true;
  if (/^\/include\/javascript\//.test(relative)) return ['.js','.css','.png','.gif'].includes(ext);
  if (/^\/gamedata\/(?:css|javascript|replays|remote_replays)\//.test(relative)) return ['.js','.css','.png','.gif'].includes(ext);
  return /^\/[\w.-]+$/.test(relative) && ['.png','.ico','.webmanifest'].includes(ext);
}
export function injectModern(html) {
  if (!/<head[\s>]/i.test(html) || html.includes('data-dtsx-shell')) return html;
  return html.replace(/<\/head>/i, '<link data-dtsx-shell rel="stylesheet" href="/modern/modern.css"><script defer src="/modern/modern.js"></script></head>');
}
export function needsModuleManagerNotice(pathname, rawUrl) {
  if (pathname === '/modulemng_activate.php') return true;
  if (pathname !== '/modulemng.php') return false;
  return new URL(rawUrl, 'http://localhost').searchParams.getAll('mode').includes('advmng');
}
export async function readBody(request, maxBytes) {
  const chunks = []; let size = 0;
  for await (const chunk of request) { size += chunk.length; if (size > maxBytes) { const error = new Error('Body too large'); error.status = 413; throw error; } chunks.push(chunk); }
  return Buffer.concat(chunks);
}
export async function serveStatic(request, response, base, relative) {
  const file = path.resolve(base, '.' + relative);
  if (!file.startsWith(path.resolve(base) + path.sep)) return false;
  let stat; try { stat = await fs.stat(file); } catch { return false; }
  if (!stat.isFile()) return false;
  const real = await fs.realpath(file);
  if (!real.startsWith(await fs.realpath(base) + path.sep)) return false;
  const etag = `"${stat.size.toString(16)}-${Math.trunc(stat.mtimeMs).toString(16)}"`;
  response.setHeader('ETag', etag);
  response.setHeader('Cache-Control', 'public, max-age=300');
  response.setHeader('Content-Type', types[path.extname(file).toLowerCase()] || 'application/octet-stream');
  if (request.headers['if-none-match'] === etag) { response.writeHead(304).end(); return true; }
  // Read before writing headers: a deleted/replaced file must not leave a 200
  // response with a stale content length or append an error to an image body.
  const bytes = request.method === 'HEAD' ? undefined : await fs.readFile(real);
  response.setHeader('Content-Length', bytes?.length ?? stat.size);
  response.writeHead(200);
  response.end(bytes);
  return true;
}
export async function roomLongPoll(run, request, isDisconnected, timeout = 25000) {
  const deadline = Date.now() + timeout;
  let result;
  do {
    result = await run(request);
    if (result.exitCode || result.httpStatusCode >= 300 || result.bytes.length > 0 || isDisconnected() || Date.now() >= deadline) return result;
    await delay(750);
  } while (!isDisconnected());
  return result;
}
