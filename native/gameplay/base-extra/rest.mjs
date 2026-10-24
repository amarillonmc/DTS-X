import { number as n, text, present, appendLog, round } from '../numbers.mjs';
import { call, eq, min } from './helpers.mjs';
import config from './rest-config.json' with { type: 'json' };

export const restModule = {
  name: 'rest', dependencies: ['sys', 'player', 'logger'], optionalDependencies: ['wound'], templates: ['rest_cmd'], state: () => structuredClone(config.values),
  functions: {
    async calculate_rest_upsp(ctx, time) { return round(n(ctx.state('player').msp) * n(time) / n(ctx.state().rest_sleep_time) / 100); },
    async calculate_rest_uphp(ctx, time) { const player = ctx.state('player'), amount = round(n(player.mhp) * n(time) / n(ctx.state().rest_heal_time) / 100); return text(player.inf).includes('b') ? round(amount / 2) : amount; },
    async get_wound_recover_time(ctx) { return ctx.state().rest_recover_time; },
    async rest(ctx, command) {
      const player = ctx.state('player'), sys = ctx.state('sys'), time = n(sys.now) - n(player.endtime); player.endtime = sys.now;
      if ((eq(player.state, 1) || eq(player.state, 3)) && n(player.sp) < n(player.msp)) {
        const previous = player.sp, increase = await call(ctx, 'calculate_rest_upsp', time);
        player.sp = min(n(player.sp) + n(increase), player.msp);
        const gained = Math.max(0, n(player.sp) - n(previous)); if (gained) appendLog(ctx, `你的体力恢复了<span class="yellow b">${text(gained)}</span>点。`);
      }
      if ((eq(player.state, 2) || eq(player.state, 3)) && n(player.hp) < n(player.mhp)) {
        const previous = player.hp, increase = await call(ctx, 'calculate_rest_uphp', time);
        player.hp = min(n(player.hp) + n(increase), player.mhp);
        const gained = Math.max(0, n(player.hp) - n(previous)); if (gained) appendLog(ctx, `你的生命恢复了<span class="yellow b">${text(gained)}</span>点。`);
      }
      appendLog(ctx, '<br>');
      if (eq(player.state, 3) && ctx.hasModule('wound')) {
        const interval = await call(ctx, 'get_wound_recover_time');
        if (present(player.inf) && time > n(interval)) {
          while (!eq(player.inf, '')) { const mark = text(player.inf)[0]; appendLog(ctx, `<span class="yellow b">你从${text(ctx.state('wound').infname[mark])}状态中恢复了！</span><br>`); await ctx.call('wound', 'heal_inf', mark); }
        } else if (present(player.inf)) appendLog(ctx, '也许是时间不够吧……你没有治好任何异常状态。<br>');
      }
    },
    async init_rest_timing(ctx) { const sys = ctx.state('sys'); sys.uip ??= {}; sys.uip.timing ??= {}; sys.uip.timing.rest_timing = { on: true, mode: 1, timing: 0, timing_r: '00:00', format: 'mm:ss' }; },
    async act(ctx) {
      const sys = ctx.state('sys'), player = ctx.state('player');
      if (eq(sys.mode, 'command') && ['rest1', 'rest2', 'rest3'].some(command => eq(sys.command, command))) {
        if (eq(sys.command, 'rest3') && !ctx.state().rest_hospital_list.some(location => eq(player.pls, location))) appendLog(ctx, '<span class="yellow b">你所在的位置并非医院，不能静养！</span><br>');
        else { player.state = text(sys.command).slice(4, 5); sys.mode = 'rest'; appendLog(ctx, '你开始了' + text(ctx.state().restinfo[player.state]) + '…'); }
        return;
      }
      if (eq(sys.mode, 'rest')) { await call(ctx, 'rest', sys.command); if (!eq(sys.command, 'rest')) { player.state = 0; player.endtime = sys.now; sys.mode = 'command'; } return; }
      await ctx.next();
    },
  },
};
