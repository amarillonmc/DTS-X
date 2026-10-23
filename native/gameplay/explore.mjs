import { number as n, text, present, appendLog, sameDurability as eq } from './numbers.mjs';

const call = (ctx, name, ...args) => ctx.call('explore', name, ...args);

/** Native base/explore/main.php. Its configuration and init are empty in the
 * source. Item, encounter, trap and event discovery extend the named chain;
 * this base deliberately retains the original no-discovery result and text. */
export const exploreModule = {
  name: 'explore',
  dependencies: ['sys', 'input', 'map', 'logger', 'player'],
  templates: ['explore'],
  functions: {
    async calculate_move_sp_cost() { return 15; },
    async move_to_area(ctx, destination) {
      appendLog(ctx, text(ctx.state('map').areainfo[ctx.state('player').pls]) + '<br>');
      return await call(ctx, 'discover', 'move');
    },
    async move(ctx, destination = 99) {
      const cost = await call(ctx, 'allow_move_check', destination);
      if (cost !== false) {
        const player = ctx.state('player');
        player.sp = n(player.sp) - n(cost);
        appendLog(ctx, `你消耗<span class="yellow b">${text(cost)}</span>点体力，移动到了${text(ctx.state('map').plsinfo[destination])}。<br>`);
        player.pls = destination;
        await call(ctx, 'move_to_area', destination);
      }
    },
    async calculate_search_sp_cost() { return 15; },
    async search_area(ctx) { return await call(ctx, 'discover', 'search'); },
    async allow_move_check(ctx, destination) {
      const player = ctx.state('player');
      if (eq(destination, 'main') || !present(await ctx.call('map', 'is_plsno_available', destination))) {
        appendLog(ctx, '请选择正确的移动地点。<br>'); return false;
      }
      if (eq(player.pls, destination)) { appendLog(ctx, '相同地点，不需要移动。<br>'); return false; }
      if (!present(await ctx.call('map', 'check_can_enter', destination))) {
        appendLog(ctx, text(ctx.state('map').plsinfo[destination]) + '是禁区，还是离远点吧！<br>'); return false;
      }
      const calculated = await call(ctx, 'calculate_move_sp_cost');
      // PHP max returns the winning argument's original scalar type. Its first
      // argument wins ties, unlike search's reversed max(1, calculated).
      const cost = n(calculated) >= 1 ? calculated : 1;
      if (n(player.sp) <= n(cost)) { appendLog(ctx, '体力不足，不能移动！<br>还是先睡会儿吧！<br>'); return false; }
      return cost;
    },
    async allow_search_check(ctx) {
      const player = ctx.state('player');
      if (!present(await ctx.call('map', 'check_can_enter', player.pls))) {
        appendLog(ctx, text(ctx.state('map').plsinfo[player.pls]) + '是禁区，还是赶快逃跑吧！<br>'); return false;
      }
      const calculated = await call(ctx, 'calculate_search_sp_cost');
      const cost = n(calculated) > 1 ? calculated : 1;
      if (n(player.sp) <= n(cost)) { appendLog(ctx, '体力不足，不能探索！<br>还是先睡会儿吧！<br>'); return false; }
      return cost;
    },
    async search(ctx) {
      const cost = await call(ctx, 'allow_search_check');
      if (cost !== false) {
        const player = ctx.state('player'); player.sp = n(player.sp) - n(cost);
        appendLog(ctx, `消耗<span class="yellow b">${text(cost)}</span>点体力，你搜索着周围的一切……<br>`);
        await call(ctx, 'search_area');
      }
    },
    async discover(ctx, mode) { appendLog(ctx, '但是什么都没有发现。<br>'); return false; },
    async act(ctx) {
      const sys = ctx.state('sys');
      if (sys.mode === 'command') {
        if (sys.command === 'move') await call(ctx, 'move', ctx.state('input').moveto ?? null);
        else if (sys.command === 'search') await call(ctx, 'search');
      }
      await ctx.next();
    },
  },
};
