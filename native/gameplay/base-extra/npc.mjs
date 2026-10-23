import { isReferenceDescriptor } from '../../templates/values.mjs';
import { number as n, text, present, appendLog } from '../numbers.mjs';
import { call, eq } from './helpers.mjs';
import config from './npc-config.json' with { type: 'json' };
import chatConfig from './npcchat-config.json' with { type: 'json' };

const entries = value => value instanceof Map ? [...value] : Object.entries(value ?? {});
const lookup = (value, key) => value instanceof Map ? value.get(key) ?? value.get(text(key)) : value?.[key];
const populated = value => present(value) && (typeof value !== 'object' || entries(value).length > 0);
function parameterCopy(value) {
  const result = structuredClone(value);
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) if (isReferenceDescriptor(descriptor)) Object.defineProperty(result, key, descriptor);
  return result;
}
function database(ctx) { if (!ctx.services.database) throw new Error('Native npc requires services.database.'); return ctx.services.database; }
function pick(ctx, values) {
  // Map-safe lists are packed PHP arrays with possible holes. Associative
  // chat resources use their insertion order; single selection is uniform.
  if (Array.isArray(values)) return values[ctx.services.random.arrayRandPacked(values)];
  const list = entries(values); return list[ctx.services.random.arrayRand(list)][1];
}
function merge(...records) { return Object.assign({}, ...records); }

