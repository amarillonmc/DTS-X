import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleRegistry, reference } from '../native/modules/registry.mjs';
import { createPhp74Random } from '../native/random.mjs';
import { text } from '../native/gameplay/numbers.mjs';
import { armorModule, armorArtModule } from '../native/gameplay/base-extra/armor.mjs';
import { poseModule, tacticModule } from '../native/gameplay/base-extra/pose-tactic.mjs';
import { restModule } from '../native/gameplay/base-extra/rest.mjs';
import { woundModule } from '../native/gameplay/base-extra/wound.mjs';
import { weatherModule } from '../native/gameplay/base-extra/weather.mjs';
import { skillbaseModule, createSkillCatalog } from '../native/gameplay/skills.mjs';

const project = fileURLToPath(new URL('../', import.meta.url)), modules = [armorModule, armorArtModule, restModule, poseModule, tacticModule, woundModule, weatherModule];
const clone = value => structuredClone(value);
const player = { pid: '1', name: '本人', type: '0', def: '50', typeinfo: ['学生', 'NPC'], pose: '1', tactic: '2', hp: '50', mhp: '100', sp: '40', msp: '100', state: '0', endtime: 1000, inf: '', pls: '11', equip_list: ['wep'], battle_equip_list: ['wep'], arb: '内衣', arbk: 'DN', arbe: 0, arbs: '∞', arbsk: '', arh: '帽子', arhk: 'DH', arhe: '5', arhs: '3', arhsk: '', ara: '', arak: '', arae: 0, aras: 0, arask: '', arf: '', arfk: '', arfe: 0, arfs: 0, arfsk: '', art: '', artk: '', arte: 0, arts: 0, artsk: '' };
const fighter = values => ({ name: '对手', pose: '1', tactic: '2', active_words: '50', def_words: '25', armorbreaklog: '旧损坏', battlelog: '旧战报', ...player, name: '对手', ...values });
const item = (kind = 'DB', values = {}) => ({ itm: '新装备', itmk: kind, itme: '30', itms: '8', itmsk: 'x', ...values });
const op = (module, name, ...args) => [module, name, ...args];
function scenarios() {
  const result = [];
  const add = (label, calls, extra = {}) => result.push({ label, seed: 7, calls, player: {}, sys: {}, pa: fighter({ name: '攻击者' }), pd: fighter(), item: item(), ...extra });
  for (const pose of [0, 1, 2, 3, 4, 5]) for (const tactic of [0, 1, 2, 3, 4]) add(`pose/tactic ${pose}/${tactic}`, [
    op('pose', 'calculate_real_trap_obbs'), op('pose', 'calculate_meetman_rate', 'search'), op('pose', 'calculate_itemfind_obbs'), op('pose', 'calculate_findman_obbs', '@pd'), op('pose', 'calculate_hide_obbs', '@pd'),
    op('pose', 'calculate_active_obbs', '@pa', '@pd'), op('pose', 'get_att_multiplier', '@pa', '@pd', 1), op('pose', 'get_def_multiplier', '@pa', '@pd', 1), op('pose', 'check_can_counter', '@pa', '@pd', 0),
    op('tactic', 'calculate_counter_rate_base', '@pa', '@pd', 0), op('tactic', 'get_trap_damage'), op('tactic', 'get_trap_escape_rate'), op('pose', 'can_continue_post_discover_player', false), op('pose', 'can_continue_post_discover_player', true), op('pose', 'init_battle', 1),
    op('pose', 'get_edible_hpup', '@item'), op('pose', 'get_edible_spup', '@item'), op('rest', 'calculate_rest_upsp', 45), op('rest', 'calculate_rest_uphp', 45), op('rest', 'get_wound_recover_time'),
  ], { player: { pose: String(pose), tactic: String(tactic) }, pa: fighter({ pose: String(pose), tactic: String(tactic) }), pd: fighter({ pose: String(5 - pose), tactic: String(4 - tactic) }) });
  for (const value of [-1, 0, '1', '2tail', 2, 3, 4, 5, 6, 'bad', 1.9]) add(`change ${value}`, [op('pose', 'pose_change', value), op('tactic', 'tactic_change', value)]);
  for (const command of ['pose3', 'pose10', 'pose', 'tac4', 'tac1', 'other']) for (const mode of ['special', 'command']) add(`act ${mode}/${command}`, [op('pose', 'act')], { sys: { mode, command } });
  for (const seed of [0, 1, 2, 7, 9, 42, 99]) add(`trap protection ${seed}`, [op('tactic', 'get_trap_damage')], { seed });
  for (const gamestate of [20, 40]) for (const tactic of [3, 4]) for (const type of ['0', '1']) add(`area avoidance ${gamestate}/${tactic}/${type}`, [op('tactic', 'check_pc_avoid_killarea', { tactic, type, pid: '7', pls: '11' }, 1234), op('tactic', 'post_pc_avoid_killarea', { tactic, type, pid: '7', pls: '11' }, 1234)], { sys: { gamestate } });
  for (const which of ['arb', 'arh', 'ara', 'arf', 'art', 'none']) for (const active of [0, 1]) for (const durability of ['∞', 0, '0', '1', '5']) add(`armor damage ${which}/${active}/${durability} (${typeof durability})`, [op('armor', 'armor_hurt', '@pa', '@pd', active, which, 3)], { pd: fighter({ [which]: '护具', [which + 'e']: '4', [which + 's']: durability }) });
  add('infinite effect depletion and battle log', [op('armor', 'assault_prepare', '@pa', '@pd', 1), op('armor', 'armor_hurt', '@pa', '@pd', 1, 'arb', 20), op('armor', 'assault_finish', '@pa', '@pd', 1)], { pd: fighter({ arb: '防弹衣', arbk: 'DB', arbe: '9', arbs: '∞' }) });
  add('reverse battle log', [op('armor', 'assault_prepare', '@pa', '@pd', 0), op('armor', 'assault_finish', '@pa', '@pd', 0)]);
  add('zero defense cannot absorb injury', [op('armor', 'armor_hurt', '@pa', '@pd', 1, 'arb', 3)], { pd: fighter({ arbe: 0, arbs: '5' }) });
  add('external defense and wound absorption', [op('armor', 'get_external_def_multiplier', '@pa', '@pd', 1), op('armor', 'get_external_def', '@pa', '@pd', 1), op('armor', 'get_def_base', '@pa', '@pd', 1), op('armor', 'apply_weapon_inf', '@pa', '@pd', 1)], { pa: fighter({ attack_wounded_b: 3, attack_wounded_h: 4, attack_wounded_a: 2, attack_wounded_f: 1 }), pd: fighter({ arbe: '10', arbs: '2', arhe: '4', arhs: '∞', arae: 5, aras: 10, arfe: 0 }) });
  for (const kind of ['DB', 'DBX', 'DH', 'DA', 'DF', 'DN', 'D', 'A', 'Ag', 'Al', 'Y']) add(`equip ${kind}`, [op('itemmain', 'itemuse', '@item')], { item: item(kind) });
  add('accessory swaps existing slot', [op('itemmain', 'itemuse', '@item')], { item: item('Ag'), player: { art: '旧饰物', artk: 'A', arte: 2, arts: '∞', artsk: 'z' } });
  add('explicit body slot swaps underwear', [op('armor', 'use_armor', '@item', 'arb')]);
  add('invalid explicit armor slot', [op('armor', 'use_armor', '@item', 'art')]);
  add('empty durability ignores existing kind', [op('armor', 'use_armor', '@item', 'arh')], { player: { arhs: '0' } });
  add('armor min returns original string on tie', [op('armor', 'armor_hurt', '@pa', '@pd', 1, 'arh', 3)]);
  for (const state of [0, 1, 2, 3]) for (const time of [-10, 0, 60, 90, 91, 600]) add(`rest ${state}/${time}`, [op('rest', 'rest', 'rest')], { player: { state, endtime: 1000, inf: 'bh', pose: 1 }, sys: { now: 1000 + time } });
  add('healing pose improves rest and recovery cutoff', [op('rest', 'rest', 'rest')], { player: { state: '3', inf: 'bhaf', pose: '5' }, sys: { now: 1061 } });
  add('full resources retain database string types', [op('rest', 'rest', 'rest')], { player: { state: '3', hp: '100', sp: '100', inf: '' } });
  add('timer preserves existing fields', [op('rest', 'init_rest_timing')], { sys: { uip: { timing: { existing: true }, retained: 1 } } });
  for (const command of ['rest1', 'rest2', 'rest3', 'other']) for (const pls of ['11', '7']) add(`start rest ${command}/${pls}`, [op('rest', 'act')], { sys: { mode: 'command', command }, player: { pls } });
  for (const command of ['rest', 'back']) add(`rest action ${command}`, [op('rest', 'act')], { sys: { mode: 'rest', command }, player: { state: '3' } });
  for (const mark of ['b', 'h', 'a', 'f', 'u']) add(`injury add/remove ${mark}`, [op('wound', 'get_inf', mark, '@pa'), op('wound', 'get_inf', mark, '@pa'), op('wound', 'heal_inf', mark, '@pa'), op('wound', 'get_inf', mark), op('wound', 'heal_inf', mark)], { pa: fighter({ inf: 'bhb' }), player: { inf: 'h' } });
  add('empty explicit injury player aliases self', [op('wound', 'get_inf', 'a', '@pa')], { pa: {}, player: { inf: 'b' } });
  for (const kind of ['N', 'P', 'K', 'G', 'C', 'D', 'F', 'J', 'B']) for (const seed of [0, 1, 2, 3, 7, 13, 21, 42, 99]) for (const active of [0, 1]) add(`injury strike ${kind}/${seed}/${active}`, [op('wound', 'assault_prepare', '@pa', '@pd', active), op('wound', 'calculate_inf_rate', '@pa', '@pd', active), op('wound', 'post_weapon_strike_events', '@pa', '@pd', active, 1), op('wound', 'strike_finish', '@pa', '@pd', active), op('wound', 'assault_finish', '@pa', '@pd', active)], { seed, pa: fighter({ wep_kind: kind, inf: '', name: '本人' }), pd: fighter({ inf: 'b', arb: '胸甲', arbk: 'DB', arbe: '4', arbs: '1', arhe: '0' }) });
  add('miss consumes no injury random', [op('wound', 'post_weapon_strike_events', '@pa', '@pd', 1, 0)]);
  add('injury increments and cleans every pending location', [op('wound', 'weapon_wound_success', '@pa', '@pd', 1, 'a'), op('wound', 'weapon_wound_success', '@pa', '@pd', 1, 'a'), op('wound', 'apply_inf_main', '@pa', '@pd', 1)], { pa: fighter({ attack_wounded_b: 0, attack_wounded_h: -1, attack_wounded_a: '0', attack_wounded_f: '2' }) });
  for (const sp of ['0', '50', '51', '100']) for (const mark of ['', 'b', 'u', 'h', '0']) add(`bandage ${sp}/${mark}`, [op('wound', 'chginf', mark)], { player: { inf: 'bu', sp } });
  for (const command of ['inf', 'infb', 'infbh', 'other']) add(`injury command ${command}`, [op('wound', 'act')], { sys: { mode: 'special', command }, player: { inf: 'b', sp: '100' } });
  const branchSeeds = [0, 1, 10, 11, 50, 99].map(dice => { for (let seed = 0; seed < 2000; seed++) if (createPhp74Random(seed).rand(0, 99) === dice) return seed; throw Error('Missing deterministic branch seed'); });
  for (let weather = 0; weather < 20; weather++) {
    add(`weather coefficients and fog ${weather}`, [op('weather', 'calculate_weather_itemfind_obbs'), op('weather', 'calculate_itemfind_obbs'), op('weather', 'calculate_weather_meetman_obbs', '@pd'), op('weather', 'calculate_findman_obbs', '@pd'), op('weather', 'calculate_weather_active_obbs', '@pa', '@pd'), op('weather', 'calculate_active_obbs', '@pa', '@pd'), op('weather', 'calculate_weather_attack_modifier', '@pa', '@pd', 1), op('weather', 'get_att_multiplier', '@pa', '@pd', 1), op('weather', 'calculate_weather_defend_modifier', '@pa', '@pd', 1), op('weather', 'get_def_multiplier', '@pa', '@pd', 1), op('weather', 'get_hitrate_base', '@pa', '@pd', 1), op('weather', 'check_fog'), op('weather', 'init_battle', 0), op('weather', 'init_battle', 1), op('weather', 'use_radar')], { sys: { weather } });
    for (const seed of branchSeeds) add(`weather environment ${weather}/${seed}`, [op('weather', 'move_to_area', '11'), op('weather', 'search_area'), op('weather', 'pre_act')], { seed, sys: { weather }, player: { hp: '100', mhp: '100' } });
  }
  for (const weather of [13, 14, 15, 16, 18, 19]) for (const seed of branchSeeds) add(`weather status/cap boundary ${weather}/${seed}`, [op('weather', 'search_area')], { seed, sys: { weather }, player: { hp: 1, mhp: 1, def: 1, inf: 'ewu', state: 3 } });
  for (const state of ['0', '1']) for (const seed of branchSeeds) add(`heater sleep ${state}/${seed}`, [op('weather', 'pre_act')], { seed, sys: { weather: 19 }, player: { state } });
  for (const safe of [[], [11], [1, 7, 11]]) for (const hack of [0, 1]) add(`tornado ${safe.length}/${hack}`, [op('weather', 'apply_tornado_weather_effect')], { safe, sys: { weather: 11, hack } });
  add('hail source does not import maximum health', [op('weather', 'calculate_hailstorm_weather_damage'), op('weather', 'deal_hailstorm_weather_damage')], { player: { hp: 10000, mhp: 10000 } });
  for (const weather of [0, 13, 14, 19]) for (const attributes of ['', '0', '5', '18', '19', '20', '-1', '95', '96', '97', '98', '99', '^wid18']) add(`weather control ${weather}/${attributes}`, [op('weather', 'wthchange', '控制器', attributes)], { sys: { weather } });
  for (const weather of [0, 9, 13, 14, 17]) add(`area/reset weather ${weather}`, [op('weather', 'add_once_area', 1000), op('weather', 'rs_game', 0), op('weather', 'rs_game', 2), op('weather', 'rs_game', 63)], { sys: { weather } });
  for (const itms of [1, '2', '∞']) add(`weather item consumption ${itms}`, [op('itemmain', 'itemuse', '@item')], { item: item('EW', { itms, itmsk: '99' }) });
  for (const weather of [0, 17]) for (const hp of [-10, 0, '1', '98', '100']) for (const active of [0, 1]) add(`aurora life ${weather}/${hp}/${active}`, [op('weather', 'weather_aurora_revive_num', '@pd'), op('weather', 'weather_aurora_revive_process', '@pa', '@pd'), op('weather', 'check_can_counter', '@pd', '@pa', active), op('weather', 'player_kill_enemy', '@pa', '@pd', active)], { sys: { weather }, pa: fighter({ name: '本人', hp: '95', aurora_revive: '8' }), pd: fighter({ hp, aurora_revive: '7' }) });
  for (const weather of [0, 17]) for (const key of ['aurora', 'other']) add(`revival hooks ${weather}/${key}`, [op('weather', 'set_revive_sequence', '@pa', '@pd'), op('weather', 'revive_check', '@pa', '@pd', key), op('weather', 'post_revive_events', '@pa', '@pd', key)], { sys: { weather }, pd: fighter({ hp: 0, aurora_revive: '8', revive_sequence: { 5: 'existing' } }) });
  for (const seed of branchSeeds) for (const type of ['0', '1']) add(`aurora random ${seed}/${type}`, [op('weather', 'weather_aurora_check', '@pa', '@pd', 1), op('weather', 'attack_finish', '@pa', '@pd', 1)], { seed, sys: { weather: 17 }, pa: fighter({ name: '本人', type }), pd: fighter({ type }) });
  for (const [news, a, b, c, e] of [['wthchange', '甲', 19, '控制器', ''], ['wthfail', '甲', 14, '控制器', ''], ['syswthchg', 17, '', '', ''], ['aurora_revival', '甲', '', '', ''], ['death17', '甲', 0, '', ''], ['death17', '甲', 1, '', '遗言'], ['addarea', [1, 2], 14, '', ''], ['inf', '甲', '乙', 'b', ''], ['inf', '甲', '乙', 'u', ''], ['other', '', '', '', '']]) add(`weather and wound news ${news}/${e}`, [op('weather', 'parse_news', 7, news, '01', '02', '03', a, b, c, '', e, [])]);
  return result;
}
const baseValues = { calculate_real_trap_obbs: 5, calculate_meetman_rate: 30, calculate_itemfind_obbs: 60, calculate_findman_obbs: 70, calculate_hide_obbs: 5, calculate_active_obbs: 50, get_att_multiplier: [2, 0.5], get_def_multiplier: [1.1], check_can_counter: 1, calculate_counter_rate_base: 20, get_trap_damage: 31, get_trap_escape_rate: 10, get_edible_hpup: 12.5, get_edible_spup: 17, can_continue_post_discover_player: false, get_def_base: 25, check_pc_avoid_killarea: true, get_hitrate_base: 75, move_to_area: 'moved', search_area: 'searched', revive_check: false, parse_news: '<li>base</li>' };
const baseFunctions = {
  sys: ['act', 'pre_act', 'rs_game', 'parse_news'], metman: ['init_battle', 'calculate_meetman_rate', 'calculate_findman_obbs', 'calculate_hide_obbs', 'can_continue_post_discover_player'],
  itemmain: ['itemuse', 'calculate_itemfind_obbs'], trap: ['calculate_real_trap_obbs', 'get_trap_damage', 'get_trap_escape_rate'],
  weapon: ['get_att_multiplier', 'get_def_multiplier', 'get_def_base', 'calculate_counter_rate_base', 'get_hitrate_base', 'post_weapon_strike_events'], battle: ['check_can_counter', 'assault_prepare', 'assault_finish', 'strike_finish'],
  attack: ['attack_finish', 'player_kill_enemy'], explore: ['move_to_area', 'search_area'], radar: ['use_radar'], map: ['add_once_area'],
  enemy: ['calculate_active_obbs'], edible: ['get_edible_hpup', 'get_edible_spup'], player: ['check_pc_avoid_killarea', 'post_pc_avoid_killarea', 'set_revive_sequence', 'revive_check', 'post_revive_events'],
};
function states(input) {
  return { sys: { mode: 'command', command: '', now: 1100, gamestate: 20, weather: 0, hack: 0, hour: '11', min: '22', sec: '33', uip: {}, ...clone(input.sys) }, player: { ...clone(player), ...clone(input.player), sdata: {} }, logger: { log: '' }, metman: { tdata: {}, w_pose: '4', w_tactic: '3', w_inf: 'bh' }, itemmain: { iteminfo: { DB: '既有装备名', X: '原条目' } }, wound: woundModule.state(), map: { plsinfo: { 0: '端点', 1: '森林', 7: '学校', 11: '医院' } } };
}
function boundaries(input, trace) {
  const state = states(input), names = [...new Set([...Object.keys(state), ...Object.keys(baseFunctions), 'attack', 'skillbase'])].filter(name => !modules.some(module => module.name === name));
  return names.map(name => ({ name, state: () => state[name] ?? {}, ...(name === 'player' ? { initialize(ctx) { const player = ctx.state(); for (const key of Object.keys(player)) if (key !== 'sdata') Object.defineProperty(player.sdata, key, { enumerable: true, get: () => player[key], set: value => { player[key] = value; } }); } } : {}), functions: {
    ...Object.fromEntries((baseFunctions[name] ?? []).map(fn => [fn, async (ctx, ...args) => { await Promise.resolve(); trace.push([fn, ...clone(args)]); if (fn === 'init_battle') ctx.state('metman').tdata = { marker: 'base' }; return clone(baseValues[fn] ?? null); }])),
    ...(name === 'attack' ? { async add_format(ctx, add, original, mode) { return `[${text(add)}+${text(original)}:${text(mode)}]`; } } : {}),
    ...(name === 'logger' ? { async logsave(ctx, ...args) { trace.push(['logsave', ...args]); } } : {}),
    ...(name === 'sys' ? { async addnews(ctx, ...args) { trace.push(['news', ...args]); }, async save_gameinfo() { trace.push(['save_gameinfo']); } } : {}),
    ...(name === 'player' ? { async update_sdata() { trace.push(['update_sdata']); }, async kill(ctx, pa, pd) { trace.push(['kill', clone(pa), clone(pd)]); pd.fixture_killed = true; } } : {}),
    ...(name === 'skillbase' ? Object.fromEntries(['skill_acquire', 'skill_lost'].map(fn => [fn, async (ctx, id, data) => { trace.push([fn, id, clone(data)]); if (data != null) data.fixture_skill = fn + ':' + text(id); }])) : {}),
    ...(name === 'map' ? { async get_safe_plslist(ctx, flag) { trace.push(['safe', flag]); return clone(input.safe ?? [1, 7, 11]); }, async get_all_plsno() { trace.push(['all-areas']); return [0, 1, 7, 11]; } } : {}),
    ...(name === 'itemmain' ? { async itms_reduce(ctx, item) { trace.push(['consume', clone(item)]); if (item.itms !== '∞') { item.itms = Number(item.itms) - 1; if (item.itms <= 0) Object.assign(item, { itm: '', itmk: '', itme: 0, itms: 0, itmsk: '' }); } } } : {}),
  } }));
}
async function actual(input) {
  const trace = [], random = createPhp74Random(input.seed), objects = { pa: clone(input.pa), pd: clone(input.pd), item: clone(input.item) };
  const registry = new ModuleRegistry([...boundaries(input, trace), ...modules]), session = await registry.createSession({ services: { random } });
  const returns = [];
  for (const [namespace, name, ...values] of input.calls) { const args = values.map(value => typeof value === 'string' && value[0] === '@' ? objects[value.slice(1)] : clone(value)); returns.push(await session.call(namespace, name, ...args) ?? null); }
  return JSON.parse(JSON.stringify({ returns, objects, states: Object.fromEntries(Object.keys(states(input)).map(name => [name, session.state(name)])), trace, next: random.rand() }));
}
const oracle = String.raw`<?php
namespace {
 define('IN_GAME',true);define('GAME_ROOT',__DIR__.'/engine/');error_reporting(E_ALL & ~E_NOTICE);ini_set('display_errors','stderr');
 require GAME_ROOT.'include/global.func.php';require GAME_ROOT.'include/modules/modules.func.php';
 $input=json_decode(stream_get_contents(STDIN),true);$baseValues=$input['baseValues'];
 foreach($input['baseFunctions'] as $module=>$functions)foreach($functions as $function){
  $reference=in_array($function,['itemuse','calculate_findman_obbs','calculate_hide_obbs','get_edible_hpup','get_edible_spup']);
  $pair=in_array($function,['calculate_active_obbs','get_att_multiplier','get_def_multiplier','get_def_base','calculate_counter_rate_base','check_can_counter','assault_prepare','assault_finish','get_hitrate_base','post_weapon_strike_events','strike_finish','attack_finish','player_kill_enemy','set_revive_sequence','revive_check','post_revive_events']);
  $params=$pair?'&$a,&$b,$active=null,$hit=null':($reference?'&$a':'...$args');
  $args=$pair?'func_get_args()':($reference?'[$a]':'$args');
  eval('namespace '.$module.' { function '.$function.'('.$params.'){if(eval(__MAGIC__))return $___RET_VALUE;$args='.$args.';$GLOBALS["trace"][]=array_merge(["'.$function.'"],$args);if("'.$function.'"==="init_battle"){eval(import_module("metman"));$tdata=["marker"=>"base"];}return $GLOBALS["baseValues"]["'.$function.'"]??null;} }');
 }
}
namespace attack { function add_format($add,$original,$mode){return '['.$add.'+'.$original.':'.$mode.']';} }
namespace logger { function logsave(...$args){$GLOBALS['trace'][]=array_merge(['logsave'],$args);} }
namespace sys { function addnews(...$args){$GLOBALS['trace'][]=array_merge(['news'],$args);}function save_gameinfo(){$GLOBALS['trace'][]=['save_gameinfo'];} }
namespace player { function update_sdata(){$GLOBALS['trace'][]=['update_sdata'];}function kill(&$pa,&$pd){$GLOBALS['trace'][]=['kill',$pa,$pd];$pd['fixture_killed']=true;} }
namespace skillbase { function skill_acquire($id,&$data){$GLOBALS['trace'][]=['skill_acquire',$id,is_array($data)&&!count($data)?(object)$data:$data];if($data!==null)$data['fixture_skill']='skill_acquire:'.$id;}function skill_lost($id,&$data){$GLOBALS['trace'][]=['skill_lost',$id,is_array($data)&&!count($data)?(object)$data:$data];if($data!==null)$data['fixture_skill']='skill_lost:'.$id;} }
namespace map { function get_safe_plslist($flag){$GLOBALS['trace'][]=['safe',$flag];return $GLOBALS['case']['safe']??[1,7,11];}function get_all_plsno(){$GLOBALS['trace'][]=['all-areas'];return [0,1,7,11];} }
namespace itemmain { function itms_reduce(&$item){$GLOBALS['trace'][]=['consume',json_decode(json_encode($item),true)];if($item['itms']!=='∞'){--$item['itms'];if($item['itms']<=0)$item=['itm'=>'','itmk'=>'','itme'=>0,'itms'=>0,'itmsk'=>''];}} }
namespace {
 $configs=[];foreach($input['modules'] as $module){require GAME_ROOT.'include/modules/base/'.$module.'/main.php';require GAME_ROOT.'include/modules/base/'.$module.'/config/'.$module.'.config.php';$configs[$module]=[];foreach($input['configKeys'][$module] as $key)$configs[$module][$key]=$$key;}
 function bind_state($module,$values){$imports='';foreach($values as $key=>$value){$global='___LOCAL_'.strtoupper($module).'__VARS__'.$key;$GLOBALS[$global]=$value;$imports.='global $'.$global.';$'.$key.'=&$'.$global.';';}define('MOD_'.strtoupper($module),true);define('IMPORT_MODULE_'.strtoupper($module).'_GLOBALS',$imports);}
 function reset_state($module,$values){foreach($values as $key=>$value)$GLOBALS['___LOCAL_'.strtoupper($module).'__VARS__'.$key]=$value;}
 foreach(array_merge($input['states'],$configs) as $module=>$values)bind_state($module,$values);
 foreach($input['order'] as $module)foreach(get_defined_functions()['user'] as $fn)if(strpos($fn,$module.'\\')===0&&$fn!==$module.'\\init')hook_register($module,substr($fn,strlen($module)+1));
 $out=[];foreach($input['cases'] as $case){$trace=[];foreach($case['states'] as $module=>$values)reset_state($module,$values);foreach($configs as $module=>$values)reset_state($module,$values);$sdata=&get_var_in_module('sdata','player');foreach($case['states']['player'] as $key=>$value)if($key!=='sdata')$sdata[$key]=&get_var_in_module($key,'player');foreach($input['modules'] as $module){$fn=$module.'\\init';$fn();}mt_srand($case['seed']);$objects=['pa'=>$case['pa'],'pd'=>$case['pd'],'item'=>$case['item']];$returns=[];
  foreach($case['calls'] as $entry){$fn=$entry[0].'\\'.$entry[1];$values=array_slice($entry,2);$args=[];foreach($values as &$value){if(is_string($value)&&substr($value,0,1)==='@')$args[]=&$objects[substr($value,1)];else $args[]=&$value;}unset($value);$returns[]=call_user_func_array($fn,$args);}
  $state=[];foreach($case['states'] as $module=>$values){$state[$module]=[];foreach($values as $key=>$value)$state[$module][$key]=get_var_in_module($key,$module);}
  $state['sys']['uip']=(object)$state['sys']['uip'];$state['metman']['tdata']=(object)$state['metman']['tdata'];
  $out[]=json_encode(['returns'=>$returns,'objects'=>$objects,'states'=>$state,'trace'=>$trace,'next'=>rand()],JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);
 }echo '['.implode(',',$out).']';
}`;

