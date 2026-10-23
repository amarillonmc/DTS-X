import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { battleModule } from '../native/gameplay/battle.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const sources = ['include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', 'include/modules/modules.func.php', ...['main.php', 'battle.php', 'battle_wrapper.php', 'battleresult.htm'].map(file => `include/modules/base/battle/${file}`)];
const resultHtml = await readFile(path.join(project, 'engine/include/modules/base/battle/battleresult.htm'), 'utf8');
const player = (pid, name, damage = 10) => ({ pid, name, hp: 100, type: 0, damage, action: '', battlelog: 'old log', nested: { original: true } });

// Explicit test dependencies observe the real battle orchestration. They are
// not implementations of player storage, attack damage, corpse or templates.
async function nativeBattle(input, serviceChanges = {}) {
  const trace = [];
  let output = input.buffer ?? '';
  const definitions = [
    { name: 'sys', state: { now: 12345 }, functions: { async addchat(ctx, ...args) { trace.push(['chat', ...args]); } } },
    { name: 'logger', state: { log: '' }, functions: { async logsave(ctx, ...args) { trace.push(['logsave', ...args]); } } },
    { name: 'player', state: { action: '', main: '', cmd: 'previous' }, functions: {
      async player_save(ctx, player) { trace.push(['save', structuredClone(player)]); },
      async load_playerdata(ctx, player) { trace.push(['load', structuredClone(player)]); ctx.state().action = player.action; },
    } },
    { name: 'enemy', functions: {} },
    { name: 'metman', state: { battle_title: '' }, functions: {
      async metman_load_playerdata(ctx, player) { trace.push(['enemy', structuredClone(player)]); },
      async init_battle(ctx, value) { trace.push(['init_battle', value]); },
    } },
    { name: 'corpse', functions: { async findcorpse(ctx, player) { trace.push(['corpse', structuredClone(player)]); } } },
    { name: 'input', state: { message: input.message ?? '' } },
    battleModule,
    { name: 'fixture_battle', dependencies: ['battle'], functions: {
      async attack_wrapper(ctx, pa, pd, active) {
        trace.push(['attack', pa.pid, pd.pid, active, pa.is_counter ?? null, pa.user_commanded ?? null, pd.user_commanded ?? null]);
        pd.hp -= pa.damage;
        pd.battlelog += `damage:${pa.damage};`;
        pa.physical_dmg_dealt = pa.damage;
        if (input.mutual) pa.hp = 0;
      },
      async check_can_counter(ctx, pa, pd, active) {
        trace.push(['counter_check', pa.pid, pd.pid, active, pa.is_counter ?? null]);
        if (input.outOfRange !== undefined) pa.out_of_range = input.outOfRange;
        return input.canCounter === false ? 0 : await ctx.next(pa, pd, active);
      },
      async assault_end(ctx, pa, pd, active) { trace.push(['assault_end', pa.pid, pd.pid, active]); await ctx.next(pa, pd, active); },
    } },
  ];
  if (input.club) definitions.push({ name: 'clubbase' });
  const services = {
    templates: { names: { MOD_METMAN_MEETMAN: 'meetman-template', MOD_BATTLE_BATTLERESULT: 'battle-template', MOD_CLUBBASE_NPCSKILLPAGE: 'club-template' }, async render(name, scope) {
      trace.push(['render', name]);
      assert.equal(scope.edata.pid, input.active ? input.pd.pid : input.pa.pid);
      return name === 'battle-template' ? resultHtml : '<i>fixture club output</i>';
    } },
    output: { async take() { const content = output; output = ''; return content; }, async write(content) { output += content; } },
    ...serviceChanges,
  };
  const session = await new ModuleRegistry(definitions).createSession({ services });
  const pa = structuredClone(input.pa), pd = structuredClone(input.pd);
  await session.call('battle', input.entry ?? 'battle_wrapper', pa, pd, input.active);
  return { pa, pd, trace, log: session.state('logger').log, cmd: session.state('player').cmd, main: session.state('player').main, action: session.state('player').action, title: session.state('metman').battle_title, originalEnemy: session.state('battle').o_edata, output };
}

