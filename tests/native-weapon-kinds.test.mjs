import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { weaponModule } from '../native/gameplay/weapon.mjs';
import { dualWeaponModule, weaponKindModules } from '../native/gameplay/weapon-kinds.mjs';
import { ModuleRegistry, reference } from '../native/modules/registry.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const kinds = ['N', 'P', 'K', 'C', 'D', 'F', 'G', 'J', 'B'];
const fields = ['skillinfo', 'attinfo', 'attinfo2', 'counter_obbs', 'rangeinfo', 'hitrate_obbs', 'hitrate_max_obbs', 'hitrate_r', 'dmg_fluc', 'skill_dmg', 'wepimprate', 'wepdeathstate'];

// Only state needed by these unit cases is supplied for unrelated dependencies.
// Production descriptors retain all original dependencies and are never relaxed.
async function createUnitSession(extra = [], fixture = {}) {
  return new ModuleRegistry([
    ...['sys', 'attack', 'lvlctl', 'input', 'enemy'].map(name => ({ name })),
    { name: 'battle', functions: fixture.battleFunctions ?? {} },
    { name: 'player', state: () => ({ equip_list: [], battle_equip_list: [], wepk: 'WJ' }) },
    { name: 'logger', state: () => ({ log: '' }) },
    { name: 'itemmain', state: () => ({ iteminfo: {}, itemspkinfo: {}, itemspkdesc: {} }), functions: fixture.itemFunctions ?? {} },
    weaponModule, ...weaponKindModules, dualWeaponModule, ...extra,
  ]).createSession();
}

const player = (kind, durability = 10) => ({
  name: '测试甲', pid: 11, pls: 3, wep: '测试武器', wepk: `W${kind}`, weps: durability, wepe: 51,
  wep_kind: kind, att: 401, sp: 4, wp: 35, wk: 49, wg: 91, wc: 65, wd: 86, wf: 125, bskill: 3,
});

test('uninitialized replay weapon description preserves an absent PHP kind as empty text',async()=>{
  const session=await createUnitSession([],{itemFunctions:{parse_itmk_desc:()=>''}});
  assert.equal(await session.call('weapon','parse_itmk_desc',null,null),'');
  assert.equal(await session.call('weapon','parse_itmk_desc',undefined,''),'');
});

test('bow reload preserves old arrows, imports new attributes, and waits for inventory hooks', async () => {
  const calls = [];
  const oldArrow = { itm: '旧箭', itmk: 'GA', itme: '2', itms: '4', itmsk: 'p' };
  const session = await createUnitSession([], { itemFunctions: {
    async check_in_itmsk(ctx, key, value) {
      if (key === '^ari') return textValue(value).includes('^ari_old1') ? 'old' : false;
      return value.includes(key);
    },
    async base64_decode_comp_itmsk(ctx, encoded) {
      assert.equal(encoded, 'old'); return Object.values(oldArrow).join(',');
    },
    async replace_in_itmsk(ctx, key, replacement, value) { assert.equal(key, '^ari'); return value.replace('^ari_old1', replacement); },
    async get_itmsk_array(ctx, value) { return value === 'r' ? ['r'] : []; },
    async base64_encode_comp_itmsk(ctx, value) { calls.push(['encode', value]); return 'new'; },
    async itms_reduce(ctx, item, count) { await new Promise(resolve => setImmediate(resolve)); item.itms -= count; calls.push(['reduce', count]); },
    async itemget(ctx) { calls.push(['get', structuredClone(ctx.state('player'))]); },
  } });
  const state = session.state('player');
  Object.assign(state, { wep: '长弓', wepk: 'WB', weps: 4, wepsk: 'A^ari_old1|p|', wc: 450 });
  const item = { itm: '新箭', itmk: 'GA', itme: 3, itms: 9, itmsk: 'r', itmn: 2 };
  await session.call('wep_b', 'itemuse_uga', item);
  assert.equal(state.weps, 4);
  assert.equal(state.wepsk, 'A^ari_new1|r|');
  assert.equal(item.itms, 5);
  assert.deepEqual([state.itm0, state.itmk0, state.itme0, state.itms0, state.itmsk0], ['旧箭', 'GA', '2', 4, 'p']);
  assert.deepEqual(calls.slice(0, 2), [['encode', '新箭,GA,3,4,r'], ['reduce', 4]]);
  assert.equal(calls[2][0], 'get');
  assert.match(session.state('logger').log, /换上了.*新箭.*4/);
});

const textValue = value => value == null ? '' : String(value);

