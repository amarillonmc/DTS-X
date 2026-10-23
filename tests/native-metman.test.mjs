import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { createPhp74Random } from '../native/random.mjs';
import { mapModule } from '../native/gameplay/map.mjs';
import { exploreModule } from '../native/gameplay/explore.mjs';
import { itemModule } from '../native/gameplay/items.mjs';
import { metmanModule } from '../native/gameplay/metman.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const clone = value => structuredClone(value);
function person(values = {}) {
  const data = { pid: '2', pls: '3', name: '人物甲', hp: '100', mhp: '100', sp: '100', msp: '100', rage: '0', lvl: '4', type: '0', gd: 'm', sNo: '7', icon: '2', card: '1', cardname: '卡片', corpse_clear_flag: '0', money: '0', wep: '拳头', wepk: 'WN', wepe: '0', weps: '∞', wepsk: '', arb: '内衣', arbk: 'DN', arbe: '0', arbs: '∞', arbsk: '', arhs: '0', aras: '0', arfs: '0', arts: '0', action: '' };
  for (let i = 0; i <= 6; i++) Object.assign(data, { [`itm${i}`]: '', [`itmk${i}`]: '', [`itme${i}`]: 0, [`itms${i}`]: 0, [`itmsk${i}`]: '' });
  return { ...data, ...values };
}
const columns = Object.keys(person());
const op = (name, ...args) => ({ name, args });
function scenarios() {
  const cases = [], ground = [{ iid: '7', itm: '地上物品', itmk: 'Y', itme: '5', itms: '2', itmsk: '' }];
  const add = (label, operations, extra = {}) => cases.push({ label, operations, seed: 7, player: person({ pid: '1', name: '当前玩家' }), rows: [], ...extra });
  add('defaults and all base predicates', [op('calculate_findman_obbs', person()), op('calculate_hide_obbs', person()), op('check_corpse_discover_dice', person({ hp: '0' })), op('can_continue_post_discover_player', true)]);
  for (const value of [-1, 0, 19, 20, 49, 50, 100]) add(`health and stamina boundary ${value}`, [op('metman_load_playerdata', person({ hp: String(value), sp: String(value), extra: '不应导出' })), op('init_battle')]);
  for (const value of [0, 29, 30, 99, 100, 101]) add(`rage boundary ${value}`, [op('metman_load_playerdata', person({ rage: String(value) })), op('init_battle', 1)]);
  for (const value of [0, 59, 60, 119, 120, 299, 300, 999, 1000, 3999, 4000, 39999, 40000, 399999, 400000]) add(`weapon power boundary ${value}`, [op('metman_load_playerdata', person({ wepe: String(value), type: '1', gd: 'f' })), op('init_battle')]);
  add('load only supplied columns preserves earlier enemy values', [op('metman_load_playerdata', person()), op('metman_load_playerdata', { hp: 0, name: '第二人', extra: '局部字段' }), op('init_battle')]);
  for (const count of [0, 1, 9, 10, 11, 30]) add(`population ${count}`, ['search', 'move', 'search2', 'other', 0, '0'].flatMap(mode => [op('calculate_meetman_rate_by_mode', mode), op('calculate_meetman_rate', mode)]), { count });
  const corpse = person({ hp: '0' });
  for (const field of ['money', 'arhs', 'aras', 'arfs', 'arts', 'itms1', 'itms2', 'itms3', 'itms4', 'itms5', 'itms6']) {
    for (const value of ['0', '1', '∞']) add(`corpse ${field}=${value}`, [op('discover_player_filter_corpse', { ...corpse, [field]: value }), op('discover_player_filter', { ...corpse, [field]: value })]);
  }
  for (const equipment of [
    { wepk: 'WN', wepe: '0', weps: '∞' }, { wepk: 'WN', wepe: '1', weps: '∞' }, { wepk: 'WK', wepe: '0', weps: '1' }, { wepk: 'WK', wepe: '1', weps: '0' },
    { arbk: 'DN', arbe: '0', arbs: '∞' }, { arbk: 'DN', arbe: '1', arbs: '∞' }, { arbk: 'DB', arbe: '0', arbs: '1' }, { arbk: 'DB', arbe: '1', arbs: '0' },
  ]) add(`corpse equipment ${JSON.stringify(equipment)}`, [op('discover_player_filter_corpse', { ...corpse, ...equipment })]);
  for (const flag of [0, '0', 1, '1', 2, '01']) add(`corpse clear flag ${flag}`, [op('discover_player_filter_corpse', { ...corpse, corpse_clear_flag: flag, money: '5' })]);
  add('filters preserve value copies but direct child accepts reference', [op('discover_player_filter_alive', person()), op('discover_player_filter', person()), op('discover_player_get_epids', '3', '1')], { mutate: true, rows: [person(), corpse, person({ pid: '3', hp: 0, money: '1' })] });
  add('filter override rejects before shuffle', [op('discover_player_get_epids', '3', '1'), op('discover_player')], { reject: true, rows: [person(), corpse] });
  for (const seed of [0, 1, 2, 7, 25, 99]) {
    add(`alive discovery ${seed}`, [op('check_alive_discover', person()), op('check_player_discover', person()), op('check_player_discover', corpse), op('check_corpse_discover', corpse)], { seed });
    add(`reference hooks and random order ${seed}`, [op('check_alive_discover', person())], { seed, mutate: true, find: '85', hide: '30', randomHook: true });
  }
  add('corpse discovery override rejection', [op('check_corpse_discover', corpse), op('check_player_discover', corpse)], { corpseDice: 0 });
  add('metman greeting retains template-only unknown fields and buffer', [op('meetman_alternative', person({ extra: '局部扩展' }))], { buffer: 'PRIOR' });
  add('meetman updates self and loads target', [op('meetman', '2')], { current: { 2: person({ name: '即时状态', extra: '局部扩展' }) }, buffer: 'PRIOR' });
  add('no candidates', [op('discover_player')]);
  add('empty and cleared corpse removed', [op('discover_player')], { rows: [corpse, { ...corpse, pid: '3', money: '1', corpse_clear_flag: '1' }] });
  add('corpse rejected after filtering uses hidelog', [op('discover_player')], { rows: [{ ...corpse, money: '1' }], corpseDice: 0 });
  add('all alive hide', [op('discover_player')], { rows: [person(), person({ pid: '3' })], find: 0 });
  add('changed player saves before moved check', [op('discover_player')], { rows: [person()], current: { 2: person({ pls: '4', infochanged: 1 }) } });
  add('refresh and greeting fetch separately', [op('discover_player')], { rows: [person()], find: 100, current: { 2: [person({ infochanged: '1', name: '发现时' }), person({ name: '招呼时' })] } });
  for (const seed of [0, 1, 2, 3, 7, 9, 42, 99]) {
    const rows = [person(), person({ pid: '3', name: '人物乙' }), person({ pid: '4', hp: '0', money: '1', name: '尸体' }), person({ pid: '5', hp: '0', name: '空尸体' })];
    add(`shuffled candidates ${seed}`, [op('discover_player')], { seed, rows, current: { 2: person({ pls: '4' }), 3: person({ pid: '3', name: '人物乙', infochanged: 1 }), 4: rows[2] } });
    for (const mode of ['search', 'move', 'search2', 'other']) add(`full discovery chain ${mode}/${seed}`, [op('discover', mode)], { seed, rows, items: ground });
    add(`continue after encounter ${seed}`, [op('discover', 'search')], { seed, rows, items: ground, rate: 100, continue: true });
    add(`minimum encounter floor ${seed}`, [op('discover', 'other')], { seed, rate: -1, items: ground });
  }
  return cases;
}

