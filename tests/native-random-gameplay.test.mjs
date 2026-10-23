import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { definition as randmix } from '../native/generated/remaining/modules/randmix.mjs';
import { definition as skill424 } from '../native/generated/modules/skill424.mjs';
import { definition as song } from '../native/generated/remaining/modules/song.mjs';
import { definition as randnpc } from '../native/generated/remaining/modules/randnpc.mjs';
import { createGeneratedServices, createModuleContext } from '../native/generated/context.mjs';
import { createPhp74Random } from '../native/random.mjs';
import * as v from '../native/templates/values.mjs';

const root = fileURLToPath(new URL('../engine/', import.meta.url)).replaceAll('\\', '/');
function oracle(t, source, input) {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires PHP 7.4 development oracle'); return; }
  const output = spawnSync(executable, ['-d', 'display_errors=stderr', '-d', 'error_reporting=22519', '-r', source, root],
    { input: JSON.stringify(input), encoding: 'utf8', windowsHide: true, timeout: 20000, maxBuffer: 8 * 1024 * 1024 });
  assert.equal(output.status, 0, output.stderr); assert.equal(output.stderr, ''); return JSON.parse(output.stdout);
}

test('original randmix and debugging-task rejection loops retain deleted hash buckets and random continuation', async t => {
  const minimal = { 面包: [3, 0], 矿泉水: [40, 0], 解毒剂: [3, 0], 止血剂: [40, 0], 磨刀石: [3, 0], 营养饮料: [40, 0] };
  const cases = [];
  for (const module of ['randmix', 'skill424']) for (const seed of Array.from({ length: 32 }, (_, index) => index)) {
    cases.push({ module, seed, pool: minimal, minimum: 10, maximum: -1, ready: [], wave: 0 });
    for (const size of [3, 9, 17, 33, 65]) {
      const pool = Object.fromEntries(Array.from({ length: size }, (_, index) => ['候选道具' + index, [index % 3 === 1 ? 40 : 3, index % 4 === 0 ? 2 : 0]]));
      cases.push({ module, seed, pool, minimum: 10, maximum: 60, ready: ['候选道具1'], wave: 0 });
    }
  }
  const expected = oracle(t, String.raw`
    namespace map { function get_area_wavenum(){return $GLOBALS['wave'];} }
    namespace {
      define('IN_GAME',true);define('__MAGIC__','return false;');
      function import_module(...$names){return '';}
      require $argv[1].'include/modules/extra/misc/randmix/main.php';
      require $argv[1].'include/modules/extra/instance/gtype1/skill424/main.php';
      $out=[];foreach(json_decode(stream_get_contents(STDIN),true)as$c){
        $cont_mapitem=$c['pool'];$wave=$c['wave'];$ready=$c['ready'];mt_srand($c['seed']);
        $name=$c['module']=='randmix'?'randmix\\randmix_getitemname':'skill424\\wdebug_getreq';
        $out[]=[$name('mapitem',$c['minimum'],$c['maximum'],$ready),$ready,rand(),rand()];
      }echo json_encode($out,JSON_UNESCAPED_UNICODE);
    }`, cases);
  if (!expected) return;
  assert.deepEqual(expected[0].slice(0, 3), [['止血剂', 40], ['止血剂'], 1535857466]);
  for (const [index, item] of cases.entries()) {
    const random = createPhp74Random(item.seed), ready = [...item.ready];
    const generated = createGeneratedServices({ globals: { cont_mapitem: structuredClone(item.pool) }, random });
    // Only the original function's external map wave and module imports are
    // fixture boundaries. Both candidate loops execute their real emitted JS.
    const ctx = { services: { generated, random }, importInto() {}, hasModule: () => false,
      call(module, name) { assert.equal(module + '.' + name, 'map.get_area_wavenum'); return item.wave; } };
    const implementation = item.module === 'randmix' ? randmix.functions.randmix_getitemname : skill424.functions.wdebug_getreq;
    const answer = await implementation(ctx, 'mapitem', item.minimum, item.maximum, ready);
    assert.deepEqual([answer, ready, random.rand(), random.rand()], expected[index], `source ${item.module}, seed=${item.seed}, candidates=${Object.keys(item.pool).length}`);
  }
  t.diagnostic(`${cases.length} unchanged PHP function comparisons include item choice, referenced exclusion list and two subsequent random draws.`);
});

