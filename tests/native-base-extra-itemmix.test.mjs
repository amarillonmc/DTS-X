import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ModuleRegistry } from '../native/modules/registry.mjs';
import { itemmixModule } from '../native/gameplay/base-extra/itemmix.mjs';
import { itemModule } from '../native/gameplay/items.mjs';
import { createTemplateServices, createOutput } from '../native/templates/index.mjs';

const project = fileURLToPath(new URL('../', import.meta.url)), copy = value => structuredClone(value);
const recipe = { stuff: ['素材甲', '素材乙'], result: ['成品', 'HB', 100, 2, 'z'], class: '补给' };
const fields = ['itm','itmk','itme','itms','itmsk'];
function pack(items) { return Object.fromEntries(items.flatMap((item,index) => fields.map((field,at) => [field+(index+1), item[at] ?? (at===2||at===3?0:'')]))); }
function states(input = {}) { return { sys: { now: 1100, hour: '11', min: '22', sec: '33', mode: 'itemmain', command: 'itemmix', nosta: '∞', uip: { baseline: 1 }, ...input.sys }, player: { name: '本人', club: '0', wd: '10', cmd: 'old', equip_list: [], itm0: '', itmk0: '', itme0: 0, itms0: 0, itmsk0: '', ...pack([['素材甲','Y',1,'3',''],['素材乙','HB',2,'3',''],[],[],[],[]]), ...input.player }, logger: { log: '' }, input: { itemcmd: null, itemselect: null, mixmask: null, mitm1: null, mitm2: null, mitm3: null, mitm4: null, mitm5: null, mitm6: null, ...input.input }, itemmain: {} }; }
function boundaries(input, trace) { return Object.entries(states(input)).map(([name,value])=>({name,state:()=>value,functions:{
 ...(name==='sys'?{async act(){trace.push(['act']);},async parse_news(ctx,...args){trace.push(['parse_news',...args]);return 'base-news';},async addnews(ctx,...args){trace.push(['news',...args]);}}:{}),
 ...(name==='itemmain'?{async parse_itmk_words(ctx,value,simple){trace.push(['kind',value,simple]);return '种类:'+value;},async parse_itmsk_words(ctx,value,simple){trace.push(['special',value,simple]);return value==='0'?'':'属性:'+value;},async parse_itmname_words(ctx,value){return value;},async itemget(ctx){const p=ctx.state('player');trace.push(['itemget',...fields.map(field=>p[field+'0'])]);}}:{}),
}})); }
const fixture = trace => ({name:'mixfixture',dependencies:['itemmix'],functions:{async itemmix_name_proc(ctx,name){trace.push(['name',name]);return await ctx.next(name);}}});
const constants = { MOD_ITEMMIX_ITEMMIX: 'itemmix', MOD_ITEMMIX_ITEMMIX_OPTIONS: 'options', MOD_ITEMMIX_ITEMMIX_OPTION_START: 'start', MOD_ITEMMIX_ITEMMIX_OPTION_END: 'end' };
async function actual(input) { const trace=[], registry=new ModuleRegistry([...boundaries(input,trace),itemmixModule,fixture(trace)]); let buffer='PRIOR';
 const session=await registry.createSession({states:{itemmix:input.itemmix??{}},services:{templates:{names:constants,async render(name,scope){trace.push(['render',name,copy(scope.mix_res??null),scope.itemselect??null]);if(name==='start'&&input.startMutation)scope.cmd='START-MUTATED';return '<fixture:'+name+'>'; }},output:{async take(){const value=buffer;buffer='';return value;}}}});
 const returns=[];for(const [fn,...args] of input.calls) returns.push(await session.call('itemmix',fn,...copy(args))??null);
 return copy({returns,sys:session.state('sys'),player:session.state('player'),log:session.state('logger').log,trace,buffer});
}
function scenarios(){const cases=[],add=(label,calls,values={})=>cases.push({label,calls,...values});
 add('whole catalog',[['get_mixinfo']]);
 for(const [index,entry] of itemmixModule.state().mixinfo.entries())add('recipe '+index,[['itemmix_recipe_check',entry.stuff.map(itm=>({itm}))]]);
 for(const name of [' 锋利的电气毒性钉棍棒-改 ','小黄的棍棒[+999]','棍棒[+99]','\t\n棍棒\r\n','\f棍棒\f','\0棍棒\0'])add('name '+name,[['itemmix_name_proc',name]]);
 for(const list of [[],[1],[1,1],[1,'1'],[1,2],[2,1],[1,3],[1,2,3]])add('place '+list,[['itemmix_place_check',list],['calc_mixmask',list]]);
 add('mask prefix',[['calc_mixmask',[0,1,2,3,4,5,6,7,'2x','5.9','bad']]]);
 for(const kind of ['Y','B','C','X','TN','GA','GB','HB','P','V','M','R','ygo3','WP','WC','WD','WF','EA'])for(const durability of [0,'0',1,'1',2,'2','∞'])add('consume '+kind+'/'+durability,[['itemmix_reduce','itm1']],{player:{itmk1:kind,itms1:durability}});
 add('consume slot syntax',[['itemmix_reduce','wep'],['itemmix_reduce','itm12']]);
 for(const club of ['0','7','16'])for(const kind of ['HB','EE','ER','WP'])for(const durability of ['1','∞'])add('success '+club+'/'+kind+'/'+durability,[['itemmix_success']],{player:{club,itm0:'成品',itmk0:kind,itme0:'50',itms0:durability},sys:{uip:{baseline:1,itmstr:'素材',mixtp:'normal'}}});
 for(const list of [[1,2],[2,1],[1,1],[1],[1,3]])add('mix '+list,[['itemmix',list]],{itemmix:{mixinfo:[recipe]}});
 add('miss',[['itemmix',[1,2]]],{itemmix:{mixinfo:[]}});
 const choices=[recipe,{...recipe,result:['另一个','WP',30,5]}];
 // Real HTTP requests start with sys.uip=null. PHP creates the array only on
 // its first write; failed validation must also tolerate an absent scratchpad.
 for(const [label,calls,extra] of [
  ['success',[['itemmix',[1,2]]],{}],
  ['no recipe',[['itemmix',[1,2]]],{itemmix:{mixinfo:[]}}],
  ['options',[['itemmix',[1,2]]],{itemmix:{mixinfo:choices}}],
  ['direct proc',[['itemmix_proc',[1,2],{...recipe,type:'normal'}]],{}],
  ['direct success',[['itemmix_success']],{player:{itm0:'成品',itmk0:'WP',itme0:10,itms0:1}}],
  ['no materials',[['act']],{}],
  ['one material',[['act']],{input:{mitm1:1}}],
  ['selected result',[['act']],{input:{mixmask:3,itemselect:1},itemmix:{mixinfo:choices}}],
 ])add('fresh request '+label,calls,{...extra,sys:{uip:null},itemmix:extra.itemmix??{mixinfo:[recipe]}});
 for(const selected of [-1,0,1,3,'0','1','bad'])add('choose '+selected,[['itemmix',[1,2],selected]],{itemmix:{mixinfo:choices}});
 for(const [mode,command,input] of [['command','itemmain',{itemcmd:'itemmix'}],['command','other',{}],['itemmain','other',{}],['itemmain','itemmix',{itemselect:999}],['itemmain','itemmix',{mitm1:1,mitm2:1}],['itemmain','itemmix',{mixmask:'3',itemselect:'1'}],['itemmain','itemmix',{mixmask:'3'}],['itemmain','itemmix',{mixmask:'3',itemselect:0}]])add('dispatch '+mode+'/'+command+'/'+JSON.stringify(input),[['act']],{sys:{mode,command},input,itemmix:{mixinfo:choices}});
 add('start mutates cmd',[['act']],{input:{mixmask:3},startMutation:true,itemmix:{mixinfo:choices}});
 add('recipe numeric names',[['itemmix_recipe_check',[{itm:'01'},{itm:'1e1'}]]],{itemmix:{mixinfo:[{stuff:['1','10'],result:['numeric','X',1,1]}]}});
 for(const result of [['成品','HB',10,2],['成品','HB',10,'∞','z'],['成品','HB',10,2,'0']])add('description '+result,[['parse_itemmix_resultshow',result]]);
 for(const kind of ['itemmix','other'])add('news '+kind,[['parse_news',7,kind,'01','02','03','本人','成品','超量','','',[]]]);
 return cases;
}
const oracle=String.raw`<?php
namespace {define('IN_GAME',true);define('GAME_ROOT',__DIR__.'/engine/');foreach(['MOD_ITEMMIX_ITEMMIX'=>'itemmix','MOD_ITEMMIX_ITEMMIX_OPTIONS'=>'options','MOD_ITEMMIX_ITEMMIX_OPTION_START'=>'start','MOD_ITEMMIX_ITEMMIX_OPTION_END'=>'end'] as $key=>$value)define($key,$value);error_reporting(E_ALL & ~E_NOTICE);ini_set('display_errors','stderr');require GAME_ROOT.'include/global.func.php';require GAME_ROOT.'include/modules/modules.func.php';$input=json_decode(stream_get_contents(STDIN),true);function record(...$args){$GLOBALS['trace'][]=json_decode(json_encode($args),true);}}
namespace sys {function act(){if(eval(__MAGIC__))return $___RET_VALUE;\record('act');}function parse_news(...$args){if(eval(__MAGIC__))return $___RET_VALUE;\record('parse_news',...$args);return 'base-news';}}
namespace itemmain {function parse_itmk_words($value,$simple){\record('kind',$value,$simple);return '种类:'.$value;}function parse_itmsk_words($value,$simple){\record('special',$value,$simple);return $value==='0'?'':'属性:'.$value;}function itemget(){$values=[];foreach(['itm0','itmk0','itme0','itms0','itmsk0']as $key)$values[]=get_var_in_module($key,'player');\record('itemget',...$values);}}
namespace itemmix {function template($name){$GLOBALS['templateName']=$name;return __DIR__.'/fixture.htm';}function addnews($time,$kind,$a='',$b='',$c='',$d='',$e=''){\record('news',$time,$kind,$a,$b,$c,$d,$e);}}
namespace mixfixture {function itemmix_name_proc($name){if(eval(__MAGIC__))return $___RET_VALUE;\record('name',$name);return $chprocess($name);}}
namespace {require GAME_ROOT.'include/modules/base/itemmix/itemmix/main.php';require GAME_ROOT.'include/modules/base/itemmix/itemmix/config/itemmix.config.php';function reset_state($module,$values){foreach($values as $key=>$value)$GLOBALS['___LOCAL_'.strtoupper($module).'__VARS__'.$key]=$value;}$states=$input['states'];$states['itemmix']=['mix_type'=>['normal'=>''],'itmname_ignore'=>$itmname_ignore,'mixinfo'=>$mixinfo];$states['mixfixture']=[];
foreach($states as $module=>$values){$imports='';foreach($values as $key=>$value){$global='___LOCAL_'.strtoupper($module).'__VARS__'.$key;$imports.='global $'.$global.';$'.$key.'=&$'.$global.';';}define('MOD_'.strtoupper($module),true);define('IMPORT_MODULE_'.strtoupper($module).'_GLOBALS',$imports);}foreach($input['order']as $module)foreach(get_defined_functions()['user']as $fn)if(strpos($fn,$module.'\\')===0&&$fn!==$module.'\\init'&&$fn!=='itemmix\\template'&&$fn!=='itemmix\\addnews')hook_register($module,substr($fn,strlen($module)+1));
$out=[];foreach($input['cases']as $case){$trace=[];foreach($case['states']as $module=>$values)reset_state($module,$values);reset_state('itemmix',array_replace($states['itemmix'],$case['itemmix']??[]));$returns=[];ob_start();echo 'PRIOR';foreach($case['calls']as $entry){$fn='itemmix\\'.array_shift($entry);$returns[]=call_user_func_array($fn,$entry);}$output=['returns'=>$returns];foreach(['sys','player']as $module)foreach($case['states'][$module]as $key=>$value)$output[$module][$key]=get_var_in_module($key,$module);$output['log']=get_var_in_module('log','logger');$output['trace']=$trace;$output['buffer']=ob_get_contents();ob_end_clean();$out[]=json_encode($output,JSON_UNESCAPED_UNICODE|JSON_PRESERVE_ZERO_FRACTION);}echo '['.implode(',',$out).']';}
`;

