import { gencode } from '../protocol/codec.mjs';
import { n, text, present, empty, isset, equal, values } from '../system/sys-support.mjs';
import { roomIdToPrefix } from '../system/rooms.mjs';

export async function chatPage(host, scope) {
  if (scope.sendmode !== 'newspage' && !present(scope.cuser)) return 'Not in game.';
  const call = (name, ...args) => host.session.call('sys', name, ...args);
  await call('load_gameinfo');
  scope.ctablecorrect = 1; scope.userdb_forced_local = 1;
  if ((isset(scope.cgamenum) && !equal(scope.gamenum, scope.cgamenum)) || (isset(scope.croomid) && !equal(scope.groomid, scope.croomid))) {
    if (!empty(scope.obsv_flag) || await host.rooms.checkGameNumber(scope.croomid, scope.cgamenum)) scope.ctablepre = host.rooms.tablePrefix(roomIdToPrefix(scope.croomid));
    else scope.ctablecorrect = 0;
  }
  if (!empty(scope.obsv_flag)) scope.is_obsv_danmaku = 1;
  if (present(scope.ctablecorrect) && scope.sendmode === 'send' && present(scope.chatmsg)) {
    if (text(scope.chatmsg).startsWith('/')) {
      scope.groupid = scope.cudata?.groupid;
      if (n(scope.groupid) > 1) {
        if (text(scope.chatmsg).startsWith('/post')) { scope.chatmsg = text(scope.chatmsg).slice(6); if (present(scope.chatmsg)) await call('addchat', 4, scope.chatmsg, scope.cuser); }
        else scope.showdata = { lastcid: scope.lastcid, msg: ['<span class="red b">指令错误。<br></span>'] };
      } else scope.showdata = { lastcid: scope.lastcid, msg: ['<span class="red b">聊天信息不能用 / 开头。<br></span>'] };
    } else if (!empty(scope.is_obsv_danmaku)) await call('addchat', 7, scope.chatmsg, scope.cuser, '', 0, scope.cpls);
    else if (equal(scope.chattype, 0)) await call('addchat', 0, scope.chatmsg, scope.cuser, '', 0, scope.cpls);
    else if (equal(scope.chattype, 1)) await call('addchat', 1, scope.chatmsg, scope.cuser, scope.teamID, 0, scope.cpls);
  } else if (present(scope.ctablecorrect) && scope.sendmode === 'newspage') {
    scope.showdata ??= {}; scope.showdata.innerHTML ??= {}; scope.showdata.innerHTML.newsinfo = '';
    scope.chats = await call('getchat', 0, '', 0, scope.chatinnews); scope.chatmsg = scope.chats.msg;
    scope.showdata.innerHTML.newsinfo = values(scope.chatmsg).map(text).join('');
  }
  if (!present(scope.ctablecorrect) && n(scope.lastcid) >= 0 && n(scope.gamestate) > 0) {
    scope.lastcid = -1; scope.showdata = { lastcid: -1, msg: ['<span class="red b">房间号错误，可能是新一局游戏已开始。<br></span>'], cmd: 'chat-ref-stop' };
  }
  if (present(scope.ctablecorrect) && empty(scope.showdata)) scope.showdata = present(scope.chatpid) ? await call('getchat', scope.lastcid, scope.teamID, scope.chatpid) : await call('getchat', scope.lastcid, scope.teamID);
  if (isset(scope.error)) { scope.showdata ??= {}; scope.showdata.innerHTML ??= {}; scope.showdata.innerHTML.error = scope.error; }
  await host.output.take(); return gencode(scope.showdata ?? null);
}
