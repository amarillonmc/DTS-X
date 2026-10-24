import { isReferenceDescriptor, referenceValue } from '../templates/values.mjs';
import { number as n, present, sameDurability, text } from './numbers.mjs';

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-';
const call = (ctx, name, ...args) => ctx.call('skillbase', name, ...args);
const emptyPlayer = pa => pa == null || (typeof pa === 'object' && !Object.prototype.propertyIsEnumerable.call(pa, 'pid') && Object.keys(pa).length === 0);
const filled = value => value instanceof Map ? value.size !== 0
  : present(value) && (typeof value !== 'object' || Object.keys(value).length !== 0);
const id = value => Math.trunc(n(value));
const equal = (left, right) => typeof left === 'boolean' || typeof right === 'boolean'
  ? filled(left) === filled(right) : sameDurability(left ?? null, right ?? null);
const ordered = (value, numeric = false) => {
  if (value == null) return new Map();
  if (!(value instanceof Map) && typeof value !== 'object') throw new TypeError('Skill lists must be ordered Maps');
  return new Map([...(value instanceof Map ? value : Object.entries(value))].map(([key, item]) => [numeric ? id(key) : String(key), item]));
};
const list = (owner, name, write = false) => {
  if (owner[name] instanceof Map) return owner[name];
  const value = ordered(owner[name], name === 'acquired_list');
  if (write || owner[name] != null) owner[name] = value;
  return value;
};
// Source by-value player parameters keep explicit reference slots, as does
// core/player. Ordinary acquired/parameter Maps remain independent snapshots.
function parameterCopy(value) {
  const result = structuredClone(value);
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (isReferenceDescriptor(descriptor)) Object.defineProperty(result, key, descriptor);
  }
  return result;
}
// Only acquire/lost assign their optional by-reference player argument. A
// caller needing that replacement supplies registry.reference(holder, key).
// Regular player objects still carry their ordinary field/reference aliases.
function playerArgument(value) {
  const descriptor = value && Object.getOwnPropertyDescriptor(value, 'value');
  return isReferenceDescriptor(descriptor)
    ? { value: value.value, replace: replacement => { value.value = replacement; } }
    : { value, replace: replacement => {
      if (value != null && typeof value === 'object') Object.defineProperties(value, Object.getOwnPropertyDescriptors(replacement));
    } };
}
const bytes = value => ArrayBuffer.isView(value)
  ? Buffer.from(value.buffer, value.byteOffset, value.byteLength) : Buffer.from(text(value), 'utf8');
function decode(value, key = false) {
  // PHP base64_decode's non-strict mode ignores all non-alphabet bytes,
  // including padding. Node's decoder instead stops at the first '='.
  const decoded = Buffer.from(text(value).replace(/[^A-Za-z0-9+/]/g, ''), 'base64');
  const string = decoded.toString('utf8');
  if (Buffer.from(string, 'utf8').equals(decoded)) return string;
  if (key) throw new TypeError('Skill parameter names must be valid UTF-8');
  return decoded;
}
async function current(ctx, pa, allowEmptyPid = false) {
  const state = ctx.state('skillbase');
  if (equal(state.ppid, -1)) await call(ctx, 'skillbase_set_ppid');
  return emptyPlayer(pa) || ((allowEmptyPid || filled(pa.pid)) && equal(pa.pid, state.ppid));
}
const catalog = ctx => {
  const service = ctx.services.skills;
  if (!service || typeof service.getInfo !== 'function' || typeof service.hasFunction !== 'function') {
    throw new Error('Native skillbase requires services.skills from createSkillCatalog(nativeDefinitions, infoById)');
  }
  return service;
};

/** Build metadata from the native modules actually selected for this game.
 * infoById contains the original MOD_SKILLn_INFO string, supplied as inert
 * configuration. No PHP is read or executed. A source inventory alone must
 * never be passed off as enabled native skill modules.
 */
