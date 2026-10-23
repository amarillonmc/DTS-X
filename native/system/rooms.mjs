import roomConfig from './room-config.json' with { type: 'json' };
import { reference } from '../modules/registry.mjs';
import { gencode, gdecode } from '../protocol/codec.mjs';
import { n, text, present, empty, equal, isset } from './sys-support.mjs';

const integer = value => Math.trunc(Number.parseFloat(value) || 0);
export const roomPrefixKind = prefix => present(prefix) ? text(prefix).slice(0, 1) : '';
export const roomIsSubroom = prefix => present(prefix) && roomPrefixKind(prefix) === 's';
export const roomPrefixToId = prefix => roomIsSubroom(prefix) ? integer(text(prefix).slice(1)) : 0;
export const roomIdToPrefix = id => present(id) ? 's' + text(id) : '';
export class RoomError extends Error { constructor(message) { super(message); this.name = 'RoomError'; } }

const clubTips = ['称号固定为解离攻坚', '可任意选择一个称号', '称号固定为走路萌物'];
const debuffTips = ['等级上限-100', '全息幻象受到伤害-15%', '杏仁豆腐、黑幕、真职人、电波幽灵受到伤害-15%', '初始体力上限-200', '初始生命上限-50', '陷阱遭遇率+20%', '商店物品售价+25%', '初始生命上限-50', '使用命体回复道具效果-30%', '受到最终伤害+10%', '记忆上限-20', '开局金钱-1000元', '开局5分钟内攻击无法获得熟练度', '开局获得一个诅咒道具', '数据碎片造成伤害+25%', '受伤或受到异常状态20秒内无法去除', '视野上限-4', '受伤或受到异常状态时-10生命上限', '受到最终伤害+10%', '开局进入连斗', '受到最终伤害+15%', '开局获得一个诅咒道具', '无法使用干扰设备，使用探测仪器极大概率失败', '无法使用视野和记忆', '剧情BOSS和英灵殿NPC造成的伤害+25%', '无法装备身体防具', '物品/角色发现率-20%', '抹消基础失效率变为10%', '控伤基础失效率变为15%', '先制率-20%，命中率-20%'];
export function instance3DebuffTips(level) {
  let result = (clubTips[Math.floor(Math.max(n(level) - 1, 0) / 10)] ?? '') + '<br>';
  for (let i = 1; i <= n(level); i++) result += (debuffTips[i - 1] ?? '') + '<br>';
  return result;
}

/** Request-local original room configuration and rules. Data mutations retain
 * references; database operations and game hooks are explicitly asynchronous.
 * The caller serializes room commands with the sys process lock. */
