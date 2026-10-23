import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { attackModule } from '../native/gameplay/attack.mjs';
import { battleModule } from '../native/gameplay/battle.mjs';
import { itemModule } from '../native/gameplay/items.mjs';
import { weaponModule } from '../native/gameplay/weapon.mjs';
import { dualWeaponModule, weaponKindModules } from '../native/gameplay/weapon-kinds.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { createPhp74Random } from '../native/random.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const upstreamOrder = (await readFile(path.join(project, 'engine/gamedata/modules.list.php'), 'utf8'))
  .split(/\r?\n/).filter(Boolean).map(line => line.split(',')[0]);
const realModules = [itemModule, battleModule, attackModule, weaponModule, ...weaponKindModules, dualWeaponModule];
const sources = [
  'include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php',
  'include/modules/modules.func.php',
  ...['main.php', 'itemuse.php', 'itemcmd.php', 'config/itemmain.config.php'].map(file => `include/modules/base/itemmain/${file}`),
  ...['main.php', 'battle.php', 'battle_wrapper.php'].map(file => `include/modules/base/battle/${file}`),
  ...['attack.php', 'attack_wrapper.php', 'attack_news.php'].map(file => `include/modules/base/attack/${file}`),
  'include/modules/base/weapon/weapon/main.php', 'include/modules/base/weapon/weapon/config/weapon.config.php',
  ...weaponKindModules.map(module => `include/modules/base/weapon/${module.name}/main.php`),
  'include/modules/base/weapon/dualwep/main.php', 'include/modules/base/weapon/dualwep/config/dualwep.config.php',
];

// These named dependencies are explicit boundaries, not production modules.
// No fixture replaces itemmain, battle, attack, weapon, weapon kinds or dualwep.
// Storage, experience and noise remain explicit boundaries. Item destruction
// is observed by a forwarding hook which executes the real itemmain function.
function dependencies(effects) {
  return [
    ...['input', 'map'].map(name => ({ name })),
    // Keep the source dependency edges among these observed boundaries, so
    // adding real itemmain cannot accidentally reorder their registration.
    { name: 'metman', dependencies: ['itemmain'] },
    { name: 'corpse', dependencies: ['metman', 'itemmain'] },
    { name: 'enemy', dependencies: ['metman', 'corpse'] },
    { name: 'logger', state: () => ({ log: '' }) },
    { name: 'sys', state: () => ({ now: 123456, nowep: '拳头', hdamage: 0, hplayer: '', command: '' }), functions: {
      save_combatinfo(ctx) { effects.push(['combatinfo', ctx.state().hdamage, ctx.state().hplayer]); },
      addnews(ctx, ...args) { effects.push(['news', ...args]); },
    } },
    { name: 'player', state: () => ({ equip_list: [], battle_equip_list: [], sdata: [], wepk: '' }), functions: {
      kill(ctx, a, d) { effects.push(['kill', a.pid, d.pid, d.state]); return '再见'; },
      player_save(ctx, player) { effects.push(['save', structuredClone(player)]); },
      load_playerdata(ctx, player) {
        effects.push(['load', structuredClone(player)]);
        ctx.state().sdata = structuredClone(player);
        // The real player module reconstructs DB fields, dropping temporary
        // wep_kind. Keep that boundary effect so dualwep must restore it.
        delete ctx.state().sdata.wep_kind;
      },
      parse_news() { throw new Error('Player news rendering is outside this combat-chain boundary'); },
    } },
    { name: 'lvlctl', functions: {
      getexp(ctx, amount, player) { effects.push(['exp', amount, player.pid]); player.exp += amount; },
    } },
    { name: 'noise', state: () => ({ noiseinfo: {} }), functions: {
      addnoise(ctx, ...args) { effects.push(['noise', ...args]); },
    } },
  ];
}

function registry(effects) {
  const definitions = [...dependencies(effects), ...realModules]
    .sort((left, right) => upstreamOrder.indexOf(left.name) - upstreamOrder.indexOf(right.name));
  definitions.push({ name: 'itemobserver', dependencies: realModules.map(module => module.name), functions: {
    async item_destroy_core(ctx, slot, player) { effects.push(['destroy', slot, player.pid]); await ctx.next(slot, player); },
  } });
  return new ModuleRegistry(definitions);
}

