import { readFile } from 'node:fs/promises';
import { number as n, text, present, appendLog } from '../numbers.mjs';
import { call, eq, integer } from './helpers.mjs';
import config from './itemshop-config.json' with { type: 'json' };

async function resource() {
  const source = await readFile(new URL('../../../engine/include/modules/base/itemshop/config/shopitem.config.php', import.meta.url), 'utf8'), lines = source.replaceAll('\n', '\n<:game:>').split('<:game:>');
  if (lines.at(-1) === '' || lines.at(-1) === '\r') lines.pop(); return lines.length ? lines : [''];
}
function database(ctx) { if (!ctx.services.database) throw new Error('Native itemshop requires services.database.'); return ctx.services.database; }
function templateName(ctx, constant) { const name = ctx.services.templates?.names?.[constant]; if (typeof name !== 'string' || !name) throw new Error(`Native itemshop requires template binding ${constant}.`); return name; }
async function display(ctx, name, scope) {
  if (typeof ctx.services.output?.take !== 'function' || typeof ctx.services.templates?.render !== 'function') throw new Error('Native itemshop requires output.take() and templates.render().');
  await ctx.services.output.take();
  const html = await ctx.services.templates.render(name, scope);
  if (typeof html !== 'string') throw new TypeError('Native itemshop template renderer must return HTML.');
  ctx.state('player').cmd = html; await ctx.services.output.take();
}
const entries = value => value instanceof Map ? [...value] : Object.entries(value);
const values = value => entries(value ?? {}).map(([, item]) => item);
const get = (value, key) => value instanceof Map ? value.get(key) : value?.[key];
const copy = value => structuredClone(value);
/** Catalog categories retain their declared order, including categories 16/17
 * before 12. The original inventory CSV and CREATE TABLE remain source assets. */
