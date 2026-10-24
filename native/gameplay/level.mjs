import { number as n, present, round, text } from './numbers.mjs';
import { referenceValue } from '../templates/values.mjs';

const call = (ctx, method, ...args) => ctx.call('lvlctl', method, ...args);
const isset = value => value !== null && value !== undefined;
const random = (ctx, low, high) => {
  if (typeof ctx.services.random?.rand !== 'function') throw new Error('Native lvlctl requires a request-local random.rand().');
  return ctx.services.random.rand(low, high);
};

/** Complete base/lvlctl rules and original baseexp configuration. Player
 * records are references; current-player sdata aliases are supplied by player.
 * All extension hooks and player/log writes are awaited in original order.
 */
export const levelModule = {
  name: 'lvlctl', dependencies: ['sys', 'player', 'logger'],
  state: { baseexp: 9, lvuphp: null, lvupatt: null, lvupdef: null, lvupskill: null, lvupsp: null, lvupspref: null, lvupskpt: null, sklog: null },
  functions: {
    async getexp(ctx, value, player = null) {
      player = referenceValue(player);
      const current = player === null;
      if (current) { await ctx.call('player', 'update_sdata'); player = ctx.state('player').sdata; }
      const result = await call(ctx, 'checklvlup', value, player);
      if (current) {
        await ctx.call('player', 'player_save', ctx.state('player').sdata);
        await ctx.call('player', 'load_playerdata', ctx.state('player').sdata);
      }
      return result;
    },
    async calc_upexp(ctx, level) { return Math.trunc(round((n(level) * 2 + 1) * n(ctx.state().baseexp))); },
    async calc_uplv(ctx, experience, required) {
      const count = Math.floor((n(experience) - n(required)) / n(ctx.state().baseexp) / 2);
      // PHP's explicit integer cast turns INF/NAN into zero (e.g. baseexp=0).
      return 1 + (Number.isFinite(count) ? count : 0);
    },
    async lvlup(ctx, player) {
      const state = ctx.state();
      state.lvuphp = n(state.lvuphp) + random(ctx, 9, 11);
      state.lvupsp = n(state.lvupsp) + random(ctx, 4, 6);
      state.lvupatt = n(state.lvupatt) + random(ctx, 2, 4);
      state.lvupdef = n(state.lvupdef) + random(ctx, 3, 5);
      state.lvupspref = n(state.lvupspref) + round(n(player.msp) * 0.1);
      state.lvupskpt = n(state.lvupskpt) + 1;
      player.lvl = n(player.lvl) + 1;
    },
    async get_lvllimit(ctx, player) { return text(ctx.state('player').db_player_structure_types.lvl).startsWith('tinyint') ? 250 : 65000; },
    async checklvlup(ctx, value, player) {
      const state = ctx.state(), current = ctx.state('player');
      let required = await call(ctx, 'calc_upexp', player.lvl);
      const limit = await call(ctx, 'get_lvllimit', player);
      if (n(player.lvl) < n(limit)) {
        player.exp = n(player.exp) + n(value);
        if (n(player.exp) >= n(required)) {
          const count = Math.min(n(await call(ctx, 'calc_uplv', player.exp, required)), n(limit) - n(player.lvl));
          for (const field of ['lvuphp', 'lvupatt', 'lvupdef', 'lvupskill', 'lvupsp', 'lvupspref', 'lvupskpt']) state[field] = 0;
          state.sklog = '';
          for (let i = 0; i < count; i++) if (n(player.lvl) < n(limit)) await call(ctx, 'lvlup', player);
          required = await call(ctx, 'calc_upexp', player.lvl);
          if (n(player.lvl) >= n(limit)) { player.lvl = limit; player.exp = required; }
          player.upexp = required;
          for (const [field, change] of [['hp', 'lvuphp'], ['mhp', 'lvuphp'], ['sp', 'lvupsp'], ['msp', 'lvupsp'], ['att', 'lvupatt'], ['def', 'lvupdef']]) player[field] = n(player[field]) + n(state[change]);
          if (n(player.sp) >= n(player.msp)) state.lvupspref = 0;
          else if (n(player.sp) + n(state.lvupspref) >= n(player.msp)) state.lvupspref = n(player.msp) - n(player.sp);
          player.sp = n(player.sp) + n(state.lvupspref);
          player.skillpoint = n(player.skillpoint) + n(state.lvupskpt);
          const message = `<span class="yellow b">你升了${text(count)}级！生命上限+${text(state.lvuphp)}，体力上限+${text(state.lvupsp)}，攻击+${text(state.lvupatt)}，防御+${text(state.lvupdef)}，${present(state.lvupspref) ? `体力恢复了${text(state.lvupspref)}${text(state.sklog)}，` : ''}获得了${text(state.lvupskpt)}点技能点！</span><br>`;
          if (player.pid === current.pid) ctx.state('logger').log = text(ctx.state('logger').log) + message;
          else if (!present(player.type)) await ctx.call('logger', 'logsave', player.pid, ctx.state('sys').now, message, 's');
        }
        return 1;
      }
      player.lvl = limit;
      // The threshold is calculated from the incoming level, before clamping.
      player.exp = Math.min(n(player.exp) + n(value), n(required));
      return 0;
    },
    async load_playerdata(ctx, data) {
      if (isset(data.upexp)) ctx.state('player').upexp = data.upexp;
      await ctx.next(data);
    },
    async init_playerdata(ctx) {
      const player = ctx.state('player');
      player.upexp = await call(ctx, 'calc_upexp', player.lvl);
      player.lvlupexp = n(player.upexp) - n(player.exp);
      await ctx.next();
    },
  },
};
