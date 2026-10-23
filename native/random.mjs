import { randomBytes } from 'node:crypto';

/**
 * Native MT19937 with the PHP 7.4 default generator's draw order and rejection
 * sampling. One instance belongs to one game command; never share a mutable RNG
 * across concurrent commands. This is a game RNG, not a credential generator.
 *
 * Specification checked against PHP-7.4.33's primary source:
 * https://github.com/php/php-src/blob/PHP-7.4.33/ext/standard/mt_rand.c
 * https://github.com/php/php-src/blob/PHP-7.4.33/ext/standard/rand.c
 * https://github.com/php/php-src/blob/PHP-7.4.33/ext/standard/array.c
 *
 * API accepts finite numeric bounds (truncated like PHP integer parameters) or
 * bigint bounds. Unsafe Number integers are refused rather than rounded. Using
 * bigint bounds returns bigint; otherwise results are Numbers. Legacy
 * MT_RAND_PHP is intentionally absent: the source game never selects it.
 */
export const MT_RAND_MAX = 0x7fffffff;
const UINT32_MAX = 0xffffffff;
const UINT64_MAX = (1n << 64n) - 1n;
const INT64_MIN = -(1n << 63n);
const INT64_MAX = (1n << 63n) - 1n;

function integer(value, name) {
  if (typeof value === 'bigint') {
    if (value < INT64_MIN || value > INT64_MAX) throw new RangeError(`${name} is outside the signed 64-bit range`);
    return value;
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isSafeInteger(Math.trunc(value))) {
    throw new TypeError(`${name} must be a finite safe Number or a signed 64-bit bigint`);
  }
  return BigInt(Math.trunc(value));
}

function denseArray(values) {
  if (!Array.isArray(values)) throw new TypeError('Expected a dense native Array');
  for (let index = 0; index < values.length; index++) {
    if (!Object.hasOwn(values, index)) throw new TypeError('Sparse arrays need an explicit source bucket migration; random selection cannot infer deleted PHP buckets');
  }
  if (Object.keys(values).length !== values.length) throw new TypeError('Named array properties are not a native list');
}

export class Php74Random {
  #state = new Uint32Array(624);
  #index = 624;

  constructor(seed = randomBytes(4).readUInt32LE()) { this.seed(seed); }

  seed(seed) {
    this.#state[0] = Number(BigInt.asUintN(32, integer(seed, 'seed')));
    for (let index = 1; index < this.#state.length; index++) {
      const previous = this.#state[index - 1];
      this.#state[index] = (Math.imul(1812433253, previous ^ (previous >>> 30)) + index) >>> 0;
    }
    this.#index = this.#state.length;
    return this;
  }

  nextUint32() {
    if (this.#index === this.#state.length) {
      for (let index = 0; index < this.#state.length; index++) {
        const combined = (this.#state[index] & 0x80000000) | (this.#state[(index + 1) % 624] & 0x7fffffff);
        this.#state[index] = this.#state[(index + 397) % 624] ^ (combined >>> 1) ^ ((combined & 1) ? 0x9908b0df : 0);
      }
      this.#index = 0;
    }
    let result = this.#state[this.#index++];
    result ^= result >>> 11;
    result ^= (result << 7) & 0x9d2c5680;
    result ^= (result << 15) & 0xefc60000;
    return (result ^ (result >>> 18)) >>> 0;
  }

  #range(min, max, bigintResult) {
    const width = max - min;
    let offset;
    if (width <= BigInt(UINT32_MAX)) {
      let draw = this.nextUint32();
      const upper = Number(width);
      if (upper === UINT32_MAX) offset = BigInt(draw);
      else {
        const size = upper + 1;
        // The power-of-two path must not reject UINT32_MAX. Even the singleton
        // interval consumes one draw, which affects later game random branches.
        if ((BigInt(size) & BigInt(size - 1)) === 0n) offset = BigInt(draw % size);
        else {
          const limit = UINT32_MAX - (UINT32_MAX % size) - 1;
          while (draw > limit) draw = this.nextUint32();
          offset = BigInt(draw % size);
        }
      }
    } else {
      const draw64 = () => (BigInt(this.nextUint32()) << 32n) | BigInt(this.nextUint32());
      let draw = draw64();
      if (width === UINT64_MAX) offset = draw;
      else {
        const size = width + 1n;
        if ((size & (size - 1n)) === 0n) offset = draw & (size - 1n);
        else {
          const limit = UINT64_MAX - (UINT64_MAX % size) - 1n;
          while (draw > limit) draw = draw64();
          offset = draw % size;
        }
      }
    }
    const value = min + offset;
    return bigintResult ? value : Number(value);
  }

