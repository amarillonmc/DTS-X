import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { itemModule } from '../native/gameplay/items.mjs';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { createPhp74Random } from '../native/random.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const fields = ['itm', 'itmk', 'itme', 'itms', 'itmsk'];
const templates = ['ITEMFIND', 'ITEMMERGE0', 'ITEMDROP0', 'ITEMMERGE', 'ITEMMOVE', 'ITEMDROP'];
function player(values = {}) {
  const data = { hp: 100, action: '', pls: 3, wep: '拳头', wepk: 'WN', wepe: 0, weps: '∞', wepsk: '', arb: '校服', arbk: 'DB', arbe: 5, arbs: 15, arbsk: '' };
  for (let index = 0; index <= 6; index++) Object.assign(data, slot(index, ''));
  return { ...data, ...values };
}
function slot(index, name = '测试道具', kind = 'Y', effect = '5', durability = '3', attribute = '') {
  return Object.fromEntries(fields.map((field, offset) => [field + index, name ? [name, kind, effect, durability, attribute][offset] : ['', '', 0, 0, ''][offset]]));
}
const op = (name, ...args) => ({ name, args });
function cases() {
  const result = [];
  const add = (label, operations, extra = {}) => result.push({ label, seed: 7, operations, player: player(), sys: { mode: 'command', command: '', tablepre: 'test_', nowep: '拳头', nosta: '∞' }, input: {}, ...extra });
  for (const kind of ['WC', 'WCD', 'WD', 'WF', 'Y', 'GB', 'EI', 'EA', 'EC', 'TN', 'ygo', 'fy', 'p', 'HH', 'PS2', 'WP', 'Z', '', '0']) add(`merge kind ${kind}`, [op('check_mergable', kind), op('is_equipable', kind), op('parse_itmk_words', kind)]);
  for (const value of ['', '0', '123', '=NPC', 'xzxzz', 'xx||z^TEST', '^dd20^001A|z', '0|x', '^no_digits', 'xz^TEST1xxzz']) add(`attributes ${value}`, [op('get_itmsk_array', value), op('count_itmsk_num', value), op('parse_itmsk_words', value), op('parse_itmsk_words', value, 1, 1), op('parse_itmsk_desc', value), op('check_in_itmsk', 'x', value), op('check_in_itmsk', 'x', value, 1), op('get_itmsk_array', value, 1), op('get_itmsk_array', value)]);
  for (const value of ['短名', '这是一个非常非常长的道具名字ABCDEFG', 'abcdefghijklmnopqrstu', '😀星星xxxxxxxxxxxxxxxxxxxxxxxxxx']) add(`abbreviate ${value}`, [op('parse_itmname_words', value, 0), op('parse_itmname_words', value, 1), op('parse_itmname_words_shell', value, { pid: 1 }, 1, 6, 2)]);
  for (const value of ['∞', '10000', 10001, 19999, 100000000, 100000001, 999999999, '-25', '1e8', '10000 ']) add(`quantity ${value}`, [op('parse_itmnum_words', value, 1)]);
  add('configuration helpers', [op('replace_in_itmsk', 'x', 'z', 'xx^TEST'), op('replace_crlf', 'a<!--CRLF-->b'), op('base64_encode_comp_itmsk', '原串'), op('base64_decode_comp_itmsk', 'x^123'), op('get_item_allow_find_and_use'), op('parse_news', 1, 'itemuse', 2, 3, 4, '甲', '道具', '', '', ''), op('parse_news', 2, 'other', 2, 3, 4, '', '', '', '', '')]);
  add('string replacement and map key boundaries', [op('replace_in_itmsk', '', 'z', 'abc'), op('replace_in_itmsk', ['x', 'z'], ['z'], 'xxzz'), op('get_itmsk_words_single', 'constructor'), op('get_itmsk_desc_single', '__proto__')]);
  add('player database field construction', [op('playerdata_construct_process', player({ weps: '∞', arbs: '3.9', itms0: '0', itms1: '3', itms2: '∞', itms3: '-3.2', itms4: '10x', itms5: null }))]);
  add('longest kind prefix and ellipsis duplicate attributes', [op('parse_itmk_words', 'WKG'), op('parse_itmsk_words', 'aaabcdezz', 0, 1), op('count_itmsk_num', '|0|'), op('parse_itmsk_desc', '|0|')], { itemState: { iteminfo: { W: '武器', WK: '斩击', WKG: '枪刃' }, itemspkinfo: { a: '甲', b: '乙', c: '丙', d: '丁', e: '戊', z: '天然' } } });
  for (const durability of ['∞', 1, '1', 0, '0', -1, '2']) add(`consume ${durability}`, [op('itms_reduce', { itm: '消耗品', itmk: 'Y', itme: 2, itms: durability, itmsk: 'x' }, 2)]);
  for (const durability of ['∞', 0, '0', -1, 1, '1']) add(`use ${durability}`, [op('itemuse_wrapper', '1')], { player: player(slot(1, '道具', 'Y', 5, durability)) });
  add('use outside bag', [op('itemuse_wrapper', -1), op('itemuse_wrapper', 7)]);
  add('asynchronous itemuse mutation reaches bag', [op('itemuse_wrapper', 1)], { player: player(slot(1, '消耗品', 'Y', '5', '1')), useHook: true });
  for (const kind of ['Y', 'HH', 'PH8', 'WP', 'Z']) {
    add(`same-item merge ${kind}`, [op('itemmerge', 1, 2)], { player: player({ ...slot(1, '同名', kind, '5', '3', 'z'), ...slot(2, '同名', kind, 5, '7', 'z') }) });
  }
  add('poison food merge higher source', [op('itemmerge', 1, 2)], { player: player({ ...slot(1, '面包', 'PH8', 5, 3, '17'), ...slot(2, '面包', 'HH', 5, 7, '42') }) });
  add('poison food merge retain destination attribution', [op('itemmerge', 1, 2)], { player: player({ ...slot(1, '面包', 'HH', 5, 3, ''), ...slot(2, '面包', 'PH12', 5, 7, '42') }) });
  add('merge infinity', [op('itemmerge', 1, 2)], { player: player({ ...slot(1, '同名', 'Y', 5, '∞'), ...slot(2, '同名', 'Y', 5, 7) }) });
  add('merge empty and same slot', [op('itemmerge', 1, 1), op('itemmerge', 1, 2)]);
  add('merge different name', [op('itemmerge', 1, 2)], { player: player({ ...slot(1, '甲'), ...slot(2, '乙') }) });
  add('merge different attributes', [op('itemmerge', 1, 2)], { player: player({ ...slot(1, '同名', 'Y', 5, 3, 'z'), ...slot(2, '同名', 'Y', 5, 7, 'x') }) });
  add('move into empty then swap', [op('itemmove', '1', '2'), op('itemmove', 2, 3)], { player: player({ ...slot(1, '甲'), ...slot(3, '乙') }) });
  add('invalid moves', [op('itemmove', 0, 2), op('itemmove', 'bad', 2), op('itemmove', 1, 8), op('itemmove', 1, 1), op('itemmove', 1, 2)]);
  add('pick finite ammunition merges equipped weapon', [op('itemget')], { player: player({ ...slot(0, '投掷', 'WC', '5', '3'), wep: '投掷', wepk: 'WC', wepe: 5, weps: '7' }) });
  add('pick finite object merges backpack', [op('itemget')], { player: player({ ...slot(0, '道具'), ...slot(3, '道具') }) });
  add('pick infinity object skips merge', [op('itemget')], { player: player({ ...slot(0, '道具', 'Y', '5', '∞'), ...slot(3, '道具') }) });
  add('food prompts merge with full source identity', [op('itemget')], { player: player({ ...slot(0, '面包', 'HH'), ...slot(3, '面包', 'PH3'), ...slot(5, '面包', 'HH') }), buffer: 'PRIOR' });
  add('full bag prompts replacement', [op('itemadd')], { player: player(Object.assign({}, ...Array.from({ length: 7 }, (_, i) => slot(i, `物品${i}`)))), buffer: 'PRIOR' });
  add('add chosen position and invalid empty source', [op('itemadd', '5'), op('itemadd')], { player: player(slot(0, '捡起')) });
  for (const position of ['wep', 'arb', 'itm2']) add(`drop ${position}`, [op('itemdrop', position)], { player: player({ ...slot(2, '背包物品'), wep: '锤', wepk: 'WP', wepe: '7', weps: '2' }) });
  add('invalid drop', [op('itemdrop', 'wep'), op('itemdrop', 'itm1')]);
  for (const position of ['wep', 'arb']) add(`unequip ${position}`, [op('itemoff', position)], { player: player({ wep: '锤', wepk: 'WP', wepe: '7', weps: '2' }) });
  add('invalid unequip', [op('itemoff', 'wep')]);
  for (const position of ['wep', 'arb', 'itm2']) add(`destroy object alias ${position}`, [op('item_destroy_core', position, player(slot(2, '物品')))]);
  add('render all item words and gameinfo', [op('parse_interface_profile'), op('parse_interface_gameinfo'), op('parse_interface_gameinfo')], { player: player(slot(0, '拾取道具很长很长的一段名字', 'Y', '10001', '∞', 'xz')), itemState: { itemfind_extra_log: '额外发现提示' } });
  add('invalid itemfind', [op('itemfind'), op('show_itemfind')]);
  add('valid itemfind preserves outer buffer', [op('itemfind')], { player: player(slot(0)), buffer: 'PRIOR' });
  const rows = [1, 2, 3, 4].map(i => ({ iid: String(i), itm: `地上${i}`, itmk: 'Y', itme: '5', itms: '3', itmsk: '' }));
  for (const seed of [0, 1, 2, 7, 99]) {
    add(`discover shuffled ${seed}`, [op('discover_item')], { rows, seed });
    add(`discover chance ${seed}`, [op('discover', 'search'), op('check_discover_item_found', -80), op('check_discover_item_found', 100)], { rows, seed });
    add(`starting items ${seed}`, [op('init_enter_battlefield_items', { gd: seed % 2 ? 'm' : 'f', untouched: '保留' })], { seed });
  }
  add('discover none', [op('discover_item')]);
  add('discover all filtered', [op('discover_item')], { rows, filterAll: true });
  add('focus detached item then invalid id', [op('focus_item', { ...rows[0], iid: -1 }), op('focus_item', { itm: '无 id' })]);
  for (const npcPid of [null, '42']) add(`map poison npc ${npcPid}`, [op('mapitem_row_data_seperate', '0,3,1,面包,PH3,5,2,=毒NPC', 3)], { npcPid });
  const mapLines = ['header\r\n', 'comment\n', '=ignored,3,1,不生成,Y,1,1,x,\n', '0,3,2,固定,Y,5,3,z,\n', '99,99,3,随机,Y,5,3,x,\n', '98,4,1,一禁后,Y,5,3,,\n', '1,5,1,一禁,Y,5,3,,\n', '0,3,1,无耐,Y,5,0,,\n'];
  for (const wave of [0, 1, 2]) for (const location of [-1, 3, 99]) add(`map spawn wave=${wave} location=${location}`, [op('lay_mapitem', location)], { wave, mapLines });
  add('reset hook lays map once', [op('rs_game', 0), op('rs_game', 16)], { mapLines });
  for (const command of ['search', 'itemget', 'swapitm2', 'dropitm0', 'itm0', 'enter']) add(`protect held item ${command}`, [op('pre_act')], { player: player(slot(0)), sys: { mode: 'itemmain', command, tablepre: 'test_', nowep: '拳头', nosta: '∞' } });
  add('corpse action permits command', [op('pre_act')], { player: player({ ...slot(0), action: 'corpse2' }), sys: { mode: 'itemmain', command: 'search', tablepre: 'test_', nowep: '拳头', nosta: '∞' } });
  for (const itemcmd of ['itemmerge', 'itemmove', 'itemdrop']) add(`action menu ${itemcmd}`, [op('act')], { input: { itemcmd }, sys: { mode: 'command', command: 'itemmain', tablepre: 'test_', nowep: '拳头', nosta: '∞' }, buffer: 'DISCARD' });
  for (const [command, input] of [['itm1', {}], ['itemget', {}], ['itemadd', {}], ['itemmerge', { merge1: '1', merge2: '2' }], ['itemmerge', { merge1: '0', merge2: 'n' }], ['itemmove', { from: '1', to: '3' }], ['dropitm1', {}], ['offwep', {}], ['swapitm2', {}]]) add(`action ${command} ${JSON.stringify(input)}`, [op('act')], { input, player: player({ ...slot(0, '新物品'), ...slot(1, '旧物品'), ...slot(2, '换掉'), wep: '锤', wepk: 'WP', wepe: 5, weps: 3 }), sys: { mode: command === 'itm1' ? 'command' : 'itemmain', command, tablepre: 'test_', nowep: '拳头', nosta: '∞' } });
  add('raw resource lines', [op('get_itemfilecont'), op('get_startingitemfilecont'), op('get_startingwepfilecont')]);
  return result;
}