function player(id, weapon, overrides = {}) {
  return {
    pid: id, name: id === 1 ? '进攻者' : '防守者', type: 0, pls: 3,
    hp: 10000, mhp: 10000, sp: 100, msp: 100, att: 370, def: 193, lvl: id === 1 ? 8 : 32, exp: 0,
    wep: `测试${weapon}`, wepk: weapon, wepe: 51, weps: 10, wepsk: '',
    wp: 75, wk: 50, wg: 20, wc: 45, wd: 30, wf: 80, bskill: 0,
    battlelog: '', action: '', ...overrides,
  };
}

function scenarios() {
  const result = [];
  const seeds = [0, 1, 2, 3, 4, 7, 99, 20261023];
  for (const kind of ['N', 'P', 'K', 'C', 'D', 'F', 'G', 'J', 'B']) {
    for (const seed of seeds) for (const active of [0, 1]) {
      for (const durability of [1, '∞']) {
        const opponent = seed % 2 ? 'WP' : 'WG';
        result.push({
          label: `${kind}, seed=${seed}, active=${active}, durability=${durability}`,
          seed, active, command: kind,
          pa: player(1, `W${kind}`, { weps: durability, sp: seed % 2 ? 100 : 1 }),
          pd: player(2, opponent, { weps: 4 }),
        });
      }
    }
  }
  for (const weapon of ['WKG', 'WGF', 'WDP', 'WBF', 'WJD']) {
    for (const seed of seeds) for (const active of [0, 1]) {
      const second = weapon[2];
      result.push({
        label: `dual=${weapon}, seed=${seed}, active=${active}`,
        seed, active, command: second,
        pa: player(1, weapon, { weps: seed % 2 ? 1 : '∞', sp: seed % 2 ? 100 : 1 }),
        pd: player(2, 'WK', { weps: 10 }),
      });
    }
  }
  // Lethal branches exercise the real attack end, player kill dispatch, saves,
  // and dualwep's preservation of weapon kind during player-data reload.
  for (const weapon of ['WP', 'WJ', 'WB', 'WKG']) for (const seed of seeds) {
    result.push({ label: `lethal=${weapon}, seed=${seed}`, seed, active: 1, command: weapon[1],
      pa: player(1, weapon, { weps: 2 }), pd: player(2, 'WP', { hp: 1, mhp: 10000 }) });
  }
  return result;
}

function differences(actual, expected, prefix = '') {
  if (Object.is(actual, expected)) return [];
  if (actual === null || expected === null || typeof actual !== 'object' || typeof expected !== 'object') {
    return [`${prefix}: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`];
  }
  const result = [];
  for (const key of new Set([...Object.keys(actual), ...Object.keys(expected)])) {
    if (!Object.hasOwn(actual, key) || !Object.hasOwn(expected, key)) result.push(`${prefix}.${key}: missing on one side`);
    else result.push(...differences(actual[key], expected[key], `${prefix}.${key}`));
  }
  return result;
}

