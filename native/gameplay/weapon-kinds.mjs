import { appendLog, isNumeric, number, present, round, sameDurability, text } from './numbers.mjs';
import { reference } from '../modules/registry.mjs';

// Each row is the original kind configuration, in its original numeric types.
const kinds = {
  N: ['wp', '殴打', '空手', 60, 3, 80, 90, 0.025, 15, 0.6, -1, 20],
  P: ['wp', '殴打', '钝器', 65, 3, 80, 90, 0.025, 15, 0.6, 12, 21],
  K: ['wk', '斩刺', '锐器', 65, 3, 75, 85, 0.025, 40, 0.65, 35, 22],
  C: ['wc', '投掷', '投掷兵器', 35, 5, 70, 96, 0.25, 5, 0.35, 10000, 24],
  D: ['wd', '伏击', '爆炸物', 0, 0, 60, 70, 0.02, 25, 0.75, 10000, 25],
  F: ['wf', '灵击', '灵力兵器', 35, 1, 85, 96, 0.1, 10, 0.3, 10000, 29],
  G: ['wg', '射击', '远程兵器', 50, 7, 70, 95, 0.05, 20, 0.6, 10000, 23],
  J: ['wg', '狙击', '重型枪械', 20, 8, 10, 98, 0.2, 10, 0.7, 10000, 23],
  B: ['wc', '投射', '弓', 30, 5, 65, 90, 0.15, 10, 0.5, 10000, 43],
};
const fields = ['skillinfo', 'attinfo', null, 'counter_obbs', 'rangeinfo', 'hitrate_obbs', 'hitrate_max_obbs', 'hitrate_r', 'dmg_fluc', 'skill_dmg', 'wepimprate', 'wepdeathstate'];

function initializeKind(kind, context) {
  const weapon = context.state('weapon');
  const itemmain = context.state('itemmain');
  for (let index = 0; index < fields.length; index++) {
    if (fields[index]) weapon[fields[index]][kind] = kinds[kind][index];
  }
  itemmain.iteminfo[`W${kind}`] = kinds[kind][2];
  if (kind === 'F') weapon.attinfo2.F = '释放灵力攻击';
  if (kind === 'B') {
    itemmain.iteminfo.GA = '箭矢';
    itemmain.itemspkinfo['^ari'] = '箭矢';
    itemmain.itemspkdesc['^ari'] = '当前所装箭矢的信息为：<:skn:>';
  }
  if (context.hasModule('noise') && ['F', 'G', 'J'].includes(kind)) {
    context.state('noise').noiseinfo[kind] = kind === 'F' ? '灵气' : '枪声';
  }
}

const exhausted = (context, player) => sameDurability(player.weps, context.state('weapon').nosta);
const firstKind = player => text(player.wepk).slice(1, 2);
const holder = (player, active) => active ? '你' : text(player.name);
const entries = value => value != null && typeof value === 'object' && Object.keys(value).length > 0;
const sameSkill = (left, right) => isNumeric(left) && isNumeric(right) ? number(left) === number(right) : left === right;

function bluntWear(kind) {
  return {
    async calculate_wepimp_rate(ctx, pa, pd, active) {
      const multiplier = pa.wep_kind === kind && exhausted(ctx, pa) ? 2.5 : 1;
      return number(await ctx.next(pa, pd, active)) * multiplier;
    },
    async apply_weapon_imp(ctx, pa, pd, active) {
      if (pa.wep_kind === kind && exhausted(ctx, pa)) {
        if (present(pa.wepimp)) {
          pa.wepe = number(pa.wepe) - number(pa.wepimp);
          appendLog(ctx, `${holder(pa, active)}的${text(pa.wep)}的攻击力下降了${text(pa.wepimp)}！<br>`);
          if (pa.wepe <= 0) await ctx.call('weapon', 'weapon_break', pa, pd, active);
        }
      } else await ctx.next(pa, pd, active);
    },
  };
}