function boundaries(input, effects) {
  return [
    { name: 'sys', state: () => input.sys, functions: Object.fromEntries(['pre_act', 'act', 'rs_game'].map(name => [name, (ctx, ...args) => { effects.push([name, ...args]); }])) },
    { name: 'map', functions: { get_all_plsno() { return [0, 3, 4, 5, 34]; }, get_area_wavenum() { return input.wave ?? 0; } } },
    { name: 'input', state: () => input.input },
    { name: 'logger', state: () => ({ log: '' }), functions: { parse_news(ctx, ...args) { effects.push(['news', ...args]); return 'BASE NEWS'; } } },
    { name: 'player', state: () => ({ ...input.player, equip_list: ['wep', 'arb'], sdata: {}, tpldata: {}, cmd: '' }), initialize(ctx) {
      const state = ctx.state();
      for (const key of Object.keys(input.player)) Object.defineProperty(state.sdata, key, { enumerable: true, get: () => state[key], set: value => { state[key] = value; } });
    }, functions: {
      playerdata_construct_process(ctx, data) { return structuredClone(data); },
      update_sdata() { effects.push(['update_sdata']); },
      parse_interface_profile() { effects.push(['profile']); },
      parse_interface_gameinfo() { effects.push(['gameinfo']); },
    } },
    { name: 'explore', functions: { discover(ctx, mode) { effects.push(['discover', mode]); return 'BASE DISCOVER'; } } },
    itemModule,
    { name: 'fixture', dependencies: ['itemmain'], functions: {
      async itemuse(ctx, item) { if (input.useHook) { await Promise.resolve(); await ctx.call('itemmain', 'itms_reduce', item); } else await ctx.next(item); },
      async discover_item_filter(ctx, item) { return input.filterAll ? false : await ctx.next(item); },
      async get_itemfilecont(ctx) { return input.mapLines ?? await ctx.next(); },
    } },
  ];
}

