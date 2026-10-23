import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { compileTemplate, sourceLanguage } from '../scripts/native-compiler/build-templates.mjs';
import { createTemplateServices, createOutput, preloadNativeTemplates } from '../native/templates/index.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { createPhp74Random } from '../native/random.mjs';
import { names as bindings, loaders } from '../native/templates/catalog.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
test('static template preload shares code, never runs renderers and retries a failed loader', async t => {
  const file = 'templates/default/error.htm', original = loaders[file];
  t.after(() => { loaders[file] = original; });
  let loads = 0, renders = 0;
  loaders[file] = async () => {
    loads++;
    if (loads === 1) throw new Error('loader probe');
    return { default(r, scope) { renders++; r.write(scope.text); scope.calls = (scope.calls ?? 0) + 1; } };
  };
  await assert.rejects(preloadNativeTemplates(), /loader probe/);
  assert.deepEqual(await Promise.all([preloadNativeTemplates(), preloadNativeTemplates()]), [882, 882]);
  assert.equal(loads, 2); assert.equal(renders, 0);
  const first = { text: 'one' }, second = { text: 'two' };
  const one = createTemplateServices(), two = createTemplateServices();
  assert.deepEqual(await Promise.all([one.render('error', first), two.render('error', second)]), ['one', 'two']);
  assert.equal(await one.render('error', first), 'one');
  assert.equal(loads, 2); assert.equal(renders, 3);
  assert.equal(first.calls, 2); assert.equal(second.calls, 1);
});

