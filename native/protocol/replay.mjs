import { createHash } from 'node:crypto';
import { gdecode, gencode } from './codec.mjs';
import { round as roundHalfAway } from '../gameplay/numbers.mjs';

export const REPLAY_PART_SIZE = 200;
export const REPLAY_INDEX_HEADER = "<?php if(!defined('IN_GAME')) exit('Access Denied'); ?>\n";

// Source: include/modules/extra/misc/replay/main.php. These functions implement
// the existing wire format; they do not load or execute the PHP source.
export function replayValidifyRecord(value) {
  if (value === 'e') return ['e'];
  const parts = value.split('.').filter(part => part !== '');
  return parts.every(part => /^[0-9]{1,3}$/.test(part)) ? parts : false;
}

export function replayClicks(value) {
  const records = [];
  for (const record of value.split(',')) {
    if (record === '' || Buffer.byteLength(record) > 200) continue;
    const valid = replayValidifyRecord(record);
    if (valid !== false) records.push(valid);
  }
  return records.slice(-10);
}

export const replayRecordOp = value => gencode(replayClicks(value));

export function getHtmlColor(red, green, blue) {
  return [red, green, blue].map(value => Math.min(255, Math.max(0, roundHalfAway(value))).toString(16).padStart(2, '0')).join('');
}

export function getIdentTextcolor(value) {
  const md5 = createHash('md5').update(value).digest('hex');
  let hash = 0;
  // The original deliberately uses only 31 of the 32 hexadecimal characters.
  for (let index = 0; index < 31; index++) hash = (hash * 16 + Number.parseInt(md5[index], 16)) % 360;
  if (hash < 60) return getHtmlColor(255, hash / 60 * 255, 0);
  if (hash < 120) return getHtmlColor(255 - (hash - 60) / 60 * 255, 255, 0);
  if (hash < 180) return getHtmlColor(0, 255, (hash - 120) / 60 * 255);
  if (hash < 240) return getHtmlColor(0, 255 - (hash - 180) / 60 * 255, 255);
  if (hash < 300) return getHtmlColor((hash - 240) / 60 * 255, 0, 255);
  return getHtmlColor(255, 0, 255 - (hash - 300) / 60 * 255);
}

/** Exact bmp_util/gen_bmp byte layout. In particular, retain its two trailing
 * zero bytes, unpadded pixel rows and file-size field excluding those two bytes.
 * Replacing it with a standard image writer would change existing artifacts. */
export function genBmp(content, width, height) {
  if (![width, height].every(value => Number.isSafeInteger(value) && value >= 0)) throw new RangeError('Bitmap dimensions must be nonnegative integers.');
  const count = width * height;
  if (!Number.isSafeInteger(count) || count * 3 + 56 > 0xffffffff || content.length < count) throw new RangeError('Bitmap dimensions exceed the provided pixels or format size.');
  const bytes = Buffer.alloc(count * 3 + 56);
  Buffer.from([
    0x42, 0x4d, 0, 0, 0, 0, 0, 0,
    0, 0, 54, 0, 0, 0, 40, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 1, 0, 24, 0, 0, 0,
    0, 0, 0xc4, 0x0e, 0, 0, 0xc4, 0x0e,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0,
  ]).copy(bytes);
  bytes.writeUInt32LE(count * 3 + 54, 2);
  bytes.writeUInt32LE(width, 18);
  bytes.writeUInt32LE(height, 22);
  bytes.writeUInt32LE(count * 3 + 2, 34);
  for (let index = 0; index < count; index++) {
    bytes[54 + index * 3] = content[index][2];
    bytes[55 + index * 3] = content[index][1];
    bytes[56 + index * 3] = content[index][0];
  }
  return bytes;
}

export function replayThumbnail(operationTimes, duration, width = 1000) {
  if (!Number.isFinite(duration) || duration <= 0) throw new RangeError('Replay thumbnail requires a positive game duration.');
  if (!Number.isSafeInteger(width) || width <= 0) throw new RangeError('Replay thumbnail width must be a positive integer.');
  const pixelTime = duration / width;
  const strength = pixelTime <= 1.2 ? 0.6 : pixelTime <= 2 ? 0.35 : pixelTime <= 3 ? 0.15 : 0;
  const colorSizes = new Array(width).fill(0);
  let cursor = 0;
  for (let index = 0; index < width; index++) {
    let count = 0;
    while (cursor < operationTimes.length && operationTimes[cursor] <= pixelTime * (index + 1)) { count++; cursor++; }
    const color = 255 * count / (pixelTime / 0.3);
    let render = strength;
    let target = index;
    while (render > 0.1 && target + 1 < width) { target++; colorSizes[target] += render * color; render *= strength; }
    render = strength;
    target = index;
    while (render > 0.1 && target > 0) { target--; colorSizes[target] += render * color; render *= strength; }
    colorSizes[index] += color;
  }
  return genBmp(colorSizes.map(value => { const intensity = roundHalfAway(Math.min(255, value)); return [255, 255 - intensity, 255 - intensity]; }), width, 1);
}

/** Equivalent to the original openfile() line accounting. The PHP protection
 * header counts toward part count and displayed operation count, even though it
 * is not a response; consequently the final part contains an empty response. */