test('itemmix retains all original functions, dependencies and 473 recipes',async()=>{const base=path.join(project,'engine/include/modules/base/itemmix/itemmix'),source=await readFile(path.join(base,'main.php'),'utf8'),header=await readFile(path.join(base,'module.inc.php'),'utf8');assert.deepEqual(Object.keys(itemmixModule.functions).sort(),[...source.matchAll(/^\s*function\s+(\w+)\s*\(/gm)].map(match=>match[1]).filter(name=>name!=='init').sort());for(const[key,field]of[['dependency','dependencies'],['dependency_optional','optionalDependencies'],['templatelist','templates']])assert.deepEqual(itemmixModule[field],header.match(new RegExp('\\$___MODULE_'+key+" = '([^']*)'"))[1].split(' ').filter(Boolean));const config=JSON.parse(await readFile(path.join(project,'native/gameplay/base-extra/itemmix-config.json'),'utf8'));assert.equal(createHash('sha256').update(await readFile(path.join(project,config.source))).digest('hex'),config.sha256);assert.equal(config.values.mixinfo.length,473);});

test('every original recipe, inventory consumption, selection and templates agree with PHP 7.4',{timeout:120_000},async t=>{const php=process.env.DTS_REFERENCE_PHP||'php',version=spawnSync(php,['-r','echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'],{encoding:'utf8',windowsHide:true});if(version.error?.code==='ENOENT'||version.stdout!=='7.4'){t.skip('Requires PHP 7.4 development oracle.');return;}const parent=path.join(project,'var/tests');await mkdir(parent,{recursive:true});const temporary=await mkdtemp(path.join(parent,'native-base-extra-mix-'));
try{for(const file of ['include/global.func.php','include/bubblebox.func.php','include/roommng/roommng.config.php','include/modules/modules.func.php','include/modules/base/itemmix/itemmix/main.php','include/modules/base/itemmix/itemmix/config/itemmix.config.php']){const target=path.join(temporary,'engine',file);await mkdir(path.dirname(target),{recursive:true});await copyFile(path.join(project,'engine',file),target);}await mkdir(path.join(temporary,'engine/include/modulemng'),{recursive:true});await writeFile(path.join(temporary,'engine/include/modulemng/modulemng.config.php'),'<?php $___MOD_CODE_ADV2=0;$___MOD_SRV=0;');await writeFile(path.join(temporary,'fixture.htm'),String.raw`<?php \record('render',$GLOBALS['templateName'],$mix_res??null,$itemselect??null);if($GLOBALS['templateName']==='start'&&!empty($GLOBALS['case']['startMutation']))$cmd='START-MUTATED';echo '<fixture:'.$GLOBALS['templateName'].'>';`);await writeFile(path.join(temporary,'oracle.php'),oracle);const cases=scenarios(),registry=new ModuleRegistry([...boundaries(cases[0],[]),itemmixModule,fixture([])]),expected=spawnSync(php,[path.join(temporary,'oracle.php')],{input:JSON.stringify({states:states(),order:registry.order,cases:cases.map(input=>({...input,states:states(input)}))}),encoding:'utf8',windowsHide:true,timeout:60_000,maxBuffer:96*1024*1024});assert.equal(expected.status,0,expected.stderr);assert.equal(expected.stderr,'');const outputs=JSON.parse(expected.stdout);for(const[index,input]of cases.entries())assert.deepEqual(await actual(input),outputs[index],input.label);t.diagnostic('Compared '+cases.length+' PHP cases: all 473 recipes, strict durability, professions, hook order, selection, original scope and output buffers.');}finally{assert.ok(path.resolve(temporary).startsWith(path.resolve(parent)+path.sep));await rm(temporary,{recursive:true,force:true});}});

test('original mix controls and actual itemmain update the live inventory',async()=>{let session;const output=createOutput(),templates=createTemplateServices({session:()=>session,enabledModules:['itemmix','itemmain'],output});const modules=boundaries({sys:{mode:'command',command:'itemmain'},input:{itemcmd:'itemmix'}},[]).filter(module=>module.name!=='itemmain');session=await new ModuleRegistry([...modules,{name:'map',state:()=>({})},itemModule,itemmixModule]).createSession({states:{itemmix:{mixinfo:[recipe]}},services:{templates,output}});output.write('DISCARD');await session.call('itemmix','act');assert.ok(!session.state('player').cmd.includes('DISCARD'));assert.match(session.state('player').cmd,/id="mitm1" name="mitm1"/);assert.match(session.state('player').cmd,/postCmd\('gamecmd','command.php'\)/);await session.call('itemmix','itemmix',[1,2]);assert.equal(session.state('player').itms1,2);assert.equal(session.state('player').itms2,2);assert.equal(session.state('player').itm3,'成品');assert.equal(session.state('player').itms3,2);assert.equal(session.state('player').wd,11);const choices=[recipe,{...recipe,result:['另一个','WP',30,5]}];session.state('itemmix').mixinfo=choices;session.state('sys').mode='itemmain';session.state('sys').command='itemmix';session.state('input').mixmask=3;session.state('player').cmd='';await session.call('itemmix','act');assert.match(session.state('player').cmd,/id="mixmask" name="mixmask" value="3"/);assert.match(session.state('player').cmd,/id="itemselect" name="itemselect" value="-1"/);assert.match(session.state('player').cmd,/成品/);assert.match(session.state('player').cmd,/另一个/);});

// Generated modules create insertion-ordered PHP arrays as Maps. They must
// cross the handwritten boundary without losing recipe fields or selected keys.
test('generated ordered-array recipe overrides retain normal selection and consumption', async()=>{
 const map=value=>value&&typeof value==='object'?new Map(Object.entries(value).map(([key,child])=>[/^(?:0|-?[1-9]\d*)$/.test(key)?Number(key):key,map(child)])):value;
 const input={calls:[['itemmix',[2,1],1]],itemmix:{mixinfo:[recipe,{...recipe,result:['第二成品','WP',20,5]}]}};
 const expected=await actual(input);const mapped={...input,itemmix:{mixinfo:map(input.itemmix.mixinfo)},calls:[['itemmix',new Map([[0,2],[1,1]]),1]]};assert.deepEqual(await actual(mapped),expected);
});