const phpFixture = String.raw`<?php
namespace sys { function addchat(...$args) { $GLOBALS['trace'][]=array_merge(array('chat'),$args); } }
namespace logger { function logsave(...$args) { $GLOBALS['trace'][]=array_merge(array('logsave'),$args); } }
namespace player {
    function player_save(&$player) { $GLOBALS['trace'][]=array('save',$player); }
    function load_playerdata($player) { $GLOBALS['trace'][]=array('load',$player); $GLOBALS['action']=$player['action']; }
}
namespace metman {
    function metman_load_playerdata($player) { $GLOBALS['trace'][]=array('enemy',$player); }
    function init_battle($value) { $GLOBALS['trace'][]=array('init_battle',$value); }
}
namespace corpse { function findcorpse(&$player) { $GLOBALS['trace'][]=array('corpse',$player); } }
namespace fixture_battle {
    function attack_wrapper(&$pa,&$pd,$active) {
        if (eval(__MAGIC__)) return $___RET_VALUE;
        global $trace,$input;
        $trace[]=array('attack',$pa['pid'],$pd['pid'],$active,$pa['is_counter']??null,$pa['user_commanded']??null,$pd['user_commanded']??null);
        $pd['hp']-=$pa['damage']; $pd['battlelog'].='damage:'.$pa['damage'].';'; $pa['physical_dmg_dealt']=$pa['damage'];
        if(!empty($input['mutual'])) $pa['hp']=0;
    }
    function check_can_counter(&$pa,&$pd,$active) {
        if (eval(__MAGIC__)) return $___RET_VALUE;
        global $trace,$input;
        $trace[]=array('counter_check',$pa['pid'],$pd['pid'],$active,$pa['is_counter']??null);
        if(array_key_exists('outOfRange',$input)) $pa['out_of_range']=$input['outOfRange'];
        return isset($input['canCounter'])&&!$input['canCounter']?0:$chprocess($pa,$pd,$active);
    }
    function assault_end(&$pa,&$pd,$active) {
        if (eval(__MAGIC__)) return $___RET_VALUE;
        $GLOBALS['trace'][]=array('assault_end',$pa['pid'],$pd['pid'],$active); $chprocess($pa,$pd,$active);
    }
}
namespace {
    define('IN_GAME',true); define('IN_MODULEMNG',true); define('MOD_INPUT',true); define('GAME_ROOT',__DIR__.'/engine/');
    require GAME_ROOT.'include/modules/modules.func.php';
    foreach(array('main','battle','battle_wrapper') as $source) require GAME_ROOT.'include/modules/base/battle/'.$source.'.php';
    define('IMPORT_MODULE_SYS_GLOBALS','global $now;'); define('IMPORT_MODULE_LOGGER_GLOBALS','global $log;');
    define('IMPORT_MODULE_PLAYER_GLOBALS','global $cmd,$main,$action;'); define('IMPORT_MODULE_METMAN_GLOBALS','global $battle_title;');
    define('IMPORT_MODULE_BATTLE_GLOBALS','global $o_edata;');
    define('MOD_METMAN_MEETMAN','meetman-template'); define('MOD_BATTLE_BATTLERESULT','battle-template'); define('MOD_CLUBBASE_NPCSKILLPAGE','club-template');
    function template($name) {
        $GLOBALS['trace'][]=array('render',$name);
        return $name==='battle-template'?GAME_ROOT.'include/modules/base/battle/battleresult.htm':__DIR__.'/club.htm';
    }
    $input=json_decode(stream_get_contents(STDIN),true); $trace=array();
    $now=12345; $log=''; $cmd='previous'; $main=''; $action=''; $battle_title='';
    $___LOCAL_INPUT__VARS__message=$input['message']??'';
    if(!empty($input['club'])) define('MOD_CLUBBASE',true);
    foreach(get_defined_functions()['user'] as $function) if(strpos($function,'battle\\')===0&&$function!=='battle\\init') hook_register('battle',substr($function,7));
    foreach(array('attack_wrapper','check_can_counter','assault_end') as $function) hook_register('fixture_battle',$function);
    $pa=$input['pa']; $pd=$input['pd']; $active=$input['active']; $entry=$input['entry']??'battle_wrapper';
    ob_start(); echo $input['buffer']??'';
    $function='battle\\'.$entry; $function($pa,$pd,$active);
    $output=ob_get_clean();
    echo json_encode(array('pa'=>$pa,'pd'=>$pd,'trace'=>$trace,'log'=>$log,'cmd'=>$cmd,'main'=>$main,'action'=>$action,'title'=>$battle_title,'originalEnemy'=>$o_edata,'output'=>$output),JSON_UNESCAPED_UNICODE);
}
`;

