import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { floatText, present, text } from '../gameplay/numbers.mjs';

export function fateNumber(seed, length = 9) {
  length = Math.min(16, Math.trunc(length));
  if (length < 1) throw new RangeError('Fate number length must be positive');
  const digest = createHash('md5').update(text(seed)).digest('hex');
  const hash = digest.slice(0, length) + digest.slice(-length);
  let value = hash.replace(/[^0-9]/g, '');
  if (!value || value === '0') value = String(Number.parseInt(hash.slice(0, 3), 16));
  if (BigInt(value) < 1997n) value = String(BigInt(value) * 999983n);
  return value;
}
const phpTrim = value => value.replace(/^[\x00\x09\x0a\x0b\x0d ]+|[\x00\x09\x0a\x0b\x0d ]+$/g, '');
const substring = (value, start, count) => [...value].slice(start < 0 ? Math.max(0, [...value].length + start) : start, count < 0 ? [...value].length + count : start + count).join('');

export async function createVerificationService({ gameUrl, clock = () => Date.now() / 1000, helpFile = new URL('../../engine/templates/default/help.htm', import.meta.url), decimalModulo = true } = {}) {
  if (typeof gameUrl !== 'string') throw new TypeError('An explicit gameUrl is required for registration questions');
  const pool = ['作为一款以文本为主要表现形式的webgame', '虽然ACFUN大逃杀即将迎来她的第10个年头',
    '但玩过它、或者涉猎过同类游戏的人依然十分稀少', '也许你已经是BR原版的老玩家了', '也许你虽然没怎么玩过BR大逃杀',
    '但是对类似的网页游戏有所涉猎', '当然更可能的情况是你以前并没有接触过这款网页游戏'];
  let html = '';
  try { html = await readFile(helpFile); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  // Source regex has no /u modifier: its 30..150 limit is in UTF-8 bytes.
  const matches = [...Buffer.from(html).toString('latin1').matchAll(/>([^<>&$;{}]{30,150}?)</gs)].map(match => Buffer.from(match[1], 'latin1').toString('utf8'));
  // PHP array union retains the seven seed entries rather than concatenating.
  for (let i = pool.length; i < matches.length; i++) pool[i] = matches[i];
  for (let i = 0; i < pool.length; i++) {
    let value = phpTrim(pool[i]);
    for (const punctuation of ['，', '。', '“', '”', '）', '（']) {
      if (value.startsWith(punctuation)) value = [...value].slice(1).join('');
      const byteIndex = Buffer.from(value).indexOf(Buffer.from(punctuation));
      if ([...value].length - 1 === byteIndex) value = [...value].slice(0, -1).join('');
    }
    pool[i] = value;
  }
  const tokenAt = (token, now) => {
    if (!present(token)) token = text(now) + gameUrl;
    const date = new Date(now * 1000);
    return fateNumber(text(token) + date.getUTCDate() + (date.getUTCMonth() + 1) + date.getUTCFullYear() + date.getUTCDay() + gameUrl, 10);
  };
  const randomAt = (minimum, maximum, token, now) => {
    maximum = Math.min(Number(maximum), 2147483647); minimum = Number(minimum);
    if (minimum >= maximum) minimum = maximum - 1;
    const fate = tokenAt(token, now), range = maximum - minimum + 1;
    return (decimalModulo ? Number(BigInt(fate) % BigInt(range)) : Math.trunc(Number(fate) % range)) + Math.trunc(minimum);
  };
  function questionAt(token, now) {
    let current = tokenAt(token, now);
    const length = randomAt(3, 5, current, now), count = randomAt(5, 7, Math.trunc(Number(current) % 114514), now);
    const which = randomAt(0, pool.length - 1, current, now); current = tokenAt(current, now);
    const original = phpTrim(pool[which]);
    const start = randomAt(2, [...original].length - 1 - length, current, now); current = tokenAt(current, now);
    const correct = substring(original, start, length), question = substring(original, 0, start) + '▁▁▁▁' + substring(original, start + length, [...original].length - start - length);
    const answers = [];
    for (let i = 0; i < count; i++) {
      let attempts = 0, wrong;
      do {
        const other = randomAt(0, pool.length - 1, current, now); current = tokenAt(current, now);
        const fragment = phpTrim(pool[other]);
        const offset = randomAt(0, [...fragment].length - 1 - length, current, now); current = tokenAt(current, now);
        wrong = substring(fragment, offset, length); attempts++;
        // Source += converts the decimal string to an integer (or double only
        // outside signed 64-bit). This seed is at most twenty decimal digits.
        const sum = BigInt(current) + BigInt(attempts);
        current = sum <= 9223372036854775807n ? sum.toString() : floatText(Number(current) + attempts);
        if (attempts > 1000) break;
      } while (wrong === correct || answers.includes(wrong));
      answers[i] = wrong;
    }
    const correctIndex = randomAt(0, count - 1, current, now); answers[correctIndex] = correct;
    return { question, answers, correct_i: correctIndex };
  }
  return Object.freeze({ pool: Object.freeze(pool), token: (token = 0, now = clock()) => tokenAt(token, now),
    random: (min, max, token = 0, now = clock()) => randomAt(min, max, token, now),
    question: (token = '233', now = clock()) => questionAt(token, now) });
}