test('hash deletions differ from fresh filter/diff results without leaking bucket metadata into iteration or JSON', async t => {
  const cases = [];
  for (const operation of ['unset', 'array_filter', 'array_diff']) for (let seed = 0; seed < 64; seed++) for (const count of [1, 2, 3]) cases.push({ operation, seed, count });
  const expected = oracle(t, String.raw`
    $out=[];foreach(json_decode(stream_get_contents(STDIN),true)as$c){
      $a=['a'=>0,'b'=>1,'c'=>0,'d'=>1,'e'=>0,'f'=>1];
      if($c['operation']=='unset'){unset($a['a'],$a['c'],$a['e']);}
      elseif($c['operation']=='array_filter')$a=array_filter($a);
      else $a=array_diff($a,[0]);
      mt_srand($c['seed']);$out[]=[array_rand($a,$c['count']),rand(),array_keys($a),json_encode($a)];
    }echo json_encode($out);`, cases);
  if (!expected) return;
  for (const [index, item] of cases.entries()) {
    const random = createPhp74Random(item.seed), generated = createGeneratedServices({ random });
    const r = createModuleContext({ services: { random, generated } }, 'fixture');
    let array = v.array([['a', 0], ['b', 1], ['c', 0], ['d', 1], ['e', 0], ['f', 1]]);
    if (item.operation === 'unset') for (const key of ['a', 'c', 'e']) r.unset(v.slot(array, [key]));
    else array = await r.call(item.operation, array, ...(item.operation === 'array_diff' ? [[0]] : []));
    assert.deepEqual([await r.call('array_rand', array, item.count), random.rand(), v.entries(array).map(([key]) => key), JSON.stringify(array)], expected[index], JSON.stringify(item));
  }
  t.diagnostic(`${cases.length} PHP comparisons distinguish deletion holes from fresh hash results, including multiple-key sampling.`);
});

test('original song configuration and generated NPC skills retain packed gaps and insertion-ordered numeric hashes', async t => {
  const cases = [];
  for (let seed = 0; seed < 32; seed++) {
    cases.push({ module: 'song', seed });
    for (let rank = 1; rank <= 20; rank++) cases.push({ module: 'randnpc', seed, rank });
  }
  const expected = oracle(t, String.raw`
    define('__MAGIC__','return false;');
    function import_module(...$names){return 'global $randnpc_skills;';}
    require $argv[1].'include/modules/base/items/song/config/song.config.php';
    require $argv[1].'include/modules/extra/instance/instance10_rogue/randnpc/config/randnpc.config.php';
    require $argv[1].'include/modules/extra/instance/instance10_rogue/randnpc/main.php';
    $out=[];foreach(json_decode(stream_get_contents(STDIN),true)as$c){
      mt_srand($c['seed']);
      if($c['module']=='song')$pool=$songlist;
      else $pool=\randnpc\generate_randnpc_skills($c['rank'],[]);
      $out[]=[array_keys($pool),array_rand($pool),rand(),rand()];
    }echo json_encode($out);`, cases);
  if (!expected) return;
  const random = createPhp74Random(0), states = { song: {}, randnpc: {} };
  let current;
  const ctx = { services: { random, generated: createGeneratedServices({ random }) }, state: () => states[current], hasModule: () => false,
    importInto(scope, ...names) { for (const name of names) if (states[name]) for (const [key] of v.entries(states[name])) v.bind(v.slot(scope, [key]), states[name], key); } };
  current = 'song'; await song.initialize(ctx);
  current = 'randnpc'; await randnpc.initialize(ctx);
  const r = createModuleContext(ctx, 'fixture');
  for (const [index, item] of cases.entries()) {
    random.seed(item.seed);
    const pool = item.module === 'song' ? states.song.songlist : await randnpc.functions.generate_randnpc_skills(ctx, item.rank, []);
    assert.deepEqual([v.entries(pool).map(([key]) => key), await r.call('array_rand', pool), random.rand(), random.rand()], expected[index], JSON.stringify(item));
  }
  t.diagnostic(`${cases.length} original-configuration comparisons include all 20 NPC ranks, selected skill/song, insertion order and subsequent RNG draws.`);
});

