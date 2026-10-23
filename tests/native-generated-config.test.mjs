import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { readFile, writeFile, mkdir, mkdtemp, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { definitions } from '../native/generated/catalog.mjs';
import { definitions as remainingDefinitions } from '../native/generated/remaining/catalog.mjs';
import { createGeneratedServices } from '../native/generated/context.mjs';
import { entries, isArray } from '../native/templates/values.mjs';
import { createPhp74Random } from '../native/random.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const canonical = value => isArray(value) ? { array: entries(value).map(([key, child]) => [key, canonical(child)]) } : value;
const initial = {
  clubbase: { clubskillname: {}, clubdesc_h: {}, clubdesc_a: {}, clubinfo: {}, clublist: {} }, bufficons: { bufficons_list: {} },
  wound: { infinfo: [], infname: [], infskillinfo: {} }, wep_j: { wj_allowed_bskill: [] },
  player: { typeinfo: {}, killmsginfo: {}, lwinfo: {} }, addnpc: { anpcinfo: {} }, npc: { npcinfo: {} },
  cardbase: { card_force_different_gtype: [], card_need_charge_gtype: [], card_cooldown_discount_gtype: {} },
  itemmain: { iteminfo: {}, itemspkdesc: {}, itemspkremark: {}, itemspkdesc_help: {}, itemspkinfo: { f: '火焰', u: '灼焰', k: '冰冻', i: '冻气', t: '电击', w: '雷霆' } },
  ex_dmg_att: { ex_attack_list: ['f', 'u', 'k', 'i', 't', 'w'] }, dualwep: { dualwep_allowed_bskill: [] },
  achievement_base: { ach_allow_mode: {} }, skillbase: { valid_skills: {} }, noise: { noiseinfo: {} },
  itemmix: { mix_type: {} }, map: { xyinfo: {}, areainfo: {}, areainterval: {} }, map_display: { map_display_group: {} },
  gameflow_combo: { deathlimit_by_gtype: {} }, pose: { poseinfo: {}, posedesc: {}, poseremark: {} }, tactic: { tacinfo: {}, tacticdesc: {}, tacticremark: {} }, sys: { now: 1509465700 },
};
const php = String.raw`<?php
$___native_input=json_decode(stream_get_contents(STDIN),true);$___native_results=[];$states=$___native_input['states'];
define('IN_GAME',true);define('__MAGIC__','return false;');foreach($states as $___native_module=>$___native_state)define('MOD_'.strtoupper($___native_module),1);
function import_module(...$names){$ret='';foreach($names as $name){foreach($GLOBALS['states'][$name] as $key=>$value)$ret.='$'.$key.'=&$GLOBALS["states"]["'.$name.'"]["'.$key.'"];';}return $ret;}
function canonical($value){if(!is_array($value))return $value;$ret=[];foreach($value as $key=>$child)$ret[]=[$key,canonical($child)];return ['array'=>$ret];}
foreach($___native_input['modules'] as $___native_definition){
 $states=$___native_input['states'];$___native_before=array_keys(get_defined_vars());mt_srand(735);
 foreach($___native_definition['sources'] as $___native_source)include $___native_source;
 $___native_init=$___native_definition['name'].'\\init';$___native_init();
 $___native_after=get_defined_vars();$___native_state=[];
 foreach($___native_after as $___native_key=>$___native_value)if(!in_array($___native_key,$___native_before)&&strpos($___native_key,'___native_')!==0)$___native_state[$___native_key]=$___native_value;
 $___native_results[$___native_definition['name']]=['state'=>canonical($___native_state),'imports'=>canonical($states),'next'=>mt_rand()];
 foreach($___native_state as $___native_key=>$___native_value)unset($$___native_key);
}
echo json_encode($___native_results,JSON_UNESCAPED_UNICODE|JSON_PARTIAL_OUTPUT_ON_ERROR);
`;
async function compareConfiguration(t, definitions, manifestFile) {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') return t.skip('Requires development-only PHP 7.4 oracle');
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true }); const root = await mkdtemp(path.join(parent, 'generated-config-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  const file = path.join(root, 'oracle.php'); await writeFile(file, php);
  const manifest = JSON.parse(await readFile(path.join(project, manifestFile), 'utf8'));
  const modules = manifest.outputs.map(output => ({ name: output.module, sources: output.sources.map(source => path.join(project, 'engine', source.source)) }));
  const result = spawnSync(executable, ['-d', 'display_errors=stderr', '-d', 'error_reporting=22519', file], { input: JSON.stringify({ modules, states: initial }), encoding: 'utf8', windowsHide: true, timeout: 30000, maxBuffer: 20 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr); const expected = JSON.parse(result.stdout);
  for (const definition of definitions) await t.test(definition.name, async () => {
    const states = structuredClone(initial), state = Object.create(null), random = createPhp74Random(735), generated = createGeneratedServices({ random });
    const files = { async exists(value) { try { await stat(path.resolve(project, value)); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; } } };
    const ctx = { services: { generated, random, files }, moduleName: definition.name, functionName: 'init', state: (name = definition.name) => name === definition.name ? state : states[name],
      hasModule: name => name in states,
      call: (module, name, ...args) => { if (module !== definition.name) throw new Error(`Unbound init call ${module}.${name}`); return definition.functions[name]({ ...ctx, functionName: name }, ...args); },
      importInto(scope, ...modules) { for (const module of modules) for (const key of Object.keys(states[module])) Object.defineProperty(scope, key, { configurable: true, enumerable: true, get: () => states[module][key], set: value => { states[module][key] = value; } }); },
    };
    await definition.initialize(ctx);
    assert.deepEqual({ state: canonical(state), imports: canonical(states), next: random.rand() }, expected[definition.name]);
  });
}
test('all 582 skill configurations and init mutations match original PHP source', t => compareConfiguration(t, definitions, 'native/generated/manifest.json'));
test('all remaining generated configurations and init mutations match original PHP source', t => compareConfiguration(t, remainingDefinitions, 'native/generated/remaining/manifest.json'));
