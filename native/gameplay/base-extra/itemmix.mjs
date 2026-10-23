import { number as n, text, present, isNumeric, appendLog } from '../numbers.mjs';
import { call, eq, integer } from './helpers.mjs';
import config from './itemmix-config.json' with { type: 'json' };
import { copy as copyArray, immutableArray, readonlyValues } from '../../templates/values.mjs';

const defaultRecipes = immutableArray(config.values.mixinfo);
const { mixinfo: ignoredRecipes, ...configuration } = config.values;

const copy = value => structuredClone(value);
const values = value => value instanceof Map ? [...value.values()] : Object.values(value ?? {});
const key = value => /^(?:0|-?[1-9]\d*)$/.test(text(value)) ? Number(value) : text(value);
const get = (value, at) => value instanceof Map ? value.get(key(at)) : value?.[at];
const fields = ['itm', 'itmk', 'itme', 'itms', 'itmsk'];
const numeric = value => Number(text(value).match(/^[\t\n\r\f\v ]*[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/)?.[0] ?? 0);
const nameCompare = (left, right) => isNumeric(left) && isNumeric(right) && Number.isFinite(Number(left)) && Number.isFinite(Number(right)) ? Number(left) - Number(right) : Buffer.compare(Buffer.from(text(left)), Buffer.from(text(right)));
function templateName(ctx, constant) { const name = ctx.services.templates?.names?.[constant]; if (typeof name !== 'string' || !name) throw new Error(`Native itemmix requires template binding ${constant}.`); return name; }
async function render(ctx, name, scope) { if (typeof ctx.services.templates?.render !== 'function') throw new Error('Native itemmix requires templates.render().'); const html = await ctx.services.templates.render(name, scope); if (typeof html !== 'string') throw new TypeError('Native itemmix renderer must return HTML.'); return html; }
async function replaceCommand(ctx, name, scope) { if (typeof ctx.services.output?.take !== 'function') throw new Error('Native itemmix requires output.take().'); await ctx.services.output.take(); ctx.state('player').cmd = await render(ctx, name, scope); await ctx.services.output.take(); }
function replacePattern(value, pattern) {
  const source = text(pattern), delimiter = source[0], end = source.lastIndexOf(delimiter);
  if (delimiter !== '/' || end < 1 || !/^[ims]*$/.test(source.slice(end + 1))) throw new Error('Unsupported native itemmix name pattern: ' + source);
  return value.replace(new RegExp(source.slice(1, end), [...new Set('g' + source.slice(end + 1))].join('')), '');
}
export const itemmixModule = {
  name: 'itemmix', dependencies: ['sys', 'player', 'logger', 'itemmain', 'input'], optionalDependencies: [], templates: ['itemmix', 'itemmix_cmd', 'itemmix_options', 'itemmix_option_start', 'itemmix_option_end'],
  state: () => ({ mix_type: { normal: '' }, ...copy(configuration) }),
  initialize(ctx) {
    // Configuration is injected before initialize. Only the absent default
    // uses a shared inert template; even an explicit null override is retained.
    const state = ctx.state();
    // The default mixinfo occupied this position before injected extra fields.
    // Retain that export/binding order even though its copy is now deferred.
    const extras = Object.keys(state).filter(key => !['mix_type', 'itmname_ignore', 'mixinfo'].includes(key))
      .map(key => [key, Object.getOwnPropertyDescriptor(state, key)]);
    for (const [key] of extras) delete state[key];
    if (!Object.hasOwn(state, 'mixinfo')) state.mixinfo = copyArray(defaultRecipes);
    for (const [key, descriptor] of extras) Object.defineProperty(state, key, descriptor);
  },
  functions: {
    async get_mixinfo(ctx) { return copyArray(ctx.state().mixinfo); },
    async itemmix_success(ctx) {
      const sys = ctx.state('sys'), player = ctx.state('player'), state = ctx.state(), type = !present(sys.uip?.mixtp) || eq(sys.uip.mixtp, get(state.mix_type, 'normal')) ? '' : get(state.mix_type, sys.uip.mixtp);
      appendLog(ctx, `<span class="yellow b">${text(sys.uip?.itmstr)}</span>${text(type)}合成了<span class="yellow b">${text(player.itm0)}</span><br>`);
      await ctx.call('sys', 'addnews', sys.now, 'itemmix', player.name, player.itm0, type, '', ''); player.wd = n(player.wd) + 1;
      if (text(player.itmk0).startsWith('H') && eq(player.club, 16) && player.itms0 !== sys.nosta) player.itms0 = Math.ceil(n(player.itms0) * 2);
      else if ((eq(player.itmk0, 'EE') || eq(player.itmk0, 'ER')) && eq(player.club, 7)) player.itme0 = n(player.itme0) * 5;
      await ctx.call('itemmain', 'itemget');
    },
    async itemmix_place_check(ctx, list) {
      const slots = values(list); let message;
      if (new Set(slots.map(text)).size !== slots.length) message = '相同道具不能进行合成！<br>';
      else if (slots.length < 2) message = '至少需要2个道具才能进行合成！';
      else if (slots.some(slot => !present(ctx.state('player')['itm' + text(slot)]))) message = '所选择的道具不存在！';
      if (message) { appendLog(ctx, message); ctx.state('sys').mode = 'itemmix'; return false; } return true;
    },
    async itemmix_name_proc(ctx, name) {
      name = text(name).replace(/^[\x00\t\n\r\v ]+|[\x00\t\n\r\v ]+$/g, '');
      for (const pattern of values(ctx.state().itmname_ignore)) name = replacePattern(name, pattern);
      if (name.includes('小黄的')) name = name.replace(/\[\+[0-9]+?\]/gsi, ''); return name.replaceAll('钉棍棒', '棍棒');
    },
    async itemmix_recipe_check(ctx, items) {
      const result = []; if (values(items).length < 2) return result;
      const recipes = await call(ctx, 'get_mixinfo'), names = [];
      for (const item of values(items)) names.push(await call(ctx, 'itemmix_name_proc', get(item, 'itm'))); names.sort(nameCompare);
      for (const recipe of readonlyValues(recipes)) { const materials = [...values(get(recipe, 'stuff'))].sort(nameCompare); if (materials.length === names.length && materials.every((name, index) => nameCompare(name, names[index]) === 0)) { const match = copy(recipe); if (match instanceof Map) match.set('type', 'normal'); else match.type = 'normal'; result.push(match); } }
      return result;
    },
    async parse_itemmix_resultshow(ctx, result) { let textResult = text(get(result, 0)) + '/' + text(await ctx.call('itemmain', 'parse_itmk_words', get(result, 1), 1)) + '/' + text(get(result, 2)) + '/' + text(get(result, 3)); const special = present(get(result, 4)) ? await ctx.call('itemmain', 'parse_itmsk_words', get(result, 4), 1) : ''; if (present(special)) textResult += '/' + text(special); return textResult; },
    async itemmix_option_show(ctx, results) { return await render(ctx, templateName(ctx, 'MOD_ITEMMIX_ITEMMIX_OPTIONS'), ctx.importInto({ mix_res: copy(results) }, 'sys')); },
    async calc_mixmask(ctx, list) { let mask = 0; for (const slot of values(list)) if (numeric(slot) >= 1 && numeric(slot) <= 6) mask |= 1 << (integer(slot) - 1); return mask; },
    async itemmix_get_result(ctx, list) { const player = ctx.state('player'), items = new Map(); for (const slot of values(list)) items.set(key(slot), Object.fromEntries(fields.map(field => [field, player[field + text(slot)] ?? null]))); return await call(ctx, 'itemmix_recipe_check', items); },
    async itemmix(ctx, list, selected = -1) {
      list = copy(list); const sys = ctx.state('sys'), player = ctx.state('player'); if (!present(await call(ctx, 'itemmix_place_check', copy(list)))) return;
      const results = await call(ctx, 'itemmix_get_result', copy(list)), names = values(list).map(slot => player['itm' + text(slot)]);
      // Each HTTP request starts with uip=null. The source's array assignment
      // creates it here; rendering a previous page does not initialize this one.
      sys.uip ??= {};
      sys.uip.itmstr = names.map(text).join(' '); sys.uip.mixmask = await call(ctx, 'calc_mixmask', copy(list));
      if (!values(results).length) { appendLog(ctx, `<span class="yellow b">${text(sys.uip.itmstr)}</span>不能合成！<br>`); await replaceCommand(ctx, await call(ctx, 'get_itemmix_filename'), ctx.importInto({ mlist: list, itemselect: selected, mix_res: results, mixitemname: names }, 'sys', 'player', 'logger', 'itemmix')); }
      else if (values(results).length > 1) {
        if (numeric(selected) >= 0) await call(ctx, 'itemmix_proc', copy(list), copy(get(results, selected) ?? null));
        else { player.cmd = text(player.cmd) + text(await call(ctx, 'itemmix_option_show', copy(results))); sys.uip.itemmix_option_show = 1; }
      } else await call(ctx, 'itemmix_proc', copy(list), copy(values(results)[0]));
    },
    async itemmix_proc(ctx, list, info) {
      const player = ctx.state('player'), sys = ctx.state('sys'); for (const slot of values(list)) await call(ctx, 'itemmix_reduce', 'itm' + text(slot));
      const result = get(info, 'result');
      Object.assign(player, { itm0: get(result, 0) ?? null, itmk0: get(result, 1) ?? null, itme0: get(result, 2) ?? null, itms0: get(result, 3) ?? null, itmsk0: get(result, 4) ?? '' });
      sys.uip ??= {};
      sys.uip.mixcls = present(get(info, 'class')) ? get(info, 'class') : ''; sys.uip.mixtp = get(info, 'type') ?? null; await call(ctx, 'itemmix_success');
    },
    async get_itemmix_filename(ctx) { return templateName(ctx, 'MOD_ITEMMIX_ITEMMIX'); },
    async itemmix_reduce(ctx, item) {
      if (!text(item).startsWith('itm')) return; const slot = text(item).slice(3, 4), player = ctx.state('player'); if (!present(player['itms' + slot])) return;
      if (player['itms' + slot] !== ctx.state('sys').nosta && /^(Y|B|C|X|TN|GB|H|P|V|M|R|ygo)/.test(text(player['itmk' + slot]))) player['itms' + slot] = n(player['itms' + slot]) - 1;
      else player['itms' + slot] = 0;
      if (n(player['itms' + slot]) <= 0) { appendLog(ctx, `<span class="red b">${text(player['itm' + slot])}</span>用光了。<br>`); for (const field of fields) player[field + slot] = field === 'itme' || field === 'itms' ? 0 : ''; }
    },
    async act(ctx) {
      const sys = ctx.state('sys'), player = ctx.state('player'), input = ctx.state('input'), itemcmd = input.itemcmd ?? null;
      if (eq(sys.mode, 'itemmain')) {
        if (eq(sys.command, 'itemmix')) {
          const selected = input.itemselect ?? null, mask = input.mixmask ?? null;
          if (eq(selected, 999)) sys.mode = 'command';
          else {
            const list = []; for (let slot = 1; slot <= 6; slot++) if (mask === null ? present(input['mitm' + slot]) : integer(mask) & (1 << (slot - 1))) list.push(slot);
            if (selected !== null) await call(ctx, 'itemmix', list, selected); else await call(ctx, 'itemmix', list);
            if (present(sys.uip?.itemmix_option_show)) {
              const scope = ctx.importInto({ itemcmd, itemselect: selected, mixmask: mask, mixlist: list }, 'sys', 'player');
              const start = await render(ctx, templateName(ctx, 'MOD_ITEMMIX_ITEMMIX_OPTION_START'), scope), middle = text(player.cmd), end = await render(ctx, templateName(ctx, 'MOD_ITEMMIX_ITEMMIX_OPTION_END'), scope); player.cmd = start + middle + end;
            }
          }
        }
      } else if (eq(sys.mode, 'command') && eq(sys.command, 'itemmain') && eq(itemcmd, 'itemmix')) { appendLog(ctx, '你想要合成什么？'); await replaceCommand(ctx, await call(ctx, 'get_itemmix_filename'), ctx.importInto({ itemcmd }, 'sys', 'player', 'logger')); }
      await ctx.next();
    },
    async parse_news(ctx, nid, kind, hour, minute, second, a, b, c, d, e, extra = []) { ({ hour, min: minute, sec: second } = ctx.state('sys')); if (eq(kind, 'itemmix')) return `<li id="nid${text(nid)}">${text(hour)}时${text(minute)}分${text(second)}秒，<span class="lime b">${text(a)}${text(c)}合成了${text(b)}</span></li>`; return await ctx.next(nid, kind, hour, minute, second, a, b, c, d, e, extra); },
  },
};
