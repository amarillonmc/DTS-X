import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { attackModule } from '../native/gameplay/attack.mjs';
import { weaponModule } from '../native/gameplay/weapon.mjs';
import { createPhp74Random } from '../native/random.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));

// Only dependencies OUTSIDE this test's attack/weapon boundary are fixtures.
// They record calls, and do not pretend to persist a game or implement skills.
function boundaryModules(effects) {
  return [
    { name: 'input' }, { name: 'map' },
    { name: 'logger', state: () => ({ log: '' }) },
    { name: 'sys', state: () => ({ hdamage: 0, hplayer: '', command: 'P', nowep: '拳头' }), functions: {
      save_combatinfo(ctx) { effects.push(['save_combatinfo', ctx.state().hdamage, ctx.state().hplayer]); },
      addnews(ctx, ...args) { effects.push(['news', ...args]); },
    } },
    { name: 'player', state: () => ({ equip_list: [], battle_equip_list: [] }), functions: {
      kill(ctx, a, d) { effects.push(['kill', a.pid, d.pid, d.state]); return '再见'; },
      player_save(ctx, p) { effects.push(['save', p.pid, p.hp]); },
      load_playerdata(ctx, p) { effects.push(['load', p.pid]); },
    } },
    { name: 'battle', functions: { attack_wrapper() {}, check_can_counter: () => 1 } },
    { name: 'itemmain', functions: {
      item_destroy_core(ctx, slot, p) { effects.push(['destroy', slot, p.pid]); p.wep = '拳头'; p.wepk = 'WN'; p.wepe = 0; p.weps = '∞'; p.wepsk = ''; },
      itemuse(ctx, item) { effects.push(['itemuse', item.itmk]); },
      parse_itmk_desc() { return ''; },
      parse_item_words(ctx, p) { return { weps_words: String(p.weps) }; },
    } },
    { name: 'lvlctl', functions: { getexp(ctx, value, p) { effects.push(['exp', value, p.pid]); p.exp += value; } } },
  ];
}

const config = {
  skillinfo: { P: 'wp', C: 'wc', N: 'wp' }, attinfo: { P: '殴打', C: '投掷', N: '殴打' },
  attinfo2: {}, counter_obbs: { P: 65, C: 35, N: 60 }, rangeinfo: { P: 3, C: 5, N: 3 },
  hitrate_obbs: { P: 80, C: 70, N: 80 }, hitrate_max_obbs: { P: 90, C: 96, N: 90 },
  hitrate_r: { P: 0.025, C: 0.25, N: 0.025 }, dmg_fluc: { P: 15, C: 5, N: 15 },
  skill_dmg: { P: 0.6, C: 0.35, N: 0.6 }, wepimprate: { P: 12, C: 10000, N: -1 },
  wepdeathstate: { P: 21, C: 24, N: 20 },
};
const player = (overrides = {}) => ({ pid: 1, name: '攻击者', type: 0, att: 103, def: 72, hp: 1000, lvl: 8, exp: 0,
  wep: '测试钝器', wepk: 'WP', wepe: 27, weps: 50, wepsk: '', wp: 100, wc: 80,
  user_commanded: 1, is_counter: 0, physical_dmg_dealt: 0, wepimp: 0, battlelog: '', ...overrides });

async function session(seed = 123, extra = [], state = {}) {
  const effects = [];
  const registry = new ModuleRegistry([...boundaryModules(effects), attackModule, weaponModule, ...extra]);
  const runtime = await registry.createSession({ services: { random: createPhp74Random(seed) }, states: { weapon: structuredClone(config), ...state } });
  return { runtime, effects };
}

