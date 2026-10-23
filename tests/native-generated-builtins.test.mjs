import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { moduleBuiltins } from '../native/generated/builtins.mjs';
import { createGeneratedServices } from '../native/generated/context.mjs';
import { definitions } from '../native/generated/remaining/catalog.mjs';
import { reference } from '../native/modules/registry.mjs';
import * as v from '../native/templates/values.mjs';

const canonical = value => v.isArray(value) ? { entries: v.entries(value).map(([key, child]) => [key, canonical(child)]) } : Buffer.isBuffer(value) ? { binary: value.toString('base64') } : value;
test('generated module builtins retain PHP source collection, scalar and byte boundaries', async t => {
  const functions = moduleBuiltins(), calls = [];
  const add = (name, ...args) => calls.push({ name, args });
  for (const value of ['', 'abc', '甲乙', '∞', 'a\0b']) { add('base64_encode', value); add('base64_decode', Buffer.from(value).toString('base64')); add('md5sub', value, 10); }
  for (const values of [[], [1, 2, 3], { a: 1, 8: 2, b: 3, 9: 4 }]) for (const start of [-7, -1, 0, 2, 10]) for (const length of [-1, 0, 2, null]) add('array_slice', values, start, length);
  for (const value of [0, 1, 255, -1, 256]) { add('chr', value); add('pack', 'C', value); }
  for (const value of ['abc', '', '甲']) add('ord', value);
  for (const number of [-1.25, 1.25, 12345.678, 0, -0.01]) for (const decimals of [0, 1, 2]) add('number_format', number, decimals);
  for (const number of [-12, 0, 3, 123]) add('sprintf', '%02d:%d', number, number);
  add('array_column', [{ a: 1, k: 'x' }, { k: 'missing' }, { a: 2 }, { a: 3, k: 'x' }], 'a', 'k');
  add('array_combine', ['a', 'b'], [5, 6]); add('array_intersect', { a: '1', b: 2, c: '3' }, [1, '3']);
  add('array_diff_key', { a: 1, b: 2, c: 3 }, { b: 9 }); add('substr_replace', 'HP23', 4, 2, 1);
  for (const input of [['a','b','c'], { 0:'a',2:'b',z:'c' }]) for (const min of [0,1,2,4]) add('full_combination', input, min);
  for (const input of ['', '用户甲', '123456789', 'seed']) for (const length of [1,9,16]) add('fatenum_create', input, length);
  add('array_merge_recursive', { a: [1], b: 'x' }, { a: [2], b: ['y'], c: null });
  add('htmlspecialchars_decode', '&lt;a&gt;&amp;&quot;&#039;', 2); add('htmlspecialchars_decode', '&amp;lt;&apos;&#x27;', 3);
  for (const input of ['甲+乙%20%2B', '%XX%FF', '%%25']) add('urldecode', input);
  for (const time of [0, 1700000000, 1709164800]) { add('localtime', time); add('localtime', time, true); }
  for (const value of [[], [1, { a: 'x\ny' }], 'a\0b', 'a\\b', true, null]) { add('var_export', value, true); add('highlight_string', functions.var_export(value, true), true); }
  for (const before of [false, true]) add('strstr', '前字F后字', 'F', before);
  for (const width of [1, 2, 3, 4]) add('str_split', '甲乙∞', width);
  for (const offset of [0, 1, 2, 4, -1]) add('substr_replace', '甲乙', '中', offset, 1);
  const code = 'define("IN_GAME",true);define("GAME_ROOT",getcwd()."/engine/");require GAME_ROOT."include/global.func.php";date_default_timezone_set("UTC");$a=json_decode(stream_get_contents(STDIN),true);function canon($v){if(is_array($v)){$e=[];foreach($v as $k=>$c)$e[]=[$k,canon($c)];return ["entries"=>$e];}if(is_string($v)&&!preg_match("//u",$v))return ["binary"=>base64_encode($v)];return $v;}$out=[];foreach($a as $c)$out[]=canon(call_user_func_array($c["name"],$c["args"]));echo json_encode($out,JSON_UNESCAPED_UNICODE|JSON_PARTIAL_OUTPUT_ON_ERROR);';
  const php = spawnSync(process.env.DTS_REFERENCE_PHP || 'php', ['-r', code], { input: JSON.stringify(calls), encoding: 'utf8', windowsHide: true });
  if (php.error?.code === 'ENOENT') { t.skip('Requires development-only PHP 7.4'); return; } assert.equal(php.status, 0, php.stderr);
  const expected = JSON.parse(php.stdout);
  for (let i = 0; i < calls.length; i++) { const { name, args } = calls[i]; let answer = await functions[name](...args); if (Buffer.isBuffer(answer) && Buffer.from(answer.toString()).equals(answer)) answer = answer.toString(); assert.deepEqual(canonical(answer), expected[i], JSON.stringify(calls[i])); }
  t.diagnostic(`Compared ${calls.length} actual PHP calls.`);
});

