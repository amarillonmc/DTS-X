import { floatText, integerText, round } from '../gameplay/numbers.mjs';
import { JsonObject, jsonObjectEntries } from '../protocol/json.mjs';

// Native value boundaries used by generated template functions. These helpers
// operate on data only; they never parse source, ASTs or executable strings.
export const APPEND = Symbol('append template array');
const ORDER = Symbol('source array key order');
const DELETED = Symbol('deleted source array bucket');
const LAYOUT = Symbol('source array numeric layout');
const capacity = count => 2 ** Math.ceil(Math.log2(Math.max(8, count)));
const opaqueValues = new WeakSet();
export const opaque = value => { if (value && typeof value === 'object') opaqueValues.add(value); return value; };
export const isArray = value => !opaqueValues.has(value) && (value instanceof Map || Array.isArray(value) || (value !== null && typeof value === 'object' && [Object.prototype, null].includes(Object.getPrototypeOf(value))));
export const truth = value => value != null && value !== false && value !== 0 && value !== 0n && value !== '' && value !== '0' && (!Buffer.isBuffer(value) || value.length > 0 && !(value.length === 1 && value[0] === 48)) && (!isArray(value) || entries(value).length !== 0);
export function number(value) {
  if (value == null || value === false) return 0;
  if (value === true) return 1;
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return Number(value);
  if (Buffer.isBuffer(value)) return number(value.toString('latin1'));
  if (typeof value === 'string') return Number(value.match(/^[\t\n\r\f\v ]*[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/)?.[0] ?? 0);
  if (isArray(value)) return truth(value) ? 1 : 0;
  throw new TypeError('Unsupported template numeric value');
}
export const int = value => Number.isFinite(number(value)) ? Math.trunc(number(value)) || 0 : 0;
export function text(value) {
  if (value == null || value === false) return '';
  if (value === true) return '1';
  if (typeof value === 'string') return value;
  if (Buffer.isBuffer(value)) { const decoded = value.toString(); if (!Buffer.from(decoded).equals(value)) throw new TypeError('Binary bytes cannot be rendered as UTF-8 text'); return decoded; }
  if (typeof value === 'bigint') return integerText(value);
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return 'NAN';
    if (!Number.isFinite(value)) return value < 0 ? '-INF' : 'INF';
    return floatText(value);
  }
  if (isArray(value)) return 'Array';
  throw new TypeError('Unsupported template text value');
}
export const key = value => {
  if (value == null) return '';
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return int(value);
  if (typeof value === 'string' && /^(?:0|-?[1-9]\d*)$/.test(value) && Number.isSafeInteger(Number(value))) return Number(value);
  return value;
};
export function entries(value) {
  if (value instanceof Map) return [...value];
  if (value instanceof JsonObject) return jsonObjectEntries(value);
  if (!isArray(value)) return [];
  if (value[ORDER]) {
    const known = value[ORDER].filter(name => Object.hasOwn(value, name));
    for (const name of Object.keys(value).map(key)) if (!known.includes(name)) known.push(name);
    return known.map(name => [name, value[name]]);
  }
  return Object.entries(value).map(([name, item]) => [key(name), item]);
}
export function get(value, name) {
  name = key(name);
  if (value instanceof Map) return value.get(name) ?? null;
  if (typeof value === 'string' || Buffer.isBuffer(value)) {
    const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value), offset = int(name), index = offset < 0 ? bytes.length + offset : offset;
    if (index < 0 || index >= bytes.length) return '';
    const byte = bytes.subarray(index, index + 1); return byte[0] < 128 ? byte.toString() : Buffer.from(byte);
  }
  return value != null && Object.hasOwn(value, name) ? value[name] ?? null : null;
}
function put(target, name, value) {
  name = key(name);
  if (!(target instanceof Map ? target.has(name) : Object.hasOwn(target, name))) {
    // The song table starts at 1 and remains packed, whereas NPC skill IDs
    // turn an initially empty list into an insertion-ordered hash. These are
    // the numeric insertion rules of PHP 7.4's zend_hash_index_add_or_update.
    if (Array.isArray(target) && !target[LAYOUT] && !target[ORDER]) Object.defineProperty(target, LAYOUT, { value: { packed: true, size: capacity(target.length) } });
    const layout = target[LAYOUT];
    if (layout?.packed) {
      const names = entries(target).map(([name]) => name), used = names.length ? names.at(-1) + 1 : 0;
      if (typeof name !== 'number' || name < used || name < 0 || name >= layout.size && !(name < 2 * layout.size && names.length > layout.size / 2)) {
        layout.packed = false;
        if (target[ORDER]) target[ORDER].splice(0, target[ORDER].length, ...names);
        else Object.defineProperty(target, ORDER, { value: names });
      } else if (name >= layout.size) layout.size *= 2;
    }
  }
  if (target instanceof Map) { if (!target.has(name) && target[ORDER]) target[ORDER].push(name); target.set(name, value); }
  else if (Array.isArray(target) && (name === 'length' || name === '__proto__')) throw new TypeError('Named PHP array keys require a Map');
  else if (Object.hasOwn(target, name)) target[name] = value;
  else { Object.defineProperty(target, name, { value, writable: true, configurable: true, enumerable: true }); if (target[ORDER] && !target[ORDER].includes(name)) target[ORDER].push(name); }
  return value;
}
export function copy(value) {
  if (Buffer.isBuffer(value)) return Buffer.from(value);
  if (!isArray(value)) return value;
  if (value instanceof Map) { const result = new Map([...value].map(([name, child]) => [name, copy(child)])); if (value[ORDER]) Object.defineProperty(result, ORDER, { value: [...value[ORDER]] }); return result; }
  const result = Array.isArray(value) ? [] : Object.create(null);
  if (value[ORDER]) Object.defineProperty(result, ORDER, { value: [...value[ORDER]] });
  if (value[LAYOUT]) Object.defineProperty(result, LAYOUT, { value: { ...value[LAYOUT] } });
  for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (!descriptor.enumerable) continue;
    if (descriptor.get && descriptor.set) Object.defineProperty(result, name, descriptor);
    else Object.defineProperty(result, name, { value: copy(descriptor.value), writable: true, configurable: true, enumerable: true });
  }
  return result;
}
/** PHP array_rand samples the insertion buckets, including holes left by
 * unset, until fewer than half are occupied. Logical iteration still skips
 * these non-enumerable tombstones. In particular randmix and skill424 delete
 * rejected string-keyed candidates without rebuilding their candidate array. */