const oracle = String.raw`<?php
namespace sys {
 function save_combatinfo(){ global $effects; $effects[]=['combatinfo',get_var_in_module('hdamage','sys'),get_var_in_module('hplayer','sys')]; }
 function addnews(...$args){ global $effects; $effects[]=array_merge(['news'],$args); }
}
namespace player {
 function kill(&$a,&$d){ if(eval(__MAGIC__)) return $___RET_VALUE; global $effects; $effects[]=['kill',$a['pid'],$d['pid'],$d['state']]; return '再见'; }
 function player_save(&$p){ if(eval(__MAGIC__)) return $___RET_VALUE; global $effects; $effects[]=['save',$p]; }
 function load_playerdata($p){ if(eval(__MAGIC__)) return $___RET_VALUE; global $effects; $effects[]=['load',$p]; $sdata=&get_var_in_module('sdata','player'); $sdata=$p; unset($sdata['wep_kind']); }
 function parse_news(){ if(eval(__MAGIC__)) return $___RET_VALUE; throw new \Exception('Player news rendering is outside this combat-chain boundary'); }
}
namespace itemobserver {
 function item_destroy_core($slot,&$p){ if(eval(__MAGIC__)) return $___RET_VALUE; global $effects; $effects[]=['destroy',$slot,$p['pid']]; $chprocess($slot,$p); }
}
namespace lvlctl { function getexp($amount,&$p){ if(eval(__MAGIC__)) return $___RET_VALUE; global $effects; $effects[]=['exp',$amount,$p['pid']]; $p['exp']+=$amount; } }
namespace noise { function addnoise(...$args){ if(eval(__MAGIC__)) return $___RET_VALUE; global $effects; $effects[]=array_merge(['noise'],$args); } }
namespace weapon {
 // Observe the unchanged weapon source's real PHP RNG calls. This function is
 // excluded from hook registration; no game branch or generated value changes.
 function rand($min,$max){ global $draws; $value=\rand($min,$max); $draws[]=[$min,$max,$value]; return $value; }
}
namespace {
 define('IN_GAME',true); define('GAME_ROOT',__DIR__.'/engine/');
 error_reporting(E_ALL & ~E_NOTICE); ini_set('display_errors','stderr');
 require GAME_ROOT.'include/modules/modules.func.php';
 $input=json_decode(stream_get_contents(STDIN),true);
 foreach($input['sourceFiles'] as $file) if($file!='include/modules/modules.func.php') require_once GAME_ROOT.$file;
 function bind_state($name,$values){
   $imports='';
   foreach($values as $key=>$value){
     $global='___LOCAL_'.strtoupper($name).'__VARS__'.$key; $GLOBALS[$global]=$value;
     $imports.='global $'.$global.';$'.$key.'=&$'.$global.';';
   }
   define('MOD_'.strtoupper($name),true); define('IMPORT_MODULE_'.strtoupper($name).'_GLOBALS',$imports);
 }
 bind_state('sys',['now'=>123456,'nowep'=>'拳头','hdamage'=>0,'hplayer'=>'','command'=>'']);
 bind_state('logger',['log'=>'']);
 bind_state('player',['equip_list'=>[],'battle_equip_list'=>[],'sdata'=>[],'wepk'=>'']);
 $itemValues=[];foreach(['tmp_itmsk_arr_pool','itemfind_extra_log','item_equip_list','item_hotkey_id_list','itemmain_drophint','item_allow_find_and_use','nosta','nospk','item_obbs','map_noitemdrop_arealist','itemkind_equipable','iteminfo','itemspkinfo','itemspkdesc','itemspkdesc_help','itemspkremark'] as $key)$itemValues[$key]=$$key;
 bind_state('itemmain',$itemValues);
 bind_state('noise',['noiseinfo'=>[]]);
 bind_state('wep_j',['wj_allowed_bskill'=>[]]);
 bind_state('dualwep',['dualwep_allowed_bskill'=>[],'dualwep_iteminfo'=>$dualwep_iteminfo]);
 $weaponValues=[];
 foreach(['nowep','nosta','skilltypeinfo','attinfo','attinfo2','skillinfo','wep_equip_list','counter_obbs','rangeinfo','hitrate_obbs','hitrate_max_obbs','hitrate_r','dmg_fluc','skill_dmg','wepimprate','wepdeathstate'] as $key) $weaponValues[$key]=$$key;
 bind_state('weapon',$weaponValues);
 foreach(['input','map','enemy','metman','corpse','battle','attack','lvlctl','wep_n','wep_p','wep_k','wep_c','wep_d','wep_f','wep_g','wep_b','itemobserver'] as $name) bind_state($name,[]);
 foreach($input['order'] as $namespace){
   $init=$namespace.'\\init'; if(function_exists($init)) $init();
   foreach(get_defined_functions()['user'] as $fn){
     if(strpos($fn,$namespace.'\\')===0){
       $name=substr($fn,strlen($namespace)+1);
       if($name!='init' && !($namespace=='weapon' && $name=='rand')) hook_register($namespace,$name);
     }
   }
 }
 $out=[];
 foreach($input['cases'] as $case){
   $effects=[]; $draws=[];
   $GLOBALS['___LOCAL_SYS__VARS__hdamage']=0; $GLOBALS['___LOCAL_SYS__VARS__hplayer']=''; $GLOBALS['___LOCAL_SYS__VARS__command']=$case['command'];
   $GLOBALS['___LOCAL_LOGGER__VARS__log']=''; $GLOBALS['___LOCAL_PLAYER__VARS__sdata']=[];
   $pa=$case['pa']; $pd=$case['pd']; mt_srand($case['seed']);
   \battle\battle($pa,$pd,$case['active']);
   $out[]=['pa'=>$pa,'pd'=>$pd,'log'=>get_var_in_module('log','logger'),'effects'=>$effects,'draws'=>$draws,'next'=>\rand(),
     'record'=>[get_var_in_module('hdamage','sys'),get_var_in_module('hplayer','sys')], 'playerState'=>get_var_in_module('sdata','player')];
 }
 echo json_encode($out,JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);
}`;