async function actual(input) {
  const effects = [], random = createPhp74Random(input.seed);
  let buffer = input.buffer ?? '';
  const session = await new ModuleRegistry(boundaries(input, effects)).createSession({
    states: { itemmain: input.itemState ?? {} }, services: {
      random,
      database: {
        async query(sql) { effects.push(['sql', sql]); return sql.includes('SELECT pid') ? input.npcPid ? [{ pid: input.npcPid }] : [] : structuredClone(input.rows ?? []); },
        async execute(sql) { effects.push(['sql', sql]); return { insertId: 4242 }; },
      },
      templates: { names: Object.fromEntries(templates.map(name => [`MOD_ITEMMAIN_${name}`, name])), async render(name, scope) {
        effects.push(['template', name, scope.itm0, scope.sameitem ?? null]); return `[template:${name}]`;
      } },
      output: { take() { const value = buffer; buffer = ''; return value; } },
    },
  });
  const results = [];
  for (const operation of input.operations) {
    const args = structuredClone(operation.args);
    results.push({ result: await session.call('itemmain', operation.name, ...args) ?? null, args });
  }
  const state = session.state('player');
  return JSON.parse(JSON.stringify({ results, player: Object.fromEntries(Object.keys(input.player).map(key => [key, state[key]])), sdata: state.sdata,
    sys: session.state('sys'), log: session.state('logger').log, cmd: state.cmd, tpldata: state.tpldata, effects, buffer, next: random.rand() }));
}