test('bow loading rejects no-bow and picked-up arrows and depletion clears only arrow attributes', async () => {
  let inventoryCalls = 0;
  const session = await createUnitSession([], {
    battleFunctions: { async battlelog_parser(ctx, pa, pd, active, value) { return value.replaceAll('<:pa_name:>', active ? '你' : pa.name); } },
    itemFunctions: {
      async check_in_itmsk(ctx, key, value) { assert.equal(key, '^ari'); return value.includes('^ari_old1') ? 'old' : false; },
      async replace_in_itmsk(ctx, key, replacement, value) { return value.replace('^ari_old1', replacement); },
      async itms_reduce() { inventoryCalls++; },
    },
  });
  const item = { itm: '箭', itmk: 'GA', itme: 1, itms: 5, itmsk: '', itmn: '0' };
  await session.call('wep_b', 'itemuse', item);
  assert.match(session.state('logger').log, /没有装备弓/);
  session.state('player').wepk = 'WB';
  session.state('logger').log = '';
  await session.call('wep_b', 'itemuse', item);
  assert.match(session.state('logger').log, /先把箭矢收进包裹/);
  assert.equal(inventoryCalls, 0);
  assert.equal(session.state('sys').mode, 'command');
  const pa = { ...player('B', 1), wepimp: 1, wepsk: 'A^ari_old1|p|r' };
  session.state('logger').log = '';
  await session.call('weapon', 'apply_weapon_imp', pa, defender(), 1);
  assert.equal(pa.weps, '∞');
  assert.equal(pa.wepsk, 'Ar');
  assert.match(session.state('logger').log, /用掉了1支箭.*箭矢用光了/s);
});

test('dual weapon switch acts on aliased player state, preserves extra kind data and rejects invalid equipment', async () => {
  const session = await createUnitSession();
  const state = session.state('player');
  state.sdata = {};
  Object.defineProperty(state.sdata, 'wepk', { enumerable: true, get: () => state.wepk, set: value => { state.wepk = value; } });
  Object.defineProperty(state.sdata, 'weps', { enumerable: true, get: () => state.weps, set: value => { state.weps = value; } });
  Object.assign(state, { wepk: 'WKGextra', weps: 10 });
  await session.call('dualwep', 'dualwep_change_am');
  assert.equal(state.wepk, 'WGKextra');
  assert.equal(state.sdata.wepk, 'WGKextra');
  assert.match(session.state('logger').log, /远程兵器/);
  for (const [kind, message] of [['HS', /请先装备武器/], ['WK', /并未装备双重/]]) {
    state.wepk = kind;
    session.state('logger').log = '';
    await session.call('dualwep', 'dualwep_change_am');
    assert.match(session.state('logger').log, message);
    assert.equal(state.wepk, kind);
  }
});
const defender = () => ({ name: '测试乙', pid: 12, wepk: 'WJ', mhp: 90001 });

function cases() {
  const result = [];
  for (const kind of kinds) {
    for (const fn of ['get_attack_method', 'get_external_att', 'get_internal_att', 'get_primary_fixed_dmg_base', 'get_physical_dmg_multiplier', 'calculate_wepimp_rate']) {
      result.push({ fn, pa: player(kind), pd: defender(), active: 1 });
    }
    for (const durability of ['∞', 0, '0']) result.push({ fn: 'get_attack_method', pa: player(kind, durability), pd: defender(), active: 0 });
  }
  for (const kind of ['P', 'K', 'G', 'J']) {
    for (const active of [0, 1]) result.push({ fn: 'apply_weapon_imp', pa: { ...player(kind, ['P', 'K'].includes(kind) ? '∞' : 1), wepimp: 1 }, pd: defender(), active });
  }
  for (const kind of ['G', 'J']) result.push({ fn: 'calculate_wepimp_rate', pa: { ...player(kind, '∞'), wep_kind: 'P' }, pd: defender(), active: 1 });
  for (const sp of [0, 1, 4, 11, 100]) result.push({ fn: 'get_physical_dmg_multiplier', pa: { ...player('F'), sp }, pd: defender(), active: 0 });
  for (const [wepk, weps, kind] of [['WKG', 1, 'K'], ['WDP', 10, 'D'], ['WGF', '∞', 'G'], ['WFK', '∞', 'F']]) {
    result.push({ fn: 'apply_weapon_imp', pa: { ...player(kind, weps), wepk, wepimp: 1 }, pd: defender(), active: 1 });
  }
  return result;
}

function scalarCases() {
  return ['WB', 'WB|箭矢', 'ab|cd|ef', 'ab|cd', 'ab|c|d|e|f', '|中文\n符文|x'].flatMap(value => [
    { fn: 'wep_b_clean_arrow_name', value }, { fn: 'wep_b_clean_arrow_sk', value },
  ]);
}

