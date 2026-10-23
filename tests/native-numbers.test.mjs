import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { round, number, isNumeric, text, floatText, integerText } from '../native/gameplay/numbers.mjs';

function adjacent(value, direction) {
  if (value === 0) return direction > 0 ? Number.MIN_VALUE : -Number.MIN_VALUE;
  const bytes = Buffer.alloc(8);
  bytes.writeDoubleBE(value);
  const bits = bytes.readBigUInt64BE() + ((value > 0) === (direction > 0) ? 1n : -1n);
  bytes.writeBigUInt64BE(bits);
  return bytes.readDoubleBE();
}

function numberVectors() {
  const values = [0, -0, Number.MIN_VALUE, -Number.MIN_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE, 1.4999999999999998, -1.4999999999999998];
  for (const power of [1e-308, 1e-10, 1e-8, 1e-1, 1, 1e1, 1e3, 1e8, 1e13, 1e14, 1e15, 1e16, 1e22, 1e23, 1e100]) {
    for (const value of [power, adjacent(power, -1), adjacent(power, 1)]) values.push(value, -value);
  }
  for (const integer of [0, 1, 2, 7, 99, 999, 9999, 99999, 1e7, 1e10, 1e12, 1e13, 1e14, 1e15]) {
    for (const value of [integer + 0.5, adjacent(integer + 0.5, -1), adjacent(integer + 0.5, 1)]) values.push(value, -value);
  }
  // Reproducible numerical fuzzing independent of the RNG under test elsewhere.
  let state = 0x23456789;
  const draw = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state; };
  for (let index = 0; index < 6000; index++) {
    const sign = draw() % 2 ? 1 : -1;
    const magnitude = 10 ** ((draw() % 41) - 20);
    values.push(sign * (draw() / 0x100000000) * magnitude);
    const halfway = draw() % 10000000 + 0.5;
    values.push(sign * adjacent(halfway, draw() % 2 ? -1 : 1));
  }
  return values;
}

test('native zero-decimal rounding matches real PHP 7.4 at IEEE and decimal boundaries', { timeout: 30_000 }, t => {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', timeout: 10_000, windowsHide: true });
  if (version.error?.code === 'ENOENT') return t.skip('Set DTS_REFERENCE_PHP to PHP 7.4 for differential numerical verification.');
  assert.equal(version.status, 0, version.error?.message || version.stderr);
  if (version.stdout !== '7.4') return t.skip(`Numerical reference requires PHP 7.4, received ${version.stdout}`);
  const numbers = numberVectors();
  const strings = ['0', '-0', '-000', '0.0', '-0.0', '+0e0', '-0e0', '1.4999999999999998', '-1.4999999999999998', '  +123.5', '\t-3.5', '1e15', '-1e308', '.5', '-.5', '999999999999999.9'];
  const cases = numbers.map(value => {
    const bytes = Buffer.alloc(8); bytes.writeDoubleBE(value);
    return { type: 'double', value: bytes.toString('hex') };
  }).concat(strings.map(value => ({ type: 'string', value })));
  // Passing binary doubles removes decimal JSON parsing as a confounding
  // variable. PHP receives exactly the IEEE values that native gameplay uses.
  const source = String.raw`
    $out = array();
    foreach (json_decode(file_get_contents('php://stdin'), true) as $case) {
      $value = $case['type'] === 'double' ? unpack('Evalue', hex2bin($case['value']))['value'] : $case['value'];
      $out[] = round($value);
    }
    echo json_encode($out, JSON_PRESERVE_ZERO_FRACTION);
  `;
  const result = spawnSync(executable, ['-d', 'display_errors=stderr', '-r', source], { input: JSON.stringify(cases), encoding: 'utf8', timeout: 20_000, maxBuffer: 2 * 1024 * 1024, windowsHide: true });
  assert.equal(result.status, 0, result.error?.message || result.stderr);
  assert.equal(result.stderr, '');
  const expected = JSON.parse(result.stdout);
  const actual = [...numbers, ...strings].map(round);
  assert.equal(actual.length, expected.length);
  for (let index = 0; index < expected.length; index++) {
    assert.ok(Object.is(actual[index], expected[index]), `round(${JSON.stringify(cases[index])}): ${actual[index]} != ${expected[index]}`);
  }
  t.diagnostic(`Compared ${cases.length} exact-double and numeric-string cases against real PHP 7.4, including signed zero.`);
});

