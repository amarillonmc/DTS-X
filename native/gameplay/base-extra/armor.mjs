import { number as n, text, present, appendLog } from '../numbers.mjs';
import { call, eq, min, mergeEquipment } from './helpers.mjs';
import armorConfig from './armor-config.json' with { type: 'json' };
import accessoryConfig from './armor_art-config.json' with { type: 'json' };

const itemFields = ['itm', 'itmk', 'itme', 'itms', 'itmsk'];
function equip(ctx, item, position, emptyKind = '') {
  const player = ctx.state('player'), keys = ['', 'k', 'e', 's', 'sk'].map(suffix => position + suffix);
  if ((present(emptyKind) && text(player[position + 'k']).startsWith(emptyKind)) || !present(player[position + 's'])) {
    keys.forEach((key, index) => { player[key] = item[itemFields[index]]; });
    appendLog(ctx, `装备了<span class="yellow b">${text(item.itm)}</span>。<br>`);
    Object.assign(item, { itm: '', itmk: '', itme: 0, itms: 0, itmsk: '' });
  } else {
    keys.forEach((key, index) => { const old = player[key]; player[key] = item[itemFields[index]]; item[itemFields[index]] = old; });
    appendLog(ctx, `卸下了<span class="red b">${text(item.itm)}</span>，装备了<span class="yellow b">${text(player[position])}</span>。<br>`);
  }
}

/** Original armor rules. Missing optional wound means an empty injury-place
 * list, just as the source imports no wound variables; no hook is fabricated. */
export const armorModule = {
  name: 'armor', dependencies: ['sys', 'player', 'itemmain', 'logger'], optionalDependencies: ['weapon', 'wound'],
  templates: ['profile_armor', 'profile_armor_short'], state: () => structuredClone(armorConfig.values),
  initialize(ctx) { mergeEquipment(ctx, ctx.state().armor_equip_list, ctx.state().armor_iteminfo); },
  functions: {
    async get_external_def_multiplier() { return 1; },
    async get_external_def(ctx, pa, pd, active) { return ctx.state().armor_equip_list.reduce((sum, key) => sum + n(pd[key + 'e']), 0); },
    async get_def_base(ctx, pa, pd, active) {
      const result = await ctx.next(pa, pd, active);
      pd.external_def = n(await call(ctx, 'get_external_def', pa, pd, active)) * n(await call(ctx, 'get_external_def_multiplier', pa, pd, active));
      pd.def_words = await ctx.call('attack', 'add_format', pd.external_def, pd.def_words, 0);
      return n(result) + pd.external_def;
    },
    async armor_break(ctx, pa, pd, active, which) {
      const own = `你的<span class="red b">${text(pd[which])}</span>受损过重，无法再装备了！<br>`;
      if (present(active)) { appendLog(ctx, `${text(pd.name)}的<span class="red b">${text(pd[which])}</span>受损过重，无法再装备了！<br>`); pd.armorbreaklog = text(pd.armorbreaklog) + own; }
      else appendLog(ctx, own);
      pd[which] = ''; pd[which + 'e'] = 0; pd[which + 's'] = 0; pd[which + 'sk'] = '';
      if (eq(which, 'arb')) { pd.arb = ctx.state().noarb; pd.arbk = 'DN'; }
    },
    async armor_hurt(ctx, pa, pd, active, which, hurt) {
      if (!ctx.state().armor_equip_list.some(value => eq(value, which)) || pd[which + 'e'] == null || n(pd[which + 'e']) <= 0) return 0;
      const infinite = eq(pd[which + 's'], ctx.state().nosta), key = which + (infinite ? 'e' : 's');
      const amount = min(pd[key], hurt); pd[key] = n(pd[key]) - n(amount);
      appendLog(ctx, `${present(active) ? text(pd.name) + '的' : '你的'}${text(pd[which])}的${infinite ? '效果值' : '耐久度'}下降了${text(amount)}！<br>`);
      if (n(pd[key]) <= 0) await call(ctx, 'armor_break', pa, pd, active, which);
      return amount;
    },
    async apply_weapon_inf(ctx, pa, pd, active) {
      const places = ctx.hasModule('wound') ? ctx.state('wound').inf_place : null;
      for (const place of text(places)) {
        const key = `attack_wounded_${place}`;
        if (pa[key] != null && n(pa[key]) > 0) pa[key] = n(pa[key]) - n(await call(ctx, 'armor_hurt', pa, pd, active, 'ar' + place, pa[key]));
      }
      await ctx.next(pa, pd, active);
    },
    async use_armor(ctx, item, position = '') {
      let emptyKind = '';
      if (!present(position)) {
        const mapped = { DB: 'arb', DH: 'arh', DA: 'ara', DF: 'arf' }[text(item.itmk).slice(0, 2)];
        if (mapped) { position = mapped; if (mapped === 'arb') emptyKind = 'DN'; }
      }
      if (!['arb', 'arh', 'ara', 'arf'].some(value => eq(value, position))) { appendLog(ctx, '指令错误。<br>'); return; }
      equip(ctx, item, position, emptyKind);
    },
    async itemuse(ctx, item) { if (text(item.itmk).startsWith('D')) { await call(ctx, 'use_armor', item); return; } await ctx.next(item); },
    async assault_prepare(ctx, pa, pd, active) { (present(active) ? pd : pa).armorbreaklog = ''; await ctx.next(pa, pd, active); },
    async assault_finish(ctx, pa, pd, active) { const target = present(active) ? pd : pa; target.battlelog = text(target.battlelog) + text(target.armorbreaklog); await ctx.next(pa, pd, active); },
  },
};

export const armorArtModule = {
  name: 'armor_art', dependencies: ['sys', 'player', 'itemmain', 'logger'], optionalDependencies: ['armor'],
  templates: ['profile_armor_art', 'profile_armor_art_short'], state: () => structuredClone(accessoryConfig.values),
  initialize(ctx) { mergeEquipment(ctx, ctx.state().armor_art_equip_list, ctx.state().armor_art_iteminfo); },
  functions: {
    async itemuse(ctx, item) { if (text(item.itmk).startsWith('A')) { equip(ctx, item, 'art'); return; } await ctx.next(item); },
  },
};
