import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { definitions, infoById } from '../native/generated/catalog.mjs';
import { createGeneratedServices } from '../native/generated/context.mjs';
import { createOutput } from '../native/templates/output.mjs';
import { createPhp74Random } from '../native/random.mjs';
import { reference } from '../native/modules/registry.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const byName = new Map(definitions.map(module => [module.name, module]));
const normalize = value => value == null ? null : value instanceof Map ? normalize(Object.fromEntries(value)) : Array.isArray(value) ? value.map(normalize) : typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, child]) => [key, normalize(child)])) : value;
const deref = value => Object.getOwnPropertyDescriptor(value ?? {}, 'value')?.get ? value.value : value;
const phpSource = String.raw`<?php
namespace skillbase {
 function skill_query($id,&$pa=NULL){return \boundary('skill_query',[$id,$pa]);}
 function skill_acquire($id,&$pa=NULL,$cover=0){return \boundary('skill_acquire',[$id,$pa,$cover]);}
 function skill_lost($id,&$pa=NULL){return \boundary('skill_lost',[$id,$pa]);}
 function skill_setvalue($id,$key,$value,&$pa=NULL){return \boundary('skill_setvalue',[$id,$key,$value,$pa]);}
 function skill_getvalue($id,$key,&$pa=NULL){return \boundary('skill_getvalue',[$id,$key,$pa]);}
 function skill_delvalue($id,$key,&$pa=NULL){return \boundary('skill_delvalue',[$id,$key,$pa]);}
}
namespace bufficons {
 function bufficons_check_buff_state($id,&$pa=NULL){return \external('bufficons_check_buff_state',[$id,$pa]);}
 function bufficons_set_timestamp($id,$start,$duration,&$pa=NULL){return \external('bufficons_set_timestamp',[$id,$start,$duration,$pa]);}
}
namespace {
 $input=json_decode(stream_get_contents(STDIN),true);$states=$input['states'];$trace=[];$values=$input['values'];
 define('__MAGIC__','$chprocess=$GLOBALS["next"]; return false;');define('IN_GAME',true);
 function import_module(...$names){$ret='';foreach($names as $name){if(!isset($GLOBALS['states'][$name]))throw new Exception('state '.$name);foreach($GLOBALS['states'][$name] as $key=>$value)$ret.='$'.$key.'=&$GLOBALS["states"]["'.$name.'"]["'.$key.'"];';}return $ret;}
 function &get_var_in_module($key,$name){if(!empty($key)&&isset($GLOBALS['states'][$name][$key]))return $GLOBALS['states'][$name][$key];$null=NULL;return $null;}
 function &get_var_input($key){return get_var_in_module($key,'input');}
 function boundary($name,$args){
  $GLOBALS['trace'][]=[$name,$args];$id=$args[0];
  if($name==='skill_query')return $GLOBALS['input']['enabled'];
  if($name==='skill_setvalue'){$GLOBALS['values'][$id.'_'.$args[1]]=$args[2];return;}
  if($name==='skill_delvalue'){unset($GLOBALS['values'][$id.'_'.$args[1]]);return;}
  if($name==='skill_getvalue')return $GLOBALS['values'][$id.'_'.$args[1]]??NULL;
 }
 function external($name,$args){$GLOBALS['trace'][]=[$name,$args];return $GLOBALS['input']['externals'][$name]??NULL;}
 $next=function(&...$args){$GLOBALS['trace'][]=['next',$args];return $GLOBALS['input']['next'];};
 foreach($input['sources'] as $source)require $source;
 mt_srand($input['seed']);$answers=[];
 foreach($input['calls'] as $call){$name=$input['module'].'\\'.$call['name'];$args=$call['args'];$refs=[];foreach($args as &$arg)$refs[]=&$arg;unset($arg);$ret=call_user_func_array($name,$refs);$answers[]=['result'=>$ret,'args'=>$args];}
 echo json_encode(['answers'=>$answers,'states'=>(object)$states,'trace'=>$trace,'values'=>(object)$values,'next'=>mt_rand()],JSON_UNESCAPED_UNICODE|JSON_PARTIAL_OUTPUT_ON_ERROR);
}
`;
async function compareFixture(t) {
  const php = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires development-only PHP 7.4 oracle'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true }); const root = await mkdtemp(path.join(parent, 'generated-skills-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  const file = path.join(root, 'oracle.php'); await writeFile(file, phpSource);
  const manifest = JSON.parse(await readFile(path.join(project, 'native/generated/manifest.json'), 'utf8'));
  return async data => {
    const input = { states: {}, calls: [], next: 1, values: {}, externals: {}, enabled: true, seed: 735, ...data };
    input.sources = manifest.outputs.find(output => output.module === input.module).sources.map(source => path.join(project, 'engine', source.source));
    const states = structuredClone(input.states), values = structuredClone(input.values), trace = [], answers = [];
    const random = createPhp74Random(input.seed), output = createOutput(), generated = createGeneratedServices({ output, random });
    const services = { generated, output, random };
    const external = (name, args) => { args = args.map(deref); trace.push(normalize([name, args])); return structuredClone(input.externals[name] ?? null); };
    const boundary = (name, args) => {
      args = args.map(deref); if (name === 'skill_query' && args.length === 1) args.push(null);
      if (name === 'skill_acquire' && args.length === 2) args.push(0);
      trace.push(normalize([name, args])); const id = args[0], key = `${id}_${args[1]}`;
      if (name === 'skill_query') return input.enabled;
      if (name === 'skill_setvalue') { values[key] = args[2]; return null; }
      if (name === 'skill_delvalue') { delete values[key]; return null; }
      if (name === 'skill_getvalue') return values[key] ?? null;
      return null;
    };
    const context = (module, functionName) => ({ services, moduleName: module, functionName,
      state: (name = module) => { if (!(name in states)) throw new Error(`missing state ${name}`); return states[name]; },
      hasModule: name => name in states || byName.has(name),
      reference: (module, key) => reference(states[module], key),
      importInto(scope, ...modules) { for (const module of modules) for (const key of Object.keys(states[module])) Object.defineProperty(scope, key, { configurable: true, enumerable: true, get: () => states[module][key], set: value => { states[module][key] = value; } }); },
      async call(target, name, ...args) {
        await Promise.resolve();
        if (target === 'skillbase') return boundary(name, args);
        if (target === 'bufficons') return external(name, args);
        if (target === 'input' && name === 'get_var') return reference(states.input, args[0]);
        const implementation = byName.get(target)?.functions[name]; if (!implementation) throw new Error(`Missing boundary ${target}.${name}`);
        return implementation(context(target, name), ...args);
      },
      async next(...args) { await Promise.resolve(); trace.push(normalize(['next', args.map(deref)])); return structuredClone(input.next); },
    });
    for (const call of input.calls) {
      const args = structuredClone(call.args), result = await byName.get(input.module).functions[call.name](context(input.module, call.name), ...args);
      answers.push(normalize({ result, args }));
    }
    const result = spawnSync(php, ['-d', 'display_errors=stderr', '-d', 'error_reporting=22519', file], { input: JSON.stringify(input), encoding: 'utf8', windowsHide: true, timeout: 10000, maxBuffer: 4 * 1024 * 1024 });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(normalize({ answers, states, trace, values, next: random.rand() }), JSON.parse(result.stdout));
  };
}

