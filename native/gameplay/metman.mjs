import { number as n, text, present, appendLog, sameDurability as eq } from './numbers.mjs';

const call = (ctx, name, ...args) => ctx.call('metman', name, ...args);
const copy = value => value == null ? value : structuredClone(value);
const corpseFields = ['money', 'arhs', 'aras', 'arfs', 'arts', 'itms1', 'itms2', 'itms3', 'itms4', 'itms5', 'itms6'];
const query = async (ctx, sql) => {
  if (typeof ctx.services.database?.query !== 'function') throw new Error('Native metman requires database.query(sql).');
  const result = await ctx.services.database.query(sql);
  if (!Array.isArray(result)) throw new TypeError('Native metman database.query must return row records.');
  return result;
};
function templateName(ctx, constant) {
  const name = ctx.services.templates?.names?.[constant];
  if (typeof name !== 'string' || !name) throw new Error(`Native metman requires template binding ${constant}.`);
  return name;
}
function extractEnemy(ctx, data) {
  const state = ctx.state('metman'), locals = {};
  for (const [key, value] of Object.entries(data)) {
    const prefixed = `w_${key}`;
    // Original init only exports w_* for real player columns. extract also
    // creates local variables for other keys, which only the template sees.
    if (Object.hasOwn(state, prefixed)) state[prefixed] = copy(value);
    else locals[prefixed] = copy(value);
  }
  return locals;
}

/** Native base/metman main.php and configuration. SQL, player loading/saving,
 * experience, icons and templates remain real host/module dependencies.
 * Encounter filters take a value copy; discover checks take the live record,
 * preserving the source's different reference declarations at those hooks. */
