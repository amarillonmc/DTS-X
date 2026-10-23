import { appendLog, number as n, present, text } from './numbers.mjs';

const call = (ctx, name, ...args) => ctx.call('enemy', name, ...args);
function templateName(ctx, constant) {
  const name = ctx.services.templates?.names?.[constant];
  if (typeof name !== 'string' || name === '') throw new Error(`Native enemy requires template binding ${constant}.`);
  return name;
}
// Source by-value arrays retain explicit reference slots. Current-player aliases
// are accessor properties, while fetched ordinary enemy records are copied.
function parameterCopy(data) {
  const copy = structuredClone(data);
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(data))) {
    if (descriptor.get && descriptor.set) Object.defineProperty(copy, key, descriptor);
  }
  return copy;
}
function extractEnemy(scope, edata) {
  for (const [key, value] of Object.entries(edata)) scope[`w_${key}`] = structuredClone(value);
}
async function exists(ctx, id) {
  const prefix = ctx.state('sys').tablepre;
  if (typeof prefix !== 'string' || !/^[a-zA-Z0-9_]*$/.test(prefix)) throw new TypeError('Invalid enemy table prefix');
  if (typeof ctx.services.database?.query !== 'function') throw new Error('Native enemy requires database.query().');
  const rows = await ctx.services.database.query(`SELECT * FROM ${prefix}players WHERE pid='${id}'`);
  if (!Array.isArray(rows)) throw new TypeError('Native enemy database.query must return row records');
  return rows.length !== 0;
}

/** Complete base/enemy rules and original enemy.config.php. The empty
 * battle_wrapper is the source extension point supplied by base/battle.
 * Templates require the real host renderer and buffered output services;
 * absent services fail instead of manufacturing a replacement battle page.
 * SQL preserves the original caller-escaped action/pid input convention.
 */
export const enemyModule = {
  name: 'enemy', dependencies: ['sys', 'player', 'logger', 'metman', 'map', 'corpse', 'input'],
  state: { findenemy_active_words: '对方好像完全没有注意到你！', active_obbs_pc: 50, active_obbs_npc: 55, active_obbs_range: [10, 99] },
  functions: {
    async findenemy(ctx, edata) {
      const scope = ctx.importInto({ edata }, 'sys', 'logger', 'player', 'metman', 'enemy');
      await ctx.call('player', 'update_sdata');
      scope.battle_title = '发现敌人';
      await ctx.call('metman', 'init_battle');
      appendLog(ctx, `你发现了敌人<span class="red b">${text(scope.tdata.name)}</span>！<br>${text(scope.findenemy_active_words)}<br>`);
      if (typeof ctx.services.templates?.render !== 'function') throw new Error('Native enemy requires templates.render().');
      if (typeof ctx.services.output?.take !== 'function') throw new Error('Native enemy requires output.take().');
      const html = await ctx.services.templates.render(await call(ctx, 'get_battlecmd_filename'), scope);
      const buffered = await ctx.services.output.take();
      if (typeof html !== 'string' || typeof buffered !== 'string') throw new TypeError('Native enemy rendering must return HTML text');
      scope.cmd = buffered + html;
      scope.main = templateName(ctx, 'MOD_METMAN_MEETMAN');
    },
    async get_battlecmd_filename(ctx) { return templateName(ctx, 'MOD_ENEMY_BATTLECMD'); },
    async calculate_active_obbs(ctx, ldata, edata) {
      const rate = present(edata.type) ? ctx.state().active_obbs_npc : ctx.state().active_obbs_pc;
      ldata.active_words = text(ldata.active_words).replaceAll('<:BASEVAR:>', text(rate));
      return rate;
    },
    async calculate_active_obbs_multiplier() { return 1.0; },
    async calculate_active_obbs_change(ctx, ldata, edata, rate) { return rate; },
    async get_final_active_obbs(ctx, ldata, edata) {
      ldata.active_words = '<:BASEVAR:>';
      let rate = Math.min(Math.max(n(await call(ctx, 'calculate_active_obbs', ldata, edata)), 1), 150);
      ldata.active_words = `(${text(ldata.active_words)})`;
      rate *= n(await call(ctx, 'calculate_active_obbs_multiplier', ldata, edata));
      rate = await call(ctx, 'calculate_active_obbs_change', ldata, edata, rate);
      return Math.max(n(ctx.state().active_obbs_range[0]), Math.min(n(ctx.state().active_obbs_range[1]), n(rate)));
    },
    async check_enemy_meet_active(ctx, ldata, edata) {
      const rate = await call(ctx, 'get_final_active_obbs', ldata, edata);
      if (typeof ctx.services.random?.rand !== 'function') throw new Error('Native enemy requires request-local random.rand().');
      return ctx.services.random.rand(0, 99) < n(rate);
    },
    async meetman_alternative(ctx, data) {
      const edata = parameterCopy(data);
      const scope = ctx.importInto({ edata }, 'sys', 'player', 'metman', 'logger');
      if (n(edata.hp) > 0) {
        extractEnemy(scope, edata);
        if (present(await call(ctx, 'check_enemy_meet_active', scope.sdata, edata))) {
          scope.action = `enemy${text(edata.pid)}`;
          scope.sdata.keep_enemy = 1;
          await call(ctx, 'findenemy', edata);
        } else await call(ctx, 'battle_wrapper', edata, scope.sdata, 0);
      } else await ctx.next(edata);
    },
    async battle_wrapper() {},
    async post_act(ctx) {
      await ctx.next();
      const player = ctx.state('player');
      if (!present(player.sdata.keep_enemy) && text(player.action).startsWith('enemy')) {
        player.action = '';
        delete player.sdata.keep_enemy;
      }
    },
    async act(ctx) {
      const scope = ctx.importInto({}, 'sys', 'map', 'player', 'logger', 'metman');
      if (scope.command === 'enter') scope.sdata.keep_enemy = 1;
      if (scope.mode === 'combat') {
        if (scope.command === 'back') { appendLog(ctx, '你逃跑了。'); scope.mode = 'command'; return; }
        const id = text(scope.action).replaceAll('enemy', '');
        if (!present(id) || !text(scope.action).includes('enemy')) {
          appendLog(ctx, '<span class="yellow b">你没有遇到敌人，或已经离开战场！</span><br>'); scope.mode = 'command'; return;
        }
        if (!await exists(ctx, id)) { appendLog(ctx, '对方不存在！<br>'); scope.mode = 'command'; return; }
        const edata = await ctx.call('player', 'fetch_playerdata_by_pid', id);
        extractEnemy(scope, edata);
        if (n(edata.pls) !== n(scope.pls)) {
          appendLog(ctx, `<span class="yellow b">${text(edata.name)}</span>已经离开了<span class="yellow b">${text(scope.plsinfo[scope.pls])}</span>。<br>`);
          scope.mode = 'command'; return;
        }
        if (n(edata.hp) <= 0) {
          appendLog(ctx, `<span class="red b">${text(edata.name)}</span>已经死亡，不能被攻击。<br>`);
          if (present(await ctx.call('corpse', 'check_corpse_discover', edata))) {
            scope.action = `corpse${text(edata.pid)}`;
            scope.sdata.keep_enemy = 1;
            await ctx.call('corpse', 'findcorpse', edata);
          }
          return;
        }
        await ctx.call('player', 'update_sdata');
        await call(ctx, 'battle_wrapper', scope.sdata, edata, 1);
        return;
      }
      await ctx.next();
    },
  },
};
