import { createHash, timingSafeEqual } from 'node:crypto';
import { text, sameDurability } from '../gameplay/numbers.mjs';

const digest = (algorithm, value) => createHash(algorithm).update(text(value), 'utf8').digest('hex');
export const createCookiePass = password => digest('md5', password);
export const createStoredPass = (username, cookiePass) => digest('md5', text(username) + text(cookiePass));
const constantEqual = (left, right) => typeof left === 'string' && typeof right === 'string'
  && Buffer.byteLength(left) === Buffer.byteLength(right) && timingSafeEqual(Buffer.from(left), Buffer.from(right));
export function passCompare(username, cookiePass, storedPass, oldPasswordCompatibility = false) {
  return constantEqual(createStoredPass(username, cookiePass), storedPass)
    || ((oldPasswordCompatibility == null || oldPasswordCompatibility === true || oldPasswordCompatibility === 1 || oldPasswordCompatibility === '1') && constantEqual(cookiePass, storedPass));
}

/** Source ban lists are PCRE-delimited expressions. The source snapshot uses
 * paired [ ... ] delimiters around alternation. Reject unsupported modifiers
 * instead of silently interpreting a deployment's ban rule differently. */
export function matchesBan(pattern, value) {
  if (!pattern) return false;
  if (pattern instanceof RegExp) { pattern.lastIndex = 0; return pattern.test(text(value)); }
  if (typeof pattern !== 'string' || pattern.length < 2) throw new TypeError('Invalid ban expression');
  const closing = ({ '[': ']', '{': '}', '(': ')', '<': '>' })[pattern[0]] ?? pattern[0];
  const end = pattern.lastIndexOf(closing);
  if (end < 1) throw new TypeError('Invalid ban expression delimiter');
  const flags = pattern.slice(end + 1);
  if (/[^imsu]/.test(flags)) throw new TypeError('Unsupported ban expression modifier');
  return new RegExp(pattern.slice(1, end), [...new Set(flags + 'u')].join('')).test(text(value));
}

export function nameCheck(username, nameLimit = '') {
  if (username == null || Buffer.byteLength(text(username)) === 0) return 'name_not_set';
  username = text(username);
  if (!username.isWellFormed()) return 'name_invalid';
  if ([...username].length > 15) return 'name_too_long';
  if (/[\s?+'|,<>&;#"]/u.test(username) || /\p{C}/u.test(username)) return 'name_invalid';
  if (matchesBan(nameLimit, username)) return 'name_banned';
  return 'name_ok';
}
export function passCheck(password, repeat) {
  if (password == null || repeat == null || text(password).length === 0 || text(repeat).length === 0) return 'pass_not_set';
  if (!sameDurability(text(password), text(repeat))) return 'pass_not_match';
  // The original short-password rejection is commented out. Preserve that
  // compatibility branch, including its precedence over the length check.
  if (Buffer.byteLength(text(password)) >= 4 && [...text(password)].length > 24) return 'pass_too_long';
  return 'pass_ok';
}

export const timestampSalt = (password, offset = 0, now = Date.now() / 1000) => digest('sha1', String(Math.ceil(now / 60) + Number(offset)) + text(password));
export function compareTimestampPass(received, password, now = Date.now() / 1000) {
  return [0, -1, 1, -2, 2, -3, 3].some(offset => constantEqual(received, timestampSalt(password, offset, now)));
}

/** Original IPv4 extraction. HTTP hosts decide whether proxy headers are
 * trusted before supplying this explicit server record; this function never
 * reads process environment or automatically trusts arbitrary request headers. */
export function realIp(server = {}) {
  let value;
  if (server.HTTP_X_FORWARDED_FOR != null) value = text(server.HTTP_X_FORWARDED_FOR).split(',').map(ip => ip.trim()).find(ip => ip !== 'unknown');
  else value = server.HTTP_CLIENT_IP ?? server.HTTP_CF_CONNECTING_IP ?? server.REMOTE_ADDR ?? '0.0.0.0';
  return text(value).match(/[\d.]{7,15}/)?.[0] ?? '0.0.0.0';
}
export function convertTime(value, simple = false) {
  const integer = Math.trunc(Number(value) || 0), days = Math.floor(integer / 86400);
  let hours = Math.floor((integer % 86400) / 3600);
  const minutes = Math.floor((integer % 3600) / 60);
  if (simple && days > 0 && minutes > 30) hours++;
  return (days > 0 ? `${days}天` : '') + (hours > 0 ? `${hours}小时` : '') + (days <= 0 || !simple ? `${minutes}分钟` : '');
}

export const adminCommands = Object.freeze({ configmng: 7, globalgamemng: 6, gamecfgmng: 6, gmlist: 9, urlist: 8,
  banlistmng: 5, gamecheck: 2, adminlogcheck: 2, pcmng: 5, npcmng: 5, gameinfomng: 5, antiAFKmng: 4, rankclear: 9, roomclose: 5, dbmng: 9 });
export function adminPermission(user, founder, command = null) {
  const group = user?.username === founder ? 10 : Number(user?.groupid ?? 0);
  if (group <= 1) return { allowed: false, code: 'no_admin', group };
  if (command != null && !Object.hasOwn(adminCommands, command)) return { allowed: false, code: 'wrong_adcmd', group };
  return { allowed: command == null || group >= adminCommands[command], code: command != null && group < adminCommands[command] ? 'no_power' : null, group };
}

/** Structured source gsetcookie attributes. The HTTP host serializes this
 * record with its cookie library; values must never enter a hand-built header.
 * SameSite may be added by deployment policy, and is not asserted as upstream.
 */
export function gameCookie(name, value, { tablePrefix = 'bra_', path = '/', domain = '', serverPort = 80, now = Date.now() / 1000, life = 0, prefix = true } = {}) {
  const cookieName = (prefix && !name.startsWith(tablePrefix) ? tablePrefix : '') + name;
  if (!/^[A-Za-z0-9_]+$/.test(cookieName) || /[\r\n\0;]/.test(path + domain)) throw new TypeError('Invalid cookie scope');
  return { name: cookieName, value: text(value), delete: text(value) === '', expires: life ? Math.floor(now + Number(life)) : null,
    path, domain, secure: Number(serverPort) === 443, httpOnly: name === 'pass' };
}