function definitions(input, effects) {
  const fetchCounts = {};
  return [
    { name: 'sys', state: () => ({ mode: 'explore', command: '', tablepre: 'test_', nowep: '拳头', nosta: '∞', arealist: [0, 1, 2, 3, 4], areanum: 1, hack: 0 }), functions: { act() {} } },
    { name: 'input', state: () => ({}) }, { name: 'logger', state: () => ({ log: '' }) },
    { name: 'player', state: () => ({ ...input.player, equip_list: [], db_player_structure: columns, sdata: {}, tpldata: {}, cmd: '', main: '', typeinfo: ['学生', 'NPC'], sexinfo: { m: '男', f: '女' } }), initialize(ctx) {
      const state = ctx.state(); for (const key of columns) Object.defineProperty(state.sdata, key, { enumerable: true, get: () => state[key], set: value => { state[key] = value; } });
    }, functions: {
      async update_sdata() { effects.push(['update_sdata']); },
      async fetch_playerdata_by_pid(ctx, id) {
        effects.push(['fetch', id]); const value = input.current?.[id] ?? input.rows.find(row => row.pid === id) ?? person();
        const index = fetchCounts[id] ?? 0; fetchCounts[id] = index + 1;
        return clone(Array.isArray(value) ? value[Math.min(index, value.length - 1)] : value);
      },
      async player_save(ctx, data) { effects.push(['save', clone(data)]); },
      async icon_parser_shell(ctx, data) { effects.push(['icon', clone(data)]); return ['small.gif', 'large.gif', 140]; },
    } },
    { name: 'lvlctl', functions: { async calc_upexp(ctx, level) { effects.push(['experience', level]); return Number(level) * 10 + 5; } } },
    mapModule, exploreModule, itemModule, metmanModule,
    { name: 'fixture', dependencies: ['metman'], functions: {
      async calculate_findman_obbs(ctx, enemy) { await Promise.resolve(); effects.push(['find', enemy.pid]); if (input.mutate) enemy.findTag = 1; return input.find ?? await ctx.next(enemy); },
      async calculate_hide_obbs(ctx, enemy) { await Promise.resolve(); effects.push(['hide', enemy.pid, enemy.findTag ?? null]); if (input.mutate) enemy.hideTag = 2; if (input.randomHook) effects.push(['hook-rand', ctx.services.random.rand(0, 99)]); return input.hide ?? await ctx.next(enemy); },
      async check_corpse_discover_dice(ctx, enemy) { effects.push(['corpse-dice', enemy.pid]); return input.corpseDice ?? await ctx.next(enemy); },
      async discover_player_filter_alive(ctx, enemy) { effects.push(['filter-alive', enemy.pid]); if (input.mutate) enemy.name = '仅值副本'; return input.reject ? false : await ctx.next(enemy); },
      async calculate_meetman_rate(ctx, mode) { effects.push(['rate', mode]); return input.rate ?? await ctx.next(mode); },
      async can_continue_post_discover_player(ctx, result) { effects.push(['continue', result]); return input.continue ? true : await ctx.next(result); },
    } },
  ];
}

