import { reference } from '../modules/registry.mjs';
import { text } from './numbers.mjs';

const prepared = new WeakSet();
const identifier = /^[A-Za-z_][A-Za-z0-9_]*$/;
const reserved = new Set(['GLOBALS', '_GLOBALS', '_COOKIE', '_POST', '_GET', '_REQUEST', '_FILES', '_SERVER', '_ENV', '_SESSION', 'INPUT_VAR_LIST', 'COOKIE_VAR_LIST']);
const allowed = key => identifier.test(key) && !key.startsWith('___') && !reserved.has(key);
const record = () => Object.create(null);
const put = (target, key, value) => Object.defineProperty(target, key, { value, configurable: true, writable: true, enumerable: true });

function inputText(value) {
  if (ArrayBuffer.isView(value)) {
    const bytes = Buffer.from(value.buffer, value.byteOffset, value.byteLength), string = bytes.toString('utf8');
    // Original htmlspecialchars(..., ENT_COMPAT) returns '' for invalid UTF-8.
    return Buffer.from(string, 'utf8').equals(bytes) ? string : '';
  }
  if (value != null && !['string', 'number', 'boolean', 'bigint'].includes(typeof value)) throw new TypeError('Input leaves must be scalar values or UTF-8 bytes');
  return text(value);
}

/** Exact gstrfilter behavior for parsed input records/arrays and scalar leaves.
 * A changed key is appended while its original unfiltered key/value remains.
 * Iteration uses the original snapshot, as the source foreach does; a newly
 * appended key is never visited again. This is not an HTML sanitizer API.
 */
export function filterInputValue(value, { magicQuotesGpc = false } = {}) {
  if (value != null && typeof value === 'object' && !ArrayBuffer.isView(value)) {
    if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw new TypeError('Parsed input must contain plain records or arrays');
    const result = Array.isArray(value) ? [] : record();
    if (Array.isArray(value)) result.length = value.length;
    for (const [key, item] of Object.entries(value)) put(result, key, structuredClone(item));
    for (const [key, item] of Object.entries(value)) put(result, filterInputValue(key, { magicQuotesGpc }), filterInputValue(item, { magicQuotesGpc }));
    return result;
  }
  let filtered = inputText(value);
  if (magicQuotesGpc) filtered = filtered.replace(/\\([\s\S])/g, (_, character) => character === '0' ? '\0' : character);
  return filtered.replaceAll("'", '').replaceAll('\\', '').replaceAll('&', '&amp;').replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('___', '');
}

/** Prepare explicit parsed request dictionaries once, before native sessions.
 * The host supplies REQUEST explicitly: PHP's configured GET/POST/COOKIE merge
 * order belongs to its HTTP parser, not this module. Omitting REQUEST means an
 * empty REQUEST, never an invented merge. cookies/post/request on the result
 * are already filtered and can feed system.request without filtering twice.
 *
 * Deliberate security boundary: request keys cannot set superglobals, internal
 * ___ names or INPUT_VAR_LIST/COOKIE_VAR_LIST. Ordinary names (even __proto__)
 * live only on null-prototype records; no Node globals are read or overwritten.
 * Trusted command transport metadata must be supplied by the host separately,
 * never accepted from an HTTP INPUT_VAR_LIST parameter. This module implements
 * ordinary request initialization, not the original daemon socket protocol.
 */
export function prepareInputRequest({ cookies = {}, post = {}, request = {}, magicQuotesGpc = false } = {}) {
  if (typeof magicQuotesGpc !== 'boolean') throw new TypeError('magicQuotesGpc must be an explicit boolean');
  const values = record();
  put(values, 'INPUT_VAR_LIST', null);
  const result = {};
  for (const [name, incoming] of Object.entries({ cookies, post, request })) {
    if (incoming == null) { result[name] = null; continue; }
    if (typeof incoming !== 'object' || ArrayBuffer.isView(incoming)) throw new TypeError(`Parsed ${name} must be an input record`);
    const filtered = filterInputValue(incoming, { magicQuotesGpc });
    result[name] = filtered;
    for (const [key, value] of Object.entries(filtered)) if (allowed(key)) put(values, key, structuredClone(value));
  }
  result.values = values;
  prepared.add(result);
  return Object.freeze(result);
}

/** core/input/main.php plus its get_var_in_module reference contract.
 * INPUT_VAR_LIST is null in ordinary requests: the source init's [] assignment
 * is function-local. Verified through the actual modules.init.template.php.
 * Missing/null get_var calls return detached null slots, not new module fields.
 */
export const inputModule = {
  name: 'input', dependencies: [], state: () => ({ INPUT_VAR_LIST: null }),
  initialize(ctx) {
    if (ctx.services.input == null) throw new Error('Native input requires an explicit parsed request in services.input');
    const request = prepared.has(ctx.services.input) ? ctx.services.input : prepareInputRequest(ctx.services.input);
    for (const [key, value] of Object.entries(request.values)) put(ctx.state(), key, structuredClone(value));
  },
  functions: {
    async get_var(ctx, name) {
      const key = text(name), state = ctx.state();
      if (key !== '' && key !== '0' && Object.hasOwn(state, key) && state[key] != null) return ctx.reference('input', key);
      return reference({ value: null }, 'value');
    },
  },
};
