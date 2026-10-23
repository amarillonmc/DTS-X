import { GamePageError } from './game-pages.mjs';
import { enterBattlefield } from './enter-battlefield.mjs';
import { n, present, empty, equal, includes, lookup } from '../system/sys-support.mjs';
import { round } from '../gameplay/numbers.mjs';

/** Original command_valid.php. Account profile writes deliberately precede
 * card validation, and energy and rarity cooldowns retain their original
 * separate persistence steps. */
export async function commandValid(host, scope) {
  const { session, users, database, templates } = host;
  session.importInto(scope,'sys','player','map','input');
  const cardCall = (name, ...args) => session.call('cardbase', name, ...args);
  if (!present(scope.cuser) || !present(scope.cpass)) throw new GamePageError('no_login');
  if (n(scope.gamestate) < 20) throw new GamePageError('no_start');
  if (!empty(scope.userdb_remote_storage)) scope.cudata = await users.fetchByUsername(scope.username);
  const user = scope.udata = await host.accounts.authenticate(scope);
  if (!present(user)) return '';
  if (n(user.groupid) < 6 && !equal(scope.cuser, scope.gamefounder)) {
    if (n(scope.gamestate) >= 30) throw new GamePageError('valid_stop');
    if (!empty(scope.gamevars?.seat_info) && !includes(scope.gamevars.seat_info, scope.cuser)) throw new GamePageError('no_prepare');
  }
  if (scope.mode === 'enter') {
    scope.ip = !empty(scope.valid_ip) ? scope.valid_ip : user.ip;
    if (present(scope.iplimit)) {
      const rows = await database.query(`SELECT * FROM ${scope.tablepre}players WHERE type=0 AND ip='${scope.ip}'`);
      if (rows.length >= n(scope.iplimit)) throw new GamePageError('ip_limit');
    }
    if (n(scope.validnum) >= n(scope.validlimit)) throw new GamePageError('player_limit');
    if ((await database.query(`SELECT * FROM ${scope.tablepre}players WHERE name = '${scope.cuser}' AND type = 0`)).length) throw new GamePageError('player_exist');
    if (!['m', 'f'].includes(scope.gender)) scope.gender = 'f';
    scope.updatearr = { gender: scope.gender, icon: scope.icon, motto: scope.motto, killmsg: scope.killmsg, lastword: scope.lastword, ip: scope.ip };
    await users.updateByUsername(scope.updatearr, user.username);
    scope.enterable = true;
    if (session.hasModule('cardbase')) {
      session.importInto(scope, 'cardbase');
      scope.userCardData = await cardCall('get_user_cardinfo', scope.cuser);
      scope.card_ownlist = structuredClone(scope.userCardData.cardlist); scope.card_energy = structuredClone(scope.userCardData.cardenergy);
      scope.card_data_fetched = structuredClone(scope.userCardData.card_data); scope.cardChosen = scope.card; scope.hideDisableButton = 1;
      [scope.cardChosen, scope.card_ownlist, scope.packlist, scope.hideDisableButton] = await cardCall('card_validate_display', scope.cardChosen, scope.card_ownlist, scope.packlist, scope.hideDisableButton);
      if (!await cardCall('check_card_in_ownlist', scope.card, scope.card_ownlist)) {
        scope.enterable = false; scope.card = 0; scope.updatearr = { card: 0 };
        await users.updateByUsername(scope.updatearr, user.username);
      } else {
        scope.cc = scope.card; scope.cardinfo = lookup(scope.cards, scope.cc); scope.r = scope.cardinfo.rare; scope.cf = true; scope.updatearr = {};
        [scope.card_disabledlist, scope.card_error] = await cardCall('card_validate', user);
        if (!empty(lookup(scope.card_disabledlist, scope.cc))) scope.enterable = false;
        else if (present(scope.cardinfo.energy) && includes(scope.card_need_charge_gtype, scope.gametype)) {
          const discount = lookup(scope.card_cooldown_discount_gtype, scope.gametype);
          scope.userCardData.cardenergy[scope.cc] = !empty(discount) ? round(n(scope.cardinfo.energy) * n(discount)) : 0;
          await cardCall('save_cardenergy_to_db', scope.card_ownlist, scope.userCardData.cardenergy, scope.card_data_fetched, user);
          if (!empty(lookup(scope.cardtypecd, scope.r))) {
            scope.cardtype_cd_period = lookup(scope.cardtypecd, scope.r);
            if (!empty(discount)) scope.cardtype_cd_period *= 1 - n(discount);
            if (n(scope.cardinfo.energy) < 100) scope.cardtype_cd_period *= n(scope.cardinfo.energy) / 100;
            scope.cardtype_cd_period = round(scope.cardtype_cd_period);
            scope.updatearr['cd_' + scope.r.toLowerCase()] = n(scope.now) + scope.cardtype_cd_period - n(lookup(scope.cardtypecd, scope.r));
          }
        }
        if (scope.enterable && includes(scope.card_need_charge_gtype, scope.gametype) && !empty(scope.updatearr)) {
          scope.updatearr.card = scope.card; await users.updateByUsername(scope.updatearr, user.username);
        }
      }
    }
    if (!scope.enterable) return 'redirect:valid.php';
    await (host.enterBattlefield ?? ((...args) => enterBattlefield(host, ...args)))(scope.cuser, scope.cpass, scope.gender, scope.icon, scope.cc, scope.ip);
    return 'redirect:game.php';
  }
  if (scope.mode === 'notice') return templates.render('notice', scope);
  Object.assign(scope, user);
  session.importInto(scope, 'cardbase');
  if ((await database.query(`SELECT * FROM ${scope.tablepre}players WHERE name = '${scope.cuser}' AND type = 0`)).length) return 'redirect:game.php';
  if (n(scope.validnum) >= n(scope.validlimit)) throw new GamePageError('player_limit');
  scope.select_icon = scope.icon;
  scope.userCardData = await cardCall('get_user_cardinfo', user.username);
  scope.card_ownlist = structuredClone(scope.userCardData.cardlist); scope.card_energy = structuredClone(scope.userCardData.cardenergy); scope.card_data_fetched = structuredClone(scope.userCardData.card_data);
  scope.cardChosen = scope.userCardData.cardchosen; scope.packlist = await cardCall('pack_filter', scope.packlist); scope.hideDisableButton = 1;
  [scope.cardChosen, scope.card_ownlist, scope.packlist, scope.hideDisableButton] = await cardCall('card_validate_display', scope.cardChosen, scope.card_ownlist, scope.packlist, scope.hideDisableButton);
  [scope.card_disabledlist, scope.card_error] = await cardCall('card_validate', user);
  scope.d_achievements = await session.call('achievement_base', 'decode_achievements', user);
  scope.card_achieved_list = !empty(lookup(scope.d_achievements, 326)) ? lookup(scope.d_achievements, 326) : [];
  scope.showCardUnavailableHint = 1;
  scope.no_select = equal(scope.gametype, 0) || !empty(lookup(scope.card_disabledlist, 0)) ? 1 : 0;
  return templates.render('valid', scope);
}
