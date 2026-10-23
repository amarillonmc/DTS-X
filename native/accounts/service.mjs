import snapshots from '../system/sys-config.json' with { type: 'json' };
import { gencode, gdecode } from '../protocol/codec.mjs';
import { present, sameDurability, text, round } from '../gameplay/numbers.mjs';
import { filterInputValue } from '../gameplay/input.mjs';
import { utcParts } from '../system/sys-support.mjs';
import { createCookiePass, createStoredPass, passCompare, passCheck, nameCheck, matchesBan, realIp, gameCookie, adminPermission } from './primitives.mjs';

const resources = snapshots['resources.config.php'];
const clone = value => structuredClone(value);
const errorText = code => resources._ERROR[code] ?? code;
const infoText = code => resources._INFO[code] ?? code;
const integer = value => Math.trunc(Number.parseFloat(value) || 0);
export class AccountError extends Error {
  constructor(code) { super(errorText(code)); this.name = 'AccountError'; this.code = code; }
}
const requireService = (owner, name) => {
  if (typeof owner?.[name] !== 'function') throw new Error(`Account flow requires a real ${name} service`);
  return owner[name].bind(owner);
};

/** Native login/register/user entry flows. input is already gstrfilter-processed
 * by prepareInputRequest; never filter it twice. Returned rows/context stay on
 * the server: HTTP renders the named original template and sends only payload
 * for encoded responses. Password hashes are not public profile data.
 * Authentication scope uses original names {cuser,cpass,cudata,script}; cached
 * cudata is optional. Admin callers additionally set forcedLocal:true.
 */
