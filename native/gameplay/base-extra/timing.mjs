import { isReferenceDescriptor } from '../../templates/values.mjs';
import { number as n, text, present, round } from '../numbers.mjs';
import { reference } from '../../modules/registry.mjs';
import { appendLog } from '../numbers.mjs';
import { call, eq } from './helpers.mjs';
import noiseConfig from './noise-config.json' with { type: 'json' };
import cooldownConfig from './cooldown-config.json' with { type: 'json' };
import openingConfig from './opening-config.json' with { type: 'json' };

const noiseKeys = ['noisetime', 'noisepls', 'noiseid', 'noiseid2', 'noisemode'];
const entries = value => value instanceof Map ? [...value] : Object.entries(value ?? {});
function parameterCopy(value) {
  if (value == null || typeof value !== 'object') return value;
  const result = structuredClone(value);
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) if (isReferenceDescriptor(descriptor)) Object.defineProperty(result, key, descriptor);
  return result;
}
const milliseconds = async ctx => Math.floor(n(ctx.services.system?.clock?.now ? await ctx.services.system.clock.now() : Date.now() / 1000) * 1000);
async function remaining(ctx) {
  const player = ctx.state('player'), end = n(player.cdsec) * 1000 + n(player.cdmsec), now = await milliseconds(ctx);
  ctx.state().rmcdtime = now >= end ? 0 : end - now;
}
function cooldownLog(ctx) {
  const time = n(ctx.state().rmcdtime);
  appendLog(ctx, `行动冷却时间：<span id="timer" class="yellow b">${Math.trunc(time / 1000)}.${Math.trunc((Math.trunc(time) % 1000) / 100)}</span>秒<script type="text/javascript">demiSecTimerStarter(${text(time)});</script><br>`);
}

export const noiseModule = {
  name: 'noise', dependencies: ['sys', 'map', 'player', 'logger'], optionalDependencies: [], templates: [],
  state: () => ({ ...Object.fromEntries(noiseKeys.map(key => [key, null])), ...structuredClone(noiseConfig.values) }),
  functions: {
    async pre_act(ctx) {
      const sys = ctx.state('sys'), player = ctx.state('player'), noise = ctx.state(), elapsed = n(sys.now) - n(noise.noisetime);
      if (n(player.hp) > 0 && n(sys.now) <= n(noise.noisetime) + n(noise.noiselimit) && present(noise.noisemode) && !eq(noise.noiseid, player.pid) && !eq(noise.noiseid2, player.pid)) appendLog(ctx, `<span class="yellow b">${elapsed < 60 ? text(elapsed) + '秒' : text(Math.floor(elapsed / 60)) + '分钟'}前，${text(ctx.state('map').plsinfo[noise.noisepls])}传来了${text(noise.noiseinfo[noise.noisemode])}。</span><br>`);
      await ctx.next();
    },
    async addnoise(ctx, where, type, first = -1, second = -1) { Object.assign(ctx.state(), { noisetime: ctx.state('sys').now, noisepls: where, noisemode: type, noiseid: first, noiseid2: second }); await ctx.call('sys', 'save_combatinfo'); },
    async load_gameinfo_post_work_extra(ctx) {
      const scope = ctx.importInto({}, 'sys', 'noise'); await ctx.next();
      for (const [key, value] of entries(scope.noisevars)) scope[key] = parameterCopy(value);
    },
    async gameinfo_audit(ctx) { await ctx.next(); for (const key of noiseKeys) if (!present(ctx.state()[key])) ctx.state()[key] = key === 'noisemode' ? '' : 0; },
    async reset_game(ctx) { await ctx.next(); for (const key of noiseKeys) ctx.state()[key] = key === 'noisemode' ? '' : 0; },
    async save_gameinfo_prepare_work(ctx, game, ignoreRoom = 1) {
      game = parameterCopy(game);
      if (!game.noisevars || typeof game.noisevars !== 'object') game.noisevars = {};
      for (const key of noiseKeys) { if (game.noisevars instanceof Map) game.noisevars.set(key, ctx.state()[key]); else game.noisevars[key] = ctx.state()[key]; }
      return await ctx.next(game, ignoreRoom);
    },
  },
};

