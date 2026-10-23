import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { filterInputValue, inputModule, prepareInputRequest } from '../native/gameplay/input.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const phpFixture = String.raw`<?php
define('IN_GAME',true);define('GAME_ROOT',__DIR__.'/engine/');
error_reporting(E_ALL & ~E_NOTICE);ini_set('display_errors','stderr');
require GAME_ROOT.'include/global.func.php';require GAME_ROOT.'include/modules/modules.func.php';
$fixtureInput=json_decode(stream_get_contents(STDIN),true);
$magic_quotes_gpc=$fixtureInput['magicQuotes']??false;
$_COOKIE=array_key_exists('cookies',$fixtureInput)?$fixtureInput['cookies']:[];$_POST=array_key_exists('post',$fixtureInput)?$fixtureInput['post']:[];$_REQUEST=array_key_exists('request',$fixtureInput)?$fixtureInput['request']:[];
foreach(($fixtureInput['globals']??[]) as $fixtureKey=>$fixtureValue)$GLOBALS[$fixtureKey]=$fixtureValue;
$___MOD_SRV=false;$___MODULE_codelist='main.php';$___MODULE_templatelist='';
require __DIR__.'/actual-template.php';
$fixtureExports=[];foreach(explode(',',MODULE_INPUT_GLOBALS_VARNAMES) as $fixtureKey)if($fixtureKey!=='')$fixtureExports[$fixtureKey]=get_var_in_module($fixtureKey,'input');
$fixtureScope=(function(){extract($GLOBALS['fixtureInput']['scope']??[]);eval(import_module('input'));return get_defined_vars();})();
$fixtureReferences=[];foreach(($fixtureInput['references']??[]) as $fixtureOperation){$fixtureReference=&\input\get_var($fixtureOperation['key']);$fixtureBefore=$fixtureReference;$fixtureReference=$fixtureOperation['value'];$fixtureReferences[]=[$fixtureBefore,get_var_in_module($fixtureOperation['key'],'input')];unset($fixtureReference);}
$fixtureAfter=[];foreach(explode(',',MODULE_INPUT_GLOBALS_VARNAMES) as $fixtureKey)if($fixtureKey!=='')$fixtureAfter[$fixtureKey]=get_var_in_module($fixtureKey,'input');
$fixtureGlobalAfter=[];foreach(($fixtureInput['globals']??[]) as $fixtureKey=>$fixtureValue)$fixtureGlobalAfter[$fixtureKey]=$GLOBALS[$fixtureKey]??null;
foreach(array_keys($fixtureScope) as $fixtureKey)if(strpos($fixtureKey,'___')===0)unset($fixtureScope[$fixtureKey]);
echo json_encode(['exports'=>$fixtureExports,'after'=>$fixtureAfter,'scope'=>$fixtureScope,'references'=>$fixtureReferences,'cookies'=>$_COOKIE,'post'=>$_POST,'request'=>$_REQUEST,'globals'=>$fixtureGlobalAfter],JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);
`;

async function oracle(t) {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true, timeout: 10_000 });
  if (version.error?.code === 'ENOENT' || version.stdout?.trim() !== '7.4') { t.skip('Development-only PHP 7.4 oracle unavailable; set DTS_REFERENCE_PHP.'); return null; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'native-input-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  for (const source of ['include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', 'include/modules/modules.func.php', 'include/modules/core/input/main.php']) {
    const target = path.join(root, 'engine', source); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', source), target);
  }
  await mkdir(path.join(root, 'engine/include/modulemng'), { recursive: true });
  await copyFile(path.join(project, 'engine/include/modulemng/modulemng.config.sample.php'), path.join(root, 'engine/include/modulemng/modulemng.config.php'));
  const template = (await readFile(path.join(project, 'engine/include/modules/modules.init.template.php'), 'utf8'))
    .replaceAll('_____TEMPLATE_MODULE_NAME_____', 'input').replaceAll('_____TEMPLATE_MODULE_PATH_____', "'include/modules/core/input/'");
  await writeFile(path.join(root, 'actual-template.php'), template);
  const fixture = path.join(root, 'oracle.php'); await writeFile(fixture, phpFixture);
  return input => {
    const result = spawnSync(executable, ['-d', 'display_errors=stderr', fixture], { cwd: root, input: JSON.stringify(input), encoding: 'utf8', windowsHide: true, timeout: 20_000 });
    assert.equal(result.status, 0, result.stderr);
    try { return JSON.parse(result.stdout); } catch { throw new Error(`Invalid input oracle response: ${result.stdout}\n${result.stderr}`); }
  };
}

const canonical = value => value == null || typeof value !== 'object' ? value
  : Object.fromEntries(Object.entries(value).map(([key, item]) => [key, canonical(item)]));

async function runNative(input) {
  const filtered = prepareInputRequest({ ...input, magicQuotesGpc: input.magicQuotes ?? false });
  const session = await new ModuleRegistry([inputModule]).createSession({ services: { input: filtered } });
  const exports = structuredClone(session.state('input')), scope = session.importInto(structuredClone(input.scope ?? {}), 'input'), references = [];
  for (const operation of input.references ?? []) {
    const slot = await session.call('input', 'get_var', operation.key), before = structuredClone(slot.value);
    slot.value = operation.value;
    references.push([before, (await session.call('input', 'get_var', operation.key)).value]);
  }
  return { exports, after: session.state('input'), scope, references, cookies: filtered.cookies, post: filtered.post, request: filtered.request, globals: input.globals ?? {} };
}

test('actual input initialization template confirms null list, precedence, import and reference semantics', async t => {
  const php = await oracle(t); if (!php) return;
  const input = { cookies: { command: 'cookie', cookieOnly: 'C' }, post: { command: 'post' }, request: { command: 'request', none: null },
    scope: { command: '', cookieOnly: null }, references: [{ key: 'command', value: 'changed' }, { key: 'absent', value: 'new' }] };
  const result = php(input);
  assert.equal(result.exports.command, 'request');
  assert.equal(result.exports.INPUT_VAR_LIST, null);
  assert.equal(result.scope.command, ''); assert.equal(result.scope.cookieOnly, 'C');
  assert.deepEqual(result.references, [['request', 'changed'], [null, null]]);
  assert.deepEqual(canonical(await runNative(input)), canonical(result));
});

test('filtered input values and retained original keys agree with the actual PHP initialization', { timeout: 120_000 }, async t => {
  const php = await oracle(t); if (!php) return;
  const cases = [
    {}, { cookies: null, post: null, request: null }, { cookies: { a: 'C', b: 'C' }, post: { a: 'P', c: 'P' }, request: { a: 'R', b: 'R' } },
    ...[null, '', 0, false, 1, true].map(command => ({ request: { command: 'input', other: 'B' }, scope: { command, other: false } })),
    ...[false, true].flatMap(magicQuotes => [
      { magicQuotes, request: { message: "'<a x=\"y\">&amp;</a>\\0\\'\\\"\\\\中文___END", nested: { "a'b": "'x", ab: 'later', 'a\\b': '<b>', ___value: '<raw>', '__name': 'fine' } } },
      { magicQuotes, request: { values: ['one', 0, 3.14, true, false, null, { "x'y": ["A'B", '\\0', '\\\\0', '\\x', '\\'], xy: 'last' }], '9invalid': 'no', 'a-b': 'no', _valid_2: 'yes', 中文: 'no', '': 'no' } },
      { magicQuotes, post: { arr: { ab: 'first', "a'b": '<last>', 'x\\y': { "a'b": 'deep', '<q>': 'x' } } } },
    ]),
    { request: { command: 'original' }, references: [{ key: 'command', value: null }, { key: 'command', value: 'detached' }, { key: 'INPUT_VAR_LIST', value: { command: 'detached' } }] },
    { request: JSON.parse('{"__proto__":{"polluted":"value"},"constructor":"safe value","prototype":"also safe"}') },
  ];
  for (let i = 0; i < cases.length; i++) assert.deepEqual(canonical(await runNative(cases[i])), canonical(php(cases[i])), `case ${i}`);
  assert.equal({}.polluted, undefined);
  t.diagnostic(`${cases.length} source-template request scenarios; changed nested keys retain the source's unfiltered original entry.`);
});