export function parseReplayIndex(contents) {
  const lines = contents.replaceAll('\n', '\n<:game:>').split('<:game:>');
  if (lines.at(-1) === '' || lines.at(-1) === '\r') lines.pop();
  if (lines.length === 0) lines.push('');
  const operations = [];
  for (const line of lines) {
    if (line === '' || !line.includes(',')) continue;
    const [clicks, time, response] = line.split(',');
    operations.push({ clicks: gdecode(clicks), time: roundHalfAway(Number(time) * 10000) / 10000, response });
  }
  return { count: lines.length, operations };
}

export function replayIndexLine({ clicks, requestStart, gameStart, offsetHours = 0, offsetMinutes = 0, response }) {
  if (/[\r\n,]/.test(response)) throw new TypeError('Replay response path contains an index separator.');
  const elapsed = requestStart - gameStart + offsetHours * 3600 + offsetMinutes * 60;
  if (!Number.isFinite(elapsed)) throw new RangeError('Replay elapsed time must be finite.');
  return `${replayRecordOp(clicks)},${elapsed},${response},\n`;
}

export function shouldArchiveReplay({ winmode, gametype, highDamage, validPlayers, ignoredModes = [] }) {
  if (ignoredModes.some(mode => Number(mode) === Number(gametype))) return false;
  return (winmode === 1 && (gametype >= 10 || highDamage > 400))
    || (winmode === 2 && (validPlayers > 1 || highDamage > 400))
    || winmode === 3 || winmode === 5 || winmode === 7
    || (winmode === 8 && (gametype < 10 || highDamage > 400));
}

function replayScript(payload, statements) {
  return `___temp_s = new String('${gencode(payload, { level: 9 })}');\n${statements}\n`;
}

/** Build one player's real replay artifacts from already-persisted command
 * responses. The host supplies history and player rows and owns persistence,
 * locking, eligibility, remote storage and winner ordering. */
export function buildReplayPlayerFiles({ gameNumber, roomPrefix = '', playerId, playerName, duration, dictionary, index, responses, partSize = REPLAY_PART_SIZE }) {
  if (!Number.isSafeInteger(partSize) || partSize <= 0) throw new RangeError('Replay part size must be a positive integer.');
  if (!Number.isSafeInteger(Number(gameNumber)) || Number(gameNumber) < 0 || !Number.isSafeInteger(Number(playerId)) || Number(playerId) <= 0) throw new RangeError('Replay game and player IDs must be positive integer identifiers.');
  const prefix = roomPrefix.startsWith('s') ? 's.' : '';
  const base = `${prefix}${gameNumber}.${playerId}`;
  const parsed = parseReplayIndex(index);
  const partCount = Math.ceil(parsed.count / partSize);
  const operationTimes = parsed.operations.map(operation => operation.time);
  const header = {
    replay_gamenum: `${prefix}${gameNumber}`,
    replay_player: playerName,
    replay_timelen: duration,
    replay_optime: operationTimes,
    replay_datapart: partCount,
  };
  const files = new Map();
  const progress = step => roundHalfAway(100 / (partCount + 2) * step);
  files.set(`${base}.replay.header.js`, Buffer.from(replayScript(header,
    `replay_header = JSON.parse(JXG.decompress(___temp_s));\ndelete ___temp_s;\nreplay_data = new Array();\nreplayload_progressbar(${progress(1)});\njQuery.cachedScript("gamedata/replays/${base}.replay.oprecord.js");`)));
  files.set(`${base}.replay.oprecord.js`, Buffer.from(replayScript(parsed.operations.map(operation => operation.clicks),
    `replay_oprecord = JSON.parse(JXG.decompress(___temp_s));\ndelete ___temp_s;\nreplay_data = new Array();\nreplayload_progressbar(${progress(2)});\njQuery.cachedScript("gamedata/replays/${base}.replay.data.0.js");`)));
  for (let part = 0; part < partCount; part++) {
    const payload = [];
    const end = Math.min(parsed.count, (part + 1) * partSize);
    for (let operation = part * partSize; operation < end; operation++) {
      const response = responses.get(parsed.operations[operation]?.response);
      payload.push(gdecode(response === undefined ? '' : Buffer.isBuffer(response) ? response.toString('utf8') : response));
    }
    const next = part + 1 < partCount ? `jQuery.cachedScript("gamedata/replays/${base}.replay.data.${part + 1}.js");` : 'replay_init();';
    files.set(`${base}.replay.data.${part}.js`, Buffer.from(replayScript(payload,
      `replay_part = JSON.parse(JXG.decompress(___temp_s));\nreplay_data = replay_data.concat(replay_part);\ndelete replay_part;\ndelete ___temp_s;\nreplayload_progressbar(${progress(part + 3)});\n${next}`)));
  }
  // Displayed size measures these generated JavaScript files. Whitespace may
  // differ from the old emitter; every decoded response and transition agrees.
  const size = [...files.values()].reduce((total, data) => total + data.length, 0);
  const sizeText = `${roundHalfAway(size / 1024 * 10) / 10}KB`;
  files.set(`${base}.rep`, Buffer.from(`${Buffer.from(dictionary).toString('base64')},${gameNumber},${Buffer.from(playerName).toString('base64')},${sizeText},${parsed.count},`));
  files.set(`${base}.rep.bmp`, replayThumbnail(operationTimes, duration));
  return { files, header, operationCount: parsed.count };
}