test('native battle orchestration agrees with real PHP for counter, deaths, logs and rendering', async t => {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', timeout: 10_000, windowsHide: true });
  if (version.error?.code === 'ENOENT') { t.skip('Development-only PHP 7.4 oracle unavailable; set DTS_REFERENCE_PHP.'); return; }
  assert.equal(version.status, 0, version.error?.message || version.stderr);
  if (version.stdout.trim() !== '7.4') { t.skip(`Expected PHP 7.4 oracle; found ${version.stdout.trim()}.`); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'native-battle-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  for (const source of sources) { const target = path.join(root, 'engine', source); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', source), target); }
  await mkdir(path.join(root, 'engine/include/modulemng'), { recursive: true });
  await copyFile(path.join(project, 'engine/include/modulemng/modulemng.config.sample.php'), path.join(root, 'engine/include/modulemng/modulemng.config.php'));
  const fixture = path.join(root, 'oracle.php'); await writeFile(fixture, phpFixture); await writeFile(path.join(root, 'club.htm'), '<i>fixture club output</i>');
  const cases = [
    { label: 'successful counter' },
    { label: 'non-counter escape', canCounter: false },
    { label: 'out-of-range escape (isset zero)', canCounter: false, outOfRange: 0 },
    { label: 'null range flag', canCounter: false, outOfRange: null },
    { label: 'attacker kills enemy', attackerDamage: 100 },
    { label: 'counter kills attacker', defenderDamage: 100 },
    { label: 'both dead skips counter', attackerDamage: 100, mutual: true },
    { label: 'shouted message persists to enemy log', message: '<b>决斗！</b>' },
    { label: 'NPC has no private battle log', defenderType: 1 },
    { label: 'existing action not replaced when player dies', defenderDamage: 100, defenderAction: 'enemy7' },
    { label: 'buffered hook output and club page', buffer: '<p>earlier hook output</p>', club: true },
    { label: 'assault leaves temporary fields for finish hooks', entry: 'assault' },
    { label: 'battle clears temporary fields', entry: 'battle' },
  ];
  for (const scenario of cases) for (const active of [0, 1]) {
    const input = { ...scenario, active, pa: { ...player(1, '甲', scenario.attackerDamage ?? 10) }, pd: { ...player(2, '乙', scenario.defenderDamage ?? 10), type: scenario.defenderType ?? 0, action: scenario.defenderAction ?? '' } };
    const result = spawnSync(executable, ['-d', 'display_errors=stderr', fixture], { input: JSON.stringify(input), encoding: 'utf8', windowsHide: true, timeout: 20_000 });
    assert.equal(result.status, 0, result.error?.message || result.stderr);
    assert.equal(result.stderr, '', result.stderr);
    assert.deepEqual(await nativeBattle(input), JSON.parse(result.stdout), `${scenario.label}; active=${active}`);
  }
  t.diagnostic(`Compared ${cases.length * 2} scenarios, both active directions, trace order, referenced state, original battle-result HTML and output buffering.`);
});

test('native battle requires a real renderer and output buffer service', async () => {
  const input = { active: 1, pa: player(1, '甲'), pd: player(2, '乙') };
  await assert.rejects(nativeBattle(input, { templates: { names: { MOD_METMAN_MEETMAN: 'meetman-template', MOD_BATTLE_BATTLERESULT: 'battle-template' } } }), /requires templates.render/);
  await assert.rejects(nativeBattle(input, { templates: {} }), /requires template binding/);
  await assert.rejects(nativeBattle(input, { output: {} }), /requires output.take/);
  await assert.rejects(nativeBattle({ ...input, club: true }, { output: { take: async () => '' } }), /requires output.write/);
});

test('battle log markers and isset range behavior retain original replacement rules', async () => {
  const definitions = battleModule.functions;
  const context = { state() { return { log: '' }; }, call(_module, name, ...args) { return definitions[name](context, ...args); } };
  assert.equal(await definitions.battlelog_parser(context, { name: '甲' }, { name: '<:pa_name:>' }, 1, '<:pa_name:>→<:pd_name:>'), '你→你');
  assert.equal(await definitions.battlelog_parser(context, { name: '甲' }, { name: '乙' }, 0, '<:pa_name:>→<:pd_name:>'), '甲→你');
});
