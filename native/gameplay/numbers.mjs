// Numeric boundaries used by the native combat rules. Player/database adapters
// must supply numbers (not arbitrary PHP values) for arithmetic fields.
export function number(value) {
  if (value == null) return 0;
  if (typeof value !== 'number' && typeof value !== 'string') throw new TypeError('Expected a numeric game field');
  if (typeof value === 'string' && !isNumeric(value)) throw new TypeError(`Invalid numeric game field`);
  const result = Number(value);
  if (!Number.isFinite(result)) throw new RangeError('Non-finite game number');
  return result;
}

export function isNumeric(value) {
  return typeof value === 'number' ? Number.isFinite(value)
    : typeof value === 'string' && /^[\t\n\r\f\v ]*[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value);
}

/**
 * Render a known floating-point value with PHP 7.4's default precision=14.
 * Specification: Zend/zend_strtod.c (zend_dtoa mode 2) in PHP-7.4.33.
 * This uses the exact IEEE fraction and decimal ties-to-even rounding: JS
 * toPrecision rounds exact ties differently, e.g. 10000000000000.5.
 * Locale-specific decimal separators and non-default precision are not used by
 * this game formatter. The wire JSON codec has a separate numeric contract.
 */
export function floatText(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError('floatText requires a finite Number');
  const negative = value < 0 || Object.is(value, -0);
  const sign = negative ? '-' : '';
  const magnitude = Math.abs(value);
  if (magnitude === 0) return sign + '0';
  const bytes = Buffer.allocUnsafe(8);
  bytes.writeDoubleBE(magnitude);
  const bits = bytes.readBigUInt64BE();
  const encodedExponent = Number((bits >> 52n) & 0x7ffn);
  const significand = (bits & ((1n << 52n) - 1n)) + (encodedExponent ? 1n << 52n : 0n);
  const binaryExponent = encodedExponent ? encodedExponent - 1023 - 52 : -1074;
  const numerator = binaryExponent >= 0 ? significand << BigInt(binaryExponent) : significand;
  const denominator = binaryExponent < 0 ? 1n << BigInt(-binaryExponent) : 1n;
  const comparePower = exponent => exponent >= 0
    ? numerator - denominator * 10n ** BigInt(exponent)
    : numerator * 10n ** BigInt(-exponent) - denominator;
  let exponent = Math.floor(Math.log10(magnitude));
  // log10 is only an estimate; correct its own errors at powers of ten using
  // exact integer comparisons, including subnormal and maximum finite values.
  while (comparePower(exponent) < 0n) exponent--;
  while (comparePower(exponent + 1) >= 0n) exponent++;
  const scale = 13 - exponent;
  const dividend = scale >= 0 ? numerator * 10n ** BigInt(scale) : numerator;
  const divisor = scale < 0 ? denominator * 10n ** BigInt(-scale) : denominator;
  let rounded = dividend / divisor;
  const twiceRemainder = 2n * (dividend % divisor);
  if (twiceRemainder > divisor || (twiceRemainder === divisor && (rounded & 1n))) rounded++;
  if (rounded >= 100000000000000n) { rounded /= 10n; exponent++; }
  const digits = rounded.toString().replace(/0+$/, '');
  if (exponent >= 14 || exponent < -4) {
    return `${sign}${digits[0]}.${digits.slice(1) || '0'}E${exponent >= 0 ? '+' : ''}${exponent}`;
  }
  const point = exponent + 1;
  if (point <= 0) return `${sign}0.${'0'.repeat(-point)}${digits}`;
  if (point >= digits.length) return sign + digits.padEnd(point, '0');
  return `${sign}${digits.slice(0, point)}.${digits.slice(point)}`;
}

/** Render an explicitly known integer without erasing its significant digits. */
export function integerText(value) {
  if (typeof value === 'bigint') {
    if (value < -(1n << 63n) || value > (1n << 63n) - 1n) throw new RangeError('Integer text is outside the source signed 64-bit range');
    return value.toString();
  }
  if (!Number.isSafeInteger(value)) throw new TypeError('integerText requires a safe integer Number or signed 64-bit bigint');
  return String(value);
}

export function text(value) {
  if (value == null || value === false) return '';
  if (value === true) return '1';
  // Numeric strings are source text, not numbers to be reformatted.
  if (typeof value === 'string') return value;
  if (typeof value === 'bigint') return integerText(value);
  if (typeof value === 'number') {
    // Below this boundary integer and float source values have the same text.
    // Above it, JS has lost information: PHP int 100000000000001 renders in
    // full, while PHP float of that value renders 1.0E+14. Require a declared
    // type at the call site instead of silently choosing either behavior.
    if (Number.isInteger(value) && Math.abs(value) >= 1e14) throw new RangeError('Ambiguous numeric text: use floatText or integerText with the source numeric type');
    return floatText(value);
  }
  return String(value);
}
export const present = value => value != null && value !== false && value !== 0 && value !== '' && value !== '0';
// PHP 7.4's zero-decimal HALF_UP round includes a 15-significant-digit
// correction before its final half-away-from-zero step. A plain Math.round or
// floor(abs(x)+0.5) changes damage for values such as 1.4999999999999998.
// Specification: https://github.com/php/php-src/blob/PHP-7.4.33/ext/standard/math.c
// This helper covers finite numeric game fields, not all PHP value coercions or
// round's optional precision/mode API. Exact power comparisons avoid log10's
// own rounding at decimal boundaries.
const roundingPowers = [1, 1e1, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13, 1e14];
const halfAway = value => value >= 0 ? Math.floor(value + 0.5) : Math.ceil(value - 0.5);
export function round(value) {
  if (typeof value !== 'number' && typeof value !== 'string') throw new TypeError('Expected a numeric game field');
  let n = number(value);
  // Integer numeric strings are parsed as integers by PHP, which has no -0 int.
  if (typeof value === 'string' && n === 0 && /^[\t\n\r\f\v ]*[+-]?0+$/.test(value)) return 0;
  if (n === 0 || Math.abs(n) >= 1e15) return n;
  const magnitude = Math.abs(n);
  if (magnitude >= 1 && magnitude < 1e14) {
    let exponent = roundingPowers.length - 1;
    while (magnitude < roundingPowers[exponent]) exponent--;
    const scale = roundingPowers[14 - exponent];
    n = halfAway(n * scale) / scale;
  }
  return halfAway(n);
}

export function appendLog(context, message) {
  const logger = context.state('logger');
  logger.log = text(logger.log) + message;
}

// The upstream durability fields use both == and ===. This implements only the
// legacy loose comparison used by == for their number/string data boundary.
// In PHP 7.4 numeric 0 equals the nonnumeric infinity marker; string '0' does not.
export function sameDurability(left, right) {
  const prefixNumber = value => {
    const match = value.match(/^[\t\n\r\f\v ]*[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
    return match ? Number(match[0]) : 0;
  };
  if (typeof left === 'number' && typeof right === 'string') return left === prefixNumber(right);
  if (typeof right === 'number' && typeof left === 'string') return right === prefixNumber(left);
  return isNumeric(left) && isNumeric(right) ? number(left) === number(right) : left === right;
}
