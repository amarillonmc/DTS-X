import { gencode } from '../protocol/codec.mjs';
import { n, text, present, isset, empty, equal, lookup } from '../system/sys-support.mjs';

export class GamePageError extends Error {
  constructor(code, message) { super(message ?? code); this.name = 'GamePageError'; this.code = code; }
}

function requireLogin(scope) {
  if (!present(scope.cuser) || !present(scope.cpass)) throw new GamePageError('no_login');
}

function deathTime(value) {
  const time = new Date(n(value) * 1000), pad = value => String(value).padStart(2, '0');
  return `${time.getUTCFullYear()}年${pad(time.getUTCMonth() + 1)}月${pad(time.getUTCDate())}日${pad(time.getUTCHours())}时${pad(time.getUTCMinutes())}分${pad(time.getUTCSeconds())}秒`;
}

async function checkPlayer(host, scope) {
  requireLogin(scope);
  const rows = await host.database.query(`SELECT * FROM ${scope.tablepre}players WHERE name = '${scope.cuser}' AND type = 0`);
  if (!rows.length) return false;
  const user = await host.accounts.authenticate({ ...scope, script: 'game', forcedLocal: true });
  if (!equal(rows[0].pass, user.password)) await host.database.query(`UPDATE ${scope.tablepre}players SET pass='${user.password}' WHERE name='${scope.cuser}'`);
  scope.pdata = rows[0]; scope.udata = user;
  return true;
}

async function deathDetails(host, scope) {
  scope.dtime = deathTime(scope.endtime); scope.kname = '';
  if (present(scope.bid)) {
    const rows = await host.database.query(`SELECT name FROM ${scope.tablepre}players WHERE pid='${scope.bid}'`);
    if (rows.length) scope.kname = rows[0].name;
  }
}

/** include/pages/command_act.php: complete action/response/save sequence.
 * The supplied session is the actual configured hook registry. No command is
 * simulated here; every action and override is awaited through that registry.
 */
export async function commandAct(host, scope) {
  const { session, templates } = host;
  const call = (name, ...args) => session.call('player', name, ...args);
  if (!await checkPlayer(host, scope)) return gencode({ url: 'valid.php' });
  if (equal(scope.gamestate, 0)) return gencode({ url: 'end.php' });
  scope.log = scope.cmd = scope.main = '';
  await call('load_playerdata', await call('fetch_playerdata', scope.cuser));
  await call('post_load_profile_event');
  scope.gamedata = { innerHTML: [], value: [], src: [] };
  await call('init_playerdata');
  await call('pre_act');
  if (n(scope.gamestate) >= 20 && n(scope.hp) > 0 && n(scope.state) <= 3) await call('act');
  await call('post_act');
  scope.endtime = n(scope.endtime) < 0 ? 0 : scope.now;
  await call('prepare_response_content');
  await call('parse_interface_profile');
  await call('parse_interface_gameinfo');
  const render = name => templates.render(name, scope);
  if (scope.command === 'enter') scope.gamedata.innerHTML.cmd_interface = await render('cmd_interface');
  if (n(scope.hp) <= 0) {
    await deathDetails(host, scope);
    scope.gamedata.innerHTML.cmd = await render('death'); scope.mode = 'death';
  } else if (present(scope.cmd)) scope.gamedata.innerHTML.cmd = scope.cmd;
  else if (present(scope.itms0)) scope.gamedata.innerHTML.cmd = await render(templates.names.MOD_ITEMMAIN_ITEMFIND);
  else if ([1, 2, 3].some(state => equal(scope.state, state))) scope.gamedata.innerHTML.cmd = await render('rest');
  else if (!present(scope.cmd)) {
    if (scope.mode !== 'command' && present(scope.mode) && templates.has(scope.mode)) scope.gamedata.innerHTML.cmd = await render(scope.mode);
    else if (session.hasModule('tutorial') && equal(scope.gametype, 17)) scope.gamedata.innerHTML.cmd = await render(templates.names.MOD_TUTORIAL_TUTORIAL);
    else {
      scope.gamedata.innerHTML.cmd = await render('command');
      if (!present(lookup(scope.uip.innerHTML, 'log'))) { scope.uip.innerHTML ??= {}; scope.uip.innerHTML.log = ' '; }
    }
  } else scope.log += '游戏流程故障，请联系管理员<br>';
  if (isset(scope.url)) scope.gamedata.url = scope.url;
  for (const key of ['timing', 'display', 'effect']) if (!empty(scope.uip[key])) scope.gamedata[key] = scope.uip[key];
  for (const key of ['innerHTML', 'value', 'src']) if (!empty(scope.uip[key])) Object.assign(scope.gamedata[key], scope.uip[key]);
  scope.gamedata.innerHTML.main = await render(present(scope.main) ? scope.main : 'profile');
  if (isset(scope.error)) scope.gamedata.innerHTML.error = scope.error;
  const response = gencode(scope.gamedata);
  await host.output.take();
  await call('update_sdata');
  await call('before_last_player_save_event');
  await call('player_save', scope.sdata);
  return response;
}

/** include/pages/command_game.php, preserving initial DOM and deferred news. */
export async function commandGame(host, scope) {
  const { session, templates } = host;
  session.importInto(scope,'sys','player','map','logger','itemmain');
  const call = (name, ...args) => session.call('player', name, ...args);
  if (!await checkPlayer(host, scope)) return 'redirect:valid.php';
  if (equal(scope.gamestate, 0)) return 'redirect:end.php';
  scope.log = '';
  await call('load_playerdata', await call('fetch_playerdata', scope.cuser));
  await call('init_playerdata');
  await call('parse_interface_profile');
  if ([4, 5, 6].some(state => equal(scope.state, state))) return 'redirect:end.php';
  scope.chatdata = await session.call('sys', 'getchat', 0, scope.teamID, scope.pid);
  const rows = await host.database.query(`SELECT nid FROM ${scope.tablepre}newsinfo ORDER BY nid LIMIT ${scope.newslimit}`);
  scope.lastnid = rows[0]?.nid ?? null;
  scope.chatdata.lastnid = n(scope.lastnid) - 1;
  scope.nidtmp = 'nid' + text(scope.lastnid);
  scope.chatdata.news = [`<li id="${scope.nidtmp}" class="red b">正在拉取进行状况…</li>`];
  const hpBefore = scope.hp, deadBefore = scope.player_dead_flag;
  if (n(scope.hp) <= 0 || present(scope.player_dead_flag)) { await call('pre_act'); await call('post_act'); }
  if (n(scope.hp) <= 0) { await deathDetails(host, scope); scope.mode = 'death'; }
  else if ([1, 2, 3].some(state => equal(scope.state, state))) scope.mode = 'rest';
  else if (present(scope.itms0)) scope.mode = 'itemmain';
  else scope.mode = 'command';
  await call('prepare_initial_response_content');
  const response = await templates.render('game', scope);
  if (!equal(scope.hp, hpBefore) || !equal(scope.player_dead_flag, deadBefore)) { await call('update_sdata'); await call('player_save', scope.sdata); }
  return response;
}

export function createGameScope(session) {
  return session.importInto(Object.create(null), 'input', 'sys', 'player', 'map', 'itemmain', 'logger');
}