test('all seven base modules preserve source function lists, configurations and dependency declarations', async () => {
  for (const module of modules) {
    const directory = path.join(project, 'engine/include/modules/base', module.name), source = await readFile(path.join(directory, 'main.php'), 'utf8'), header = await readFile(path.join(directory, 'module.inc.php'), 'utf8');
    const names = [...source.matchAll(/^\s*function\s+(\w+)\s*\(/gm)].map(match => match[1]).filter(name => name !== 'init');
    assert.deepEqual(Object.keys(module.functions).sort(), names.sort(), module.name);
    for (const [key, field] of [['dependency', 'dependencies'], ['dependency_optional', 'optionalDependencies'], ['templatelist', 'templates']]) assert.deepEqual(module[field] ?? [], header.match(new RegExp('\\$___MODULE_' + key + " = '([^']*)'"))[1].split(' ').filter(Boolean));
    assert.ok(Object.values(module.functions).every(fn => fn.constructor.name === 'AsyncFunction'));
    const config = JSON.parse(await readFile(path.join(project, 'native/gameplay/base-extra', module.name + '-config.json'), 'utf8'));
    assert.equal(createHash('sha256').update(await readFile(path.join(project, config.source))).digest('hex'), config.sha256);
    assert.deepEqual(module.state(), config.values);
  }
});

test('wound propagates nullable player replacement and field aliases through real native skillbase', async () => {
  const definitions = [
    { name: 'sys', state: () => ({ gamestate: 20 }) }, { name: 'logger', state: () => ({ log: '' }) },
    { name: 'player', state: () => ({ pid: '1', inf: '', sdata: {} }), initialize(ctx) {
      const player = ctx.state(); for (const key of ['pid', 'inf']) Object.defineProperty(player.sdata, key, { enumerable: true, get: () => player[key], set: value => { player[key] = value; } });
      player.sdata.acquired_list = new Map(); player.sdata.parameter_list = new Map();
    }, functions: { async update_sdata() {} } }, skillbaseModule, woundModule,
  ];
  const session = await new ModuleRegistry(definitions).createSession({ services: { skills: createSkillCatalog(definitions) } });
  for (const initial of [null, {}]) {
    const holder = { player: initial }, slot = reference(holder, 'player');
    assert.equal(await session.call('wound', 'get_inf', 'b', slot), 1);
    assert.equal(holder.player.pid, '1'); assert.equal(holder.player.inf, 'b');
    assert.equal(session.state('skillbase').acquired_list.get(1), 1);
    assert.notEqual(holder.player.acquired_list, session.state('skillbase').acquired_list, 'Skill module records are independent from the player snapshot');
    holder.player.inf = 'ba'; assert.equal(session.state('player').inf, 'ba', 'Copied sdata fields retain explicit aliases');
    await session.call('wound', 'heal_inf', 'b', slot);
    assert.equal(holder.player.inf, 'a'); assert.equal(session.state('skillbase').acquired_list.get(1), 0);
    session.state('player').inf = '';
  }
});

test('native equipment, combat stance and rest combinations agree with unchanged PHP hooks', { timeout: 120_000 }, async t => {
  const php = process.env.DTS_REFERENCE_PHP || 'php', version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires PHP 7.4 development oracle.'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true }); const temporary = await mkdtemp(path.join(parent, 'native-base-extra-'));
  try {
    const sources = ['include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', 'include/modules/modules.func.php', ...modules.flatMap(module => [`include/modules/base/${module.name}/main.php`, `include/modules/base/${module.name}/config/${module.name}.config.php`])];
    for (const file of sources) { const target = path.join(temporary, 'engine', file); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', file), target); }
    await mkdir(path.join(temporary, 'engine/include/modulemng'), { recursive: true }); await writeFile(path.join(temporary, 'engine/include/modulemng/modulemng.config.php'), '<?php $___MOD_CODE_ADV2=0;$___MOD_SRV=0;');
    const inputs = scenarios(), registry = new ModuleRegistry([...boundaries(inputs[0], []), ...modules]), payload = { modules: modules.map(module => module.name), configKeys: Object.fromEntries(modules.map(module => [module.name, Object.keys(module.state())])), order: registry.order, states: states(inputs[0]), baseFunctions, baseValues, cases: inputs.map(input => ({ ...input, states: states(input) })) };
    await writeFile(path.join(temporary, 'oracle.php'), oracle);
    const reference = spawnSync(php, [path.join(temporary, 'oracle.php')], { input: JSON.stringify(payload), encoding: 'utf8', windowsHide: true, timeout: 60_000, maxBuffer: 64 * 1024 * 1024 });
    assert.equal(reference.status, 0, reference.stderr); assert.equal(reference.stderr, ''); const expected = JSON.parse(reference.stdout);
    for (const [index, input] of inputs.entries()) assert.deepEqual(await actual(input), expected[index], input.label);
    t.diagnostic(`Compared ${inputs.length} original-source combinations, scalar types, reference mutations, chain order, configuration unions, original messages and subsequent RNG value.`);
  } finally { assert.ok(path.resolve(temporary).startsWith(path.resolve(parent) + path.sep)); await rm(temporary, { recursive: true, force: true }); }
});