export function createSkillCatalog(definitions, infoById = {}) {
  const enabled = new Map();
  for (const definition of definitions) {
    if (definition.enabled === false || !/^skill\d+$/i.test(definition.name)) continue;
    enabled.set(Number(definition.name.slice(5)), new Set(Object.keys(definition.functions ?? {}).map(name => name.toLowerCase())));
  }
  const metadata = new Map(infoById instanceof Map ? infoById : Object.entries(infoById));
  return Object.freeze({
    getInfo(skillId) {
      if (!enabled.has(Number(skillId))) return null;
      const info = metadata.get(Number(skillId)) ?? metadata.get(String(skillId));
      if (info == null) return null;
      if (typeof info !== 'string') throw new TypeError('Skill metadata must be an inert tag string');
      return info;
    },
    hasFunction(skillId, name) { return enabled.get(Number(skillId))?.has(name.toLowerCase()) ?? false; },
  });
}

/** All 29 public hooks from base/skillbase/main.php, plus request init.
 * acquired_list is Map<number skill id, scalar>, parameter_list is
 * Map<string parameter name, scalar>. Hooks must use get/set/delete and Map
 * iteration, preserving source insertion order. Current-player module lists
 * are copies, not aliases to the corresponding fields on a player record.
 * Parameter values support text, numeric/boolean/null scalars, and Uint8Array
 * for binary data; parameter names are UTF-8. acquire/lost accept a registry
 * reference slot when a nullable player variable must receive the replacement.
 * Individual skill implementations
 * and their metadata are separate native modules, never synthesized stubs.
 */