test('real items, battle, attack, all weapon kinds and dual-weapon chain agree with unchanged PHP', { timeout: 120_000 }, async t => {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true, timeout: 10_000 });
  if (version.error?.code === 'ENOENT' || version.stdout?.trim() !== '7.4') {
    t.skip('Development-only PHP 7.4 is required for the differential oracle; native game rules do not execute PHP.');
    return;
  }
  assert.equal(version.status, 0, version.stderr);
  const parent = path.join(project, 'var', 'tests');
  await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'native-combat-chain-'));
  try {
    for (const relative of sources) {
      const destination = path.join(root, 'engine', relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(path.join(project, 'engine', relative), destination);
    }
    await mkdir(path.join(root, 'engine', 'include', 'modulemng'), { recursive: true });
    await writeFile(path.join(root, 'engine', 'include', 'modulemng', 'modulemng.config.php'), '<?php $___MOD_CODE_ADV2=0; $___MOD_SRV=0;');
    const script = path.join(root, 'oracle.php');
    await writeFile(script, oracle);
    const inputs = scenarios();
    const order = registry([]).order;
    const selectedNames = new Set(order);
    const sourceOrder = [...upstreamOrder.filter(name => selectedNames.has(name)), 'itemobserver'];
    assert.deepEqual(order, sourceOrder, 'Combat modules and boundaries must keep their original relative registration order');
    const result = spawnSync(executable, ['-d', 'display_errors=stderr', script], {
      input: JSON.stringify({ cases: inputs, order: sourceOrder, sourceFiles: sources }), encoding: 'utf8', windowsHide: true, timeout: 60_000, maxBuffer: 64 * 1024 * 1024,
    });
    assert.equal(result.status, 0, result.error?.message || result.stderr);
    assert.equal(result.stderr, '', result.stderr);
    const expected = JSON.parse(result.stdout);
    const mismatches = [];
    const covered = { hits: 0, misses: 0, counters: 0, noRange: 0, noCounter: 0, destroys: 0, deaths: 0, spiritLow: 0, spiritHigh: 0, dualReload: 0 };
    for (const [index, input] of inputs.entries()) {
      const effects = [], draws = [];
      const rng = createPhp74Random(input.seed);
      const session = await registry(effects).createSession({
        services: { random: { rand(min, max) { const value = rng.rand(min, max); draws.push([min, max, value]); return value; } } },
        states: { sys: { command: input.command } },
      });
      const pa = structuredClone(input.pa), pd = structuredClone(input.pd);
      await session.call('battle', 'battle', pa, pd, input.active);
      const actual = { pa, pd, log: session.state('logger').log, effects, draws, next: rng.rand(),
        record: [session.state('sys').hdamage, session.state('sys').hplayer], playerState: session.state('player').sdata };
      try { assert.deepEqual(actual, expected[index], input.label); }
      catch { mismatches.push({ scenario: input.label, fields: differences(actual, expected[index]) }); }
      pa.is_hit ? covered.hits++ : covered.misses++;
      if (pd.counter_assaulted === 1) covered.counters++;
      if (actual.log.includes('射程不足')) covered.noRange++;
      if (actual.log.includes('没能及时反击')) covered.noCounter++;
      if (effects.some(event => event[0] === 'destroy')) covered.destroys++;
      if (effects.some(event => event[0] === 'kill')) covered.deaths++;
      if (actual.log.includes('灵力武器50％')) covered.spiritLow++;
      if (actual.log.includes('灵力武器100％')) covered.spiritHigh++;
      if (input.label.startsWith('lethal=WKG') && effects.some(event => event[0] === 'load')) {
        assert.equal(actual.playerState.wep_kind, pa.wep_kind, 'Dual weapon kind must survive the DB-field reload boundary');
        covered.dualReload++;
      }
    }
    assert.equal(mismatches.length, 0, JSON.stringify({ mismatches: mismatches.length, distinctFields: [...new Set(mismatches.flatMap(entry => entry.fields))], examples: mismatches.slice(0, 3) }, null, 2));
    for (const [branch, count] of Object.entries(covered)) assert.ok(count > 0, `${branch} was not actually exercised`);
    t.diagnostic(`Compared ${inputs.length} battle.battle assault/counter scenarios, every state field/log/effect, every RNG call and next draw: ${JSON.stringify(covered)}.`);
  } finally {
    assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep));
    await rm(root, { recursive: true, force: true });
  }
});
