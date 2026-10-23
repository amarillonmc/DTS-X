import { isReferenceDescriptor } from '../../templates/values.mjs';
import { number as n, text, present, isNumeric, appendLog } from '../numbers.mjs';
import { call, eq } from './helpers.mjs';
import config from './team-config.json' with { type: 'json' };

// PHP numeric-string comparisons fall back to string comparison if both
// operands overflow to the same infinity. Team names and passwords are text.
const equalText = (left, right) => left === right || (isNumeric(left) && isNumeric(right) && Number.isFinite(Number(left)) && Number.isFinite(Number(right)) && Number(left) === Number(right));
const clone = value => {
  if (value == null) return value;
  const result = structuredClone(value);
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) if (isReferenceDescriptor(descriptor)) Object.defineProperty(result, key, descriptor);
  return result;
};
const fields = ['itm', 'itmk', 'itme', 'itms', 'itmsk'];
const inTeamMode = ctx => ctx.state('sys').teamwin_mode.some(type => eq(type, ctx.state('sys').gametype));
const news = (ctx, kind, a, b, c = '') => ctx.call('sys', 'addnews', ctx.state('sys').now, kind, a, b, c, '', '');
const input = (ctx, key) => ctx.state('input')[key] ?? null;
function nameOf(ctx, constant) { const name = ctx.services.templates?.names?.[constant]; if (typeof name !== 'string' || !name) throw new Error(`Native team requires template binding ${constant}.`); return name; }
async function render(ctx, constant, scope) {
  if (typeof ctx.services.templates?.render !== 'function' || typeof ctx.services.output?.take !== 'function') throw new Error('Native team requires templates.render() and output.take().');
  const html = await ctx.services.templates.render(nameOf(ctx, constant), scope), prefix = await ctx.services.output.take();
  if (typeof html !== 'string' || typeof prefix !== 'string') throw new TypeError('Native team rendering must return HTML text.');
  ctx.state('player').cmd = prefix + html;
}
async function query(ctx, sql) { if (typeof ctx.services.database?.query !== 'function') throw new Error('Native team requires database.query().'); return await ctx.services.database.query(sql); }
function invalidName(ctx, id, password, making) {
  let message;
  if (!present(id) || !present(password)) message = '队伍名和密码不能为空，请重新输入。<br>';
  else if (Buffer.byteLength(text(id)) > 20) message = '队伍名称过长，请重新输入。<br>';
  else if (Buffer.byteLength(text(password)) > 20) message = '队伍密码过长，请重新输入。<br>';
  else if (equalText(id, ctx.state('sys').noitm) || (making && equalText(id, 'all'))) message = `队伍名不能为<span class="red b">${text(id)}</span>，请重新输入。<br>`;
  if (message) { appendLog(ctx, message); ctx.state('sys').mode = 'command'; return true; }
  return false;
}
export const teamModule = {
  name: 'team', dependencies: ['sys', 'map', 'logger', 'player', 'metman', 'enemy', 'input'], optionalDependencies: [], templates: ['findteam', 'team', 'team_command'], state: () => structuredClone(config.values),
  functions: {
    async discover_player_filter_alive(ctx, enemy) { let result = await ctx.next(enemy); const player = ctx.state('player'); if (present(player.teamID) && !present(player.fog) && equalText(player.teamID, enemy.teamID) && inTeamMode(ctx)) result = false; return result; },
    async teammate_checkable(ctx) { return !present(ctx.state('player').fog) && present(await call(ctx, 'team_available')); },
    async team_available(ctx) { return !present(await ctx.call('gameflow_combo', 'is_gamestate_combo')) || inTeamMode(ctx); },
    async meetman_alternative(ctx, enemy) {
      enemy = clone(enemy); const player = ctx.state('player');
      if (n(enemy.hp) > 0 && present(player.teamID) && await call(ctx, 'teammate_checkable') && equalText(player.teamID, enemy.teamID) && !inTeamMode(ctx)) { await call(ctx, 'findteam', enemy); return; }
      await ctx.next(enemy);
    },
    async findteam(ctx, enemy) {
      const player = ctx.state('player'), metman = ctx.state('metman'), locals = { edata: enemy };
      for (const [key, value] of Object.entries(enemy)) { const prefixed = 'w_' + key; if (Object.hasOwn(metman, prefixed)) metman[prefixed] = clone(value); else locals[prefixed] = clone(value); }
      player.action = 'team' + text(enemy.pid); player.sdata.keep_team = 1; metman.battle_title = '发现队友'; await ctx.call('metman', 'init_battle', 1);
      appendLog(ctx, `你发现了队友<span class="yellow b">${text(metman.tdata.name)}</span>！<br>`);
      await render(ctx, 'MOD_TEAM_FINDTEAM', ctx.importInto(locals, 'sys', 'player', 'metman', 'logger')); player.main = nameOf(ctx, 'MOD_METMAN_MEETMAN');
    },
    async senditem_check(ctx, enemy) {
      enemy = clone(enemy); const player = ctx.state('player');
      if (enemy == null || eq(player.pid, enemy.pid)) { appendLog(ctx, '对方不存在！<br>'); return false; }
      if (!eq(enemy.pls, player.pls)) { appendLog(ctx, `<span class="yellow b">${text(enemy.name)}</span>已经离开了<span class="yellow b">${text(ctx.state('map').plsinfo[player.pls])}</span>。<br>`); return false; }
      if (n(enemy.hp) <= 0) { appendLog(ctx, `<span class="yellow b">${text(enemy.name)}</span>已经死亡，不能接受物品。<br>`); return false; }
      return present(await call(ctx, 'senditem_check_teammate', clone(enemy)));
    },
    async senditem_check_teammate(ctx, enemy) {
      const player = ctx.state('player');
      if (!present(player.teamID) || !equalText(enemy.teamID, player.teamID) || !present(await call(ctx, 'team_available'))) { appendLog(ctx, `<span class="yellow b">${text(enemy.name)}</span>并非你的队友，不能接受物品。<br>`); return false; }
      return true;
    },
    async senditem(ctx) {
      const sys = ctx.state('sys'), player = ctx.state('player');
      if (eq(sys.command, 'back')) { sys.mode = 'command'; return; }
      const mate = text(player.action).replaceAll('team', '');
      if (!present(mate) || !text(player.action).includes('team')) { appendLog(ctx, '<span class="yellow b">你没有遇到队友，或已经离开现场！</span><br>'); sys.mode = 'command'; return; }
      const enemy = await ctx.call('player', 'fetch_playerdata_by_pid', mate);
      if (!present(await call(ctx, 'senditem_check', clone(enemy)))) { sys.mode = 'command'; return; }
      const message = input(ctx, 'message');
      if (present(message)) {
        appendLog(ctx, `<span class="lime b">你对${text(enemy.name)}说：“${text(message)}”</span><br>`);
        if (!present(enemy.type)) await ctx.call('logger', 'logsave', enemy.pid, sys.now, `<span class="lime b">${text(player.name)}对你说：“${text(message)}”</span>`, 'c');
      }
      if (text(sys.command).startsWith('item')) {
        const slot = text(sys.command).slice(4); if (!present(player['itms' + slot])) { appendLog(ctx, '此道具不存在！'); sys.mode = 'command'; return; }
        let sent = 0;
        for (let destination = 1; destination <= 6; destination++) if (!present(enemy['itms' + destination])) {
          for (const field of fields) enemy[field + destination] = player[field + slot];
          const name = text(enemy['itm' + destination]); appendLog(ctx, `你将<span class="yellow b">${name}</span>送给了<span class="yellow b">${text(enemy.name)}</span>。<br>`);
          if (!present(enemy.type)) await ctx.call('logger', 'logsave', enemy.pid, sys.now, `<span class="yellow b">${text(player.name)}</span>将<span class="yellow b">${name}</span>送给了你。`, 't');
          await news(ctx, 'senditem', player.name, enemy.name, player['itm' + slot]); await ctx.call('player', 'player_save', clone(enemy));
          for (const field of fields) player[field + slot] = field === 'itme' || field === 'itms' ? 0 : '';
          sent = 1; break;
        }
        sent = await call(ctx, 'senditem_before_log_event', slot, sent, enemy);
        if (!present(sent)) appendLog(ctx, `<span class="yellow b">${text(enemy.name)}</span> 的包裹已经满了，不能赠送物品。<br>`);
      } else if (eq(await call(ctx, 'senditem_extra', clone(player.sdata), clone(enemy)), 0)) appendLog(ctx, '输入参数不正确。<br>');
      sys.mode = 'command';
    },
    async senditem_extra() { return 0; },
    async senditem_before_log_event(ctx, slot, sent) { return sent; },
    async post_act(ctx) { await ctx.next(); const player = ctx.state('player'); if (!present(player.sdata.keep_team) && text(player.action).startsWith('team')) { player.action = ''; delete player.sdata.keep_team; } },
    async act(ctx) {
      const sys = ctx.state('sys');
      if (eq(sys.mode, 'senditem')) { await call(ctx, 'senditem'); return; }
      if (eq(sys.mode, 'command') && eq(sys.command, 'team')) { await call(ctx, eq(input(ctx, 'teamcmd'), 'teamquit') ? 'teamquit' : 'teamcheck'); return; }
      if (eq(sys.mode, 'team') && (eq(sys.command, 'teammake') || eq(sys.command, 'teamjoin'))) { await call(ctx, sys.command, input(ctx, 'nteamID'), input(ctx, 'nteamPass')); return; }
      await ctx.next();
    },
    async check_team_button_exist() { return 1; },
    async parse_news(ctx, nid, kind, hour, minute, second, a, b, c, d, e, extra = []) {
      ({ hour, min: minute, sec: second } = ctx.state('sys')); const prefix = `<li id="nid${text(nid)}">${text(hour)}时${text(minute)}分${text(second)}秒，`;
      if (eq(kind, 'teammake')) return `${prefix}<span class="yellow b">${text(b)}创建了队伍${text(a)}</span></li>`;
      if (eq(kind, 'teamjoin')) return `${prefix}<span class="yellow b">${text(b)}加入了队伍${text(a)}</span></li>`;
      if (eq(kind, 'teamquit')) return `${prefix}<span class="red b">${text(b)}退出了队伍${text(a)}</span></li>`;
      if (eq(kind, 'senditem')) return `${prefix}<span class="lime b">${text(a)}将<span class="yellow b">${text(c)}</span>赠送给了${text(b)}</span></li>`;
      return await ctx.next(nid, kind, hour, minute, second, a, b, c, d, e, extra);
    },
    async teamcheck(ctx) {
      const player = ctx.state('player'), state = ctx.state(), sys = ctx.state('sys'), command = input(ctx, 'teamcmd'); let message;
      if (!present(await call(ctx, 'team_available'))) message = '当前不允许建立或加入队伍。<br>';
      else if (present(player.teamID)) message = `你已经加入了队伍<span class="yellow b">${text(player.teamID)}</span>，请先退出队伍。<br>`;
      else if (eq(command, 'teammake') && n(player.sp) <= n(state.team_sp)) message = `体力不足，不能创建队伍。至少需要<span class="yellow b">${text(state.team_sp)}</span>点体力。<br>`;
      else if (eq(command, 'teamjoin') && n(player.sp) <= n(state.teamj_sp)) message = `体力不足，不能加入队伍。至少需要<span class="yellow b">${text(state.teamj_sp)}</span>点体力。<br>`;
      if (message) { appendLog(ctx, message); sys.mode = 'command'; } else await render(ctx, 'MOD_TEAM_TEAM', ctx.importInto({ teamcmd: command }, 'sys', 'logger', 'player', 'team'));
    },
    async teammake(ctx, id, password) {
      if (invalidName(ctx, id, password, true)) return; const player = ctx.state('player'), state = ctx.state(), sys = ctx.state('sys');
      if (present(player.teamID)) appendLog(ctx, `你已经加入了队伍<span class="yellow b">${text(player.teamID)}</span>，请先退出队伍。<br>`);
      else if (n(player.sp) <= n(state.team_sp)) appendLog(ctx, `体力不足，不能创建队伍。至少需要<span class="yellow b">${text(state.team_sp)}</span>点体力。<br>`);
      else {
        const rows = await query(ctx, `SELECT pid FROM ${sys.tablepre}players WHERE teamID='${text(id)}'`);
        if (rows.length) appendLog(ctx, `队伍<span class="yellow b">${text(id)}</span>已经存在，请更换队伍名。<br>`);
        else { player.teamID = id; player.teamPass = password; player.sp = n(player.sp) - n(state.team_sp); appendLog(ctx, `你创建了队伍<span class="yellow b">${text(player.teamID)}</span>。<br>`); await news(ctx, 'teammake', player.teamID, player.name); }
        sys.mode = 'command';
      }
    },
    async teamjoin(ctx, id, password) {
      if (invalidName(ctx, id, password, false)) return; const player = ctx.state('player'), state = ctx.state(), sys = ctx.state('sys');
      if (present(player.teamID)) appendLog(ctx, `你已经加入了队伍<span class="yellow b">${text(player.teamID)}</span>，请先退出队伍。<br>`);
      else if (n(player.sp) <= n(state.teamj_sp)) appendLog(ctx, `体力不足，不能加入队伍。至少需要<span class="yellow b">${text(state.teamj_sp)}</span>点体力。<br>`);
      else {
        const rows = await query(ctx, `SELECT teamPass FROM ${sys.tablepre}players WHERE teamID='${text(id)}'`);
        if (!rows.length) appendLog(ctx, `队伍<span class="yellow b">${text(id)}</span>不存在，请先创建队伍。<br>`);
        else if (rows.length >= n(state.teamlimit)) appendLog(ctx, `队伍<span class="yellow b">${text(id)}</span>人数已满，请更换队伍。<br>`);
        else if (equalText(password, rows[0].teamPass)) { player.teamID = id; player.teamPass = password; player.sp = n(player.sp) - n(state.teamj_sp); appendLog(ctx, `你加入了队伍<span class="yellow b">${text(player.teamID)}</span>。<br>`); await news(ctx, 'teamjoin', player.teamID, player.name); }
        else appendLog(ctx, `密码错误，不能加入队伍<span class="yellow b">${text(id)}</span>。<br>`);
      }
      sys.mode = 'command';
    },
    async teamquit(ctx) { const player = ctx.state('player'); if (present(player.teamID)) { appendLog(ctx, `你退出了队伍<span class="yellow b">${text(player.teamID)}</span>。<br>`); await news(ctx, 'teamquit', player.teamID, player.name); player.teamID = player.teamPass = ''; } else appendLog(ctx, '你不在队伍中。<br>'); ctx.state('sys').mode = 'command'; },
  },
};
