import { number, text, present, sameDurability } from '../gameplay/numbers.mjs';

export { number as n, text, present };
export const isset = value => value !== null && value !== undefined;
export const empty = value => !present(value) || (value instanceof Map ? value.size === 0 : typeof value === 'object' && Object.keys(value).length === 0);
export const values = value => value instanceof Map ? [...value.values()] : Object.values(value ?? {});
// Usernames may be numeric, '__proto__', or 'constructor'. Map preserves PHP
// array insertion order and avoids inheriting JavaScript's prototype keys.
export function arrayKey(value) {
  if (typeof value !== 'string' || !/^(?:0|-?[1-9]\d*)$/.test(value)) return value;
  const key = Number(value);
  if (!Number.isSafeInteger(key)) throw new RangeError('Array key exceeds native integer precision.');
  return key;
}
export const entries = value => value instanceof Map ? [...value.entries()] : Object.entries(value ?? {}).map(([key, item]) => [arrayKey(key), item]);
export const lookup = (value, key) => value instanceof Map ? value.get(arrayKey(key)) : value != null && Object.hasOwn(value, key) ? value[key] : undefined;
export function assign(value, key, item) {
  if (value instanceof Map) value.set(arrayKey(key), item);
  else Object.defineProperty(value, key, { value: item, configurable: true, enumerable: true, writable: true });
}
export const equal = (a, b) => typeof a === 'boolean' || typeof b === 'boolean'
  ? !empty(a) === !empty(b) : a == null || b == null ? empty(a) && empty(b) : sameDurability(a, b);
export const includes = (array, value) => values(array).some(item => equal(item, value));
export const call = (ctx, name, ...args) => ctx.call('sys', name, ...args);
export const subroom = prefix => present(prefix) && text(prefix).startsWith('s');
export const roomTable = (state, prefix = state.room_prefix) => subroom(prefix) ? `${state.gtablepre}${prefix}_` : state.gtablepre;
export const sqlText = text;

export function database(ctx, method, ...args) {
  if (typeof ctx.services.database?.[method] !== 'function') throw new Error(`Native sys requires database.${method}().`);
  return ctx.services.database[method](...args);
}

export function service(ctx, group, method, ...args) {
  const object = ctx.services.system?.[group];
  if (typeof object?.[method] !== 'function') throw new Error(`Native sys requires system.${group}.${method}().`);
  return object[method](...args);
}

export function utcParts(seconds, asStrings = false) {
  const date = new Date(number(seconds) * 1000);
  if (Number.isNaN(date.valueOf())) throw new RangeError('System timestamp is outside the supported date range.');
  const parts = { sec: date.getUTCSeconds(), min: date.getUTCMinutes(), hour: date.getUTCHours(), day: date.getUTCDate(), month: date.getUTCMonth() + 1, year: date.getUTCFullYear(), wday: date.getUTCDay() };
  if (asStrings) for (const key of Object.keys(parts)) parts[key] = ['sec', 'min', 'hour'].includes(key) ? String(parts[key]).padStart(2, '0') : String(parts[key]);
  return parts;
}

export function timeText(seconds) {
  const { hour, min, sec } = utcParts(seconds, true);
  return `${hour}:${min}:${sec}`;
}

export const htmlSpecialChars = value => text(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export const protectedHeader = "<?php if(!defined('IN_GAME')) exit('Access Denied'); ?>\r\n";
