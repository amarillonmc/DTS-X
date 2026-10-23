import { text, present, isset, empty, n, call, database, roomTable, utcParts } from './sys-support.mjs';

export const sysNewsFunctions = {
  async parse_news(ctx, nid, news, hour, minute, second, a, b, c, d, e, extra = []) {
    const state = ctx.state();
    // import_module('sys') rebinds these three arguments to exported globals.
    // load_news sets those globals before calling the rendering hook.
    hour = state.hour; minute = state.min; second = state.sec;
    const prefix = `<li id="nid${text(nid)}">${text(hour)}时${text(minute)}分${text(second)}秒，`;
    const span = (color, content) => `${prefix}<span class="${color}">${content}</span></li>`;
    const room = present(state.groomtype) ? '房间局' : '';
    switch (news) {
      case 'newgame': return span('red b', `${room}第${text(a)}回ACFUN大逃杀开始了`);
      case 'gameover': return span('red b', `${room}第${text(a)}回ACFUN大逃杀结束了`);
      case 'newpc': return span('yellow b', `${text(a)}(${text(b)})进入了大逃杀战场`);
      case 'newgm': return span('yellow b', `管理员-${text(a)}(${text(b)})华丽地乱入了战场`);
      case 'end0': return span('red b', '游戏出现故障，意外结束');
      case 'end1': return span('red b', '参与者全部死亡！');
      case 'end2': return span('yellow b', `优胜者——${text(a)}！`);
      case 'end3': return span('yellow b', `${text(a)}解除了精神锁定，游戏紧急中止`);
      case 'end4': return span('red b', '无人参加，游戏自动结束');
      case 'end5': return span('red b', `${text(a)}引爆了核弹，毁坏了虚拟战场`);
      case 'end6': return span('red b', '本局游戏被GM中止');
      case 'end7': return span('evergreen b', `${text(a)}完成了他的使命。`);
      case 'end8': return span('red b', '限制时间到，本局游戏结束。');
      case 'wintutorial': return span('red b', `${text(a)}完成了教程。`);
      case 'corpseclear': return span('lime b', `${text(a)}使用了凸眼鱼，${text(b)}具尸体被吸走了！`);
      case 'sysaddarea': return span('red b', '奇迹和魔法都是存在的！禁区提前增加了！');
      case 'syshackchg': return span(present(a) ? 'lime b' : 'yellow b', `奇迹和魔法都是存在的！${present(a) ? '全部禁区都被解除了' : '禁区恢复了未解除状态'}！`);
      case 'sysgschg': {
        const variants = { 20: ['lime b', '当前游戏立即开始了！'], 30: ['yellow b', '当前游戏停止激活！'], 40: ['red b', '当前游戏进入连斗阶段！'], 50: ['red b', '当前游戏进入死斗阶段！'] };
        const [color, message] = variants[n(a)] ?? ['red b', '异常语句，请联系管理员！'];
        return span(color, `奇迹和魔法都是存在的！${message}`);
      }
      case 'alive': return `${prefix}<span class="yellow b">${text(a)}</span>被<span class="yellow b">神北 小毬许愿复活</span></li>`;
      case 'delcp': return span('red b', `${text(a)}的尸体被时空特使别动队销毁了`);
      case 'editpc': return span('red b', `${text(a)}遭到了黑幕的生化改造！`);
      case 'roominfo': return `${prefix}本局游戏为<span class="yellow b">${text(a)}</span>，${text(b)}${text(c)}${text(d)}${text(e)}</li>`;
      default:
        if (text(news).startsWith('death')) {
          const message = news === 'death15' ? '被<span class="red b">时空特使强行消除</span>' : news === 'death16' ? '被<span class="red b">由理直接拉入SSS团</span>' : '因<span class="red b">不明原因</span>死亡';
          return `${prefix}<span class="yellow b">${text(a)}</span>${message}${text(extra.dword)}</li>`;
        }
        // $time is undefined in this original fallback; do not substitute now.
        return `<li>,${text(news)},${text(a)},${text(b)},${text(c)},${text(d)}<br>\n`;
    }
  },
  async load_news(ctx, start = 0, range = 0, noDay = 0, prefix = 'default') {
    const state = ctx.state();
    if (prefix === 'default') prefix = state.room_prefix;
    let query = `SELECT * FROM ${roomTable(state, prefix)}newsinfo `;
    if (present(start)) query += `WHERE nid > ${text(start)} `;
    query += 'ORDER BY nid DESC ';
    if (n(range) > 0) query += `LIMIT ${text(range)}`;
    const rows = await database(ctx, 'query', query);
    let previousDay = 0;
    let list = [];
    for (const row of rows) {
      const parts = utcParts(row.time, true);
      // import_module gives references: the date tuple intentionally replaces
      // the request's exported sys date fields while news rows are processed.
      Object.assign(state, parts);
      if (!present(noDay) && n(parts.day) !== n(previousDay)) {
        if (Array.isArray(list)) list = {};
        list[`nday${text(previousDay)}`] = `<div class="evergreen b"><B>${parts.month}月${parts.day}日(星期${text(state.week[parts.wday])})</B></div>`;
        previousDay = parts.day;
      }
      const args = [row.nid, row.news, parts.hour, parts.min, parts.sec, row.a, row.b, row.c, row.d, row.e];
      const extra = await call(ctx, 'parse_news_prepare', ...args);
      const html = await call(ctx, 'parse_news', ...args, extra);
      if (present(html)) { if (Array.isArray(list)) list = {}; list[`nid${text(row.nid)}`] = html; }
    }
    return list;
  },
  async parse_news_prepare(ctx, nid, news, hour, minute, second, a, b, c, d, e) {
    if (!text(news).startsWith('death')) return [];
    const types = ctx.state().typeinfo ?? {};
    const name = isset(types[b]) ? `${text(types[b])} ${text(a)}` : text(a);
    return { dword: !present(e) ? `<span class="yellow b">【${name} 什么都没说就死去了】</span><br>\n` : `<span class="yellow b">【${name}：“${text(e)}”】</span><br>\n` };
  },
  async getnews(ctx, start = 0, range = 0, prefix = 'default') {
    const news = await call(ctx, 'load_news', start, range, 1, prefix);
    const first = Object.keys(news).find(key => key.includes('nid'));
    if (!empty(news) && first === undefined) throw new Error('News hooks returned entries without a news ID.');
    return { news, lastnid: first === undefined ? start : first.replaceAll('nid', '') };
  },
  async get_valid_disp_user_info(ctx, player) { return [player.name, `${text(ctx.state().sexinfo[player.gd])}${text(player.sNo)}号`]; },
};