function dualCases() {
  const result = [];
  for (const kind of ['', 'X', 'G', 'J', 'B', 'N', 'F']) {
    for (const durability of ['∞', 1, 0, '0']) {
      for (const original of [0, 1]) result.push({ fn: 'check_w2_valid', args: [kind, durability, original] });
      result.push({ fn: 'get_dualwep_imp_kind_tier', args: [kind, durability] });
    }
  }
  for (const [wepk, weps, kind] of [['WKG', 10, 'K'], ['WKG', '∞', 'K'], ['WBF', '∞', 'F'], ['WDP', 9, 'D'], ['WK', 4, 'K']]) {
    const pa = { ...player(kind, weps), wepk, wg: 101, wk: 1 };
    for (const fn of ['get_sec_attack_method', 'get_other_attack_method', 'get_dualwep_imp_kind', 'get_skill_by_kind', 'get_skillkind']) {
      if (fn === 'get_other_attack_method' && wepk.length < 3) continue;
      result.push({ fn, args: fn === 'get_sec_attack_method' ? [pa] : fn === 'get_other_attack_method' ? [pa, kind] : [pa, defender(), 1, 'wk'] });
    }
  }
  return result;
}

test('native weapon kinds initialize all original parameters and compose gun-butt wear', async () => {
  const session = await createUnitSession();
  const weapon = session.state('weapon');
  assert.equal(weapon.skillinfo.J, 'wg');
  assert.equal(weapon.wepimprate.N, -1);
  assert.equal(weapon.wepimprate.C, 10000);
  assert.equal(weapon.rangeinfo.D, 0);
  assert.equal(weapon.attinfo2.F, '释放灵力攻击');
  assert.equal(session.state('itemmain').iteminfo.WK, '锐器');
  assert.equal(await session.call('weapon', 'calculate_wepimp_rate', { ...player('G', '∞'), wep_kind: 'P' }, defender(), 1), 75);
  assert.equal(await session.call('weapon', 'calculate_wepimp_rate', { ...player('J', '∞'), wep_kind: 'P' }, defender(), 1), 180);
  assert.equal(await session.call('weapon', 'get_attack_method', { wepk: 'HS', weps: 1 }), 'P');
});

test('asynchronous spirit hook overrides are awaited and optional noise is dispatched', async () => {
  const noise = [];
  const session = await createUnitSession([
    { name: 'noise', state: () => ({ noiseinfo: {} }), functions: { async addnoise(ctx, ...args) { noise.push(args); } } },
    { name: 'spirit_override', dependencies: ['wep_f'], functions: {
      async get_WF_sp_cost() { await new Promise(resolve => setImmediate(resolve)); return 10; },
    } },
  ]);
  const pa = player('F');
  assert.deepEqual(await session.call('wep_f', 'get_WF_dmg_multiplier', pa, defender(), 1), [0.65]);
  assert.equal(pa.sp, 1);
  assert.equal(session.state('noise').noiseinfo.F, '灵气');
  await session.call('wep_g', 'weapon_WG_addnoise', pa, defender(), 1);
  assert.deepEqual(noise, [[3, 'G', 11, 12]]);
});