function firearmHooks(kind) {
  const module = `wep_${kind.toLowerCase()}`;
  return {
    async get_attack_method(ctx, player) {
      const useAsBlunt = kind === 'G'
        ? await ctx.call(module, 'check_WG_att_as_WP', player)
        : firstKind(player) === kind && exhausted(ctx, player);
      return useAsBlunt ? 'P' : await ctx.next(player);
    },
    async [`get_W${kind}_att_as_WP_modifier`]() { return 0.1; },
    async get_external_att(ctx, pa, pd, active) {
      if (pa.wep_kind === 'P' && firstKind(pa) === kind) {
        const multiplier = await ctx.call(module, `get_W${kind}_att_as_WP_modifier`, pa, pd, active);
        return number(multiplier) * number(await ctx.next(pa, pd, active));
      }
      return await ctx.next(pa, pd, active);
    },
    async calculate_wepimp_rate(ctx, pa, pd, active) {
      const multiplier = pa.wep_kind === 'P' && firstKind(pa) === kind ? (kind === 'G' ? 2.5 : 6) : 1;
      return number(await ctx.next(pa, pd, active)) * multiplier;
    },
    async apply_weapon_imp(ctx, pa, pd, active) {
      if (pa.wep_kind === kind) {
        if (present(pa.wepimp)) {
          pa.weps = number(pa.weps) - number(pa.wepimp);
          appendLog(ctx, `${holder(pa, active)}的${text(pa.wep)}的弹药数减少了${text(pa.wepimp)}。<br>`);
          if (pa.weps <= 0) await ctx.call('weapon', 'weapon_break', pa, pd, active);
        }
      } else await ctx.next(pa, pd, active);
    },
    async weapon_break(ctx, pa, pd, active) {
      if (pa.wep_kind === kind) {
        appendLog(ctx, `${holder(pa, active)}的<span class="red b">${text(pa.wep)}</span>的弹药用光了！<br>`);
        pa.weps = ctx.state('weapon').nosta;
      } else await ctx.next(pa, pd, active);
    },
    async [`weapon_W${kind}_addnoise`](ctx, pa, pd, active) {
      if (ctx.hasModule('noise')) await ctx.call('noise', 'addnoise', pa.pls, kind, pa.pid, pd.pid);
    },
    async weapon_strike(ctx, pa, pd, active) {
      if (ctx.hasModule('noise') && pa.wep_kind === kind) await ctx.call(module, `weapon_W${kind}_addnoise`, pa, pd, active);
      await ctx.next(pa, pd, active);
    },
    async get_internal_att(ctx, pa, pd, active) {
      let value = await ctx.next(pa, pd, active);
      if (pa.wep_kind === kind) {
        if (kind === 'G' && number(value) > 270) value = 270 + round((number(value) - 270) / 3 * 10) / 10;
        if (kind === 'J' && number(value) > 340) value = 340 + (number(value) - 340) / 3;
      }
      return value;
    },
  };
}

