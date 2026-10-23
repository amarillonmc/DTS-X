import { isIP } from 'node:net';
import { prepareInputRequest } from '../gameplay/input.mjs';

const record = () => Object.create(null);
const container = value => value !== null && typeof value === 'object' && !ArrayBuffer.isView(value);
const integerKey = /^(?:0|-?[1-9][0-9]*)$/;
const intMax = (1n << 63n) - 1n;

function mergeRequest(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (container(value)) {
      if (!container(target[key])) target[key] = record();
      mergeRequest(target[key], value);
    } else target[key] = value;
  }
}

export class RequestError extends Error {
  constructor(message, status = 400) { super(message); this.name = 'RequestError'; this.status = status; }
}

function decode(value, plus = true) {
  const bytes = Buffer.from(value, 'latin1'), output = [];
  for (let i = 0; i < bytes.length; i++) {
    if (plus && bytes[i] === 43) output.push(32);
    else if (bytes[i] === 37 && /^[0-9a-f]{2}$/i.test(bytes.toString('latin1', i + 1, i + 3)) && i + 2 < bytes.length) {
      output.push(parseInt(bytes.toString('latin1', i + 1, i + 3), 16)); i += 2;
    } else output.push(bytes[i]);
  }
  const result = Buffer.from(output), string = result.toString('utf8');
  return Buffer.from(string).equals(result) ? string : result;
}

// Form names follow the original request parser: spaces/dots in the root are
// normalized, numeric keys and [] append are retained, and trailing text after
// a complete bracket path is ignored. Records never inherit Object.prototype.
function nameParts(raw, maxDepth) {
  const decoded = decode(raw);
  if (typeof decoded !== 'string') return null;
  const name = decoded.split('\0', 1)[0].replace(/^ +/, '');
  const bracket = name.indexOf('[');
  const root = (bracket < 0 ? name : name.slice(0, bracket)).replace(/[ .]/g, '_');
  if (!root) return null;
  if (bracket < 0) return [root];
  const parts = [root];
  let at = bracket;
  while (name[at] === '[') {
    const end = name.indexOf(']', at + 1);
    if (end < 0) return parts.length === 1 ? [name.replace(/[ .[]/g, '_')] : parts;
    const key = name.slice(at + 1, end);
    parts.push(key === '' || /^[ \t\n\r\v\f]$/.test(key) ? null : key);
    if (parts.length - 1 > maxDepth) throw new RequestError('Form nesting is too deep');
    at = end + 1;
  }
  return parts;
}

function appendKey(target) {
  let next = 0n;
  for (const key of Object.keys(target)) {
    if (!integerKey.test(key)) continue;
    const integer = BigInt(key);
    if (integer >= next && integer <= intMax) next = integer + 1n;
  }
  if (next > intMax) throw new RequestError('Form array index overflow');
  return String(next);
}

function assign(target, parts, value, firstWins) {
  let cursor = target;
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i] === null ? appendKey(cursor) : parts[i];
    if (i === parts.length - 1) {
      if (!firstWins || i > 0 || !Object.hasOwn(cursor, key)) cursor[key] = value;
    } else {
      if (!container(cursor[key])) cursor[key] = record();
      cursor = cursor[key];
    }
  }
}

/** Decode the game's URL-encoded forms without flattening nested selections.
 * Oversized inputs fail explicitly instead of silently dropping commands. */
export function parseForm(body, { maxVariables = 1000, maxDepth = 64 } = {}) {
  const result = record();
  const string = Buffer.isBuffer(body) || ArrayBuffer.isView(body) ? Buffer.from(body).toString('latin1') : Buffer.from(String(body)).toString('latin1');
  let count = 0;
  for (const pair of string.split('\0', 1)[0].split('&')) {
    if (!pair) continue;
    if (++count > maxVariables) throw new RequestError('Too many form variables');
    const equals = pair.indexOf('='), key = equals < 0 ? pair : pair.slice(0, equals);
    const parts = nameParts(key, maxDepth);
    if (parts) assign(result, parts, decode(equals < 0 ? '' : pair.slice(equals + 1)), false);
  }
  return result;
}

