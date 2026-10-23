import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { loggerModule } from '../native/gameplay/logger.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { createDatabase } from '../native/storage/database.mjs';
import { isolatedDatabase } from './helpers/native-database.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const phpFixture = String.raw`<?php
namespace player { function pre_act() { if(eval(__MAGIC__)) return $___RET_VALUE; $GLOBALS['trace'][]=array('next',$GLOBALS['log']); } }
namespace {
 define('IN_GAME',true); define('IN_MODULEMNG',true); define('GAME_ROOT',__DIR__.'/engine/');
 require GAME_ROOT.'include/modules/modules.func.php'; require GAME_ROOT.'include/modules/base/logger/main.php';
 define('IMPORT_MODULE_SYS_GLOBALS','global $db,$tablepre,$now;'); define('IMPORT_MODULE_PLAYER_GLOBALS','global $pid;'); define('IMPORT_MODULE_LOGGER_GLOBALS','global $log;');
 setlocale(LC_CTYPE,'C'); mb_internal_encoding('UTF-8');
 $input=json_decode(stream_get_contents(STDIN),true); $trace=array(); $now=$input['now']??10000; $pid=$input['pid']??'1'; $tablepre=$input['prefix']??'fixture_'; $log=$input['log']??null;
 class Rows { public $offset=0; public $rows; function __construct($rows) {$this->rows=$rows;} }
 class FixtureDB {
   function query($sql) { $GLOBALS['trace'][]=array(strpos($sql,'SELECT')===0?'query':'execute',$sql); return new Rows($GLOBALS['input']['rows']??array()); }
   function fetch_array($rows) { return $rows->rows[$rows->offset++]??false; }
   function array_insert(...$args) { $GLOBALS['trace'][]=array_merge(array('insert'),$args); }
 }
 if(isset($input['credentials'])) { ini_set('zend.exception_ignore_args','1'); mysqli_report(MYSQLI_REPORT_OFF); require GAME_ROOT.'include/db/db_mysqli.class.php'; $charset='utf-8';$dbcharset='utf8';$c=$input['credentials'];$db=new dbstuff();$db->connect($c['host'].':'.$c['port'],$c['user'],$c['password'],$c['database']); }
 else $db=new FixtureDB();
 hook_register('player','pre_act'); foreach(array('logsave','pre_act','log_linenum_counter') as $name) hook_register('logger',$name);
 $results=array(); foreach($input['calls'] as $call) {$name=array_shift($call);$fn='logger\\'.$name;$results[]=$fn(...$call);}
 $out=array('result'=>$results,'log'=>$log,'trace'=>$trace);
 if(isset($input['credentials'])) $out['remaining']=$db->fetch_all($db->query('SELECT * FROM '.$tablepre.'log ORDER BY lid'));
 echo json_encode($out,JSON_UNESCAPED_UNICODE);
}
`;

async function oracle(t) {
  const php = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', timeout: 10000, windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires development-only PHP 7.4 oracle.'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'native-logger-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  for (const source of ['include/modules/modules.func.php', 'include/modules/base/logger/main.php', 'include/db/db_mysqli.class.php']) {
    const target = path.join(root, 'engine', source); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', source), target);
  }
  await mkdir(path.join(root, 'engine/include/modulemng'), { recursive: true });
  await copyFile(path.join(project, 'engine/include/modulemng/modulemng.config.sample.php'), path.join(root, 'engine/include/modulemng/modulemng.config.php'));
  const file = path.join(root, 'oracle.php'); await writeFile(file, phpFixture);
  return input => {
    const result = spawnSync(php, ['-d', 'display_errors=stderr', '-d', 'error_reporting=22519', file], { input: JSON.stringify(input), encoding: 'utf8', timeout: 15000, maxBuffer: 8 * 1024 * 1024, windowsHide: true });
    assert.equal(result.status, 0, input.credentials ? 'PHP DB oracle failed; sensitive diagnostics suppressed' : result.stderr);
    try { return JSON.parse(result.stdout); } catch { assert.fail('PHP oracle emitted invalid JSON; diagnostics suppressed'); }
  };
}

async function native(input, actualDatabase = null) {
  const trace = [];
  const database = actualDatabase ?? {
    async query(sql) { trace.push(['query', sql]); return input.rows ?? []; },
    async execute(sql) { trace.push(['execute', sql]); },
    async arrayInsert(...args) { trace.push(['insert', ...args]); },
  };
  const session = await new ModuleRegistry([
    { name: 'sys', state: { now: input.now ?? 10000, tablepre: input.prefix ?? 'fixture_' } },
    { name: 'player', state: { pid: input.pid ?? '1' }, functions: { async pre_act(ctx) { await Promise.resolve(); trace.push(['next', ctx.state('logger').log]); } } },
    loggerModule,
  ]).createSession({ services: { database } });
  session.state('logger').log = input.log ?? null;
  const result = [];
  for (const [name, ...args] of input.calls) result.push((await session.call('logger', name, ...args)) ?? null);
  const out = { result, log: session.state('logger').log, trace };
  if (actualDatabase) out.remaining = await actualDatabase.query(`SELECT * FROM ${input.prefix}log ORDER BY lid`);
  return out;
}

test('native logger preserves source timing, SQL, hook order and markup line estimates', async t => {
  const reference = await oracle(t); if (!reference) return;
  const cases = [
    { calls: [['logsave', '7', '123', '战斗', 'b'], ['logsave', 8, 124], ['pre_act']], rows: [{ time: '6339', log: '较早' }, { time: '9999', log: '刚刚' }, { time: '10000', log: '现在' }, { time: '10001', log: '未来' }], log: '已有' },
    { calls: [['pre_act']], rows: [], log: null },
    { calls: [['pre_act']], now: 10000.7, rows: [{ time: '10001', log: '负数的小数时间差' }, { time: '13661', log: '未来一小时' }] },
  ];
  for (const input of cases) assert.deepEqual(await native(input), reference(input));
  const strings = ['', '0', '甲乙丙', 'ABC', 'İKÄé', '😀中e\u0301', 'a\0b', '<br>', '<BR/>', '<br />', '</br>', '<br title="x > y">尾', '<br title="x < y">尾', '<b>甲</b><br>乙', '<script>payload</script>', '<!--<br>-->tail', '<!DOCTYPE html>尾', '<?php echo "?>";?>尾', '<?xml version="1.0"?>尾', 'before<?xml x>after', 'x< unclosed', '<notclosed', 'x<<b>discard>tail', 'a<br class="b">c', '<!--open', '<br/ ><br//>', '<!x \'quoted >\'>尾'];
  const fragments = ['a', '汉', '<br>', '<br/>', '<br title="x">', '<b>', '</b>', '>', '< ', '<', '"', "'", '<?', '?>', '(', ')', '<!--', '-->', '\0', '😀'];
  let seed = 12345;
  for (let i = 0; i < 100; i++) { let s = ''; for (let j = 0; j < 12; j++) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; s += fragments[seed % fragments.length]; } strings.push(s); }
  const input = { log: '<b>默认日志</b><br>', calls: strings.flatMap(s => [0, 1, 2, 3, 4, 8, 48].map(limit => ['log_linenum_counter', s, limit])) };
  const actual = await native(input), expected = reference(input);
  for (let i = 0; i < input.calls.length; i++) assert.equal(actual.result[i], expected.result[i], `line counter ${JSON.stringify(input.calls[i])}`);
  t.diagnostic(`Compared ${input.calls.length} line-counter cases and 3 source persistence/timing traces.`);
});

test('native logger writes and consumes real source log rows across reconnects against mysqli', { timeout: 60000 }, async t => {
  const reference = await oracle(t); if (!reference) return;
  const isolated = await isolatedDatabase(t, 'logger'); if (!isolated) return;
  const source = await readFile(path.join(project, 'engine/gamedata/sql/reset.sql'), 'utf8');
  const schema = source.match(/DROP TABLE IF EXISTS bra_log;[\s\S]*?\) ENGINE=MyISAM;/)?.[0]; assert.ok(schema);
  for (const prefix of ['native_', 'oracle_']) await isolated.database.queries(schema.replaceAll('bra_', prefix));
  const writes = { now: 10000, calls: [['logsave', '1', '6339', '小时消息', 'b'], ['logsave', '1', 9999, '<b>同秒第一条</b>'], ['logsave', '2', 9999, '他人消息', 't'], ['logsave', '1', 9999, "引号 O\\'Brien 和路径\\\\", 'c']] };
  await native({ ...writes, prefix: 'native_' }, isolated.database);
  reference({ ...writes, prefix: 'oracle_', credentials: isolated.credentials });
  const reopened = await createDatabase(isolated.credentials);
  try {
    const consume = { now: 10000, log: '已有', calls: [['pre_act'], ['log_linenum_counter']] };
    const actual = await native({ ...consume, prefix: 'native_' }, reopened);
    assert.deepEqual(actual, reference({ ...consume, prefix: 'oracle_', credentials: isolated.credentials }));
    assert.equal(actual.remaining.length, 1); assert.equal(actual.remaining[0].toid, '2');
    const twice = await native({ ...consume, prefix: 'native_' }, reopened);
    assert.equal(twice.log, '已有', 'Consumed rows are not delivered twice');
  } finally { await reopened.close(); }
});

test('native logger refuses missing database capability', async () => {
  const session = await new ModuleRegistry([{ name: 'sys' }, { name: 'player' }, loggerModule]).createSession();
  await assert.rejects(session.call('logger', 'logsave', 1, 1), /database.arrayInsert/);
  await assert.rejects(session.call('logger', 'pre_act'), /database.query/);
});