/** Request start time is supplied by the host, separately from the current
 * high-resolution epoch clock. This preserves processing time within the CD. */
export const cooldownModule = {
  name: 'cooldown', dependencies: ['sys', 'player', 'logger'], optionalDependencies: ['explore', 'itemmain', 'song'], templates: [],
  state: () => ({ ...structuredClone(cooldownConfig.values), cmdcdtime: 0, rmcdtime: 0 }),
  initialize(ctx) { ctx.state().cmdcdtime = 0; ctx.state().rmcdtime = 0; },
  functions: {
    async get_move_coldtime(ctx) { return ctx.state().movecoldtime; },
    async get_search_coldtime(ctx) { return ctx.state().searchcoldtime; },
    async get_itemuse_coldtime(ctx) { return ctx.state().itemusecoldtime; },
    async set_coldtime(ctx, time, forced = 0) { const state = ctx.state(); if ((present(state.coldtimeon) || present(forced)) && n(state.cmdcdtime) < n(time)) state.cmdcdtime = time; return state.cmdcdtime; },
    async check_in_coldtime(ctx) { if (present(ctx.state().coldtimeon)) { await remaining(ctx); if (n(ctx.state().rmcdtime) > 0) { appendLog(ctx, '<span class="yellow b">冷却时间尚未结束！</span><br>'); ctx.state('sys').mode = 'command'; return true; } } return false; },
    async move(ctx, destination = 99) { if (await call(ctx, 'check_in_coldtime')) return; const local = { destination }; if (present(ctx.state().coldtimeon)) await call(ctx, 'set_coldtime', await call(ctx, 'get_move_coldtime', reference(local, 'destination'))); await ctx.next(local.destination); },
    async search(ctx) { if (await call(ctx, 'check_in_coldtime')) return; if (present(ctx.state().coldtimeon)) await call(ctx, 'set_coldtime', await call(ctx, 'get_search_coldtime')); await ctx.next(); },
    async itemuse_wrapper(ctx, item) { const local = { item: parameterCopy(item) }; if (await call(ctx, 'check_in_coldtime')) return; if (present(ctx.state().coldtimeon)) await call(ctx, 'set_coldtime', await call(ctx, 'get_itemuse_coldtime', reference(local, 'item'))); await ctx.next(local.item); },
    async get_pstime(ctx) {
      const request = ctx.services.system?.request;
      const value = request?.daemon ? ctx.state('input').___PAGE_STARTTIME_VALUE : request?.pageStartTime;
      if (value == null) throw new Error('Native cooldown requires the request pageStartTime (epoch seconds).');
      return value;
    },
    async post_act(ctx) {
      const start = await call(ctx, 'get_pstime'), state = ctx.state(), player = ctx.state('player');
      if (present(state.coldtimeon)) {
        if (!eq(state.cmdcdtime, 0)) { const end = Math.floor(n(start) * 1000) + n(state.cmdcdtime); player.cdsec = Math.floor(end / 1000); player.cdmsec = Math.trunc(end % 1000); }
        await remaining(ctx);
      }
      await ctx.next();
    },
    async check_cooltime_on(ctx) { return ctx.state().coldtimeon; },
    async prepare_response_content(ctx) {
      await ctx.next();
      if (present(await call(ctx, 'check_cooltime_on'))) {
        await remaining(ctx); const state = ctx.state();
        if (present(state.showcoldtimer) && present(state.rmcdtime)) ctx.state('player').gamedata.timer = state.rmcdtime;
        if (n(ctx.state('player').hp) > 0 && present(state.showcoldtimer) && present(state.rmcdtime)) cooldownLog(ctx);
      }
    },
    async prepare_initial_response_content(ctx) { await ctx.next(); if (present(await call(ctx, 'check_cooltime_on'))) { await remaining(ctx); if (n(ctx.state('player').hp) > 0 && present(ctx.state().showcoldtimer) && present(ctx.state().rmcdtime)) cooldownLog(ctx); } },
  },
};