async function actual(input) {
  const effects = [], random = createPhp74Random(input.seed); let buffer = input.buffer ?? '';
  const session = await new ModuleRegistry(definitions(input, effects)).createSession({ services: {
    random,
    database: {
      async query(sql) { effects.push(['sql', sql]); return clone(sql.startsWith('SELECT pid') ? Array.from({ length: input.count ?? input.rows.length }, (_, i) => ({ pid: String(i + 2) })) : sql.includes('mapitem') ? input.items ?? [] : input.rows); },
      async execute(sql) { effects.push(['sql', sql]); return { insertId: 1 }; },
    },
    templates: { names: { MOD_METMAN_MEETMAN_CMD: 'meetman_cmd', MOD_METMAN_MEETMAN: 'meetman', MOD_ITEMMAIN_ITEMFIND: 'itemfind' }, async render(name, scope) {
      effects.push(['template', name, scope.w_name ?? null, scope.w_extra ?? null, clone(scope.tdata ?? null), clone(scope.edata ?? null), scope.itm0, scope.cmd]); return `[template:${name}]`;
    } },
    output: { take() { const result = buffer; buffer = ''; return result; } },
  } });
  const results = [];
  for (const operation of input.operations) { const args = clone(operation.args); results.push({ result: await session.call('metman', operation.name, ...args) ?? null, args }); }
  const player = session.state('player');
  return JSON.parse(JSON.stringify({ results, player: Object.fromEntries(columns.map(key => [key, player[key]])), metman: session.state('metman'), mode: session.state('sys').mode, log: session.state('logger').log, cmd: player.cmd, main: player.main, effects, buffer, next: random.rand() }));
}

