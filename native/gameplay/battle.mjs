import { number as n, text, present, appendLog } from './numbers.mjs';

const call = (ctx, name, ...args) => ctx.call('battle', name, ...args);

function templateName(ctx, constant) {
  const name = ctx.services.templates?.names?.[constant];
  if (typeof name !== 'string' || name === '') throw new Error(`Native battle requires template binding ${constant}.`);
  return name;
}

async function render(ctx, name, scope) {
  if (typeof ctx.services.templates?.render !== 'function') throw new Error('Native battle requires templates.render(name, scope).');
  const html = await ctx.services.templates.render(name, scope);
  if (typeof html !== 'string') throw new TypeError('Native battle template renderer must return HTML text.');
  return html;
}

/** Native port of every function in base/battle/{main,battle,battle_wrapper}.php.
 * Empty functions below are the original extension points; attack and skills
 * supply their behavior through the same named module chains.
 *
 * The renderer is an explicit host service, not a replacement template. It must
 * provide original template names and render(name, scope). output.take() returns
 * and clears earlier buffered output, matching ob_get_contents()/ob_clean().
 * Optional clubbase output needs output.write(html) for its uncaptured include.
 */
export const battleModule = {
  name: 'battle',
  dependencies: ['sys', 'logger', 'player', 'enemy', 'metman', 'corpse'],
  state: () => ({ o_edata: [] }),
  functions: {
    async battlelog_parser(ctx, pa, pd, active, message) {
      const attacker = present(active) ? '你' : text(pa.name);
      const defender = present(active) ? text(pd.name) : '你';
      // Keep replacement order: a player's name can itself contain a marker.
      return text(message).replaceAll('<:pd_name:>', defender).replaceAll('<:pa_name:>', attacker);
    },
    async check_can_counter() { return 1; },
    async attack_wrapper() {},
    async assault_end() {},
    async counter_assault(ctx, pa, pd, active) {
      pa.is_counter = 1;
      await call(ctx, 'attack_wrapper', pa, pd, active);
      delete pa.is_counter;
      if (n(pd.hp) > 0) await call(ctx, 'assault_end', pd, pa, 1 - n(active));
    },
    async player_cannot_counter(ctx, pa, pd, active) {
      const outOfRange = pa.out_of_range !== undefined && pa.out_of_range !== null;
      const reason = outOfRange ? '射程不足，无法反击' : '没能及时反击';
      appendLog(ctx, await call(ctx, 'battlelog_parser', pa, pd, active, `<span class="red b"><:pa_name:>${reason}，逃跑了！</span><br>`));
      pd.battlelog = text(pd.battlelog) + await call(ctx, 'battlelog_parser', pa, pd, 1 - n(active), `<:pa_name:>${reason}，逃跑了。<br>`);
    },
    async cannot_counter(ctx, pa, pd, active) { await call(ctx, 'player_cannot_counter', pa, pd, active); },
    async assault_prepare(ctx, pa, pd, active) { pa.user_commanded = present(active) ? 1 : 0; pd.user_commanded = 0; },
    async counter_assault_wrapper(ctx, pa, pd, active) {
      if (n(pa.hp) > 0 && n(pd.hp) > 0) {
        pa.is_counter = 1;
        if (present(await call(ctx, 'check_can_counter', pa, pd, active))) {
          pa.counter_assaulted = 1;
          await call(ctx, 'counter_assault', pa, pd, active);
        } else {
          pa.counter_assaulted = 0;
          await call(ctx, 'cannot_counter', pa, pd, active);
        }
        delete pa.is_counter;
        delete pa.out_of_range;
      }
    },
    async assault(ctx, pa, pd, active) {
      for (const player of [pa, pd]) {
        player.is_counter = player.physical_dmg_dealt = player.wepimp = player.actual_rapid_time = 0;
        player.battlelog = '';
      }
      await call(ctx, 'attack_wrapper', pa, pd, active);
      await call(ctx, 'counter_assault_wrapper', pd, pa, 1 - n(active));
    },
    async assault_finish(ctx, pa, pd) {
      for (const player of [pa, pd]) for (const key of ['is_counter', 'physical_dmg_dealt', 'wepimp', 'actual_rapid_time']) delete player[key];
    },
    async save_enemy_battlelog(ctx, player) {
      if (!present(player.type)) {
        if (player.battle_msg !== undefined && player.battle_msg !== null) player.battlelog = text(player.battle_msg) + text(player.battlelog);
        if (present(player.battlelog)) await ctx.call('logger', 'logsave', player.pid, ctx.state('sys').now, player.battlelog, 'b');
      }
    },
    async send_battle_msg(ctx, pa, pd) {
      const message = ctx.hasModule('input') ? ctx.state('input').message : null;
      if (present(message)) {
        appendLog(ctx, `<span class="lime b">你向${text(pd.name)}喊道：“${text(message)}”</span><br>`);
        pd.battle_msg = `<span class="lime b">${text(pa.name)}向你喊道：“${text(message)}”</span><br><br>`;
        await ctx.call('sys', 'addchat', 6, `${text(pa.name)}高喊着“${text(message)}”杀向了${text(pd.name)}`);
      }
    },
    async battle_prepare(ctx, pa, pd, active) {
      await call(ctx, 'send_battle_msg', pa, pd, active);
      pa.bid = pd.pid;
      pd.bid = pa.pid;
    },
    async battle_finish() {},
    async battle(ctx, pa, pd, active) {
      await call(ctx, 'assault_prepare', pa, pd, active);
      await call(ctx, 'assault', pa, pd, active);
      await call(ctx, 'assault_finish', pa, pd, active);
    },
    async battle_wrapper(ctx, pa, pd, active) {
      ctx.state().o_edata = structuredClone(present(active) ? pd : pa);
      await call(ctx, 'battle_prepare', pa, pd, active);
      await call(ctx, 'battle', pa, pd, active);
      await call(ctx, 'battle_finish', pa, pd, active);

      if (present(active)) {
        if (n(pd.hp) <= 0 && n(pa.hp) > 0) pa.action = `corpse${text(pd.pid)}`;
        if (n(pa.hp) <= 0 && n(pd.hp) > 0 && text(pd.action) === '' && n(pd.type) === 0) pd.action = `pacorpse${text(pa.pid)}`;
      } else {
        if (n(pd.hp) <= 0 && n(pa.hp) > 0 && text(pa.action) === '' && n(pa.type) === 0) pa.action = `pacorpse${text(pd.pid)}`;
        if (n(pa.hp) <= 0 && n(pd.hp) > 0) pd.action = `corpse${text(pa.pid)}`;
      }

      const enemy = present(active) ? pd : pa;
      // PHP array assignment is by value here; logger hooks can mutate the
      // actual enemy afterward without changing the local corpse/render copy.
      const edata = structuredClone(enemy);
      await ctx.call('player', 'player_save', pa);
      await ctx.call('player', 'player_save', pd);
      await ctx.call('metman', 'metman_load_playerdata', structuredClone(enemy));
      if (n(enemy.type) === 0) await call(ctx, 'save_enemy_battlelog', enemy);
      await ctx.call('player', 'load_playerdata', structuredClone(present(active) ? pa : pd));

      ctx.state('metman').battle_title = '战斗发生';
      ctx.state('player').main = templateName(ctx, 'MOD_METMAN_MEETMAN');
      await ctx.call('metman', 'init_battle', 1);
      const scope = ctx.importInto({ pa, pd, active, edata }, 'sys', 'logger', 'player', 'metman');
      const action = text(ctx.state('player').action);
      if (action.startsWith('corpse') && Number.parseInt(action.slice(6), 10) === n(edata.pid)) {
        await ctx.call('corpse', 'findcorpse', edata);
      } else {
        if (typeof ctx.services.output?.take !== 'function') throw new Error('Native battle rendering requires output.take() to preserve buffered HTML.');
        const html = await render(ctx, await call(ctx, 'get_battleresult_filename'), scope);
        const buffered = await ctx.services.output.take();
        if (typeof buffered !== 'string') throw new TypeError('Native battle output.take() must return HTML text.');
        ctx.state('player').cmd = buffered + html;
      }
      if (ctx.hasModule('clubbase')) {
        if (typeof ctx.services.output?.write !== 'function') throw new Error('Native battle clubbase rendering requires output.write(html).');
        await ctx.services.output.write(await render(ctx, templateName(ctx, 'MOD_CLUBBASE_NPCSKILLPAGE'), scope));
      }
    },
    async get_battleresult_filename(ctx) { return templateName(ctx, 'MOD_BATTLE_BATTLERESULT'); },
  },
};