const descriptors = [
  {
    name: 'wep_n', dependencies: ['weapon', 'itemmain'],
    functions: {
      async get_external_att(ctx, pa, pd, active) {
        let value = await ctx.next(pa, pd, active);
        if (pa.wep_kind === 'N') value = number(value) + round(number(pa[ctx.state('weapon').skillinfo.N]) * 2 / 3);
        return value;
      },
    },
  },
  {
    name: 'wep_p', dependencies: ['weapon', 'itemmain'],
    functions: {
      ...bluntWear('P'),
      async get_attack_method(ctx, player) { return text(player.wepk).startsWith('W') ? await ctx.next(player) : 'P'; },
    },
  },
  { name: 'wep_k', dependencies: ['weapon', 'itemmain'], functions: bluntWear('K') },
  { name: 'wep_c', dependencies: ['weapon', 'itemmain'], functions: {} },
  { name: 'wep_d', dependencies: ['weapon', 'itemmain'], functions: {} },
  {
    name: 'wep_f', dependencies: ['weapon', 'logger', 'itemmain'], optionalDependencies: ['noise'],
    functions: {
      async get_WF_fixed_dmg(ctx, pa) { return pa.wepe; },
      async get_primary_fixed_dmg_base(ctx, pa, pd, active) {
        const value = pa.wep_kind === 'F' ? await ctx.call('wep_f', 'get_WF_fixed_dmg', pa, pd, active) : 0;
        return number(await ctx.next(pa, pd, active)) + number(value);
      },
      async get_WF_sp_cost(ctx, pa) { return Math.max(round(0.2 * number(pa.wepe)), 1); },
      async get_WF_dmg_multiplier(ctx, pa, pd, active) {
        if (pa.wep_kind !== 'F') return [];
        const full = number(await ctx.call('wep_f', 'get_WF_sp_cost', pa, pd, active));
        const actual = Math.min(number(pa.sp) - 1, full);
        const multiplier = 0.5 + actual / full * 0.5;
        const displayed = round(multiplier * 100);
        pa.sp = number(pa.sp) - actual;
        appendLog(ctx, `${holder(pa, active)}消耗${actual}点体力，发挥了灵力武器${displayed}％的威力！`);
        return [round(multiplier * 100) / 100];
      },
      async get_physical_dmg_multiplier(ctx, pa, pd, active) {
        let result = await ctx.call('wep_f', 'get_WF_dmg_multiplier', pa, pd, active);
        if (result[0] === 1) result = [];
        return [...result, ...await ctx.next(pa, pd, active)];
      },
      async check_WF_noise() { return 1; },
      async weapon_strike(ctx, pa, pd, active) {
        if (ctx.hasModule('noise') && pa.wep_kind === 'F' && await ctx.call('wep_f', 'check_WF_noise', pa, pd, active)) {
          await ctx.call('noise', 'addnoise', pa.pls, 'F', pa.pid, pd.pid);
        }
        await ctx.next(pa, pd, active);
      },
    },
  },
  {
    name: 'wep_g', dependencies: ['weapon', 'itemmain', 'wep_p'], optionalDependencies: ['noise'],
    functions: {
      ...firearmHooks('G'),
      async check_WG_att_as_WP(ctx, player) { return firstKind(player) === 'G' && exhausted(ctx, player); },
    },
  },
  {
    name: 'wep_j', dependencies: ['weapon', 'player', 'itemmain', 'wep_p', 'attack'], optionalDependencies: ['noise', 'clubbase'],
    state: () => ({ wj_allowed_bskill: [] }),
    functions: {
      ...firearmHooks('J'),
      async get_WJ_fixed_dmg(ctx, pa, pd) { return Math.min(round(number(pd.mhp) / 3), 20000) + round(number(pa.wepe) * 2 / 3); },
      async get_primary_fixed_dmg_base(ctx, pa, pd, active) {
        const value = pa.wep_kind === 'J' ? await ctx.call('wep_j', 'get_WJ_fixed_dmg', pa, pd, active) : 0;
        return number(value) + number(await ctx.next(pa, pd, active));
      },
      async get_physical_dmg_multiplier(ctx, pa, pd, active) {
        const result = [];
        if (text(pd.wepk).includes('J')) {
          appendLog(ctx, active
            ? `<span class="red b">由于${text(pd.name)}手中的武器过于笨重，受到的伤害大增！</span><br>`
            : '<span class="red b">由于你手中的武器过于笨重，受到的伤害大增！真是大快人心啊！</span><br>');
          result.push(1.5);
        }
        return [...result, ...await ctx.next(pa, pd, active)];
      },
      async check_battle_skill_available(ctx, enemy, skill) {
        if (text(ctx.state('player').wepk).includes('J') && !ctx.state().wj_allowed_bskill.some(value => sameSkill(value, skill))) return false;
        return await ctx.next(enemy, skill);
      },
      async strike_prepare(ctx, pa, pd, active) {
        if (text(pa.wepk).includes('J') && !ctx.state().wj_allowed_bskill.some(value => sameSkill(value, pa.bskill))) pa.bskill = 0;
        await ctx.next(pa, pd, active);
      },
    },
  },
];

