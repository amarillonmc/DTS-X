import { createStoredPass } from '../accounts/primitives.mjs';
import { n, text, present, equal, empty, lookup } from '../system/sys-support.mjs';

/** include/valid.func.php. Initial random draws, account updates, card effects,
 * post-entry hooks, two player saves and announcements retain source order. */
export async function enterBattlefield({ session, database, users, random }, username, password, gender, icon, card = 0, ip = '') {
  const call = (module, method, ...args) => session.call(module, method, ...args);
  const state = session.state('sys');
  await call('sys', 'load_gameinfo');
  if (!['m', 'f'].includes(gender)) gender = 'm';
  state.validnum = n(state.validnum) + 1; state.alivenum = n(state.alivenum) + 1;
  let player = { name: username, pass: createStoredPass(username, password), gd: gender,
    icon: present(icon) ? icon : await call('player', 'get_icon_num_random', gender), type: 0, endtime: state.now, validtime: state.now, sNo: state.validnum, ip,
    hp: state.hplimit, mhp: state.hplimit, sp: state.splimit, msp: state.splimit, ss: 0, mss: 0 };
  const roll = random.rand(0, 15);
  Object.assign(player, { att: 95 + roll, def: 105 - roll, pls: 0, killnum: 0, npckillnum: 0, lvl: 0, exp: 0, skillpoint: 0, money: 20, rage: 0, pose: 3, tactic: 2,
    club: 0, state: 0, wp: 0, wk: 0, wc: 0, wg: 0, wd: 0, wf: 0, inf: '', teamID: '', teamPass: '' });
  for (const position of ['wep', 'arb', 'arh', 'ara', 'arf', 'art']) Object.assign(player, { [position]: '', [position + 'k']: '', [position + 'sk']: '', [position + 'e']: 0, [position + 's']: 0 });
  // Source's itm0..itm6 loop assigns unused function-local variables, not pdata.
  player.exp += n(await call('map', 'get_area_wavenum')) * 80;
  player = await call('itemmain', 'init_enter_battlefield_items', player);
  const user = !equal(username, state.cuser) ? await users.fetchByUsername(username, { fields: 'groupid,motto,killmsg,lastword,cardlist,card_data' }) : state.cudata;
  if (empty(user)) return;
  Object.assign(player, { motto: user.motto, killmsg: user.killmsg, lastword: user.lastword });
  const group = user.groupid;
  if (equal(username, state.gamefounder) || n(group) >= 5) Object.assign(player, { arf: '权限狗的ID卡', arfk: 'Z', arfe: 1, arfs: 1, arfsk: '' });
  else {
    const special = { '霜火协奏曲': '击败思念的纹章', '时期': '击败鬼畜级思念的纹章', '枪毙的某神': 'TDG地雷的证明', '精灵们的手指舞': 'TDG地雷的证明' };
    if (Object.hasOwn(special, username)) Object.assign(player, { art: special[username], artk: 'A', arte: 1, arts: 1, artsk: 'zZ' });
  }
  const update = {}; let prefix = '', skills, originalCard;
  if (session.hasModule('cardbase')) {
    card = await call('cardbase', 'get_enter_battlefield_card', card);
    if (state.roomvars?.current_game_option?.['special-rule'] === '4000lp') card = 154;
    [player, skills, prefix] = await call('cardbase', 'enter_battlefield_cardproc', player, card);
    if (!empty(player.o_card)) { originalCard = player.o_card; delete player.o_card; delete player.cardchange; }
  }
  delete player.gamevars;
  await database.arrayInsert(`${state.tablepre}players`, player);
  update.lastgame = present(state.room_prefix) ? text(state.room_prefix).slice(0, 1) + text(state.gamenum) : state.gamenum;
  const updateCard = !empty(originalCard) ? originalCard : card;
  // This call is unconditional in the original entry function. Missing the
  // required card engine must fail instead of pretending entry is cardless.
  const [cards] = await call('cardbase', 'get_cardlist_energy_from_udata', user);
  if (!empty(updateCard) && await call('cardbase', 'check_card_in_ownlist', updateCard, cards)) update.card = updateCard;
  await users.updateByUsername(update, username);
  const storedPlayer = await call('player', 'fetch_playerdata', username);
  if (!empty(skills)) storedPlayer.skills = skills;
  if (!empty(originalCard)) storedPlayer.o_card = originalCard;
  await call('player', 'post_enterbattlefield_events', storedPlayer);
  const team = lookup(state.gamevars?.teamID_info, username);
  if (!empty(team)) storedPlayer.teamID = team;
  await call('player', 'player_save', storedPlayer);
  const [displayName, displayId] = await call('sys', 'get_valid_disp_user_info', storedPlayer);
  const type = n(state.gamestate) >= 30 && (n(group) >= 6 || equal(username, state.gamefounder)) ? 'newgm' : 'newpc';
  await call('sys', 'addnews', state.now, type, text(prefix) + ' ' + text(displayName), displayId);
  if (n(state.validnum) >= n(state.validlimit) && equal(state.gamestate, 20)) state.gamestate = 30;
  await call('sys', 'save_gameinfo');
}
