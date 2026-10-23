import { number as n, text, present, appendLog, isNumeric } from '../numbers.mjs';
import { call, eq, integer } from './helpers.mjs';
import config from './weather-config.json' with { type: 'json' };

const rand = (ctx, lower, upper) => ctx.services.random.rand(lower, upper);
const news = (ctx, type, a = '', b = '', c = '', d = '', e = '') => ctx.call('sys', 'addnews', ctx.state('sys').now, type, a, b, c, d, e);
const pick = (ctx, values) => values[ctx.services.random.arrayRandPacked(values)];

async function environment(ctx, moving) {
  const sys = ctx.state('sys'), player = ctx.state('player'), weather = sys.weather;
  if (moving && eq(weather, 11)) await call(ctx, 'apply_tornado_weather_effect');
  else if (eq(weather, 13)) { await call(ctx, 'deal_hailstorm_weather_damage'); if (n(player.hp) <= 0) return false; }
  else if (eq(weather, 14)) {
    const dice = rand(ctx, 0, 9);
    if (dice === 0 && !text(player.inf).includes('e')) { appendLog(ctx, '空气中充斥着的<span class="linen b">狂暴电磁波</span>导致你<span class="yellow b">身体麻痹</span>了！<br>'); await ctx.call('wound', 'get_inf', 'e'); }
    else if (dice === 1 && !text(player.inf).includes('w')) { appendLog(ctx, '空气中充斥着的<span class="linen b">狂暴电磁波</span>导致你<span class="grey b">混乱</span>了！<br>'); await ctx.call('wound', 'get_inf', 'w'); }
    else appendLog(ctx, '空气中充斥着狂暴的电磁波……<br>');
  } else if (eq(weather, 15)) {
    if (rand(ctx, 0, 9) === 0) {
      const lost = rand(ctx, 1, 4);
      if (n(player.mhp) > lost) { appendLog(ctx, `空气中弥漫着的<span class="green b">放射性尘埃</span>导致你的生命上限减少了<span class="red b">${text(lost)}</span>点！<br>`); player.mhp = n(player.mhp) - lost; if (n(player.hp) > n(player.mhp)) player.hp = player.mhp; }
    } else appendLog(ctx, '空气中弥漫着放射性尘埃……<br>');
  } else if (eq(weather, 16)) {
    const dice = rand(ctx, 0, 9);
    if (dice === 0) {
      const lost = rand(ctx, 2, 5);
      if (n(player.def) > lost) { appendLog(ctx, `高强度的<span class="purple b">紫外线照射</span>导致你的防御力减少了<span class="red b">${text(lost)}</span>点！<br>`); player.def = n(player.def) - lost; if (!moving && n(player.def) < 0) player.def = 0; }
    } else if (dice === 1 && !text(player.inf).includes('u')) { appendLog(ctx, '高强度的<span class="purple b">紫外线照射</span>导致你<span class="red b">烧伤</span>了！<br>'); await ctx.call('wound', 'get_inf', 'u'); }
    else appendLog(ctx, '高强度的紫外线灼烧着大地……<br>');
  } else if (eq(weather, 18)) {
    const dice = rand(ctx, 0, 99);
    if (dice === 0) { appendLog(ctx, '你感觉到一股苍凉的杀气！开得过低的空调导致你<span class="cyan b">冻结</span>了！<br>'); await ctx.call('wound', 'get_inf', 'i'); }
    else if (dice <= 10) appendLog(ctx, '你感觉到一股苍凉的杀气！可能是空调开得太冷了。<br>');
  } else if (eq(weather, 19) && rand(ctx, 0, 99) <= 10) appendLog(ctx, '你好像闻到了<span class="ltcrimson b">煤气罐</span>的气味……<br>');
  return true;
}

