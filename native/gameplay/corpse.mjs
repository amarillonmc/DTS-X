import { number as n, present, text, appendLog } from './numbers.mjs';

const call = (ctx, name, ...args) => ctx.call('corpse', name, ...args);
const mode = ctx => { ctx.state('sys').mode = 'command'; };
const corpseId = action => text(action).startsWith('corpse') ? text(action).replaceAll('corpse', '') : text(action).replaceAll('pacorpse', '');
function templateName(ctx, name) {
  const binding = ctx.services.templates?.names?.[name];
  if (typeof binding !== 'string' || !binding) throw new Error(`Native corpse requires template binding ${name}.`);
  return binding;
}
async function query(ctx, where) {
  const prefix = ctx.state('sys').tablepre;
  if (typeof prefix !== 'string' || !/^[a-zA-Z0-9_]*$/.test(prefix)) throw new TypeError('Invalid corpse table prefix');
  if (typeof ctx.services.database?.query !== 'function') throw new Error('Native corpse requires database.query().');
  const rows = await ctx.services.database.query(`SELECT * FROM ${prefix}players WHERE ${where}`);
  if (!Array.isArray(rows)) throw new TypeError('Native corpse database.query must return row records');
  return rows;
}

/** All rules in base/corpse/main.php with the original corpse.config.php.
 * Item and corpse mutation crosses the same reference boundaries as PHP.
 * Queries retain the caller-escaped action/pid convention used by the source;
 * the native HTTP input boundary must apply the original filtering first.
 * The template service renders the original bound template and output.take()
 * captures previous hook output. Neither dependency has a dummy fallback.
 */