const oracle = String.raw`<?php
namespace sys { function act(){if(eval(__MAGIC__))return $___RET_VALUE;} }
namespace player {
 function update_sdata(){global $effects;$effects[]=['update_sdata'];}
 function fetch_playerdata_by_pid($id){global $case,$effects,$fetchCounts;$effects[]=['fetch',$id];$value=$case['current'][$id]??null;if($value===null)foreach($case['rows'] as $row)if($row['pid']===$id){$value=$row;break;}if($value===null)$value=$GLOBALS['defaultPerson'];$index=$fetchCounts[$id]??0;$fetchCounts[$id]=$index+1;return isset($value[0])?$value[min($index,count($value)-1)]:$value;}
 function player_save($data){global $effects;$effects[]=['save',$data];}
 function icon_parser_shell($data){global $effects;$effects[]=['icon',$data];return ['small.gif','large.gif',140];}
}
namespace lvlctl { function calc_upexp($level){global $effects;$effects[]=['experience',$level];return $level*10+5;} }
namespace fixture {
 function calculate_findman_obbs(&$enemy){if(eval(__MAGIC__))return $___RET_VALUE;global $case,$effects;$effects[]=['find',$enemy['pid']];if(!empty($case['mutate']))$enemy['findTag']=1;return $case['find']??$chprocess($enemy);}
 function calculate_hide_obbs(&$enemy){if(eval(__MAGIC__))return $___RET_VALUE;global $case,$effects;$effects[]=['hide',$enemy['pid'],$enemy['findTag']??null];if(!empty($case['mutate']))$enemy['hideTag']=2;if(!empty($case['randomHook']))$effects[]=['hook-rand',rand(0,99)];return $case['hide']??$chprocess($enemy);}
 function check_corpse_discover_dice(&$enemy){if(eval(__MAGIC__))return $___RET_VALUE;global $case,$effects;$effects[]=['corpse-dice',$enemy['pid']];return $case['corpseDice']??$chprocess($enemy);}
 function discover_player_filter_alive(&$enemy){if(eval(__MAGIC__))return $___RET_VALUE;global $case,$effects;$effects[]=['filter-alive',$enemy['pid']];if(!empty($case['mutate']))$enemy['name']='仅值副本';return !empty($case['reject'])?false:$chprocess($enemy);}
 function calculate_meetman_rate($mode){if(eval(__MAGIC__))return $___RET_VALUE;global $case,$effects;$effects[]=['rate',$mode];return $case['rate']??$chprocess($mode);}
 function can_continue_post_discover_player($result){if(eval(__MAGIC__))return $___RET_VALUE;global $case,$effects;$effects[]=['continue',$result];return !empty($case['continue'])?true:$chprocess($result);}
}
namespace metman { function template($name){$GLOBALS['templateName']=$name;return __DIR__.'/template.php';} }
namespace itemmain { function template($name){$GLOBALS['templateName']=$name;return __DIR__.'/template.php';} }
namespace {
 define('IN_GAME',true);define('GAME_ROOT',__DIR__.'/engine/');error_reporting(E_ALL & ~E_NOTICE);ini_set('display_errors','stderr');
 require GAME_ROOT.'include/modules/modules.func.php';require GAME_ROOT.'include/global.func.php';
 foreach(['core/map'=>['main.php','config/map.config.php'],'base/explore'=>['main.php','config/explore.config.php'],'base/itemmain'=>['main.php','itemuse.php','itemcmd.php','config/itemmain.config.php'],'base/metman'=>['main.php','config/metman.config.php']] as $module=>$files)foreach($files as $file)require GAME_ROOT.'include/modules/'.$module.'/'.$file;
 class Result {public $rows;public $index=0;function __construct($rows){$this->rows=$rows;}}
 class DB {function query($sql){global $case,$effects;$effects[]=['sql',$sql];if(strpos($sql,'SELECT pid')===0){$rows=[];for($i=0;$i<($case['count']??count($case['rows']));$i++)$rows[]=['pid'=>(string)($i+2)];}else $rows=strpos($sql,'mapitem')!==false?($case['items']??[]):$case['rows'];return new Result($rows);}function num_rows($result){return count($result->rows);}function fetch_array($result){return $result->rows[$result->index++]??false;}}
 function bind_state($module,$values){$imports='';foreach($values as $key=>$value){$global='___LOCAL_'.strtoupper($module).'__VARS__'.$key;$GLOBALS[$global]=$value;$imports.='global $'.$global.';$'.$key.'=&$'.$global.';';}define('MOD_'.strtoupper($module),true);define('IMPORT_MODULE_'.strtoupper($module).'_GLOBALS',$imports);}
 function reset_state($module,$values){foreach($values as $key=>$value)$GLOBALS['___LOCAL_'.strtoupper($module).'__VARS__'.$key]=$value;}
 $input=json_decode(stream_get_contents(STDIN),true);$defaultPerson=$input['person'];$columns=array_keys($defaultPerson);$db=new DB();
 $map=[];foreach($input['mapkeys'] as $key)$map[$key]=$$key;$map['all_plsno_cache']=[];
 $items=[];foreach(['tmp_itmsk_arr_pool','itemfind_extra_log','item_equip_list','item_hotkey_id_list','itemmain_drophint','item_allow_find_and_use','nosta','nospk','item_obbs','map_noitemdrop_arealist','itemkind_equipable','iteminfo','itemspkinfo','itemspkdesc','itemspkdesc_help','itemspkremark'] as $key)$items[$key]=$$key;
 $metman=[];foreach(['tdata','w_upexp','battle_title','hideflag','hidelog','hpinfo','spinfo','rageinfo','wepeinfo','metman_obbs'] as $key)$metman[$key]=$$key??null;$metman['tdata']=[];foreach($columns as $key)$metman['w_'.$key]=null;
 $sys=['mode'=>'explore','command'=>'','tablepre'=>'test_','nowep'=>'拳头','nosta'=>'∞','arealist'=>[0,1,2,3,4],'areanum'=>1,'hack'=>0,'db'=>$db];
 $playerExtra=['equip_list'=>[],'db_player_structure'=>$columns,'sdata'=>[],'tpldata'=>[],'cmd'=>'','main'=>'','typeinfo'=>['学生','NPC'],'sexinfo'=>['m'=>'男','f'=>'女']];
 foreach(['sys'=>$sys,'input'=>[],'logger'=>['log'=>''],'player'=>array_merge($defaultPerson,$playerExtra),'lvlctl'=>[],'map'=>$map,'explore'=>[],'itemmain'=>$items,'metman'=>$metman,'fixture'=>[]] as $module=>$values)bind_state($module,$values);
 foreach(['sys','player','lvlctl','map','explore','itemmain','metman','fixture'] as $module)foreach(get_defined_functions()['user'] as $fn)if(strpos($fn,$module.'\\')===0&&!in_array(substr($fn,strlen($module)+1),['init','template']))hook_register($module,substr($fn,strlen($module)+1));
 define('MOD_METMAN_MEETMAN_CMD','meetman_cmd');define('MOD_METMAN_MEETMAN','meetman');define('MOD_ITEMMAIN_ITEMFIND','itemfind');
 $out=[];foreach($input['cases'] as $case){
  $effects=[];$fetchCounts=[];reset_state('sys',$sys);reset_state('player',array_merge($case['player'],$playerExtra));reset_state('logger',['log'=>'']);reset_state('itemmain',$items);reset_state('metman',$metman);reset_state('map',$map);
  $sdata=&get_var_in_module('sdata','player');foreach($columns as $key)$sdata[$key]=&get_var_in_module($key,'player');
  \itemmain\init();\metman\init();mt_srand($case['seed']);ob_start();echo $case['buffer']??'';$results=[];
  foreach($case['operations'] as $op){$args=$op['args'];$refs=[];foreach($args as &$arg)$refs[]=&$arg;unset($arg);$result=call_user_func_array('metman\\'.$op['name'],$refs);$results[]=['result'=>$result,'args'=>$args];}
  $buffer=ob_get_clean();$p=[];foreach($columns as $key)$p[$key]=get_var_in_module($key,'player');$m=[];foreach($metman as $key=>$value)$m[$key]=get_var_in_module($key,'metman');$m['tdata']=(object)$m['tdata'];
  $out[]=json_encode(['results'=>$results,'player'=>$p,'metman'=>$m,'mode'=>get_var_in_module('mode','sys'),'log'=>get_var_in_module('log','logger'),'cmd'=>get_var_in_module('cmd','player'),'main'=>get_var_in_module('main','player'),'effects'=>$effects,'buffer'=>$buffer,'next'=>rand()],JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);
 }
 echo '['.implode(',',$out).']';
}`;

