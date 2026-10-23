import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, writeFile, rm, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import PHP from 'php-parser';
import { PageEmitter } from '../scripts/native-compiler/page-emitter.mjs';
import { createModuleContext, createGeneratedServices } from '../native/generated/context.mjs';
import { renderPage } from '../native/generated/pages.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { createOutput } from '../native/templates/output.mjs';
import { definitions } from '../native/generated/remaining/catalog.mjs';
import * as values from '../native/templates/values.mjs';

const oracle = (source, input) => {
  const run = spawnSync(process.env.DTS_REFERENCE_PHP || 'php', ['-d', 'display_errors=stderr', '-r', source], { input: JSON.stringify(input), encoding: 'utf8', windowsHide: true });
  assert.equal(run.status, 0, run.stderr); return run.stdout;
};
const canonical = value => values.isArray(value) ? { entries: values.entries(value).map(([key, child]) => [key, canonical(child)]) } : value;
async function temporary(t) {
  const parent = path.resolve('var/tests'); await mkdir(parent, { recursive: true }); const root = await mkdtemp(path.join(parent, 'generated-runtime-'));
  t.after(async () => { assert.ok(root.startsWith(parent + path.sep)); await rm(root, { recursive: true, force: true }); }); return root;
}

test('native file bindings preserve original openfile line boundaries and optional file_get_contents failures', async t => {
  const root = await temporary(t), contents = ['', '\r', '\n', '\r\n', '甲\n乙\r\n', '甲\n\r', 'a<:game:>b\n'];
  const names = [];
  for (const [index, content] of contents.entries()) { const name = path.join(root, `${index}.txt`); await writeFile(name, content); names.push(name); }
  const files = { read: name => readFile(name), readText: name => readFile(name, 'utf8') }, generated = createGeneratedServices({ files });
  const r = createModuleContext({ services: { generated } }, 'fixture');
  const expected = JSON.parse(oracle('define("IN_GAME",true);define("GAME_ROOT",getcwd()."/engine/");require GAME_ROOT."include/global.func.php";$rows=[];foreach(json_decode(stream_get_contents(STDIN),true) as $f)$rows[]=openfile($f);echo json_encode($rows);', names));
  assert.deepEqual(await Promise.all(names.map(name => r.call('openfile', name))), expected);
  assert.equal(await r.call('file_get_contents', path.join(root, 'missing')), false);
  await assert.rejects(r.call('openfile', path.join(root, 'missing')), { code: 'ENOENT' });
  const denied = createModuleContext({ services: { generated: createGeneratedServices({ files: { async read() { throw Object.assign(new Error('denied'), { code: 'EACCES' }); } } }) } }, 'fixture');
  await assert.rejects(denied.call('file_get_contents', 'denied'), { code: 'EACCES' });
});

test('page declarations are hoisted and static variables persist per request exactly as PHP', async t => {
  const root = await temporary(t);
  const source = '<?php echo advance(),"|";function advance(){static $count=3;$count+=2;return $count;}echo advance(),"|",advance();';
  const parser = new PHP({ parser: { version: '7.4' } }), code = new PageEmitter('fixture.php').emit(parser.parseCode(source));
  const filename = path.join(root, 'static.mjs'); await writeFile(filename, code); const execute = (await import(pathToFileURL(filename))).default;
  for (let request = 0; request < 2; request++) {
    const output = createOutput(), r = createModuleContext({ services: { generated: createGeneratedServices({ output }) } }, 'page'), functions = new Map();
    r.defineLocal = (name, fn) => functions.set(name, fn); r.pageCall = (name, ...args) => functions.get(name)(...args);
    const actual = await output.capture(() => execute(r, {})); assert.equal(actual, oracle(source.slice(6), null));
  }
});

