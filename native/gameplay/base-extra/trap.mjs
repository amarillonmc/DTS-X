import { isReferenceDescriptor } from '../../templates/values.mjs';
import { readFile } from 'node:fs/promises';
import { number as n, text, present, isNumeric, round, appendLog } from '../numbers.mjs';
import { call, eq, min } from './helpers.mjs';
import config from './trap-config.json' with { type: 'json' };

const fields = ['itm', 'itmk', 'itme', 'itms', 'itmsk'];
function database(ctx) {
  if (!ctx.services.database) throw new Error('Native trap requires services.database.');
  return ctx.services.database;
}
const clear = player => Object.assign(player, { itm0: '', itmk0: '', itme0: 0, itms0: 0, itmsk0: '' });
function parameterCopy(value) {
  const result = structuredClone(value);
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) if (isReferenceDescriptor(descriptor)) Object.defineProperty(result, key, descriptor);
  return result;
}
function argument(value) {
  const descriptor = value && Object.getOwnPropertyDescriptor(value, 'value');
  return isReferenceDescriptor(descriptor) ? value.value : value;
}
/** Original map traps, deployment, evasion/reuse and attributed deaths. SQL
 * uses the original pre-escaped game fields; the host owns the async database.
 * Trap damage hooks get value copies of the item and live player records. */