test('metman includes every source function, configuration and dependency', async () => {
  const source = await readFile(path.join(project, 'engine/include/modules/base/metman/main.php'), 'utf8');
  const names = [...source.matchAll(/^\s*function\s+(\w+)\s*\(/gm)].map(match => match[1]).filter(name => name !== 'init');
  assert.deepEqual(Object.keys(metmanModule.functions).sort(), names.sort());
  assert.deepEqual(metmanModule.dependencies, ['sys', 'player', 'explore', 'itemmain', 'logger', 'lvlctl']);
  assert.ok(Object.values(metmanModule.functions).every(fn => fn.constructor.name === 'AsyncFunction'));
});

test('metman keeps original command controls and requires explicit host dependencies', async () => {
  assert.throws(() => new ModuleRegistry([metmanModule]), /Missing dependency/);
  const input = scenarios()[0], effects = [];
  const missing = await new ModuleRegistry(definitions(input, effects)).createSession();
  await assert.rejects(missing.call('metman', 'calculate_meetman_rate', 'search'), /requires database.query/);
  await assert.rejects(missing.call('metman', 'meetman_alternative', person()), /requires template binding/);

  // meetman_cmd is literal original HTML. Render it unchanged through the host
  // contract here, separately from the differential template-scope recorder.
  const command = await readFile(path.join(project, 'engine/include/modules/base/metman/meetman_cmd.htm'), 'utf8');
  let buffer = 'PRIOR';
  const session = await new ModuleRegistry(definitions(input, [])).createSession({ services: {
    templates: { names: { MOD_METMAN_MEETMAN_CMD: 'meetman_cmd', MOD_METMAN_MEETMAN: 'meetman' }, async render(name, scope) {
      assert.equal(name, 'meetman_cmd'); assert.equal(scope.w_extra, 'local'); assert.equal(scope.tdata.name, '人物甲');
      scope.edata.name = '模板局部值修改'; return command;
    } },
    output: { async take() { const result = buffer; buffer = ''; return result; } },
  } });
  const enemy = person({ extra: 'local' });
  await session.call('metman', 'meetman_alternative', enemy);
  assert.equal(enemy.name, '人物甲', 'The source meetman_alternative argument is passed by value');
  assert.equal(Object.hasOwn(session.state('metman'), 'w_extra'), false, 'Template-only extract values are not exported state');
  assert.equal(session.state('player').cmd, 'PRIOR' + command);
  assert.equal(session.state('player').main, 'meetman'); assert.equal(buffer, '');
  assert.match(command, /id="command" name="command" value="back"/);
  assert.match(command, /postCmd\('gamecmd','command.php'\)/);
});

test('real metman, item and exploration chain matches unchanged PHP references, states and random consumption', { timeout: 120_000 }, async t => {
  const php = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true, timeout: 10_000 });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires PHP 7.4 development oracle.'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true }); const temporary = await mkdtemp(path.join(parent, 'native-metman-'));
  try {
    const files = ['include/modules/modules.func.php', 'include/global.func.php', 'include/bubblebox.func.php', 'include/roommng/roommng.config.php', 'include/modules/core/map/main.php', 'include/modules/core/map/config/map.config.php', 'include/modules/base/explore/main.php', 'include/modules/base/explore/config/explore.config.php', ...['main.php', 'itemuse.php', 'itemcmd.php', 'config/itemmain.config.php'].map(file => 'include/modules/base/itemmain/' + file), 'include/modules/base/metman/main.php', 'include/modules/base/metman/config/metman.config.php'];
    for (const file of files) { const target = path.join(temporary, 'engine', file); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(project, 'engine', file), target); }
    await mkdir(path.join(temporary, 'engine/include/modulemng'), { recursive: true }); await writeFile(path.join(temporary, 'engine/include/modulemng/modulemng.config.php'), '<?php $___MOD_CODE_ADV2=0;$___MOD_SRV=0;');
    await writeFile(path.join(temporary, 'oracle.php'), oracle);
    await writeFile(path.join(temporary, 'template.php'), '<?php global $effects,$templateName;$effects[]=["template",$templateName,$w_name??null,$w_extra??null,$tdata??null,$edata??null,$itm0,$cmd];echo "[template:$templateName]";');
    const inputs = scenarios(), config = JSON.parse(await readFile(path.join(project, 'native/gameplay/map-config.json'), 'utf8'));
    const reference = spawnSync(php, ['-d', 'display_errors=stderr', path.join(temporary, 'oracle.php')], { input: JSON.stringify({ cases: inputs, mapkeys: Object.keys(config), person: person() }), encoding: 'utf8', windowsHide: true, timeout: 60_000, maxBuffer: 32 * 1024 * 1024 });
    assert.equal(reference.status, 0, reference.stderr); assert.equal(reference.stderr, ''); const expected = JSON.parse(reference.stdout);
    for (const [index, input] of inputs.entries()) assert.deepEqual(await actual(input), expected[index], input.label);
    t.diagnostic(`Compared ${inputs.length} scenarios with real metman/itemmain/explore/map functions, explicit SQL/player/template boundaries, async hooks, value/reference arguments and the subsequent RNG draw.`);
  } finally { assert.ok(path.resolve(temporary).startsWith(path.resolve(parent) + path.sep)); await rm(temporary, { recursive: true, force: true }); }
});