export function createAccountService({ users, verification, config = {}, clock = () => Date.now() / 1000, cards, achievements, settings } = {}) {
  if (typeof users?.fetchByUsername !== 'function') throw new TypeError('Account service requires native user storage');
  const options = { tablePrefix: 'bra_', cookiePath: '/', cookieDomain: '', oldPasswordCompatibility: false, nameLimit: '', ipLimit: '', founder: '', ...config };
  const makeCookie = (name, value, life, server = {}) => gameCookie(name, value, { tablePrefix: options.tablePrefix, path: options.cookiePath,
    domain: options.cookieDomain, serverPort: server.SERVER_PORT ?? 80, now: clock(), life });
  const authenticate = async ({ cuser, cpass, cudata = null, script = '', forcedLocal = false } = {}) => {
    if (!present(cuser) || !present(cpass)) throw new AccountError('no_login');
    let user = cudata && Object.keys(cudata).length ? clone(cudata) : await users.fetchByUsername(cuser, { forcedLocal });
    if (!user) throw new AccountError('login_check');
    if (!passCompare(user.username, cpass, user.password, options.oldPasswordCompatibility)) {
      let valid = false;
      if (users.hasRemote && ['game', 'chat'].includes(script)) {
        const result = await users.remoteCommand('fetch_udata', 'password', `username=${users.database.escape(user.username)}`);
        const remote = result instanceof Map ? [...result.values()][0] : Object.values(result ?? {})[0];
        if (present(remote?.password) && passCompare(user.username, cpass, remote.password, options.oldPasswordCompatibility)) {
          await users.update({ password: remote.password }, `username=${users.database.escape(user.username)}`, { forcedLocal: true });
          user.password = remote.password; valid = true;
        }
      }
      if (!valid) throw new AccountError('wrong_pw');
    }
    if (Number(user.groupid) <= 0) throw new AccountError('user_ban');
    return user;
  };
  const logout = (server = {}) => ({ cookies: [makeCookie('user', '', 0, server), makeCookie('pass', '', 0, server)], redirect: 'index.php' });
  const login = async (input, { scope = {}, server = {} } = {}) => {
    if (input.mode === 'quit') return logout(server);
    if (input.username == null && !present(scope.cuser)) return { template: 'login_page', data: {}, cookies: [] };
    const nameResult = nameCheck(input.username, options.nameLimit), passResult = passCheck(input.password, input.password);
    if (nameResult !== 'name_ok') throw new AccountError(nameResult);
    if (passResult !== 'pass_ok') throw new AccountError(passResult);
    const ip = realIp(server);
    if (matchesBan(options.ipLimit, ip)) throw new AccountError('ip_banned');
    const cookiePass = createCookiePass(input.password), user = await users.fetchByUsername(input.username);
    if (!user) throw new AccountError('user_not_exists');
    if (Number(user.groupid) <= 0) throw new AccountError('user_ban');
    if (!passCompare(user.username, cookiePass, user.password, options.oldPasswordCompatibility)) throw new AccountError('wrong_pw');
    await users.writeRaw({ ip, lastvisit: Math.floor(clock()) }, input.username);
    return { redirect: 'index.php', cookies: [makeCookie('user', user.username, 86400 * 15, server), makeCookie('pass', cookiePass, 86400 * 15, server), makeCookie('roomid', 0, 0, server)] };
  };
  const question = token => requireService(verification, 'question')(token, clock());
  const freshQuestion = () => { const token = requireService(verification, 'token')(0, clock()); return { token, question: question(token) }; };
  const register = async (input, { scope = {}, server = {} } = {}) => {
    if (scope.cuser != null && scope.cpass != null) throw new AccountError('logged_in');
    if (input.cmd == null) {
      const fresh = freshQuestion();
      return { template: 'register', cookies: [], data: { icon: 0, gender: 'm', select_icon: 0, motto: '', criticalmsg: '', killmsg: '', lastword: '', register_token: fresh.token, vq_question_arr: fresh.question } };
    }
    // Source uses assignment in elseif($cmd='post_register'): every set cmd
    // takes this branch, including values other than the form's default.
    const result = { innerHTML: {}, value: {} }, cookies = [];
    const nameResult = nameCheck(input.username, options.nameLimit), passResult = passCheck(input.npass, input.rnpass);
    const verificationQuestion = question(input.register_token ?? null), answer = input.vq_answer == null ? -1 : integer(input.vq_answer), ip = realIp(server);
    let code;
    if (nameResult !== 'name_ok') code = nameResult;
    else if (passResult !== 'pass_ok') code = passResult;
    else if (matchesBan(options.ipLimit, ip)) code = 'ip_banned';
    else if (!present(input.register_token)) code = 'vq_answer_retry';
    else if (answer !== integer(verificationQuestion.correct_i)) code = 'vq_answer_wrong';
    else if (await users.fetchByUsername(input.username, { fields: 'uid' })) code = 'name_exists';
    if (code) result.innerHTML.info = errorText(code);
    else {
      const cookiePass = createCookiePass(input.npass);
      const data = { username: input.username, password: createStoredPass(input.username, cookiePass), alt_pswd: 1, groupid: 1, ip, credits: 0, gold: 100,
        gender: input.gender ?? null, icon: input.icon ?? null, motto: input.motto ?? null, killmsg: input.killmsg ?? null, lastword: input.lastword ?? null,
        card_data: gencode([{ cardid: 0, cardenergy: 0 }]) };
      try {
        const inserted = await users.insertRaw(data);
        if (!inserted) code = 'db_failure';
      } catch (error) { if (error.code === 'ER_DUP_ENTRY') code = 'name_exists'; else throw error; }
      if (code) result.innerHTML.info = errorText(code);
      else {
        result.innerHTML.info = infoText('reg_success');
        cookies.push(makeCookie('user', input.username, 0, server), makeCookie('pass', cookiePass, 0, server));
        result.innerHTML.postreg = '<input type="button" class="b_button bc_white" value="返回游戏首页" onclick="window.location.href=\'index.php\'">';
      }
    }
    const fresh = freshQuestion(); result.value.register_token = fresh.token; result.innerHTML.vq_question = fresh.question.question;
    fresh.question.answers.forEach((answer, i) => { result.innerHTML[`vq_answer_disp${i}`] = answer; });
    return { data: result, payload: gencode(result), cookies, code: code ?? null };
  };
  const changeProfile = async (input, { scope, server = {} } = {}) => {
    const user = await authenticate(scope), result = { innerHTML: { info: '' }, value: { opass: '', npass: '', rnpass: '' } }, cookies = [], changes = {};
    if (present(input.opass) && present(input.npass) && present(input.rnpass)) {
      const checked = passCheck(input.npass, input.rnpass); let valid = true;
      if (checked !== 'pass_ok') { result.innerHTML.info += errorText(checked); valid = false; }
      if (!passCompare(user.username, createCookiePass(input.opass), user.password, options.oldPasswordCompatibility)) { result.innerHTML.info += errorText('wrong_pw'); valid = false; }
      if (valid) {
        const cookiePass = createCookiePass(input.npass); cookies.push(makeCookie('pass', cookiePass, 0, server));
        changes.password = createStoredPass(user.username, cookiePass); changes.alt_pswd = 1; result.innerHTML.info += infoText('pass_success');
      } else result.innerHTML.info += infoText('pass_failure');
    } else result.innerHTML.info += infoText('pass_failure');
    const owned = await requireService(cards, 'getCardList')(user);
    const card = owned.some(value => sameDurability(value, input.card ?? null)) ? input.card : 0;
    const submitted = { ...input, card };
    const updates = {};
    for (const key of ['gender', 'icon', 'motto', 'killmsg', 'lastword', 'card', 'u_templateid']) if (submitted[key] != null && !sameDurability(submitted[key], user[key])) updates[key] = submitted[key];
    let userSettings = settings?.get ? await settings.get(user) : gdecode(user.u_settings);
    if (userSettings == null || typeof userSettings !== 'object') userSettings = {};
    let changedSettings = false;
    for (const key of ['skip_opening', 'item_auto_merge', 'gscroll_type']) if (input[key] != null && (userSettings[key] == null || !sameDurability(input[key], userSettings[key]))) {
      userSettings[key] = integer(input[key]); changedSettings = true;
    }
    if (changedSettings) updates.u_settings = gencode(userSettings);
    Object.assign(updates, changes);
    if (Object.keys(updates).length) { await users.writeRaw(updates, scope.cuser); result.innerHTML.info += infoText('data_success'); }
    else result.innerHTML.info += infoText('data_failure');
    return { data: result, payload: gencode(result), cookies };
  };
  const userPage = async (input, { scope, server = {} } = {}) => {
    if (input.mode === 'edit') return changeProfile(input,{scope,server});
    const user = await authenticate(scope), cardData = await requireService(cards,'getUserCardInfo')(scope.cuser);
    const context = { ...user, udata: user, select_icon: user.icon, card_ownlist: cardData.cardlist, card_energy: cardData.cardenergy,
      card_data_fetched: cardData.card_data, cardChosen: cardData.cardchosen, card_disabledlist: [], card_error: [],
      packlist: await requireService(cards,'packFilter')(cards.packlist), card_achieved_list: [] };
    if (achievements) { const decoded = await requireService(achievements,'decode')(user); if (present(decoded?.[326])) context.card_achieved_list = decoded[326]; }
    const decoded = gdecode(user.u_settings); if (decoded && typeof decoded === 'object') Object.assign(context,decoded);
    return { template: 'user', context, cookies: [] };
  };
  const profile = async (input, { scope = {} } = {}) => {
    // This entry explicitly calls gstrfilter a second time in upstream.
    const request = filterInputValue(input); let user, current;
    if (!present(request.playerID)) { user = await authenticate(scope); current = true; }
    else {
      const username = new URLSearchParams('value=' + text(request.playerID)).get('value');
      user = await users.fetchByUsername(username); if (!user) throw new AccountError('user_not_exists'); current = username === scope.cuser;
    }
    user.u_achievements = await requireService(achievements,'decode')(user);
    await requireService(achievements,'checkGlobal')(user);
    const refreshed = current && request.action === 'refdaily' ? await requireService(achievements,'refreshDaily')(user) : false;
    const valid = await requireService(achievements,'getValid')(user.u_achievements), card = clone(cards?.cards?.[user.card]);
    if (!card) throw new Error('Profile requires actual card metadata'); card.id = user.card;
    const context = { ...user, udata: user, curuser: current, refdaily_flag: refreshed, u_acharr: valid, select_icon: user.icon,
      winning_rate: Number(user.validgames) ? text(round(Number(user.wingames) / Number(user.validgames) * 100)) + '%' : '0%',
      carr: card, cr: card.rare, rarecolor: cards.rareColors[card.rare], cf: true, sf: true, af: true, bf: true, ff: true };
    const currentTime = clock();
    if (currentTime - Number(user.cd_s) < 86400) { const p = utcParts(Number(user.cd_s) + 86400,true); context.sf = false; context.std = `${p.year}年${p.month}月${p.day}日${p.hour}时${p.min}分`; }
    if (!Number.isFinite(achievements.dailyInterval)) throw new Error('Profile requires actual achievement daily interval');
    if (currentTime - Number(user.cd_a1) < achievements.dailyInterval) {
      const p = utcParts(Number(user.cd_a1) + achievements.dailyInterval,true), c = utcParts(currentTime,true); context.ff = false;
      context.ftd = `${p.day === c.day && p.month === c.month && p.year === c.year ? '今天' : '明天'}${p.hour}时${p.min}分`;
    }
    const cardData = await requireService(cards,'getUserCardInfo')(user); context.user_cards = cardData.cardlist; context.card_energy = cardData.cardenergy;
    context.energy_recover_rate = await requireService(cards,'getEnergyRecoverRate')(cardData.cardlist,user.gold);
    return { template: 'user_profile', context, cookies: [] };
  };
  return Object.freeze({ authenticate, udata_check: authenticate, login, logout, register, changeProfile, userPage, profile,
    async authorizeAdmin(scope, command = null) {
      const user = await authenticate({ ...scope, cudata: null, forcedLocal: true });
      const permission = adminPermission(user, options.founder, command);
      if (!permission.allowed) throw new AccountError(permission.code);
      return { user, group: permission.group };
    },
  });
}
