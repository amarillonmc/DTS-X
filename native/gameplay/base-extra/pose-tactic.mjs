import { number as n, text, present, appendLog, round } from '../numbers.mjs';
import { call, eq, integer } from './helpers.mjs';
import poseConfig from './pose-config.json' with { type: 'json' };
import tacticConfig from './tactic-config.json' with { type: 'json' };

export const poseModule = {
  name: 'pose', dependencies: ['sys', 'player', 'logger'], optionalDependencies: ['trap', 'metman', 'weapon', 'battle', 'itemmain', 'enemy', 'rest', 'edible'],
  templates: ['enemy_pose', 'pose_profile', 'pose_profile_cmd'], state: () => structuredClone(poseConfig.values),
  functions: {
    async calculate_real_trap_obbs(ctx) { const pose = ctx.state('player').pose, add = eq(pose, 1) ? 1 : eq(pose, 3) ? 3 : 0; return add + n(await ctx.next()); },
    async pose_change(ctx, value) { const pose = integer(value), state = ctx.state(); if (present(state.pose_player_usable[pose])) { appendLog(ctx, `基础姿态变为<span class="yellow b">${text(state.poseinfo[pose])}</span>。<br> `); ctx.state('player').pose = pose; } else appendLog(ctx, '这个姿势太奇怪啦！<br> '); },
    async init_battle(ctx, isMeet = 0) { await ctx.next(isMeet); const state = ctx.state('metman'); state.tdata.pose = state.w_pose; },
    async calculate_meetman_rate(ctx, mode) { const pose = ctx.state('player').pose, state = ctx.state(), add = n(state.pose_findman_obbs[pose]) - n(state.pose_itemfind_obbs[pose]); return n(await ctx.next(mode)) + add; },
    async check_can_counter(ctx, pa, pd, active) { return eq(pa.pose, 5) ? 0 : await ctx.next(pa, pd, active); },
    async calculate_itemfind_obbs(ctx) { const result = await ctx.next(); return n(result) + n(ctx.state().pose_itemfind_obbs[ctx.state('player').pose]); },
    async calculate_hide_obbs(ctx, enemy) { const result = await ctx.next(enemy); return n(result) + n(ctx.state().pose_hide_obbs[enemy.pose]); },
    async calculate_findman_obbs(ctx, enemy) { const result = await ctx.next(enemy); return n(result) + n(ctx.state().pose_findman_obbs[ctx.state('player').pose]); },
    async calculate_active_obbs(ctx, pa, pd) { const state = ctx.state(), add = n(state.pose_active_obbs[pa.pose]) + n(state.pose_dactive_obbs[pd.pose]); pa.active_words = await ctx.call('attack', 'add_format', add, pa.active_words, 0); return n(await ctx.next(pa, pd)) + add; },
    async get_att_multiplier(ctx, pa, pd, active) { const result = await ctx.next(pa, pd, active); return [1 + n(ctx.state().pose_attack_modifier[pa.pose]) / 100, ...result]; },
    async get_def_multiplier(ctx, pa, pd, active) { const result = await ctx.next(pa, pd, active); return [1 + n(ctx.state().pose_defend_modifier[pd.pose]) / 100, ...result]; },
    async calculate_rest_upsp(ctx, time) { const healing = eq(ctx.state('player').pose, 5), result = await ctx.next(time); return healing ? n(result) * 3 : result; },
    async calculate_rest_uphp(ctx, time) { const healing = eq(ctx.state('player').pose, 5), result = await ctx.next(time); return healing ? n(result) * 3 : result; },
    async get_wound_recover_time(ctx) { const healing = eq(ctx.state('player').pose, 5), result = await ctx.next(); return healing ? n(result) - 30 : result; },
    async get_edible_hpup(ctx, item) { const modifier = (100 + n(ctx.state().pose_edible_modifier[ctx.state('player').pose])) / 100; return round(n(await ctx.next(item)) * modifier); },
    async get_edible_spup(ctx, item) { const modifier = (100 + n(ctx.state().pose_edible_modifier[ctx.state('player').pose])) / 100; return round(n(await ctx.next(item)) * modifier); },
    async can_continue_post_discover_player(ctx, result) { const player = ctx.state('player'); return !present(result) && n(player.hp) > 0 && eq(player.pose, 3) ? true : await ctx.next(result); },
    async act(ctx) { const sys = ctx.state('sys'); if (eq(sys.mode, 'special') && text(sys.command).startsWith('pose')) { await call(ctx, 'pose_change', text(sys.command).slice(4, 5)); sys.mode = 'command'; return; } await ctx.next(); },
  },
};

