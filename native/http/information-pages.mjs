import { gencode } from '../protocol/codec.mjs';
import { round } from '../gameplay/numbers.mjs';
import { n, text, present, empty, isset, equal, values } from '../system/sys-support.mjs';
import { GamePageError } from './game-pages.mjs';

const capture = async (host, name, scope) => text(await host.output.peek()) + await host.templates.render(name, scope);

export async function commandNews(host, scope) {
  host.session.importInto(scope,'sys','player');
  const { files, session } = host, prefix = text(scope.room_prefix);
  const source = `gamedata/tmp/news/newsinfo_${prefix}.php`, all = `gamedata/tmp/news/newsinfo_${prefix}.htm`, last = `gamedata/tmp/news/lastnews_${prefix}.htm`;
  Object.assign(scope,{newsfile:source,newshtm:all,lnewshtm:last});
  async function refresh(target, limit) {
    if (Number(await files.mtime(source)) > Number(await files.mtime(target))) {
      const rows = await session.call('sys', 'load_news', ...(limit === undefined ? [] : [0, limit]));
      await files.write(target, '<ul>' + values(rows).join('') + '</ul>');
    }
  }
  await refresh(last, scope.newslimit);
  let result;
  if (scope.sendmode === 'news' && isset(scope.lastnid)) result = await session.call('sys', 'getnews', Math.trunc(Number.parseFloat(scope.lastnid) || 0));
  else if (scope.newsmode === 'last' || scope.newsmode === 'all') {
    if (scope.newsmode === 'all') await refresh(all);
    const file = scope.newsmode === 'all' ? all : last;
    result = { innerHTML: { newsinfo: await files.exists(file) ? await files.read(file) : false } };
    if (isset(scope.error)) result.innerHTML.error = scope.error;
  } else return host.templates.render('news', scope);
  await host.output.take(); return gencode(result);
}

export async function commandRank(host, scope) {
  const rows = values(await host.users.fetch('COUNT(*)', '1'));
  const count = n(Object.values(rows[0] ?? {})[0]); scope.count = count;
  if (n(scope.ranklimit) < 1) scope.ranklimit = 1;
  let previous = -1;
  if (!isset(scope.command) || !isset(scope.start) || n(scope.start) < 0) scope.start = previous = 0;
  else if (scope.command === 'last') { previous = scope.start; scope.start = n(scope.start) - n(scope.ranklimit); }
  else if (scope.command === 'next') { previous = scope.start; scope.start = n(scope.start) + n(scope.ranklimit); }
  if (count === 0) throw new GamePageError('no_data', 'No data!');
  if (n(scope.start) < 0) scope.start = 0;
  else if (n(scope.start) + n(scope.ranklimit) > count) scope.start = Math.max(0, count - n(scope.ranklimit));
  scope.startnum = n(scope.start) + 1; scope.endnum = Math.min(count, n(scope.start) + n(scope.ranklimit));
  if (isset(scope.command) && equal(scope.start, previous)) return '';
  let where = 'validgames>0', sort = '';
  const tail = ` LIMIT ${text(scope.start)},${text(scope.ranklimit)}`;
  if (!isset(scope.checkmode) || scope.checkmode === 'credits') sort = 'credits DESC, wingames DESC, uid ASC' + tail;
  else if (scope.checkmode === 'total') sort = 'totalcredits DESC, credits DESC, uid ASC' + tail;
  else if (scope.checkmode === 'winrate') { const minimum = n(scope.winratemingames) >= 1 ? scope.winratemingames : 1; where = `validgames>='${text(minimum)}'`; sort = '(wingames/validgames) DESC, credits DESC, uid ASC' + tail; }
  else if (scope.checkmode === 'elorate') sort = 'elo_rating DESC, uid ASC' + tail;
  const users = values(await host.users.fetch('*', where, sort)); scope.rankdata = [];
  let index = n(scope.start) + 1;
  for (const user of users) {
    const data = structuredClone(user); [data.img] = await host.session.call('player', 'icon_parser_shell', data);
    data.number = index++; data.winrate = present(data.wingames) ? text(round(n(data.wingames) / n(data.validgames) * 100)) + '%' : '0%'; scope.rankdata.push(data);
  }
  if (!isset(scope.command)) return host.templates.render('rank', scope);
  const html = await capture(host, 'rankinfo', scope);
  const result = { innerHTML: { rank: html, startnum: scope.startnum, endnum: scope.endnum }, value: { checkmode: scope.checkmode ?? null, start: scope.start } };
  if (isset(scope.error)) result.innerHTML.error = scope.error;
  await host.output.take(); return gencode(result);
}

