import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createBubbleboxFunctions,parseBubbleStyle,trimBubbleSpaces} from '../native/http/bubbles.mjs';
import {createTemplateServices,createOutput} from '../native/templates/index.mjs';
const project=fileURLToPath(new URL('../',import.meta.url));

test('all bubble helpers and real start/end template bytes match PHP 7.4 source',async t=>{
 const php=process.env.DTS_REFERENCE_PHP||'php',version=spawnSync(php,['-r','echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'],{encoding:'utf8',windowsHide:true});
 if(version.stdout!=='7.4'){t.skip('Requires development-only PHP 7.4');return;}
 const base=path.join(project,'var/tests');await fs.mkdir(base,{recursive:true});const root=await fs.mkdtemp(path.join(base,'native-bubbles-'));
 t.after(async()=>{assert.ok(path.resolve(root).startsWith(path.resolve(base)+path.sep));await fs.rm(root,{recursive:true,force:true});});
 const script=String.raw`<?php define('IN_GAME',true);$input=json_decode(stream_get_contents(STDIN),true);
 function language($file,$id,$dir){return $GLOBALS['input']['project'].'/engine/templates/default/templates.lang.php';}
 function gexit($message){throw new Exception($message);}function template($name){return __DIR__.'/'.$name.'.php';}
 require $input['project'].'/engine/include/template.func.php';require $input['project'].'/engine/include/bubblebox.func.php';
 foreach(['bubblebox_start','bubblebox_end'] as $name)parse_template($input['project'].'/engine/templates/default/'.$name.'.htm',template($name),1,'',1);
 $results=[];foreach($input['styles'] as $style){ob_start();bubblebox_start($style);echo 'CONTENT';bubblebox_end();$results[]=['style'=>$bubblebox_style,'html'=>ob_get_clean(),'get'=>bubblebox_get_style(' width; ')];}
 echo json_encode($results,JSON_UNESCAPED_UNICODE);`;
 const file=path.join(root,'oracle.php');await fs.writeFile(file,script);
 const styles=['','id:pc_icon_selecting;height:510;width:716;cancellable:1;z-index-base:35;', 'id:测试气泡; width: 101 ; height: 51; offset-x: -12;offset-y: 3; margin-top: 7;', 'junk;width:90;id:a:b;unknown:5;opacity:.5;scroll-bar:1;change-to:next', 'width:12px;height:0;margin-left:-1;'];
 const result=spawnSync(php,['-d','display_errors=stderr',file],{input:JSON.stringify({project,styles}),encoding:'utf8',windowsHide:true,timeout:20000});assert.equal(result.status,0,result.stderr);const expected=JSON.parse(result.stdout);
 for(const [i,style] of styles.entries()){
  const output=createOutput();let templates;const functions=createBubbleboxFunctions({templates:()=>templates,output});templates=createTemplateServices({output,functions});
  const html=await output.capture(async()=>{await functions.bubblebox_start(style);await output.write('CONTENT');await functions.bubblebox_end();});
  assert.deepEqual(parseBubbleStyle(style),expected[i].style);assert.equal(html,expected[i].html);assert.equal(functions.bubblebox_get_style(' width; '),expected[i].get);
 }
 assert.equal(trimBubbleSpaces('\f\t Chinese 文 \r\n'),'Chinese 文');
});
