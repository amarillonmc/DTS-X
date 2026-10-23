import { createHash, randomBytes } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { gencode, gdecode } from '../protocol/codec.mjs';
import { present, text } from '../gameplay/numbers.mjs';
import { timestampSalt } from './primitives.mjs';
import { arrayKey } from '../system/sys-support.mjs';
import { decodeUserRows } from './wire.mjs';

const clone = value => structuredClone(value);
const values = value => value instanceof Map ? [...value.values()] : Object.values(value ?? {});
const count = value => value instanceof Map ? value.size : Object.keys(value ?? {}).length;
const first = value => values(value)[0];
const keyed = (rows, keytype) => Number(keytype) === 1 ? new Map(rows.map(row => [arrayKey(row.username), row]))
  : Number(keytype) === 2 ? new Map(rows.map(row => [arrayKey(row.uid), row])) : rows;
const readOnlyScripts = new Set(['roomupdate', 'roomcmd', 'chat', 'valid', 'end', 'winner', 'rank', 'alive', 'help', 'news', 'aranking_receive']);
const readOnlyPages = new Set(['command_roomcmd', 'command_valid', 'command_end', 'command_winner', 'command_rank', 'command_alive', 'command_help', 'command_news', 'command_aranking']);
export const userLockUnnecessary = (script, page) => script == null || readOnlyScripts.has(script) || readOnlyPages.has(page);
export function whereUsernames(where) {
  let match = text(where).match(/username\s*?IN\s*?\((.*?)\)/s);
  if (match) return match[1].split(',').map(value => value.replace(/^[' \n\r\t]+|[' \n\r\t]+$/g, ''));
  match = text(where).match(/username\s*?=\s*?'(.*?)'/s);
  return match ? [match[1]] : [];
}
export class RemoteUserError extends Error {
  constructor(code = 'REMOTE_USER_UNAVAILABLE') { super('Native remote user storage request failed'); this.name = 'RemoteUserError'; this.code = code; }
}

/** Actual legacy remote protocol over HTTP(S). Credentials stay in closures;
 * HTTP errors and server bodies are never echoed into public diagnostics. */
export function createRemoteUserClient({ url, sign, password, retries = 1, retryDelayMs = 200, timeoutMs = 10_000, clock = () => Date.now() / 1000, fetch: fetcher = globalThis.fetch }) {
  const destination = new URL(url);
  if (!['http:', 'https:'].includes(destination.protocol) || destination.username || destination.password) throw new TypeError('Remote users require an explicit HTTP(S) endpoint');
  if (typeof sign !== 'string' || typeof password !== 'string') throw new TypeError('Remote users require explicit authentication');
  let key = '';
  const command = async (name, ...parameters) => {
    if (!key) key = randomBytes(16).toString('hex');
    const args = Array.from({ length: 5 }, (_, index) => parameters[index] ?? '');
    if (['insert_udata', 'update_udata', 'update_udata_multilist'].includes(name)) args[0] = gencode(args[0]);
    const form = new URLSearchParams({ sign, pass: timestampSalt(password, 0, clock()), command: name, key });
    args.forEach((value, i) => form.set(`para${i + 1}`, text(value)));
    for (let attempt = 0; attempt < Math.max(1, retries); attempt++) {
      try {
        const response = await fetcher(destination, { method: 'POST', redirect: 'error', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: form, signal: AbortSignal.timeout(timeoutMs) });
        const raw = await response.text();
        if (raw.startsWith('Error')) throw new RemoteUserError('REMOTE_USER_REJECTED');
        const decoded = response.ok ? gdecode(raw) : null;
        if (decoded !== null && (name !== 'fetch_udata' || (typeof decoded === 'object' && decoded !== null))) {
          if (name === 'fetch_udata' && Number(args[3]) > 0) return decodeUserRows(raw);
          return decoded;
        }
      } catch (error) { if (error instanceof RemoteUserError) throw error; }
      if (attempt + 1 < Math.max(1, retries)) await delay(retryDelayMs);
    }
    throw new RemoteUserError();
  };
  return Object.freeze({ command, async release() {
    if (!key) return;
    const result = await command('release_user_lock_from_pool');
    if (typeof result !== 'string' || !result.includes('Release success')) throw new RemoteUserError('REMOTE_USER_RELEASE_FAILED');
    key = '';
  } });
}

/** Request-local port of include/user.func.php's database and lock operations.
 * database is NativeDatabase; locks is a real createLockServices(...).locks.
 * Legacy insert/update methods keep the source pre-escaped values contract.
 * Raw HTTP account flows use writeRaw/insertRaw to escape exactly once.
 * Trusted fields/where/sort fragments never come directly from HTTP input.
 */