test('weapon-kind branches and initialization match the unchanged PHP 7.4 modules', async t => {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout?.trim() !== '7.4') {
    t.skip('Development differential oracle requires PHP 7.4; native game rules do not use PHP.');
    return;
  }
  const parent = path.join(project, 'var', 'tests');
  await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'native-weapon-kinds-'));
  try {
    await mkdir(path.join(root, 'include', 'modulemng'), { recursive: true });
    await writeFile(path.join(root, 'include', 'modulemng', 'modulemng.config.php'), '<?php $___MOD_CODE_ADV2=0; $___MOD_SRV=0;');
    await copyFile(path.join(project, 'engine', 'include', 'modules', 'modules.func.php'), path.join(root, 'modules.func.php'));
    await copyFile(path.join(project, 'engine', 'include', 'modules', 'base', 'weapon', 'weapon', 'config', 'weapon.config.php'), path.join(root, 'weapon.config.php'));
    for (const name of ['weapon', ...kinds.map(kind => `wep_${kind.toLowerCase()}`)]) {
      await copyFile(path.join(project, 'engine', 'include', 'modules', 'base', 'weapon', name, 'main.php'), path.join(root, `${name}.php`));
    }
    await copyFile(path.join(project, 'engine', 'include', 'modules', 'base', 'weapon', 'dualwep', 'main.php'), path.join(root, 'dualwep.php'));
    await copyFile(path.join(project, 'engine', 'include', 'modules', 'base', 'weapon', 'dualwep', 'config', 'dualwep.config.php'), path.join(root, 'dualwep.config.php'));
    await writeFile(path.join(root, 'cases.json'), JSON.stringify(cases()));
    await writeFile(path.join(root, 'scalar.json'), JSON.stringify(scalarCases()));
    await writeFile(path.join(root, 'dual.json'), JSON.stringify(dualCases()));
    const source = `<?php
define('GAME_ROOT',__DIR__.'/'); require __DIR__.'/modules.func.php'; require __DIR__.'/weapon.config.php';
$iteminfo=[]; $itemspkinfo=[]; $itemspkdesc=[]; $log=''; $wepk='WJ';
$names=['weapon','wep_n','wep_p','wep_k','wep_c','wep_d','wep_f','wep_g','wep_j','wep_b','dualwep'];
require __DIR__.'/dualwep.config.php';
$fields=${JSON.stringify(fields).replaceAll('"', "'")};
define('IMPORT_MODULE_WEAPON_GLOBALS','global $nowep,$nosta,$skilltypeinfo,$'.implode(',$',$fields).';');
define('IMPORT_MODULE_ITEMMAIN_GLOBALS','global $iteminfo,$itemspkinfo,$itemspkdesc;');
define('IMPORT_MODULE_LOGGER_GLOBALS','global $log;');
define('IMPORT_MODULE_PLAYER_GLOBALS','global $wepk;');
define('IMPORT_MODULE_SYS_GLOBALS','');
define('IMPORT_MODULE_WEP_J_GLOBALS','global $wj_allowed_bskill;');
foreach($names as $name) { require __DIR__.'/'.$name.'.php'; if($name!='weapon') { $fn=$name.'\\\\init'; $fn(); }
 foreach(get_defined_functions()['user'] as $fn) { if(strpos($fn,$name.'\\\\')===0) { $bare=substr($fn,strlen($name)+1); if($bare!='init') hook_register($name,$bare); } }
}
$configs=[]; foreach($fields as $field) $configs[$field]=$$field; $configs['iteminfo']=$iteminfo;
$results=[];
foreach(json_decode(file_get_contents(__DIR__.'/cases.json'),true) as $case) {
 $pa=$case['pa']; $pd=$case['pd']; $active=$case['active']; $log=''; $fn='weapon\\\\'.$case['fn'];
 $result=$fn($pa,$pd,$active); $results[]=[$result,$pa,$pd,$log];
}
$scalars=[]; foreach(json_decode(file_get_contents(__DIR__.'/scalar.json'),true) as $case) { $v=$case['value']; $fn='wep_b\\\\'.$case['fn']; $r=$fn($v); $scalars[]=[$r,$v]; }
$dual=[]; foreach(json_decode(file_get_contents(__DIR__.'/dual.json'),true) as $case) { $args=$case['args']; $fn='dualwep\\\\'.$case['fn']; if (in_array($case['fn'],['check_w2_valid','get_dualwep_imp_kind_tier'])) $r=$fn(...$args); elseif($case['fn']=='get_sec_attack_method') $r=$fn($args[0]); elseif($case['fn']=='get_other_attack_method') $r=$fn($args[0],$args[1]); else $r=$fn($args[0],$args[1],$args[2],$args[3]); $dual[]=$r; }
echo json_encode(['configs'=>$configs,'results'=>$results,'scalars'=>$scalars,'dual'=>$dual],JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);
`;
    const file = path.join(root, 'oracle.php');
    await writeFile(file, source);
    const oracle = spawnSync(executable, ['-d', 'display_errors=stderr', file], { encoding: 'utf8', windowsHide: true, timeout: 20_000 });
    assert.equal(oracle.status, 0, oracle.stderr);
    assert.equal(oracle.stderr, '');
    const expected = JSON.parse(oracle.stdout);
    const session = await createUnitSession();
    const configs = Object.fromEntries(fields.map(field => [field, session.state('weapon')[field]]));
    configs.iteminfo = session.state('itemmain').iteminfo;
    assert.deepEqual(configs, expected.configs);
    const inputs = cases();
    for (let index = 0; index < inputs.length; index++) {
      const { fn, pa, pd, active } = inputs[index];
      session.state('logger').log = '';
      const result = await session.call('weapon', fn, pa, pd, active);
      assert.deepEqual(JSON.parse(JSON.stringify([result, pa, pd, session.state('logger').log])), expected.results[index], `Case ${index}: ${fn} (${pa.wepk}, active=${active})`);
    }
    for (const [index, input] of scalarCases().entries()) {
      const slot = { value: input.value };
      assert.deepEqual([await session.call('wep_b', input.fn, slot), slot.value], expected.scalars[index]);
    }
    for (const [index, input] of dualCases().entries()) {
      assert.deepEqual(await session.call('dualwep', input.fn, ...input.args), expected.dual[index], `Dual case ${index}: ${input.fn}`);
    }
    t.diagnostic(`Compared ${inputs.length + scalarCases().length + dualCases().length} branches with real source and hook dispatch.`);
  } finally {
    assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep));
    await rm(root, { recursive: true, force: true });
  }
});