test('rounding fixes half-neighbor drift while numeric boundary rejects unrelated PHP values', () => {
  assert.equal(round(1.4999999999999998), 2);
  assert.equal(round(-1.4999999999999998), -2);
  assert.equal(round(1.49), 1);
  assert.equal(round(-1.49), -1);
  assert.equal(round(' 3.5'), 4);
  assert.equal(number('2.5e2'), 250);
  assert.equal(isNumeric('1 '), false, 'PHP 7.4 is_numeric does not accept trailing whitespace');
  for (const value of [null, undefined, true, [], {}, '∞', '', '3.5suffix']) assert.throws(() => round(value), TypeError);
  for (const value of [Infinity, -Infinity, NaN]) assert.throws(() => round(value), RangeError);
});

test('finite numeric text matches real PHP 7.4 precision=14 as exact UTF-8 bytes', { timeout: 30_000 }, t => {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', timeout: 10_000, windowsHide: true });
  if (version.error?.code === 'ENOENT') return t.skip('Set DTS_REFERENCE_PHP to PHP 7.4 for numeric text differential verification.');
  assert.equal(version.status, 0, version.error?.message || version.stderr);
  if (version.stdout !== '7.4') return t.skip(`Numeric text reference requires PHP 7.4, received ${version.stdout}`);
  const values = [...numberVectors(), 51 * 2 * 0.1, 10000000000000.5, 10000000000001.5, 10000000000002.5, 99999999999999.5, 100000000000001];
  const cases = values.map(value => {
    const bytes = Buffer.alloc(8); bytes.writeDoubleBE(value);
    return { type: 'double', value: bytes.toString('hex') };
  });
  const integers = [0n, -1n, 99999999999999n, 100000000000001n, 9007199254740991n, 9223372036854775807n, -9223372036854775808n];
  cases.push(...integers.map(value => ({ type: 'integer', value: value.toString() })));
  const strings = ['10.200000000000001', '001.00', '+1e20', '-0', ' 1.2 ', '伤害倍率：∞'];
  cases.push(...strings.map(value => ({ type: 'string', value })));
  const source = String.raw`
    ini_set('precision', '14');
    $out = array();
    foreach (json_decode(file_get_contents('php://stdin'), true) as $case) {
      if ($case['type'] === 'double') $value = unpack('Evalue', hex2bin($case['value']))['value'];
      elseif ($case['type'] === 'integer') $value = (int)$case['value'];
      else $value = $case['value'];
      $out[] = base64_encode((string)$value);
    }
    echo json_encode($out);
  `;
  const result = spawnSync(executable, ['-d', 'display_errors=stderr', '-r', source], { input: JSON.stringify(cases), encoding: 'utf8', timeout: 20_000, maxBuffer: 2 * 1024 * 1024, windowsHide: true });
  assert.equal(result.status, 0, result.error?.message || result.stderr);
  assert.equal(result.stderr, '');
  const expected = JSON.parse(result.stdout);
  const rendered = [...values.map(floatText), ...integers.map(integerText), ...strings.map(text)];
  for (let index = 0; index < expected.length; index++) {
    assert.equal(Buffer.from(rendered[index], 'utf8').toString('base64'), expected[index], `text mismatch for ${JSON.stringify(cases[index])}`);
  }
  for (const value of values.filter(value => !Number.isInteger(value) || Math.abs(value) < 1e14)) assert.equal(text(value), floatText(value));
  t.diagnostic(`Compared ${cases.length} exact UTF-8 string outputs against PHP 7.4; explicit integer and floating-point types are kept distinct at large magnitudes.`);
});

test('numeric text removes arithmetic noise and refuses lost large-number type information', () => {
  assert.equal(text(51 * 2 * 0.1), '10.2');
  assert.equal(text('10.200000000000001'), '10.200000000000001');
  assert.equal(floatText(10000000000000.5), '10000000000000', 'decimal midpoint is ties-to-even');
  assert.equal(floatText(10000000000001.5), '10000000000002');
  assert.equal(floatText(100000000000001), '1.0E+14');
  assert.equal(integerText(100000000000001), '100000000000001');
  assert.throws(() => text(100000000000001), /Ambiguous numeric text/);
  assert.throws(() => integerText(Number.MAX_SAFE_INTEGER + 1), TypeError);
  assert.throws(() => integerText(9223372036854775808n), RangeError);
  assert.equal(floatText(-0), '-0');
  assert.equal(integerText(-0), '0');
  assert.equal(floatText(0.00001), '1.0E-5');
  assert.equal(floatText(0.0001), '0.0001');
  for (const value of [Infinity, -Infinity, NaN]) assert.throws(() => text(value), TypeError);
});
