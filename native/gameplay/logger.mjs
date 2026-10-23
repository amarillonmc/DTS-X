import { number as n, present, text } from './numbers.mjs';

const whitespace = value => value !== undefined && /^[\t\n\r\f\v ]$/.test(value);
const quote = value => value === '"' || value === "'";

/** The logger's strip_tags(strtolower(text), '<br>') boundary. This is an HTML
 * scanner, not an evaluator. Keep allowed tags verbatim (including attributes
 * and slashes), discard comments/declarations and honor quoted delimiters.
 * Behavior checked against PHP-7.4.33 ext/standard/string.c and PHP itself:
 * https://github.com/php/php-src/blob/PHP-7.4.33/ext/standard/string.c
 */
function logText(value) {
  const source = text(value).replace(/[A-Z]/g, character => character.toLowerCase());
  let state = 0, depth = 0, quoting = '', significant = '', brackets = 0, xml = false, tag = '', result = '';
  const allowed = value => {
    let name = '<', started = false;
    for (let i = 1; i < value.length; i++) {
      const c = value[i];
      if (c === '>') break;
      if (whitespace(c)) { if (started) break; continue; }
      started = true;
      if (c !== '/' || (value[i - 1] !== '<' && value[i + 1] !== '>')) name += c;
    }
    return name + '>' === '<br>';
  };
  for (let i = 0; i < source.length; i++) {
    const c = source[i], before = source[i - 1];
    if (state === 0) {
      if (c === '\0') continue;
      if (c === '<' && !quoting && !whitespace(source[i + 1])) { state = 1; significant = '<'; tag += '<'; }
      else if (c === '>' && depth) depth--;
      else if (!quoting || (c !== '<' && c !== '>')) result += c;
    } else if (state === 1) {
      if (c === '\0') continue;
      if (c === '<') {
        if (quoting) continue;
        if (!whitespace(source[i + 1])) { depth++; continue; }
      }
      if (c === '>') {
        if (depth) { depth--; continue; }
        if (quoting) continue;
        significant = '>';
        if (xml && before === '-') continue;
        state = 0; xml = false; tag += '>';
        if (allowed(tag)) result += tag;
        tag = ''; continue;
      }
      if (quote(c)) { if (!quoting || c === quoting) quoting = quoting ? '' : c; }
      else if (c === '!' && before === '<') { state = 3; significant = c; continue; }
      else if (c === '?' && before === '<') { state = 2; brackets = 0; continue; }
      tag += c;
    } else if (state === 2) {
      if ((c === '(' || c === ')') && !quote(significant)) { significant = c; brackets += c === '(' ? 1 : -1; }
      else if (c === '>') {
        if (depth) depth--;
        else if (!quoting && !brackets && significant !== '"' && before === '?') { state = 0; tag = ''; }
      } else if (quote(c) && before !== '\\') {
        significant = significant === c ? '' : significant !== '\\' ? c : significant;
        if (!quoting || c === quoting) quoting = quoting ? '' : c;
      } else if (c === 'l' && i > 4 && source.slice(i - 4, i) === '<?xm') { state = 1; xml = true; }
    } else if (state === 3) {
      if (c === '>') {
        if (depth) depth--;
        else if (!quoting) { state = 0; tag = ''; }
      } else if (quote(c) && before !== '\\' && (!quoting || c === quoting)) quoting = quoting ? '' : c;
      else if (c === '-' && source.slice(i - 2, i) === '!-') state = 4;
      else if (c === 'e' && i > 6 && source.slice(i - 6, i) === 'doctyp') state = 1;
    } else if (c === '>' && !quoting && source.slice(i - 2, i) === '--') { state = 0; tag = ''; }
  }
  return result;
}

function database(ctx, method, ...args) {
  const service = ctx.services.database;
  if (typeof service?.[method] !== 'function') throw new Error(`Native logger requires database.${method}().`);
  return service[method](...args);
}

/** Complete base/logger rules. Database values remain mysqli text values;
 * arrayInsert follows the source's pre-escaped input convention. Consumption
 * deletes the original toid range before continuing the player pre_act hook.
 */
export const loggerModule = {
  name: 'logger', dependencies: ['sys', 'player'], state: { log: null },
  functions: {
    async logsave(ctx, pid, time, log = '', type = 's') {
      await database(ctx, 'arrayInsert', `${ctx.state('sys').tablepre}log`, { toid: pid, type, time, log });
    },
    async pre_act(ctx) {
      const sys = ctx.state('sys'), player = ctx.state('player'), logger = ctx.state();
      const rows = await database(ctx, 'query', `SELECT time,log FROM ${sys.tablepre}log WHERE toid = '${text(player.pid)}' ORDER BY time,lid`);
      if (!Array.isArray(rows)) throw new TypeError('database.query must return row records');
      for (const row of rows) {
        const delta = n(sys.now) - n(row.time), integerDelta = Math.trunc(delta);
        const hours = Math.floor(delta / 3600), minutes = Math.floor((integerDelta % 3600) / 60), seconds = integerDelta % 60 || 0;
        const elapsed = (hours ? `${text(hours)}小时` : '') + (minutes ? `${text(minutes)}分钟` : '') + `${text(seconds)}秒`;
        logger.log = text(logger.log) + `${elapsed}前，${text(row.log)}<br />`;
      }
      await database(ctx, 'execute', `DELETE FROM ${sys.tablepre}log WHERE toid = '${text(player.pid)}'`);
      await ctx.next();
    },
    async log_linenum_counter(ctx, value = '', limit = 48) {
      if (!present(value)) value = ctx.state().log;
      let last = '', width = 0, lines = 0;
      for (const character of logText(value)) {
        last = [...(last + character)].slice(-4).join('');
        if (last === '<br>') { width = 0; lines++; }
        else {
          width += character.codePointAt(0) <= 0x7f ? 1 : 1.8;
          if (width >= n(limit)) { width = 0; lines++; }
        }
      }
      return lines;
    },
  },
};