test('input does not mutate request dictionaries, double-filter prepared data or expose host internals', async t => {
  const php = await oracle(t); if (!php) return;
  const raw = { cookies: { user: '<name>' }, request: JSON.parse('{"___PRIVATE_host":"danger","INPUT_VAR_LIST":{"___GAME_ROOMID":"999"},"_COOKIE":{"user":"attacker"},"GLOBALS":{"anything":"bad"},"__proto__":{"safe":"yes"}}') };
  const before = structuredClone(raw), prepared = prepareInputRequest(raw);
  assert.deepEqual(raw, before);
  const session = await new ModuleRegistry([inputModule]).createSession({ services: { input: prepared } });
  const input = session.state('input');
  assert.equal(input.user, '&lt;name&gt;');
  assert.equal(prepared.cookies.user, '&lt;name&gt;');
  assert.equal(input.PRIVATE_host, 'danger', 'The separately sanitized ordinary key follows source filtering');
  assert.equal(input.INPUT_VAR_LIST, null);
  for (const name of ['___PRIVATE_host', '_COOKIE', 'GLOBALS']) assert.equal(Object.hasOwn(input, name), false);
  assert.equal(Object.getPrototypeOf(input), null); assert.equal({}.safe, undefined);
  // Demonstrate and deliberately isolate the original global collision. The
  // native request exports the value in input only, never a process global.
  const collision = { globals: { preexisting: 'host' }, request: { preexisting: 'from input' } };
  const source = php(collision);
  assert.equal(source.globals.preexisting, 'from input');
  assert.equal(Object.hasOwn(source.exports, 'preexisting'), false);
  const native = await runNative(collision);
  assert.equal(native.globals.preexisting, 'host'); assert.equal(native.exports.preexisting, 'from input');
  await assert.rejects(new ModuleRegistry([inputModule]).createSession(), /explicit parsed request/);
  assert.equal(filterInputValue(Buffer.from([0xff])), '');
});
