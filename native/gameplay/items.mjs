import { readFile } from 'node:fs/promises';
import { reference } from '../modules/registry.mjs';
import { text, isNumeric, present, round, appendLog, sameDurability } from './numbers.mjs';

const call = (ctx, name, ...args) => ctx.call('itemmain', name, ...args);
const fields = ['itm', 'itmk', 'itme', 'itms', 'itmsk'];
// These source paths deliberately use PHP 7.4's numeric-prefix conversion:
// durability comparisons, integer casts, and += on fields read from MySQL.
const numeric = value => typeof value === 'number' ? value : value === true ? 1
  : Number(text(value).match(/^[\t\n\r\f\v ]*[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/)?.[0] ?? 0);
const eq = sameDurability;
const emptyItem = item => Object.assign(item, { itm: '', itmk: '', itme: 0, itms: 0, itmsk: '' });

/** A real alias, including writes made by asynchronous itemuse hooks. */
function itemSlot(player, slot) {
  const name = text(slot);
  const suffix = name.startsWith('itm') ? name.slice(3, 4) : null;
  const keys = suffix === null ? [name, `${name}k`, `${name}e`, `${name}s`, `${name}sk`]
    : fields.map(field => field + suffix);
  const result = {};
  fields.forEach((field, index) => Object.defineProperty(result, field, {
    enumerable: true, get: () => player[keys[index]], set: value => { player[keys[index]] = value; },
  }));
  return result;
}

function packSlot(player, position) {
  // itemuse/itemmerge/itemmove concatenate the entire input; drop/destroy only
  // consume one digit. Keep that original distinction at the input boundary.
  const result = {};
  for (const field of fields) Object.defineProperty(result, field, {
    enumerable: true, get: () => player[field + text(position)], set: value => { player[field + text(position)] = value; },
  });
  return result;
}

function database(ctx) {
  if (!ctx.services.database) throw new Error('Native itemmain requires services.database.');
  return ctx.services.database;
}

async function render(ctx, constant, locals = {}) {
  const templates = ctx.services.templates;
  const name = templates?.names?.[constant];
  if (typeof name !== 'string' || !name || typeof templates.render !== 'function') {
    throw new Error(`Native itemmain requires template binding and renderer for ${constant}.`);
  }
  const result = await templates.render(name, ctx.importInto(locals, 'sys', 'player', 'logger', 'itemmain'));
  if (typeof result !== 'string') throw new TypeError('Native itemmain template renderer must return HTML text.');
  return result;
}

async function takeOutput(ctx) {
  if (typeof ctx.services.output?.take !== 'function') throw new Error('Native itemmain requires output.take() to preserve buffered HTML.');
  const result = await ctx.services.output.take();
  if (typeof result !== 'string') throw new TypeError('Native itemmain output.take() must return HTML text.');
  return result;
}

async function resourceLines(filename) {
  // These files are original CSV resources with a protective first line, not
  // executable logic. openfile keeps newline bytes on each returned row.
  const source = await readFile(new URL(`../../engine/include/modules/base/itemmain/config/${filename}`, import.meta.url), 'utf8');
  const result = source.replaceAll('\n', '\n<:game:>').split('<:game:>');
  if (result.at(-1) === '' || result.at(-1) === '\r') result.pop();
  return result.length ? result : [''];
}

/** Complete itemmain main.php/itemuse.php/itemcmd.php port. Data resources and
 * template identities stay upstream; actual rendering and SQL are host services.
 * itemuse/theitem and item_destroy_core/player use live native object aliases.
 * All extension points are awaited, including otherwise pure display functions.
 */
export const itemModule = {
  name: 'itemmain',
  dependencies: ['sys', 'map', 'player', 'logger', 'input'],
  optionalDependencies: ['explore', 'npc'],
  templates: ['itemmerge', 'itemmove', 'itemdrop', 'itemmerge0', 'itemdrop0', 'itemfind', 'itmcommand', 'itmcommand_subpage', 'profile_equipments', 'profile_equipments_short', 'profile_backpack', 'profile_backpack_short'],
  state: () => ({
    tmp_itmsk_arr_pool: {}, itemfind_extra_log: '',
    item_equip_list: ['itm0', 'itm1', 'itm2', 'itm3', 'itm4', 'itm5', 'itm6'],
    item_hotkey_id_list: { 4: 'qq', 5: 'ww', 6: 'ee', 1: 'aa', 2: 'ss', 3: 'dd' },
    itemmain_drophint: '将离开视线', item_allow_find_and_use: true,
    nosta: '∞', nospk: '--', item_obbs: 60, map_noitemdrop_arealist: [0, 34],
    itemkind_equipable: ['W', 'D', 'A'], iteminfo: { N: '无', X: '合成专用', Y: '特殊', Z: '特殊' },
    itemspkinfo: { x: '奇迹', z: '天然', '^TEST': '蛋疼' },
    itemspkdesc: { x: '人类，可以超越神么？……', z: '使用后会变成冴冴一样的天然呆', '^TEST': '你的蛋疼度增加<:skn:>%' },
    itemspkdesc_help: {}, itemspkremark: { x: '……', z: '……' },
  }),
  initialize(ctx) { ctx.state('player').equip_list = [...ctx.state('player').equip_list, ...ctx.state().item_equip_list]; },
  functions: {
    async playerdata_construct_process(ctx, data) {
      data = await ctx.next(structuredClone(data));
      for (const field of ctx.state('player').equip_list) {
        const key = field.startsWith('itm') ? `itms${field.slice(3)}` : `${field}s`;
        if (data[key] !== ctx.state().nosta) data[key] = Math.trunc(numeric(data[key]));
      }
      return data;
    },
    async check_mergable(ctx, kind) {
      if (/^(WC|WD|WF|Y|B|C|EI|TN|G|M|V|ygo|fy|p|EA|EC)/.test(text(kind)) && !/^W[A-Z][A-Z]/.test(text(kind))) return 1;
      return /^(H|P)/.test(text(kind)) ? 2 : 0;
    },
    async parse_itmname_words_shell(ctx, name, player = null, ellipsis = 0, width = 20, end = 1) {
      return await call(ctx, 'parse_itmname_words', name, ellipsis, width, end);
    },
    async parse_itmname_words(ctx, name, ellipsis = 0, width = 20, end = 1) {
      if (!present(ellipsis)) return name;
      width = Math.max(numeric(width), 6);
      const chars = Array.from(text(name));
      let size = 0, index = 0;
      for (; index < chars.length; index++) {
        size += Buffer.byteLength(chars[index], 'utf8') > 1 ? 1.8 : 1;
        if (size >= width) break;
      }
      const tail = Math.trunc(numeric(end));
      return index === chars.length ? name : chars.slice(0, index - 1).join('') + '...' + (tail > 0 ? chars.slice(-tail).join('') : '');
    },
    async parse_itmnum_words(ctx, value, ellipsis = 0) {
      if (!present(ellipsis) || !isNumeric(value)) return value;
      if (numeric(value) > 100000000) return text(round(numeric(value) / 10000000) % 10 ? round(numeric(value) / 10000000) / 10 : round(numeric(value) / 100000000)) + '亿';
      if (numeric(value) > 10000) return text(round(numeric(value) / 1000) % 10 ? round(numeric(value) / 1000) / 10 : round(numeric(value) / 10000)) + '万';
      return value;
    },
    async parse_itmk_words(ctx, value, reveal = 0) {
      if (!present(value)) return '';
      let best = -1, result = '未知';
      for (const [key, label] of Object.entries(ctx.state().iteminfo)) {
        if (text(value).startsWith(key) && Buffer.byteLength(key) > best) { best = Buffer.byteLength(key); result = label; }
      }
      return result;
    },
    async parse_itmk_desc() { return ''; },
    async count_itmsk_num(ctx, value, ignoreInvisible = 1) { return (await call(ctx, 'get_itmsk_array', value)).length; },
    async get_itmsk_array(ctx, value, notIgnore = 0) {
      const source = text(value), cache = ctx.state().tmp_itmsk_arr_pool;
      if (Object.hasOwn(cache, source) && cache[source].length && !present(notIgnore)) return [...cache[source]];
      const result = [];
      let index = 0;
      while (index < source.length) {
        let part = source[index++];
        if (present(part) && (present(notIgnore) || part !== '|')) {
          if (part === '^') {
            let beforeDigit = true;
            while (index < source.length) {
              if (source[index] >= '0' && source[index] <= '9') beforeDigit = false;
              else if (!beforeDigit) break;
              part += source[index++];
            }
          }
          result.push(part);
        }
      }
      Object.defineProperty(cache, source, { value: [...result], writable: true, configurable: true, enumerable: true });
      return result;
    },
    async check_in_itmsk(ctx, mark, values, count = 0) {
      if (!Array.isArray(values)) values = await call(ctx, 'get_itmsk_array', values);
      if (!values.some(value => eq(value, mark))) return false;
      return present(count) ? values.filter(value => value === mark).length : true;
    },
    async replace_in_itmsk(ctx, needle, replacement, value, dummy = 0) {
      let result = text(value);
      for (const [index, search] of (Array.isArray(needle) ? needle : [needle]).entries()) {
        // PHP str_replace ignores an empty search term. An array replacement
        // applies positionally, using '' when it has fewer entries than search.
        const substitute = Array.isArray(replacement) ? replacement[index] ?? '' : replacement;
        if (text(search)) result = result.replaceAll(text(search), text(substitute));
      }
      return result;
    },
    async get_itmsk_words_single(ctx, value) { const words = ctx.state().itemspkinfo; return Object.hasOwn(words, value) && present(words[value]) ? words[value] : ''; },
    async get_itmsk_desc_single(ctx, value) { const words = ctx.state().itemspkdesc; return Object.hasOwn(words, value) && present(words[value]) ? words[value] : ''; },
    async replace_crlf(ctx, value) { return text(value).replaceAll('<!--CRLF-->', '<BR />'); },
    async parse_itmsk_words(ctx, value, simple = 0, ellipsis = 0) {
      if (!present(value) || isNumeric(value) || text(value).startsWith('=')) return present(simple) ? '' : ctx.state().nospk;
      const array = await call(ctx, 'get_itmsk_array', value), seen = [];
      let result = '', index = 0, abbreviated = false;
      for (const attribute of array) {
        if (!seen.includes(attribute)) {
          const word = await call(ctx, 'get_itmsk_words_single', attribute);
          if (!present(word)) continue;
          if (!index) result += word;
          else if (present(ellipsis) && index >= 3 && index < array.length - 1) {
            if (!abbreviated) { result += '+…'; abbreviated = true; }
          } else result += `+${word}`;
        }
        index++;
        if (attribute !== 'z' && attribute !== 'x') seen.push(attribute);
      }
      return result;
    },
    async parse_itmuse_desc() { return ''; },
    async parse_itmsk_desc(ctx, value) {
      if (!present(value) || isNumeric(value) || text(value).startsWith('=')) return '';
      let result = '';
      const attributes = await call(ctx, 'get_itmsk_array', value);
      for (const attribute of attributes) {
        const word = await call(ctx, 'get_itmsk_words_single', attribute);
        if (present(word)) result += `${word}：${await call(ctx, 'get_itmsk_desc_single', attribute)}<br>`;
      }
      // PHP 7.4 substr('', 0, -4) returns false when every parsed attribute is
      // unknown; an empty attribute list bypasses that substr call entirely.
      return attributes.length && !result ? false : result.slice(0, -4);
    },
    async parse_item_words(ctx, data, simple = 0, ellipsis = 0) {
      data = structuredClone(data);
      const result = {};
      for (const field of ctx.state('player').equip_list) {
        const [, base, suffix] = field.match(/^(.*?)([0-9]*)$/);
        const kind = `${base}k${suffix}`, effect = `${base}e${suffix}`, durability = `${base}s${suffix}`, attribute = `${base}sk${suffix}`;
        result[`${field}_words`] = await call(ctx, 'parse_itmname_words_shell', data[field], data, ellipsis);
        result[`${field}_words_short`] = await call(ctx, 'parse_itmname_words_shell', data[field], data, 1, 15);
        result[`${field}_words_noelli`] = await call(ctx, 'parse_itmname_words_shell', data[field], data, 0);
        result[`${kind}_words`] = await call(ctx, 'parse_itmk_words', data[kind]);
        result[`${effect}_words`] = await call(ctx, 'parse_itmnum_words', data[effect], ellipsis);
        result[`${durability}_words`] = await call(ctx, 'parse_itmnum_words', data[durability], ellipsis);
        result[`${kind}_desc`] = await call(ctx, 'parse_itmk_desc', data[kind], data[attribute]);
        result[`${attribute}_words`] = await call(ctx, 'parse_itmsk_words', data[attribute], simple, ellipsis);
        result[`${attribute}_desc`] = await call(ctx, 'parse_itmsk_desc', data[attribute]);
        result[`${field}_itmuse_desc`] = await call(ctx, 'parse_itmuse_desc', data[field], data[kind], data[effect], data[durability], data[attribute]);
      }
      return result;
    },
    async parse_interface_profile(ctx) {
      const player = ctx.state('player');
      await ctx.call('player', 'update_sdata');
      if (!present(player.tpldata.itm1_words)) {
        const words = await call(ctx, 'parse_item_words', player.sdata, 0, 1);
        for (const [key, value] of Object.entries(words)) if (!Object.hasOwn(player.tpldata, key)) player.tpldata[key] = value;
      }
      await ctx.next();
    },
    async rs_game(ctx, mode) { await ctx.next(mode); if (numeric(mode) & 16) await call(ctx, 'lay_mapitem'); },
    async lay_mapitem(ctx, location = -1) {
      const locations = await ctx.call('map', 'get_all_plsno');
      const lines = await call(ctx, 'itemlist_data_process', await call(ctx, 'get_itemfilecont'));
      const wave = await ctx.call('map', 'get_area_wavenum');
      const rows = [];
      let count = 0;
      for (let index = 1; index < lines.length; index++) {
        if (!present(lines[index]) || text(lines[index]).startsWith('=') || !text(lines[index]).includes(',')) continue;
        const [area, map, amount, name, kind, effect, durability, attribute] = await call(ctx, 'mapitem_row_data_seperate', lines[index], index);
        if (!present(durability) || !(eq(area, wave) || eq(area, 99) || (eq(area, 98) && numeric(wave) > 0)) || !(eq(location, -1) || eq(location, map))) continue;
        for (let remaining = numeric(amount); remaining > 0; remaining--) {
          let destination = map;
          if (eq(map, 99)) do { destination = locations[ctx.services.random.arrayRand(locations)]; }
          while (ctx.state().map_noitemdrop_arealist.some(value => eq(value, destination)));
          const item = await call(ctx, 'mapitem_single_data_attr_process', name, kind, effect, durability, attribute, destination, count++);
          if (present(item[3])) rows.push(`('${text(item[0])}', '${text(item[1])}','${text(item[2])}','${text(item[3])}','${text(item[4])}','${text(item[5])}')`);
        }
      }
      if (rows.length) await database(ctx).execute(`INSERT INTO ${text(ctx.state('sys').tablepre)}mapitem (itm,itmk,itme,itms,itmsk,pls) VALUES ${rows.join(',')}`);
    },
    async is_equipable(ctx, kind) { return ctx.state().itemkind_equipable.some(value => text(kind).startsWith(value)); },
    async itemlist_data_process(ctx, data) { return structuredClone(data); },
    async mapitem_row_data_seperate(ctx, data, index = -1) { return await call(ctx, 'mapitem_row_data_process', text(data).split(','), index); },
    async mapitem_row_data_process(ctx, data, index = -1) {
      data = structuredClone(data);
      if (present(data[7]) && text(data[7]).startsWith('=')) {
        const name = text(data[7]).slice(1); data[7] = '';
        const rows = await database(ctx).query(`SELECT pid FROM ${text(ctx.state('sys').tablepre)}players WHERE name='${name}' AND type>0`);
        const pid = rows[0]?.pid;
        if (present(pid)) {
          if (ctx.hasModule('poison')) await ctx.call('poison', 'poison_record_pid', reference(data, 7), pid);
          else data[7] = pid;
        }
      }
      return data;
    },
    async mapitem_single_data_attr_process(ctx, name, kind, effect, durability, attribute, map, count = -1) { return [name, kind, effect, durability, attribute, map]; },
    async get_itemfilecont() { return await resourceLines('mapitem.config.php'); },
    async get_startingitemfilecont() { return await resourceLines('stitem.config.php'); },
    async get_startingwepfilecont() { return await resourceLines('stwep.config.php'); },
    async startingitem_row_data_seperate(ctx, data) { return await call(ctx, 'startingitem_row_data_process', text(data).split(',')); },
    async startingitem_row_data_process(ctx, data) { return structuredClone(data); },
    async init_enter_battlefield_items(ctx, data) {
      data = structuredClone(data);
      Object.assign(data, { arb: data.gd === 'm' ? '男生校服' : '女生校服', arbk: 'DB', arbe: 5, arbs: 15,
        itm1: '面包', itmk1: 'HH', itme1: 100, itms1: 30, itm2: '矿泉水', itmk2: 'HS', itme2: 100, itms2: 30 });
      const weapons = await call(ctx, 'get_startingwepfilecont');
      do {
        const row = await call(ctx, 'startingitem_row_data_seperate', weapons[ctx.services.random.rand(1, weapons.length - 1)]);
        ['wep', 'wepk', 'wepe', 'weps', 'wepsk'].forEach((key, index) => { data[key] = row[index] ?? null; });
      } while (!present(data.wepk));
      const items = await call(ctx, 'get_startingitemfilecont');
      for (let index = 3; index <= 4; index++) do {
        const row = await call(ctx, 'startingitem_row_data_seperate', items[ctx.services.random.rand(1, items.length - 1)]);
        fields.forEach((field, offset) => { data[field + index] = row[offset] ?? null; });
      } while (!present(data[`itms${index}`]));
      return data;
    },
    async discover_item(ctx) {
      const rows = await database(ctx).query(`SELECT * FROM ${text(ctx.state('sys').tablepre)}mapitem WHERE pls = '${text(ctx.state('player').pls)}'`);
      if (!rows.length) { appendLog(ctx, '<span class="yellow b">周围找不到任何物品。</span><br>'); ctx.state('sys').mode = 'command'; return false; }
      const pool = [];
      for (const row of rows) if (present(await call(ctx, 'discover_item_filter', structuredClone(row)))) pool.push(row);
      ctx.services.random.shuffle(pool);
      ctx.state('player').itms0 = await call(ctx, 'focus_item', pool[0] ?? null);
      if (present(ctx.state('player').itms0)) {
        await call(ctx, 'itemfind');
        await call(ctx, 'discover_extra_item', pool.slice(1));
        return true;
      }
      appendLog(ctx, '但是什么都没有发现。<br>');
      ctx.state('sys').mode = 'command';
      return false;
    },
    async discover_extra_item() {},
    async discover_item_filter() { return true; },
    async focus_item(ctx, item) {
      if (item?.iid == null) return false;
      if (numeric(item.iid) > 0) await database(ctx).execute(`DELETE FROM ${text(ctx.state('sys').tablepre)}mapitem WHERE iid='${text(item.iid)}'`);
      for (const field of fields) ctx.state('player')[field + '0'] = item[field];
      return item.itms;
    },
    async calculate_itemfind_obbs(ctx) { return ctx.state().item_obbs; },
    async calculate_itemfind_obbs_multiplier() { return 1; },
    async discover(ctx, mode) { return present(await call(ctx, 'check_discover_item_found')) ? await call(ctx, 'discover_item') : await ctx.next(mode); },
    async check_discover_item_found(ctx, buff = 0) {
      const chance = numeric(buff) + numeric(await call(ctx, 'calculate_itemfind_obbs')) * numeric(await call(ctx, 'calculate_itemfind_obbs_multiplier'));
      return ctx.services.random.rand(0, 99) < chance;
    },
    async pre_act(ctx) {
      const sys = ctx.state('sys'), player = ctx.state('player');
      if (present(player.hp) && present(player.itms0) && !text(player.action).includes('corpse') && !['itm0', 'dropitm0', 'itemget', 'itemmerge', 'enter'].includes(sys.command) && !text(sys.command).includes('swap')) {
        appendLog(ctx, '你的双手都已经抓满了东西。为了完成所想，你集中意念召唤幻肢……<br>什么都没有发生，除了你的脑壳痛了起来。<br><br>');
        sys.mode = 'command'; sys.command = 'menu';
      }
      await ctx.next();
    },
    async act(ctx) {
      const sys = ctx.state('sys'), player = ctx.state('player'), input = ctx.state('input');
      if (sys.mode === 'command' && text(sys.command).startsWith('itm')) { await call(ctx, 'itemuse_wrapper', text(sys.command).slice(3)); return; }
      if (sys.mode === 'command' && sys.command === 'itemmain' && ['itemmerge', 'itemmove', 'itemdrop'].includes(input.itemcmd)) {
        await takeOutput(ctx);
        player.cmd = await render(ctx, `MOD_ITEMMAIN_${input.itemcmd.toUpperCase()}`, { itemcmd: input.itemcmd });
      }
      if (sys.mode === 'itemmain') {
        if (sys.command === 'itemget') await call(ctx, 'itemget_process');
        else if (sys.command === 'itemadd') await call(ctx, 'itemadd');
        else if (sys.command === 'itemmerge') {
          if (input.merge2 === 'n') await call(ctx, 'itemadd');
          else {
            const merged = await call(ctx, 'itemmerge', input.merge1, input.merge2);
            if (!present(merged) && !eq(player[`itm${text(input.merge1)}`], player[`itm${text(input.merge2)}`])) {
              appendLog(ctx, '<br>系统将你的命令自动识别为道具移动。');
              await call(ctx, 'itemmove', input.merge1, input.merge2);
            }
          }
        } else if (sys.command === 'itemmove') await call(ctx, 'itemmove', input.from, input.to);
        else if (text(sys.command).startsWith('drop')) await call(ctx, 'itemdrop', text(sys.command).slice(4));
        else if (text(sys.command).startsWith('off')) await call(ctx, 'itemoff', text(sys.command).slice(3));
        else if (text(sys.command).startsWith('swap')) {
          const slot = text(sys.command).slice(4);
          if (slot.startsWith('itm')) {
            if (present(player[slot.replaceAll('itm', 'itms')])) await call(ctx, 'itemdrop', slot);
            await call(ctx, 'itemadd', slot.slice(3, 4));
          }
        }
      }
      await ctx.next();
    },
    async base64_encode_comp_itmsk(ctx, value) { return value; },
    async base64_decode_comp_itmsk(ctx, value) { return value; },
    async itms_reduce(ctx, item, amount = 1) {
      if (item.itms !== ctx.state().nosta) {
        item.itms = numeric(item.itms) - numeric(amount);
        if (item.itms <= 0) { appendLog(ctx, `<span class="red b">${text(item.itm)}</span>用光了。<br>`); emptyItem(item); }
      }
    },
    async itemuse_wrapper(ctx, position) {
      const sys = ctx.state('sys');
      if (numeric(position) < 0 || numeric(position) > 6) { appendLog(ctx, '此道具不存在，请重新选择。'); sys.mode = 'command'; return; }
      const item = packSlot(ctx.state('player'), position); item.itmn = position;
      if (numeric(item.itms) <= 0 && !eq(item.itms, ctx.state().nosta)) {
        emptyItem(item); appendLog(ctx, '此道具不存在，请重新选择。<br>'); sys.mode = 'command'; return;
      }
      await call(ctx, 'itemuse', item);
      sys.mode = 'command';
    },
    async itemuse(ctx, item) { appendLog(ctx, `你使用了道具 <span class="yellow b">${text(item.itm)}</span> 。<br>但是什么也没有发生。<br>`); },
    async parse_news(ctx, id, news, hour, minute, second, a, b, c, d, e, extra = []) {
      if (news === 'itemuse') return `<li id="nid${text(id)}">${text(hour)}时${text(minute)}分${text(second)}秒，<span class="lime b">${text(a)}使用了${text(b)}</span></li>`;
      return await ctx.next(id, news, hour, minute, second, a, b, c, d, e, extra);
    },
    async itemfind(ctx) {
      const player = ctx.state('player');
      if (!present(player.itm0) || !present(player.itmk0) || !present(player.itms0)) { appendLog(ctx, '获取物品信息错误！'); ctx.state('sys').mode = 'command'; return; }
      await call(ctx, 'show_itemfind');
    },
    async parse_interface_gameinfo(ctx) {
      const player = ctx.state('player'), state = ctx.state();
      if (present(player.itm0) && present(player.itmk0) && present(player.itms0)) {
        const name = present(player.tpldata.itm0_words_noelli) ? player.tpldata.itm0_words_noelli : player.itm0;
        player.tpldata.itmsk0_words = await call(ctx, 'parse_itmsk_words', player.itmsk0);
        if (present(state.itemfind_extra_log)) appendLog(ctx, '<:ex_log:>');
        appendLog(ctx, !text(ctx.state('logger').log).includes(text(player.itm0)) ? `<br>发现了物品 <span class='yellow b'>${text(name)}</span>，<br>` : `<br>你正握着物品 <span class='yellow b'>${text(name)}</span>，<br>`);
        appendLog(ctx, `类型：${text(player.tpldata.itmk0_words)}`);
        if (present(player.itmsk0) && !isNumeric(player.itmsk0) && present(player.tpldata.itmsk0_words)) appendLog(ctx, `，属性：${text(player.tpldata.itmsk0_words)}`);
        appendLog(ctx, `，效：${text(player.itme0)}，耐：${text(player.itms0)}。`);
        if (present(state.itemfind_extra_log)) ctx.state('logger').log = ctx.state('logger').log.replaceAll('<:ex_log:>', text(state.itemfind_extra_log));
      }
      await ctx.next();
    },
    async show_itemfind(ctx) { if (present(ctx.state('player').itms0)) ctx.state('player').cmd = await render(ctx, 'MOD_ITEMMAIN_ITEMFIND'); },
    async itemget(ctx) { await call(ctx, 'itemget_process'); },
    async get_item_allow_find_and_use(ctx) { return present(ctx.state().item_allow_find_and_use); },
    async itemget_process(ctx) {
      const player = ctx.state('player'), item = packSlot(player, 0);
      appendLog(ctx, `获得了物品<span class="yellow b">${text(item.itm)}</span>。<br>`);
      if (eq(await call(ctx, 'check_mergable', item.itmk), 1) && item.itms !== ctx.state('sys').nosta) {
        const candidates = [itemSlot(player, 'wep'), ...Array.from({ length: 6 }, (_, index) => packSlot(player, index + 1))];
        for (const [index, other] of candidates.entries()) {
          if ((index === 0 || present(other.itms)) && ['itm', 'itmk', 'itme', 'itmsk'].every(field => eq(item[field], other[field]))) {
            other.itms = numeric(other.itms) + numeric(item.itms);
            appendLog(ctx, index === 0 ? `与装备着的武器<span class="yellow b">${text(other.itm)}</span>合并了。` : `与包裹里的<span class="yellow b">${text(item.itm)}</span>合并了。`);
            emptyItem(item); ctx.state('sys').mode = 'command'; return;
          }
        }
      } else if (eq(await call(ctx, 'check_mergable', item.itmk), 2) && item.itms !== ctx.state('sys').nosta) {
        const matches = [];
        for (let index = 1; index <= 6; index++) {
          const other = packSlot(player, index);
          if (present(other.itms) && eq(item.itm, other.itm) && eq(item.itme, other.itme) && text(item.itmk)[1] === text(other.itmk)[1] && eq(await call(ctx, 'check_mergable', other.itmk), 2)) matches.push(index);
        }
        if (matches.length) { await call(ctx, 'itemget_mergable_type2_process', matches); return; }
      }
      await call(ctx, 'itemadd');
    },
    async itemget_mergable_type2_process(ctx, sameitem) {
      const html = await render(ctx, 'MOD_ITEMMAIN_ITEMMERGE0', { sameitem: structuredClone(sameitem) });
      ctx.state('player').cmd = await takeOutput(ctx) + html;
    },
    async itemdrop_valid_check(ctx, name, kind, effect, durability, attribute, position) {
      if (!present(durability) || !present(kind) || kind === 'WN' || kind === 'DN') { appendLog(ctx, '该物品不存在！<br>'); return false; }
      return true;
    },
    async itemdrop(ctx, position) {
      const player = ctx.state('player');
      const item = itemSlot(player, text(position).startsWith('ar') ? text(position).slice(0, 3) : position);
      if (!present(await call(ctx, 'itemdrop_valid_check', ...fields.map(field => item[field]), position))) { ctx.state('sys').mode = 'command'; return; }
      const id = await call(ctx, 'itemdrop_query', ...fields.map(field => item[field]), player.pls);
      const result = { iid: id, ...item };
      appendLog(ctx, `你丢弃了<span class="red b">${text(item.itm)}</span>。<br>`);
      ctx.state('sys').mode = 'command';
      await call(ctx, 'item_destroy_core', position, player.sdata);
      return result;
    },
    async itemdrop_query(ctx, name, kind, effect, durability, attribute, location) {
      const result = await database(ctx).execute(`INSERT INTO ${text(ctx.state('sys').tablepre)}mapitem (itm, itmk, itme, itms, itmsk ,pls) VALUES ('${text(name)}', '${text(kind)}', '${text(effect)}', '${text(durability)}', '${text(attribute)}', '${text(location)}')`);
      return result.insertId;
    },
    async item_destroy_core(ctx, position, player) {
      const item = itemSlot(player, position);
      if (position === 'wep') Object.assign(item, { itm: ctx.state('sys').nowep, itmk: 'WN', itme: 0, itms: ctx.state().nosta, itmsk: '' });
      else emptyItem(item);
    },
    async itemoff_valid_check(ctx, name, kind, effect, durability, attribute) {
      if (!present(durability) || !present(kind) || kind === 'WN' || kind === 'DN') { appendLog(ctx, '该物品不存在！<br>'); return false; }
      return true;
    },
    async itemoff(ctx, position) {
      const player = ctx.state('player');
      const item = itemSlot(player, text(position).startsWith('ar') ? text(position).slice(0, 3) : position);
      if (!present(await call(ctx, 'itemoff_valid_check', ...fields.map(field => item[field])))) { ctx.state('sys').mode = 'command'; return; }
      appendLog(ctx, `你卸下了装备<span class="yellow b">${text(item.itm)}</span>。<br>`);
      Object.assign(packSlot(player, 0), item);
      if (position === 'wep') Object.assign(item, { itm: '拳头', itmk: 'WN', itme: 0, itms: ctx.state('sys').nosta, itmsk: '' });
      else emptyItem(item);
      await call(ctx, 'itemget');
    },
    async get_pack_blank(ctx) { for (let index = 1; index <= 6; index++) if (!present(ctx.state('player')[`itms${index}`])) return index; return 0; },
    async itemadd(ctx, position = 0) {
      const player = ctx.state('player'), item = packSlot(player, 0);
      if (!present(item.itms)) { appendLog(ctx, '你没有捡取物品。<br>'); ctx.state('sys').mode = 'command'; return; }
      const index = numeric(position) > 0 && !present(player[`itms${text(position)}`]) ? position : await call(ctx, 'get_pack_blank');
      if (numeric(index) > 0) {
        appendLog(ctx, `将<span class="yellow b">${text(item.itm)}</span>放入包裹。<br>`);
        Object.assign(packSlot(player, index), item); emptyItem(item);
        ctx.state('sys').mode = 'command'; return;
      }
      const html = await render(ctx, 'MOD_ITEMMAIN_ITEMDROP0');
      player.cmd = await takeOutput(ctx) + html;
    },
    async itemmerge(ctx, first, second) {
      const sys = ctx.state('sys');
      if (eq(first, second)) { appendLog(ctx, '需要选择两个物品才能进行合并！'); sys.mode = 'itemmerge'; return false; }
      const left = packSlot(ctx.state('player'), first), right = packSlot(ctx.state('player'), second);
      if (!present(left.itms) || !present(right.itms)) { appendLog(ctx, '请选择正确的物品进行合并！'); sys.mode = 'command'; return false; }
      if (eq(left.itms, ctx.state('sys').nosta) || eq(right.itms, ctx.state('sys').nosta)) { appendLog(ctx, '耐久是无限的物品不能合并！'); sys.mode = 'command'; return false; }
      if (!eq(left.itm, right.itm) || !eq(left.itme, right.itme)) {
        appendLog(ctx, `<span class="yellow b">${text(left.itm)}</span>与<span class="yellow b">${text(right.itm)}</span>不是同名同效果物品，不能合并！`); sys.mode = 'command'; return false;
      }
      if (eq(left.itmk, right.itmk) && eq(left.itmsk, right.itmsk) && eq(await call(ctx, 'check_mergable', left.itmk), 1)) {
        right.itms = numeric(right.itms) + numeric(left.itms); emptyItem(left);
        appendLog(ctx, `你合并了<span class="yellow b">${text(right.itm)}</span>。`); sys.mode = 'command'; return true;
      }
      if (eq(await call(ctx, 'check_mergable', left.itmk), 2) && eq(await call(ctx, 'check_mergable', right.itmk), 2) && text(left.itmk)[1] === text(right.itmk)[1]) {
        if (text(left.itmk).startsWith('P') || text(right.itmk).startsWith('P')) {
          const poison = Math.max(Math.trunc(numeric(text(left.itmk).slice(2))), Math.trunc(numeric(text(right.itmk).slice(2))));
          right.itmk = `P${text(left.itmk).slice(1, 2)}${text(poison)}`;
          if (present(left.itmsk)) right.itmsk = left.itmsk;
        }
        right.itms = numeric(right.itms) + numeric(left.itms); emptyItem(left);
        appendLog(ctx, `你合并了 <span class="yellow b">${text(right.itm)}</span>。`); sys.mode = 'command'; return true;
      }
      appendLog(ctx, `<span class="yellow b">${text(left.itm)}</span>与<span class="yellow b">${text(right.itm)}</span>${!eq(left.itmk, right.itmk) || !eq(left.itmsk, right.itmsk) ? '不是同类型同属性物品' : '不是可以堆叠的物品'}，不能合并！`);
      return false;
    },
    async itemmove(ctx, from, to) {
      if (!present(from) || !isNumeric(from) || !present(to) || !isNumeric(to) || numeric(from) < 1 || numeric(to) < 1 || numeric(from) > 6 || numeric(to) > 6) { appendLog(ctx, '错误的包裹位置参数。<br>'); return false; }
      if (eq(from, to)) { appendLog(ctx, '同一物品无法互换。<br>'); return false; }
      const left = packSlot(ctx.state('player'), from), right = packSlot(ctx.state('player'), to);
      if (!present(left.itms)) { appendLog(ctx, '错误的道具参数。<br>'); return false; }
      if (!present(right.itms)) {
        appendLog(ctx, `将<span class="yellow b">${text(left.itm)}</span>移动到了<span class="yellow b">包裹${text(to)}</span>。<br>`);
        Object.assign(right, left); emptyItem(left);
      } else {
        appendLog(ctx, `将<span class="yellow b">${text(left.itm)}</span>与<span class="yellow b">${text(right.itm)}</span>互换了位置。<br>`);
        const previous = { ...right }; Object.assign(right, left); Object.assign(left, previous);
      }
      return true;
    },
  },
};