// PHP loads the unchanged real implementations, including __MAGIC__. It is
// invoked in a disposable directory and is never used by native production code.
const oracle = String.raw`<?php
namespace sys {
  function save_combatinfo() { global $effects; $effects[]=array('save_combatinfo',get_var_in_module('hdamage','sys'),get_var_in_module('hplayer','sys')); }
  function addnews(...$args) { global $effects; $effects[]=array_merge(array('news'),$args); }
}
namespace player {
  function kill(&$a,&$d) { global $effects; $effects[]=array('kill',$a['pid'],$d['pid'],$d['state']); return '再见'; }
  function player_save(&$p) { global $effects; $effects[]=array('save',$p['pid'],$p['hp']); }
  function load_playerdata(&$p) { global $effects; $effects[]=array('load',$p['pid']); }
}
namespace itemmain {
  function item_destroy_core($slot,&$p) { global $effects; $effects[]=array('destroy',$slot,$p['pid']); $p['wep']='拳头'; $p['wepk']='WN'; $p['wepe']=0; $p['weps']='∞'; $p['wepsk']=''; }
  function itemuse(&$item) { if(eval(__MAGIC__)) return $___RET_VALUE; global $effects; $effects[]=array('itemuse',$item['itmk']); }
  function parse_itmk_desc($kind,$attributes) { if(eval(__MAGIC__)) return $___RET_VALUE; return ''; }
  function parse_item_words($p,$simple=0,$ellipsis=0) { if(eval(__MAGIC__)) return $___RET_VALUE; return array('weps_words'=>(string)$p['weps']); }
}
namespace battle {
  function attack_wrapper(&$a,&$d,$active) { if(eval(__MAGIC__)) return $___RET_VALUE; }
  function check_can_counter(&$a,&$d,$active) { if(eval(__MAGIC__)) return $___RET_VALUE; return 1; }
}
namespace lvlctl { function getexp($value,&$p) { global $effects; $effects[]=array('exp',$value,$p['pid']); $p['exp']+=$value; } }
namespace combat_reference {
  function get_final_dmg_base(&$pa,&$pd,&$active) { if(eval(__MAGIC__)) return $___RET_VALUE; $active=0; return 1; }
}
namespace {
  define('IN_GAME',true); define('IN_MODULEMNG',true); define('GAME_ROOT',__DIR__.'/engine/');
  error_reporting(E_ALL & ~E_NOTICE); ini_set('display_errors','stderr');
  require GAME_ROOT.'include/global.func.php';
  require GAME_ROOT.'include/modules/modules.func.php';
  foreach(array('base/attack/attack.php','base/attack/attack_wrapper.php','base/attack/attack_news.php','base/weapon/weapon/main.php','base/weapon/weapon/config/weapon.config.php') as $file) require GAME_ROOT.'include/modules/'.$file;
  function bind_state($name,$values) {
    $imports='';
    foreach($values as $key=>$value) {
      $global='___LOCAL_'.strtoupper($name).'__VARS__'.$key;
      $GLOBALS[$global]=$value;
      $imports.='global $'.$global.';$'.$key.'=&$'.$global.';';
    }
    define('MOD_'.strtoupper($name),true); define('IMPORT_MODULE_'.strtoupper($name).'_GLOBALS',$imports);
  }
  $input=json_decode(stream_get_contents(STDIN),true); $effects=array();
  bind_state('sys',array('hdamage'=>0,'hplayer'=>'','command'=>'P','nowep'=>'拳头'));
  bind_state('logger',array('log'=>''));
  bind_state('player',array_merge(array('equip_list'=>array(),'battle_equip_list'=>array()), $input['playerState']??array()));
  bind_state('weapon',array_merge(array('nosta'=>'∞','nowep'=>'拳头','wep_equip_list'=>array('wep'),'skilltypeinfo'=>array('wp'=>'殴','wk'=>'斩','wg'=>'射','wc'=>'投','wd'=>'爆','wf'=>'灵')), $input['config']));
  bind_state('itemmain',array());
  foreach(array('battle','itemmain','attack','weapon') as $namespace) {
    foreach(get_defined_functions()['user'] as $fn) {
      if(strpos($fn,$namespace.'\\')===0) {
        $name=substr($fn,strlen($namespace)+1); if($name!=='init') hook_register($namespace,$name);
      }
    }
  }
  if(!empty($input['reference'])) hook_register('combat_reference','get_final_dmg_base');
  mt_srand($input['seed']??123);
  if($input['op']==='math') {
    $out=array(); foreach($input['cases'] as $args) $out[]=\attack\apply_multiplier(...$args);
  } elseif($input['op']==='attack') {
    $pa=$input['pa']; $pd=$input['pd']; \attack\attack_wrapper($pa,$pd,$input['active']);
    $out=array('pa'=>$pa,'pd'=>$pd,'log'=>get_var_in_module('log','logger'),'effects'=>$effects,'next'=>rand());
  } elseif($input['op']==='counter') {
    $pa=$input['pa']; $pd=$input['pd']; $result=\battle\check_can_counter($pa,$pd,$input['active']);
    $out=array('result'=>$result,'pa'=>$pa,'pd'=>$pd,'next'=>rand());
  } elseif($input['op']==='item') {
    $item=$input['item']; \itemmain\itemuse($item);
    $out=array('item'=>$item,'fields'=>array(),'log'=>get_var_in_module('log','logger'),'effects'=>$effects);
    foreach(array('wep','wepk','wepe','weps','wepsk') as $key) $out['fields'][$key]=get_var_in_module($key,'player');
  } elseif($input['op']==='news') {
    $out=array(); foreach($input['values'] as $d) $out[]=\attack\parse_damage_news('甲','乙','',$d,'');
  } elseif($input['op']==='deathnews') {
    $out=array(); foreach($input['values'] as $type) $out[]=\attack\parse_news(7,$type,1,2,3,'甲','','乙','测试武器','',array('dword'=>'，结束'));
  }
  echo json_encode($out,JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);
}`;

