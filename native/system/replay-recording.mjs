import { randomBytes } from 'node:crypto';
import { number, text, sameDurability } from '../gameplay/numbers.mjs';

export const NATIVE_REPLAY_DICTIONARY = 'native-uncompressed-v1.js';
export const NATIVE_REPLAY_DICTIONARY_SOURCE = '// Native responses retain complete original HTML; dictionary substitution is not used.\n';
const header = "<?php if(!defined('IN_GAME')) exit('Access Denied'); ?>\n";
const get = (value, key) => value instanceof Map ? value.get(key) : value?.[key];
const values = value => value instanceof Map ? [...value.values()] : Object.values(value ?? {});

/** Record the original command.php index and encoded response after the real
 * command action has saved the player. The native capability replaces the old
 * PHP daemon/ADV3 gate; every gameplay exclusion and recorded DOM path still
 * passes through the source replay module. No HTML dictionary is fabricated.
 *
 * Files are private, source-relative paths. A request-owned OS lock covers the
 * initial index header and append together, including concurrent requests from
 * other processes. A failed append preserves its response for recovery rather
 * than creating a dangling successful index entry by removing its data.
 */
export async function recordReplayResponse(host, encodedResponse) {
  const { session, files, request } = host;
  if (host.services?.generated?.capabilities?.replayRecording !== true || !session.hasModule('replay')) return false;
  const input = session.state('input'), sys = session.state('sys'), player = session.state('player');
  if (!['/act.php', '/command.php'].includes(request.pathname) || (input.page != null && input.page !== 'command')) return false;
  if (values(sys.replay_ignore_mode).some(mode => sameDurability(mode, sys.gametype))) return false;
  const data = player.gamedata;
  if (!data || typeof data !== 'object' || get(data, 'url') != null || get(data, 'innerHTML') == null || typeof encodedResponse !== 'string' || !encodedResponse) return false;
  const pid = Number(player.pid), room = Number(sys.room_id ?? 0), prefix = text(sys.room_prefix);
  if (!Number.isSafeInteger(pid) || pid <= 0) return false;
  if (!Number.isSafeInteger(room) || room < 0 || !/^[A-Za-z0-9_]*$/.test(prefix)) throw new TypeError('Invalid native replay room identity');
  const started = Number(request.pageStartTime);
  if (!Number.isFinite(started)) throw new TypeError('Native replay requires request.pageStartTime');
  const locks = host.services.system?.locks;
  if (typeof locks?.acquire !== 'function' || typeof locks?.release !== 'function') throw new Error('Native replay recording requires real OS locks');
  for (const name of ['write', 'readText', 'exists']) if (typeof files?.[name] !== 'function') throw new Error(`Native replay recording requires files.${name}()`);
  const dictionaryKey = 'native-replay/dictionary', dictionaryToken = await locks.acquire(dictionaryKey);
  try {
    const file = 'gamedata/javascript/' + NATIVE_REPLAY_DICTIONARY;
    if (await files.exists(file)) {
      if (await files.readText(file) !== NATIVE_REPLAY_DICTIONARY_SOURCE) throw new Error('Native replay dictionary version has conflicting contents');
    } else await files.write(file, NATIVE_REPLAY_DICTIONARY_SOURCE, 'wb');
    await files.write('gamedata/javascript/datalib.current.txt', NATIVE_REPLAY_DICTIONARY, 'wb');
  } finally { await locks.release(dictionaryKey, dictionaryToken); }
  const elapsed = started - number(sys.starttime) + number(sys.moveut) * 3600 + number(sys.moveutmin) * 60;
  const operations = await session.call('replay', 'replay_record_op', text(input.oprecorder));
  const responseFile = `gamedata/tmp/response/${room}_/native-${randomBytes(12).toString('hex')}`;
  const indexFile = `gamedata/tmp/replay/${prefix}_/${pid}/replay.php`;
  await files.write(responseFile, encodedResponse, 'wb');
  const indexKey = 'native-replay/index/' + prefix + '/' + pid, token = await locks.acquire(indexKey);
  try {
    const existing = await files.exists(indexFile) && await files.readText(indexFile);
    const line = `${text(operations)},${text(elapsed)},${responseFile},\n`;
    await files.write(indexFile, (existing ? '' : header) + line, 'ab');
  } finally { await locks.release(indexKey, token); }
  return { responseFile, indexFile, elapsed };
}
