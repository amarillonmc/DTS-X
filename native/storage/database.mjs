import mysql from 'mysql2/promise';
import { text, present } from '../gameplay/numbers.mjs';
import { setMultiStatements } from './mysql-options.mjs';

// Direct Node MySQL client. This service retains the source mysqli text-protocol
// values and SQL builders; it does not replace MyISAM/HEAP with transactions or
// execute PHP. Each game request owns its connection, including table locks.
// API reference: https://sidorares.github.io/node-mysql2/docs
const results = new WeakMap();
const copyCell = value => Buffer.isBuffer(value) ? Buffer.from(value) : value;
export const MYSQL_ASSOC = 1, MYSQL_NUM = 2, MYSQL_BOTH = 3;
const identifier = value => {
  if (typeof value !== 'string' || !/^(?:`[A-Za-z0-9_]+`|[A-Za-z0-9_]+)(?:\.(?:`[A-Za-z0-9_]+`|[A-Za-z0-9_]+))?$/.test(value)) throw new TypeError('Invalid database identifier');
  return value;
};
export class NativeDatabaseError extends Error {
  constructor(error, operation = 'query') {
    // mysql2 errors can include SQL, user values and connection options. Do not
    // attach the raw error as a cause or expose its message to an HTTP caller.
    const code = typeof error?.code === 'string' && /^[A-Z0-9_]+$/.test(error.code) ? error.code : 'DATABASE_ERROR';
    super(`Native database ${operation} failed (${code})`);
    this.name = 'NativeDatabaseError'; this.code = code;
    this.errno = Number.isSafeInteger(error?.errno) ? error.errno : 0;
    this.sqlState = /^[A-Z0-9]{5}$/.test(error?.sqlState ?? '') ? error.sqlState : null;
  }
}

// query() rejects extra statements early for a useful diagnostic. The server
// ALSO enforces this boundary: MULTI_STATEMENTS is off except within queries().
// Scan tokens, not a ';' split: original data contains quotes and comments.
function singleStatement(sql) {
  let quote = null, comment = null, ended = false, terminator = -1;
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i], next = sql[i + 1];
    if (comment === 'line') { if (c === '\n' || c === '\r') comment = null; continue; }
    if (comment === 'block') { if (c === '*' && next === '/') { comment = null; i++; } continue; }
    if (quote) {
      if (c === '\\' && quote !== '`') { i++; continue; }
      if (c === quote) { if (next === quote) i++; else quote = null; }
      continue;
    }
    if (c === '#' || (c === '-' && next === '-' && /\s/.test(sql[i + 2] ?? ''))) { comment = 'line'; if (c === '-') i++; continue; }
    if (c === '/' && next === '*') {
      if (sql[i + 2] === '!' || sql.slice(i + 2, i + 4) === 'M!') {
        const end = sql.indexOf('*/', i + 2);
        if (ended || end < 0 || sql.slice(i + 2, end).includes(';')) throw new TypeError('Use queries() for executable SQL comments containing statements');
      }
      comment = 'block'; i++; continue;
    }
    if (/\s/.test(c)) continue;
    if (ended) throw new TypeError('Use queries() for multiple SQL statements');
    if (c === ';') { ended = true; terminator = i; continue; }
    if (c === "'" || c === '"' || c === '`') quote = c;
  }
  // With MULTI_STATEMENTS enabled a comment after the terminator can produce
  // an extra OK packet. mysqli_query never exposes such a second result.
  return terminator < 0 ? sql : sql.slice(0, terminator + 1);
}

function wrapRows(rows, fields) {
  rows = rows.map(row => row.map((value, index) => {
    if (value === null) return null;
    const field = fields[index];
    // BIT and binary string/blob columns are byte strings in PHP. Do not turn
    // invalid UTF-8 into U+FFFD or parse a 64-bit numeric string as a Number.
    if (field.columnType === 16 || (field.characterSet === 63 && [249, 250, 251, 252, 253, 254, 255].includes(field.columnType))) return Buffer.from(value);
    const encoding = field.columnType === 245 || field.encoding === 'cesu8' ? 'utf8' : field.encoding;
    return Buffer.isEncoding(encoding) ? value.toString(encoding) : new TextDecoder(encoding).decode(value);
  }));
  // Keep a numeric copy for duplicate SELECT column names, as mysqli_fetch_row
  // retains columns that an associative row would overwrite.
  const output = rows.map(row => Object.fromEntries(fields.map((field, index) => [field.name, copyCell(row[index])])));
  results.set(output, { rows, fields, cursor: 0, fieldCursor: 0, freed: false });
  return output;
}
function resultData(result) {
  const data = results.get(result);
  if (!data || data.freed) throw new TypeError('Expected an open native database result');
  return data;
}
const binary = value => value instanceof Uint8Array;
const bytes = value => Buffer.from(value.buffer, value.byteOffset, value.byteLength);
// structuredClone preserves bytes as Uint8Array, rather than retaining Buffer's
// subclass. Accept both at source by-value boundaries without string coercion.
const literal = value => binary(value) ? `X'${bytes(value).toString('hex')}'` : `'${text(value)}'`;
function buildInsert(table, data, onDuplicate = 0, keyColumn = '') {
  identifier(table);
  const rows = Object.values(data);
  if (rows.length === 0) return '';
  const multiple = typeof rows[0] === 'object' && rows[0] !== null && !ArrayBuffer.isView(rows[0]);
  const first = multiple ? rows[0] : data;
  const fields = Object.keys(first).map(identifier);
  const values = (multiple ? rows : [data]).filter(row => Object.keys(row).length)
    .map(row => '(' + Object.values(row).map(literal).join(',') + ')');
  let sql = `INSERT INTO ${table} (${fields.join(',')}) VALUES ${values.join(',')}`;
  if (present(onDuplicate) && present(keyColumn)) {
    identifier(keyColumn);
    sql += ' ON DUPLICATE KEY UPDATE ' + fields.filter(key => key !== keyColumn).map(key => '`' + key + '`=VALUES(`' + key + '`)').join(',');
  }
  return sql;
}

