import { number as n, present, text, appendLog, isNumeric } from './numbers.mjs';

const call = (ctx, name, ...args) => ctx.call(ctx.moduleName, name, ...args);
const includesNumber = (list, value) => list.some(entry => n(entry) === n(value));
const sameTeam = (left, right) => left === right || (isNumeric(left) && isNumeric(right)
  && Number.isFinite(Number(left)) && Number.isFinite(Number(right)) && Number(left) === Number(right));
const integerPrefix = value => {
  const match = text(value).match(/^[\s]*[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
  return match ? Math.trunc(Number(match[0])) : 0;
};
const news = (ctx, time = 0, type = '', a = '', b = '', c = '', d = '', e = '') => ctx.call('sys', 'addnews', time, type, a, b, c, d, e);
const chat = (ctx, time, type, message = '') => ctx.call('sys', 'systemputchat', time, type, message);
function table(ctx) {
  const prefix = ctx.state('sys').tablepre;
  if (typeof prefix !== 'string' || !/^[a-zA-Z0-9_]*$/.test(prefix)) throw new TypeError('Invalid gameflow table prefix');
  return `${prefix}players`;
}
async function database(ctx, method, ...args) {
  if (typeof ctx.services.database?.[method] !== 'function') throw new Error(`Native gameflow requires database.${method}().`);
  const result = await ctx.services.database[method](...args);
  if (method === 'query' && !Array.isArray(result)) throw new TypeError('Native gameflow queries must return row records');
  return result;
}

/** Core gameflow_base: preparation, joining limits and end checks. The source
 * is_gamestate_combo reads an unset local and returns null. Keep that original
 * extension default; the actual combo module supplies its state predicate.
 */
export const gameflowBaseModule = {
  name: 'gameflow_base', dependencies: ['sys', 'map'],
  functions: {
    async gamestate_prepare_game(ctx) {
      const sys = ctx.state('sys'); sys.gamenum = 0;
      await ctx.call('sys', 'reset_game');
      await ctx.call('sys', 'save_gameinfo');
      await ctx.call('sys', 'prepare_new_game');
      await ctx.call('sys', 'rs_game', 63);
      sys.gamestate = 10;
      await ctx.call('sys', 'save_gameinfo');
    },
    async gamestate_start_game(ctx) {
      const sys = ctx.state('sys'); sys.gamestate = 20;
      await news(ctx, sys.starttime, 'newgame', sys.gamenum);
      await chat(ctx, sys.starttime, 'newgame');
    },
    async gamestateupdate(ctx) {
      const sys = ctx.state('sys');
      if (!present(sys.gamestate)) {
        sys.readymin = n(sys.readymin) > 0 ? sys.readymin : 1;
        if (present(sys.starttime) && n(sys.now) > n(sys.starttime) - n(sys.readymin) * 60) await call(ctx, 'gamestate_prepare_game');
      }
      if (n(sys.gamestate) === 10 && n(sys.now) >= n(sys.starttime)) await call(ctx, 'gamestate_start_game');
      if (n(sys.gamestate) >= 20 && n(sys.gamestate) < 30) await call(ctx, 'check_game_stop_joining_base');
    },
    async check_game_stop_joining_base(ctx) {
      const sys = ctx.state('sys');
      if (present(sys.gamevars.max_opening_sec) && n(sys.now) - n(sys.starttime) > n(sys.gamevars.max_opening_sec)) { sys.gamestate = 30; return; }
      if (n(sys.validnum) > 0) {
        let limit = sys.validlimit;
        if (present(sys.gamevars.max_player) && integerPrefix(sys.gamevars.max_player) < n(limit)) limit = integerPrefix(sys.gamevars.max_player);
        if (n(sys.validnum) >= n(limit)) sys.gamestate = 30;
      }
    },
    async is_gamestate_combo() { return null; },
    async checkendgame(ctx) {
      const sys = ctx.state('sys');
      if (!present(await call(ctx, 'is_gamestate_combo'))) return;
      if (includesNumber(sys.teamwin_mode, sys.gametype)) {
        const rows = await database(ctx, 'query', `SELECT teamID FROM ${table(ctx)} WHERE type = 0 AND hp > 0`);
        sys.alivenum = rows.length;
        if (!sys.alivenum) await ctx.call('sys', 'gameover');
        let first = true, firstTeam, flag = true;
        for (const row of rows) {
          if (first) { first = false; firstTeam = row.teamID; }
          else if (!sameTeam(firstTeam, row.teamID) || !present(row.teamID)) { flag = false; break; }
        }
        if (flag && !first) await ctx.call('sys', 'gameover');
      } else if (n(sys.alivenum) <= 1 && n(sys.gametype) !== 2) await ctx.call('sys', 'gameover');
    },
    async update_valid_alivenum(ctx) {
      const sys = ctx.state('sys'); if (n(sys.gamestate) < 20) return;
      sys.validnum = sys.alivenum = 0;
      const rows = await database(ctx, 'query', `SELECT * FROM ${table(ctx)} WHERE type=0`);
      for (const row of rows) {
        const [valid, alive] = await call(ctx, 'check_valid_alivenum_single', structuredClone(row));
        if (present(valid)) sys.validnum++;
        if (present(alive)) sys.alivenum++;
      }
    },
    async check_valid_alivenum_single(ctx, data) { return [1, n(data.hp) > 0 ? 1 : 0]; },
    async updategame(ctx) {
      await ctx.next();
      await call(ctx, 'gamestateupdate');
      await call(ctx, 'update_valid_alivenum');
      await call(ctx, 'checkendgame');
    },
  },
};

export const gameflowComboModule = {
  name: 'gameflow_combo', dependencies: ['sys', 'player', 'gameflow_base', 'map'], optionalDependencies: ['corpse', 'metman', 'team', 'trap'],
  state: () => ({ combolimit: 50, deathlimit: 160, deathlimit_by_gtype: { 0: 160 }, deathdeno: 20, deathnume: 20 }),
  functions: {
    async reset_game(ctx) { await ctx.next(); ctx.state('sys').combonum = await call(ctx, 'calculate_combonum', 1); },
    async is_gamestate_combo(ctx) { return n(ctx.state('sys').gamestate) >= 40; },
    async checkcombo(ctx, time = 0) {
      const sys = ctx.state('sys'); if (!present(time)) time = sys.now;
      let enter = false;
      if (n(sys.gamestate) < 40 && n(sys.gamestate) >= 30 && n(sys.alivenum) <= n(ctx.state().combolimit)) enter = true;
      else if (n(sys.gamestate) < 40 && n(sys.gamestate) >= 20 && present(sys.combonum) && n(sys.deathnum) >= n(sys.combonum)) {
        const actual = await call(ctx, 'calculate_combonum');
        if (n(sys.deathnum) >= n(actual)) enter = true;
        else {
          sys.combonum = actual;
          await news(ctx, time, 'comboupdate', actual, sys.deathnum);
          await chat(ctx, time, 'comboupdate', actual);
        }
      }
      if (enter) { sys.gamestate = 40; await news(ctx, time, 'combo'); await chat(ctx, time, 'combo'); }
    },
    async post_addarea_process(ctx, time, added) { await ctx.next(time, added); await call(ctx, 'checkcombo', time); },
    async calculate_combonum(ctx, reset = false) {
      const sys = ctx.state('sys'), state = ctx.state();
      let limit = present(state.deathlimit_by_gtype[sys.gametype]) ? state.deathlimit_by_gtype[sys.gametype] : state.deathlimit_by_gtype[0];
      if (present(sys.gamevars.combonum)) {
        const expression = text(sys.gamevars.combonum), change = integerPrefix(expression.slice(1));
        if (expression[0] === '+') limit = n(limit) + change;
        else if (expression[0] === '-') limit = n(limit) - change;
        else if (expression[0] === '=') limit = change;
      }
      return present(reset) ? limit : n(limit) + Math.ceil(n(sys.validnum) / n(state.deathdeno)) * n(state.deathnume);
    },
    async gamestateupdate(ctx) { await ctx.next(); await call(ctx, 'checkcombo'); },
    async parse_news(ctx, nid, kind, hour, min, sec, a, b, c, d, e, extra = []) {
      ({ hour, min, sec } = ctx.state('sys'));
      const prefix = `<li id="nid${text(nid)}">${text(hour)}时${text(min)}分${text(sec)}秒，`;
      if (kind === 'combo') return `${prefix}<span class="red b">游戏进入连斗阶段！</span></li>`;
      if (kind === 'comboupdate') return `${prefix}<span class="yellow b">连斗判断死亡数修正为${text(a)}人，当前死亡数为${text(b)}人！</span></li>`;
      return ctx.next(nid, kind, hour, min, sec, a, b, c, d, e, extra);
    },
    async discover_player_filter_corpse(ctx, data) { const result = await ctx.next(data); return present(await call(ctx, 'is_gamestate_combo')) ? false : result; },
    async calculate_meetman_rate(ctx, searchMode) {
      const combo = present(await call(ctx, 'is_gamestate_combo'));
      const value = await ctx.next(searchMode);
      return combo && ['search', 'move'].includes(searchMode) ? n(value) + (searchMode === 'search' ? 20 : 10) : value;
    },
    async senditem_check(ctx, data) {
      const sys = ctx.state('sys');
      if (ctx.hasModule('team') && present(await call(ctx, 'is_gamestate_combo')) && !includesNumber(sys.teamwin_mode, sys.gametype)) { appendLog(ctx, '<span class="yellow b">连斗阶段无法赠送物品！</span><br>'); return false; }
      return ctx.next(structuredClone(data));
    },
    async findteam(ctx, data) {
      if (!ctx.hasModule('team')) return;
      const sys = ctx.state('sys');
      if (present(await call(ctx, 'is_gamestate_combo')) && !includesNumber(sys.teamwin_mode, sys.gametype)) { appendLog(ctx, '<span class="yellow b">连斗阶段所有队伍取消！</span><br>'); sys.mode = 'command'; }
      else await ctx.next(data);
    },
    async teammake(ctx, id, password) {
      if (!ctx.hasModule('team')) return;
      if (present(await call(ctx, 'is_gamestate_combo'))) { appendLog(ctx, '连斗时不能组建队伍。<br>'); ctx.state('sys').mode = 'command'; }
      else await ctx.next(id, password);
    },
    async teamjoin(ctx, id, password) {
      if (!ctx.hasModule('team')) return;
      if (present(await call(ctx, 'is_gamestate_combo'))) { appendLog(ctx, '连斗时不能加入队伍。<br>'); ctx.state('sys').mode = 'command'; }
      else await ctx.next(id, password);
    },
    async teamquit(ctx) {
      if (!ctx.hasModule('team')) return;
      if (present(await call(ctx, 'is_gamestate_combo'))) { appendLog(ctx, '你不在队伍中。<br>'); ctx.state('sys').mode = 'command'; }
      else await ctx.next();
    },
    async check_team_button_exist(ctx) { if (ctx.hasModule('team')) return present(await call(ctx, 'is_gamestate_combo')) ? 0 : ctx.next(); },
    async calculate_real_trap_obbs(ctx) {
      const increase = present(await call(ctx, 'is_gamestate_combo')) ? 2.5 : 0;
      return n(await ctx.next()) + increase;
    },
  },
};

export const gameflowDuelModule = {
  name: 'gameflow_duel', dependencies: ['sys', 'player', 'gameflow_base'], optionalDependencies: ['corpse', 'metman'],
  functions: {
    async duel(ctx, time = 0, item = '') {
      const sys = ctx.state('sys');
      if (n(sys.gamestate) < 30) return 30;
      if (n(sys.gamestate) >= 50) return 51;
      if (n(time) === 0) time = sys.now;
      sys.gamestate = 50;
      await ctx.call('sys', 'save_gameinfo');
      await news(ctx, time, 'duelkey', ctx.state('player').name, item);
      await news(ctx, time, 'duel'); await chat(ctx, time, 'duel');
      return 50;
    },
    async is_gamestate_duel(ctx) { return n(ctx.state('sys').gamestate) >= 50; },
    async parse_news(ctx, nid, kind, hour, min, sec, a, b, c, d, e, extra = []) {
      ({ hour, min, sec } = ctx.state('sys'));
      const prefix = `<li id="nid${text(nid)}">${text(hour)}时${text(min)}分${text(sec)}秒，`;
      if (kind === 'duel') return `${prefix}<span class="red b">游戏进入死斗阶段！</span></li>`;
      if (kind === 'duelkey') return `${prefix}<span class="yellow b">${text(a)}使用了${text(b)}，启动了死斗程序！</span></li>`;
      return ctx.next(nid, kind, hour, min, sec, a, b, c, d, e, extra);
    },
    async discover_player_filter_alive(ctx, data) {
      const result = await ctx.next(data);
      return n(data.type) > 0 && present(await call(ctx, 'is_gamestate_duel')) ? false : result;
    },
    async calculate_meetman_rate(ctx, searchMode) {
      const duel = present(await call(ctx, 'is_gamestate_duel')), value = await ctx.next(searchMode);
      return duel && ['search', 'move'].includes(searchMode) ? n(value) + (searchMode === 'search' ? 10 : 5) : value;
    },
  },
};

export const gameflowAntiAfkModule = {
  name: 'gameflow_antiafk', dependencies: ['sys', 'map', 'gameflow_base'],
  state: { antiAFKertime_normal: 10, antiAFKertime_room: 10 },
  functions: {
    async reset_game(ctx) { await ctx.next(); ctx.state('sys').afktime = ctx.state('sys').starttime; },
    async check_triggered_antiAFK(ctx) {
      const sys = ctx.state('sys');
      if (n(sys.gamestate) >= 20 && !present(sys.gamevars.forbid_antiAFK)) {
        if (n(sys.room_id) === 0 && present(await ctx.call('gameflow_combo', 'is_gamestate_combo')) && n(sys.now) > n(sys.afktime) + n(await call(ctx, 'get_antiAFKertime')) * 60) return true;
        if (n(sys.room_id) > 0 && n(await ctx.call('map', 'get_area_wavenum')) > 0 && n(sys.now) > n(sys.afktime) + n(await call(ctx, 'get_antiAFKertime')) * 60) return true;
      }
      return false;
    },
    async get_antiAFKertime(ctx) { return n(ctx.state('sys').room_id) > 0 ? ctx.state().antiAFKertime_room : ctx.state().antiAFKertime_normal; },
    async gamestateupdate(ctx) {
      if (present(await call(ctx, 'check_triggered_antiAFK'))) await call(ctx, 'antiAFK', await call(ctx, 'get_antiAFKertime'));
      await ctx.next();
    },
    async antiAFK(ctx, limit = 0) {
      const sys = ctx.state('sys'); if (!present(limit)) limit = await call(ctx, 'get_antiAFKertime');
      const deadline = n(sys.now) - n(limit) * 60;
      const rows = await database(ctx, 'query', `SELECT * FROM ${table(ctx)} WHERE type=0 AND endtime < '${text(deadline)}' AND hp>'0' AND state<'10'`);
      if (!rows.length) return;
      await database(ctx, 'multi_update', table(ctx), rows.map(row => ({ name: row.name, pid: row.pid, hp: 0, state: 32 })), 'pid');
      for (const row of rows) await news(ctx, sys.now, 'death32', row.name, '', row.pls);
      sys.alivenum = Math.max(0, n(sys.alivenum) - rows.length); sys.deathnum = n(sys.deathnum) + rows.length;
      sys.afktime = sys.now;
      await ctx.call('sys', 'save_gameinfo');
    },
    async parse_news(ctx, nid, kind, hour, min, sec, a, b, c, d, e, extra = []) {
      ({ hour, min, sec } = ctx.state('sys'));
      if (kind === 'death32') return `<li id="nid${text(nid)}">${text(hour)}时${text(min)}分${text(sec)}秒，躲藏于<span class="red b">${text(ctx.state('map').plsinfo[c])}</span>的<span class="yellow b">${text(a)}</span><span class="red b">挂机时间过长</span>，被在外等待的愤怒的玩家们私刑处死！</li>`;
      return ctx.next(nid, kind, hour, min, sec, a, b, c, d, e, extra);
    },
  },
};

export const gameflowModules = [gameflowBaseModule, gameflowComboModule, gameflowDuelModule, gameflowAntiAfkModule];