const oracle = String.raw`<?php
namespace sys { function pre_act(){if(eval(__MAGIC__)) return $___RET_VALUE; global $effects;$effects[]=['pre_act'];} function act(){if(eval(__MAGIC__)) return $___RET_VALUE;global $effects;$effects[]=['act'];} function rs_game($mode){if(eval(__MAGIC__)) return $___RET_VALUE;global $effects;$effects[]=['rs_game',$mode];} }
namespace map { function get_all_plsno(){return [0,3,4,5,34];} function get_area_wavenum(){global $case;return isset($case['wave'])?$case['wave']:0;} }
namespace player { function playerdata_construct_process($data){if(eval(__MAGIC__)) return $___RET_VALUE;return $data;} function update_sdata(){global $effects;$effects[]=['update_sdata'];} function parse_interface_profile(){if(eval(__MAGIC__)) return $___RET_VALUE;global $effects;$effects[]=['profile'];} function parse_interface_gameinfo(){if(eval(__MAGIC__)) return $___RET_VALUE;global $effects;$effects[]=['gameinfo'];} }
namespace logger { function parse_news($nid,$news,$hour,$min,$sec,$a,$b,$c,$d,$e,$exarr=[]){if(eval(__MAGIC__)) return $___RET_VALUE;global $effects;$effects[]=array_merge(['news'],func_get_args());return 'BASE NEWS';} }
namespace explore { function discover($mode){if(eval(__MAGIC__)) return $___RET_VALUE;global $effects;$effects[]=['discover',$mode];return 'BASE DISCOVER';} }
namespace fixture {
 function itemuse(&$item){if(eval(__MAGIC__)) return $___RET_VALUE;global $case;if(!empty($case['useHook'])) \itemmain\itms_reduce($item);else $chprocess($item);}
 function discover_item_filter($item){if(eval(__MAGIC__)) return $___RET_VALUE;global $case;return !empty($case['filterAll'])?false:$chprocess($item);}
 function get_itemfilecont(){if(eval(__MAGIC__)) return $___RET_VALUE;global $case;return isset($case['mapLines'])?$case['mapLines']:$chprocess();}
}
namespace itemmain { function template($name){global $templateName;$templateName=$name;return __DIR__.'/template.php';} }
namespace {
 define('IN_GAME',true); define('GAME_ROOT',__DIR__.'/engine/');error_reporting(E_ALL & ~E_NOTICE);ini_set('display_errors','stderr');
 require GAME_ROOT.'include/modules/modules.func.php';
 require GAME_ROOT.'include/global.func.php';
 foreach(['main.php','itemuse.php','itemcmd.php','config/itemmain.config.php'] as $file) require GAME_ROOT.'include/modules/base/itemmain/'.$file;
 class Result {public $rows;public $index=0;function __construct($rows){$this->rows=$rows;}}
 class DB {function query($sql){global $case,$effects;$effects[]=['sql',$sql];return new Result(strpos($sql,'SELECT pid')!==false?(!empty($case['npcPid'])?[['pid'=>$case['npcPid']]]:[]):(isset($case['rows'])?$case['rows']:[]));}function num_rows($result){return count($result->rows);}function fetch_array($result){return isset($result->rows[$result->index])?$result->rows[$result->index++]:false;}function insert_id(){return 4242;}}
 function bind_state($module,$values){$imports='';foreach($values as $key=>$value){$global='___LOCAL_'.strtoupper($module).'__VARS__'.$key;$GLOBALS[$global]=$value;$imports.='global $'.$global.';$'.$key.'=&$'.$global.';';}define('MOD_'.strtoupper($module),true);define('IMPORT_MODULE_'.strtoupper($module).'_GLOBALS',$imports);}
 function reset_state($module,$values){foreach($values as $key=>$value)$GLOBALS['___LOCAL_'.strtoupper($module).'__VARS__'.$key]=$value;}
 $itemdefaults=[];foreach(['tmp_itmsk_arr_pool','itemfind_extra_log','item_equip_list','item_hotkey_id_list','itemmain_drophint','item_allow_find_and_use','nosta','nospk','item_obbs','map_noitemdrop_arealist','itemkind_equipable','iteminfo','itemspkinfo','itemspkdesc','itemspkdesc_help','itemspkremark'] as $key)$itemdefaults[$key]=$$key;
 $input=json_decode(stream_get_contents(STDIN),true);$sample=$input[0];$db=new DB();
 $sysdefaults=['mode'=>'command','command'=>'','tablepre'=>'test_','nowep'=>'拳头','nosta'=>'∞'];
 bind_state('sys',array_merge($sysdefaults,['db'=>$db]));bind_state('logger',['log'=>'']);
 bind_state('player',array_merge($sample['player'],['equip_list'=>['wep','arb'],'sdata'=>[],'tpldata'=>[],'cmd'=>'']));
 bind_state('itemmain',$itemdefaults);bind_state('input',[]);bind_state('map',[]);bind_state('explore',[]);bind_state('fixture',[]);
 foreach(['sys','logger','player','map','explore','itemmain','fixture'] as $module)foreach(get_defined_functions()['user'] as $fn)if(strpos($fn,$module.'\\')===0 && !in_array(substr($fn,strlen($module)+1),['init','template']))hook_register($module,substr($fn,strlen($module)+1));
 foreach(['ITEMFIND','ITEMMERGE0','ITEMDROP0','ITEMMERGE','ITEMMOVE','ITEMDROP'] as $name)define('MOD_ITEMMAIN_'.$name,$name);
 // Template rendering is an explicit boundary. The unchanged item code still
 // performs its actual include/output-buffer control flow around this recorder.
 $out=[];
 foreach($input as $case){
  $effects=[];reset_state('sys',array_merge($sysdefaults,$case['sys'],['db'=>$db]));reset_state('logger',['log'=>'']);reset_state('itemmain',array_merge($itemdefaults,isset($case['itemState'])?$case['itemState']:[]));
  reset_state('player',array_merge($case['player'],['equip_list'=>['wep','arb'],'sdata'=>[],'tpldata'=>[],'cmd'=>'']));
  foreach(['itemcmd','merge1','merge2','from','to'] as $key)$GLOBALS['___LOCAL_INPUT__VARS__'.$key]=isset($case['input'][$key])?$case['input'][$key]:null;
  $sdata=&get_var_in_module('sdata','player');foreach($case['player'] as $key=>$value)$sdata[$key]=&get_var_in_module($key,'player');
  \itemmain\init();mt_srand($case['seed']);ob_start();echo isset($case['buffer'])?$case['buffer']:'';$results=[];
  foreach($case['operations'] as $op){$args=$op['args'];$refs=[];foreach($args as &$arg)$refs[]=&$arg;unset($arg);$result=call_user_func_array('itemmain\\'.$op['name'],$refs);$results[]=['result'=>$result,'args'=>$args];}
  $buffer=ob_get_clean();$p=[];foreach($case['player'] as $key=>$value)$p[$key]=get_var_in_module($key,'player');$s=[];foreach($case['sys'] as $key=>$value)$s[$key]=get_var_in_module($key,'sys');
  $tpldata=get_var_in_module('tpldata','player');
  $out[]=json_encode(['results'=>$results,'player'=>$p,'sdata'=>$sdata,'sys'=>$s,'log'=>get_var_in_module('log','logger'),'cmd'=>get_var_in_module('cmd','player'),'tpldata'=>(object)$tpldata,'effects'=>$effects,'buffer'=>$buffer,'next'=>rand()],JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);
 }
 echo '['.implode(',',$out).']';
}`;