  rand(...bounds) {
    if (!bounds.length) return this.nextUint32() >>> 1;
    if (bounds.length !== 2) throw new TypeError('rand expects zero or two bounds');
    let min = integer(bounds[0], 'min');
    let max = integer(bounds[1], 'max');
    if (max < min) [min, max] = [max, min];
    return this.#range(min, max, bounds.some(value => typeof value === 'bigint'));
  }

  mtRand(...bounds) {
    if (!bounds.length) return this.nextUint32() >>> 1;
    if (bounds.length !== 2) throw new TypeError('mtRand expects zero or two bounds');
    const min = integer(bounds[0], 'min');
    const max = integer(bounds[1], 'max');
    // PHP warns and returns false. Native callers get an actionable error; no
    // entropy is consumed, matching the source's invalid-bound branch.
    if (max < min) throw new RangeError('mtRand max is smaller than min');
    return this.#range(min, max, bounds.some(value => typeof value === 'bigint'));
  }

  /** Mutates a dense list in place, consumes n-1 bounded draws, returns true. */
  shuffle(values) {
    denseArray(values);
    for (let index = values.length - 1; index > 0; index--) {
      const other = this.rand(0, index);
      [values[index], values[other]] = [values[other], values[index]];
    }
    return true;
  }

  /**
   * PHP array_rand for dense list inputs only, returning indices. Associative
   * PHP arrays after deletion contain hidden buckets that change draw order;
   * their migration must explicitly model that source before using this API.
   */
  arrayRand(values, count = 1) {
    denseArray(values);
    if (!Number.isSafeInteger(count) || count < 1 || count > values.length) throw new RangeError('arrayRand count must be between 1 and list length');
    if (count === 1) return this.rand(0, values.length - 1);
    const complement = count > Math.floor(values.length / 2);
    const desired = complement ? values.length - count : count;
    const chosen = new Set();
    while (chosen.size < desired) chosen.add(this.rand(0, values.length - 1));
    return Array.from({ length: values.length }, (_, index) => index).filter(index => chosen.has(index) !== complement);
  }

  /** Select keys from a known PHP packed list with holes. This explicit API is
   * for map's array_diff(array_slice(denseAreas), excludedAreas), or deletion
   * from a dense packed list, not arbitrary associative arrays. PHP array_diff
   * preallocates by its dense input count, so its surviving numeric keys stay
   * packed; the last used bucket is the last surviving index, not JS length.
   * Source: PHP-7.4.33 ext/standard/array.c array_diff + array_rand and
   * Zend/zend_hash.c _zend_hash_index_add_or_update_i / _zend_hash_del_el_ex.
   */
  arrayRandPacked(values, count = 1) {
    if (!Array.isArray(values)) throw new TypeError('arrayRandPacked requires a packed numeric-key list');
    const keys = Object.keys(values);
    if (keys.some(key => !/^(?:0|[1-9]\d*)$/.test(key) || Number(key) >= values.length)) throw new TypeError('arrayRandPacked does not accept associative keys');
    const indices = keys.map(Number), available = indices.length;
    if (!Number.isSafeInteger(count) || count < 1 || count > available) throw new RangeError('arrayRandPacked count must be between 1 and occupied list length');
    if (count === 1) {
      const used = indices.at(-1) + 1;
      if (available < used - Math.floor(used / 2)) return indices[this.rand(0, available - 1)];
      let index;
      do { index = this.rand(0, used - 1); } while (!Object.hasOwn(values, index));
      return index;
    }
    const complement = count > Math.floor(available / 2);
    const desired = complement ? available - count : count, chosen = new Set();
    while (chosen.size < desired) chosen.add(this.rand(0, available - 1));
    return indices.filter((index, position) => chosen.has(position) !== complement);
  }
}

export const createPhp74Random = seed => new Php74Random(seed);