export class NativeDatabase {
  #connection; #lastHeader = {}; #lastError = null; #closed = false;
  #closing = false; #tail = Promise.resolve();
  #pending = []; #pendingIndex = 0; #serverVersion; #charset;
  // Query text is held only in this request object, never printed or persisted.
  query_log = [];
  constructor(connection, charset, serverVersion) {
    this.#connection = connection; this.#charset = charset; this.#serverVersion = serverVersion;
  }
  #run(sql, multi = false, silent = false) {
    if (this.#closing || this.#closed) return Promise.reject(new Error('Native database connection is closed'));
    // Keep option ON, all result consumption, and option OFF atomic relative to
    // every other request on this connection, including calls made in parallel.
    const pending = this.#tail.then(() => this.#perform(sql, multi, silent));
    this.#tail = pending.catch(() => {});
    return pending;
  }
  async #perform(sql, multi, silent) {
    if (this.#closed) throw new Error('Native database connection is closed');
    if (typeof sql !== 'string') throw new TypeError('SQL must be a string');
    const submitted = multi ? sql : singleStatement(sql);
    this.query_log.push(sql); this.#lastError = null;
    try {
      let rows, fields;
      if (multi) await setMultiStatements(this.#connection, true);
      try { [rows, fields] = await this.#connection.query(submitted); }
      finally {
        if (multi) {
          try { await setMultiStatements(this.#connection, false); }
          catch (error) { this.#connection.destroy(); this.#closed = true; throw error; }
        }
      }
      const wrap = (rowSet, fieldSet) => {
        if (Array.isArray(rowSet)) { this.#lastHeader = { affectedRows: rowSet.length, insertId: 0 }; return wrapRows(rowSet, fieldSet); }
        this.#lastHeader = rowSet; return rowSet;
      };
      if (multi && Array.isArray(fields) && (fields[0] === undefined || Array.isArray(fields[0]))) return rows.map((set, i) => wrap(set, fields[i]));
      return multi ? [wrap(rows, fields)] : wrap(rows, fields);
    } catch (error) {
      this.#lastError = new NativeDatabaseError(error); this.#lastHeader = { affectedRows: -1, insertId: 0 };
      if (silent) return false;
      throw this.#lastError;
    }
  }
  async query(sql, type = '') { return this.#run(sql, false, type === 'SILENT'); }
  async execute(sql) { return this.#run(sql); }
  async queries(sql) {
    const values = await this.#run(this.parse_create_table(sql), true);
    this.#pending = values; this.#pendingIndex = 0;
    return values;
  }
  async select_db(database) { await this.execute('USE ' + identifier(database)); return true; }
  parse_create_table(sql) { return sql.replace(/ENGINE\s*=\s*([a-z]+)/gi, 'ENGINE=$1 DEFAULT CHARSET=' + this.#charset); }
  // Source callers have already run addslashes/normalize_string. Escaping here
  // again would corrupt apostrophes and backslashes in saved game data.
  async arrayInsert(table, data, onDuplicate = 0, keyColumn = '') {
    const sql = buildInsert(table, data, onDuplicate, keyColumn);
    if (sql) await this.execute(sql);
    return sql;
  }
  async arrayUpdate(table, data, where, oldData = null) {
    identifier(table);
    const sets = Object.entries(data).filter(([key, value]) => oldData === null || oldData[key] == null || (binary(value) && binary(oldData[key]) ? !bytes(value).equals(bytes(oldData[key])) : value !== oldData[key]))
      .map(([key, value]) => `${identifier(key)} = ${literal(value)}`);
    const sql = sets.length ? `UPDATE ${table} SET ${sets.join(',')} WHERE ${where}` : '';
    if (sql) await this.execute(sql);
    return sql;
  }
  async multi_update(table, data, conditionField, singleQuery = '') {
    identifier(table); identifier(conditionField);
    const cases = new Map(), range = [];
    for (const row of Object.values(data)) {
      const condition = text(row[conditionField]); range.push(`'${condition}'`);
      for (const [key, value] of Object.entries(row)) {
        identifier(key);
        if (key === conditionField) continue;
        cases.set(key, (cases.get(key) ?? `(CASE ${conditionField} `) + `WHEN '${condition}' THEN ${literal(value)} `);
      }
    }
    let sql = '';
    if (cases.size) {
      const assignments = [...cases].map(([key, clause]) => `${key} = ${clause}END) `).join(',');
      sql = `UPDATE ${table} SET ${assignments}${singleQuery ? ',' + singleQuery : ''} WHERE ${conditionField} IN (${range.join(',')})`;
      await this.execute(sql);
    }
    return sql;
  }
  array_insert(...args) { return this.arrayInsert(...args); }
  array_update(...args) { return this.arrayUpdate(...args); }
  arr_query_divide(data) { const rows = Object.values(data); return rows.length <= 1 ? data : [rows.slice(0, Math.floor(rows.length / 2)), rows.slice(Math.floor(rows.length / 2))]; }
  fetch_array(result, type = MYSQL_ASSOC) {
    if (![MYSQL_ASSOC, MYSQL_NUM, MYSQL_BOTH].includes(type)) throw new TypeError('Unknown fetch result type');
    const data = resultData(result);
    if (data.cursor >= data.rows.length) return null;
    const index = data.cursor++, numeric = data.rows[index].map(copyCell);
    if (type === MYSQL_NUM) return numeric;
    const assoc = Object.fromEntries(data.fields.map((field, column) => [field.name, copyCell(numeric[column])]));
    return type === MYSQL_BOTH ? { ...numeric, ...assoc } : assoc;
  }
  fetch_all(result, type = MYSQL_ASSOC) { const rows = []; let row; while ((row = this.fetch_array(result, type)) !== null) rows.push(row); return rows; }
  fetch_row(result) { return this.fetch_array(result, MYSQL_NUM); }
  data_seek(result, index) { const data = resultData(result); if (!Number.isSafeInteger(index) || index < 0 || index >= data.rows.length) return false; data.cursor = index; return true; }
  result(result, index) { if (!this.data_seek(result, index)) return null; return this.fetch_row(result)?.[0] ?? null; }
  num_rows(result) { return resultData(result).rows.length; }
  num_fields(result) { return resultData(result).fields.length; }
  fetch_fields(result) {
    const data = resultData(result), field = data.fields[data.fieldCursor++];
    return field ? { name: field.name, orgname: field.orgName, table: field.table, orgtable: field.orgTable, db: field.schema, length: field.columnLength, charsetnr: field.characterSet, flags: field.flags, type: field.columnType, decimals: field.decimals } : false;
  }
  free_result(result) { const data = resultData(result); data.freed = true; data.rows = []; data.fields = []; }
  more_results() { return this.#pendingIndex + 1 < this.#pending.length; }
  next_result() { if (!this.more_results()) return false; this.#pendingIndex++; return true; }
  store_result() { const value = this.#pending[this.#pendingIndex]; return Array.isArray(value) ? value : false; }
  affected_rows() { return this.#lastHeader.affectedRows ?? 0; }
  insert_id() { return this.#lastHeader.insertId ?? 0; }
  errno() { return this.#lastError?.errno ?? 0; }
  error() { return this.#lastError?.message ?? ''; }
  version() { return this.#serverVersion; }
  // Use only when a newly ported caller receives raw text, never on the source
  // preescaped arrayInsert/arrayUpdate contract.
  escape(value) { return this.#connection.escape(value); }
  async close() { if (this.#closed) return true; this.#closing = true; await this.#tail; if (this.#closed) return true; this.#closed = true; await this.#connection.end(); return true; }
}

export async function createDatabase(options) {
  const { host, port = 3306, user, password, database, charset = 'utf8', ssl, socketPath, connectTimeout = 10_000 } = options;
  if (!/^[A-Za-z0-9_]+$/.test(charset)) throw new TypeError('Invalid database charset');
  if (!host && !socketPath) throw new TypeError('An explicit database host or socketPath is required');
  let connection;
  try {
    connection = await mysql.createConnection({
      host, port, user, password, database, charset, ssl, socketPath, connectTimeout,
      flags: '-FOUND_ROWS,-LOCAL_FILES', multipleStatements: false, rowsAsArray: true,
      supportBigNumbers: true, bigNumberStrings: true, dateStrings: true, jsonStrings: true,
      disableEval: true,
      // Decode after receiving the full field metadata; field.type alone cannot
      // distinguish BLOB bytes from TEXT using the same wire type identifier.
      typeCast: false,
    });
    await connection.query(`SET character_set_connection=${charset}, character_set_results=${charset}, character_set_client=${charset}`);
    await connection.query("SET sql_mode=''");
    const [version] = await connection.query('SELECT VERSION()');
    return new NativeDatabase(connection, charset, version[0][0].toString('ascii'));
  } catch (error) {
    if (connection) await connection.end().catch(() => {});
    throw new NativeDatabaseError(error, 'connect');
  }
}