descriptors.push({
  name: 'wep_b', dependencies: ['weapon', 'itemmain', 'wep_c', 'enemy', 'player'], optionalDependencies: ['attrbase'],
  functions: {
    async get_attack_method(ctx, player) {
      return await ctx.call('wep_b', 'check_WB_att_as_WK', player) ? 'K' : await ctx.next(player);
    },
    async check_WB_att_as_WK(ctx, player) { return firstKind(player) === 'B' && exhausted(ctx, player); },
    async get_WB_att_as_WK_modifier() { return 0.25; },
    async get_external_att(ctx, pa, pd, active) {
      const value = await ctx.next(pa, pd, active);
      return pa.wep_kind === 'K' && firstKind(pa) === 'B'
        ? number(await ctx.call('wep_b', 'get_WB_att_as_WK_modifier', pa, pd, active)) * number(value)
        : value;
    },
    async calculate_wepimp_rate(ctx, pa, pd, active) {
      const multiplier = pa.wep_kind === 'K' && firstKind(pa) === 'B' ? 3 : 1;
      return number(await ctx.next(pa, pd, active)) * multiplier;
    },
    async apply_weapon_imp(ctx, pa, pd, active) {
      if (pa.wep_kind === 'B') {
        if (present(pa.wepimp)) {
          pa.weps = number(pa.weps) - number(pa.wepimp);
          appendLog(ctx, await ctx.call('battle', 'battlelog_parser', pa, pd, active, `<:pa_name:>的${text(pa.wep)}用掉了${text(pa.wepimp)}支箭。<br>`));
          if (pa.weps <= 0) await ctx.call('weapon', 'weapon_break', pa, pd, active);
        }
      } else await ctx.next(pa, pd, active);
    },
    async weapon_break(ctx, pa, pd, active) {
      if (pa.wep_kind === 'B') {
        appendLog(ctx, await ctx.call('battle', 'battlelog_parser', pa, pd, active, `<:pa_name:>的<span class="red b">${text(pa.wep)}</span>的箭矢用光了！<br>`));
        pa.weps = ctx.state('weapon').nosta;
        await ctx.call('wep_b', 'wep_b_clean_arrow_sk', reference(pa, 'wepsk'));
        pa.wepsk = await ctx.call('wep_b', 'wep_b_put_ari', pa.wepsk, {});
      } else await ctx.next(pa, pd, active);
    },
    async get_weapon_range(ctx, pa, active) {
      let result = await ctx.next(pa, active);
      if (!present(pa.wep_kind)) pa.wep_kind = await ctx.call('weapon', 'get_attack_method', pa);
      if (pa.wep_kind === 'B') result = number(result) + Math.min(Math.floor(number(pa[ctx.state('weapon').skillinfo[pa.wep_kind]]) / 200), 3);
      return result;
    },
    async wep_b_get_ari(ctx, attributes) {
      let encoded = await ctx.call('itemmain', 'check_in_itmsk', '^ari', attributes);
      if (!present(encoded)) return {};
      encoded = await ctx.call('itemmain', 'base64_decode_comp_itmsk', encoded);
      if (!present(encoded)) return {};
      const values = text(encoded).split(',');
      return Object.fromEntries(['itm', 'itmk', 'itme', 'itms', 'itmsk'].map((key, index) => [key, values[index] ?? null]));
    },
    async wep_b_put_ari(ctx, attributes, arrow) {
      const existing = await ctx.call('itemmain', 'check_in_itmsk', '^ari', attributes);
      if (present(existing)) attributes = await ctx.call('itemmain', 'replace_in_itmsk', '^ari', '', attributes);
      if (entries(arrow)) {
        const value = ['itm', 'itmk', 'itme', 'itms', 'itmsk'].map(key => text(arrow[key])).join(',');
        attributes = text(attributes) + '^ari_' + await ctx.call('itemmain', 'base64_encode_comp_itmsk', value) + '1';
      }
      return attributes;
    },
    // Explicit scalar reference slots replace PHP's &$itmk and &$itmsk.
    async wep_b_clean_arrow_name(ctx, slot) {
      const value = text(slot.value);
      const offset = value.indexOf('|');
      if (offset < 0) return '';
      slot.value = value.slice(0, offset);
      return value.slice(offset + 1);
    },
    async wep_b_clean_arrow_sk(ctx, slot) {
      let value = text(slot.value);
      if (!value.includes('|')) return '';
      if ((value.match(/\|/g)?.length ?? 0) % 2) value += '|';
      const match = value.match(/\|.*\|/s);
      slot.value = match ? value.replace(/\|.*?\|/gs, '') : value;
      return match ? match[0].slice(1, -1) : '';
    },
    async itemuse_uga(ctx, item) {
      const player = ctx.state('player');
      const weapon = ctx.state('weapon');
      const swap = await ctx.call('wep_b', 'wep_b_get_ari', player.wepsk);
      const oldAttributes = await ctx.call('wep_b', 'wep_b_clean_arrow_sk', reference(player, 'wepsk'));
      let oldCount = 0;
      if (player.weps !== weapon.nosta) {
        oldCount = player.weps;
        player.weps = weapon.nosta;
      }
      const weaponAttributes = await ctx.call('itemmain', 'get_itmsk_array', player.wepsk);
      const arrowAttributes = await ctx.call('itemmain', 'get_itmsk_array', item.itmsk);
      const multiple = present(await ctx.call('itemmain', 'check_in_itmsk', 'r', arrowAttributes))
        || present(await ctx.call('itemmain', 'check_in_itmsk', 'r', weaponAttributes));
      const maximum = multiple ? 2 + Math.min(Math.floor(number(player[weapon.skillinfo.B]) / 200), 4) : 1;
      const count = Math.min(maximum, number(item.itms));
      player.weps = count;
      const arrow = { itm: item.itm, itmk: item.itmk, itme: item.itme, itms: count, itmsk: item.itmsk };
      player.wepsk = await ctx.call('wep_b', 'wep_b_put_ari', player.wepsk, arrow);
      if (entries(arrowAttributes)) player.wepsk += `|${Object.values(arrowAttributes).join('')}|`;
      appendLog(ctx, `为<span class="red b">${text(player.wep)}</span>${present(oldCount) ? '换上' : '选用'}了<span class="red b">${text(item.itm)}</span>，<span class="red b">${text(player.wep)}</span>发射次数增加了<span class="yellow b">${count}</span>。<br>`);
      await ctx.call('itemmain', 'itms_reduce', item, count);
      if (present(oldCount)) {
        if (!entries(swap)) {
          Object.assign(player, { itm0: '卸下的箭', itmk0: 'GA', itme0: 1, itms0: oldCount, itmsk0: oldAttributes });
        } else {
          Object.assign(player, { itm0: swap.itm, itmk0: swap.itmk, itme0: swap.itme, itms0: present(oldCount) ? oldCount : swap.itms, itmsk0: swap.itmsk });
        }
        await ctx.call('itemmain', 'itemget');
      }
    },
    async itemuse(ctx, item) {
      if (text(item.itmk).startsWith('GA')) {
        if (!text(ctx.state('player').wepk).startsWith('WB')) {
          appendLog(ctx, '<span class="red b">你没有装备弓，不能给武器上箭。</span><br>');
          ctx.state('sys').mode = 'command';
          return;
        }
        if (item.itmn === '0') {
          appendLog(ctx, '你一只手捏着弓箭，一只手抓着刚捡到的箭矢，没法马上弯弓搭箭。<span class="red b">还是先把箭矢收进包裹里吧。</span><br>');
          ctx.state('sys').mode = 'command';
          return;
        }
        await ctx.call('wep_b', 'itemuse_uga', item);
        return;
      }
      await ctx.next(item);
    },
    async findenemy(ctx, enemy) {
      const player = ctx.state('player');
      const logger = ctx.state('logger');
      let deferredLog = '';
      if (text(player.wepk).startsWith('WB') && exhausted(ctx, player)) {
        const oldLog = text(logger.log);
        let position = 0;
        for (let index = 1; index <= 6; index++) {
          if (player.sdata[`itmk${index}`] === 'GA') { position = index; break; }
        }
        if (position) {
          appendLog(ctx, '你及时弯弓搭箭，');
          await ctx.call('itemmain', 'itemuse_wrapper', position);
        }
        deferredLog = text(logger.log).slice(oldLog.length);
        logger.log = oldLog;
      }
      await ctx.next(enemy);
      if (present(deferredLog)) appendLog(ctx, deferredLog);
    },
    async get_itmsk_desc_single_comp_process(ctx, key, name, attributes) {
      name = await ctx.next(key, name, attributes);
      if (text(key).startsWith('^ari')) {
        const values = text(await ctx.call('itemmain', 'base64_decode_comp_itmsk', attributes)).split(',');
        const kind = await ctx.call('itemmain', 'parse_itmk_words', values[1]);
        const attributeWords = await ctx.call('itemmain', 'parse_itmsk_words', values[4]);
        name = `${text(values[0])}/${text(kind)}/${text(values[2])}/${text(values[3])}${present(attributeWords) ? `/${text(attributeWords)}` : ''}`;
      }
      return name;
    },
    async get_attackwords(ctx, pa, pd, active) {
      if (pa.wep_kind === 'B') {
        const arrow = await ctx.call('wep_b', 'wep_b_get_ari', pa.wepsk);
        if (present(arrow.itm)) {
          const weapon = ctx.state('weapon');
          const verb = weapon.attinfo2[pa.wep_kind] ?? weapon.attinfo[pa.wep_kind];
          return active
            ? `使用${text(pa.wep)}向${text(pd.name)}<span class="yellow b">${text(verb)}</span>出<span class="yellow b">${text(arrow.itm)}</span>！<br>`
            : `${text(pa.name)}使用${text(pa.wep)}向你<span class="yellow b">${text(verb)}</span>出<span class="yellow b">${text(arrow.itm)}</span>！<br>`;
        }
      }
      return await ctx.next(pa, pd, active);
    },
    async strike_prepare(ctx, pa, pd, active) {
      if (pa.wep_kind === 'B') {
        const arrow = await ctx.call('wep_b', 'wep_b_get_ari', pa.wepsk);
        if (present(arrow.itm)) pa.attackwith_arrowarr = arrow;
      } else delete pa.attackwith_arrowarr;
      await ctx.next(pa, pd, active);
    },
    async deathnews(ctx, pa, pd) {
      let oldWeapon;
      if (pa.wep_kind === 'B' && entries(pa.attackwith_arrowarr) && present(pa.attackwith_arrowarr.itm)) {
        oldWeapon = pa.attackwith;
        pa.attackwith = text(pa.attackwith) + '<:sep:>' + text(pa.attackwith_arrowarr.itm);
      }
      await ctx.next(pa, pd);
      if (present(oldWeapon)) pa.attackwith = oldWeapon;
    },
    async parse_news(ctx, nid, news, hour, min, sec, a, b, c, d, e, extra = {}) {
      if (news === 'death43') {
        const [weapon, arrow] = text(d).split('<:sep:>');
        return `<li id="nid${text(nid)}">${text(hour)}时${text(min)}分${text(sec)}秒，<span class="yellow b">${text(a)}</span>被<span class="yellow b">${text(c)}</span>使用<span class="red b">${text(weapon)}</span>投射${present(arrow) ? `<span class="red b">${arrow}</span>` : ''}致死${text(extra.dword)}</li>`;
      }
      return await ctx.next(nid, news, hour, min, sec, a, b, c, d, e, extra);
    },
  },
});

