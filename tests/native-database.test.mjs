import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { createDatabase, MYSQL_NUM, MYSQL_BOTH, NativeDatabaseError } from '../native/storage/database.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

const cells = rows => rows.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value === null ? null : Buffer.from(value).toString('base64')])));
const createTable = table => `CREATE TABLE ${table} (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), hp INT, cash BIGINT, fraction DECIMAL(18,6), memo TEXT, raw VARBINARY(16), born DATETIME, absent INT NULL) ENGINE=MyISAM`;
const firstRow = { name: "中文 O\\'Brien", hp: '120', cash: '9007199254740993', fraction: '1.250000', memo: '路径\\\\保留', raw: 'abc', born: '2026-10-23 12:34:56', absent: '0' };

test('native MySQL storage preserves source SQL, text types, writes, cursors and reconnect persistence against real mysqli', { timeout: 30_000 }, async t => {
  const fixture = await isolatedDatabase(t);
  if (!fixture) return;
  const { database: db, credentials, root } = fixture;
  const php = process.env.DTS_REFERENCE_PHP || 'php';
  const check = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION."/".(int)extension_loaded("mysqli");'], { encoding: 'utf8', timeout: 10_000, windowsHide: true });
  if (check.error?.code === 'ENOENT' || check.stdout !== '7.4/1') { t.skip('Requires PHP 7.4 mysqli as a development oracle.'); return; }
  const sqls = [];
  await db.execute(createTable('native_rows'));
  sqls.push(await db.arrayInsert('native_rows', firstRow));
  assert.equal(db.insert_id(), 1); assert.equal(db.affected_rows(), 1);
  const batch = [{ id: '2', ...firstRow, name: '第二行', hp: '80' }, { id: '3', ...firstRow, name: '第三行', hp: '40' }];
  sqls.push(await db.arrayInsert('native_rows', batch));
  assert.equal(db.affected_rows(), 2);
  sqls.push(await db.arrayUpdate('native_rows', { hp: '90', name: '仍有血' }, 'id=1', { hp: 90, name: '仍有血' }));
  assert.equal(db.affected_rows(), 1);
  sqls.push(await db.arrayUpdate('native_rows', { hp: '90' }, 'id=1', { hp: '90' }));
  sqls.push(await db.arrayInsert('native_rows', { id: '2', name: '更新', hp: '75' }, 1, 'id'));
  sqls.push(await db.multi_update('native_rows', [{ id: 2, hp: 70, name: '乙' }, { id: 3, hp: 0, name: '丙' }], 'id', "memo='changed'"));
  await db.execute("UPDATE native_rows SET raw=UNHEX('00ff41'),absent=NULL WHERE id=1");
  await db.execute('UPDATE native_rows SET hp=hp');
  assert.equal(db.affected_rows(), 0, 'Disable FOUND_ROWS to match mysqli changed-row counts');
  const result = await db.query('SELECT * FROM native_rows ORDER BY id');
  const actual = { sqls: sqls.map(sql => sql.replaceAll('native_rows', 'rows')), rows: cells(result), fields: db.num_fields(result), count: db.num_rows(result), first: cells([db.fetch_array(result)])[0] };
  assert.ok(Buffer.isBuffer(result[0].raw)); assert.equal(result[0].cash, '9007199254740993');
  assert.equal(result[0].fraction, '1.250000'); assert.equal(result[0].born, '2026-10-23 12:34:56');
  assert.equal(result[0].absent, null);
  assert.equal(db.data_seek(result, 1), true); actual.second = db.fetch_row(result).map(value => value === null ? null : Buffer.from(value).toString('base64'));
  assert.equal(db.result(result, 0), '1'); assert.equal(db.fetch_all(result).length, 2); assert.equal(db.fetch_array(result), null);
  const duplicate = await db.query('SELECT hp AS repeated,id AS repeated FROM native_rows WHERE id=1');
  assert.deepEqual(duplicate[0], { repeated: '1' }); assert.deepEqual(db.fetch_row(duplicate), ['90', '1']);
  assert.equal(db.data_seek(duplicate, 0), true); assert.deepEqual(db.fetch_array(duplicate, MYSQL_BOTH), { 0: '90', 1: '1', repeated: '1' });
  const source = String.raw`
    ini_set('zend.exception_ignore_args','1'); mysqli_report(MYSQLI_REPORT_OFF);
    $in=json_decode(file_get_contents('php://stdin'),true);
    define('IN_GAME',true); $charset='utf-8'; $dbcharset='utf8';
    require $in['root'].'/engine/include/db/db_mysqli.class.php';
    function cells($rows) { foreach($rows as &$row) foreach($row as &$v) if($v!==NULL) $v=base64_encode($v); return $rows; }
    $c=$in['credentials']; $db=new dbstuff();
    $db->connect($c['host'].':'.$c['port'],$c['user'],$c['password'],$c['database']);
    $db->query($in['create']); $sqls=[];
    $sqls[]=$db->array_insert('php_rows',$in['first']);
    $sqls[]=$db->array_insert('php_rows',$in['batch']);
    $sqls[]=$db->array_update('php_rows',['hp'=>'90','name'=>'仍有血'],'id=1',['hp'=>90,'name'=>'仍有血']);
    $sqls[]=$db->array_update('php_rows',['hp'=>'90'],'id=1',['hp'=>'90']);
    $sqls[]=$db->array_insert('php_rows',['id'=>'2','name'=>'更新','hp'=>'75'],1,'id');
    $sqls[]=$db->multi_update('php_rows',[['id'=>2,'hp'=>70,'name'=>'乙'],['id'=>3,'hp'=>0,'name'=>'丙']],'id',"memo='changed'");
    $db->query("UPDATE php_rows SET raw=UNHEX('00ff41'),absent=NULL WHERE id=1");
    $r=$db->query('SELECT * FROM php_rows ORDER BY id');
    $rows=$db->fetch_all($r); $db->data_seek($r,0); $first=$db->fetch_array($r);
    $db->data_seek($r,1); $second=$db->fetch_row($r);
    echo json_encode(['sqls'=>array_map(function($s){return str_replace('php_rows','rows',$s);},$sqls),'rows'=>cells($rows),'fields'=>$db->num_fields($r),'count'=>$db->num_rows($r),'first'=>cells([$first])[0],'second'=>cells([$second])[0]],JSON_UNESCAPED_UNICODE);
  `;
  const reference = spawnSync(php, ['-d', 'display_errors=stderr', '-r', source], { input: JSON.stringify({ root, credentials, create: createTable('php_rows'), first: firstRow, batch }), encoding: 'utf8', timeout: 15_000, maxBuffer: 2 * 1024 * 1024, windowsHide: true });
  // Do not print oracle stderr/stdout on failure: mysqli errors may contain SQL.
  assert.equal(reference.status, 0, 'PHP mysqli reference failed; sensitive diagnostics suppressed');
  assert.ok(reference.stderr === '', 'PHP mysqli reference emitted diagnostics (content suppressed)');
  let expected; try { expected = JSON.parse(reference.stdout); } catch { assert.fail('PHP mysqli reference returned invalid JSON; sensitive diagnostics suppressed'); }
  assert.deepEqual(actual, expected);
  const reopened = await createDatabase(credentials);
  try { assert.deepEqual(cells(await reopened.query('SELECT * FROM native_rows ORDER BY id')), actual.rows); }
  finally { await reopened.close(); }
  db.free_result(result); assert.throws(() => db.fetch_row(result), /open native database result/);
  t.diagnostic('Original mysqli and native Node wrote equivalent MyISAM rows; compared exact SQL and byte values, including UTF-8, quoted text, BIGINT, decimal, NULL, binary, duplicate columns and connection reopening.');
});