test('generated native skill functions retain real source branches, arrays, calls and parameter references', async t => {
  const compare = await compareFixture(t); if (!compare) return;
  for (const enabled of [false, true]) {
    for (const [module, name, next] of [['skill1','get_def_multiplier',[1.2]],['skill2','get_hitrate_multiplier',0.8],['skill1','calculate_rest_uphp',19],['skill1','get_wound_recover_time',100]]) {
      await t.test(`${module}.${name} enabled=${enabled}`, () => compare({ module, enabled, next, calls: [{ name, args: name === 'get_wound_recover_time' ? [] : name.startsWith('calculate_') ? [20] : [{ hp: 70, inf: 'bh' }, { hp: 60, inf: '' }, 1] }] }));
    }
    for (const inf of ['', 'h', 'bh']) await t.test(`skill2 onload inf=${inf} enabled=${enabled}`, () => compare({ module: 'skill2', enabled, calls: [{ name: 'skill_onload_event', args: [{ hp: 70, inf }] }, { name: 'skill_onsave_event', args: [{ hp: 70, inf }] }] }));
    await t.test(`skill493 array references enabled=${enabled}`, () => compare({ module: 'skill493', enabled, calls: [{ name: 'attack_prepare', args: [{ hp: 70 }, { hp: 60 }, 1] }] }));
  }
  await t.test('skill52 acquire/lost preserve string values', () => compare({ module: 'skill52', calls: [{ name: 'acquire52', args: [{ pid: 1 }] }, { name: 'lost52', args: [{ pid: 1 }] }] }));
  for (const count of [0, 2, 7]) for (const now of [150, 500]) await t.test(`skill453 expiry count=${count} now=${now}`, () => compare({ module: 'skill453', states: { skill453: { skill453_buff_lose_time: 120 }, sys: { now } }, values: { '453_cnt': String(count), '453_end_ts': '100' }, calls: [{ name: 'sk453_skill_status_update', args: [3, { pid: 1 }] }] }));
  for (const active of [false, true]) await t.test(`skill453 attack target active=${active}`, () => compare({ module: 'skill453', next: [1.2], states: { skill453: { skill453_buff_lose_time: 120, skill453_factor: 10 }, sys: { now: 500 }, logger: { log: '' } }, values: { '453_cnt': '2', '453_tarpid': '3', '453_end_ts': '100' }, externals: { bufficons_check_buff_state: 2 }, calls: [{ name: 'get_final_dmg_multiplier', args: [{ pid: 1, is_counter: 0 }, { pid: 3, name: '对手' }, active] }] }));
});

test('every emitted skill imports as ordinary JavaScript and preserves original metadata coverage', () => {
  assert.equal(definitions.length, 582); assert.equal(definitions.reduce((sum, module) => sum + Object.keys(module.functions).length, 0), 3713);
  assert.equal(infoById[52], 'club;upgrade;'); assert.equal(infoById[453], 'card;buffer;');
  assert.equal(Object.keys(infoById).length, 573);
});
