import { n, text, present, isset, empty, equal, database, service, roomTable, subroom, utcParts } from './sys-support.mjs';

export async function initializeSys(ctx) {
  const state = ctx.state();
  const request = ctx.services.system?.request;
  if (!request || typeof request !== 'object') throw new Error('Native sys requires system.request with the filtered request context.');
  const prefix = state.gtablepre;
  // init declares prefixed user/pass global, but roomid remains function-local.
  let currentRoomId;
  for (const [key, value] of Object.entries(request.cookies ?? {})) {
    if ([`${prefix}user`, `${prefix}pass`].includes(key)) state[key] = structuredClone(value);
    else if (key === `${prefix}roomid`) currentRoomId = structuredClone(value);
    else if (key === 'templateid') state.u_templateid = structuredClone(value);
  }
  if (Object.hasOwn(request.post ?? {}, 'templateid')) state.u_templateid = structuredClone(request.post.templateid);
  if (typeof ctx.services.output?.take !== 'function') throw new Error('Native sys initialization requires output.take().');
  await ctx.services.output.take();

  // A connected Node database is injected by the host. No native PHP, implicit
  // local database connection or mock database is created during module init.
  if (typeof ctx.services.database?.query !== 'function') throw new Error('Native sys initialization requires a connected database service.');
  const epoch = ctx.services.system?.clock?.now ? await service(ctx, 'clock', 'now') : Date.now() / 1000;
  state.now = Math.floor(n(epoch)) + Math.trunc(n(state.moveut)) * 3600 + Math.trunc(n(state.moveutmin)) * 60;
  Object.assign(state, utcParts(state.now, true));
  const input = ctx.state('input'), list = input.INPUT_VAR_LIST ?? {};
  for (const key of [`${prefix}user`, `${prefix}pass`]) if (isset(list[key])) state[key] = structuredClone(list[key]);
  if (isset(list[`${prefix}roomid`])) currentRoomId = structuredClone(list[`${prefix}roomid`]);
  if (isset(list.templateid)) state.u_templateid = structuredClone(list.templateid);

  if (isset(state[`${prefix}user`])) {
    const forced = state.userdb_forced_local;
    if (request.script === 'game' || request.script === 'chat') state.userdb_forced_local = 1;
    state.cudata = await service(ctx, 'users', 'fetchByUsername', state[`${prefix}user`], { forcedLocal: state.userdb_forced_local });
    state.userdb_forced_local = forced;
  }
  if (empty(state.u_templateid) && !empty(state.cudata?.u_templateid)) state.u_templateid = state.cudata.u_templateid;
  state.room_prefix = '';
  state.room_id = 0;
  if (isset(list.___GAME_ROOMID) && list.___GAME_ROOMID !== '') {
    // PHP's integer conversion accepts a numeric prefix; this is a room ID,
    // not a general arithmetic field, so preserve that specific conversion.
    const numeric = text(list.___GAME_ROOMID).match(/^[\s]*[+-]?\d+/);
    state.room_id = numeric ? Number.parseInt(numeric[0], 10) : 0;
    if (!Number.isSafeInteger(state.room_id)) throw new RangeError('Room ID exceeds native integer precision.');
    if (!equal(state.room_id, currentRoomId)) {
      currentRoomId = state.room_id;
      await service(ctx, 'rooms', 'setCurrentId', state.room_id);
    }
  } else if (!empty(currentRoomId)) state.room_id = currentRoomId;
  state.room_prefix = present(state.room_id) ? `s${text(state.room_id)}` : '';
  state.gameinfo = null;
  let rows = await database(ctx, 'query', `SELECT * FROM ${prefix}game where groomid='${text(state.room_id)}'`);
  if (rows.length) {
    state.gameinfo = structuredClone(rows[0]);
    if (equal(state.gameinfo.groomstatus, 0)) {
      state.room_id = 0; state.room_prefix = ''; state.gameinfo = null;
    } else if (n(state.gameinfo.groomstatus) > 0 && equal(state.gameinfo.gamestate, 0) && subroom(state.room_prefix)) {
      await database(ctx, 'execute', `UPDATE ${prefix}game SET groomstatus=10 WHERE groomid='${text(state.room_id)}'`);
      state.gameinfo.groomstatus = 10;
    }
  } else { state.room_prefix = ''; state.room_id = 0; state.gameinfo = null; }
  if (!present(state.room_id) || empty(state.gameinfo)) {
    rows = await database(ctx, 'query', `SELECT * FROM ${prefix}game where groomid='0'`);
    state.gameinfo = structuredClone(rows[0] ?? null);
  }
  if (!state.gameinfo) throw new Error('Main game state row is missing.');
  Object.assign(state, state.gameinfo);
  state.tablepre = roomTable(state);
  state.ctablepre = state.tablepre;
  state.wtablepre = state.room_prefix === '' ? prefix : prefix + text(state.room_prefix).slice(0, 1);
  state.cuser = state[`${prefix}user`] ?? null;
  state.cpass = state[`${prefix}pass`] ?? null;
  state.mode = request.daemon && isset(list.mode) ? list.mode : input.mode ?? null;
  state.command = request.daemon && isset(list.command) ? list.command : input.command ?? null;
  if (!empty(state.cuser)) state.new_messages = await service(ctx, 'messages', 'checkNew', state.cuser);
}