test('numeric candidate pools keep PHP filter allocation and copied deletion layout', async t => {
  const layouts = [
    Array.from({ length: 33 }, (_, key) => [key, key < 9 ? 0 : 1]),
    Array.from({ length: 33 }, (_, key) => [key, key % 3 ? 1 : 0]),
    [400, 58, 509, 401, 402, 461, 271, 404].map((key, index) => [key, index % 3 ? 1 : 0]),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(key => [key, key < 9 ? 0 : 1]),
  ];
  const cases = [];
  for (const rows of layouts) for (const operation of ['unset', 'array_filter', 'array_diff', 'array_diff_empty', 'array_diff_key', 'array_intersect', 'array_unique']) for (let seed = 0; seed < 16; seed++) for (const count of [1, 2]) cases.push({ rows, operation, seed, count });
  const expected = oracle(t, String.raw`
    $out=[];foreach(json_decode(stream_get_contents(STDIN),true)as$c){
      $a=[];$exclude=[];foreach($c['rows']as$row){$a[$row[0]]=$row[1];if(!$row[1])$exclude[$row[0]]=1;}
      if($c['operation']=='unset'){foreach($exclude as$k=>$v)unset($a[$k]);}
      elseif($c['operation']=='array_filter')$a=array_filter($a);
      elseif($c['operation']=='array_diff_key')$a=array_diff_key($a,$exclude);
      elseif($c['operation']=='array_diff_empty')$a=array_diff($a,[]);
      elseif($c['operation']=='array_intersect')$a=array_intersect($a,[1]);
      elseif($c['operation']=='array_unique')$a=array_unique($a);
      else $a=array_diff($a,[0]);
      $copy=$a;mt_srand($c['seed']);$out[]=[array_keys($copy),array_rand($copy,$c['count']),rand()];
    }echo json_encode($out);`, cases);
  if (!expected) return;
  for (const [index, item] of cases.entries()) {
    const random = createPhp74Random(item.seed), r = createModuleContext({ services: { random, generated: createGeneratedServices({ random }) } }, 'fixture');
    let pool = v.array([]); const exclude = v.array([]);
    for (const [key, value] of item.rows) { v.assign(v.slot(pool, [key]), value); if (!value) v.assign(v.slot(exclude, [key]), 1); }
    if (item.operation === 'unset') for (const [key] of v.entries(exclude)) r.unset(v.slot(pool, [key]));
    else pool = await r.call(item.operation === 'array_diff_empty' ? 'array_diff' : item.operation, pool, ...(item.operation === 'array_diff' ? [[0]] : item.operation === 'array_diff_empty' ? [[]] : item.operation === 'array_intersect' ? [[1]] : item.operation === 'array_diff_key' ? [exclude] : []));
    const copied = v.copy(pool);
    assert.deepEqual([v.entries(copied).map(([key]) => key), await r.call('array_rand', copied, item.count), random.rand()], expected[index], `${item.operation}, seed=${item.seed}, first-key=${item.rows[0][0]}, count=${item.count}`);
  }
  t.diagnostic(`${cases.length} numeric pool comparisons cover packed gaps, hash skill IDs, filtering/diff and copy boundaries.`);
});
