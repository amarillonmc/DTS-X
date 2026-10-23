import defaults from './map-config.json' with { type: 'json' };
import { number as n, text, present, sameDurability } from './numbers.mjs';

const call = (ctx, name, ...args) => ctx.call('map', name, ...args);
const sys = ctx => ctx.state('sys');
const values = array => Object.values(array);
const included = (array, value) => values(array).some(item => sameDurability(item, value));
const slice = (array, offset = 0, length) => {
  const data = values(array), start = offset < 0 ? Math.max(0, data.length + Math.trunc(offset)) : Math.trunc(offset);
  return length === undefined ? data.slice(start) : data.slice(start, length < 0 ? data.length + Math.trunc(length) : start + Math.trunc(length));
};
const padTwo = value => value < 0 ? '-' + String(-value).padStart(1, '0') : String(value).padStart(2, '0');

/** Direct port of core/map/main.php. The original map and area descriptions
 * are static JSON data; no executable PHP configuration is loaded. Forbidden
 * areas, warnings and game-end decisions still pass through the module chain.
 * Display dates use UTC, matching the original host's configured PHP timezone;
 * gameplay already carries its offset in the source timestamps.
 */
export const mapModule = {
  name: 'map', dependencies: ['sys'],
  state: () => ({ all_plsno_cache: [], ...structuredClone(defaults) }),
  functions: {
    async get_plsnum(ctx, useConfig = 0) { return values(present(useConfig) ? ctx.state().plsinfo : sys(ctx).arealist).length; },
    async get_all_plsno(ctx, useConfig = 0) {
      const state = ctx.state();
      if (present(useConfig)) return Object.keys(state.plsinfo).map(key => /^-?\d+$/.test(key) ? Number(key) : key);
      if (values(state.all_plsno_cache).length) return structuredClone(state.all_plsno_cache);
      state.all_plsno_cache = values(sys(ctx).arealist).sort((a, b) => n(a) - n(b));
      return structuredClone(state.all_plsno_cache);
    },
    async load_gameinfo_post_work_core(ctx) {
      await ctx.next();
      const override = sys(ctx).gamevars?.plsinfo;
      if (override && typeof override === 'object' && values(override).length) ctx.state().plsinfo = structuredClone(override);
    },
    async reset_game(ctx) { await ctx.next(); ctx.state().plsinfo = structuredClone(ctx.state().plsinfo_o); },
    async check_pls(ctx, place, parameter = '') {
      const places = await call(ctx, 'get_all_plsno');
      return included(places, place) ? place : places[0] ?? null;
    },
    async is_plsno_available(ctx, place) { return included(await call(ctx, 'get_all_plsno'), place); },
    async get_area_wavenum(ctx) { return Math.max(0, Math.floor((n(sys(ctx).areanum) - values(ctx.state().area_on_start).length) / n(ctx.state().areaadd))); },
    async get_current_area(ctx, wave = 0) { return slice(sys(ctx).arealist, 0, n(sys(ctx).areanum) + n(wave) * n(ctx.state().areaadd)); },
    async get_current_not_area(ctx, wave = 0) { return slice(sys(ctx).arealist, n(sys(ctx).areanum) + n(wave) * n(ctx.state().areaadd)); },
    async check_in_forbidden_area(ctx, place, wave = 0) { return included(await call(ctx, 'get_current_area', wave), place); },
    async check_can_enter(ctx, place) { return (await call(ctx, 'is_plsno_available', place)) && (!(await call(ctx, 'check_in_forbidden_area', place)) || present(sys(ctx).hack)); },
    async init_areatiming(ctx) {
      const s = sys(ctx), request = ctx.services.system?.request;
      s.uip ??= {}; s.uip.timing ??= {};
      const timing = n(s.areatime) - n(s.now);
      let formatted = padTwo(Math.floor(timing / 60)) + ':' + padTwo(Math.trunc(timing) % 60);
      if (timing < 10) formatted = '<span class="red b">' + formatted + '</span>';
      else if (timing < 60) formatted = '<span class="yellow b">' + formatted + '</span>';
      s.uip.timing.area_timing = { on: !request?.inReplay && ['GAME', 'ACT'].includes(request?.script), mode: 0, timing: timing * 1000, timing_r: formatted };
    },
    async get_area_interval(ctx) { return ctx.state().areainterval[sys(ctx).gametype] ?? ctx.state().areainterval[0]; },
    async get_safe_plslist(ctx, noDangerousZone = true, type = 0) {
      const list = await call(ctx, 'get_current_not_area');
      // array_diff compares string representations and preserves the numeric
      // keys. Keep the deleted slots: array_rand observes their bucket layout.
      if (list.length && present(noDangerousZone)) {
        const dangerous = new Set(values(ctx.state().dangerous_zone).map(text));
        for (let i = 0; i < list.length; i++) if (dangerous.has(text(list[i]))) delete list[i];
      }
      return list;
    },
    async get_arealist_nextadd(ctx, wave = 1) { return slice(sys(ctx).arealist, n(sys(ctx).areanum) + (n(wave) - 1) * n(ctx.state().areaadd), n(ctx.state().areaadd)); },
    async addarea_pc_process() {},
    async check_addarea_gameover(ctx, atime) {
      const s = sys(ctx);
      if (!(await call(ctx, 'get_current_not_area')).length) { await ctx.call('sys', 'gameover', atime, 'end1'); return; }
      if (n(s.alivenum) === 1 && n(s.gamestate) >= 30) { await ctx.call('sys', 'gameover', atime); return; }
      if (n(s.alivenum) <= 0 && n(s.gamestate) >= 30) await ctx.call('sys', 'gameover', atime, 'end1');
    },
    async add_once_area(ctx, atime) {
      const s = sys(ctx), state = ctx.state();
      if (!(n(s.gamestate) > 10 && n(s.now) > n(atime))) return;
      const next = await call(ctx, 'get_arealist_nextadd');
      s.areanum = Math.min(n(s.areanum) + n(state.areaadd), values(s.arealist).length);
      if (n(s.hack) > 0) s.hack = n(s.hack) - 1;
      await call(ctx, 'post_addarea_process', atime, next);
      await call(ctx, 'check_addarea_gameover', atime);
      if (n(s.gamestate) > 0) await ctx.call('sys', 'rs_game', 48);
    },
    async post_addarea_process(ctx, atime, areas) {
      await ctx.call('sys', 'addnews', atime, 'addarea', structuredClone(areas), sys(ctx).weather, '', '', '');
      await ctx.call('sys', 'systemputchat', atime, 'areaadd', structuredClone(areas));
      await call(ctx, 'addarea_pc_process', atime);
      await call(ctx, 'check_game_stop_joining_when_area');
    },
    async areawarn(ctx) { await ctx.call('sys', 'systemputchat', sys(ctx).now, 'areawarn', await call(ctx, 'get_arealist_nextadd')); },
    async rs_game(ctx, mode = 0) {
      await ctx.next(mode);
      if (!(n(mode) & 2)) return;
      const s = sys(ctx), state = ctx.state();
      const date = new Date(n(s.starttime) * 1000);
      Object.assign(s, { sec: date.getUTCSeconds(), min: date.getUTCMinutes(), hour: date.getUTCHours(), day: date.getUTCDate(), month: date.getUTCMonth(), year: date.getUTCFullYear() - 1900, wday: date.getUTCDay() });
      s.areatime = await call(ctx, 'rs_areatime'); s.areanum = values(state.area_on_start).length;
      const prohibited = new Set(values(state.area_on_start).map(text));
      const remaining = (await call(ctx, 'get_all_plsno', 1)).filter(place => !prohibited.has(text(place)));
      if (typeof ctx.services.random?.shuffle !== 'function') throw new Error('Native map requires random.shuffle()');
      ctx.services.random.shuffle(remaining);
      s.arealist = [...values(state.area_on_start), ...remaining]; s.hack = 0; s.areawarn = 0;
    },
    async rs_areatime(ctx) { return Math.ceil((n(sys(ctx).starttime) + n(await call(ctx, 'get_area_interval')) * 60) / 600) * 600; },
    async get_areanames_nextadd(ctx, wave = 1, short = 0) {
      const names = present(short) ? ctx.state().plsinfo_for_short : ctx.state().plsinfo;
      return (await call(ctx, 'get_arealist_nextadd', wave)).map(place => names[place] ?? null);
    },
    async get_next_areadata_html(ctx, atime = 0) {
      const s = sys(ctx); if (!present(atime)) atime = s.areatime;
      if (n(atime) - n(s.now) > 43200) return '距离下一次禁区还有12个小时以上';
      let html = '';
      for (let wave = 1; wave <= 3; wave++) {
        const names = await call(ctx, 'get_areanames_nextadd', wave);
        if (!names.length) continue;
        const date = new Date((n(atime) + n(await call(ctx, 'get_area_interval')) * (wave - 1) * 60) * 1000);
        html += `<b>${date.getUTCHours()}时${date.getUTCMinutes()}分：</b> ` + names.map(text).join('&nbsp;&nbsp;');
        if (wave < 3) html += '；';
      }
      return html;
    },
    async updategame(ctx) {
      const s = sys(ctx); await ctx.next();
      if (n(s.gamestate) > 10 && n(s.now) > n(s.areatime)) {
        while (n(s.now) > n(s.areatime)) {
          const previous = s.areatime;
          const interval = n(await call(ctx, 'get_area_interval'));
          if (!(interval > 0)) throw new RangeError('Native map area interval must advance time');
          s.areatime = n(s.areatime) + interval * 60;
          await call(ctx, 'add_once_area', previous); s.areawarn = 0;
        }
      } else if (n(s.gamestate) > 10 && n(s.now) > n(s.areatime) - n(ctx.state().areawarntime) && !present(s.areawarn)) {
        await call(ctx, 'areawarn'); s.areawarn = 1;
      }
    },
    async check_game_stop_joining_when_area(ctx) {
      const s = sys(ctx), state = ctx.state();
      if (n(s.gamestate) !== 20) return;
      state.arealimit = n(state.arealimit) > 0 ? state.arealimit : 1;
      const wave = await call(ctx, 'get_area_wavenum');
      if (n(s.validnum) <= 0 && wave >= n(state.arealimit)) await ctx.call('sys', 'gameover', n(s.areatime) - n(await call(ctx, 'get_area_interval')) * 60 + 1, 'end4');
      else if (wave >= n(state.arealimit)) s.gamestate = 30;
    },
    async parse_news(ctx, id, news, hour, minute, second, a, b, c, d, e, extra = {}) {
      // import_module('sys') rebinds these source parameter names to the shared
      // date fields. load_news sets them before dispatch; direct callers also
      // observe that rebinding rather than their argument values.
      hour = sys(ctx).hour; minute = sys(ctx).min; second = sys(ctx).sec;
      const prefix = `<li id="nid${text(id)}">${text(hour)}时${text(minute)}分${text(second)}秒，`;
      if (news === 'death11') return prefix + `<span class="yellow b">${text(a)}</span>因滞留在<span class="red b">禁区【${text(ctx.state().plsinfo[c])}】</span>死亡</li>`;
      if (news === 'addarea') return prefix + '增加禁区：' + text(a).split('_').map(place => text(ctx.state().plsinfo[place]) + ' ').join('') + '</li>';
      return ctx.next(id, news, hour, minute, second, a, b, c, d, e, structuredClone(extra));
    },
  },
};