test('all itemmain functions exist as native async implementations with original dependencies', async () => {
  const files = await Promise.all(['main.php', 'itemuse.php', 'itemcmd.php'].map(file => readFile(path.join(root, 'engine/include/modules/base/itemmain', file), 'utf8')));
  const names = files.flatMap(source => [...source.matchAll(/^\s*function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gm)].map(match => match[1])).filter(name => name !== 'init');
  assert.deepEqual(Object.keys(itemModule.functions).sort(), names.sort());
  assert.ok(Object.values(itemModule.functions).every(fn => fn.constructor.name === 'AsyncFunction'));
  assert.deepEqual(itemModule.dependencies, ['sys', 'map', 'player', 'logger', 'input']);
  assert.deepEqual(itemModule.optionalDependencies, ['explore', 'npc']);
});

test('items await injected hooks, preserve scalar aliases, and fail explicitly without host services', async () => {
  const input = cases().find(input => input.label === 'same-item merge Y');
  const effects = [];
  const modules = boundaries(input, effects);
  modules.push({ name: 'poison', dependencies: ['itemmain'], functions: {
    async poison_record_pid(ctx, slot, pid) { await Promise.resolve(); slot.value = `^psr${pid}`; },
    async check_mergable() { await Promise.resolve(); return '1'; },
  } });
  const session = await new ModuleRegistry(modules).createSession({ services: { database: { async query() { return [{ pid: '42' }]; } } } });
  assert.equal(await session.call('itemmain', 'itemmerge', 1, 2), true);
  assert.equal(session.state('player').itms2, 10);
  assert.equal(session.state('player').sdata.itms1, 0);
  const row = [0, 3, 1, '食物', 'PH1', 5, 3, '=NPC'];
  assert.equal((await session.call('itemmain', 'mapitem_row_data_process', row))[7], '^psr42');
  assert.equal(row[7], '=NPC', 'Source row argument is passed by value');
  const noServices = await new ModuleRegistry(boundaries(input, [])).createSession();
  await assert.rejects(noServices.call('itemmain', 'discover_item'), /requires services.database/);
  Object.assign(noServices.state('player'), slot(0));
  await assert.rejects(noServices.call('itemmain', 'show_itemfind'), /requires template binding/);
});