export const npcModule = {
  name: 'npc', dependencies: ['sys', 'map', 'player', 'lvlctl'], optionalDependencies: [], templates: [], state: () => config.values,
  initialize(ctx) {
    const player = ctx.state('player'), npc = ctx.state();
    for (const [field, source] of [['typeinfo', 'npc_typeinfo'], ['killmsginfo', 'npc_killmsginfo'], ['lwinfo', 'npc_lwinfo']]) for (const [key, value] of entries(npc[source])) if (player[field][key] === undefined) player[field][key] = structuredClone(value);
  },
  functions: {
    async check_initnpcadd() { return 1; },
    async init_npcdata(ctx, input, suppliedAreas = []) {
      let npc = parameterCopy(input), areas = suppliedAreas;
      if (!populated(areas)) areas = await ctx.call('map', 'get_safe_plslist');
      npc.endtime = ctx.state('sys').now; npc.hp = npc.mhp ?? null; npc.sp = npc.msp ?? null;
      if (present(npc.mss)) npc.ss = npc.mss;
      npc.exp = await ctx.call('lvlctl', 'calc_upexp', n(npc.lvl) - 1);
      if (npc.skill != null && typeof npc.skill === 'object') npc = merge(npc, Object.fromEntries(entries(npc.skill)));
      else for (const field of ['wp', 'wk', 'wg', 'wc', 'wd', 'wf']) npc[field] = npc.skill ?? null;
      if (eq(npc.gd, 'r')) npc.gd = ctx.services.random.rand(0, 1) ? 'm' : 'f';
      if (eq(npc.pls, 99)) npc.pls = populated(areas) ? pick(ctx, areas) : 0;
      if (npc.state == null) npc.state = 1;
      return npc;
    },
    async get_safe_plslist(ctx, noDangerousZone = true, type = 0) {
      const result = await ctx.next(noDangerousZone, type);
      if (!present(noDangerousZone) || !eq(type, 1)) return result;
      const filtered = parameterCopy(result);
      for (const [key, value] of entries(filtered)) if ([21, 26, 33].some(area => text(area) === text(value))) { if (filtered instanceof Map) filtered.delete(key); else delete filtered[key]; }
      return filtered;
    },
    async rs_game(ctx, mode = 0) {
      await ctx.next(mode); ctx.state('skillbase'); if (!(n(mode) & 8)) return;
      const state = ctx.state(), sys = ctx.state('sys'); await database(ctx).execute(`DELETE FROM ${sys.tablepre}players WHERE type>0 `);
      const definitions = await call(ctx, 'get_npclist'), areas = await ctx.call('map', 'get_safe_plslist'), importantAreas = await ctx.call('map', 'get_safe_plslist', 1, 1);
      for (const [rawType, original] of entries(definitions)) {
        const type = /^-?(?:0|[1-9]\d*)$/.test(text(rawType)) ? Number(rawType) : rawType;
        if (!populated(original) || !present(await call(ctx, 'check_initnpcadd', type))) continue;
        const definition = parameterCopy(original), sub = populated(definition.sub) ? definition.sub : [];
        if (populated(sub)) delete definition.sub;
        const keys = entries(sub).map(([key]) => /^-?(?:0|[1-9]\d*)$/.test(text(key)) ? Number(key) : key);
        let selected = [...keys];
        if (!keys.length || !present(definition.num)) selected = [];
        else if (keys.length > n(definition.num)) {
          const indices = ctx.services.random.arrayRandPacked(keys, n(definition.num));
          // The original array_randompick(...,1) returns a scalar; PHP sort /
          // foreach then produce no additions. The shipped catalog avoids it.
          selected = Array.isArray(indices) ? indices.map(index => keys[index]) : [];
        } else if (keys.length < n(definition.num)) while (selected.length < n(definition.num)) selected.push(...keys);
        selected.sort((left, right) => n(left) - n(right));
        for (const index of selected) {
          let npc = merge(state.npcinit, definition, lookup(sub, index)); npc.type = type; npc.sNo = index;
          npc = await call(ctx, 'init_npcdata', npc, eq(type, 14) ? importantAreas : areas);
          npc = await ctx.call('player', 'player_format_with_db_structure', npc);
          await database(ctx).arrayInsert(`${sys.tablepre}players`, npc);
        }
      }
    },
    async get_npclist(ctx) { return parameterCopy(ctx.state().npcinfo); },
    async addarea_pc_process_single(ctx, input, time) {
      const sub = parameterCopy(input); await ctx.next(parameterCopy(sub), time);
      const original = parameterCopy(sub), areas = await ctx.call('map', 'get_safe_plslist'), importantAreas = await ctx.call('map', 'get_safe_plslist', 1, 1);
      if (present(sub.type) && !ctx.state().killzone_resistant_typelist.some(type => eq(type, sub.type)) && populated(areas)) {
        sub.pls = pick(ctx, eq(sub.type, 14) ? importantAreas : areas);
        await database(ctx).arrayUpdate(`${ctx.state('sys').tablepre}players`, sub, `pid='${text(sub.pid)}'`, original);
        await ctx.call('player', 'post_pc_avoid_killarea', sub, time);
      }
    },
    async get_player_killmsg(ctx, player) {
      if (n(player.type) <= 0) return await ctx.next(player);
      const messages = ctx.state('player').killmsginfo[player.type];
      return messages == null ? '' : typeof messages === 'object' ? lookup(messages, player.name) ?? null : messages;
    },
    async get_player_lastword(ctx, player) {
      if (n(player.type) <= 0) return await ctx.next(player);
      const revived = ctx.state().npc_revive_info[player.type], last = ctx.state('player').lwinfo[player.type];
      if (n(player.hp) > 0) { if (revived != null && typeof revived === 'object') { if (lookup(revived, player.name) != null) return lookup(revived, player.name); } else if (revived != null) return revived; }
      return last != null && typeof last === 'object' ? lookup(last, player.name) ?? '' : last ?? '';
    },
  },
};