export const weatherModule = {
  name: 'weather', dependencies: ['sys', 'map', 'itemmain', 'player', 'logger'], optionalDependencies: ['metman', 'enemy', 'explore', 'weapon', 'radar', 'pose', 'tactic', 'attack'],
  templates: ['profile_weather'], state: () => structuredClone(config.values),
  initialize(ctx) { ctx.state('itemmain').iteminfo.EW = '天气控制'; },
  functions: {
    async calculate_weather_itemfind_obbs(ctx) { return ctx.state().weather_itemfind_obbs[ctx.state('sys').weather] ?? null; },
    async calculate_itemfind_obbs(ctx) { const base = await ctx.next(); return n(base) + n(await call(ctx, 'calculate_weather_itemfind_obbs')); },
    async calculate_weather_meetman_obbs(ctx, enemy) { return ctx.state().weather_meetman_obbs[ctx.state('sys').weather] ?? null; },
    async calculate_findman_obbs(ctx, enemy) { const base = await ctx.next(enemy); return n(base) + n(await call(ctx, 'calculate_weather_meetman_obbs', enemy)); },
    async calculate_weather_active_obbs(ctx, pa, pd) { return ctx.state().weather_active_obbs[ctx.state('sys').weather] ?? null; },
    async calculate_active_obbs(ctx, pa, pd) { const add = await call(ctx, 'calculate_weather_active_obbs', pa, pd); pa.active_words = await ctx.call('attack', 'add_format', add, pa.active_words, 0); return n(await ctx.next(pa, pd)) + n(add); },
    async calculate_weather_attack_modifier(ctx, pa, pd, active) { return 1 + n(ctx.state().weather_attack_modifier[ctx.state('sys').weather]) / 100; },
    async get_att_multiplier(ctx, pa, pd, active) { const result = await ctx.next(pa, pd, active); return [await call(ctx, 'calculate_weather_attack_modifier', pa, pd, active), ...result]; },
    async calculate_weather_defend_modifier(ctx, pa, pd, active) { return 1 + n(ctx.state().weather_defend_modifier[ctx.state('sys').weather]) / 100; },
    async get_def_multiplier(ctx, pa, pd, active) { const result = await ctx.next(pa, pd, active); return [await call(ctx, 'calculate_weather_defend_modifier', pa, pd, active), ...result]; },
    async get_hitrate_base(ctx, pa, pd, active) { const base = await ctx.next(pa, pd, active); return n(base) + (eq(ctx.state('sys').weather, 12) ? 20 : 0); },
    // Source does not import player here: its local $mhp is unset, contributing
    // zero. Using the current player's maximum HP would silently change rules.
    async calculate_hailstorm_weather_damage(ctx) { return rand(ctx, 0, 20); },
    async deal_hailstorm_weather_damage(ctx) {
      const player = ctx.state('player'), damage = await call(ctx, 'calculate_hailstorm_weather_damage'); player.hp = n(player.hp) - n(damage);
      appendLog(ctx, `被<span class="blue b">冰雹</span>击中，生命减少了<span class="red b">${text(damage)}</span>点！<br>`);
      if (n(player.hp) <= 0) { player.state = 17; await ctx.call('player', 'update_sdata'); player.sdata.selflag = 1; await ctx.call('player', 'kill', player.sdata, player.sdata); }
    },
    async apply_tornado_weather_effect(ctx) { const sys = ctx.state('sys'), player = ctx.state('player'), safe = await ctx.call('map', 'get_safe_plslist', 0); if (present(sys.hack) || Object.keys(safe).length > 1) { player.pls = pick(ctx, present(sys.hack) ? await ctx.call('map', 'get_all_plsno') : safe); appendLog(ctx, `但是强烈的龙卷风把你吹到了<span class="yellow b">${text(ctx.state('map').plsinfo[player.pls])}</span>！<br>`); } },
    async move_to_area(ctx, destination) { return await environment(ctx, true) ? await ctx.next(destination) : false; },
    async search_area(ctx) { return await environment(ctx, false) ? await ctx.next() : false; },
    async pre_act(ctx) { await ctx.next(); const sys = ctx.state('sys'), player = ctx.state('player'); if (eq(sys.weather, 19) && eq(player.state, 0) && rand(ctx, 0, 99) === 0) { player.state = 1; sys.mode = 'rest'; sys.command = 'rest'; appendLog(ctx, '<span class="ltcrimson b">开的太高的暖气让你昏昏欲睡……</span><br>你克制不住睡意，然后倒了下去。<br>'); } },
    async wthchange(ctx, item, attributes) {
      const sys = ctx.state('sys');
      const id = !present(attributes) ? 0 : isNumeric(attributes) ? integer(attributes) : ctx.hasModule('attrbase') ? integer(await ctx.call('attrbase', 'check_in_itmsk', '^wid', attributes)) : 0;
      if (n(sys.weather) >= 14 && ![18, 19, 95].includes(id)) { await news(ctx, 'wthfail', ctx.state('player').name, sys.weather, item); appendLog(ctx, `你使用了${text(item)}。<br /><span class="red b">但是天气并未发生任何变化！</span><br />`); }
      else {
        sys.weather = id === 99 ? rand(ctx, 0, 13) : id === 98 ? rand(ctx, 10, 13) : id === 97 ? rand(ctx, 0, 9) : id === 96 ? rand(ctx, 8, 9) : id === 95 ? 17 : id >= 0 && id < ctx.state().wthinfo.length ? id : 0;
        await ctx.call('sys', 'save_gameinfo'); await news(ctx, 'wthchange', ctx.state('player').name, sys.weather, item);
        appendLog(ctx, `你使用了${text(item)}。<br />天气突然转变成了<span class="red b">${text(ctx.state().wthinfo[sys.weather])}</span>！<br />`);
      }
    },
    async add_once_area(ctx, time) { const sys = ctx.state('sys'); if (n(sys.weather) <= 13) { const previous = sys.weather; do { sys.weather = rand(ctx, 0, 9); } while (eq(sys.weather, previous)); } await ctx.next(time); },
    async rs_game(ctx, mode = 0) { await ctx.next(mode); if (integer(mode) & 2) ctx.state('sys').weather = pick(ctx, [0, 2, 3, 4, 7]); },
    async check_fog(ctx) { return present(ctx.state().weather_fog[ctx.state('sys').weather]); },
    async itemuse(ctx, item) { if (text(item.itmk).startsWith('EW')) { await call(ctx, 'wthchange', item.itm, item.itmsk); await ctx.call('itemmain', 'itms_reduce', item); return; } await ctx.next(item); },
    async parse_news(ctx, nid, type, hour, minute, second, a, b, c, d, e, extra = []) {
      ({ hour, min: minute, sec: second } = ctx.state('sys'));
      const prefix = `<li id="nid${text(nid)}">${text(hour)}时${text(minute)}分${text(second)}秒，`, info = ctx.state().wthinfo;
      if (eq(type, 'wthchange')) return `${prefix}<span class="lime b">${text(a)}使用了${text(c)}，天气变成了${text(info[b])}！</span></li>`;
      if (eq(type, 'wthfail')) return `${prefix}<span class="lime b">${text(a)}使用了${text(c)}，但是天气并未发生改变！</span></li>`;
      if (eq(type, 'syswthchg')) return `${prefix}<span class="lime b">奇迹和魔法都是存在的！当前天气变成了${text(info[a])}！</span></li>`;
      if (eq(type, 'aurora_revival')) return `${prefix}<span class="lime b">${text(a)}在奥罗拉的作用下原地复活了！</span></li>`;
      if (eq(type, 'death17')) { const name = text(ctx.state('player').typeinfo[b]) + ' ' + text(a); return `${prefix}<span class="yellow b">${text(a)}</span>被<span class="red b">冰雹砸死</span><span class="yellow b">【${name}${present(e) ? '：“' + text(e) + '”' : ' 什么都没说就死去了'}】</span><br>\n</li>`; }
      const result = await ctx.next(nid, type, hour, minute, second, a, b, c, d, e, extra);
      return eq(type, 'addarea') ? text(result).replaceAll('</li>', `<span class="yellow b">【天气：${text(info[b])}】</span></li>`) : result;
    },
    async use_radar(ctx, value = 0) { if (eq(ctx.state('sys').weather, 14)) { appendLog(ctx, '由于<span class="linen b">离子风暴</span>造成了电磁干扰，探测仪器完全显示不出信息……<br>'); return; } await ctx.next(value); },
    async apply_fog_meetenemy_effect(ctx, isMeet) { if (present(await call(ctx, 'check_fog')) && !present(isMeet)) Object.assign(ctx.state('metman').tdata, { sNoinfo: '？？？', iconImg: 'question.gif', iconImgB: '', name: '？？？', wep: '？？？', infdata: '？？？', pose: '？？？', tactic: '？？？', lvl: '？', hpstate: '？？？', spstate: '？？？', ragestate: '？？？', wepestate: '？？？', wepk: '？？？' }); },
    async init_battle(ctx, isMeet = 0) { await ctx.next(isMeet); await call(ctx, 'apply_fog_meetenemy_effect', isMeet); },
    async attack_finish(ctx, pa, pd, active) { if (eq(ctx.state('sys').weather, 17)) await call(ctx, 'weather_aurora_check', pa, pd, active); await ctx.next(pa, pd, active); await call(ctx, 'weather_aurora_revive_process', pa, pd); delete pa.aurora_revive_flag; delete pd.aurora_revive_flag; },
    async set_revive_sequence(ctx, pa, pd) { await ctx.next(pa, pd); if (eq(ctx.state('sys').weather, 17)) { pd.revive_sequence ??= {}; pd.revive_sequence[50] = 'aurora'; } },
    async revive_check(ctx, pa, pd, key) { const result = await ctx.next(pa, pd, key); return eq(key, 'aurora') && present(pd.aurora_revive) ? true : result; },
    async post_revive_events(ctx, pa, pd, key) { await ctx.next(pa, pd, key); if (eq(key, 'aurora')) { pd.hp = await call(ctx, 'weather_aurora_revive_num', pd); pd.aurora_revive = 0; pd.rivival_news = ['aurora_revival', pd.name]; } },
    async player_kill_enemy(ctx, pa, pd, active) { await ctx.next(pa, pd, active); if (present(pd.aurora_revive_flag)) { appendLog(ctx, `但是，空气中弥漫着的<span class="cyan b">奥罗拉</span><span class="lime b">让${present(active) ? '敌人' : '你'}重新站了起来！</span><br>并且，${present(active) ? '敌人' : '你'}的生命回复了<span class="cyan b">${text(pd.aurora_revive_flag)}</span>点！<br>`); pd.battlelog = text(pd.battlelog) + `<span class="lime b">但是，空气中弥漫着的奥罗拉让${present(active) ? '你' : '敌人'}重新站了起来！</span>`; } },
    async weather_aurora_check(ctx, pa, pd, active) { if (!eq(ctx.state('sys').weather, 17)) return; for (const player of [pa, pd]) if (rand(ctx, 0, 99) < (present(player.type) ? 1 : 10)) player.aurora_revive = rand(ctx, 1, 9); },
    async weather_aurora_revive_num(ctx, pd) { if (!eq(ctx.state('sys').weather, 17) || !present(pd.aurora_revive)) return 0; if (n(pd.hp) < 0) pd.hp = 0; let amount = pd.aurora_revive; if (n(amount) > n(pd.mhp) - n(pd.hp)) amount = n(pd.mhp) - n(pd.hp); pd.aurora_revive_flag = pd.aurora_revive; return amount; },
    async weather_aurora_revive_process(ctx, pa, pd) { if (!eq(ctx.state('sys').weather, 17)) return; for (const player of [pa, pd]) if (present(player.aurora_revive) && n(player.hp) < n(player.mhp)) { const amount = await call(ctx, 'weather_aurora_revive_num', player); if (present(amount)) { player.hp = n(player.hp) + n(amount); const name = eq(player.name, ctx.state('player').sdata.name) ? '你' : text(player.name); appendLog(ctx, `空气中弥漫着的<span class='cyan b'>奥罗拉</span>让${name}的生命回复了<span class='cyan b'>${text(amount)}</span>点！<br>`); } delete player.aurora_revive; } },
    async check_can_counter(ctx, pa, pd, active) { return present(pa.aurora_revive_flag) ? 0 : await ctx.next(pa, pd, active); },
  },
};
