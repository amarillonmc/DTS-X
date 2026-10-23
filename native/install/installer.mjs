import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import { createLockServices } from '../storage/locks.mjs';
import { privateStateRoot } from '../storage/private-root.mjs';
import { createCookiePass, createStoredPass, nameCheck } from '../accounts/primitives.mjs';

const sourceFiles = ['engine/install/bra.install.sql', 'engine/gamedata/sql/players.sql', 'engine/gamedata/sql/shopitem.sql', 'engine/gamedata/sql/reset.sql'];
const sourceRoot = new URL('../../', import.meta.url);
const identifier = value => { if (!/^[A-Za-z0-9_]+$/.test(value)) throw new TypeError('Invalid installation identifier'); return value; };
const under = (root, relative) => { const target = path.resolve(root, relative); if (!target.startsWith(root + path.sep)) throw new Error('Installation path escapes private state root'); return target; };
export const isInstallationOwner = value => typeof value === 'string' && /^[a-fA-F0-9]{48}$/.test(value);

/** Original install_NEW.php uses these four SQL files, including MyISAM and
 * HEAP/MEMORY. DROP commands are intentionally never executed by native setup.
 * Every table must be absent and CREATE must succeed without IF NOT EXISTS.
 */
export async function installationSchema(tablePrefix = 'bra_', charset = 'utf8') {
  if (!/^[A-Za-z0-9_]*$/.test(tablePrefix)) throw new TypeError('Invalid installation table prefix'); identifier(charset);
  const sources = [], statements = [];
  for (const file of sourceFiles) {
    const source = await fs.readFile(new URL(file, sourceRoot), 'utf8');
    sources.push({ path: file, sha256: createHash('sha256').update(source).digest('hex') });
    // These fixed source schemas contain CREATE/DROP and comments only. Refuse
    // new SQL constructs until they have been reviewed as an explicit migration.
    const sql = source.replace(/^\s*--[^\r\n]*/gm, '').replace(/\bbra_/g, tablePrefix);
    for (const statement of sql.split(';').map(value => value.trim()).filter(Boolean)) {
      if (/^DROP TABLE IF EXISTS\s+/i.test(statement)) continue;
      if (!/^CREATE TABLE\s+/i.test(statement)) throw new Error(`Unsupported installation SQL in ${file}`);
      const normalized = statement.replace(/^CREATE TABLE IF NOT EXISTS /i, 'CREATE TABLE ')
        .replace(/\)\s*ENGINE\s*=\s*([A-Za-z]+)[\s\S]*$/i, `) ENGINE=$1 DEFAULT CHARSET=${charset}`);
      const name = normalized.match(/^CREATE TABLE\s+`?([A-Za-z0-9_]+)`?/i)?.[1];
      if (!name || statements.some(entry => entry.name === name)) throw new Error('Invalid or duplicate source installation table');
      statements.push({ name, sql: normalized });
    }
  }
  return { sources, statements };
}

/** Provision a NEW native instance, or verify an instance this installer owns.
 * database must already name the caller-selected DB. Existing unowned tables
 * are never emptied, altered, or silently adopted. Partial setup fails closed
 * and leaves its journal/data intact for inspection; it never resets a save.
 * stateRoot is a private directory outside the web root. Configuration remains
 * supplied by the host (e.g. environment); no credential is written here.
 */