export function createRoomService({ state, database, session, files, templates, output, setCookie, broadcast, enterBattlefield, clock = () => Date.now() / 1000, config = roomConfig.values }) {
  const options = structuredClone(config), types = options.roomtypelist;
  const sys = () => typeof state === 'function' ? state() : state;
  const modules = () => typeof session === 'function' ? session() : session;
  const query = sql => database.query(sql);
  const invoke = (name, ...args) => modules().call('sys', name, ...args);
  const marker = id => `gamedata/tmp/rooms/${text(id)}.txt`;
  const api = {
    config: options,
    tablePrefix(prefix = null, withoutNumber = false) {
      prefix ??= sys().room_prefix;
      return roomIsSubroom(prefix) ? sys().gtablepre + (withoutNumber ? roomPrefixKind(prefix) : text(prefix) + '_') : sys().gtablepre;
    },
    async checkGameNumber(id, gameNumber) {
      const rows = await query(`SELECT groomid, gamenum FROM ${sys().gtablepre}game WHERE groomid='${text(id)}'`);
      return rows.length > 0 && equal(rows[0].gamenum, gameNumber);
    },
    setCurrentId(id) { return setCookie('roomid', id); },
    getVarRef(data, key) {
      if (key === 'pnum' && isset(data.current_game_option?.['group-num'])) return reference({ value: n(data.current_game_option['group-num']) * 5 }, 'value');
      if (isset(data[key])) return reference(data, key);
      if (isset(types[data.roomtype]?.[key])) return reference(types[data.roomtype], key);
      if (isset(data.current_game_option?.[key])) return reference(data.current_game_option, key);
      return reference({ value: null }, 'value');
    },
    getVars(data, key) { return api.getVarRef(data, key).value; },
    getTypeFromGameType(type) { for (const [key, value] of Object.entries(types)) if (equal(value.gtype, type)) return integer(key); return null; },
    initialOptions(type) {
      const result = [];
      for (const [key, setting] of Object.entries(types[type]?.['game-option'] ?? {})) result[key] = (setting.options ?? []).find(option => present(option.default))?.value ?? null;
      return result;
    },
    checkOption(type, key, value) {
      const option = types[type]?.['game-option']?.[key];
      if (!option) return false;
      if (option.type === 'number') return (!isset(option.min) || integer(value) >= n(option.min)) && (!isset(option.max) || integer(value) <= n(option.max));
      return (option.options ?? []).some(option => equal(value, option.value));
    },
    setOption(data, key, value) { if (!api.checkOption(data.roomtype, key, value)) return false; data.current_game_option[key] = value; return null; },
    initialize(type) {
      const settings = types[type]; if (!settings) throw new RoomError('房间参数错误');
      return { roomtype: type, readystat: 0, roomfounder: sys().cuser, kicktime: 0,
        player: Array.from({ length: n(settings.pnum) }, (_, i) => ({ name: '', ready: 0, forbidden: 0, leader: settings['leader-position'][i] })),
        timestamp: 1, chatdata: Array.from({ length: 10 }, () => ({ cid: -1, data: '' })), current_game_option: api.initialOptions(type) };
    },
    participants(data) {
      const players = api.getVars(data, 'player'), total = api.getVars(data, 'pnum'); let count = 0, maximum = total;
      for (let i = 0; i < n(total); i++) { if (text(players[i]?.name) !== '') count++; else if (present(players[i]?.forbidden)) maximum = n(maximum) - 1; }
      return [count, maximum];
    },
    userPosition(data, user = null) {
      if (!present(user)) user = sys().cuser;
      const players = api.getVars(data, 'player');
      for (let i = 0; i < n(api.getVars(data, 'pnum')); i++) if (!present(players[i]?.forbidden) && equal(players[i]?.name, user)) return i;
      return -1;
    },
    creatorCheck(position) { return equal(0, position); },
    teamLeader(data, position) { return api.getVars(data, 'leader-position')?.[position] ?? null; },
    refreshTeamPositions(data, position) {
      const players = api.getVars(data, 'player');
      for (let i = 0; i < n(api.getVars(data, 'pnum')); i++) if (equal(position, api.teamLeader(data, i)) && present(players[i].forbidden)) Object.assign(players[i], { forbidden: 0, name: '', ready: 0 });
    },
    tick(data) { data.timestamp = n(data.timestamp) + 1; },
    newChat(data, message) {
      if (!empty(message)) {
        for (let i = 1; i <= 9; i++) data.chatdata[i - 1] = structuredClone(data.chatdata[i]);
        data.chatdata[9].cid = Math.max(n(data.chatdata[8].cid), 0) + 1; data.chatdata[9].data = message;
      }
      api.tick(data);
    },
    autoKick(data) {
      if (!equal(api.getVars(data, 'readystat'), 1) || Math.floor(clock()) < n(api.getVars(data, 'kicktime'))) return 0;
      const players = api.getVars(data, 'player');
      for (let i = 0; i < n(api.getVars(data, 'pnum')); i++) if (!present(players[i].forbidden) && !present(players[i].ready) && text(players[i].name) !== '') {
        api.newChat(data, `<span class="grey b">${text(players[i].name)}因为长时间未准备，被系统踢出了位置。</span><br>`); players[i].name = '';
      }
      return 1;
    },
    updateState(data, running) {
      const leaders = api.getVars(data, 'leader-position'), teamIds = []; let full = true, changed = 0;
      for (let i = 0; i < n(api.getVars(data, 'pnum')); i++) if (!present(data.player[i]?.forbidden)) {
        if (text(data.player[i]?.name) === '') full = false;
        else if (!teamIds.some(id => equal(id, leaders[i]))) teamIds.push(leaders[i]);
      }
      if (teamIds.length < integer(api.getVars(data, 'min-team'))) full = false;
      if (!present(running) && full && equal(data.readystat, 0)) {
        data.readystat = 1; data.kicktime = Math.floor(clock()) + (present(types[data.roomtype]['ready-expire-time']) ? n(types[data.roomtype]['ready-expire-time']) : 30);
        api.tick(data);
        for (let i = 0; i < n(types[data.roomtype].pnum); i++) data.player[i].ready = 0;
        changed = 1;
      }
      if (!full) { data.readystat = 0; changed = 1; }
      return changed;
    },
    async fetch(id, status = null) {
      // The original optional filter names groomstate (not groomstatus). Keep
      // the query spelling; callers that use it receive the database error.
      const where = id === 'ALL' ? 'groomid > 0' : `groomid = '${integer(id)}'`;
      const rows = await query(`SELECT groomid,groomstatus,groomtype,roomvars FROM ${sys().gtablepre}game WHERE ${where} ${status !== null ? `AND groomstate = '${integer(status)}' ` : ''}ORDER BY groomid`);
      return rows.length ? id === 'ALL' ? rows : rows[0] : null;
    },
    async save(id, data, gameType = null, status = null) {
      let extra = ''; if (gameType !== null) extra += `gametype='${text(gameType)}', `; if (status !== null) extra += `groomstatus='${text(status)}', `;
      return query(`UPDATE ${sys().gtablepre}game SET ${extra} roomvars='${gencode(data)}' WHERE groomid='${text(id)}'`);
    },
    async saveBroadcast(id, data) {
      const row = await api.fetch(id); api.updateState(data, row && n(row.groomstatus) >= 40 ? 1 : 0);
      await api.save(id, data); await files.touch(marker(id));
      // Native listeners use a notification plus a database timestamp check.
      // No per-poll TCP port, daemon executable, or legacy listener is needed.
      await broadcast.notify(id, data.timestamp);
    },
    teamHtml(data, leader) {
      const players = api.getVars(data, 'player'), names = [];
      for (let i = 0; i < n(api.getVars(data, 'pnum')); i++) if (!present(players[i]?.forbidden) && text(players[i]?.name) !== '' && equal(api.teamLeader(data, i), leader)) names.push(players[i].name);
      return names.join(',');
    },
    available(settings) {
      return present(settings.available) && (!present(settings['available-start']) || n(sys().now) >= n(settings['available-start']))
        && (!present(settings['available-end']) || n(sys().now) <= n(settings['available-end']))
        && (!present(settings['req-mod']) || modules().hasModule(settings['req-mod']));
    },
    async showData(data, user) {
      const scope = { ...sys(), roomdata: data, roomtypelist: types, upos: api.userPosition(data, user) };
      const result = { innerHTML: { roommain: await templates.render('roommain', scope) }, value: { timestamp: data.timestamp } };
      if (equal(data.readystat, 2)) result.innerHTML.roomchatarea = '<div></div>'; else result.lastchat = data.chatdata;
      await output.take(); return gencode(result);
    },
    async initializeDatabase(id) {
      // Source room_get_tablepre() reads the current global room prefix here;
      // room_create calls it before switching, room_enter after switching.
      const prefix = api.tablePrefix(), history = sys().gtablepre + 's'; let flags = 0;
      if (!(await query(`SHOW TABLES LIKE '${history}history';`)).length) {
        await query(`CREATE TABLE IF NOT EXISTS ${history}history LIKE ${sys().gtablepre}history;`);
        await query(`INSERT INTO ${history}history (gid) VALUES (0);`); flags += 1;
      }
      if (!(await query(`SHOW TABLES LIKE '${prefix}players';`)).length) {
        for (const name of ['reset', 'players', 'shopitem']) await database.queries(text(await files.read(`gamedata/sql/${name}.sql`)).replaceAll(' bra_', ' ' + prefix).replaceAll('\r', '\n'));
        flags += 4;
      }
      return flags;
    },
    async create(type) {
      const state = sys();
      if (present(state.disable_newgame) || present(state.disable_newroom)) throw new RoomError('系统维护中，暂时不开放新房间');
      type = integer(type); const settings = types[type];
      if (!settings) throw new RoomError('房间参数错误');
      if (!api.available(settings)) throw new RoomError('该房间类型暂不能使用');
      let choice = -1;
      const data = await api.fetch('ALL') ?? [];
      if (present(settings.soleroom)) {
        const ids = new Set(Array.from({ length: n(options.max_room_num) }, (_, i) => i + 1));
        for (const row of data) {
          const id = row.groomid; ids.delete(integer(id));
          if (equal(row.groomtype, type) && n(row.groomstatus) > 0) { choice = id; break; }
          if (equal(row.groomstatus, 0)) { choice = id; await query(`UPDATE ${state.gtablepre}game SET gamestate = 0, groomstatus = 10, groomtype = '${type}',  roomvars='' WHERE groomid = '${text(id)}'`); break; }
        }
        if (ids.size && n(choice) < 0) { choice = ids.values().next().value; await query(`INSERT INTO ${state.gtablepre}game (groomid,groomstatus,groomtype) VALUES ('${choice}',10,'${type}')`); }
      } else {
        const rows = await query(`SELECT groomid, groomtype, groomstatus, roomvars FROM ${state.gtablepre}game ORDER BY groomid`);
        let max = n(options.max_room_num), founded = 0;
        const rooms = new Map(), counts = new Map(), ownedCounts = new Map();
        for (const row of rows) {
          const vars = gdecode(row.roomvars), id = integer(row.groomid), kind = types[row.groomtype]; rooms.set(id, row);
          if (present(kind?.soleroom)) { max++; continue; }
          if (!await files.exists(marker(id))) continue;
          const count = (counts.get(row.groomtype) ?? 0) + 1; counts.set(row.groomtype, count);
          if (present(kind?.globalnum) && count >= n(kind.globalnum) && equal(row.groomtype, type)) throw new RoomError(`${kind.name}房间数目已达上限，请在其中任一房间游戏结束后再尝试创建房间！`);
          if (n(row.groomstatus) > 0 && isset(vars?.roomfounder) && equal(vars.roomfounder, state.cuser) && !present(kind?.soleroom)) {
            founded++; const ownCount = (ownedCounts.get(row.groomtype) ?? 0) + 1; ownedCounts.set(row.groomtype, ownCount);
            if (!present(kind?.['without-ready']) && present(kind?.privatenum) && ownCount >= n(kind.privatenum)) throw new RoomError(`你已经创建了${kind.privatenum}个${kind.name}房间，请在其中任一房间游戏结束后再尝试创建房间！`);
            if (founded >= n(options.max_private_room_num)) throw new RoomError(`你已经创建了${options.max_private_room_num}个以上的房间，请在其中任一房间游戏结束后再尝试创建房间`);
          }
        }
        for (let id = 1; id <= max; id++) {
          if (!rooms.has(id)) { await query(`INSERT INTO ${state.gtablepre}game (gamestate,groomid,groomstatus,groomtype) VALUES (0,'${id}',10,'${type}')`); choice = id; break; }
          if (equal(rooms.get(id).groomstatus, 0)) { await query(`UPDATE ${state.gtablepre}game SET gamestate = 0, groomstatus = 10, groomtype = '${type}', roomvars='' WHERE groomid = '${id}'`); choice = id; break; }
        }
      }
      if (equal(choice, -1)) throw new RoomError('房间数目已经达到上限，请加入一个已存在的房间');
      const room = api.initialize(type); await api.initializeDatabase(choice);
      room.player[0].name = state.cuser; room.roomfounder = state.cuser;
      await files.touch(marker(choice)); await api.save(choice, room, settings.gtype);
      await query(`DELETE from ${state.gtablepre}roomlisteners WHERE roomid = '${text(choice)}'`);
      return choice;
    },
    async enter(id, forceReset = 0) {
      const state = sys(); id = integer(id); const row = await api.fetch(id);
      if (!row) throw new RoomError(`房间${id}数据记录不存在`);
      if (equal(row.groomstatus, 0)) throw new RoomError(`房间${id}已关闭`);
      if (!await files.exists(marker(id))) throw new RoomError(`房间${id}缓存文件不存在`);
      const room = gdecode(row.roomvars), settings = types[row.groomtype]; let redirect = 'index.php';
      if (present(settings['without-ready'])) {
        if (n(row.groomstatus) < 40 && (present(state.disable_newgame) || present(state.disable_newroom))) throw new RoomError('系统维护中，暂时不能加入房间');
        state.room_prefix = roomIdToPrefix(id); state.room_id = id; state.tablepre = api.tablePrefix(); state.wtablepre = state.gtablepre + roomPrefixKind(state.room_prefix);
        await invoke('load_gameinfo'); const initialized = await api.initializeDatabase(id);
        let reset = equal(row.groomstatus, 10) && present(forceReset);
        if (present(settings.soleroom) && !(initialized & 4)) {
          const rows = await query(`SELECT endtime FROM ${state.tablepre}players WHERE type=0 ORDER BY endtime DESC LIMIT 1`);
          if (rows.length && n(state.now) - n(rows[0].endtime) > n(options.soleroom_resettime)) reset = true;
        }
        if (reset) { Object.assign(state, { groomstatus: 40, gamestate: 0, gametype: settings.gtype, starttime: state.now }); await invoke('save_gameinfo', 0); await invoke('routine'); }
        const players = await query(`SELECT * FROM ${state.tablepre}players WHERE name = '${text(state.cuser)}' AND type = 0`); let count = players.length;
        if (present(settings.reset_player_after_leave) && count && n(state.now) - n(players[0].endtime) > n(options.soleroom_private_resettime)) {
          await query(`DELETE FROM ${state.tablepre}players WHERE name = '${text(state.cuser)}' AND type = 0`);
          await query(`DELETE FROM ${state.tablepre}players WHERE type>0 AND teamID = '${text(players[0].pid)}'`); count--;
        }
        if (present(settings['without-valid']) && !count) { const user = state.cudata; await enterBattlefield(user.username, user.password, user.gender, user.icon, null, user.ip); }
        if (n(state.gamestate) < 30 && (reset || present(settings.soleroom))) redirect = 'game.php';
      }
      api.newChat(room, `<span class="grey b">${text(state.cuser)}进入了房间</span><br>`); await api.saveBroadcast(id, room); await api.setCurrentId(id);
      await output.write('redirect:' + redirect); return 1;
    },
    async allRoutine(current = null) {
      const state = sys(), previous = current === null ? state.room_id : current;
      const rows = await query(`SELECT groomid,groomstatus FROM ${state.gtablepre}game WHERE groomstatus>=40`); state.wtablepre = state.gtablepre + 's';
      for (const row of rows) {
        state.room_id = row.groomid; state.room_prefix = roomIdToPrefix(state.room_id);
        if (!equal(state.room_id, previous)) {
          state.tablepre = api.tablePrefix(); await invoke('routine');
          if (!present(state.gamestate)) { await query(`UPDATE ${state.gtablepre}game SET groomstatus=0 WHERE groomid='${text(row.groomid)}'`); if (await files.exists(marker(row.groomid))) await files.remove(marker(row.groomid)); }
        }
      }
      state.room_id = previous; state.room_prefix = roomIdToPrefix(previous); state.wtablepre = state.gtablepre + (present(previous) ? 's' : ''); state.tablepre = api.tablePrefix();
    },
    async closeInGame() {}, // Original function body only imports sys.
  };
  return api;
}