export const apmModule = {
  name: 'apm', dependencies: ['sys', 'player', 'logger', 'map', 'explore', 'itemmain'], optionalDependencies: [], templates: ['profile'],
  functions: {
    async add_a_actionnum(ctx) { const player = ctx.state('player'); player.a_actionnum = n(player.a_actionnum) + 1; },
    async add_v_actionnum(ctx) { const player = ctx.state('player'); player.v_actionnum = n(player.v_actionnum) + 1; },
    async discover(ctx, mode) { const result = await ctx.next(mode); await call(ctx, 'add_v_actionnum'); return result; },
    async itemuse(ctx, item) {
      item = parameterCopy(item); const player = ctx.state('player'), durability = item.itms, hp = player.hp, sp = player.sp;
      await ctx.next(item); if (item.itms !== durability || !eq(hp, player.hp) || !eq(sp, player.sp)) await call(ctx, 'add_v_actionnum');
    },
    async calc_apm(ctx, player, useEnd = 0) {
      const sys = ctx.state('sys'), end = !present(useEnd) && n(player.hp) > 0 && n(sys.gamestate) >= 20 ? sys.now : player.endtime, minutes = Math.max(1, (n(end) - n(player.validtime)) / 60);
      return [round(n(player.v_actionnum) / minutes * 10) / 10, round(n(player.a_actionnum) / minutes * 10) / 10];
    },
    async calc_winner_apm(ctx, player, time) {
      player = parameterCopy(player);
      if (player.v_actionnum == null && player.actionnum == null) return ['-', '-'];
      if (player.v_actionnum == null && player.actionnum != null) player.v_actionnum = player.actionnum;
      if (player.a_actionnum == null) return ['-', '-'];
      const minutes = n(time) / 60;
      return [round(n(player.v_actionnum) / minutes * 10) / 10, round(n(player.a_actionnum) / minutes * 10) / 10];
    },
    async act(ctx) { await ctx.next(); await call(ctx, 'add_a_actionnum'); },
  },
};

export const openingModule = {
  name: 'opening', dependencies: ['sys', 'player'], optionalDependencies: ['corpse', 'skill1003'],
  templates: ['storyboard', 'storyboard_container', 'cmd_skip_op', 'storyboard_gt0', 'storyboard_gt1', 'storyboard_gt13', 'storyboard_gt18', 'storyboard_gt19'],
  state: () => ({ op_skip_word: '跳过剧情', ...structuredClone(openingConfig.values) }),
  functions: {
    async opening_by_shootings_available(ctx) { return present(ctx.state().opening_by_shootings) && ctx.state().opening_by_shootings_gametype.some(type => eq(type, ctx.state('sys').gametype)); },
    async act(ctx) {
      const player = ctx.state('player'), sys = ctx.state('sys');
      if (n(player.hp) > 0 && present(await ctx.call('skillbase', 'skill_query', 1003)) && !present(await ctx.call('skillbase', 'skill_getvalue', 1003, 'opening_skip'))) {
        if (!eq(sys.command, 'enter')) await ctx.call('skillbase', 'skill_setvalue', 1003, 'opening_skip', 1);
        else if (await call(ctx, 'opening_by_shootings_available')) appendLog(ctx, '<br><span class="grey b">点击以下任意按钮皆可跳过开场剧情。</span><br>');
      }
      await ctx.next();
    },
    async show_opening(ctx) {
      if (n(ctx.state('player').hp) > 0 && await call(ctx, 'opening_by_shootings_available') && present(await ctx.call('skillbase', 'skill_query', 1003)) && !present(await ctx.call('skillbase', 'skill_getvalue', 1003, 'opening_skip'))) {
        appendLog(ctx, ' ');
        const template = ctx.services.templates?.names?.MOD_OPENING_STORYBOARD_CONTAINER;
        if (typeof template !== 'string' || !template) throw new Error('Native opening requires MOD_OPENING_STORYBOARD_CONTAINER template binding.');
        ctx.state('player').main = template;
      }
    },
    async prepare_initial_response_content(ctx) { await ctx.next(); await call(ctx, 'show_opening'); },
    async prepare_response_content(ctx) { await ctx.next(); await call(ctx, 'show_opening'); },
  },
};