export const corpseModule = {
  name: 'corpse',
  dependencies: ['sys', 'player', 'logger', 'metman', 'input', 'itemmain'],
  state: () => ({ cannot_pick_notice: '无法拾取', corpse_obbs: 50, corpseprotect: 10, corpseprotect2: 5, no_destroy_news_type: [90] }),
  functions: {
    async check_corpse_discover(ctx, edata) {
      let result = await ctx.next(edata);
      if (n(edata.endtime) > n(ctx.state('sys').now) - n(ctx.state().corpseprotect2)) result = false;
      return result;
    },
    async check_corpse_discover_dice(ctx) {
      if (typeof ctx.services.random?.rand !== 'function') throw new Error('Native corpse requires random.rand().');
      return ctx.services.random.rand(0, 99) < n(ctx.state().corpse_obbs) ? 1 : 0;
    },
    async findcorpse(ctx, edata) {
      const scope = ctx.importInto({ edata }, 'sys', 'player', 'itemmain', 'metman', 'logger', 'corpse');
      scope.sdata.keep_corpse = 1;
      scope.battle_title = '发现尸体';
      for (const [key, value] of Object.entries(edata)) scope[`w_${key}`] = structuredClone(value);
      await ctx.call('metman', 'init_battle', 1);
      scope.main = templateName(ctx, 'MOD_METMAN_MEETMAN');
      appendLog(ctx, `你发现了<span class="red b">${text(scope.w_name)}</span>的尸体！<br>想要从尸体上拾取什么？<br>`);
      const parsed = await ctx.call('itemmain', 'parse_item_words', edata, 1);
      for (const [key, value] of Object.entries(parsed)) scope[`w_${key}`] = structuredClone(value);
      scope.w_can_destroy = await call(ctx, 'check_can_destroy', structuredClone(edata));
      scope.w_can_pick_money = await call(ctx, 'check_can_pick_money', structuredClone(edata));
      scope.default_selection = 'menu';
      if (present(scope.w_can_pick_money) && present(scope.w_money)) scope.default_selection = 'money';
      else if (present(scope.w_can_destroy) && !present(scope.w_money) && n(scope.w_type) === 90) scope.default_selection = 'destroy';
      if (typeof ctx.services.templates?.render !== 'function') throw new Error('Native corpse requires templates.render().');
      if (typeof ctx.services.output?.take !== 'function') throw new Error('Native corpse requires output.take().');
      const html = await ctx.services.templates.render(await call(ctx, 'get_corpse_filename'), scope);
      const buffered = await ctx.services.output.take();
      if (typeof html !== 'string' || typeof buffered !== 'string') throw new TypeError('Native corpse rendering must return HTML text');
      scope.cmd = buffered + html;
    },
    async get_corpse_filename(ctx) { return templateName(ctx, 'MOD_CORPSE_CORPSE'); },
    async meetman(ctx, sid) {
      const edata = await ctx.call('player', 'fetch_playerdata_by_pid', sid);
      if (n(edata.hp) <= 0) {
        ctx.state('player').action = `corpse${text(sid)}`;
        await call(ctx, 'findcorpse', edata);
      } else await ctx.next(sid);
    },
    async prepare_initial_response_content(ctx) {
      const player = ctx.state('player');
      player.cmd = player.main = '';
      const action = text(player.action);
      if ((action.startsWith('corpse') || action.startsWith('pacorpse')) && n(ctx.state('sys').gamestate) < 40) {
        const cid = corpseId(action);
        if (present(cid) && (await query(ctx, `pid='${cid}' AND hp=0`)).length) {
          const edata = await ctx.call('player', 'fetch_playerdata_by_pid', cid);
          // This extract precedes findcorpse in the source and updates exported
          // metman fields even when an overriding findcorpse changes behavior.
          const scope = ctx.importInto({}, 'sys', 'player', 'metman');
          for (const [key, value] of Object.entries(edata)) scope[`w_${key}`] = structuredClone(value);
          await call(ctx, 'findcorpse', edata);
          await ctx.call('metman', 'init_battle', 1);
          player.main = templateName(ctx, 'MOD_METMAN_MEETMAN');
        }
      }
      await ctx.next();
    },
    async getcorpse_action(ctx, edata, item) {
      const player = ctx.state('player');
      if (item === 'wep' || text(item).startsWith('ar') || text(item).startsWith('itm')) {
        const inventory = text(item).startsWith('itm');
        const position = inventory ? text(item).slice(3, 4) : item;
        const keys = inventory ? ['itm', 'itmk', 'itme', 'itms', 'itmsk'].map(key => key + position) : ['', 'k', 'e', 's', 'sk'].map(key => position + key);
        for (let i = 0; i < keys.length; i++) player[['itm0', 'itmk0', 'itme0', 'itms0', 'itmsk0'][i]] = edata[keys[i]] ?? null;
        const replacement = item === 'wep' && ctx.hasModule('weapon')
          ? [ctx.state('weapon').nowep, 'WN', 0, ctx.state('weapon').nosta, ''] : ['', '', 0, 0, ''];
        for (let i = 0; i < keys.length; i++) edata[keys[i]] = replacement[i];
      } else if (item === 'money') {
        if (!present(await call(ctx, 'check_can_pick_money', structuredClone(edata)))) {
          appendLog(ctx, '你不能拾取金钱！'); mode(ctx); return;
        }
        player.money = n(player.money) + n(edata.money);
        appendLog(ctx, `获得了金钱 <span class="yellow b">${text(edata.money)}</span>。<br>`);
        edata.money = 0;
        await ctx.call('player', 'player_save', edata);
        mode(ctx); return;
      } else if (item === 'destroy') {
        if (!present(await call(ctx, 'check_can_destroy', structuredClone(edata)))) {
          appendLog(ctx, '你不能销毁这具尸体！'); mode(ctx); return;
        }
        for (const key of ['weps', 'arbs', 'arhs', 'aras', 'arfs', 'arts', ...Array.from({ length: 7 }, (_, i) => `itms${i}`), 'money']) edata[key] = 0;
        edata.state = 16;
        await ctx.call('player', 'player_save', edata);
        appendLog(ctx, '尸体成功销毁！');
        if (!ctx.state().no_destroy_news_type.some(type => n(type) === n(edata.type))) await call(ctx, 'corpsedestroy_news', player.sdata, edata);
        mode(ctx); return;
      } else { mode(ctx); return; }
      if (!present(player.itms0) || !present(player.itmk0) || player.itmk0 === 'WN' || player.itmk0 === 'DN') {
        appendLog(ctx, '该物品不存在！');
        // Source assigns local $itms, not the exported $itms0. Retain the
        // extracted item slot even though no itemget hook runs.
      } else await ctx.call('itemmain', 'itemget');
      mode(ctx);
    },
    async corpsedestroy_news(ctx, pa, pd) { await ctx.call('sys', 'addnews', 0, 'cdestroy', pa.name, pd.name, '', '', ''); },
    async getcorpse(ctx, item) {
      const player = ctx.state('player'), action = text(player.action), id = corpseId(action);
      if (!present(id) || !action.includes('corpse')) {
        appendLog(ctx, '<span class="yellow b">你没有遇到尸体，或已经离开现场！</span><br>'); mode(ctx); return;
      }
      if (!(await query(ctx, `pid='${id}'`)).length) { appendLog(ctx, '对方不存在！<br>'); mode(ctx); return; }
      const edata = await ctx.call('player', 'fetch_playerdata_by_pid', id);
      if (n(edata.hp) > 0) { appendLog(ctx, '对方尚未死亡！<br>'); mode(ctx); return; }
      if (n(edata.pls) !== n(player.pls)) { appendLog(ctx, '对方跟你不在同一个地图！<br>'); mode(ctx); return; }
      await call(ctx, 'getcorpse_action', edata, item);
      await ctx.call('player', 'player_save', edata);
    },
    async post_act(ctx) {
      await ctx.next();
      const player = ctx.state('player');
      if (!present(player.sdata.keep_corpse) && (text(player.action).startsWith('corpse') || text(player.action).startsWith('pacorpse'))) {
        player.action = '';
        delete player.sdata.keep_corpse;
      }
    },
    async act(ctx) {
      const sys = ctx.state('sys'), player = ctx.state('player'), action = text(player.action);
      if (sys.command === 'enter') player.sdata.keep_corpse = 1;
      if (sys.mode === 'corpse') { await call(ctx, 'getcorpse', sys.command); return; }
      if (action.startsWith('pacorpse') || (sys.command === 'enter' && action.startsWith('corpse'))) {
        const cid = action.replaceAll('pacorpse', '').replaceAll('corpse', '');
        if (present(cid) && (await query(ctx, `pid='${cid}' AND hp=0`)).length) {
          const edata = await ctx.call('player', 'fetch_playerdata_by_pid', cid);
          await call(ctx, 'findcorpse', edata); return;
        }
      }
      await ctx.next();
    },
    async check_can_destroy() { return true; },
    async check_can_pick_money() { return true; },
    async parse_news(ctx, nid, news, hour, min, sec, a, b, c, d, e, exarr = []) {
      // sys import rebinds the time parameters in the source.
      ({ hour, min, sec } = ctx.state('sys'));
      if (news === 'cdestroy') return `<li id="nid${text(nid)}">${text(hour)}时${text(min)}分${text(sec)}秒，<span class="red b">${text(a)}把${text(b)}的尸体销毁了</span></li>`;
      return ctx.next(nid, news, hour, min, sec, a, b, c, d, e, exarr);
    },
  },
};