export const npcchatModule = {
  name: 'npcchat', dependencies: ['sys', 'player', 'battle', 'attack', 'logger', 'npc'], optionalDependencies: [], templates: [], state: () => chatConfig.values,
  functions: {
    async npcchat(ctx, pa, pd, active, situation, print = 1) {
      const state = ctx.state(); if (!present(state.npcchaton) || (!present(pa.type) && !present(pd.type))) return;
      const attacker = present(pa.type), owner = attacker ? pa : pd, group = lookup(state.npcchat, owner.type); if (group == null) return;
      const chat = lookup(group, owner.name) ?? group, [tag, id] = await call(ctx, 'npcchat_tag_process', pa, pd, active, situation, attacker ? 1 : 0, parameterCopy(chat));
      const message = await call(ctx, 'npcchat_get_chatlog', tag, id, parameterCopy(chat)); if (message == null) return;
      if (present(print)) await call(ctx, 'npcchat_print', await call(ctx, 'npcchat_decorate', message, parameterCopy(chat), tag));
      return message;
    },
    async npcchat_print(ctx, message) { appendLog(ctx, text(message)); },
    async npcchat_decorate(ctx, message, chat, tag) { return (present(chat.color) ? `<span class = "${text(chat.color)}">` : '<span>') + text(message) + '</span><br>' + (eq(tag, 'kill') || eq(tag, 'retreat') ? '<br>' : ''); },
    async npcchat_get_chatlog(ctx, tag, id, chat) { const message = lookup(chat, tag); return message != null ? typeof message === 'object' ? pick(ctx, message) : message : lookup(chat, id) ?? null; },
    async npcchat_tag_process(ctx, pa, pd, active, situation, npcActive, chat) {
      let id = -1, tag = '';
      if (eq(situation, 'meet')) { id = 0; tag = 'meet'; if (present(pa.type) && eq(pa.state, 1)) pa.state = 0; else if (present(pd.type) && eq(pd.state, 1)) pd.state = 0; }
      else if (eq(situation, 'battle')) {
        if (present(npcActive)) { if (n(pa.hp) >= n(pa.mhp) / 2) { id = present(pa.is_counter) ? 2 : 1; tag = present(pa.is_counter) ? 'counterfine' : 'attackfine'; } else { id = ctx.services.random.rand(3, 4); tag = present(pa.is_counter) ? 'counterhurt' : 'attackhurt'; } }
        else if (n(pd.hp) >= n(pd.mhp) / 2) { id = ctx.services.random.rand(5, 6); tag = 'defendfine'; } else { id = ctx.services.random.rand(7, 8); tag = 'defendhurt'; }
      } else if (eq(situation, 'cannot_counter') && present(npcActive)) { id = 10; tag = 'cannot_counter'; }
      else if (eq(situation, 'out_of_range') && present(npcActive)) { id = 11; tag = 'out_of_range'; }
      else if (eq(situation, 'kill')) { if (present(npcActive)) { id = 13; tag = 'kill'; pa.npcchat_kill = 1; } else { id = 9; tag = n(pd.hp) > 0 && populated(chat.revive) ? 'revive' : 'retreat'; } }
      else if (eq(situation, 'critical')) { id = 12; tag = 'critical'; }
      else if (eq(situation, 'addnpc')) { id = 15; tag = 'addnpc'; }
      return [tag, id];
    },
    async battle_prepare(ctx, pa, pd, active) { if (present(pa.type) && eq(pa.state, 1)) await call(ctx, 'npcchat', pa, pd, active, 'meet'); await ctx.next(pa, pd, active); },
    async attack_prepare(ctx, pa, pd, active) { await ctx.next(pa, pd, active); if (present(pa.type)) await call(ctx, 'npcchat', pa, pd, active, 'battle'); },
    async attack_finish(ctx, pa, pd, active) { await ctx.next(pa, pd, active); if (!present(pd.npc_evolved) && !present(pd.npc_revived) && !(!present(pa.dmg_dealt) && n(pa.dmg_dealt) <= 0) && present(pd.type) && n(pd.hp) > 0) await call(ctx, 'npcchat', pa, pd, active, 'battle'); },
    async cannot_counter(ctx, pa, pd, active) { if (present(pa.type)) await call(ctx, 'npcchat', pa, pd, active, pa.out_of_range != null ? 'out_of_range' : 'cannot_counter'); await ctx.next(pa, pd, active); },
    async player_kill_enemy(ctx, pa, pd, active) { await ctx.next(pa, pd, active); if (present(pa.type) || present(pd.type)) await call(ctx, 'npcchat', pa, pd, active, 'kill'); },
    async show_player_killwords(ctx, pa, pd, active, message) { if (present(pa.type) && populated(await call(ctx, 'npcchat', pa, pd, active, 'kill', 0))) return; await ctx.next(pa, pd, active, message); },
    // The source only imports player here; its local $npcchat is unset, so
    // the named-NPC suppression condition is always false.
    async get_player_killmsg(ctx, player) { return await ctx.next(player); },
    async apply_total_damage_modifier_seckill(ctx, pa, pd, active) { await ctx.next(pa, pd, active); if ((present(pa.type) && present(pa.seckill)) || (present(pd.type) && present(pd.seckill))) await call(ctx, 'npcchat', pa, pd, active, 'critical'); },
  },
};
