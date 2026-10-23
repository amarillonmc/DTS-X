import assert from 'node:assert/strict';
import test from 'node:test';
import * as functions from '../native/accounts/primitives.mjs';
import { createVerificationService, fateNumber } from '../native/accounts/verification.mjs';
import { createAccountsOracle } from './helpers/native-accounts.mjs';

test('account password, validation, timestamp and IPv4 rules match original PHP', { timeout: 120_000 }, async t => {
  const php = await createAccountsOracle(t); if (!php) return;
  const now = 1792728123;
  const vectors = [
    ...['', 'abc', '中文密码', 'a\0b', '<&"'].map(password => ['create_cookiepass', 'createCookiePass', [password]]),
    ...['甲', 'User', '123'].map(username => ['create_storedpass', 'createStoredPass', [username, functions.createCookiePass('secret')]]),
    ...[null, '', '正常名字', 'a'.repeat(15), '😀'.repeat(16), 'line\nname', '\u200d', '小黄', '正反\\斜', '引\'号', '零\0号'].map(name => ['name_check', 'nameCheck', [name], { nameLimit: '[小黄|禁止]' }, [name, '[小黄|禁止]']]),
    ...[[null, null], ['', ''], ['x', 'x'], ['01', '1'], ['0e123', '0e999'], ['x', 'y'], ['中'.repeat(24), '中'.repeat(24)], ['中'.repeat(25), '中'.repeat(25)]].map(args => ['pass_check', 'passCheck', args]),
    ...[false, true].flatMap(old => ['salted', 'legacy', 'wrong'].map(kind => ['pass_compare', 'passCompare', ['甲', 'abc', kind === 'salted' ? functions.createStoredPass('甲', 'abc') : kind === 'legacy' ? 'abc' : 'wrong'], { oldCompatibility: old }, ['甲', 'abc', kind === 'salted' ? functions.createStoredPass('甲', 'abc') : kind === 'legacy' ? 'abc' : 'wrong', old]])),
    ...[-4, -3, 0, 3, 4].map(offset => ['compare_ts_pass', 'compareTimestampPass', [functions.timestampSalt('key', offset, now), 'key'], {}, [functions.timestampSalt('key', offset, now), 'key', now]]),
    ...[0, 61, 86399, 86400 + 3599, 172800 + 31 * 60, -1].flatMap(seconds => [false, true].map(simple => ['convert_tm', 'convertTime', [seconds, simple]])),
  ];
  for (const [source, native, args, config = {}, nativeArgs = args] of vectors) assert.deepEqual(functions[native](...nativeArgs), php({ function: source, args, now, ...config }).result, source + JSON.stringify(args));
  for (const server of [{}, { REMOTE_ADDR: '127.0.0.1' }, { HTTP_X_FORWARDED_FOR: 'unknown, 1.2.3.4, 5.6.7.8' }, { HTTP_CLIENT_IP: 'abc123.456.7.89end' }, { HTTP_CF_CONNECTING_IP: '::1' }, { HTTP_X_FORWARDED_FOR: 'unknown', REMOTE_ADDR: '1.2.3.4' }]) {
    assert.equal(functions.realIp(server), php({ function: 'real_ip', server }).result);
  }
});

test('registration challenge corpus and deterministic questions match the original source', { timeout: 120_000 }, async t => {
  const php = await createAccountsOracle(t); if (!php) return;
  const now = 1792728123, gameUrl = 'https://example.test/', service = await createVerificationService({ gameUrl, clock: () => now });
  assert.deepEqual(service.pool, php({ function: 'register_verification_question_pool_create', now, gameUrl }).result);
  for (const token of [0, '233', '中文种子', '000001', '99999999999999999999', '1968202410158888888888']) {
    assert.equal(service.token(token), php({ function: 'register_fatenum_create', args: [token], now, gameUrl }).result);
    assert.deepEqual(service.question(token), php({ function: 'register_verification_question_get', args: [token], now, gameUrl }).result, String(token));
    assert.equal(service.random(2, 100, token), php({ function: 'register_random_create', args: [2, 100, token], now, gameUrl }).result);
  }
  assert.match(fateNumber('test'), /^\d+$/);
});

test('cookie and administrator boundaries retain source field semantics', () => {
  assert.deepEqual(functions.gameCookie('pass', 'hash', { tablePrefix: 'x_', now: 100, life: 60, serverPort: 443 }),
    { name: 'x_pass', value: 'hash', delete: false, expires: 160, path: '/', domain: '', secure: true, httpOnly: true });
  assert.equal(functions.gameCookie('bra_pass', 'hash').httpOnly, false, 'The original compares the unprefixed argument literally');
  assert.equal(functions.gameCookie('pass', '').delete, true);
  assert.equal(functions.adminPermission({ username: 'owner', groupid: 1 }, 'owner', 'gmlist').allowed, true);
  assert.equal(functions.adminPermission({ username: 'other', groupid: 8 }, 'owner', 'gmlist').code, 'no_power');
});