async function withOracle(t, run) {
  const php = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  if (version.error?.code === 'ENOENT' || version.stdout?.trim() !== '7.4') { t.skip('Differential verification requires development-only PHP 7.4 (DTS_REFERENCE_PHP)'); return; }
  assert.equal(version.status, 0, version.stderr);
  const parent = path.join(project, 'var', 'tests'); await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'native-combat-'));
  try {
    for (const relative of ['include/global.func.php','include/bubblebox.func.php','include/roommng/roommng.config.php','include/modules/modules.func.php','include/modulemng/modulemng.config.sample.php',
      'include/modules/base/attack/attack.php','include/modules/base/attack/attack_wrapper.php','include/modules/base/attack/attack_news.php',
      'include/modules/base/weapon/weapon/main.php','include/modules/base/weapon/weapon/config/weapon.config.php']) {
      const output = path.join(root, 'engine', relative.replace('modulemng.config.sample.php', 'modulemng.config.php'));
      await mkdir(path.dirname(output), { recursive: true });
      await copyFile(path.join(project, 'engine', relative), output);
    }
    const script = path.join(root, 'oracle.php'); await writeFile(script, oracle);
    const execute = input => {
      const result = spawnSync(php, [script], { input: JSON.stringify({ config, ...input }), encoding: 'utf8', windowsHide: true, timeout: 30000 });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stderr, '', result.stderr);
      return JSON.parse(result.stdout);
    };
    await run(execute);
  } finally {
    assert.ok(root.startsWith(parent + path.sep)); await rm(root, { recursive: true, force: true });
  }
}

test('native damage arithmetic, rounding and original expression formatting match PHP', async t => withOracle(t, async oracle => {
  const cases = [];
  for (const base of [0, 1, 1.5, 10, 103, -3, '0', '1', '1.5', '10', '103', '-3']) {
    for (const multipliers of [[], [0], [1], [2], [0.75, 1.5], [-1], [0.5, 0.5]]) {
      for (const replacement of [null, '100+3', '100 + 3', '0']) cases.push([base, multipliers, 'red b', replacement]);
    }
  }
  const { runtime } = await session();
  const actual = []; for (const args of cases) actual.push(await runtime.call('attack', 'apply_multiplier', ...args));
  assert.deepEqual(actual, oracle({ op: 'math', cases }));
}));

test('native real weapon attacks match PHP state, log, effects and random consumption', async t => withOracle(t, async oracle => {
  let hits = 0, misses = 0, breaks = 0, deaths = 0;
  for (const seed of [0, 1, 2, 3, 4, 7, 99, 20261023]) {
    for (const active of [0, 1]) for (const kind of ['P', 'C']) {
      const pa = player({ wepk: `W${kind}`, weps: 1 });
      const pd = player({ pid: 2, name: '防御者', lvl: 32, hp: seed % 2 ? 1000 : 5, user_commanded: 0 });
      const expected = oracle({ op: 'attack', seed, pa, pd, active });
      const effects = [], random = createPhp74Random(seed);
      const registry = new ModuleRegistry([...boundaryModules(effects), attackModule, weaponModule]);
      const runtime = await registry.createSession({ services: { random }, states: { weapon: structuredClone(config) } });
      await runtime.call('attack', 'attack_wrapper', pa, pd, active);
      const actual = { pa, pd, log: runtime.state('logger').log, effects, next: random.rand() };
      assert.deepEqual(actual, expected, `seed=${seed}, active=${active}, kind=${kind}`);
      pa.is_hit ? hits++ : misses++; if (pa.wepk === 'WN') breaks++; if (pd.hp <= 0) deaths++;
    }
  }
  assert.ok(hits && misses && breaks && deaths, 'success, failure, break and death branches must actually execute');
}));