export const trapModule = {
  name: 'trap', dependencies: ['sys', 'map', 'itemmain', 'logger', 'player', 'lvlctl'], optionalDependencies: ['explore', 'metman', 'npc'], templates: [],
  state: () => ({ playerflag: null, selflag: null, trname: null, trtype: null, trprefix: null, ...structuredClone(config.values) }),
  initialize(ctx) { ctx.state('itemmain').iteminfo.T = '陷阱'; },
  functions: {
    async rs_game(ctx, mode) {
      await ctx.next(mode);
      if (!(n(mode) & 16)) return;
      const sys = ctx.state('sys'), items = ctx.state('itemmain'), areas = await ctx.call('map', 'get_all_plsno'), lines = await call(ctx, 'get_trapfilecont'), wave = await ctx.call('map', 'get_area_wavenum'), values = [];
      for (const line of lines.slice(1)) {
        if (!present(line) || !line.includes(',')) continue;
        const [area, map, count, name, kind, effect, durability, rawOwner] = line.split(',');
        let owner = rawOwner ?? null;
        if (text(owner).startsWith('=')) {
          const result = await database(ctx).query(`SELECT pid FROM ${sys.tablepre}players WHERE name='${text(owner).slice(1)}' AND type>0`);
          owner = result.length ? result[0].pid : '';
        }
        if (!eq(area, wave) && !eq(area, 99)) continue;
        for (let remaining = n(count); remaining > 0; remaining--) {
          let destination = map;
          if (eq(map, 99)) do { destination = areas[ctx.services.random.arrayRandPacked(areas)]; } while (items.map_noitemdrop_arealist.some(value => eq(value, destination)));
          values.push(`('${text(name)}', '${text(kind)}','${text(effect)}','${text(durability)}','${text(owner)}','${text(destination)}')`);
        }
      }
      if (values.length) await database(ctx).execute(`INSERT INTO ${sys.tablepre}maptrap (itm,itmk,itme,itms,itmsk,pls) VALUES ${values.join(',')}`);
    },
    async get_trapfilecont() {
      const source = await readFile(new URL('../../../engine/include/modules/base/items/trap/config/trapitem.config.php', import.meta.url), 'utf8');
      const result = source.replaceAll('\n', '\n<:game:>').split('<:game:>');
      if (result.at(-1) === '' || result.at(-1) === '\r') result.pop();
      return result.length ? result : [''];
    },
    async calculate_real_trap_obbs(ctx) {
      const rows = await database(ctx).query(`SELECT * FROM ${ctx.state('sys').tablepre}maptrap WHERE pls = '${text(ctx.state('player').pls)}' ORDER BY itmk DESC`);
      return n(ctx.state().trap_min_obbs) + rows.length / 4;
    },
    async calculate_real_trap_obbs_change(ctx, value) { return value; },
    async get_trap_escape_rate(ctx) { return 8 + n(ctx.state('player').lvl) / 3 + (present(ctx.state().selflag) ? 50 : 0); },
    async get_trap_damage(ctx) { const half = n(ctx.state('player').itme0) / 2; return round(ctx.services.random.rand(0, half) + half); },
    async send_trap_enemylog(ctx, hit) {
      const trap = ctx.state(), player = ctx.state('player');
      if (!present(trap.playerflag) || present(trap.selflag)) return;
      const killed = present(hit) && n(player.hp) <= 0;
      const message = `<span class="${killed ? 'red' : 'yellow'} b">${text(player.name)}${present(hit) ? '触发' : '回避'}了你设置的陷阱${text(player.itm0)}${killed ? '并被杀死了' : ''}！</span><br>`;
      await ctx.call('logger', 'logsave', player.itmsk0, ctx.state('sys').now, message, 'b');
    },
    async get_trap_damage_multiplier() { return []; },
    async get_trap_final_damage_modifier_up(ctx, pa, pd, item, damage) { return damage; },
    async get_trap_final_damage_modifier_down(ctx, pa, pd, item, damage) { return damage; },
    async get_trap_final_damage_change(ctx, pa, pd, item, damage) { return damage; },
    async post_traphit_events() {},
    async trap_deal_damage(ctx) {
      const player = ctx.state('player'), trap = ctx.state(), bid = player.itmsk0;
      const pa = present(bid) ? eq(bid, player.pid) ? parameterCopy(player.sdata) : await ctx.call('player', 'fetch_playerdata_by_pid', bid) : await ctx.call('player', 'create_dummy_playerdata');
      appendLog(ctx, `糟糕，你触发了${text(trap.trprefix)}陷阱<span class="yellow b">${text(player.itm0)}</span>！`);
      let damage = await call(ctx, 'get_trap_damage');
      const item = Object.fromEntries(fields.map(field => [field, player[field + '0']]));
      const multipliers = await call(ctx, 'get_trap_damage_multiplier', pa, player.sdata, parameterCopy(item), damage);
      if (Object.keys(multipliers).length) {
        let finalDamage = n(damage), words = '';
        for (const value of Object.values(multipliers)) { finalDamage *= n(value); words += '×' + text(value); }
        finalDamage = Math.max(1, round(finalDamage));
        appendLog(ctx, `你受到了${text(damage)}${words}＝<span class="dmg">${text(finalDamage)}</span>点伤害。<br>`); damage = finalDamage;
      } else appendLog(ctx, `你受到了<span class="dmg">${text(damage)}</span>点伤害！<br>`);
      for (const hook of ['get_trap_final_damage_modifier_up', 'get_trap_final_damage_modifier_down', 'get_trap_final_damage_change']) damage = await call(ctx, hook, pa, player.sdata, parameterCopy(item), damage);
      player.hp = n(player.hp) - n(damage);
      if (n(damage) > 0) await call(ctx, 'post_traphit_events', pa, player.sdata, parameterCopy(item), damage);
      if (present(trap.playerflag)) await ctx.call('sys', 'addnews', ctx.state('sys').now, 'trap', player.name, trap.trname, player.itm0, damage, '');
      await call(ctx, 'send_trap_enemylog', 1);
      return damage;
    },
    async trap_hit(ctx) {
      const player = ctx.state('player'), trap = ctx.state();
      await call(ctx, 'trap_deal_damage');
      if (n(player.hp) <= 0) {
        appendLog(ctx, `<span class="red b">你被${text(trap.trprefix)}陷阱杀死了！</span>`); player.state = 27;
        await ctx.call('player', 'update_sdata');
        const foreign = !present(trap.selflag) && present(trap.playerflag);
        const enemy = foreign ? await ctx.call('player', 'fetch_playerdata_by_pid', player.itmsk0) : player.sdata;
        if (!foreign && !present(trap.playerflag)) player.sdata.sourceless = 1;
        enemy.attackwith = player.itm0;
        const message = await ctx.call('player', 'kill', enemy, player.sdata);
        if (foreign) await ctx.call('player', 'player_save', enemy);
        await ctx.call('player', 'player_save', player.sdata);
        await ctx.call('player', 'load_playerdata', player.sdata);
        if (player.sdata.sourceless != null) delete player.sdata.sourceless;
        if (!eq(message, '')) appendLog(ctx, `<span class="yellow b">${text(trap.trname)}对你说：“${text(message)}”</span><br>`);
      } else await call(ctx, 'trap_survive');
      clear(player);
    },
    async trap_survive() {},
    async calculate_trap_reuse_rate(ctx) { return 5 + n(ctx.state('player').lvl) / 3 + (present(ctx.state().selflag) ? 50 : 0); },
    async trap_miss_reused(ctx) {
      const player = ctx.state('player'); appendLog(ctx, `你发现了${text(ctx.state().trprefix)}陷阱<span class="yellow b">${text(player.itm0)}</span>，不过你并没有触发它。陷阱看上去还可以重复使用。<br>`);
      player.itmsk0 = ''; player.itmk0 = text(player.itmk0).replaceAll('TO', 'TN'); ctx.state('sys').mode = 'itemfind';
    },
    async trap_miss_broken(ctx) {
      const player = ctx.state('player'); appendLog(ctx, `你发现了${text(ctx.state().trprefix)}陷阱<span class="yellow b">${text(player.itm0)}</span>，不过你成功地回避了它。<br>`);
      clear(player); ctx.state('sys').mode = 'command';
    },
    async trap_miss(ctx) {
      const player = ctx.state('player'), trap = ctx.state();
      if (present(trap.playerflag)) await ctx.call('sys', 'addnews', ctx.state('sys').now, 'trapmiss', player.name, trap.trname, player.itm0, '', '');
      await call(ctx, 'send_trap_enemylog', 0);
      const dice = ctx.services.random.rand(0, 99), reuse = await call(ctx, 'calculate_trap_reuse_rate');
      await call(ctx, dice < n(reuse) ? 'trap_miss_reused' : 'trap_miss_broken');
    },
    async trap(ctx) { const rate = Math.min(90, n(await call(ctx, 'get_trap_escape_rate'))), dice = ctx.services.random.rand(0, 99); await call(ctx, dice >= rate ? 'trap_hit' : 'trap_miss'); },
    async trapget(ctx, input) {
      const player = ctx.state('player'), trap = ctx.state(), item = parameterCopy(input);
      for (const field of fields) player[field + '0'] = item[field] ?? null;
      await database(ctx).execute(`DELETE FROM ${ctx.state('sys').tablepre}maptrap WHERE tid='${text(item.tid)}'`);
      trap.playerflag = isNumeric(player.itmsk0); trap.selflag = trap.playerflag && eq(player.itmsk0, player.pid);
      if (trap.playerflag && !trap.selflag) {
        const owner = await ctx.call('player', 'fetch_playerdata_by_pid', player.itmsk0); trap.trname = owner.name; trap.trtype = owner.type; trap.trprefix = `<span class="yellow b">${text(trap.trname)}</span>设置的`;
      } else if (trap.selflag) { trap.trname = player.name; trap.trtype = 0; trap.trprefix = '你自己设置的'; }
      else trap.trname = trap.trtype = trap.trprefix = '';
      await call(ctx, 'trap');
    },
    async get_traplist(ctx) { return await database(ctx).query(`SELECT * FROM ${ctx.state('sys').tablepre}maptrap WHERE pls = '${text(ctx.state('player').pls)}' ORDER BY itmk DESC`); },
    async trapcheck(ctx) {
      let rate = await call(ctx, 'calculate_real_trap_obbs'); rate = await call(ctx, 'calculate_real_trap_obbs_change', rate);
      if (ctx.services.random.rand(0, n(ctx.state().trap_max_obbs) - 1) < n(rate)) {
        const rows = await call(ctx, 'get_traplist'); if (!rows.length) return 0;
        await call(ctx, 'trapget', rows[ctx.services.random.rand(0, rows.length - 1)]); return 1;
      }
      return 0;
    },
    async discover(ctx, mode) { if (ctx.services.random.rand(0, 99) < n(ctx.state().trap_max_obbs) && present(await call(ctx, 'trapcheck'))) return false; return await ctx.next(mode); },
    async parse_news(ctx, nid, news, hour, minute, second, a, b, c, d, e, extra = []) {
      ({ hour, min: minute, sec: second } = ctx.state('sys'));
      const prefix = `<li id="nid${text(nid)}">${text(hour)}时${text(minute)}分${text(second)}秒，`;
      if (eq(news, 'trap')) return `${prefix}<span class="red b">${text(a)}中了${text(b)}设置的陷阱${text(c)}${n(d) > 0 ? '，受到了' + text(d) + '点伤害！' : ''}</span></li>`;
      if (eq(news, 'trapmiss')) return `${prefix}<span class="yellow b">${text(a)}回避了${text(b)}设置的陷阱${text(c)}</span></li>`;
      if (eq(news, 'death27')) {
        const name = text(ctx.state('player').typeinfo[b]) + ' ' + text(a), last = `<span class="yellow b">【${name}${present(e) ? '：“' + text(e) + '”' : ' 什么都没说就死去了'}】</span><br>\n`;
        return `${prefix}<span class="yellow b">${text(a)}</span>因触发了${present(c) ? '<span class="yellow b">' + text(c) + '</span>设置的' : ''}陷阱<span class="red b">${text(d)}</span>被杀死${last}</li>`;
      }
      return await ctx.next(nid, news, hour, minute, second, a, b, c, d, e, extra);
    },
    async parse_itmuse_desc(ctx, name, kind, effect, durability, special) {
      let result = await ctx.next(name, kind, effect, durability, special);
      if (text(kind).startsWith('TNc') || text(kind).startsWith('TOc')) result += '埋设后拥有必杀效果';
      else if (text(kind).startsWith('T')) result += '埋设后效果值为' + text(await call(ctx, 'get_trap_itme_limit', { itm: name, itmk: kind, itme: effect, itms: durability, itmsk: special }));
      return result;
    },
    async get_trap_itme_limit(ctx, item, supplied = null) {
      let pa = argument(supplied);
      // PHP's local &$pa rebinding does not replace the caller's empty slot.
      if (!present(pa) || (typeof pa === 'object' && Object.keys(pa).length === 0)) pa = ctx.state('player').sdata;
      if (text(item.itmk).startsWith('TNc')) return item.itme;
      return min(round(n(item.itme) * 0.75) + Math.max(n(pa.lvl) * 25, n(pa.wd) * 4), item.itme);
    },
    async trap_use(ctx, item) {
      const player = ctx.state('player'); appendLog(ctx, `设置了陷阱<span class="red b">${text(item.itm)}</span>。<br>`);
      let effect = await call(ctx, 'get_trap_itme_limit', item);
      if (n(effect) >= n(item.itme)) effect = item.itme;
      else appendLog(ctx, `<span class="yellow b">你笨拙的技术让陷阱的最大伤害限制在了<span class="red b">${text(effect)}</span>点。</span><br>`);
      await database(ctx).execute(`INSERT INTO ${ctx.state('sys').tablepre}maptrap (itm, itmk, itme, itms, itmsk, pls) VALUES ('${text(item.itm)}', '${text(item.itmk).replaceAll('TN', 'TO')}', '${text(effect)}', '1', '${text(player.pid)}', '${text(player.pls)}')`);
      await ctx.call('lvlctl', 'getexp', 1); player.wd = n(player.wd) + 1; await ctx.call('itemmain', 'itms_reduce', item);
    },
    async itemuse(ctx, item) { if (text(item.itmk).startsWith('T')) { await call(ctx, 'trap_use', item); return; } await ctx.next(item); },
  },
};
