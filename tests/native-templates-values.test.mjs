import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { builtinFunctions } from '../native/templates/builtins.mjs';
import { loaders } from '../native/templates/catalog.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const normalize = value => value instanceof Map ? (Array.from(value.keys()).every((key, i) => key === i) ? [...value.values()].map(normalize) : Object.fromEntries([...value].map(([key, child]) => [key, normalize(child)]))) : Array.isArray(value) ? value.map(normalize) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, child]) => [key, normalize(child)])) : value;
test('template native builtins match actual PHP for the corpus value boundaries', t => {
  const php = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', timeout: 10000, windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires development-only PHP 7.4 oracle'); return; }
  const cases = [], add = (name, ...args) => cases.push({ name, args });
  for (const value of [null, false, 0, '0', '', 'abc', '中文😀é', ['甲', 'b'], { z: 1, a: 2 }]) for (const name of ['count', 'sizeof', 'is_array', 'is_numeric', 'is_string']) add(name, value);
  for (const value of ['', 'abc', '中文😀é', '\0 text \n', '<span title="x>y">中文 &amp; <b>a</b></span>', '<br/>x<!-- hi -->y', '<?xml version="1"?>xml', 'x < 2 > 1', '<script>if(a<b)c();</script>end']) {
    for (const name of ['strlen', 'mb_strlen', 'strtoupper', 'trim', 'htmlentities', 'urlencode', 'md5', 'strip_tags', 'json_encode']) add(name, value);
  }
  for (const value of ['abcde', '']) for (const start of [-6, -2, 0, 2, 6]) for (const length of [-2, 0, 2, 9]) add('substr', value, start, length);
  for (const needle of ['a', '中', 'missing']) for (const offset of [0, 2, -3]) add('strpos', 'ab中文abc', needle, offset);
  for (const args of [[1, 5], [5, 1], [2, 2], [1, 5, 2], ['a', 'e'], ['e', 'a'], ['1', '3']]) add('range', ...args);
  add('str_replace', ['a', 'b'], ['b', 'x'], 'abc'); add('str_replace', '', 'x', 'abc'); add('str_replace', ['a', 'b'], ['x'], ['ab', 'bc']);
  for (const limit of [-3, -1, 0, 1, 2, 10]) add('explode', ',', 'a,b,c', limit);
  add('implode', '、', { x: '甲', y: '乙' }); add('implode', ['a', 'b']);
  for (const strict of [false, true]) for (const needle of [0, '0', false, 'missing', 1]) { add('in_array', needle, ['abc', 0, 1], strict); add('array_search', needle, ['abc', 0, 1], strict); }
  add('array_keys', { '2': 'a', x: 'b' }); add('array_flip', ['zero', 'one', 'zero']); add('array_merge', ['a'], { x: 1, '3': 'b' }, { x: 2 });
  for (const value of [-2.5, -1.5, 1.4999999999999998, 1.5, 2.5, 100.001]) for (const name of ['round', 'floor', 'ceil']) add(name, value);
  for (const name of ['min', 'max']) { add(name, [1, '2', -3]); add(name, 1, '2', -3); }
  for (const seconds of [0, 59, 60, 3661, 86400, 91900, -65]) for (const simple of [0, 1]) add('convert_tm', seconds, simple);
  for (const format of ['Y-m-d H:i:s', 'Y-n-j', 'y/n/j G:i:s w U']) for (const time of [0, 1700000000, -1]) { add('date', format, time); add('gmdate', format, time); }
  const code = 'define("IN_GAME",true);$input=json_decode(stream_get_contents(STDIN),true);require $input["user"];setlocale(LC_CTYPE,"C");mb_internal_encoding("UTF-8");date_default_timezone_set("UTC");$result=[];foreach($input["cases"] as $case){$name=$case["name"];$result[]=$name(...$case["args"]);}echo json_encode($result,JSON_UNESCAPED_UNICODE);';
  const result = spawnSync(php, ['-d', 'display_errors=stderr', '-d', 'error_reporting=22519', '-r', code], { input: JSON.stringify({ user: path.join(root, 'engine/include/user.func.php'), cases }), encoding: 'utf8', timeout: 10000, maxBuffer: 4 * 1024 * 1024, windowsHide: true });
  assert.equal(result.status, 0, result.stderr);
  const expected = JSON.parse(result.stdout), builtin = builtinFunctions();
  for (const [index, input] of cases.entries()) assert.deepEqual(normalize(builtin[input.name](...input.args)), expected[index], `${input.name}(${JSON.stringify(input.args)})`);
  t.diagnostic(`Compared ${cases.length} actual PHP builtin calls.`);
});

test('all 882 generated modules are importable, source-bound and contain no runtime code evaluation', async () => {
  const manifest = JSON.parse(await readFile(path.join(root, 'native/templates/manifest.json'), 'utf8'));
  const upstream = JSON.parse(await readFile(path.join(root, 'upstream/manifest.json'), 'utf8'));
  assert.equal(manifest.outputs.length, 882); assert.equal(Object.keys(loaders).length, 882);
  const originals = new Map(upstream.files.map(file => [file.path, file.sha256]));
  for (const file of manifest.outputs) {
    const code = await readFile(path.join(root, 'native/templates', file.output), 'utf8');
    assert.equal(file.sourceHash, originals.get(file.source));
    assert.equal(createHash('sha256').update(code).digest('hex'), file.generatedHash);
    assert.equal(typeof (await loaders[file.source]()).default, 'function');
    assert.doesNotMatch(code, /\b(?:eval|Function)\s*\(/, file.source);
  }
});