test('dynamic namespace calls use audited by-reference signatures while value arguments remain values', async t => {
  const root = await temporary(t), source = '<?php $dest="old";$fn="\\\\cooldown\\\\get_move_coldtime";$a=$fn($dest);$other="\\\\empowers\\\\use_nail";$b=$other($dest,7);echo json_encode([$dest,$a,$b]);';
  const parser = new PHP({ parser: { version: '7.4' } }), filename = path.join(root, 'dynamic.mjs');
  await writeFile(filename, new PageEmitter('dynamic.php').emit(parser.parseCode(source))); const execute = (await import(pathToFileURL(filename))).default;
  const output = createOutput(), generated = createGeneratedServices({ output });
  const session = await new ModuleRegistry([
    { name: 'cooldown', functions: { async get_move_coldtime(ctx, dest) { await Promise.resolve(); dest.value = 'new'; return 3; } } },
    { name: 'empowers', functions: { async use_nail(ctx, name, effect) { assert.equal(name, 'new'); return name + effect; } } },
  ]).createSession({ services: { generated } });
  const r = createModuleContext({ services: { generated }, call: (module, name, ...args) => session.call(module, name, ...args) }, 'page');
  const result = await output.capture(() => execute(r, {}));
  const expected = oracle('namespace cooldown {function get_move_coldtime(&$dest){$dest="new";return 3;}}namespace empowers {function use_nail($name,$effect){return $name.$effect;}}namespace {' + source.slice(6) + '}', null);
  assert.equal(result, expected);
});

test('original standalone codec page preserves access checks and real encode/decode response bytes', async () => {
  const session = await new ModuleRegistry([]).createSession();
  const cases = [
    [{ REMOTE_ADDR: '192.0.2.1' }, {}], [{ REMOTE_ADDR: '127.0.0.1' }, {}],
    [{ HTTP_X_FORWARDED_FOR: 'unknown, 127.0.0.1', REMOTE_ADDR: '192.0.2.1' }, { method: 'gencode', trans: '中文/"值"' }],
    [{ HTTP_CLIENT_IP: '127.0.0.1' }, { method: 'gdecode', trans: 'invalid' }],
  ];
  const encoded = oracle('echo base64_encode(gzencode(json_encode(["甲",["x"=>2]])));', null);
  cases.push([{ REMOTE_ADDR: '127.0.0.1' }, { method: 'gdecode', trans: encoded }]);
  for (const [server, get] of cases) {
    const globals = { _SERVER: server, _GET: get }, output = createOutput(), generated = createGeneratedServices({ globals, output });
    const host = { session, scope: globals, services: { generated }, output };
    const actual = await renderPage('gencode_transformer', host);
    const expected = oracle('$a=json_decode(stream_get_contents(STDIN),true);$_SERVER=$a[0];$_GET=$a[1];require "engine/gencode_transformer.php";', [server, get]);
    assert.equal(actual, expected);
  }
});

test('legacy card compatibility checks use actual native business caller frames', async () => {
  const original = definitions.find(module => module.name === 'cardbase');
  const generated = createGeneratedServices({ constants: { GAME_ROOT: '' }, functions: { gexit: message => { throw new Error(message); } } });
  const cardbase = { name: 'cardbase', state: { cards: { 5: { energy: 87 } } }, functions: original.functions };
  const session = await new ModuleRegistry([{ name: 'sys', state: {}, functions: {} }, cardbase]).createSession({ services: { generated } });
  const user = { card_data: '', cardlist: '3_5', cardenergy: '24.5' };
  const actual = await session.call('cardbase', 'get_cardlist_energy_from_udata', user);
  const expected = oracle('define("IN_GAME",true);define("GAME_ROOT",getcwd()."/engine/");define("__MAGIC__","return false;");require GAME_ROOT."include/global.func.php";function import_module(...$names){return "global $"."cards;";}$cards=[5=>["energy"=>87]];require GAME_ROOT."include/modules/extra/card/cardbase/main.php";function canon($v){if(!is_array($v))return $v;$out=[];foreach($v as $k=>$c)$out[]=[$k,canon($c)];return ["entries"=>$out];}$ud=json_decode(stream_get_contents(STDIN),true);echo json_encode(canon(cardbase\\get_cardlist_energy_from_udata($ud)));', user);
  assert.deepEqual(canonical(actual), JSON.parse(expected));
  await assert.rejects(session.call('cardbase', 'get_user_cards_process', user), /trying to use function/);
});