test('shared template plans keep bindings, enabled selections and request constants isolated', async () => {
  const enabled = ['weapon'];
  const first = createTemplateServices({ enabledModules: enabled, constants: { TEST_REQUEST: 'one' } });
  const second = createTemplateServices({ enabledModules: enabled, constants: { TEST_REQUEST: 'two' } });
  const binding = Object.keys(first.names)[0]; assert.ok(binding);
  first.names[binding] = 'local';
  assert.notEqual(second.names[binding], 'local');
  enabled.length = 0;
  const disabled = createTemplateServices({ enabledModules: enabled });
  assert.equal(Object.hasOwn(disabled.names, binding), false);
  for (const [service, expected] of [[first, 'one'], [second, 'two']]) {
    assert.equal(await service.renderFunction(r => r.write(r.constant('TEST_REQUEST'))), expected);
  }
});
const normalize = value => value == null ? null : value instanceof Map ? Object.fromEntries([...value].map(([key, child]) => [key, normalize(child)])) : Array.isArray(value) ? value.map(normalize) : typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, child]) => [key, normalize(child)])) : value;
const phpSource = String.raw`<?php
namespace fixture {
 function touch(&$pa,$amount){$GLOBALS['trace'][]=['touch',$pa,$amount];$pa['hp']+=$amount;return [$pa['hp'],'完成'];}
 function emit($word){echo '['.$word.']';return strlen($word);}
 function cost($pa){return $pa['hp']+1;}
}
namespace logger {function log_linenum_counter(){return $GLOBALS['input']['lines']??0;}}
namespace weapon {function get_attack_method($pa){return $pa['wepk'];}}
namespace {
 define('IN_GAME',true);define('TEMPLATEID',1);
 $input=json_decode(stream_get_contents(STDIN),true);$trace=[];
 function language($name,$id,$dir){return $GLOBALS['input']['language'];}
 function gexit($message){throw new Exception($message);}
 require $input['compiler'];
 foreach($input['enabled'] as $module)define('MOD_'.strtoupper($module),true);
 foreach($input['constants'] as $name=>$value)if(!defined($name))define($name,$value);
 foreach($input['globals'] as $key=>$value)$GLOBALS[$key]=$value;
 foreach($input['states'] as $module=>$state){$text='';foreach($state as $key=>$value){$global='STATE_'.$module.'_'.$key;$GLOBALS[$global]=$value;$text.='$'.$key.'=&$GLOBALS["'.$global.'"];';}define('IMPORT_MODULE_'.strtoupper($module),$text);}
 function import_module(...$names){$result='';foreach($names as $name)$result.=constant('IMPORT_MODULE_'.strtoupper($name));return $result;}
 function get_var_in_module($name,$module){return $GLOBALS['STATE_'.$module.'_'.$name]??null;}
 function template($name,$id=null){
  if(strpos($name,'MOD_')===0)$name=constant($name);
  $id=$id?:$GLOBALS['input']['theme'];
  if(isset($GLOBALS['input']['templates'][$name]))$source=$GLOBALS['input']['templates'][$name];
  elseif(strpos($name,'/')===false){$source=$GLOBALS['input']['engine'].'/templates/'.($id==1?'default':$id).'/'.$name.'.htm';if(!file_exists($source))$source=$GLOBALS['input']['engine'].'/templates/default/'.$name.'.htm';}
  else {$source=$GLOBALS['input']['engine'].'/'.$name.'.'.$id.'.htm';if(!file_exists($source))$source=$GLOBALS['input']['engine'].'/'.$name.'.htm';}
  if(!file_exists($source))throw new Exception('missing '.$name);
  $compiled=$GLOBALS['input']['root'].'/'.md5($source).'.php';parse_template($source,$compiled,1,'',1);return $compiled;
 }
 function execute($scope){extract($scope);ob_start();include template($GLOBALS['input']['name']);$html=ob_get_clean();$vars=get_defined_vars();unset($vars['html'],$vars['scope']);return [$html,$vars];}
 setlocale(LC_CTYPE,'C');mb_internal_encoding('UTF-8');date_default_timezone_set('UTC');mt_srand($input['seed']??42);
 [$html,$scope]=execute($input['scope']);$result=['html'=>$html,'scope'=>[],'states'=>[],'trace'=>$trace,'next'=>mt_rand()];
 foreach($input['observe'] as $key)$result['scope'][$key]=$scope[$key]??null;
 foreach($input['states'] as $module=>$state){$result['states'][$module]=[];foreach($state as $key=>$value)$result['states'][$module][$key]=$GLOBALS['STATE_'.$module.'_'.$key];}
 $result['scope']=(object)$result['scope'];$result['states']=(object)$result['states'];echo json_encode($result,JSON_UNESCAPED_UNICODE);
}
`;
async function fixture(t) {
  const php = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', timeout: 10000, windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires development-only PHP 7.4 oracle'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'native-templates-render-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  const phpFile = path.join(root, 'oracle.php'); await writeFile(phpFile, phpSource); const language = await sourceLanguage();
  let serial = 0;
  return async data => {
    const input = { theme: 1, scope: {}, globals: {}, constants: {}, enabled: [], states: {}, observe: [], templates: {}, ...data };
    const trace = [], output = createOutput(), random = createPhp74Random(input.seed ?? 42);
    const definitions = Object.entries(input.states).map(([name, state]) => ({ name, state, functions: name === 'fixture' ? {
      async touch(ctx, pa, amount) { await Promise.resolve(); trace.push(['touch', structuredClone(pa), amount]); pa.hp = Number(pa.hp) + Number(amount); return [pa.hp, '完成']; },
      async emit(ctx, word) { await Promise.resolve(); output.write(`[${word}]`); return Buffer.byteLength(word); },
      async cost(ctx, pa) { return Number(pa.hp) + 1; },
    } : name === 'logger' ? { async log_linenum_counter() { return input.lines ?? 0; } } : name === 'weapon' ? { async get_attack_method(ctx, pa) { return pa.wepk; } } : {} }));
    const session = await new ModuleRegistry(definitions).createSession();
    const scope = structuredClone(input.scope), globals = structuredClone(input.globals);
    const templates = createTemplateServices({ session, enabledModules: input.enabled, templateId: input.theme, constants: input.constants, globals, output, random });
    let html;
    if (input.source !== undefined) {
      const file = path.join(root, `custom${serial++}.htm`); await writeFile(file, input.source); input.templates.custom = file; input.name = 'custom';
      const compiled = compileTemplate(input.source, 'custom.htm', { language }); const js = file + '.mjs'; await writeFile(js, compiled.code);
      html = await templates.renderFunction((await import(pathToFileURL(js))).default, scope);
    } else html = await templates.render(input.name, scope);
    for (const [name, binding] of Object.entries(bindings)) if (input.enabled.includes(binding.module)) input.constants[name] = binding.name;
    const run = spawnSync(php, ['-d', 'display_errors=stderr', '-d', 'error_reporting=22519', phpFile], { input: JSON.stringify({ ...input, root, engine: path.join(project, 'engine'), compiler: path.join(project, 'engine/include/template.func.php'), language: path.join(project, 'engine/templates/default/templates.lang.php') }), encoding: 'utf8', timeout: 10000, maxBuffer: 6 * 1024 * 1024, windowsHide: true });
    assert.equal(run.status, 0, run.stderr);
    const expected = JSON.parse(run.stdout), actual = normalize({ html, scope: Object.fromEntries(input.observe.map(key => [key, scope[key]])), states: Object.fromEntries(Object.keys(input.states).map(module => [module, session.state(module)])), trace, next: random.rand() });
    assert.deepEqual(actual, expected);
    return actual;
  };
}

