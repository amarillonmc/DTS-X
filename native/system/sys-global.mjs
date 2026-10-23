import { gdecode, gencode } from '../protocol/codec.mjs';
import { n, text, present, isset, empty, values, lookup, assign, equal, call, database, service, timeText, htmlSpecialChars } from './sys-support.mjs';

export const sysGlobalFunctions = {
  async process_lock(ctx, nonBlocking = false) {
    const state = ctx.state();
    if (!empty(state.plock)) return null;
    const directory = 'gamedata/tmp/processlock/';
    const filename = `process_${Math.trunc(n(state.room_id))}.nlk`;
    // The upstream parameter is unused; preserve blocking acquisition. The
    // host adapter must provide a real persistent lock or reject the request.
    const token = await service(ctx, 'locks', 'acquire', directory + filename, { pollMicroseconds: 10000 });
    if (token === false || token == null) throw new Error('Native sys process lock acquisition failed.');
    state.___PRIVATE_processLock = token;
    state.plock = [directory, filename];
    return true;
  },
  async process_unlock(ctx) {
    const state = ctx.state();
    if (!empty(state.plock)) {
      await service(ctx, 'locks', 'release', state.plock.join(''), state.___PRIVATE_processLock);
      state.plock = null;
      delete state.___PRIVATE_processLock;
    }
  },
  async load_gameinfo(ctx) {
    const state = ctx.state();
    const rows = await database(ctx, 'query', `SELECT * FROM ${state.gtablepre}game WHERE groomid='${text(state.room_id)}'`);
    if (!rows[0]) throw new Error('Game state row is missing.');
    state.gameinfo = structuredClone(rows[0]);
    Object.assign(state, rows[0]);
    await call(ctx, 'load_gameinfo_post_work_core');
    if (!ctx.services.system?.request?.loadCoreOnly) await call(ctx, 'load_gameinfo_post_work_extra');
  },
  async load_gameinfo_post_work_core(ctx) {
    const state = ctx.state();
    state.arealist = text(state.arealist).split(',');
    for (const key of ['noisevars', 'roomvars', 'gamevars']) state[key] = gdecode(state[key]);
  },
  async load_gameinfo_post_work_extra() {},
  async save_gameinfo(ctx, ignoreRoom = 1) {
    const state = ctx.state();
    if (!isset(state.gamenum) || !isset(state.gamestate)) return;
    await call(ctx, 'gameinfo_audit');
    const game = await call(ctx, 'save_gameinfo_prepare_work', structuredClone(state.gameinfo), ignoreRoom);
    await database(ctx, 'arrayUpdate', `${state.gtablepre}game`, game, `groomid='${text(state.room_id)}'`);
  },
  async gameinfo_audit(ctx) {
    const state = ctx.state();
    for (const key of Object.keys(state.gameinfo)) state.gameinfo[key] = structuredClone(state[key] ?? null);
    // The original synchronizes gameinfo BEFORE correcting the live variables.
    // Preserve that ordering, including the first save of an invalid count.
    if (n(state.alivenum) < 0) state.alivenum = 0;
    if (n(state.deathnum) < 0) state.deathnum = 0;
    if (!present(state.afktime)) state.afktime = state.now;
    if (!present(state.hdamage)) state.hdamage = 0;
    if (!present(state.hplayer)) state.hplayer = '';
  },
  async save_gameinfo_prepare_work(ctx, game, ignoreRoom = 1) {
    const result = structuredClone(game);
    for (const key of ['noisevars', 'roomvars', 'gamevars']) result[key] = gencode(result[key]);
    result.arealist = values(result.arealist).map(text).join(',');
    if (present(ignoreRoom)) for (const key of ['groomid', 'groomtype', 'groomstatus', 'roomvars']) delete result[key];
    return result;
  },
  async save_combatinfo(ctx) {
    const state = ctx.state();
    await call(ctx, 'gameinfo_audit');
    const game = await call(ctx, 'save_gameinfo_prepare_work', structuredClone(state.gameinfo));
    const fields = Object.fromEntries(['hdamage', 'hplayer', 'noisevars'].map(key => [key, game[key]]));
    await database(ctx, 'arrayUpdate', `${state.gtablepre}game`, fields, `groomid='${text(state.room_id)}'`);
  },
  async addnews(ctx, time = 0, news = '', a = '', b = '', c = '', d = '', e = '') {
    const state = ctx.state();
    time = present(time) ? time : state.now;
    if (Array.isArray(a) || (a !== null && typeof a === 'object')) a = values(a).map(text).join('_');
    if (text(news).startsWith('death11') || text(news).startsWith('death32')) {
      const rows = await database(ctx, 'query', `SELECT lastword FROM ${state.tablepre}players WHERE name = '${text(a)}'`);
      e = rows[0]?.lastword ?? null;
      await call(ctx, 'addchat', '3', e, a, '', time, c);
    } else if (text(news).startsWith('death15') || text(news).startsWith('death16')) {
      const rows = await database(ctx, 'query', `SELECT lastword,pls FROM ${state.tablepre}players WHERE name = '${text(a)}'`);
      e = rows[0]?.lastword ?? null;
      await call(ctx, 'addchat', '3', e, a, '', time, rows[0]?.pls ?? null);
    }
    await database(ctx, 'execute', `INSERT INTO ${state.tablepre}newsinfo (\`time\`,\`news\`,\`a\`,\`b\`,\`c\`,\`d\`,\`e\`) VALUES ('${text(time)}','${text(news)}','${text(a)}','${text(b)}','${text(c)}','${text(d)}','${text(e)}')`);
    await service(ctx, 'files', 'touch', `gamedata/tmp/news/newsinfo_${text(state.room_prefix)}.php`);
  },
  async addchat(ctx, type, message, sender = '', receiver = '', time = 0, place = 0) {
    const state = ctx.state();
    if (!present(time)) time = state.now;
    if (!present(place)) place = Math.trunc(n(ctx.hasModule('player') ? ctx.state('player').pls : null));
    return database(ctx, 'arrayInsert', `${state.ctablepre}chat`, { type, time, send: sender, recv: receiver, pls: place, msg: message });
  },
  async parse_chat(ctx, record) {
    const chat = structuredClone(record), state = ctx.state(), map = ctx.state('map');
    const type = n(chat.type);
    const css = text(state.chatclass[type]) + (present(chat.type) ? ' b' : '') + ` chat${Math.trunc(type)}`;
    let message;
    if ([0, 1, 7].includes(type)) {
      for (const [code, file] of Object.entries(state.emoticon_list)) chat.msg = text(chat.msg).replaceAll(`[${code}]`, `<img class="emoticon" src="img/emoticons/${file}" style="width:40px;height:40px;" title="<img class=emoticon src=img/emoticons/${file} />" />`);
      for (const [code, replacement] of Object.entries(state.on_premise_chat)) {
        if (text(chat.msg).includes(`[${code}]`)) chat.msg = text(chat.msg).replaceAll(`[${code}]`, replacement.replaceAll('[当前地点]', `【${text(map.plsinfo_disp[Math.trunc(n(chat.pls))])}】`));
      }
    } else if (type === 3) {
      chat.send = `【${text(map.plsinfo_disp[Math.trunc(n(chat.pls))])}】${text(chat.send)}`;
      if (!present(chat.msg)) message = `【${text(state.chatinfo[type])}】${chat.send}什么都没说就死去了 (${timeText(chat.time)})`;
    } else if (type === 5) message = `【${text(state.chatinfo[type])}】${text(chat.msg)}(${timeText(chat.time)})`;
    if (empty(message)) message = `【${text(state.chatinfo[type])}】${!empty(chat.send) ? `${text(chat.send)}：` : ''}${text(chat.msg)}(${timeText(chat.time)})`;
    return `<span id="cid${text(chat.cid)}" class="${css}">${message}<br></span>`;
  },
  async getchat(ctx, last, team = '', playerId = 0, limit = 0) {
    const state = ctx.state();
    if (!present(limit)) limit = state.chatlimit;
    const filter = team === 'all' ? '' : ` AND (recv='' OR (type='1' AND recv='${text(team)}') OR (type!='1' AND recv='${text(playerId)}'))`;
    const rows = await database(ctx, 'query', `SELECT * FROM ${state.ctablepre}chat WHERE cid>'${text(last)}'${filter} ORDER BY cid desc LIMIT ${text(limit)}`);
    const result = { lastcid: last, msg: rows.length ? {} : [] };
    for (const record of rows) {
      const chat = structuredClone(record);
      if (n(result.lastcid) < n(chat.cid)) result.lastcid = chat.cid;
      chat.msg = htmlSpecialChars(chat.msg);
      result.msg[`cid${text(chat.cid)}`] = await call(ctx, 'parse_chat', chat);
    }
    return result;
  },
  async systemputchat(ctx, time, type, message = '') {
    const state = ctx.state();
    if (!present(time)) time = state.now;
    if (type === 'areaadd' || type === 'areawarn') {
      const map = ctx.state('map');
      message = values(message).map(area => `${text(map.plsinfo_disp[area])} `).join('');
      message = (type === 'areaadd' ? '增加禁区：' : '警告，以下区域即将成为禁区：') + message;
    } else {
      const messages = { combo: '游戏进入连斗阶段！', comboupdate: `连斗死亡判断数修正为${text(message)}人！`, duel: '游戏进入死斗模式！', newgame: '游戏开始！', gameover: '游戏结束！', hack: '警告，幻境遭到干扰，所有禁区暂时解除！', hack2: '警告，幻境遭到干扰，下一次禁区将在60秒后提前到来！', hack3: '警告，幻境遭到干扰，未来禁区顺序已遭篡改！', hack4: '警告，幻境遭到干扰，未来禁区时间延后了！' };
      if (Object.hasOwn(messages, type)) message = messages[type];
    }
    await database(ctx, 'execute', `INSERT INTO ${state.tablepre}chat (type,\`time\`,send,msg) VALUES ('5','${text(time)}','','${text(message)}')`);
  },
  async user_set_gamevars_list_init(ctx, registered = []) { return structuredClone(registered); },
  async user_set_gamevars(ctx, input) {
    const state = ctx.state(), result = { notice: [] }, valid = {};
    const registered = await call(ctx, 'user_set_gamevars_list_init');
    for (const key of values(registered)) if (isset(lookup(input, key))) {
      if (Array.isArray(result.notice)) result.notice = {};
      assign(result.notice, key, isset(lookup(state.gamevars, key)) ? `你已经设定过下一局的${text(lookup(state.gamevarsinfo, key))}了。` : await call(ctx, 'user_set_gamevars_process', key, structuredClone(lookup(input, key)), valid));
    }
    if (!empty(valid)) state.gamevars = valid;
    await call(ctx, 'save_gameinfo');
    return result;
  },
  async user_set_gamevars_process(ctx, key, value, valid) {
    assign(valid, key, structuredClone(value));
    return `已设定下一局游戏的${text(lookup(ctx.state().gamevarsinfo, key))}！`;
  },
  async user_display_gamevars_setting(ctx, show = []) { return structuredClone(show); },
};