export const skillbaseModule = {
  name: 'skillbase', dependencies: ['sys', 'player'],
  state: () => ({ acquired_list: null, parameter_list: null, ppid: -1, valid_skills: {} }),
  initialize(ctx) { ctx.state().ppid = -1; },
  functions: {
    async check_skill_info(ctx, skillno, tag) {
      const info = catalog(ctx).getInfo(skillno);
      return info != null && info.includes(text(tag).replaceAll(';', '') + ';');
    },
    async skillbase_set_ppid(ctx) { if (filled(ctx.state('player').pid)) ctx.state().ppid = ctx.state('player').pid; },
    async b64_conv_to_value(ctx, character) {
      if (typeof character !== 'string' || Buffer.byteLength(character) !== 1 || !alphabet.includes(character)) throw new Error(`bad nskill value ${text(character)}`);
      return alphabet.indexOf(character);
    },
    async value_conv_to_b64(ctx, value) {
      value = n(value);
      if (value < 0 || value > 63 || (value > 61 && value !== 62 && value !== 63)) throw new Error(`bad char in skillbase ${text(value)}`);
      return value <= 25 ? String.fromCharCode(Math.trunc(97 + value))
        : value <= 51 ? String.fromCharCode(Math.trunc(65 + value - 26))
        : value <= 61 ? String.fromCharCode(Math.trunc(48 + value - 52)) : value === 62 ? '+' : '-';
    },
    async parse_skill_parameter_data(ctx, encoded) {
      const result = new Map();
      if (!filled(encoded)) return result;
      const parts = text(encoded).split(',');
      if (parts.length % 2 !== 1) throw new Error(`bad nskillpara value ${text(encoded)}`);
      for (let i = 0; i < parts.length - 1; i += 2) result.set(decode(parts[i], true), decode(parts[i + 1]));
      return result;
    },
    async skillbase_load(ctx, pa, dummy = false) {
      [pa.acquired_list, pa.parameter_list] = await call(ctx, 'skillbase_load_process', pa.nskill, pa.nskillpara);
      if (!filled(dummy)) {
        if (filled(pa.pid) && equal(pa.pid, ctx.state('player').pid)) {
          ctx.state().acquired_list = structuredClone(pa.acquired_list);
          ctx.state().parameter_list = structuredClone(pa.parameter_list);
        }
        if (filled(ctx.state('sys').gamestate)) await call(ctx, 'skill_onload_event', pa);
      }
    },
    async skillbase_load_process(ctx, encoded, parameters) {
      const skillString = bytes(encoded), acquired = new Map();
      if (skillString.length % 2 !== 0) throw new Error(`bad nskill value ${text(encoded)}`);
      for (let i = 0; i < skillString.length; i += 2) {
        const high = await call(ctx, 'b64_conv_to_value', String.fromCharCode(skillString[i]));
        const low = await call(ctx, 'b64_conv_to_value', String.fromCharCode(skillString[i + 1]));
        acquired.set(high * 64 + low, 1);
      }
      return [acquired, await call(ctx, 'parse_skill_parameter_data', parameters)];
    },
    async skill_onload_event(ctx, pa) { await call(ctx, 'check_skill_available_process', pa); },
    async skillbase_save(ctx, pa, inProc = 0) {
      if (!filled(inProc)) await call(ctx, 'skill_onsave_event', pa);
      const self = equal(pa.pid, ctx.state('player').pid), owner = self ? ctx.state() : pa;
      const [encoded, parameters] = await call(ctx, 'skillbase_save_process', list(owner, 'acquired_list'), list(owner, 'parameter_list'));
      if (self) { ctx.state('player').nskill = encoded; ctx.state('player').nskillpara = parameters; }
      pa.nskill = encoded; pa.nskillpara = parameters;
    },
    async skillbase_save_process(ctx, acquired, parameters) {
      let encoded = '', encodedParameters = '';
      for (const [key, value] of ordered(acquired, true)) if (equal(value, 1)) {
        encoded += await call(ctx, 'value_conv_to_b64', Math.trunc(key / 64));
        encoded += await call(ctx, 'value_conv_to_b64', key % 64);
      }
      for (const [key, value] of ordered(parameters)) encodedParameters += `${bytes(key).toString('base64')},${bytes(value).toString('base64')},`;
      return [encoded, encodedParameters];
    },
    async skill_onsave_event() {},
    async load_playerdata(ctx, data) {
      data = parameterCopy(data);
      await ctx.next(data);
      if (data.nskill != null) await call(ctx, 'skillbase_load', data);
    },
    async playerdata_construct_process(ctx, data) {
      data = await ctx.next(parameterCopy(data));
      await call(ctx, 'skillbase_load', data);
      return data;
    },
    async player_save(ctx, data, inProc = 0) {
      data = parameterCopy(data);
      await call(ctx, 'skillbase_save', data, inProc);
      await ctx.next(data, inProc);
    },
    async skill_acquire(ctx, skillid, pa = null, noCover = 0) {
      skillid = id(skillid);
      const argument = playerArgument(pa); pa = argument.value;
      const self = emptyPlayer(pa) || (filled(pa.pid) && equal(pa.pid, ctx.state('player').pid));
      if (emptyPlayer(pa)) { await ctx.call('player', 'update_sdata'); pa = parameterCopy(ctx.state('player').sdata); argument.replace(pa); }
      const owner = self ? ctx.state() : pa, already = filled(list(owner, 'acquired_list').get(skillid));
      if (!already) list(owner, 'acquired_list', true).set(skillid, 1);
      if (ctx.hasModule(`skill${skillid}`) && !(already && filled(noCover))) await ctx.call(`skill${skillid}`, `acquire${skillid}`, pa);
      await call(ctx, 'skill_delvalue', skillid, 'tsk_expire', pa);
      await call(ctx, 'skill_delvalue', skillid, 'eqpsk_flag', pa);
    },
    async skill_lost(ctx, skillid, pa = null) {
      skillid = id(skillid);
      const argument = playerArgument(pa); pa = argument.value;
      const self = emptyPlayer(pa) || equal(pa.pid, ctx.state('player').pid);
      if (emptyPlayer(pa)) { await ctx.call('player', 'update_sdata'); pa = parameterCopy(ctx.state('player').sdata); argument.replace(pa); }
      const owner = self ? ctx.state() : pa;
      if (filled(list(owner, 'acquired_list').get(skillid))) {
        list(owner, 'acquired_list', true).set(skillid, 0);
        if (ctx.hasModule(`skill${skillid}`)) await ctx.call(`skill${skillid}`, `lost${skillid}`, pa);
      }
    },
    async skill_query(ctx, skillid, pa = null) {
      pa = referenceValue(pa);
      skillid = id(skillid);
      const self = await current(ctx, pa), owner = self ? ctx.state() : pa;
      return filled(list(owner, 'acquired_list').get(skillid)) && !!await call(ctx, 'skill_enabled', skillid, self ? ctx.state('player').sdata : pa);
    },
    async skill_enabled(ctx, skillid, pa) { return call(ctx, 'skill_enabled_core', skillid, pa); },
    async skill_enabled_core() { return true; },
    async check_have_skill_info(ctx, tag, pa = null) {
      pa = referenceValue(pa);
      const owner = await current(ctx, pa) ? ctx.state() : pa;
      // Source deliberately inspects every retained key, including lost (0).
      for (const key of list(owner, 'acquired_list').keys()) if (await call(ctx, 'check_skill_info', key, tag)) return 1;
      return 0;
    },
    async get_acquired_skill_array(ctx, pa = null) {
      pa = referenceValue(pa);
      const owner = await current(ctx, pa) ? ctx.state() : pa;
      return [...list(owner, 'acquired_list')].filter(([, value]) => equal(value, 1)).map(([key]) => key);
    },
    async skill_setvalue(ctx, skillid, key, value, pa = null) {
      pa = referenceValue(pa);
      if (value != null && typeof value === 'object' && !ArrayBuffer.isView(value)) throw new TypeError('Skill parameter values must be scalars or byte arrays');
      const owner = await current(ctx, pa) ? ctx.state() : pa;
      list(owner, 'parameter_list', true).set(`${text(skillid)}_${text(key)}`, value == null ? null : structuredClone(value));
    },
    async skill_getvalue(ctx, skillid, key, pa = null) {
      pa = referenceValue(pa);
      const owner = await current(ctx, pa) ? ctx.state() : pa;
      return structuredClone(list(owner, 'parameter_list').get(`${text(skillid)}_${text(key)}`) ?? null);
    },
    async skill_getvalue_direct(ctx, skillid, key, data) {
      return (await call(ctx, 'parse_skill_parameter_data', data)).get(`${text(skillid)}_${text(key)}`) ?? null;
    },
    async skill_delvalue(ctx, skillid, key, pa = null) {
      pa = referenceValue(pa);
      const owner = await current(ctx, pa, true) ? ctx.state() : pa;
      list(owner, 'parameter_list').delete(`${text(skillid)}_${text(key)}`);
    },
    async skill_check_unlocked(ctx, skillid, pa = null) {
      pa = referenceValue(pa);
      const functionName = `check_unlocked${text(skillid)}`;
      if (!catalog(ctx).hasFunction(skillid, functionName)) return true;
      return ctx.call(`skill${text(skillid)}`, functionName, emptyPlayer(pa) ? ctx.state('player').sdata : pa);
    },
    async post_enterbattlefield_events(ctx, pa) {
      await ctx.next(pa);
      for (const [key, value] of ordered(pa.skills, true)) if (ctx.hasModule(`skill${key}`)) {
        await call(ctx, 'skill_acquire', key, pa);
        if (value !== null && typeof value === 'object') {
          for (const [parameter, parameterValue] of ordered(value)) await call(ctx, 'skill_setvalue', key, parameter, parameterValue, pa);
        } else if (n(value) > 0) await call(ctx, 'skill_setvalue', key, 'lvl', value, pa);
      }
      if (filled(pa.o_card)) pa.card = pa.o_card;
      const valid = ctx.state().valid_skills instanceof Map ? ctx.state().valid_skills.get(ctx.state('sys').gametype) : ctx.state().valid_skills[ctx.state('sys').gametype];
      for (const skillid of valid instanceof Map ? valid.values() : Object.values(valid ?? {})) if (ctx.hasModule(`skill${skillid}`)) await call(ctx, 'skill_acquire', skillid, pa);
    },
    async check_skill_available_process(ctx, pa) {
      for (const skillid of await call(ctx, 'get_acquired_skill_array', pa)) {
        const info = catalog(ctx).getInfo(skillid);
        if (info != null && ['club;', 'card;', 'debuff;'].some(tag => info.includes(tag))) await call(ctx, 'check_skill_available', skillid, pa);
      }
    },
    async check_skill_available() {},
  },
};