test('generated native templates preserve embedded syntax, async hooks, aliases and output against PHP', async t => {
  const compare = await fixture(t); if (!compare) return;
  const cases = [
    { label: 'nested condition and loop markup', source: '<!--{eval $a=Array(0,"0",1,2);}--><!--{loop $a $i $v}--><!--{if $v}--><b id="$i">$v</b><!--{elseif $i===0}-->zero<!--{else}-->string<!--{/if}--><!--{/loop}-->{LF}<a href="x.php?a=1&b=2">{lang username}</a>', observe: ['i', 'v', 'a'] },
    { label: 'array copy and reference foreach persists last alias', source: '<!--{eval $a=Array(Array(1,2),Array(3,4));$b=$a;foreach($a as &$v) $v[0]+=10;$v[1]=9;}-->{$a[0][0]}:{$b[0][0]}:{$a[1][1]}', observe: ['a', 'b', 'v'] },
    { label: 'list and async reference module call', source: '<!--{eval list($a,$word)=\\fixture\\touch($pa,7);}-->{$a}:{$word}:{$pa[hp]}<!--{eval $length=\\fixture\\emit("中文");}-->{$length}', states: { fixture: { data: 'state' } }, scope: { pa: { hp: '13' } }, observe: ['pa', 'a', 'word', 'length'] },
    { label: 'imports and explicit global bind references', source: '<!--{eval eval(import_module("fixture"));global $external;$x+=3;$external=$x;}-->{$x}:{$external}', states: { fixture: { x: 4 } }, globals: { external: 1 }, observe: ['x', 'external'] },
    { label: 'dynamic variable field and audited old echo lowering', source: "<!--{eval $key='wp';$wp=21;eval('echo $'.$key.';');}-->|<!--{if $$key==21}-->equal<!--{/if}-->|${'w'.$suffix}", scope: { suffix: 'p' }, observe: ['wp', 'key'] },
    { label: 'for loop and seeded shuffle mutation', source: '<!--{eval $a=Array("a","b","c","d");shuffle($a);for($i=0;$i<4;$i++) ${"x".$i}=array_pop($a);}-->{$x0}{$x1}{$x2}{$x3}', observe: ['a', 'i', 'x0', 'x3'] },
    { label: 'loop continue and array append', source: '<!--{eval $a=Array();}--><!--{loop range(0,4) $i}--><!--{eval if($i%2) continue;$a[]=$i;}-->{$i}<!--{/loop}-->', observe: ['a', 'i'] },
    { label: 'native named function dispatch and existence', source: String.raw`<!--{eval $f='\\fixture\\cost';if(function_exists($f)) $x=$f($pa);}-->{$x}`, states: { fixture: { data: 1 } }, scope: { pa: { hp: 4 } }, observe: ['x'] },
    { label: 'casts, ternary, operators and PHP false boundary', source: '<!--{eval $a=(int)"3.8";$b=(float)"2.5";$c=(string)false;$d=(7&3);$e="0"?1:2;$f=(0=="abc");$g=("0"=="abc");$h=1/0;}-->{$a}:{$b}:{$c}:{$d}:{$e}:{$f}:{$g}:{$h}', observe: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] },
    { label: 'string interpolation in embedded double string', source: '<!--{eval $a="甲";$b="<b>$a</b>";}-->{$b}', observe: ['a', 'b'] },
    { label: 'superglobals and GLOBALS refer to the request even in an isolated scope', source: '<!--{eval $a=$GLOBALS["shared"];$_GET["x"]="after";$GLOBALS["shared"]+=2;$b=$_GET["x"];}-->{$a}:{$b}:{$GLOBALS[shared]}', globals: { shared: 3, _GET: { x: 'before' } }, scope: { shared: 80, _GET: { x: 'shadowed' } }, observe: ['a', 'b', 'shared', '_GET'] },
  ];
  for (const scenario of cases) await t.test(scenario.label, () => compare(scenario));
});

test('original classic and theme 2 template HTML and mutations remain identical', async t => {
  const compare = await fixture(t); if (!compare) return;
  for (const theme of [1, 2]) {
    await t.test(`battle result theme ${theme}`, () => compare({ name: 'MOD_BATTLE_BATTLERESULT', theme, enabled: ['battle', 'logger'], states: { logger: { log: 'fixture' } }, scope: { hp: 100, uip: { display: { existing: 1 } } }, observe: ['uip'], lines: 20 }));
    await t.test(`enemy command theme ${theme}`, () => compare({ name: 'MOD_ENEMY_BATTLECMD', theme, enabled: ['enemy', 'weapon'], constants: { MOD_CLUBBASE_NPCSKILLPAGE: 'include/modules/extra/club/clubbase/npcskillpage' }, states: { weapon: { attinfo: { WK: '斩击' } } }, scope: { edata: { type: 0 }, sdata: { wepk: 'WK' }, uip: { display: { existing: 1 } } }, observe: ['attmethod', 'uip'] }));
    for (const forbidden of [0, 1]) for (const upos of [-1, 0]) await t.test(`room slot ${theme} ${forbidden} ${upos}`, () => compare({ name: 'roomslot_s', theme, scope: { upos, i: 0, roomdata: { player: [{ forbidden, name: '', ready: 0 }], roomtype: 0, readystat: 1 }, roomtypelist: [{ 'leader-position': [0], 'show-team-leader': 1 }] } }));
  }
  await t.test('weapon profile variable-variable echo', () => compare({ name: 'MOD_WEAPON_PROFILE_WEPSKILL', enabled: ['weapon'], states: { weapon: { skilltypeinfo: { wp: '殴打', wk: '斩击', wf: '灵击' }, skillinfo: ['wp', 'wk'], wp: 100, wk: '9', wf: 8 } }, observe: ['key', 'value'] }));
});

