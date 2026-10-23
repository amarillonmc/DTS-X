import { number as n, text, present, isNumeric, round, appendLog } from './numbers.mjs';
import { reference } from '../modules/registry.mjs';

// Native implementation of base/attack/{attack,attack_wrapper,attack_news}.php.
// Keep hook names stable: skills use these extension points and their order.
const call = (ctx, fn, ...args) => ctx.call('attack', fn, ...args);
const noop = () => null;

export const attackModule = {
  name: 'attack',
  dependencies: ['sys', 'map', 'player', 'battle'],
  functions: {
    async strike_prepare(ctx, pa, pd) { delete pa.seckill; delete pd.seckill; },
    strike: noop,
    strike_finish: noop,
    async attack(ctx, pa, pd, active) {
      for (const fn of ['strike_prepare', 'strike', 'strike_finish']) await call(ctx, fn, pa, pd, active);
    },
    get_final_dmg_base: () => 0,
    get_final_dmg_multiplier: () => [],
    apply_total_damage_modifier_invincible: noop,
    async apply_total_damage_modifier_special(ctx, pa, pd, active) {
      await call(ctx, 'apply_total_damage_modifier_special_set_sequence', pa, pd, active);
      // PHP ksort: the registered numeric priority, not insertion order.
      const sequence = Object.entries(pd.atdms_sequence ?? {}).sort(([a], [b]) => n(a) - n(b));
      for (const [, key] of sequence) {
        if (await call(ctx, 'apply_total_damage_modifier_special_check', pa, pd, active, key)) {
          await call(ctx, 'apply_total_damage_modifier_special_core', pa, pd, active, key);
          if (pa.dmg_dealt <= 0) break;
        }
      }
    },
    async apply_total_damage_modifier_special_set_sequence(ctx, pa, pd) { pd.atdms_sequence = []; },
    apply_total_damage_modifier_special_check: () => false,
    apply_total_damage_modifier_special_core: noop,
    apply_total_damage_modifier_limit: noop,
    apply_total_damage_modifier_insurance: noop,
    apply_total_damage_modifier_seckill: noop,
    async apply_damage(ctx, pa, pd) { pd.hp = n(pd.hp) - n(pa.dmg_dealt); return pa.dmg_dealt; },
    async player_damaged_enemy(ctx, pa, pd, active) {
      const direction = { active };
      let before = pa.dmg_dealt;
      if (pa.dmg_dealt > 0) {
        const base = await call(ctx, 'get_final_dmg_base', pa, pd, reference(direction, 'active'));
        active = direction.active;
        if (n(base) !== 0) pa.dmg_dealt = Math.max(0, n(pa.dmg_dealt) + n(base));
      }
      const damageExpression = Buffer.from(text(pa.mult_words_fdmgbs), 'utf8');
      // PHP 7.4 substr('', 3) is false; misses preserve that state value.
      pa.mult_words_fdmgbs = damageExpression.length < 3 ? false : damageExpression.subarray(3).toString('utf8');
      const multipliers = pa.dmg_dealt > 0 ? await call(ctx, 'get_final_dmg_multiplier', pa, pd, reference(direction, 'active')) : [];
      active = direction.active;
      if (pa.dmg_dealt > 0) {
        const [damage, , expression] = await call(ctx, 'apply_multiplier', pa.dmg_dealt, multipliers, '<:fin_dmg:>', pa.mult_words_fdmgbs);
        const formatted = await call(ctx, 'equalsign_format', damage, expression, '<:fin_dmg:>');
        if (n(damage) !== n(pa.physical_dmg_dealt)) appendLog(ctx, `<span class="yellow b">造成的总伤害：${formatted}。</span><br>`);
        pa.dmg_dealt = damage;
      } else if (n(before) !== n(pa.dmg_dealt)) {
        appendLog(ctx, `<span class="yellow b">造成的总伤害：<span class="<:fin_dmg:>">${pa.dmg_dealt}</span>。</span><br>`);
      }
      before = pa.dmg_dealt;
      for (const phase of ['invincible', 'special', 'limit', 'insurance']) {
        if (present(pa.dmg_dealt)) await call(ctx, `apply_total_damage_modifier_${phase}`, pa, pd, active);
      }
      await call(ctx, 'apply_total_damage_modifier_seckill', pa, pd, active);
      let color = 'red b';
      if (n(before) !== n(pa.dmg_dealt) && !present(pa.seckill)) {
        appendLog(ctx, `<span class="yellow b">最终伤害：<span class="red b">${pa.dmg_dealt}</span>。</span><br>`);
        color = 'yellow b';
      }
      const logger = ctx.state('logger');
      logger.log = text(logger.log).replaceAll('<:fin_dmg:>', color);
      await call(ctx, 'apply_damage', pa, pd, active);
      const sys = ctx.state('sys');
      if (!present(pa.type) && pa.dmg_dealt > n(sys.hdamage)) {
        sys.hdamage = pa.dmg_dealt;
        sys.hplayer = pa.name;
        await ctx.call('sys', 'save_combatinfo');
      }
      if (!active) {
        pa.battlelog = text(pa.battlelog) + (present(pa.is_counter)
          ? `对其做出了<span class="yellow b">${pa.dmg_dealt}</span>点反击。<br>`
          : `你对其做出<span class="yellow b">${pa.dmg_dealt}</span>点攻击，`);
      } else {
        pd.battlelog = text(pd.battlelog) + (present(pa.is_counter)
          ? `受到其<span class="yellow b">${pa.dmg_dealt}</span>点反击。<br>`
          : `你受到其<span class="yellow b">${pa.dmg_dealt}</span>点攻击，`);
      }
      await call(ctx, 'post_damage_news', pa, pd, active, pa.dmg_dealt);
    },
    async player_attack_enemy(ctx, pa, pd, active) {
      if (active) {
        if (present(pa.is_counter)) appendLog(ctx, '<span class="red b">你的反击！</span><br>');
        else {
          appendLog(ctx, `你向<span class="red b">${pd.name}</span>发起了攻击！<br>`);
          pd.battlelog = text(pd.battlelog) + `手持<span class="red b">${pa.wep}</span>的<span class="yellow b">${pa.name}</span>向你袭击！`;
        }
      } else if (present(pa.is_counter)) appendLog(ctx, `<span class="red b">${pa.name}的反击！</span><br>`);
      else {
        appendLog(ctx, `<span class="red b">${pa.name}</span>突然向你袭来！<br>`);
        pa.battlelog = text(pa.battlelog) + `你发现了手持<span class="red b">${pd.wep}</span>的<span class="yellow b">${pd.name}</span>并且先发制人！`;
      }
    },
    async player_kill_enemy(ctx, pa, pd, active) {
      const killed = `<span class="red b">你被${pa.name}杀死了！</span><br>`;
      const killer = `<span class="yellow b">${pd.name}</span><span class="red b">被你杀死了！</span><br>`;
      appendLog(ctx, active ? killer : killed);
      if (active) pd.battlelog = text(pd.battlelog) + killed;
      else pa.battlelog = text(pa.battlelog) + killer;
      if (present(pd.deathmark)) pd.state = pd.deathmark;
      const words = await ctx.call('player', 'kill', pa, pd);
      await call(ctx, 'show_player_killwords', pa, pd, active, words);
    },
    async show_player_killwords(ctx, pa, pd, active, words) {
      if (pd.hp <= 0 && present(words)) appendLog(ctx, active
        ? `<br><span class='b'>你对${pd.name}说道：</span><span class='yellow b'>“${words}”</span><br>`
        : `<br><span class='b'>${pa.name}对你说道：</span><span class='yellow b'>“${words}”</span><br>`);
    },
    load_user_combat_command: noop,
    load_auto_combat_command: noop,
    post_player_damaged_enemy_event: noop,
    async attack_prepare(ctx, pa, pd, active) {
      await call(ctx, 'player_attack_enemy', pa, pd, active);
      await call(ctx, present(pa.user_commanded) ? 'load_user_combat_command' : 'load_auto_combat_command', pa);
      await call(ctx, 'load_auto_combat_command', pd);
      pa.dmg_dealt = 0;
      pa.mult_words_fdmgbs = '';
    },
    async attack_finish(ctx, pa, pd, active) {
      await call(ctx, 'player_damaged_enemy', pa, pd, active);
      await call(ctx, 'post_player_damaged_enemy_event', pa, pd, active);
      // These two checks are intentionally sequential: kill/save/load hooks may
      // change the other participant before its death is checked.
      if (pd.hp <= 0) {
        await call(ctx, 'player_kill_enemy', pa, pd, active);
        await ctx.call('player', 'player_save', pa);
        await ctx.call('player', 'player_save', pd);
        await ctx.call('player', 'load_playerdata', active ? pa : pd);
      }
      if (pa.hp <= 0) {
        await call(ctx, 'player_kill_enemy', pd, pa, 1 - active);
        await ctx.call('player', 'player_save', pa);
        await ctx.call('player', 'player_save', pd);
        await ctx.call('player', 'load_playerdata', active ? pa : pd);
      }
      delete pa.physical_dmg_dealt;
      for (const key of Object.keys(pa)) if (key.startsWith('battlelogflag')) delete pa[key];
    },
    async attack_wrapper(ctx, pa, pd, active) {
      for (const fn of ['attack_prepare', 'attack', 'attack_finish']) await call(ctx, fn, pa, pd, active);
    },
    async add_format(ctx, value, expression, space = 1) {
      let sign = '+';
      if (isNumeric(value)) { sign = n(value) >= 0 ? '+' : '-'; value = Math.abs(n(value)); }
      if (space) sign = ` ${sign} `;
      return text(expression) + sign + text(value);
    },
    async multiply_format(ctx, value, expression, space = 1) {
      if (n(value) === 1) return expression;
      // Upstream references undefined $asign here, yielding two spaces.
      // Preserve output; fixing the wording is a separate gameplay/UI change.
      return text(expression) + (space ? '  ' : '×') + text(value);
    },
    async apply_multiplier(ctx, base, multipliers, style = null, replacement = null) {
      // Without an arithmetic operation PHP retains a numeric string from DB.
      let damage = base, words = base, expression = present(replacement) ? '<:reptxt:>' : base;
      for (const multiplier of Object.values(multipliers)) {
        // A zero multiplier is deliberately ignored by the original function.
        if (present(multiplier) && n(multiplier) !== 1) {
          // Integer multiplication in PHP has no signed zero. Keep a genuine
          // float -0 from fractional operands, but do not create one merely by
          // multiplying integer zero by a negative integer in JavaScript.
          const integerOperand = value => typeof value === 'string'
            ? /^[\t\n\r\f\v ]*[+-]?\d+$/.test(value)
            : Number.isSafeInteger(value) && !Object.is(value, -0);
          const integerProduct = integerOperand(damage) && integerOperand(multiplier);
          damage = n(damage) * n(multiplier);
          if (integerProduct && damage === 0) damage = 0;
          words = text(words) + '×' + text(multiplier);
          expression = text(expression) + '×' + text(multiplier);
        }
      }
      if (n(damage) !== n(base)) damage = Math.max(1, round(damage));
      words = text(words) + await call(ctx, 'equalsign_format', damage, words, style);
      if (text(expression).includes('×') && text(replacement).includes('+')) expression = text(expression).replaceAll('<:reptxt:>', '(<:reptxt:>)');
      if (present(replacement)) expression = text(expression).replaceAll('<:reptxt:>', text(replacement));
      return [damage === 0 ? 0 : damage, words, expression];
    },
    async equalsign_format(ctx, value, expression, style = null) {
      const span = present(style) ? `<span class="${style}">` : '<span>';
      const str = text(expression), equals = str.includes(' + ') ? ' = ' : '=';
      return str.includes('+') || str.includes('×') ? `${str}${equals}${span}${text(value)}</span>` : `${span}${str}</span>`;
    },
    async post_damage_news(ctx, pa, pd, active, damage) {
      if (damage >= 100) await ctx.call('sys', 'addnews', 0, 'damage_signal', pa.name, pd.name, '', damage, '');
    },
    async parse_damage_news(ctx, a, b, c, damage) {
      const d = Math.trunc(n(damage));
      if (d > 500000) return `将${b}击飞出【${d}】的${a}业已经天下无敌！`;
      if (d >= 200000) return `天空一道惊雷划过，${a}站在战场上，而${b}因为受到了【${d}】点的伤害现在已经不见踪影！`;
      if (d >= 50000) return `${a}已然和手中的武器成为一体！随着一声令大地崩塌的长啸，${b}吃下了【${d}】点的伤害！`;
      if (d >= 10000) return `${a}运转百万匹周天，吐气扬声，一道霸气的光束过后，在【${d}】点的伤害下，${b}还活着么？`;
      if (d >= 5000) return `${a}超越自己的极限爆发出了震天动地的力量！在【${d}】点的伤害后，${b}化作了一颗流星！`;
      if (d >= 1000) return `${a}燃烧自己的生命得到了不可思议的力量！【${d}】点的伤害值，没天理啊……${b}的HP足够么？`;
      if (d >= 750) return `${a}受到天神的加护，打出惊天动地的一击——${b}被打掉${d}点生命值！`;
      if (d >= 600) return `${a}手中的武器闪耀出七彩光芒！${b}招架不住，生命减少${d}点！`;
      if (d >= 500) return `${a}眼色一变使出绝招！${b}招架不住，生命减少${d}点！`;
      if (d >= 400) return `${a}使出武器中内藏的力量！可怜的${b}受到了${d}点的伤害！`;
      if (d >= 300) return `${a}使出浑身解数奋力一击！${d}点伤害！${b}还安好吗？`;
      if (d >= 250) return `${a}发出会心一击！${b}损失了${d}点生命！`;
      if (d >= 200) return `${a}简直不是人！${b}瞬间被打了${d}点伤害。`;
      if (d >= 150) return `${a}拿了什么神兵？${b}被打了${d}滴血。`;
      if (d >= 100) return `${a}对${b}做出了${d}点的攻击，一定是有练过。`;
      return '';
    },
    async parse_news(ctx, nid, news, hour, min, sec, a, b, c, d, e, extra = {}) {
      const prefix = `<li id="nid${nid}">${hour}时${min}分${sec}秒，`;
      const deaths = {death20: ['使用', ctx.state('sys').nowep, '击飞'], death21: ['使用', d, '殴打致死'], death22: ['使用', d, '斩杀'], death23: ['使用', d, '射杀'], death24: ['投掷', d, '致死'], death25: ['埋设', d, '伏击炸死'], death29: ['发动', d, '以灵力杀死']};
      if (deaths[news]) {
        const [verb, weapon, ending] = deaths[news];
        return `${prefix}<span class="yellow b">${a}</span>被<span class="yellow b">${c}</span>${verb}<span class="red b">${text(weapon)}</span>${ending}${text(extra.dword)}</li>`;
      }
      if (news === 'damage') return `${prefix}<span class="cyan b">${a}</span></li>`;
      if (news === 'damage_signal') return `${prefix}<span class="cyan b">${await call(ctx, 'parse_damage_news', a, b, c, d, e, extra)}</span></li>`;
      return await ctx.next(nid, news, hour, min, sec, a, b, c, d, e, extra);
    },
  },
};