/** Complete native ports of the nine weapon-kind modules, preserving dependencies. */
export const weaponKindModules = Object.freeze(descriptors.map(descriptor => Object.freeze({
  ...descriptor,
  source: `include/modules/base/weapon/${descriptor.name}/main.php`,
  initialize: context => initializeKind(descriptor.name.slice(-1).toUpperCase(), context),
})));

const dualNames = {
  WDP: '爆拳', WPD: '爆拳', WGK: '枪刃', WKG: '枪刃', WFC: '灵弹', WCF: '灵弹',
  WFK: '灵刃', WKF: '灵刃', WFP: '灵力钝器', WPF: '灵力钝器', WFG: '灵枪', WGF: '灵枪',
  WFB: '灵弓', WBF: '灵弓', WFD: '灵力爆风', WDF: '灵力爆风', WKP: '无锋重剑', WPK: '无锋重剑',
  WCP: '投掷钝器', WPC: '投掷钝器', WDG: '爆击枪械', WGD: '爆击枪械', WDJ: '爆击重炮', WJD: '爆击重炮', WFJ: '灵力重炮', WJF: '灵力重炮',
};

async function dualWear(ctx, pa, pd, active, ...args) {
  if (present(await ctx.call('dualwep', 'get_sec_attack_method', pa))) {
    pa.dw_o_wep_kind = pa.wep_kind;
    pa.wep_kind = await ctx.call('dualwep', 'get_dualwep_imp_kind', pa, pd, active);
  }
  await ctx.next(pa, pd, active, ...args);
  if (pa.dw_o_wep_kind != null) {
    if (pa.wep_kind !== pa.dw_o_wep_kind) pa.wep_kind = pa.dw_o_wep_kind;
    delete pa.dw_o_wep_kind;
  }
}