export const tacticModule = {
  name: 'tactic', dependencies: ['sys', 'player', 'logger'], optionalDependencies: ['metman', 'battle', 'weapon', 'trap', 'enemy', 'pose'],
  templates: ['enemy_tactic', 'tactic_profile', 'tactic_profile_cmd'], state: () => structuredClone(tacticConfig.values),
  functions: {
    async init_battle(ctx, isMeet = 0) { await ctx.next(isMeet); const state = ctx.state('metman'); state.tdata.tactic = state.w_tactic; },
    async check_can_counter(ctx, pa, pd, active) { return eq(pa.tactic, 4) ? 0 : await ctx.next(pa, pd, active); },
    async calculate_meetman_rate(ctx, mode) { const add = ctx.state().tactic_meetman_obbs[ctx.state('player').tactic]; return n(await ctx.next(mode)) + n(add); },
    async calculate_findman_obbs(ctx, enemy) { const result = await ctx.next(enemy); return n(result) + n(ctx.state().tactic_meetman_obbs[ctx.state('player').tactic]); },
    async calculate_hide_obbs(ctx, enemy) { const result = await ctx.next(enemy); return n(result) + n(ctx.state().tactic_hide_obbs[enemy.tactic]); },
    async calculate_counter_rate_base(ctx, pa, pd, active) { const add = eq(pa.tactic, 3) ? 30 : 0; return n(await ctx.next(pa, pd, active)) + add; },
    async get_att_multiplier(ctx, pa, pd, active) { const result = await ctx.next(pa, pd, active); return [1 + n(ctx.state().tactic_attack_modifier[pa.tactic]) / 100, ...result]; },
    async get_def_multiplier(ctx, pa, pd, active) { const result = await ctx.next(pa, pd, active); return [1 + n(ctx.state().tactic_defend_modifier[pd.tactic]) / 100, ...result]; },
    async get_trap_damage(ctx) { const result = await ctx.next(); return eq(ctx.state('player').tactic, 2) && ctx.services.random.rand(0, 99) < 75 ? round(n(result) * 0.75) : result; },
    async get_trap_escape_rate(ctx) { const evasive = eq(ctx.state('player').tactic, 4), result = await ctx.next(); return evasive ? n(result) + 20 : result; },
    async tactic_change(ctx, value) { const tactic = integer(value), state = ctx.state(); if (present(state.tactic_player_usable[tactic])) { appendLog(ctx, `应战策略变为<span class="yellow b">${text(state.tacinfo[tactic])}</span>。<br> `); ctx.state('player').tactic = tactic; } else appendLog(ctx, '这是什么奇怪的应战策略啦！<br> '); },
    async act(ctx) { const sys = ctx.state('sys'); if (eq(sys.mode, 'special') && text(sys.command).startsWith('tac')) { await call(ctx, 'tactic_change', text(sys.command).slice(3, 4)); sys.mode = 'command'; return; } await ctx.next(); },
    async check_pc_avoid_killarea(ctx, data, time) { if (n(ctx.state('sys').gamestate) < 40 && eq(data.tactic, 4)) return true; await ctx.next(structuredClone(data), time); },
    async post_pc_avoid_killarea(ctx, data, time) { data = structuredClone(data); if (!present(data.type)) { const sys = ctx.state('sys'); await ctx.call('logger', 'logsave', data.pid, sys.now, `<span class="yellow b">为了躲避禁区，你及时移动到了${text(ctx.state('map').plsinfo[data.pls])}</span><br>`, 's'); } await ctx.next(data, time); },
  },
};