export function createUserService({ database, tablePrefix = 'bra_', locks, script, page, remote = null, forcedLocal = false, lockTimeoutMs = 3000 }) {
  if (!database || typeof database.query !== 'function' || typeof database.escape !== 'function') throw new TypeError('A real native database service is required');
  if (!/^[A-Za-z0-9_]*$/.test(tablePrefix)) throw new TypeError('Invalid account table prefix');
  const table = tablePrefix + 'users', pool = new Map(); let closed = false;
  const ensureOpen = () => { if (closed) throw new Error('User request is closed'); };
  const resource = username => `accounts/${tablePrefix}/${createHash('sha256').update(text(username)).digest('hex')}.lock`;
  const createLock = async username => {
    ensureOpen(); username = text(username);
    if (pool.has(username)) return 1;
    if (!present(username) || userLockUnnecessary(script, page)) return 3;
    if (typeof locks?.acquire !== 'function' || typeof locks?.release !== 'function') throw new Error('User writes require real OS lock services');
    const token = await locks.acquire(resource(username), { timeoutMs: lockTimeoutMs });
    pool.set(username, token); return 0;
  };
  const releaseLock = async username => {
    username = text(username); const token = pool.get(username);
    if (token) { await locks.release(resource(username), token); pool.delete(username); }
  };
  const localFetch = async (fields, where, sort, keytype, nolock) => {
    if (!nolock && !fields.includes('COUNT(')) {
      const names = whereUsernames(where);
      if (names.length) { if (names.length <= 500) for (const username of names) await createLock(username); }
      else for (const row of await database.query(`SELECT username FROM ${table} WHERE ${where} ${sort ? `ORDER BY ${sort}` : ''}`)) await createLock(row.username);
    }
    return keyed(await database.query(`SELECT ${fields} FROM ${table} WHERE ${where} ${sort ? `ORDER BY ${sort}` : ''}`), keytype);
  };
  const fetch = async (fields = '*', where = '1', sort = '', keytype = 0, nolock = 0, options = {}) => {
    ensureOpen(); fields = present(fields) ? text(fields) : '*'; where = present(where) ? text(where) : '1'; sort = text(sort);
    const force = options.forcedLocal ?? forcedLocal;
    if (remote && !force) return remote.command('fetch_udata', fields, where, sort, keytype, userLockUnnecessary(script, page) ? 1 : nolock);
    let result = await localFetch(fields, where, sort, keytype, nolock);
    if (remote && count(result) <= 1 && (!count(result) || (Object.hasOwn(first(result), 'password') && !present(first(result).password)))) {
      const remoteRows = await remote.command('fetch_udata', '*', where, sort, keytype, nolock);
      if (count(remoteRows)) {
        const rows = values(remoteRows).map(row => { const data = clone(row); delete data.uid; return data; });
        if (!count(result)) await database.arrayInsert(table, rows);
        else if (rows.length > 1) await database.multi_update(table, rows, 'username');
        else await database.arrayUpdate(table, rows[0], `username='${rows[0].username}'`);
        result = remoteRows;
      }
    }
    return result;
  };
  const raw = data => Object.fromEntries(Object.entries(data).map(([key, value]) => [key, typeof value === 'string' ? database.escape(value).slice(1, -1) : value]));
  const insert = async (data, onDuplicate = 0, options = {}) => {
    ensureOpen(); const firstRow = present(data?.username) && present(data?.password) ? data : first(data);
    if (!present(firstRow?.username) || !present(firstRow?.password)) return false;
    if (remote && !(options.forcedLocal ?? forcedLocal)) {
      const result = await remote.command('insert_udata', data, onDuplicate);
      await database.arrayInsert(table, data instanceof Map ? values(data) : data, 1, 'username'); return result;
    }
    return database.arrayInsert(table, data instanceof Map ? values(data) : data, onDuplicate, 'username');
  };
  const update = async (data, where, options = {}) => {
    ensureOpen();
    if (remote && !(options.forcedLocal ?? forcedLocal)) { const result = await remote.command('update_udata', data, where); await database.arrayUpdate(table, data, where); return result; }
    return database.arrayUpdate(table, data, where);
  };
  const updateMany = async (rows, options = {}) => {
    ensureOpen(); rows = values(rows);
    if (remote && !(options.forcedLocal ?? forcedLocal)) { const result = await remote.command('update_udata_multilist', rows); await database.multi_update(table, rows, 'username'); return result; }
    return database.multi_update(table, rows, 'username');
  };
  const updateByUsername = async (data, username = '', options = {}) => {
    data = clone(data); if (present(data.username)) { username = data.username; delete data.username; }
    else if (!present(username)) return false;
    return update(data, `username=${database.escape(text(username))}`, options);
  };
  return Object.freeze({
    database, table, createLock, releaseLock, lockNames: () => [...pool.keys()], fetch,
    fetchByUsername: async (username, options = {}) => first(await fetch(options.fields ?? '*', `username=${database.escape(text(username))}`, '', 0, options.nolock ?? 0, options)) ?? null,
    fetchMany: (fields, filters, sort = '', options = {}) => {
      let where = filters;
      if (typeof filters === 'object' && filters !== null) {
        const [field, list] = Object.entries(filters)[0] ?? [];
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(field ?? '') || !Array.isArray(list)) throw new TypeError('Invalid user lookup filter');
        where = `${field} IN (${list.map(value => database.escape(text(value))).join(',')})`;
      }
      return fetch(fields, where, sort, 1, 0, options);
    },
    insert, update, updateMany, updateByUsername,
    insertRaw: (data, onDuplicate = 0, options = {}) => insert(raw(data), onDuplicate, options),
    writeRaw: (data, username, options = {}) => updateByUsername(raw(data), username, options),
    async delete(where) { ensureOpen(); if (!present(where)) return false; return database.execute(`DELETE FROM ${table} WHERE ${where}`); },
    remoteCommand: (...args) => { if (!remote) throw new Error('No remote user storage configured'); return remote.command(...args); },
    hasRemote: !!remote,
    async releaseAll() { for (const name of [...pool.keys()]) await releaseLock(name); if (remote) await remote.release(); },
    async close() { if (closed) return; try { for (const name of [...pool.keys()]) await releaseLock(name); if (remote) await remote.release(); } finally { closed = true; } },
  });
}
