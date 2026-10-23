import { isReferenceDescriptor } from '../../templates/values.mjs';
import { number as n, text, present, appendLog } from '../numbers.mjs';
import { call, eq } from './helpers.mjs';
import config from './wound-config.json' with { type: 'json' };

function argument(value) {
  const descriptor = value && Object.getOwnPropertyDescriptor(value, 'value');
  return isReferenceDescriptor(descriptor) ? value.value : value;
}
const emptyPlayer = value => value == null || (typeof value === 'object' && Object.keys(value).length === 0);

/** Wound positions, injury rolls and acquisition/removal of their real skills.
 * Optional player replacements use registry.reference(holder, key), matching
 * skillbase's optional by-reference argument instead of inventing a self copy. */
export const woundModule = {
  name: 'wound', dependencies: ['sys', 'player', 'logger', 'skillbase'], optionalDependencies: ['battle', 'weapon', 'metman'],
  templates: ['wound_profile', 'wound_profile_battle', 'wound_picture'], state: () => structuredClone(config.values),
  functions: {
    async get_inf(ctx, mark, pa = null) {
      const data = argument(pa), target = emptyPlayer(data) ? ctx.state('player') : data;
      const previous = text(target.inf), position = text(mark), added = previous.includes(position) ? 0 : 1;
      target.inf = previous.replaceAll(position, '') + position;
      await ctx.call('skillbase', 'skill_acquire', ctx.state().infskillinfo[position] ?? null, pa);
      return added;
    },
    async heal_inf(ctx, mark, pa = null) {
      const data = argument(pa), target = emptyPlayer(data) ? ctx.state('player') : data;
      target.inf = text(target.inf).replaceAll(text(mark), '');
      await ctx.call('skillbase', 'skill_lost', ctx.state().infskillinfo[text(mark)] ?? null, pa);
    },
    async calculate_inf_rate(ctx, pa, pd, active) { return ctx.state().wep_infobbs[pa.wep_kind] ?? null; },
    async calculate_weapon_wound_base() { return 1; },
    async calculate_weapon_wound_multiplier() { return 1; },
    async weapon_wound_success(ctx, pa, pd, active, mark) {
      const key = 'attack_wounded_' + text(mark); if (!present(pa[key])) pa[key] = 0;
      const base = await call(ctx, 'calculate_weapon_wound_base', pa, pd, active, mark), multiplier = await call(ctx, 'calculate_weapon_wound_multiplier', pa, pd, active, mark);
      pa[key] = n(pa[key]) + n(base) * n(multiplier);
    },
    async check_weapon_inf_proc(ctx, pa, pd, active, mark) { if (present(await call(ctx, 'check_weapon_inf_rate_hit', pa, pd, active))) await call(ctx, 'weapon_wound_success', pa, pd, active, mark); },
    async check_weapon_inf_rate_hit(ctx, pa, pd, active) { const rate = await call(ctx, 'calculate_inf_rate', pa, pd, active); return ctx.services.random.rand(0, 99) < n(rate); },
    async check_weapon_inf(ctx, pa, pd, active) { const state = ctx.state(), position = text(state.inf_place)[ctx.services.random.rand(0, text(state.inf_place).length - 1)]; if (text(state.wep_infatt[pa.wep_kind]).includes(position)) await call(ctx, 'check_weapon_inf_proc', pa, pd, active, position); },
    async post_weapon_strike_events(ctx, pa, pd, active, hit) { await ctx.next(pa, pd, active, hit); if (present(hit)) await call(ctx, 'check_weapon_inf', pa, pd, active); },
    async apply_weapon_wound_real(ctx, pa, pd, active, mark) {
      appendLog(ctx, `${present(active) ? text(pd.name) + '的' : '你的'}<span class="red b">${text(ctx.state().infinfo[mark])}</span>部受伤了！<br>`);
      if (present(await call(ctx, 'get_inf', mark, pd))) await ctx.call('sys', 'addnews', 0, 'inf', pa.name, pd.name, mark, '', '');
    },
    async apply_weapon_inf(ctx, pa, pd, active) { for (const position of text(ctx.state().inf_place)) if (pa['attack_wounded_' + position] != null && n(pa['attack_wounded_' + position]) > 0) await call(ctx, 'apply_weapon_wound_real', pa, pd, active, position); },
    async strike_finish(ctx, pa, pd, active) { await call(ctx, 'apply_inf_main', pa, pd, active); await ctx.next(pa, pd, active); },
    async apply_inf_main(ctx, pa, pd, active) { await call(ctx, 'apply_weapon_inf', pa, pd, active); for (const position of text(ctx.state().inf_place)) delete pa['attack_wounded_' + position]; },
    async assault_prepare(ctx, pa, pd, active) { pa.original_inf = pa.inf; pd.original_inf = pd.inf; await ctx.next(pa, pd, active); },
    async assault_finish(ctx, pa, pd, active) {
      const target = present(active) ? pd : pa, old = text(target.original_inf), current = text(target.inf);
      const injuries = Object.entries(ctx.state().infname).filter(([mark]) => !old.includes(mark) && current.includes(mark)).map(([, name]) => text(name));
      target.battlelog = text(target.battlelog) + (injuries.length ? '这场战斗导致你' + injuries.join('、') + '了！<br>' : '');
      await ctx.next(pa, pd, active);
    },
    async init_battle(ctx, isMeet = 0) { await ctx.next(isMeet); const state = ctx.state('metman'); state.tdata.infdata = present(state.w_inf) ? Object.entries(ctx.state().infinfo).filter(([mark]) => text(state.w_inf).includes(mark)).map(([, name]) => text(name)).join('') : ''; },
    async chginf(ctx, mark) {
      const sys = ctx.state('sys'), player = ctx.state('player'), state = ctx.state();
      if (!present(mark)) { sys.mode = 'command'; return; }
      if (['h', 'b', 'a', 'f'].some(position => eq(position, mark)) && text(player.inf).includes(text(mark))) {
        if (n(player.sp) <= n(state.inf_recover_sp_cost)) appendLog(ctx, `包扎伤口需要${text(state.inf_recover_sp_cost)}点体力，先回复体力吧！`);
        else { await call(ctx, 'heal_inf', mark); player.sp = n(player.sp) - n(state.inf_recover_sp_cost); appendLog(ctx, `消耗<span class="yellow b">${text(state.inf_recover_sp_cost)}</span>点体力，${text(state.infinfo[mark])}<span class="red b">部</span>的伤口已经包扎好了！`); }
      } else if (text(player.inf).includes(text(mark))) appendLog(ctx, '异常状态不能被直接治疗！');
      else appendLog(ctx, '你不需要包扎这个伤口！');
      sys.mode = 'command';
    },
    async parse_news(ctx, nid, news, hour, minute, second, a, b, c, d, e, extra = []) {
      ({ hour, min: minute, sec: second } = ctx.state('sys'));
      if (eq(news, 'inf')) return 'bhaf'.includes(text(c)) ? '' : `<li id="nid${text(nid)}">${text(hour)}时${text(minute)}分${text(second)}秒，<span class="red b">${text(a)}的攻击致使${text(b)}</span>${text(ctx.state().infname[c])}<span class="red b">了</span></li>`;
      return await ctx.next(nid, news, hour, minute, second, a, b, c, d, e, extra);
    },
    async act(ctx) { const sys = ctx.state('sys'); if (eq(sys.mode, 'special') && text(sys.command).startsWith('inf')) { await call(ctx, 'chginf', text(sys.command).slice(3, 4)); return; } await ctx.next(); },
  },
};
