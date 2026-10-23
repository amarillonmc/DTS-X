import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { moduleBuiltins } from '../native/generated/builtins.mjs';
import { definition as skill539 } from '../native/generated/modules/skill539.mjs';
import { createGeneratedServices } from '../native/generated/context.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';

function oracle(code, input) {
  const result = spawnSync(process.env.DTS_REFERENCE_PHP || 'php', ['-r', code], { input: JSON.stringify(input), encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test('every emitted date format preserves the actual PHP fields including 12-hour h', async t => {
  const formats = new Map(); let callCount = 0;
  async function inspect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const target = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
      if (entry.isDirectory()) await inspect(target);
      else if (entry.name.endsWith('.mjs')) {
        const source = await readFile(target, 'utf8');
        const calls = [...source.matchAll(/r\.call\("(date|gmdate)", ("(?:\\.|[^"\\])*")/g)];
        assert.equal(calls.length, [...source.matchAll(/r\.call\("(?:date|gmdate)"/g)].length, `${target}: a dynamic date format needs a specific fixture`);
        callCount += calls.length;
        for (const match of calls) formats.set(match[1] + ':' + match[2], { name: match[1], format: JSON.parse(match[2]) });
      }
    }
  }
  await inspect(new URL('../native/generated/', import.meta.url));
  await inspect(new URL('../native/templates/generated/', import.meta.url));
  assert.ok(callCount > 0);
  const times = [-1, 0, 1, 3599, 3600, 3840, 43200, 46800, 86399, 86400, 1700000000, 1709164800];
  const calls = [...formats.values()].flatMap(format => times.map(time => ({ ...format, time })));
  const expected = oracle('date_default_timezone_set("UTC");$a=json_decode(stream_get_contents(STDIN),true);$out=[];foreach($a as $c)$out[]=$c["name"]($c["format"],$c["time"]);echo json_encode($out);', calls);
  const functions = moduleBuiltins();
  assert.deepEqual(calls.map(call => functions[call.name](call.format, call.time)), expected);
  t.diagnostic(`Audited ${callCount} real date/gmdate call sites, ${formats.size} distinct formats and ${calls.length} PHP outputs.`);
});

test('actual skill539 revival doubling and waiting logs retain original PHP date formatting', async t => {
  const cases = [0, 1, 6, 7, 11, 12].flatMap(count => {
    const interval = 30 * 2 ** count;
    return [0, Math.min(29, interval), Math.floor(interval / 2), interval].map(elapsed => ({ count: String(count), elapsed, enabled: true, hp: 0 }));
  });
  cases.push({ count: '7', elapsed: 0, enabled: false, hp: 0 }, { count: '7', elapsed: 0, enabled: true, hp: 50 });
  const php = String.raw`
namespace skillbase {
  function skill_query($id,&$pa=NULL){return $GLOBALS['item']['enabled'];}
  function skill_getvalue($id,$key,&$pa=NULL){return $GLOBALS['values'][$key]??NULL;}
}
namespace {
  date_default_timezone_set('UTC');
  define('__MAGIC__','$chprocess=$GLOBALS["next"]; return false;');
  function import_module(...$names){$ret='';foreach($names as $name)foreach($GLOBALS['states'][$name] as $key=>$value)$ret.='$'.$key.'=&$GLOBALS["states"]["'.$name.'"]["'.$key.'"];';return $ret;}
  require 'engine/include/modules/extra/card/skills/skill539/main.php';
  $out=[];$cases=json_decode(stream_get_contents(STDIN),true);
  foreach($cases as $item){
    $states=['sys'=>['now'=>1700000000+$item['elapsed']],'player'=>['hp'=>$item['hp'],'sdata'=>['pid'=>1,'hp'=>$item['hp']]],'logger'=>['log'=>'before:']];
    $values=['activated_num'=>$item['count'],'lastdeath'=>'1700000000','need_log'=>'0'];$nextCount=0;$next=function()use(&$nextCount){$nextCount++;};
    $interval=\skill539\get_skill539_revive_interval();$available=\skill539\check_skill539_revive_available();\skill539\pre_act();
    $out[]=['interval'=>$interval,'available'=>$available,'log'=>$states['logger']['log'],'nextCount'=>$nextCount];
  }
  echo json_encode($out);
}`;
  const expected = oracle(php, cases);
  for (const [index, item] of cases.entries()) {
    let nextCount = 0;
    const values = { activated_num: item.count, lastdeath: '1700000000', need_log: '0' };
    // These are explicit skill-state and next-hook fixtures. The actual skill
    // computes its interval and expiry and produces the entire original log.
    const session = await new ModuleRegistry([
      { name: 'sys', state: { now: 1700000000 + item.elapsed } },
      { name: 'player', state: { hp: item.hp, sdata: { pid: 1, hp: item.hp } }, functions: { pre_act: () => { nextCount++; } } },
      { name: 'logger', state: { log: 'before:' } },
      { name: 'skillbase', functions: { skill_query: () => item.enabled, skill_getvalue: (ctx, id, key) => values[key] ?? null } },
      { name: 'skill539', dependencies: ['player'], functions: skill539.functions },
    ]).createSession({ services: { generated: createGeneratedServices() } });
    const interval = await session.call('skill539', 'get_skill539_revive_interval');
    const available = await session.call('skill539', 'check_skill539_revive_available');
    await session.call('skill539', 'pre_act');
    assert.deepEqual({ interval, available, log: session.state('logger').log, nextCount }, expected[index], JSON.stringify(item));
  }
  t.diagnostic(`Compared ${cases.length} original skill539 intervals, strict expiry boundaries, complete waiting logs and next-hook calls.`);
});