export async function commandAlive(host, scope) {
  let condition = ' WHERE type=0';
  if (!equal(scope.gametype, 2)) condition += ' AND hp>0 AND state<10';
  if (equal(scope.gametype, 17)) condition += ` AND endtime>${n(scope.now) - 300}`;
  const limit = !isset(scope.alivemode) || scope.alivemode === 'last' ? ` LIMIT ${text(scope.alivelimit)}` : '';
  const rows = await host.database.query(`SELECT * FROM ${scope.tablepre}players${condition} ORDER BY killnum DESC, lvl DESC${limit}`), players = new Map();
  for (const row of rows) {
    const player = structuredClone(row);
    [player.iconImg] = await host.session.call('player', 'icon_parser_shell', player);
    if (equal(scope.gametype, 1)) player.killnum = Math.trunc(n(await host.session.call('skillbase', 'skill_getvalue_direct', 424, 'lvl', player.nskillpara)));
    if (equal(scope.gametype, 2)) {
      player.killnum = Math.trunc(n(await host.session.call('skillbase', 'skill_getvalue_direct', 475, 'wpt', player.nskillpara)));
      player.bounty = Math.trunc(n(await host.session.call('skillbase', 'skill_getvalue_direct', 475, 'bounty', player.nskillpara)));
    }
    [player.dispname, player.sexnsno] = await host.session.call('sys', 'get_valid_disp_user_info', player);
    if (host.session.hasModule('cardbase') && ![0, 1].some(value => equal(scope.gametype, value))) {
      host.session.importInto(scope, 'cardbase');
      const [id, , rare, blink, info] = await host.session.call('cardbase', 'parse_card_show_data', player);
      Object.assign(player, { nowcardrare: rare, nowcardblink: blink, nowcardinfo: !present(id) || !empty(scope.cards[id]?.hidden_cardframe) ? null : info });
    }
    players.set(player.name, player);
  }
  scope.alivedata = [...players.values()].sort((a, b) => n(b.killnum) - n(a.killnum) || n(b.npckillnum) - n(a.npckillnum) || n(b.pid) - n(a.pid));
  if (!isset(scope.alivemode)) return host.templates.render('alive', scope);
  scope.alivedata.innerHTML = { alivelist: await capture(host, 'alivelist', scope) };
  if (isset(scope.error)) scope.alivedata.innerHTML.error = scope.error;
  await host.output.take(); return gencode(scope.alivedata);
}

export async function commandEnd(host, scope) {
  host.session.importInto(scope,'sys','player','map');
  if (!present(scope.cuser) || !present(scope.cpass)) throw new GamePageError('no_login');
  const rows = await host.database.query(`SELECT * FROM ${scope.tablepre}players WHERE name = '${scope.cuser}' AND type = 0`);
  if (!rows.length) return 'redirect:index.php';
  const user = await host.accounts.authenticate({ ...scope, script: 'game', forcedLocal: true });
  const player = rows[0];
  if (!equal(player.pass, user.password)) await host.database.query(`UPDATE ${scope.tablepre}players SET pass='${user.password}' WHERE name='${scope.cuser}'`);
  await host.session.call('player', 'load_playerdata', player); await host.session.call('player', 'init_playerdata'); Object.assign(scope, player);
  if (n(scope.hp) <= 0 || n(scope.state) >= 10) {
    const time = new Date(n(scope.endtime) * 1000), pad = value => String(value).padStart(2, '0');
    scope.dtime = `${time.getUTCFullYear()}年${pad(time.getUTCMonth() + 1)}月${pad(time.getUTCDate())}日${pad(time.getUTCHours())}时${pad(time.getUTCMinutes())}分${pad(time.getUTCSeconds())}秒`;
    if (present(scope.bid)) { const killer = await host.database.query(`SELECT name FROM ${scope.tablepre}players WHERE pid='${scope.bid}'`); if (killer.length) scope.kname = killer[0].name; }
  }
  scope.noticelog = '';
  if (host.session.state('input').ecommand === 'nextgamevars') {
    if (!host.session.hasModule('set_gametype')) scope.noticelog = '缺少必要模块！<br>';
    else if (present(scope.groomid)) scope.noticelog = '只有标准房才能修改下一局模式！<br>';
    else if (![2, 3, 5, 7].some(mode => equal(scope.winmode, mode)) || !equal(scope.cuser, scope.winner) || !present(scope.winner_flag)) scope.noticelog = '你不是获胜者，不能修改下一局模式！<br>';
    else if (!await host.session.call('set_gametype', 'check_gametype_set_valid', scope.ngametype)) scope.noticelog = '不允许把下一局游戏设为该模式！<br>';
    else {
      const result = await host.session.call('sys', 'user_set_gamevars', { next_gametype: Math.trunc(Number.parseFloat(scope.ngametype) || 0) });
      for (const notice of values(result.notice)) scope.noticelog += text(notice) + '<br>';
    }
    scope.next_gamevars_display = await host.session.call('sys', 'user_display_gamevars_setting');
    await host.output.take(); return gencode({ innerHTML: { nextgamevars: scope.next_gamevars_display } });
  }
  scope.next_gamevars_display = await host.session.call('sys', 'user_display_gamevars_setting');
  return host.templates.render('end', scope);
}
