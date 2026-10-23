import { number as n, text, present, isNumeric, round, appendLog, sameDurability } from './numbers.mjs';

const call = (ctx, fn, ...args) => ctx.call('weapon', fn, ...args);
const attack = (ctx, fn, ...args) => ctx.call('attack', fn, ...args);
const random = (ctx, min, max) => ctx.services.random.rand(min, max);

// Rules from base/weapon/weapon/main.php. All extension calls are awaited, so
// database-backed skills can participate without a second execution language.
export const weaponModule = {
  name: 'weapon',
  dependencies: ['sys', 'player', 'logger', 'itemmain', 'battle', 'attack', 'lvlctl', 'input'],
  state: () => ({
    nowep: '拳头', nosta: '∞', wep_equip_list: ['wep'],
    skilltypeinfo: { wp: '殴', wk: '斩', wg: '射', wc: '投', wd: '爆', wf: '灵' },
    attinfo: {}, attinfo2: {}, skillinfo: {}, counter_obbs: {}, rangeinfo: {}, hitrate_obbs: {},
    hitrate_max_obbs: {}, hitrate_r: {}, dmg_fluc: {}, skill_dmg: {}, wepimprate: {}, wepdeathstate: {},
  }),
  initialize(ctx) {
    const player = ctx.state('player'), equipment = ctx.state().wep_equip_list;
    player.equip_list = [...player.equip_list, ...equipment];
    player.battle_equip_list = [...player.battle_equip_list, ...equipment];
  },
  functions: {
    async parse_itmk_desc(ctx, kind, attributes) {
      let result = await ctx.next(kind, attributes);
      if (text(kind).startsWith('W')) {
        const state = ctx.state();
        result = text(result) + `攻击方式为${state.attinfo[kind[1]]}，依赖${state.skilltypeinfo[state.skillinfo[kind[1]]]}熟`;
      }
      return result;
    },
    async parse_item_words(ctx, data, simple = 0, ellipsis = 0) {
      const result = await ctx.next(structuredClone(data), simple, ellipsis);
      if (!/[GJB]/.test(data.wepk)) {
        if (isNumeric(data.weps)) {
          if (data.weps <= 3) result.weps_words = `<span class="red b">${result.weps_words}</span>`;
          else if (data.weps <= 6) result.weps_words = `<span class="yellow b">${result.weps_words}</span>`;
        }
      } else if (sameDurability(ctx.state().nosta, data.weps)) result.weps_words = `<span class="red b">${result.weps_words}</span>`;
      return result;
    },
    async get_internal_att(ctx, pa) { return pa.att; },
    async get_external_att(ctx, pa) { return n(pa.wepe) * 2; },
    async get_att_base(ctx, pa, pd, active) {
      const internal = await call(ctx, 'get_internal_att', pa, pd, active);
      const external = await call(ctx, 'get_external_att', pa, pd, active);
      pa.att_words = await attack(ctx, 'add_format', external, internal, 0);
      return n(internal) + n(external);
    },
    async get_att_multiplier(ctx, pa) { pa.att_m_words ??= ''; return []; },
    async get_att_change(ctx, pa, pd, active, value) { return value; },
    async get_att(ctx, pa, pd, active) {
      const base = await call(ctx, 'get_att_base', pa, pd, active);
      const multipliers = await call(ctx, 'get_att_multiplier', pa, pd, active);
      const [value, , expression] = await attack(ctx, 'apply_multiplier', base, multipliers, null, pa.att_words);
      pa.att_m_words = expression;
      return call(ctx, 'get_att_change', pa, pd, active, value);
    },
    async get_internal_def(ctx, pa, pd) { return pd.def; },
    async get_def_base(ctx, pa, pd, active) {
      pd.internal_def = await call(ctx, 'get_internal_def', pa, pd, active);
      pd.def_words = pd.internal_def;
      return pd.internal_def;
    },
    async get_def_multiplier(ctx, pa, pd) { pd.def_m_words ??= ''; return []; },
    async get_def_change(ctx, pa, pd, active, value) { return value; },
    async get_def(ctx, pa, pd, active) {
      const base = await call(ctx, 'get_def_base', pa, pd, active);
      const multipliers = await call(ctx, 'get_def_multiplier', pa, pd, active);
      const [value, , expression] = await attack(ctx, 'apply_multiplier', base, multipliers, null, pd.def_words);
      pd.def_m_words = expression;
      return call(ctx, 'get_def_change', pa, pd, active, value);
    },
    async get_skill_by_kind(ctx, pa, pd, active, kind) { return pa[kind]; },
    async get_skill(ctx, pa, pd, active) {
      const kind = await call(ctx, 'get_skillkind', pa, pd, active);
      return call(ctx, 'get_skill_by_kind', pa, pd, active, kind.slice(0, 2));
    },
    async get_skillkind(ctx, pa, pd, active) {
      const kind = present(pa.wep_kind) ? pa.wep_kind : await call(ctx, 'get_attack_method', pa);
      return ctx.state().skillinfo[kind];
    },
    async get_attack_method(ctx, player) { return text(player.wepk).slice(1, 2); },
    async check_attack_method(ctx, player, kind) { return await call(ctx, 'get_attack_method', player) === kind; },
    async load_user_combat_command(ctx, player) {
      const command = ctx.state('sys').command;
      player.wep_kind = await call(ctx, 'check_attack_method', player, command) ? command : await call(ctx, 'get_attack_method', player);
      await ctx.next(player);
    },
    async load_auto_combat_command(ctx, player) {
      player.wep_kind = await call(ctx, 'get_attack_method', player);
      player.bskill = player.bskillpara = '';
      await ctx.next(player);
    },
    async get_hitrate_base(ctx, pa) {
      const config = ctx.state(), kind = pa.wep_kind;
      return Math.min(n(config.hitrate_obbs[kind]) + round(n(pa.fin_skill) * n(config.hitrate_r[kind])), n(config.hitrate_max_obbs[kind]));
    },
    async get_hitrate_multiplier() { return 1; },
    async get_hitrate_change(ctx, pa, pd, active, value) { return value; },
    async get_hitrate(ctx, pa, pd, active) {
      const base = await call(ctx, 'get_hitrate_base', pa, pd, active);
      const multiplier = await call(ctx, 'get_hitrate_multiplier', pa, pd, active);
      return call(ctx, 'get_hitrate_change', pa, pd, active, n(base) * n(multiplier));
    },
    async get_weapon_fluc_max_range(ctx, pa) { return ctx.state().dmg_fluc[pa.wep_kind]; },
    async get_weapon_fluc_percentage(ctx, pa, pd, active) {
      const range = Math.min(99, n(await call(ctx, 'get_weapon_fluc_max_range', pa, pd, active)));
      return random(ctx, -range, range);
    },
    async get_primary_dmg(ctx, pa, pd, active) {
      pa.fin_att = await call(ctx, 'get_att', pa, pd, active);
      pd.fin_def = await call(ctx, 'get_def', pa, pd, active);
      const defense = pd.fin_def <= 0 ? 1 : n(pd.fin_def);
      let damage = n(pa.fin_att) / defense * n(pa.fin_skill) * n(ctx.state().skill_dmg[pa.wep_kind]);
      const fluctuation = await call(ctx, 'get_weapon_fluc_percentage', pa, pd, active);
      damage = Math.max(1, round(damage * ((100 + n(fluctuation)) / 100) * random(ctx, 4, 10) / 10));
      pa.mult_words_pridmgbs = damage;
      const fixed = await call(ctx, 'get_primary_fixed_dmg', pa, pd, active);
      if (present(fixed)) {
        damage += n(fixed);
        pa.mult_words_pridmgbs = await attack(ctx, 'add_format', pa.mult_words_pridmgfxdbs, pa.mult_words_pridmgbs);
      }
      return damage;
    },
    async get_primary_fixed_dmg(ctx, pa, pd, active) {
      pa.mult_words_pridmgfxdbs = '';
      const base = await call(ctx, 'get_primary_fixed_dmg_base', pa, pd, active);
      if (!present(base)) return 0;
      const multipliers = await call(ctx, 'get_primary_fixed_dmg_multiplier', pa, pd, active);
      const [damage, , expression] = await attack(ctx, 'apply_multiplier', base, multipliers, '', pa.mult_words_pridmgfxdbs);
      pa.mult_words_pridmgfxdbs = expression;
      return damage;
    },
    async get_primary_fixed_dmg_base() { return 0; },
    async get_primary_fixed_dmg_multiplier() { return []; },
    async get_primary_dmg_multiplier() { return []; },
    async get_fixed_dmg() { return 0; },
    async get_fixed_dmg_multiplier() { return []; },
    async get_physical_dmg(ctx, pa, pd, active) {
      const base = await call(ctx, 'get_primary_dmg', pa, pd, active);
      const multipliers = await call(ctx, 'get_primary_dmg_multiplier', pa, pd, active);
      const [primary, , primaryExpression] = await attack(ctx, 'apply_multiplier', base, multipliers, '<:primary_dmg:>', pa.mult_words_pridmgbs);
      let fixed = await call(ctx, 'get_fixed_dmg', pa, pd, active), fixedExpression;
      if (fixed > 0) {
        const multipliers = await call(ctx, 'get_fixed_dmg_multiplier', pa, pd, active);
        [fixed, , fixedExpression] = await attack(ctx, 'apply_multiplier', fixed, multipliers, 'yellow b');
      }
      pa.mult_words_phydmgbs = present(fixedExpression) ? `${primaryExpression}+${fixedExpression}` : primaryExpression;
      return round(n(primary) + n(fixed));
    },
    async get_physical_dmg_multiplier() { return []; },
    async get_physical_dmg_change(ctx, pa, pd, active, value) { return value; },
    async calculate_physical_dmg(ctx, pa, pd, active) {
      // Multiplier hook runs BEFORE primary damage (some skills depend on this).
      const multipliers = await call(ctx, 'get_physical_dmg_multiplier', pa, pd, active);
      const base = await call(ctx, 'get_physical_dmg', pa, pd, active);
      let [damage, , expression] = await attack(ctx, 'apply_multiplier', base, multipliers, '<:fin_dmg:>', pa.mult_words_phydmgbs);
      expression = await attack(ctx, 'equalsign_format', damage, expression, '<:fin_dmg:>');
      appendLog(ctx, `造成了${expression}点物理伤害！<br>`);
      let color = 'red b';
      const changed = await call(ctx, 'get_physical_dmg_change', pa, pd, active, damage);
      if (n(changed) !== n(damage)) {
        damage = changed;
        appendLog(ctx, `总物理伤害：<span class="red b">${damage}</span>。<br>`);
        color = 'yellow b';
      }
      ctx.state('logger').log = text(ctx.state('logger').log).replaceAll('<:fin_dmg:>', color);
      pa.physical_dmg_dealt = n(pa.physical_dmg_dealt) + n(damage);
      pa.dmg_dealt = n(pa.dmg_dealt) + n(damage);
      pa.mult_words_fdmgbs = await attack(ctx, 'add_format', damage, pa.mult_words_fdmgbs);
      return damage;
    },
    async calculate_wepimp_rate(ctx, pa) { return ctx.state().wepimprate[pa.wep_kind]; },
    async calculate_wepimp(ctx, pa, pd, active, hit) {
      const rate = await call(ctx, 'calculate_wepimp_rate', pa, pd, active);
      if (!hit && rate < 1000) return;
      if (random(ctx, 0, 99) < rate) pa.wepimp = n(pa.wepimp) + 1;
    },
    async post_weapon_strike_events(ctx, pa, pd, active, hit) { await call(ctx, 'calculate_wepimp', pa, pd, active, hit); },
    async weapon_strike(ctx, pa, pd, active) {
      const hit = random(ctx, 0, 99) < pa.fin_hitrate ? 1 : 0;
      if (hit) await call(ctx, 'calculate_physical_dmg', pa, pd, active);
      else appendLog(ctx, '但是没有击中！<br>');
      pa.is_hit = hit;
      await call(ctx, 'post_weapon_strike_events', pa, pd, active, hit);
    },
    async strike(ctx, pa, pd, active) { await call(ctx, 'weapon_strike', pa, pd, active); },
    async strike_prepare(ctx, pa, pd, active) {
      appendLog(ctx, await call(ctx, 'get_attackwords', pa, pd, active));
      pd.deathmark = ctx.state().wepdeathstate[pa.wep_kind];
      pa.attackwith = pa.wep;
      pa.fin_skill = await call(ctx, 'get_skill', pa, pd, active);
      pa.fin_hitrate = await call(ctx, 'get_hitrate', pa, pd, active);
      await ctx.next(pa, pd, active);
    },
    async get_attackwords(ctx, pa, pd, active) {
      const config = ctx.state(), words = config.attinfo2[pa.wep_kind] ?? config.attinfo[pa.wep_kind];
      return active ? `使用${pa.wep}<span class="yellow b">${words}</span>${pd.name}！<br>`
        : `${pa.name}使用${pa.wep}<span class="yellow b">${words}</span>你！<br>`;
    },
    async weapon_break(ctx, pa, pd, active) {
      const owner = active ? '你' : pa.name;
      const ending = ctx.state().wepimprate[pa.wep_kind] < 1000 ? '使用过度，已经损坏，无法再装备了！<br>' : '用光了！<br>';
      appendLog(ctx, `${owner}的<span class="red b">${pa.wep}</span>${ending}`);
      await ctx.call('itemmain', 'item_destroy_core', 'wep', pa);
    },
    async apply_weapon_imp(ctx, pa, pd, active) {
      if (present(pa.wepimp) && !sameDurability(pa.weps, ctx.state().nosta)) {
        pa.weps = n(pa.weps) - n(pa.wepimp);
        const owner = active ? '你' : pa.name;
        appendLog(ctx, ctx.state().wepimprate[pa.wep_kind] < 1000
          ? `${owner}的${pa.wep}的耐久度下降了${pa.wepimp}！<br>`
          : `${owner}用掉了${pa.wepimp}个${pa.wep}。<br>`);
        if (pa.weps <= 0) await call(ctx, 'weapon_break', pa, pd, active);
      }
    },
    async calculate_attack_weapon_skill_gain(ctx, pa, pd, active) {
      const base = await call(ctx, 'calculate_attack_weapon_skill_gain_base', pa, pd, active);
      const multiplier = await call(ctx, 'calculate_attack_weapon_skill_gain_multiplier', pa, pd, active);
      return call(ctx, 'calculate_attack_weapon_skill_gain_change', pa, pd, active, n(base) * n(multiplier));
    },
    async calculate_attack_weapon_skill_gain_base() { return 1; },
    async calculate_attack_weapon_skill_gain_multiplier() { return 1; },
    async calculate_attack_weapon_skill_gain_change(ctx, pa, pd, active, value) { return value; },
    async apply_weapon_skill_gain(ctx, pa, pd, active, value) {
      const field = ctx.state().skillinfo[pa.wep_kind];
      pa[field] = n(pa[field]) + n(value);
    },
    async calculate_attack_exp_gain_base(ctx, pa, pd, active, fixed = 0) {
      if (present(fixed)) return fixed;
      const defender = await call(ctx, 'calculate_attack_lvl', pd);
      const attacker = await call(ctx, 'calculate_attack_lvl', pa);
      return Math.max(1, round((n(defender) - n(attacker)) / 3));
    },
    async calculate_attack_lvl(ctx, player) { return player.lvl; },
    async calculate_attack_exp_gain_multiplier() { return 1; },
    async calculate_attack_exp_gain_change(ctx, pa, pd, active, value) { return value; },
    async calculate_attack_exp_gain(ctx, pa, pd, active, fixed = 0) {
      const base = await call(ctx, 'calculate_attack_exp_gain_base', pa, pd, active, fixed);
      const multiplier = await call(ctx, 'calculate_attack_exp_gain_multiplier', pa, pd, active);
      return call(ctx, 'calculate_attack_exp_gain_change', pa, pd, active, n(base) * n(multiplier));
    },
    async apply_attack_exp_gain(ctx, pa, pd, active) {
      if (present(pa.hp)) await ctx.call('lvlctl', 'getexp', await call(ctx, 'calculate_attack_exp_gain', pa, pd, active), pa);
    },
    async strike_finish(ctx, pa, pd, active) {
      await call(ctx, 'apply_weapon_imp', pa, pd, active);
      delete pa.wepimp;
      await call(ctx, 'apply_weapon_skill_gain', pa, pd, active, await call(ctx, 'calculate_attack_weapon_skill_gain', pa, pd, active));
      await ctx.next(pa, pd, active);
    },
    async attack_prepare(ctx, pa, pd, active) { pa.o_wep = pa.wep; pd.o_wep = pd.wep; await ctx.next(pa, pd, active); },
    async attack_finish(ctx, pa, pd, active) {
      const gained = pa.physical_dmg_dealt > 0;
      await ctx.next(pa, pd, active);
      if (gained) await call(ctx, 'apply_attack_exp_gain', pa, pd, active);
    },
    async calculate_counter_rate(ctx, pa, pd, active) {
      const base = await call(ctx, 'calculate_counter_rate_base', pa, pd, active);
      const multiplier = await call(ctx, 'calculate_counter_rate_multiplier', pa, pd, active);
      return call(ctx, 'calculate_counter_rate_change', pa, pd, active, n(base) * n(multiplier));
    },
    async calculate_counter_rate_base(ctx, pa) { return ctx.state().counter_obbs[pa.wep_kind]; },
    async calculate_counter_rate_multiplier() { return 1; },
    async calculate_counter_rate_change(ctx, pa, pd, active, value) { return value; },
    async check_counter_dice(ctx, pa, pd, active) {
      const rate = await call(ctx, 'calculate_counter_rate', pa, pd, active);
      return random(ctx, 0, 99) < rate ? 1 : 0;
    },
    async get_weapon_range(ctx, pa, active) {
      const kind = pa.wep_kind ?? await call(ctx, 'get_attack_method', pa);
      return ctx.state().rangeinfo[kind];
    },
    async check_counterable_by_weapon_range(ctx, pa, pd, active) {
      pa.wep_kind = await call(ctx, 'get_attack_method', pa);
      const defender = n(await call(ctx, 'get_weapon_range', pa, active));
      const attacker = n(await call(ctx, 'get_weapon_range', pd, 1 - active));
      return defender >= attacker && defender !== 0 && attacker !== 0 ? 1 : 0;
    },
    async check_can_counter(ctx, pa, pd, active) {
      if (await call(ctx, 'check_counterable_by_weapon_range', pa, pd, active)) {
        if (!await ctx.next(pa, pd, active)) return 0;
        return call(ctx, 'check_counter_dice', pa, pd, active);
      }
      pa.out_of_range = 1;
      return 0;
    },
    async itemuse(ctx, item) {
      if (!text(item.itmk).startsWith('W')) return ctx.next(item);
      const player = ctx.state('player');
      const fields = ['', 'k', 'e', 's', 'sk'];
      if (text(player.wepk).startsWith('WN') || !present(player.weps)) {
        for (const suffix of fields) player[`wep${suffix}`] = item[`itm${suffix}`];
        appendLog(ctx, `装备了<span class="yellow b">${item.itm}</span>。<br>`);
        item.itm = item.itmk = item.itmsk = ''; item.itme = item.itms = 0;
      } else {
        for (const suffix of fields) [player[`wep${suffix}`], item[`itm${suffix}`]] = [item[`itm${suffix}`], player[`wep${suffix}`]];
        appendLog(ctx, `卸下了<span class="red b">${item.itm}</span>，装备了<span class="yellow b">${player.wep}</span>。<br>`);
      }
    },
  },
};