test('template selection and output capture fail explicitly and isolate concurrent renders', async () => {
  const output = createOutput(), templates = createTemplateServices({ enabledModules: ['battle'], output });
  assert.equal(templates.has('MOD_BATTLE_BATTLERESULT', 2), true); assert.equal(templates.has('MOD_ENEMY_BATTLECMD'), false); assert.equal(templates.has('../secret'), false);
  await assert.rejects(templates.render('MOD_ENEMY_BATTLECMD'), /Undefined native template/);
  await assert.rejects(templates.renderFunction(async r => r.module('missing', 'f')), /initialized module session/);
  await assert.rejects(templates.renderFunction(async r => r.call('missing')), /global function is missing/);
  await assert.rejects(templates.renderFunction(async r => r.call('file_get_contents', '/private')), /files.readText/);
  output.write('earlier');
  const result = await Promise.all(['甲', '乙'].map(word => templates.renderFunction(async r => { await r.write(word); await new Promise(resolve => setTimeout(resolve, 5)); await r.write(word); })));
  assert.deepEqual(result, ['甲甲', '乙乙']); assert.equal(output.take(), 'earlier');
});

test('request scope may be the global binding object without creating self-reference getters', async () => {
  const globals = Object.assign(Object.create(null), { ___MOD_CODE_ADV3: 1 });
  const constants = {}, templates = createTemplateServices({ globals, constants });
  constants.MOD_SKILL52_INFO = 'club;upgrade;';
  const html = await templates.renderFunction(async (r, scope) => {
    r.global(scope, '___MOD_CODE_ADV3'); r.global(scope, 'created');
    r.assign(r.slot(scope, ['created']), r.get(scope, '___MOD_CODE_ADV3') + 1);
    await r.write(r.text(r.get(scope, 'created')) + r.constant('MOD_SKILL52_INFO'));
  }, globals);
  assert.equal(html, '2club;upgrade;'); assert.equal(globals.created, 2); assert.equal(globals.___MOD_CODE_ADV3, 1);
});

test('output captures retain their owner across nested outputs, failures and concurrent awaits', async () => {
  const one = createOutput(), two = createOutput();
  one.write('root-one'); two.write('root-two');
  const captured = await one.capture(async () => {
    one.write('a');
    assert.equal(await two.capture(async () => {
      two.write('b'); one.write('c');
      await new Promise(resolve => setImmediate(resolve));
      assert.equal(await one.capture(async () => { one.write('nested'); two.write('d'); }), 'nested');
      assert.equal(one.peek(), 'ac');
      await assert.rejects(one.capture(async () => { one.write('discarded'); throw new Error('failed capture'); }), /failed capture/);
      one.start(); one.write('cleaned'); assert.equal(one.endClean(), true); assert.equal(one.endClean(), false);
    }), 'bd');
    one.write('e');
  });
  assert.equal(captured, 'ace');
  assert.deepEqual(await Promise.all([one.capture(async () => { one.write('x'); await new Promise(resolve => setImmediate(resolve)); one.write('y'); }), one.capture(() => one.write('z'))]), ['xy', 'z']);
  assert.equal(one.take(), 'root-one'); assert.equal(two.take(), 'root-two');
});

test('missing optional template file content is false while access and service errors remain failures', async () => {
  const calls = [], files = { async readText(name) { calls.push(name); if (name === 'present') return '新闻内容'; throw Object.assign(new Error(name), { code: name === 'missing' ? 'ENOENT' : 'EACCES' }); } };
  const templates = createTemplateServices({ files });
  assert.equal(await templates.renderFunction(async r => { const missing = await r.call('file_get_contents', 'missing'); assert.equal(missing, false); await r.write(r.text(missing)); await r.write(await r.call('file_get_contents', 'present')); }), '新闻内容');
  await assert.rejects(templates.renderFunction(r => r.call('file_get_contents', 'denied')), { code: 'EACCES' });
  assert.deepEqual(calls, ['missing', 'present', 'denied']);
});
