import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { createPhp74Random, MT_RAND_MAX, Php74Random } from '../native/random.mjs';

const seeds = [0, 1, -1, 5489, 123456789, 2147483648, 4294967295, 4294967296, 9007199254740991];
const ranges = [[0, 0], [-7, -7], [-5, 5], [100, 1], [0, 65535], [0, 2147483647], [0, 2147483648], [0, 4294967294], [0, 4294967295], [-2147483648, 2147483647], [-2147483648, 2147483648], [-9007199254740991, 9007199254740991], [1.9, 9.7], [-9.7, -1.9]];
const wideRanges = [['-9223372036854775808', '9223372036854775807'], ['0', '9223372036854775807'], ['-4611686018427387905', '4611686018427387905']];

function collect(seed) {
  const random = new Php74Random(seed);
  const result = { unbounded: [], bounded: [], wide: [], shuffle: [], pick: [] };
  // Cross at least three complete MT19937 state reloads.
  for (let n = 0; n < 2048; n++) result.unbounded.push(n % 2 ? random.mtRand() : random.rand());
  for (let n = 0; n < 128; n++) for (const range of ranges) result.bounded.push(random.rand(...range));
  for (let n = 0; n < 128; n++) for (const range of wideRanges) result.wide.push(random.rand(...range.map(BigInt)).toString());
  for (const size of [0, 1, 2, 3, 17, 625]) {
    const values = Array.from({ length: size }, (_, i) => i);
    assert.equal(random.shuffle(values), true);
    result.shuffle.push(values, random.rand());
  }
  for (const size of [1, 2, 3, 17, 128]) {
    const values = Array.from({ length: size }, (_, i) => `item${i}`);
    for (const count of [...new Set([1, Math.max(1, Math.floor(size / 2)), size])]) {
      result.pick.push(random.arrayRand(values, count), random.rand());
    }
  }
  return result;
}

test('native random streams agree with real PHP 7.4 for bounds, rejection, reloads, shuffle and dense array_rand', { timeout: 30_000 }, t => {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION."/".PHP_INT_SIZE;'], { encoding: 'utf8', timeout: 10_000, windowsHide: true });
  if (version.error?.code === 'ENOENT') return t.skip('Set DTS_REFERENCE_PHP to a PHP 7.4 executable for differential verification.');
  assert.equal(version.status, 0, version.error?.message || version.stderr);
  if (version.stdout !== '7.4/8') return t.skip(`Differential reference requires 64-bit PHP 7.4, received ${version.stdout}`);
  const source = String.raw`
    $input = json_decode($argv[1], true);
    $out = array();
    foreach ($input['seeds'] as $seed) {
      mt_srand($seed, MT_RAND_MT19937);
      $r = array('unbounded'=>array(), 'bounded'=>array(), 'wide'=>array(), 'shuffle'=>array(), 'pick'=>array());
      for ($n=0; $n<2048; $n++) $r['unbounded'][] = $n % 2 ? mt_rand() : rand();
      for ($n=0; $n<128; $n++) foreach ($input['ranges'] as $range) $r['bounded'][] = rand($range[0], $range[1]);
      for ($n=0; $n<128; $n++) foreach ($input['wideRanges'] as $range) $r['wide'][] = (string)rand((int)$range[0], (int)$range[1]);
      foreach (array(0, 1, 2, 3, 17, 625) as $size) {
        $values = $size ? range(0, $size-1) : array();
        shuffle($values); $r['shuffle'][] = $values; $r['shuffle'][] = rand();
      }
      foreach (array(1, 2, 3, 17, 128) as $size) {
        $values = array(); for ($n=0; $n<$size; $n++) $values[] = 'item'.$n;
        foreach (array_unique(array(1, max(1,(int)floor($size/2)), $size)) as $count) {
          $r['pick'][] = array_rand($values, $count); $r['pick'][] = rand();
        }
      }
      $out[] = $r;
    }
    echo json_encode($out);
  `;
  const result = spawnSync(executable, ['-d', 'display_errors=stderr', '-r', source, JSON.stringify({ seeds, ranges, wideRanges })], { encoding: 'utf8', timeout: 20_000, maxBuffer: 4 * 1024 * 1024, windowsHide: true });
  assert.equal(result.status, 0, result.error?.message || result.stderr);
  assert.equal(result.stderr, '');
  const expected = JSON.parse(result.stdout);
  for (const [index, seed] of seeds.entries()) assert.deepEqual(collect(seed), expected[index], `PHP 7.4 stream divergence for seed ${seed}`);
  t.diagnostic(`Compared ${seeds.length} seed streams including signed 64-bit ranges and more than 36,000 scalar draws against PHP 7.4.`);
});