test('native database keeps multi statements explicit, preserves engines and reports errors without SQL secrets', { timeout: 20_000 }, async t => {
  const fixture = await isolatedDatabase(t, 'multi'); if (!fixture) return;
  const db = fixture.database;
  const parts = await db.queries("CREATE TABLE counts (id INT) ENGINE=HEAP; INSERT INTO counts VALUES (1),(2); SELECT COUNT(*) AS n FROM counts; SELECT 'a;b' AS text;");
  assert.equal(parts.length, 4); assert.deepEqual(parts[2], [{ n: '2' }]); assert.deepEqual(parts[3], [{ text: 'a;b' }]);
  assert.equal(db.more_results(), true); assert.equal(db.store_result(), false);
  db.next_result(); db.next_result(); assert.deepEqual(db.fetch_all(db.store_result(), MYSQL_NUM), [['2']]);
  assert.equal((await db.query("SHOW TABLE STATUS LIKE 'counts'"))[0].Engine, 'MEMORY');
  await assert.rejects(db.query('SELECT 1; DROP TABLE counts'), /multiple SQL statements/);
  await assert.rejects(db.query('SELECT 1; /*! SELECT 2 */'), /executable SQL comments/);
  assert.deepEqual(await db.query("SELECT 'a;\\\'b' AS text; /* ; harmless */ -- x\n"), [{ text: "a;'b" }]);
  const secret = 'do-not-include-this-in-errors';
  const silent = await db.query(`SELECT '${secret}' FROM definitely_missing`, 'SILENT');
  assert.equal(silent, false); assert.equal(db.errno(), 1146); assert.ok(!db.error().includes(secret));
  await assert.rejects(db.query(`SELECT '${secret}' FROM definitely_missing`), error => error instanceof NativeDatabaseError && !JSON.stringify(error).includes(secret) && !error.message.includes(secret));
  assert.equal((await db.query('SELECT COUNT(*) AS n FROM counts'))[0].n, '2'); assert.equal(db.errno(), 0);
  await assert.rejects(db.query('SELECT 1 AS `x\\`; SET @boundary = 7; -- `'));
  assert.equal((await db.query('SELECT @boundary AS value'))[0].value, null);
  await db.execute("SET sql_mode='NO_BACKSLASH_ESCAPES'");
  // Deliberately bypass the client's default-mode quote interpretation. The
  // server's disabled MULTI_STATEMENTS capability still rejects both commands.
  await assert.rejects(db.query("SELECT 'x\\'; SET @boundary = 8; -- '"));
  assert.equal((await db.query('SELECT @boundary AS value'))[0].value, null);
  await db.execute("SET sql_mode=''");
  await assert.rejects(db.queries('SELECT 1; SELECT * FROM definitely_missing; SELECT 2'));
  await assert.rejects(db.query('SELECT 1 AS `x\\`; SET @boundary = 9; -- `'));
  assert.equal((await db.query('SELECT @boundary AS value'))[0].value, null);
  await db.execute('CREATE TABLE bytes (raw VARBINARY(20), id INT PRIMARY KEY) ENGINE=MyISAM');
  await db.arrayInsert('bytes', { raw: Buffer.from([0, 255, 65]), id: 1 });
  assert.deepEqual((await db.query('SELECT raw FROM bytes'))[0].raw, Buffer.from([0, 255, 65]));
  await db.arrayUpdate('bytes', { raw: Buffer.from([255, 0, 34, 39, 92]) }, 'id=1');
  assert.deepEqual((await db.query('SELECT raw FROM bytes'))[0].raw, Buffer.from([255, 0, 34, 39, 92]));
  const copied = structuredClone({ raw: Buffer.from([0, 255, 65]), id: 2 });
  await db.arrayInsert('bytes', copied);
  assert.deepEqual((await db.query('SELECT raw FROM bytes WHERE id=2'))[0].raw, Buffer.from([0, 255, 65]));
  assert.equal(await db.arrayUpdate('bytes', copied, 'id=2', structuredClone(copied)), '');
  const binaryResult = await db.query("SELECT UNHEX('00ff41') AS raw");
  binaryResult[0].raw[0] = 66;
  assert.equal(db.fetch_row(binaryResult)[0].toString('hex'), '00ff41');
  db.data_seek(binaryResult, 0); const both = db.fetch_array(binaryResult, MYSQL_BOTH);
  both[0][0] = 66; assert.equal(both.raw.toString('hex'), '00ff41');
  both.raw[1] = 0; db.data_seek(binaryResult, 0); assert.equal(db.fetch_array(binaryResult).raw.toString('hex'), '00ff41');
  const concurrent = await Promise.all([db.queries('SET @native_order = 11; SELECT @native_order AS value'), db.query('SELECT @native_order AS value')]);
  assert.equal(concurrent[0][1][0].value, '11'); assert.equal(concurrent[1][0].value, '11');
});