export const dualWeaponModule = {
  name: 'dualwep',
  source: 'include/modules/base/weapon/dualwep/main.php',
  templates: ['sec_att_method', 'dualwep_att_method_profile'],
  dependencies: ['sys', 'player', 'itemmain', 'weapon', 'wep_n', 'wep_p', 'wep_k', 'wep_g', 'wep_c', 'wep_d', 'wep_f', 'wep_j', 'wep_b'],
  state: () => ({ dualwep_allowed_bskill: [], dualwep_iteminfo: { ...dualNames } }),
  initialize(ctx) {
    const items = ctx.state('itemmain').iteminfo;
    for (const [key, value] of Object.entries(ctx.state().dualwep_iteminfo)) if (!Object.hasOwn(items, key)) items[key] = value;
  },
  functions: {
    async load_playerdata(ctx, data) {
      data = structuredClone(data);
      const oldKind = present(data.wep_kind) && present(await ctx.call('dualwep', 'get_sec_attack_method', data)) ? data.wep_kind : null;
      await ctx.next(data);
      if (present(oldKind)) ctx.state('player').sdata.wep_kind = oldKind;
    },
    async parse_interface_profile(ctx) {
      await ctx.next();
      const player = ctx.state('player');
      if (present(await ctx.call('dualwep', 'get_sec_attack_method', player.sdata))) {
        const weapon = ctx.state('weapon');
        const label = weapon.skilltypeinfo[weapon.skillinfo[firstKind(player.sdata)]];
        if (present(label)) player.tpldata.wepk_words = text(player.tpldata.wepk_words) + `(${label})`;
      }
    },
    async check_w2_valid(ctx, kind, durability, original = 0) {
      const weapon = ctx.state('weapon');
      if (weapon.attinfo[kind] == null) return '';
      if (['G', 'J'].includes(kind) && sameDurability(durability, weapon.nosta) && !present(original)) return 'P';
      if (kind === 'B' && sameDurability(durability, weapon.nosta) && !present(original)) return 'K';
      return kind;
    },
    async get_other_attack_method(ctx, player, first, original = 0) {
      const kind = text(player.wepk)[first === firstKind(player) ? 2 : 1] ?? '';
      return await ctx.call('dualwep', 'check_w2_valid', kind, player.weps, original);
    },
    async get_sec_attack_method(ctx, player, original = 0) {
      return await ctx.call('dualwep', 'check_w2_valid', text(player.wepk).slice(2, 3), player.weps, original);
    },
    async check_attack_method(ctx, player, kind) {
      if (present(kind) && await ctx.call('dualwep', 'get_sec_attack_method', player) === kind) return 1;
      return await ctx.next(player, kind);
    },
    async weapon_break(ctx, pa, pd, active) {
      // Preserve the original repeated hook calls; overrides may have effects.
      if (await ctx.call('dualwep', 'get_sec_attack_method', pa) === 'G' || await ctx.call('dualwep', 'get_sec_attack_method', pa) === 'J') {
        pa.wep_kind = await ctx.call('dualwep', 'get_sec_attack_method', pa);
      }
      await ctx.next(pa, pd, active);
    },
    async get_skill_by_kind(ctx, pa, pd, active, skillKind) {
      let result = await ctx.next(pa, pd, active, skillKind);
      if (present(await ctx.call('dualwep', 'get_sec_attack_method', pa))) {
        const other = await ctx.call('dualwep', 'get_other_attack_method', pa, pa.wep_kind);
        const otherResult = await ctx.next(pa, pd, active, ctx.state('weapon').skillinfo[other]);
        if (number(result) < number(otherResult) / 2) result = round(number(otherResult) / 2);
      }
      return result;
    },
    async get_dualwep_imp_kind(ctx, pa, pd, active) {
      const first = await ctx.call('weapon', 'get_attack_method', pa);
      const second = await ctx.call('dualwep', 'get_sec_attack_method', pa);
      const firstTier = await ctx.call('dualwep', 'get_dualwep_imp_kind_tier', first, pa.weps);
      const secondTier = await ctx.call('dualwep', 'get_dualwep_imp_kind_tier', second, pa.weps);
      return number(secondTier) > number(firstTier) ? second : first;
    },
    async get_dualwep_imp_kind_tier(ctx, kind, durability) {
      if (['C', 'D', 'F'].includes(kind) && ctx.state('weapon').nosta === durability) return 40;
      if (['G', 'J', 'B'].includes(kind)) return 30;
      if (['N', 'P', 'K'].includes(kind)) return 20;
      return 10;
    },
    calculate_wepimp: dualWear,
    apply_weapon_imp: dualWear,
    async dualwep_change_am(ctx) {
      const player = ctx.state('player');
      if (!text(player.wepk).startsWith('W') || player.wepk === 'WN') {
        appendLog(ctx, '请先装备武器！');
        ctx.state('sys').mode = 'command';
        return;
      }
      if (!present(await ctx.call('dualwep', 'get_sec_attack_method', player.sdata))) {
        appendLog(ctx, '你并未装备双重系别的武器。');
        ctx.state('sys').mode = 'command';
        return;
      }
      player.wepk = player.wepk[0] + player.wepk[2] + player.wepk[1] + player.wepk.slice(3);
      appendLog(ctx, `武器主攻系别已经切换为<span class="yellow b">${text(ctx.state('itemmain').iteminfo[`W${player.wepk[1]}`])}</span>。`);
      ctx.state('sys').mode = 'command';
    },
    async act(ctx) {
      const sys = ctx.state('sys');
      if (sys.mode === 'command' && sys.command === 'special' && ctx.reference('input', 'sp_cmd').value === 'sp_dualwep_am') {
        await ctx.call('dualwep', 'dualwep_change_am');
        sys.mode = 'command';
        return;
      }
      await ctx.next();
    },
    async get_skillkind(ctx, pa, pd, active) {
      let result = await ctx.next(pa, pd, active);
      const second = await ctx.call('dualwep', 'get_sec_attack_method', pa);
      if (present(second)) result = text(result) + text(second);
      return result;
    },
  },
};