test('native byte offsets, comparisons and gzip output match PHP byte strings', () => {
  const f = moduleBuiltins(), source = '甲乙,∞abc', actual = [];
  for (let offset = 0; offset < Buffer.byteLength(source); offset++) { const byte = v.get(source, offset); actual.push([f.base64_encode(byte), v.compare(byte, 'a') <= 0, f.base64_encode(f.substr(source, offset, 2))]); }
  const php = spawnSync(process.env.DTS_REFERENCE_PHP || 'php', ['-r', '$s=json_decode(stream_get_contents(STDIN));$out=[];for($i=0;$i<strlen($s);$i++)$out[]=[base64_encode($s[$i]),$s[$i]<="a",base64_encode(substr($s,$i,2))];echo json_encode([$out,base64_encode(gzencode($s))]);'], { input: JSON.stringify(source), encoding: 'utf8', windowsHide: true });
  assert.equal(php.status, 0, php.stderr); const expected = JSON.parse(php.stdout); assert.deepEqual(actual, expected[0]); assert.equal(f.base64_encode(f.gzencode(source)), expected[1]);
});

test('generated compound attributes and BMP functions match real PHP source including nested async callback and binary references', async () => {
  const modules = new Map(definitions.map(module => [module.name, module]));
  const generated = createGeneratedServices(), services = { generated };
  const context = module => ({ services, moduleName: module, state: () => ({}), hasModule: name => modules.has(name), call: (target, fn, ...args) => modules.get(target).functions[fn](context(target), ...args) });
  const cases = [
    ['attrbase', 'config_process_encode_comp_itmsk', ['^res_<:comp_itmsk:>{甲^res_<:comp_itmsk:>{乙}1^res_<:comp_itmsk:>{丙}1}1']],
    ['attrbase', 'config_process_encode_comp_itmsk_sepr_transfer', ['x<:comp_itmsk:>{a,b,c}1']],
    ['attrbase', 'base64_encode_comp_itmsk', ['甲乙,∞']],
    ['bmp_util', 'gen_bmp', [[[255, 0, 127], [0, 255, 128]], 2, 1]],
  ];
  const answers = [];
  for (const [module, name, args] of cases) { const value = await context(module).call(module, name, ...args); answers.push((Buffer.isBuffer(value) ? value : Buffer.from(value)).toString('base64')); }
  const source = "define('IN_GAME',true);define('__MAGIC__','return false;');require 'engine/include/modules/extra/attr/attrbase/main.php';require 'engine/include/modules/extra/misc/bmp_util/main.php';$a=json_decode(stream_get_contents(STDIN),true);$out=[];foreach($a as $c){$args=$c[2];$refs=[];foreach($args as &$arg)$refs[]=&$arg;unset($arg);$out[]=base64_encode(call_user_func_array($c[0].'\\\\'.$c[1],$refs));}echo json_encode($out);";
  const php = spawnSync(process.env.DTS_REFERENCE_PHP || 'php', ['-r', source], { input: JSON.stringify(cases), encoding: 'utf8', windowsHide: true });
  assert.equal(php.status, 0, php.stderr); assert.deepEqual(answers, JSON.parse(php.stdout));
});