export const itemshopModule = {
  name: 'itemshop', dependencies: ['sys', 'map', 'player', 'logger', 'itemmain', 'input'], optionalDependencies: [], templates: ['sp_shop', 'shop', 'itemshop_cmd'],
  state: () => ({ ...copy(config.values), shop_tag_list: new Map(copy(config.shopTags)) }),
  functions: {
    async get_shopconfig() { return await resource(); },
    async get_shopitem_list_by_kind(ctx, lines) {
      const result = new Map();
      for (const line of values(lines)) if (present(line) && text(line).includes(',')) {
        const row = await call(ctx, 'shopitem_row_data_seperate', line); if (!present(get(row, 0))) continue;
        const key = /^(?:0|[1-9]\d*)$/.test(text(get(row, 0))) ? Number(get(row, 0)) : get(row, 0);
        if (!result.has(key)) result.set(key, []); result.get(key).push(row);
      }
      return result;
    },
    async shopitem_row_data_seperate(ctx, data) { return await call(ctx, 'shopitem_row_data_process', text(data).split(',')); },
    async get_shopitem_list(ctx, lines = []) {
      const original = await resource(), grouped = await call(ctx, 'get_shopitem_list_by_kind', original), combined = new Map(entries(grouped));
      if (entries(lines).length && JSON.stringify(lines) !== JSON.stringify(original)) for (const [key, value] of entries(await call(ctx, 'get_shopitem_list_by_kind', lines))) combined.set(key, value);
      return [...combined].sort(([a], [b]) => n(a) - n(b)).flatMap(([, rows]) => values(rows));
    },
    async rs_game(ctx, mode) {
      await ctx.next(mode); if (!(n(mode) & 32)) return;
      const prefix = ctx.state('sys').tablepre;
      const source = await readFile(new URL('../../../engine/gamedata/sql/shopitem.sql', import.meta.url), 'utf8'); await database(ctx).queries(source.replaceAll(' bra_', ' ' + prefix).replaceAll('\r', '\n'));
      const rows = await call(ctx, 'get_shopitem_list', await call(ctx, 'get_shopconfig'));
      const tuples = values(rows).map(row => '(' + Array.from({ length: 9 }, (_, i) => "'" + text(get(row, i)) + "'").join(',') + ')');
      await database(ctx).execute(tuples.length ? `INSERT INTO ${prefix}shopitem (kind,num,price,area,item,itmk,itme,itms,itmsk) VALUES ${tuples.join(',')}` : '');
    },
    async shopitem_row_data_process(ctx, data) { return copy(data); },
    async prepare_shopitem(ctx, category) {
      const wave = await ctx.call('map', 'get_area_wavenum'), rows = await database(ctx).query(`SELECT * FROM ${ctx.state('sys').tablepre}shopitem WHERE kind = '${text(category)}' AND area <= '${text(wave)}' AND num > '0' AND price > '0' ORDER BY sid`);
      if (!rows.length) return null;
      for (const row of rows) { row.itmk_words = await ctx.call('itemmain', 'parse_itmk_words', row.itmk, 1); row.itmsk_words = await ctx.call('itemmain', 'parse_itmsk_words', row.itmsk, 1); }
      return rows;
    },
    async shoplist(ctx, category) { const itemdata = await call(ctx, 'prepare_shopitem', category); await display(ctx, await call(ctx, 'get_itemshop_filename'), ctx.importInto({ sn: category, shop: category, itemdata }, 'sys', 'player')); },
    async get_itemshop_filename(ctx) { return templateName(ctx, 'MOD_ITEMSHOP_SHOP'); },
    async get_sp_shop_filename(ctx) { return templateName(ctx, 'MOD_ITEMSHOP_SP_SHOP'); },
    async get_shopiteminfo(ctx, item) { return (await database(ctx).query(`SELECT * FROM ${ctx.state('sys').tablepre}shopitem WHERE sid = '${text(item)}'`))[0] ?? false; },
    async calculate_shop_itembuy_cost(ctx, price, amount) { return n(price) * n(amount); },
    async get_shop_tag_list(ctx) { return copy(ctx.state().shop_tag_list); },
    async itembuy(ctx, id, category, amount = 1) {
      const sys = ctx.state('sys'), player = ctx.state('player'), item = await call(ctx, 'get_shopiteminfo', id), price = item?.price ?? null;
      let message;
      if (n(price) < 0) message = '要购买的道具不存在！<br><br>';
      else {
        amount = integer(amount); const cost = await call(ctx, 'calculate_shop_itembuy_cost', price, amount);
        if (n(item?.num) <= 0) message = '此物品已经售空！<br><br>';
        else if (amount <= 0) message = '购买数量必须为大于0的整数。<br><br>';
        else if (amount > n(item.num)) message = '购买数量必须小于存货数量。<br><br>';
        else if (n(player.money) < n(cost)) message = '你的钱不够，不能购买此物品！<br><br>';
        else if ((item.itms === '∞' || !/^(WC|WD|WF|Y|B|C|TN|GA|GB|H|P|V|M|X|p|ygo|mc|EA)/.test(text(item.itmk))) && amount > 1) message = '此物品一次只能购买一个。<br><br>';
        else if (n(item.area) > n(await ctx.call('map', 'get_area_wavenum'))) message = '此物品尚未开放出售！<br><br>';
        else {
          const remaining = n(item.num) - amount; await database(ctx).execute(`UPDATE ${sys.tablepre}shopitem SET num = '${text(remaining)}' WHERE sid = '${text(item.sid)}'`);
          player.money = n(player.money) - n(cost); appendLog(ctx, '购买成功。');
          Object.assign(player, { itm0: item.item, itmk0: item.itmk, itme0: item.itme, itms0: item.itms === '∞' ? item.itms : n(item.itms) * amount, itmsk0: item.itmsk });
          await ctx.call('itemmain', 'itemget'); return true;
        }
      }
      appendLog(ctx, message); sys.mode = 'command'; return false;
    },
    async check_in_shop_area(ctx, area) { return values(ctx.state().shops).some(place => eq(place, area)); },
    async act(ctx) {
      const sys = ctx.state('sys'), player = ctx.state('player'), input = ctx.state('input');
      const top = async () => display(ctx, await call(ctx, 'get_sp_shop_filename'), ctx.importInto({ sp_cmd: input.sp_cmd ?? null }, 'sys', 'player', 'logger', 'itemmain', 'itemshop'));
      if (eq(sys.mode, 'command') && eq(sys.command, 'special') && eq(input.sp_cmd, 'sp_shop')) { await top(); return; }
      if (eq(sys.mode, 'special') && text(sys.command).startsWith('shop')) { await call(ctx, 'shoplist', text(sys.command).slice(4, 6)); return; }
      if (eq(sys.mode, 'shop')) {
        if (present(await call(ctx, 'check_in_shop_area', player.pls))) { if (eq(sys.command, 'menu')) sys.mode = 'command'; else if (eq(sys.command, 'shop')) await top(); else await call(ctx, 'itembuy', sys.command, input.shoptype ?? null, input.buynum ?? null); }
        else { appendLog(ctx, '<span class="yellow b">你所在的地区没有商店。</span><br />'); sys.mode = 'command'; }
        return;
      }
      await ctx.next();
    },
    async parse_news(ctx, nid, kind, hour, minute, second, a, b, c, d, e, extra = []) { ({ hour, min: minute, sec: second } = ctx.state('sys')); if (eq(kind, 'itembuy')) return `<li id="nid${text(nid)}">${text(hour)}时${text(minute)}分${text(second)}秒，<span class="lime b">${text(a)}购买了${text(b)}</span></li>`; return await ctx.next(nid, kind, hour, minute, second, a, b, c, d, e, extra); },
  },
};