test('native counter range checks preserve early return and random draw order', async t => withOracle(t, async oracle => {
  for (const seed of [1, 2, 99]) for (const kinds of [['P','P'],['P','C'],['C','P']]) {
    const pa = player({wepk:`W${kinds[0]}`}), pd = player({wepk:`W${kinds[1]}`, wep_kind:kinds[1]});
    const expected = oracle({op:'counter', seed, pa, pd, active:1});
    const {runtime} = await session(seed);
    const random = createPhp74Random(seed);
    const effects = [];
    const engine = await new ModuleRegistry([...boundaryModules(effects),attackModule,weaponModule]).createSession({services:{random},states:{weapon:structuredClone(config)}});
    const result = await engine.call('battle','check_can_counter',pa,pd,1);
    assert.deepEqual({result,pa,pd,next:random.rand()},expected);
    assert.deepEqual(runtime.chain('check_can_counter'), ['battle','weapon']);
  }
}));

test('native weapon equip/swap and damage-news thresholds match real PHP', async t => withOracle(t, async oracle => {
  for (const wepk of ['WN','WP']) {
    const state = {wep:'旧武器',wepk,wepe:17,weps:3,wepsk:'r'};
    const item = {itm:'新武器',itmk:'WC',itme:30,itms:5,itmsk:'d'};
    const expected = oracle({op:'item',playerState:state,item});
    const {runtime,effects} = await session(123,[],{player:state});
    await runtime.call('itemmain','itemuse',item);
    const fields = Object.fromEntries(Object.keys(state).map(key=>[key,runtime.state('player')[key]]));
    assert.deepEqual({item,fields,log:runtime.state('logger').log,effects},expected);
  }
  const values=[99,100,149,150,199,200,249,250,299,300,399,400,499,500,599,600,749,750,999,1000,4999,5000,9999,10000,49999,50000,199999,200000,500000,500001];
  const {runtime}=await session();
  const actual=[]; for(const value of values) actual.push(await runtime.call('attack','parse_damage_news','甲','乙','',value,''));
  assert.deepEqual(actual,oracle({op:'news',values}));
  const deaths=['death20','death21','death22','death23','death24','death25','death29'];
  const rendered=[]; for(const death of deaths) rendered.push(await runtime.call('attack','parse_news',7,death,1,2,3,'甲','','乙','测试武器','',{dword:'，结束'}));
  assert.deepEqual(rendered,oracle({op:'deathnews',values:deaths}));
}));

test('asynchronous skill overrides finish before damage is applied, with modifiers in original order', async () => {
  const order=[];
  const extension={name:'test_skill',dependencies:['attack','weapon'],functions:{
    async get_att_multiplier(ctx,...args){await Promise.resolve();return [0.5,...await ctx.next(...args)];},
    async apply_total_damage_modifier_invincible(ctx,pa){await Promise.resolve();order.push('invincible');pa.dmg_dealt=13;},
    async apply_total_damage_modifier_special(ctx,pa){await Promise.resolve();order.push('special');pa.dmg_dealt=7;},
    async apply_total_damage_modifier_limit(ctx,pa){await Promise.resolve();order.push('limit');pa.dmg_dealt=3;},
    async apply_total_damage_modifier_insurance(ctx,pa){await Promise.resolve();order.push('insurance');pa.dmg_dealt=0;},
    async apply_total_damage_modifier_seckill(ctx,pa){await Promise.resolve();order.push('seckill');pa.dmg_dealt=2;},
  }};
  const {runtime}=await session(1,[extension]);
  const pa=player(),pd=player({hp:1000});
  await runtime.call('attack','attack_wrapper',pa,pd,1);
  assert.equal(pa.fin_att,79);
  assert.deepEqual(order,['invincible','special','limit','insurance','seckill']);
  assert.equal(pd.hp,998);
});

test('final-damage hooks retain the original local active reference', async t => withOracle(t, async oracle => {
  const pa=player(),pd=player({pid:2,name:'防御者',lvl:32});
  const expected=oracle({op:'attack',seed:1,pa,pd,active:1,reference:true});
  const random=createPhp74Random(1),effects=[];
  const extension={name:'combat_reference',dependencies:['attack'],functions:{
    async get_final_dmg_base(ctx,attacker,defender,active){active.value=0;return 1;},
  }};
  const runtime=await new ModuleRegistry([...boundaryModules(effects),attackModule,weaponModule,extension]).createSession({services:{random},states:{weapon:structuredClone(config)}});
  await runtime.call('attack','attack_wrapper',pa,pd,1);
  assert.deepEqual({pa,pd,log:runtime.state('logger').log,effects,next:random.rand()},expected);
}));