export function unset(ref) {
  const target = ref.target, name = key(ref.key);
  if (!(target instanceof Map ? target.has(name) : Object.hasOwn(target, name))) return;
  if (!Array.isArray(target) || target[ORDER]) {
    if (!target[ORDER]) Object.defineProperty(target, ORDER, { value: entries(target).map(([name]) => name) });
    const position = target[ORDER].indexOf(name);
    if (position >= 0) target[ORDER][position] = DELETED;
    // Zend trims deleted trailing buckets immediately, so a later insertion
    // appends at nNumUsed rather than reviving an earlier removed key.
    while (target[ORDER].at(-1) === DELETED) target[ORDER].pop();
  }
  if (target instanceof Map) target.delete(name); else delete target[name];
}
export function arrayBucketKeys(value) {
  if (value?.[LAYOUT]?.packed || Array.isArray(value) && !value[ORDER]) {
    const result = [];
    for (const [name] of entries(value)) {
      if (typeof name !== 'number' || name < 0) return entries(value).map(([name]) => name);
      result[name] = name;
    }
    return result;
  }
  const order = value?.[ORDER];
  if (!order) return entries(value).map(([name]) => name);
  const result = [];
  order.forEach((name, position) => {
    if (name !== DELETED && (value instanceof Map ? value.has(name) : Object.hasOwn(value, name))) result[position] = name;
  });
  return result;
}
export function array(items, reserve = items.length) {
  if (items.every(([name], index) => name === APPEND || key(name) === index)) {
    const result = items.map(([, value]) => copy(value));
    Object.defineProperty(result, LAYOUT, { value: { packed: true, size: capacity(Math.max(reserve, items.length)) } });
    return result;
  }
  let next = 0;
  const record = Object.create(null);
  Object.defineProperty(record, ORDER, { value: [] });
  Object.defineProperty(record, LAYOUT, { value: { packed: true, size: capacity(reserve) } });
  for (let [name, value] of items) {
    if (name === APPEND) name = next;
    name = key(name); put(record, name, copy(value));
    if (typeof name === 'number' && name >= next) next = name + 1;
  }
  const list = entries(record);
  if (list.every(([name], index) => name === index)) {
    const result = list.map(([, value]) => value);
    Object.defineProperty(result, LAYOUT, { value: { ...record[LAYOUT] } });
    if (!record[LAYOUT].packed) Object.defineProperty(result, ORDER, { value: [...record[ORDER]] });
    return result;
  }
  return record;
}
export function slot(root, keys) {
  let target = root;
  for (const [index, name] of keys.slice(0, -1).entries()) {
    let child = get(target, name);
    if (child == null || child === false) { child = Object.create(null); Object.defineProperty(child, ORDER, { value: [] }); put(target, name, child); }
    if ((typeof child === 'string' || Buffer.isBuffer(child)) && index === keys.length - 2) return { target, key: key(name), byteOffset: int(keys.at(-1)) };
    if (!isArray(child)) throw new TypeError('Template array assignment requires an array');
    target = child;
  }
  let name = keys.at(-1);
  if (name === APPEND) name = Math.max(-1, ...entries(target).map(([entry]) => typeof entry === 'number' ? entry : -1)) + 1;
  // PHP reserves the left-hand slot before evaluating the right-hand side.
  // This is observable in $a = $b = 0 and array key insertion order.
  if (keys.length === 1 && (target instanceof Map ? !target.has(key(name)) : !Object.hasOwn(target, key(name)))) put(target, name, null);
  return { target, key: key(name) };
}
export function assign(ref, value) {
  if (ref.byteOffset !== undefined) { const current = get(ref.target, ref.key), before = Buffer.isBuffer(current) ? current : Buffer.from(text(current)), offset = ref.byteOffset < 0 ? before.length + ref.byteOffset : ref.byteOffset; if (offset < 0) return value; const source = Buffer.isBuffer(value) ? value : Buffer.from(text(value)); if (!source.length) return value; const bytes = Buffer.alloc(Math.max(before.length, offset + 1), 32); before.copy(bytes); bytes[offset] = source[0]; const decoded = bytes.toString(); put(ref.target, ref.key, Buffer.from(decoded).equals(bytes) ? decoded : bytes); return value; }
  return put(ref.target, ref.key, copy(value));
}
export function bind(ref, target, name) {
  if (ref.target instanceof Map) throw new TypeError('A template foreach variable must be in a lexical scope');
  Object.defineProperty(ref.target, ref.key, { configurable: true, enumerable: true, get: () => get(target, name), set: value => put(target, name, value) });
}
export function list(refs, value) { refs.forEach((ref, index) => { if (ref) assign(ref, get(value, index)); }); return value; }
export const concat = (left, right) => Buffer.isBuffer(left) || Buffer.isBuffer(right) ? Buffer.concat([Buffer.isBuffer(left) ? left : Buffer.from(text(left)), Buffer.isBuffer(right) ? right : Buffer.from(text(right))]) : text(left) + text(right);
export function add(left, right) {
  if (isArray(left) && isArray(right)) {
    const result = new Map(entries(copy(left))); for (const [name, value] of entries(right)) if (!result.has(name)) result.set(name, copy(value)); return array([...result]);
  }
  return number(left) + number(right);
}
export const subtract = (left, right) => number(left) - number(right);
export const multiply = (left, right) => number(left) * number(right);
export const divide = (left, right) => number(left) / number(right);
export const modulo = (left, right) => int(right) === 0 ? false : int(left) % int(right) || 0;
export const bitAnd = (left, right) => Number(BigInt(int(left)) & BigInt(int(right)));
export function update(ref, operation, value) {
  const operations = { concat, add, subtract, multiply, divide };
  if (!operations[operation]) throw new Error(`Unknown native numeric operation ${operation}`);
  return assign(ref, operations[operation](get(ref.target, ref.key), value));
}
export function post(ref, delta) { const previous = get(ref.target, ref.key); assign(ref, number(previous) + delta); return previous; }
const numeric = value => typeof value === 'number' || (typeof value === 'string' && /^[\t\n\r\f\v ]*[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value));
export function identical(left, right) {
  if (Buffer.isBuffer(left) || Buffer.isBuffer(right)) return (typeof left === 'string' || Buffer.isBuffer(left)) && (typeof right === 'string' || Buffer.isBuffer(right)) && Buffer.from(left).equals(Buffer.from(right));
  if (isArray(left) && isArray(right)) {
    const a = entries(left), b = entries(right);
    return a.length === b.length && a.every(([name, value], i) => name === b[i][0] && identical(value, b[i][1]));
  }
  return left === right;
}
export function compare(left, right) {
  if (typeof left === 'boolean' || typeof right === 'boolean') return Number(truth(left)) - Number(truth(right));
  if (left == null || right == null) {
    if (Buffer.isBuffer(left) || Buffer.isBuffer(right)) return Buffer.compare(Buffer.isBuffer(left) ? left : Buffer.from(text(left)), Buffer.isBuffer(right) ? right : Buffer.from(text(right)));
    if (typeof left === 'string' || typeof right === 'string') return Buffer.compare(Buffer.from(text(left)), Buffer.from(text(right)));
    return Number(truth(left)) - Number(truth(right));
  }
  if (isArray(left) || isArray(right)) {
    if (!isArray(left)) return -1; if (!isArray(right)) return 1;
    const a = entries(left), b = entries(right); if (a.length !== b.length) return a.length - b.length;
    for (const [name, value] of a) { if (!b.some(([other]) => name === other)) return 1; const result = compare(value, get(right, name)); if (result) return result; }
    return 0;
  }
  if (typeof left === 'number' || typeof right === 'number' || (numeric(left) && numeric(right))) return number(left) - number(right);
  return Buffer.compare(Buffer.isBuffer(left) ? left : Buffer.from(text(left)), Buffer.isBuffer(right) ? right : Buffer.from(text(right)));
}
export const equal = (left, right) => compare(left, right) === 0;
export const castArray = value => value == null ? [] : isArray(value) ? copy(value) : [value];
export { round, numeric };