export function parseCookies(header = '', { maxVariables = 1000, maxDepth = 64 } = {}) {
  const result = record();
  let count = 0;
  for (const pair of String(header).split(';')) {
    const trimmed = pair.replace(/^ +/, '');
    if (!trimmed) continue;
    if (++count > maxVariables) throw new RequestError('Too many cookies');
    const equals = trimmed.indexOf('=');
    // Cookie names are not URL decoded by the source SAPI. Escape percent and
    // plus before the common form-name registration, values use rawurldecode.
    const name = (equals < 0 ? trimmed : trimmed.slice(0, equals)).replaceAll('%', '%25').replaceAll('+', '%2B');
    const parts = nameParts(name, maxDepth);
    if (parts) assign(result, parts, decode(equals < 0 ? '' : trimmed.slice(equals + 1), false), true);
  }
  return result;
}

export async function readRequestBody(request, maxBytes) {
  const sizeHeader = request.headers['content-length'];
  if (sizeHeader !== undefined && (!/^\d+$/.test(sizeHeader) || Number(sizeHeader) > maxBytes)) throw new RequestError('Body too large', 413);
  const chunks = []; let size = 0;
  for await (const chunk of request) {
    const bytes = Buffer.from(chunk); size += bytes.length;
    if (size > maxBytes) throw new RequestError('Body too large', 413);
    chunks.push(bytes);
  }
  return Buffer.concat(chunks);
}

export function clientAddress(request, trustProxy = false) {
  const value = request.headers['x-forwarded-for'];
  return trustProxy && typeof value === 'string' && isIP(value.trim()) ? value.trim() : request.socket.remoteAddress || '127.0.0.1';
}

export async function parseRequest(request, { maxBytes = 64 * 1024 * 1024, requestOrder = 'GP', trustProxy = false } = {}) {
  if (!['GET', 'HEAD', 'POST'].includes(request.method)) throw new RequestError('Method not allowed', 405);
  if (!/^[GPC]*$/.test(requestOrder)) throw new TypeError('Invalid request merge order');
  const query = String(request.url).split('?').slice(1).join('?');
  const get = parseForm(query), cookies = parseCookies(request.headers.cookie);
  const body = await readRequestBody(request, maxBytes);
  let post = record();
  const files = record();
  if (request.method === 'POST' && body.length) {
    const contentType = String(request.headers['content-type'] || '').split(';', 1)[0].trim().toLowerCase();
    if (contentType === 'application/x-www-form-urlencoded') post = parseForm(body);
    else if (contentType === 'multipart/form-data') {
      let form;
      try { form = await new Response(body, { headers: { 'content-type': request.headers['content-type'] } }).formData(); }
      catch { throw new RequestError('Malformed multipart form'); }
      let count = 0;
      for (const [name, value] of form) {
        if (++count > 1000) throw new RequestError('Too many form variables');
        const parts = nameParts(encodeURIComponent(name), 64);
        if (!parts) continue;
        if (typeof value === 'string') assign(post, parts, value, false);
        else assign(files, parts, { name: value.name, type: value.type, size: value.size, error: value.name ? 0 : 4, bytes: Buffer.from(await value.arrayBuffer()) }, false);
      }
    } else throw new RequestError('Unsupported form content type', 415);
  }
  const merged = record();
  const sources = { G: get, P: post, C: cookies };
  for (const letter of requestOrder) mergeRequest(merged, sources[letter]);
  return { get, cookies, post, files, body, input: prepareInputRequest({ cookies, post, request: merged }), clientAddress: clientAddress(request, trustProxy) };
}

export function serializeGameCookie(name, value, { tablePrefix, life = 0, prefix = true, now = Math.floor(Date.now() / 1000), path = '/', domain = '', secure = false } = {}) {
  const cookieName = (prefix && !name.startsWith(tablePrefix) ? tablePrefix : '') + name;
  if (!cookieName || /[\x00-\x20\x7f=;,]/.test(cookieName)) throw new TypeError('Invalid cookie name');
  if (/[\r\n\0;]/.test(path + domain)) throw new TypeError('Invalid cookie attributes');
  const encode = string => encodeURIComponent(String(string)).replace(/[!'()*~]/g, character => '%' + character.charCodeAt(0).toString(16).toUpperCase()).replaceAll('%20', '+');
  const empty = value === '' || value === null;
  const expires = empty ? 1 : life ? now + Number(life) : 0;
  let cookie = `${cookieName}=${empty ? 'deleted' : encode(value)}`;
  if (expires) cookie += `; expires=${new Date(expires * 1000).toUTCString()}; Max-Age=${empty ? 0 : Math.max(0, Math.floor(expires - now))}`;
  if (path) cookie += `; path=${path}`;
  if (domain) cookie += `; domain=${domain}`;
  if (secure) cookie += '; secure';
  if (name === 'pass') cookie += '; HttpOnly';
  return cookie;
}