test('random instances are independent and source distinctions remain visible', () => {
  assert.equal(MT_RAND_MAX, 2147483647);
  const left = createPhp74Random(5489);
  const right = createPhp74Random(5489);
  assert.equal(left.nextUint32(), 3499211612);
  assert.equal(right.rand(), 1749605806);
  assert.equal(left.rand(), right.rand());
  assert.equal(left.seed(5489).rand(0, MT_RAND_MAX), 1351727964);
  assert.equal(left.seed(0).rand(9, 1), createPhp74Random(0).mtRand(1, 9));
  const singleton = createPhp74Random(1);
  const peer = createPhp74Random(1);
  assert.equal(singleton.rand(5, 5), 5);
  peer.rand();
  assert.equal(singleton.rand(), peer.rand(), 'singleton intervals consume a draw');
});

test('unsupported or lossy random inputs fail before consuming entropy', () => {
  const random = createPhp74Random(19);
  const peer = createPhp74Random(19);
  assert.throws(() => random.rand(1), TypeError);
  assert.throws(() => random.rand(0, Number.MAX_SAFE_INTEGER + 1), TypeError);
  assert.throws(() => random.rand(0n, 1n << 63n), RangeError);
  assert.throws(() => random.mtRand(3, 1), RangeError);
  assert.throws(() => random.shuffle([, 1]), TypeError);
  assert.throws(() => random.arrayRand(new Map([[1, 'a']])), TypeError);
  assert.throws(() => random.arrayRand([]), RangeError);
  assert.throws(() => random.arrayRand([1], 2), RangeError);
  assert.equal(random.rand(), peer.rand());
});

test('packed map array_diff selections preserve PHP bucket holes and subsequent RNG state', { timeout: 30_000 }, t => {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true, timeout: 10_000 });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') return t.skip('Requires development-only PHP 7.4 oracle.');
  const cases = [];
  for (const size of [1, 2, 3, 7, 8, 9, 17, 32, 65]) for (let mask = 0; mask < 12; mask++) {
    const values = Array.from({ length: size }, (_, index) => index + 100);
    const excluded = values.filter((value, index) => mask < 4 ? index % 4 === mask : mask < 8 ? index % 4 !== mask - 4 : index >= Math.max(1, size - (mask - 7)));
    const count = values.length - excluded.length;
    if (count) cases.push({ values, excluded, counts: [...new Set([1, Math.max(1, Math.floor(count / 2)), count])] });
  }
  const source = String.raw`$input=json_decode(stream_get_contents(STDIN),true);$out=[];
    foreach($input['seeds'] as $seed){mt_srand($seed);$r=[];foreach($input['cases'] as $case){
      $list=array_diff(array_slice($case['values'],0),$case['excluded']);
      foreach($case['counts'] as $count)for($i=0;$i<8;$i++)$r[]=[array_rand($list,$count),rand()];
    }$out[]=$r;}echo json_encode($out);`;
  const result = spawnSync(executable, ['-r', source], { input: JSON.stringify({ seeds, cases }), encoding: 'utf8', windowsHide: true, timeout: 20_000, maxBuffer: 4 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr); assert.equal(result.stderr, '');
  const expected = JSON.parse(result.stdout);
  for (const [seedIndex, seed] of seeds.entries()) {
    const rng = createPhp74Random(seed), observed = [];
    for (const { values, excluded, counts } of cases) {
      const list = values.slice();
      list.forEach((value, index) => { if (excluded.includes(value)) delete list[index]; });
      for (const count of counts) for (let i = 0; i < 8; i++) observed.push([rng.arrayRandPacked(list, count), rng.rand()]);
    }
    assert.deepEqual(observed, expected[seedIndex], `packed source divergence for seed ${seed}`);
  }
  const rng = createPhp74Random(1), peer = createPhp74Random(1);
  assert.throws(() => rng.arrayRandPacked({ 2: 5 }), TypeError);
  assert.throws(() => rng.arrayRandPacked(new Array(3)), RangeError);
  assert.throws(() => rng.arrayRandPacked(Object.assign([1], { extra: 2 })), TypeError);
  assert.equal(rng.rand(), peer.rand());
  t.diagnostic(`${cases.length} dense-slice/diff layouts across ${seeds.length} seeds, including both bucket sampling branches and trailing holes.`);
});
