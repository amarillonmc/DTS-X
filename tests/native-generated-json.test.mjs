import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { moduleBuiltins } from '../native/generated/builtins.mjs';
import { JsonObject, jsonObjectEntries } from '../native/protocol/json.mjs';
import * as v from '../native/templates/values.mjs';

const canonical = value => value instanceof JsonObject ? { object: jsonObjectEntries(value).map(([key, child]) => [key, canonical(child)]) }
  : v.isArray(value) ? { entries: v.entries(value).map(([key, child]) => [key, canonical(child)]) } : value;
test('generated JSON data distinguishes objects and arrays and preserves textual numeric key order against PHP', async t => {
  const functions = moduleBuiltins(), sources = [
    '{}', '[]', '{"9":"a","2":"b","9":"c","01":"d"}', '[{"7":[2,3],"0":[]},{}]',
    '{"__proto__":{"constructor":"x"},"constructor":4}', '"甲\\u4e59"', '{"-1":2,"0":3,"1":4}',
    'null', 'true', '1.25', '-0', '"a\\u0000b"', '{"x":true,"y":null}', '{"0":"a","1":"b"}',
    '', '[1,]', '{"a":}', '01', '"\\ud800"', '"\\u000a"', '[[]]', '{"x":{"y":{}}}',
  ], cases = sources.flatMap(source => [false, true].map(associative => ({ source, associative })));
  const source = '$a=json_decode(stream_get_contents(STDIN),true);function canon($v){if(is_object($v)){$e=[];foreach($v as $k=>$c)$e[]=[(string)$k,canon($c)];return ["object"=>$e];}if(is_array($v)){$e=[];foreach($v as $k=>$c)$e[]=[$k,canon($c)];return ["entries"=>$e];}return $v;}$out=[];foreach($a as $c){$v=json_decode($c["source"],$c["associative"]);$out[]=[canon($v),var_export($v,true),json_encode($v)];}echo json_encode($out);';
  const php = spawnSync(process.env.DTS_REFERENCE_PHP || 'php', ['-r', source], { input: JSON.stringify(cases), encoding: 'utf8', windowsHide: true });
  assert.equal(php.status, 0, php.stderr); const expected = JSON.parse(php.stdout);
  for (const [index, item] of cases.entries()) {
    const value = functions.json_decode(item.source, item.associative);
    assert.deepEqual([canonical(value), functions.var_export(value, true), functions.json_encode(value)], expected[index], JSON.stringify(item));
  }
  for (const associative of [false, true]) for (const depth of [1,2,3,4]) {
    const args = ['{"x":{"y":{}}}', associative, depth], run = spawnSync(process.env.DTS_REFERENCE_PHP || 'php', ['-r', '$a=json_decode(stream_get_contents(STDIN),true);echo var_export(json_decode(...$a),true);'], { input: JSON.stringify(args), encoding: 'utf8', windowsHide: true });
    assert.equal(run.status, 0, run.stderr); assert.equal(functions.var_export(functions.json_decode(...args), true), run.stdout);
  }
  t.diagnostic(`Compared ${cases.length} JSON cases with scalar, object/array, duplicate, numeric-order and invalid-input branches, plus 8 depth boundaries.`);
});