test('native itemmain agrees with unchanged PHP on inventory, discovery, data, display and command chains', { timeout: 120_000 }, async t => {
  const executable = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(executable, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true, timeout: 10_000 });
  if (version.error?.code === 'ENOENT' || version.stdout?.trim() !== '7.4') { t.skip('Development-only PHP 7.4 is required for differential comparison.'); return; }
  const parent = path.join(root, 'var/tests'); await mkdir(parent, { recursive: true });
  const temporary = await mkdtemp(path.join(parent, 'native-items-'));
  try {
    const files = ['include/modules/modules.func.php', 'include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', ...['main.php', 'itemuse.php', 'itemcmd.php', 'config/itemmain.config.php', 'config/mapitem.config.php', 'config/stitem.config.php', 'config/stwep.config.php'].map(file => `include/modules/base/itemmain/${file}`)];
    for (const file of files) { const destination = path.join(temporary, 'engine', file); await mkdir(path.dirname(destination), { recursive: true }); await copyFile(path.join(root, 'engine', file), destination); }
    await mkdir(path.join(temporary, 'engine/include/modulemng'), { recursive: true });
    await writeFile(path.join(temporary, 'engine/include/modulemng/modulemng.config.php'), '<?php $___MOD_CODE_ADV2=0; $___MOD_SRV=0;');
    await writeFile(path.join(temporary, 'template.php'), '<?php global $effects,$templateName;$effects[]=["template",$templateName,$itm0,isset($sameitem)?array_values($sameitem):null];echo "[template:$templateName]";');
    await writeFile(path.join(temporary, 'oracle.php'), oracle);
    const inputs = cases();
    const result = spawnSync(executable, ['-d', 'display_errors=stderr', path.join(temporary, 'oracle.php')], { input: JSON.stringify(inputs), encoding: 'utf8', windowsHide: true, timeout: 60_000, maxBuffer: 64 * 1024 * 1024 });
    assert.equal(result.status, 0, `${result.error?.message ?? ''}\n${result.stderr}\n${result.stdout?.slice(0, 2000)}`);
    assert.equal(result.stderr, '', result.stderr);
    const expected = JSON.parse(result.stdout);
    for (let index = 0; index < inputs.length; index++) assert.deepEqual(await actual(inputs[index]), expected[index], inputs[index].label);
    t.diagnostic(`Compared ${inputs.length} source-driven scenarios, including SQL/template/output-buffer boundaries, alias mutations and subsequent RNG draw.`);
  } finally {
    assert.ok(path.resolve(temporary).startsWith(path.resolve(parent) + path.sep));
    await rm(temporary, { recursive: true, force: true });
  }
});
