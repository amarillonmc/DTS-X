import { gencode, gdecode } from '../protocol/codec.mjs';
import { present, number as n, text, appendLog } from '../gameplay/numbers.mjs';

const slotValue = value => value && Object.getOwnPropertyDescriptor(value, 'value')?.get ? value.value : value;
const validSettings = value => value !== null && typeof value === 'object' && !ArrayBuffer.isView(value);
const nonempty = value => present(value) && (!validSettings(value) || Object.keys(value).length > 0);
function get(cache, ud) {
  const username = text(ud?.username);
  if (nonempty(cache.get(username))) return structuredClone(cache.get(username));
  if (present(ud?.u_settings)) {
    const value = gdecode(ud.u_settings);
    if (validSettings(value) && nonempty(value)) { cache.set(username, structuredClone(value)); return value; }
  }
  return [];
}
function save(cache, settings, ud) {
  if (!validSettings(settings) || !ud || typeof ud !== 'object') throw new TypeError('User settings require a record and user data');
  cache.set(text(ud.username), structuredClone(settings)); ud.u_settings = gencode(settings);
}

/** Per-request cache. Saving changes only the user row supplied by reference;
 * the caller retains the original responsibility to persist it explicitly. */
export function createUserSettingsService({ currentUser = () => null } = {}) {
  const cache = new Map();
  return Object.freeze({ get: (ud = null) => get(cache, nonempty(ud) ? ud : currentUser()),
    save: (settings, ud = null) => save(cache, settings, nonempty(ud) ? ud : currentUser()) });
}

export const userSettingsModule = {
  name: 'user_settings', dependencies: ['sys','player','logger'], optionalDependencies: ['opening','itemmain'],
  state: () => ({ decoded_u_settings: new Map() }),
  functions: {
    async get_u_settings(ctx, ud = null) { const row = slotValue(ud); return get(ctx.state().decoded_u_settings, nonempty(row) ? row : ctx.state('sys').cudata); },
    async save_u_settings(ctx, settings, ud = null) {
      const row = slotValue(ud); const target = nonempty(row) ? row : ctx.state('sys').cudata;
      save(ctx.state().decoded_u_settings, settings, target);
      // Source rebinds its LOCAL reference to cudata. An explicitly passed
      // null/empty caller slot remains unchanged; only cudata is mutated.
    },
    async opening_by_shootings_available(ctx) { const result = await ctx.next(), settings = await ctx.call('user_settings','get_u_settings'); return present(settings.skip_opening) ? false : result; },
    async itemget_mergable_type2_process(ctx, sameitem) {
      const settings = await ctx.call('user_settings','get_u_settings');
      if (present(settings.item_auto_merge)) { appendLog(ctx, '<span class="yellow b">因为游戏设置，自动合并了道具。</span><br>'); await ctx.call('itemmain','itemmerge',0,sameitem[0]); return; }
      await ctx.next(sameitem);
    },
    async parse_interface_gameinfo(ctx) {
      await ctx.next(); const settings = await ctx.call('user_settings','get_u_settings');
      if (present(settings.gscroll_type)) { const sys = ctx.state('sys'); sys.uip ??= {}; sys.uip.effect ??= {}; sys.uip.effect.class_changeto = ['gscroll','gscroll_' + Math.trunc(n(settings.gscroll_type))]; }
    },
  },
};