export async function installNative({ database, stateRoot, tablePrefix = 'bra_', charset = 'utf8', admin, starttime = 0 }) {
  if (typeof database?.query !== 'function' || typeof database?.escape !== 'function') throw new TypeError('Installation requires a connected native database');
  if (typeof stateRoot !== 'string' || !path.isAbsolute(stateRoot)) throw new TypeError('Installation requires an absolute private state root');
  const schema = await installationSchema(tablePrefix, charset);
  const databaseName = (await database.query('SELECT DATABASE() AS name'))[0]?.name;
  if (!databaseName) throw new Error('Installation requires an explicitly selected database');
  const root = await privateStateRoot(stateRoot, { create: true });
  const lockServices = await createLockServices(root);
  const file = under(root, 'native-install.json'), markerTable = identifier(tablePrefix + 'native_install');
  let token, dbLock = false;
  const lockName = 'dtsx_install_' + createHash('sha256').update(databaseName + '\0' + tablePrefix).digest('hex').slice(0, 40);
  try {
    token = await lockServices.locks.acquire('install', { timeoutMs: 10_000 });
    const acquired = (await database.query(`SELECT GET_LOCK(${database.escape(lockName)}, 10) AS acquired`))[0]?.acquired;
    if (acquired !== '1') throw new Error('Could not acquire native database installation lock'); dbLock = true;
    let journal;
    try {
      if ((await fs.lstat(file)).isSymbolicLink()) throw new Error('Installation marker must not be a symlink');
      journal = JSON.parse(await fs.readFile(file, 'utf8'));
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    const tables = (await database.query('SHOW TABLES')).map(row => Object.values(row)[0]);
    if (journal) {
      if (journal.format !== 1 || journal.status !== 'ready' || journal.database !== databaseName || journal.tablePrefix !== tablePrefix) throw new Error('Native installation is incomplete or belongs to a different instance; saved state was preserved');
      if (!isInstallationOwner(journal.owner)) throw new Error('Native installation ownership marker is invalid; saved state was preserved');
      const expected = [...schema.statements.map(entry => entry.name), markerTable];
      if (expected.some(name => !tables.includes(name))) throw new Error('Installed native schema is incomplete; refusing to reinitialize saved data');
      const markers = await database.query(`SELECT owner FROM ${markerTable} WHERE singleton=1`);
      if (markers.length !== 1 || markers[0].owner !== journal.owner) throw new Error('Filesystem and database installation owners differ');
      if (!(await database.query(`SELECT groomid FROM ${tablePrefix}game WHERE groomid=0`)).length) throw new Error('Installed main game record is missing');
      return { installed: false, status: 'ready', database: databaseName, tablePrefix, tables: expected };
    }
    if (tables.length) throw new Error('Refusing installation into a nonempty, unowned database');
    const existing = (await fs.readdir(root)).filter(name => name !== '.native-locks');
    if (existing.length) throw new Error('Refusing installation into a nonempty, unowned state directory');
    if (nameCheck(admin?.username) !== 'name_ok' || typeof admin?.password !== 'string' || !admin.password) throw new Error('A valid initial administrator name and nonempty password are required');
    if (!Number.isSafeInteger(starttime) || starttime < 0) throw new TypeError('Initial game time must be a nonnegative integer');
    const owner = randomBytes(24).toString('hex');
    journal = { format: 1, status: 'creating', owner, database: databaseName, tablePrefix, sources: schema.sources, tables: schema.statements.map(entry => entry.name) };
    await fs.writeFile(file, JSON.stringify(journal, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    for (const statement of schema.statements) await database.execute(statement.sql);
    await database.execute(`CREATE TABLE ${markerTable} (singleton TINYINT NOT NULL PRIMARY KEY,owner CHAR(48) NOT NULL) ENGINE=InnoDB`);
    await database.execute(`INSERT INTO ${markerTable} (singleton,owner) VALUES (1,${database.escape(owner)})`);
    const storedPass = createStoredPass(admin.username, createCookiePass(admin.password));
    await database.execute(`INSERT INTO ${tablePrefix}users (username,password,groupid,gender,icon) VALUES (${database.escape(admin.username)},${database.escape(storedPass)},9,'f','0')`);
    await database.execute(`INSERT INTO ${tablePrefix}game (gamenum,starttime) VALUES (0,${starttime})`);
    for (const relative of ['gamedata/bak', 'gamedata/cache', 'gamedata/javascript', 'gamedata/remote_replays', 'gamedata/replays', 'gamedata/templates',
      'gamedata/tmp/log', 'gamedata/tmp/news', 'gamedata/tmp/replay', 'gamedata/tmp/response', 'gamedata/tmp/rooms', 'gamedata/tmp/server']) await fs.mkdir(under(root, relative), { recursive: true, mode: 0o700 });
    const next = under(root, 'native-install.ready.json');
    await fs.writeFile(next, JSON.stringify({ ...journal, status: 'ready' }, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    // Both fully resolved targets were checked against this private root.
    await fs.rename(next, file);
    return { installed: true, status: 'ready', database: databaseName, tablePrefix, tables: [...journal.tables, markerTable] };
  } finally {
    try { if (dbLock) await database.query(`SELECT RELEASE_LOCK(${database.escape(lockName)})`); }
    finally { try { if (token) await lockServices.locks.release('install', token); } finally { await lockServices.close(); } }
  }
}
