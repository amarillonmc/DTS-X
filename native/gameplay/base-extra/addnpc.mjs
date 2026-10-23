import { number as n, text, present, appendLog } from '../numbers.mjs';
import { call, eq } from './helpers.mjs';
import config from './addnpc-config.json' with { type: 'json' };

const clear = item => Object.assign(item, { itm: '', itmk: '', itme: 0, itms: 0, itmsk: '' });
const record = value => value !== null && typeof value === 'object';
function database(ctx) { if (!ctx.services.database) throw new Error('Native addnpc requires services.database.'); return ctx.services.database; }
const news = (ctx, kind, a = '', b = '', c = '', d = '', e = '') => ctx.call('sys', 'addnews', ctx.state('sys').now, kind, a, b, c, d, e);
export const addnpcModule = {
  name: 'addnpc', dependencies: ['sys', 'player', 'map', 'logger', 'npc', 'itemmain', 'weather', 'lvlctl'], optionalDependencies: [], templates: [], state: () => structuredClone(config.values),
  functions: {
    async parse_itmuse_desc(ctx, name, kind, effect, durability, special) {
      let result = await ctx.next(name, kind, effect, durability, special);
      if (text(kind).startsWith('Y') || text(kind).startsWith('Z')) {
        const extra = { 挑战者之印: '召唤3名「幻影执行官」进入战场，击败他们能缴获「社员的ID卡」以合成「游戏解除钥匙」', 破灭之诗: '暂时解除禁区，天气变为极光，同时让拟似意识在雏菊之丘登场，通往『幻境解离』的必经之路', 黑色碎片: '召唤「Dark Force幼体」进入战场，把她彻底击倒能缴获「游戏解除钥匙」' };
        result += extra[text(name)] ?? '';
      }
      return result;
    },
    async addnpc(ctx, type, sub, count, showPlace = 0, time = 0) {
      ctx.state('skillbase');
      const definitions = await call(ctx, 'get_addnpclist'), state = ctx.state(), sys = ctx.state('sys'), player = ctx.state('player');
      if (!record(definitions[type])) return;
      let npc = { ...structuredClone(state.npcinit), ...structuredClone(definitions[type]) };
      const areas = await ctx.call('map', 'get_safe_plslist'), ids = [];
      for (let index = 0; index < n(count); index++) {
        // Formatting removes the non-database sub table. Preserve the source's
        // second-iteration merge failure/reset instead of reloading a template.
        npc = record(npc) && record(npc.sub?.[sub]) ? { ...npc, ...structuredClone(npc.sub[sub]) } : {};
        npc.type = type; npc.sNo = index; npc = await ctx.call('npc', 'init_npcdata', npc, areas);
        npc = await ctx.call('player', 'player_format_with_db_structure', npc);
        await database(ctx).arrayInsert(`${sys.tablepre}players`, npc); ids.push(database(ctx).insert_id());
        const name = text(player.typeinfo[type]) + ' ' + text(npc.name);
        if (present(showPlace)) await news(ctx, 'addnpc_pls', name, '', npc.pls ?? null); else await news(ctx, 'addnpc', name);
      }
      return ids;
    },
    async get_addnpclist(ctx) { return structuredClone(ctx.state().anpcinfo); },
    async itemuse(ctx, item) {
      const sys = ctx.state('sys'), player = ctx.state('player');
      if ((text(item.itmk).startsWith('Y') || text(item.itmk).startsWith('Z')) && ['挑战者之印', '破灭之诗', '黑色碎片'].includes(item.itm)) {
        if (sys.pve_ignore_mode.some(mode => eq(mode, sys.gametype))) { appendLog(ctx, `你使用了${text(item.itm)}，但是什么也没有发生（当前游戏模式下不允许PVE）。<br>`); return; }
        if (item.itm === '挑战者之印') {
          appendLog(ctx, '你已经呼唤了幻影执行官，现在寻找并击败他们，<br>并且搜寻他们的ID卡吧！<br>');
          for (let sub = 0; sub < 3; sub++) await call(ctx, 'addnpc', 7, sub, 1); await news(ctx, 'secphase', player.name);
        } else if (item.itm === '破灭之诗') {
          player.rp = 0; appendLog(ctx, '在你唱出那单一的旋律的霎那，<br>整个虚拟世界起了翻天覆地的变化……<br>');
          await call(ctx, 'addnpc', 4, 0, 1); appendLog(ctx, '世界响应着这旋律，产生了异变……<br>'); await ctx.call('weather', 'wthchange', item.itm, 95); await news(ctx, 'thiphase', player.name);
          sys.hack = 1; appendLog(ctx, '因为破灭之歌的作用，全部锁定被打破了！<br>'); await news(ctx, 'hackb', player.name); await ctx.call('sys', 'systemputchat', sys.now, 'hack');
          if (sys.gamevars instanceof Map) sys.gamevars.set('forbid_antiAFK', 1); else sys.gamevars.forbid_antiAFK = 1;
          await ctx.call('sys', 'save_gameinfo');
        } else {
          appendLog(ctx, '你已经呼唤了一个未知的存在，现在寻找并击败她，<br>并且搜寻她的游戏解除钥匙吧！<br>'); await news(ctx, 'dfphase', player.name); await call(ctx, 'addnpc', 12, 0, 1);
        }
        clear(item); return;
      }
      await ctx.next(item);
    },
    async parse_news(ctx, nid, kind, hour, minute, second, a, b, c, d, e, extra = []) {
      ({ hour, min: minute, sec: second } = ctx.state('sys'));
      let message, color = 'yellow';
      if (eq(kind, 'addnpc')) message = `${text(a)}乱入战场！`;
      else if (eq(kind, 'addnpcs')) message = `${text(b)}名${text(a)}加入战斗！`;
      else if (eq(kind, 'addnpc_pls')) message = `${text(a)}乱入了${text(ctx.state('map').plsinfo_disp[c])}！`;
      else if (eq(kind, 'addnpcs_pls')) message = `${text(b)}名${text(a)}乱入了${text(ctx.state('map').plsinfo_disp[c])}！`;
      else if (eq(kind, 'secphase')) { color = 'lime'; message = `${text(a)}使用了挑战者之证，让3名幻影执行官加入了战场！打倒他们去获得ID卡来解除游戏吧！`; }
      else if (eq(kind, 'thiphase')) { color = 'lime'; message = `${text(a)}触发了对虚拟现实的救济！虚拟意识已经在■■■■活性化！`; }
      else if (eq(kind, 'dfphase')) { color = 'lime'; message = `${text(a)}使用了黑色碎片，让1名未知存在加入了战场！打倒她去获得ID卡来解除游戏吧！`; }
      else if (eq(kind, 'hackb')) message = `${text(a)}启动了救济程序，暂时解除了全部禁区！`;
      else if (eq(kind, 'dfsecphase')) { color = 'lime'; message = `${text(a)}闯了大祸，打破了Dark Force的封印！`; }
      else return await ctx.next(nid, kind, hour, minute, second, a, b, c, d, e, extra);
      return `<li id="nid${text(nid)}">${text(hour)}时${text(minute)}分${text(second)}秒，<span class="${color} b">${message}</span></li>`;
    },
  },
};