export const metmanModule = {
  name: 'metman',
  dependencies: ['sys', 'player', 'explore', 'itemmain', 'logger', 'lvlctl'],
  templates: ['meetman', 'meetman_cmd', 'ui_main', 'my_profile', 'enemy_profile'],
  state: () => ({
    tdata: {}, w_upexp: null, battle_title: null, hideflag: null,
    hidelog: '<span class="yellow b">周围一个人都没有，但你觉得应该有人的……</span><br>',
    hpinfo: ['并无大碍', '伤痕累累', '生命危险', '已经死亡'],
    spinfo: ['精力充沛', '略有疲惫', '精疲力尽', '已经死亡'],
    rageinfo: ['平静', '愤怒', '暴怒', '已经死亡'],
    wepeinfo: ['基本无害', '略有威胁', '威力可观', '相当危险', '极度致命', '摧枯拉朽', '毁天灭地', '弑神屠魔'],
    metman_obbs: 70,
  }),
  initialize(ctx) {
    const state = ctx.state(); state.tdata = {};
    for (const column of ctx.state('player').db_player_structure) if (!Object.hasOwn(state, `w_${column}`)) state[`w_${column}`] = null;
  },
  functions: {
    async metman_load_playerdata(ctx, data) { extractEnemy(ctx, data); },
    async init_battle(ctx, isMeet = 0) {
      const state = ctx.state(), player = ctx.state('player');
      state.tdata = {};
      const out = state.tdata;
      state.w_upexp = await ctx.call('lvlctl', 'calc_upexp', state.w_lvl);
      if (n(state.w_hp) <= 0) {
        out.hpstate = `<span class="red b">${text(state.hpinfo[3])}</span>`;
        out.spstate = `<span class="red b">${text(state.spinfo[3])}</span>`;
        out.ragestate = `<span class="red b">${text(state.rageinfo[3])}</span>`;
        out.isdead = true;
      } else {
        const hp = n(state.w_hp), maxHp = n(state.w_mhp);
        const hpLevel = hp < maxHp * 0.2 ? 2 : hp < maxHp * 0.5 ? 1 : 0;
        out.hpstate = `<span class="${['cyan', 'yellow', 'red'][hpLevel]} b">${text(state.hpinfo[hpLevel])}</span>`;
        const sp = n(state.w_sp), maxSp = n(state.w_msp);
        out.spstate = text(state.spinfo[sp < maxSp * 0.2 ? 2 : sp < maxSp * 0.5 ? 1 : 0]);
        const rage = n(state.w_rage);
        out.ragestate = rage >= 100 ? `<span class="red b">${text(state.rageinfo[2])}</span>`
          : rage >= 30 ? `<span class="yellow b">${text(state.rageinfo[1])}</span>` : text(state.rageinfo[0]);
      }
      const power = n(state.w_wepe), levels = [60, 120, 300, 1000, 4000, 40000, 400000];
      out.wepestate = text(state.wepeinfo[levels.filter(value => power >= value).length]);
      out.sNoinfo = text(player.typeinfo[state.w_type]) + (present(state.w_type)
        ? `(${text(player.sexinfo[state.w_gd])})` : `(${text(player.sexinfo[state.w_gd])}${text(state.w_sNo)}号)`);
      const iconData = { type: state.w_type, gd: state.w_gd, icon: state.w_icon, card: state.w_card, cardname: state.w_cardname };
      [out.iconImg, out.iconImgB, out.iconImgBwidth] = await ctx.call('player', 'icon_parser_shell', iconData);
      out.name = state.w_name; out.wep = state.w_wep; out.lvl = state.w_lvl; out.wepk = state.w_wepk;
    },
    async calculate_findman_obbs(ctx, enemy) { return ctx.state().metman_obbs; },
    async calculate_hide_obbs() { return 0; },
    async check_alive_discover(ctx, enemy) {
      const chance = await call(ctx, 'calculate_findman_obbs', enemy);
      const hidden = await call(ctx, 'calculate_hide_obbs', enemy);
      if (ctx.services.random.rand(0, 99) < n(chance) - n(hidden)) return 1;
      ctx.state().hideflag = true; return 0;
    },
    async check_corpse_discover(ctx, enemy) { return await call(ctx, 'check_corpse_discover_dice', enemy); },
    async check_corpse_discover_dice() { return 1; },
    async check_player_discover(ctx, enemy) {
      return n(enemy.hp) > 0 ? await call(ctx, 'check_alive_discover', enemy) : await call(ctx, 'check_corpse_discover', enemy);
    },
    async meetman(ctx, id) {
      await ctx.call('player', 'update_sdata');
      const enemy = await ctx.call('player', 'fetch_playerdata_by_pid', id);
      await call(ctx, 'meetman_alternative', enemy);
    },
    async meetman_alternative(ctx, enemy) {
      enemy = copy(enemy);
      const state = ctx.state(), player = ctx.state('player');
      state.battle_title = '发现人物';
      const locals = extractEnemy(ctx, enemy);
      await call(ctx, 'init_battle', 1);
      appendLog(ctx, `你发现了人物<span class="yellow b">${text(state.w_name ?? locals.w_name)}</span>。<br>你友善地打了个招呼。<br>`);
      const name = templateName(ctx, 'MOD_METMAN_MEETMAN_CMD');
      if (typeof ctx.services.templates?.render !== 'function') throw new Error('Native metman requires templates.render(name, scope).');
      const scope = ctx.importInto({ edata: enemy, ...locals }, 'sys', 'player', 'metman', 'logger');
      const html = await ctx.services.templates.render(name, scope);
      if (typeof html !== 'string') throw new TypeError('Native metman template renderer must return HTML text.');
      if (typeof ctx.services.output?.take !== 'function') throw new Error('Native metman requires output.take() to preserve buffered HTML.');
      const previous = await ctx.services.output.take();
      if (typeof previous !== 'string') throw new TypeError('Native metman output.take() must return HTML text.');
      player.cmd = previous + html;
      player.main = templateName(ctx, 'MOD_METMAN_MEETMAN');
    },
    async calculate_meetman_rate_by_mode(ctx, mode) {
      const player = ctx.state('player');
      const rows = await query(ctx, `SELECT pid FROM ${text(ctx.state('sys').tablepre)}players WHERE pls='${text(player.pls)}' AND pid!='${text(player.pid)}' AND (hp>'0' OR corpse_clear_flag!='1')`);
      if (!rows.length && ['search', 'move', 'search2'].some(value => eq(mode, value))) return 50;
      const rate = Math.min(rows.length * 3, 30);
      if (eq(mode, 'search')) return 20 + rate;
      if (eq(mode, 'move')) return 40 + rate;
      return eq(mode, 'search2') ? 100 : 0;
    },
    async calculate_meetman_rate(ctx, mode) { return await call(ctx, 'calculate_meetman_rate_by_mode', mode); },
    async discover_player_get_epids(ctx, location, id) {
      const rows = await query(ctx, `SELECT * FROM ${text(ctx.state('sys').tablepre)}players WHERE pls='${text(location)}' AND pid!='${text(id)}'`);
      const result = [];
      for (const row of rows) if (present(await call(ctx, 'discover_player_filter', copy(row)))) result.push(copy(row));
      return result;
    },
    async discover_player_filter(ctx, enemy) {
      enemy = copy(enemy);
      return n(enemy.hp) > 0 ? await call(ctx, 'discover_player_filter_alive', enemy) : await call(ctx, 'discover_player_filter_corpse', enemy);
    },
    async discover_player_filter_alive() { return true; },
    async discover_player_filter_corpse(ctx, enemy) {
      if (eq(1, enemy.corpse_clear_flag)) return false;
      if (present(enemy.weps) && (!eq(enemy.wepk, 'WN') || n(enemy.wepe) > 0)) return true;
      if (present(enemy.arbs) && (!eq(enemy.arbk, 'DN') || n(enemy.arbe) > 0)) return true;
      return corpseFields.some(field => present(enemy[field]));
    },
    async discover_player(ctx) {
      const player = ctx.state('player'), state = ctx.state(), sys = ctx.state('sys');
      const enemies = await call(ctx, 'discover_player_get_epids', player.pls, player.pid);
      if (!enemies.length) { appendLog(ctx, '<span class="yellow b">周围一个人都没有。</span><br>'); sys.mode = 'command'; return false; }
      ctx.services.random.shuffle(enemies);
      state.hideflag = false;
      for (const row of enemies) {
        const enemy = await ctx.call('player', 'fetch_playerdata_by_pid', row.pid);
        if (present(enemy.infochanged)) await ctx.call('player', 'player_save', enemy);
        if (eq(enemy.pls, player.pls)) {
          if (present(await call(ctx, 'check_player_discover', enemy))) { await call(ctx, 'meetman', enemy.pid); return true; }
        } else appendLog(ctx, `你发现了${text(enemy.name)}，但对方匆匆离去，你追之不及。<br>`);
      }
      appendLog(ctx, present(state.hideflag) ? '似乎有人隐藏着……<br>' : text(state.hidelog));
      sys.mode = 'command'; return false;
    },
    async discover(ctx, mode) {
      const dice = ctx.services.random.rand(0, 99);
      const calculated = await call(ctx, 'calculate_meetman_rate', mode);
      const rate = n(calculated) < 20 ? 20 : calculated;
      if (dice < n(rate)) {
        const result = await call(ctx, 'discover_player');
        if (!present(await call(ctx, 'can_continue_post_discover_player', result))) return result;
      }
      return await ctx.next(mode);
    },
    async can_continue_post_discover_player() { return false; },
  },
};
