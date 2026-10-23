import { gencode } from '../protocol/codec.mjs';
import { round } from '../gameplay/numbers.mjs';
import { n, text, present, isset, empty, values, entries, lookup, assign, equal, includes, call, database, service, subroom, utcParts, protectedHeader } from './sys-support.mjs';

export const sysGameFunctions = {
  async updategame() {},
  async reset_game(ctx) {
    const state = ctx.state();
    state.gamenum = n(state.gamenum) + 1;
    const rows = await database(ctx, 'query', `SELECT gid FROM ${state.wtablepre}history ORDER BY gid DESC LIMIT 1`);
    if (rows.length && n(state.gamenum) <= n(rows[0].gid)) state.gamenum = n(rows[0].gid) + 1;
    if (!present(state.groomid)) { state.groomtype = 0; state.groomstatus = 40; state.roomvars = []; }
    await call(ctx, 'reset_gametype');
    state.gamestate = 5;
    await call(ctx, 'save_gameinfo', 0);
    if (state.gamevars === null || typeof state.gamevars !== 'object') state.gamevars = [];
    else {
      const registered = await call(ctx, 'user_set_gamevars_list_init');
      const remaining = Object.entries(state.gamevars).filter(([key]) => includes(registered, key));
      state.gamevars = remaining.length ? Object.fromEntries(remaining) : [];
    }
    let sql = text(await service(ctx, 'files', 'read', 'gamedata/sql/reset.sql'));
    sql = sql.replaceAll(' bra_', ` ${state.tablepre}`).replaceAll('\r', '\n');
    await database(ctx, 'queries', sql);
    await service(ctx, 'files', 'write', `gamedata/tmp/news/newsinfo_${text(state.room_prefix)}.php`, protectedHeader, 'wb');
    state.hdamage = 0; state.hplayer = '';
    await call(ctx, 'save_combatinfo');
    await service(ctx, 'files', 'clear', `gamedata/tmp/replay/${text(state.room_prefix)}_/`, { keepRoot: true, expireSeconds: 0 });
    await service(ctx, 'files', 'clear', `gamedata/tmp/playerlock/room${text(state.groomid)}/`, { keepRoot: true, expireSeconds: 0 });
    // The original response files are indexed by room_id, not room_prefix.
    const responseDirectory = ctx.services.system?.responseDirectory ?? 'gamedata/tmp/response/';
    await service(ctx, 'files', 'clear', `${responseDirectory}${text(state.room_id)}_/`, { keepRoot: true, expireSeconds: 0 });
    await service(ctx, 'files', 'clear', `${responseDirectory}_/`, { keepRoot: true, expireSeconds: 21600 });
  },
  async reset_gametype(ctx) { if (!present(ctx.state().groomid)) ctx.state().gametype = 0; },
  async prepare_new_game() {},
  async rs_game(ctx, mode = 0) {},
  async rs_sttime(ctx) {
    const state = ctx.state();
    Object.assign(state, utcParts(state.now));
    const makeTime = (hour, minute, day = state.day) => Date.UTC(state.year, state.month - 1, day, hour, minute, 0) / 1000;
    if (subroom(state.room_prefix) || present(state.disable_newgame) || !present(state.startmode)) state.starttime = 0;
    else if (equal(state.startmode, 1)) state.starttime = makeTime(n(state.starthour), n(state.startmin), state.hour >= n(state.starthour) ? state.day + 1 : state.day);
    else if (equal(state.startmode, 2)) {
      state.starthour = n(state.starthour) > 0 ? state.starthour : 1;
      state.startmin = n(state.startmin) > 0 ? state.startmin : 1;
      state.starttime = makeTime(state.hour + n(state.starthour), n(state.startmin));
    } else if (equal(state.startmode, 3)) {
      state.startmin = n(state.startmin) > 0 ? state.startmin : 1;
      let minute = state.min + n(state.startmin);
      if (minute % 60 === 0) minute++;
      state.starttime = makeTime(state.hour, minute);
    } else state.starttime = 0;
    await call(ctx, 'save_gameinfo');
  },
  async post_gameover_events() {},
  async post_winnercheck_events() {},
  async gameover(ctx, time = 0, mode = '', winnerName = '') {
    const state = ctx.state(), player = ctx.state('player');
    await call(ctx, 'process_lock');
    await call(ctx, 'load_gameinfo');
    // Early exits intentionally leave the request-owned lock acquired, just
    // like the source. The host request finalizer must release outstanding locks.
    if (n(state.gamestate) < 5) return;
    state.gamestate = 0;
    state.gamevars ??= {};
    state.gamevars.o_starttime = state.starttime;
    state.starttime = 0;
    await call(ctx, 'save_gameinfo');
    state.starttime = state.gamevars.o_starttime;

    state.gameover_plist = new Map();
    const alive = new Map();
    let rows = await database(ctx, 'query', `SELECT name FROM ${state.tablepre}players WHERE type=0`);
    for (const row of rows) {
      // The source SELECT contains name only. Retain that missing-pid check;
      // it generally fetches every player instead of reusing current sdata.
      const data = !empty(player.sdata) && equal(row.pid ?? null, player.sdata.pid)
        ? structuredClone(player.sdata) : await ctx.call('player', 'fetch_playerdata', row.name);
      assign(state.gameover_plist, row.name, data);
      if (n(data.hp) > 0) assign(alive, row.name, data);
    }
    if (!empty(state.gameover_plist)) {
      const users = await service(ctx, 'users', 'fetchMany', '*', { username: [...state.gameover_plist.keys()] });
      state.gameover_ulist = new Map(entries(users));
      if (empty(state.gameover_ulist)) return;
    } else state.gameover_ulist = new Map();
    state.validnum = state.gameover_plist.size;
    state.alivenum = alive.size;
    if (present(mode)) state.winmode = text(mode).slice(3, 4);
    else if (state.validnum <= 0) { state.alivenum = 0; state.winmode = 4; }
    else state.winmode = state.alivenum ? 2 : 1;

    if (includes([1, 4, 6], state.winmode)) { state.winnum = 0; state.winner = ''; }
    const teamMode = includes(state.teamwin_mode, state.gametype);
    let firstTeam, nameList;
    if (present(winnerName) && !teamMode) { state.winnum = 1; state.winner = winnerName; }
    else if (equal(state.winmode, 2) && !teamMode) {
      if (state.alivenum === 1) {
        state.winnum = 1;
        const data = values(alive)[0];
        state.winner = data.name; data.winner_flag = state.winmode;
        await ctx.call('player', 'player_save', data);
      } else { state.winmode = 0; await call(ctx, 'save_gameinfo'); return; }
    } else if (teamMode) {
      let teamWin = 0;
      if (equal(state.winmode, 2) && !present(winnerName)) {
        firstTeam = await call(ctx, 'check_alivelist_teamwin');
        if (firstTeam === 0) { state.winmode = 0; await call(ctx, 'save_gameinfo'); return; }
        if (firstTeam === 1) {
          const data = values(alive)[0];
          if (!data) throw new Error('Team-win hook returned a single winner without a surviving player.');
          data.winner_flag = 2;
          await ctx.call('player', 'player_save', data);
          state.winnum = 1; state.winner = data.name;
        } else teamWin = 1;
      } else if (present(winnerName)) {
        firstTeam = lookup(state.gameover_plist, winnerName)?.teamID ?? null;
        if (!empty(firstTeam)) teamWin = 1;
        else { state.winnum = 1; state.winner = winnerName; }
      }
      if (teamWin === 1) {
        const teammates = [];
        for (const data of values(state.gameover_plist)) if (equal(data.teamID, firstTeam)) {
          data.winner_flag = state.winmode;
          teammates.push(data.name);
        }
        await database(ctx, 'execute', `UPDATE ${state.tablepre}players SET winner_flag='${text(state.winmode)}' WHERE type = 0 AND teamID = '${text(firstTeam)}'`);
        state.winnum = teammates.length;
        if (state.winnum === 1) state.winner = teammates[0];
        else if (state.winnum > 1) state.winner = nameList = teammates.join(',');
      }
    }
    // Keep the upstream AND expression exactly. Correcting it is a separate
    // gameplay/database change, not part of a faithful migration.
    if (equal(state.winmode, 1)) await database(ctx, 'execute', `UPDATE ${state.tablepre}players SET hp=0 AND state=11 WHERE type=0 AND hp>0`);
    await call(ctx, 'post_winnercheck_events', state.winner);
    time = !empty(time) ? time : state.now;
    rows = await database(ctx, 'query', `SELECT gid FROM ${state.wtablepre}history ORDER BY gid DESC LIMIT 1`);
    if (rows.length && n(state.gamenum) <= n(rows[0].gid)) state.gamenum = n(rows[0].gid) + 1;
    const history = { gid: state.gamenum, gametype: state.gametype, wmode: state.winmode, vnum: state.validnum, gstime: state.starttime, getime: time, gtime: n(time) - n(state.starttime) };
    if (!includes([0, 4], state.winmode)) {
      history.hdmg = state.hdamage; history.hdp = state.hplayer;
      rows = await database(ctx, 'query', `SELECT name,killnum FROM ${state.tablepre}players WHERE type=0 order by killnum desc, lvl desc limit 1`);
      history.hkill = present(rows[0]?.killnum) ? rows[0].killnum : 0;
      history.hkp = present(rows[0]?.name) ? rows[0].name : '';
      history.validlist = gencode(state.gameover_plist);
    }
    if (!includes([0, 1, 4, 6], state.winmode)) {
      history.winner = state.winner; history.winnernum = state.winnum;
      if (equal(state.winnum, 1)) history.winnerpdata = gencode(lookup(state.gameover_plist, state.winner) ?? null);
      else { history.winnerteamID = firstTeam ?? null; history.winnerlist = nameList ?? null; }
    }
    await database(ctx, 'arrayInsert', `${state.wtablepre}history`, history);
    const insertedGame = state.gamenum;
    await call(ctx, 'gameover_set_credits');
    await call(ctx, 'rs_sttime');
    await call(ctx, 'post_gameover_events');
    const updates = structuredClone(state.gameover_ulist);
    for (const row of values(updates)) for (const key of Object.keys(row)) {
      // Deliberately call the hook for each field, as the source does.
      if (!includes(await call(ctx, 'get_gameover_udata_update_fields'), key)) delete row[key];
    }
    await service(ctx, 'users', 'updateMany', updates);
    await call(ctx, 'addnews', time, `end${text(state.winmode)}`, state.winner);
    await call(ctx, 'addnews', time, 'gameover', state.gamenum);
    await call(ctx, 'systemputchat', time, 'gameover');
    const news = await call(ctx, 'load_news');
    let encodedNews = gencode(`<ul>${values(news).join('')}</ul>`);
    if (present(state.hnewsstorage)) {
      const chunkSize = 1024 * 1024 - 200;
      do {
        const chunk = encodedNews.slice(0, chunkSize); encodedNews = encodedNews.slice(chunkSize);
        await database(ctx, 'execute', `UPDATE ${state.wtablepre}history SET hnews=CONCAT(hnews, '${chunk}') WHERE gid='${text(insertedGame)}'`);
      } while (encodedNews !== '');
    } else {
      const prefix = subroom(state.room_prefix) ? `${text(state.room_prefix).slice(0, 1)}.` : '';
      await service(ctx, 'files', 'write', `gamedata/bak/${prefix}${text(state.gamenum)}_newsinfo.dat`, encodedNews, 'wb+');
    }
    await call(ctx, 'process_unlock');
  },
  async is_winner(ctx, name, winners) { return text(winners).includes(',') ? includes(text(winners).split(','), name) : equal(name, winners); },
  async get_gameover_udata_update_fields() { return ['username', 'validgames', 'wingames', 'lastwin', 'credits', 'gold', 'u_achievements']; },
  async routine(ctx) {
    for (const operation of ['process_lock', 'load_gameinfo', 'updategame', 'save_gameinfo', 'process_unlock']) await call(ctx, operation);
  },
  async gameover_set_credits(ctx) {
    const state = ctx.state();
    if (empty(state.gameover_plist)) return;
    for (const [key, data] of entries(state.gameover_plist)) if (isset(lookup(state.gameover_ulist, key))) {
      const user = lookup(state.gameover_ulist, key);
      user.credits = n(user.credits) + n(await call(ctx, 'gameover_get_credit_up', structuredClone(data), state.winner, state.winmode));
      user.gold = n(user.gold) + n(await call(ctx, 'gameover_get_gold_up', structuredClone(data), state.winner, state.winmode));
      if (!equal(state.gametype, 15)) user.validgames = n(user.validgames) + 1;
      // Preserve exact whole-string winner comparison: team winner strings do
      // not increment individual wingames in this base module.
      if (((!equal(state.gametype, 15) && includes([2, 3, 5, 7], state.winmode)) || equal(state.gametype, 1)) && equal(key, state.winner)) {
        user.wingames = n(user.wingames) + 1; user.lastwin = state.now;
      }
    }
  },
  async gameover_get_credit_up(ctx, data, winner = '', mode = 0) {
    const state = ctx.state();
    // The source import rebinds its $winner/$winmode parameters to sys globals.
    winner = state.winner; mode = state.winmode;
    if (includes(state.qiegao_ignore_mode, state.gametype)) return 0;
    let reward;
    if (await call(ctx, 'is_winner', data.name, winner)) reward = ({ 2: 200, 3: 500, 5: 100, 7: 1200 })[n(mode)] ?? 50;
    else reward = n(data.hp) > 0 ? 25 : 10;
    if (present(data.killnum)) reward += n(data.killnum) * 10;
    if (present(data.npckillnum)) reward += n(data.npckillnum) * 2;
    if (present(data.lvl)) reward += round(n(data.lvl) / 2);
    const skill = Math.max(...['wp', 'wk', 'wg', 'wc', 'wd', 'wf'].map(key => n(data[key])));
    reward += Math.min(2000, round(skill / 25));
    const money = await call(ctx, 'gameover_check_money_got', structuredClone(data));
    reward += Math.min(2000, round(n(money) / 500));
    return reward;
  },
  async gameover_check_money_got(ctx, data) { return data.money; },
  async gameover_get_gold_up(ctx, data, winner = '', mode = 0) {
    winner = ctx.state().winner; mode = ctx.state().winmode;
    if (includes(ctx.state().qiegao_ignore_mode, ctx.state().gametype)) return 0;
    return await call(ctx, 'is_winner', data.name, winner) ? ({ 2: 120, 3: 233, 7: 514 })[n(mode)] ?? 100 : 10;
  },
  async check_alivelist_teamwin(ctx) {
    const rows = await database(ctx, 'query', `SELECT teamID FROM ${ctx.state().tablepre}players WHERE type=0 AND hp>0`);
    let first = true, team = '';
    for (const row of rows) {
      if (first) { first = false; team = row.teamID; }
      else if (!equal(team, row.teamID) || !present(row.teamID)) return 0;
    }
    return present(team) ? team : 1;
  },
};
