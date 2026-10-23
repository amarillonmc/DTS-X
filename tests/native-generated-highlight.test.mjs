import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { moduleBuiltins } from '../native/generated/builtins.mjs';
import { definition as skill1012 } from '../native/generated/modules/skill1012.mjs';
import { createGeneratedServices } from '../native/generated/context.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';

test('GM variable highlighting preserves embedded PHP-looking text as escaped display only', t => {
  const functions = moduleBuiltins();
  const values = ['', 'plain 中文', '\n\r\n\t', '<? short ?>', '<?php', '<?php ?>', '<?=3?>',
    '<?php echo "x"; ?>', '<?php $a=3; return array(1,true,NULL);', 'text <?php /*hi*/ $a = 4 + 7; ?> after',
    '<?php if($a instanceof Thing) {new Thing;}', '<?php use Foo\\Bar; class A extends B {}', '<?php //hi\n$x=0x10; ?>',
    '<?php \'a\\\'b\' . "a$x";', '<?php $a[2]->x() !== Foo::BAR; ?>', '<?php echo "a$a[2] b";',
    '<?php "{$a[\'x\']}";', '<?php "${a}";', '<?php __LINE__ . function($a) {}', '<?php <<<TXT\nabc\nTXT;',
    "<?php <<<'TXT'\nabc\nTXT;", '<?php `ls $a`;', "<?php 'unfinished", '<?php "unfinished', '<?php //comment ?>\nx',
    [1, '<?php echo "字";?>', { a: null, value: '<?= $unsafe ?>' }],
  ];
  const php = spawnSync(process.env.DTS_REFERENCE_PHP || 'php', ['-r', '$a=json_decode(stream_get_contents(STDIN),true);$out=[];foreach($a as $v){$s=var_export($v,true);$out[]=[highlight_string(is_string($v)?$v:$s,true),highlight_string($s,true)];}echo json_encode($out);'], { input: JSON.stringify(values), encoding: 'utf8', windowsHide: true });
  assert.equal(php.status, 0, php.stderr); const expected = JSON.parse(php.stdout);
  for (const [index, value] of values.entries()) {
    const source = functions.var_export(value, true), actual = [functions.highlight_string(typeof value === 'string' ? value : source, true), functions.highlight_string(source, true)];
    assert.deepEqual(actual, expected[index], JSON.stringify(value));
  }
  t.diagnostic(`Compared ${values.length * 2} actual PHP highlighting outputs, including skill1012's exact var_export input shape.`);
});

test('actual skill1012 variable inspection retains full PHP log and command mutations', async () => {
  const cases = [
    { value: '<?php echo "never executed"; ?>', name: '$shown', namespace: 'fixture' },
    { value: ['<?= $example ?>', { nested: '<?php /*x*/ $name = 4;' }], name: 'shown', namespace: 'fixture' },
    { value: null, name: 'shown', namespace: 'fixture' },
    { value: '<? short ?>', name: '', namespace: 'fixture' },
  ];
  const source = 'define("__MAGIC__","return false;");function import_module(...$names){return "global $"."log,$"."mode,$"."command,$"."shown;";}require "engine/include/modules/extra/gmskills/skill1012/main.php";$a=json_decode(stream_get_contents(STDIN),true);$out=[];foreach($a as $case){$log="before:";$mode="special";$command="skill1012_special";$shown=$case["value"];skill1012\\skill1012_show_var($case["namespace"],$case["name"]);$out[]=[$log,$mode,$command];}echo json_encode($out);';
  const php = spawnSync(process.env.DTS_REFERENCE_PHP || 'php', ['-r', source], { input: JSON.stringify(cases), encoding: 'utf8', windowsHide: true });
  assert.equal(php.status, 0, php.stderr); const expected = JSON.parse(php.stdout);
  for (const [index, item] of cases.entries()) {
    const session = await new ModuleRegistry([
      { name: 'sys', state: { mode: 'special', command: 'skill1012_special' } }, { name: 'player', state: {} },
      { name: 'logger', state: { log: 'before:' } }, { name: 'fixture', state: { shown: item.value } }, { name: 'skill1012', functions: skill1012.functions },
    ]).createSession({ services: { generated: createGeneratedServices() } });
    await session.call('skill1012', 'skill1012_show_var', item.namespace, item.name);
    assert.deepEqual([session.state('logger').log, session.state('sys').mode, session.state('sys').command], expected[index]);
  }
});
