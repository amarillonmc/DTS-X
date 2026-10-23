import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash,randomBytes} from 'node:crypto';
import {privateAccountPath} from './private-files.mjs';
import {createLockServices} from '../storage/locks.mjs';
import {nativeGameplayModules,createNativeGameRegistry} from '../catalog.mjs';
import {loaders as templateLoaders} from '../templates/catalog.mjs';
import metadata from './module-metadata.json' with {type:'json'};
import {AccountError} from './service.mjs';
import {text,present} from '../gameplay/numbers.mjs';

const html=value=>text(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),hash=value=>createHash('sha256').update(value).digest('hex');
const nativeRoot=fileURLToPath(new URL('../',import.meta.url)),sourceMetadata=new Map(metadata.modules.map(entry=>[entry.name,entry]));
const header='<br><span><font size=5>模块管理系统</font></span><br><br>',back='<br><a href="modulemng.php?mode=edit" style="text-decoration: none"><span><font color="blue">[返回编辑模式]</font></span></a><br>';
const required=(owner,key)=>{if(typeof owner?.[key]!=='function')throw new Error(`Native module administration requires ${key} service`);return owner[key].bind(owner);};
export class ModuleAdminError extends Error {}
function normalize(configuration){
 if(!Array.isArray(configuration)||!configuration.length)throw new ModuleAdminError('模块清单不能为空。');const seen=new Set();
 return configuration.map(entry=>{if(!entry||typeof entry.name!=='string'||!/^[a-z_][a-z0-9_]*$/i.test(entry.name)||typeof entry.enabled!=='boolean')throw new ModuleAdminError('模块清单格式错误。');const name=entry.name.toLowerCase();if(seen.has(name))throw new ModuleAdminError(`模块${name}被多次加载。`);seen.add(name);
  const registered=sourceMetadata.get(name),modulePath=entry.path??registered?.path??'';
  if(typeof modulePath!=='string'||modulePath.includes('..')||modulePath.startsWith('/')||modulePath.includes('\\')||/[^a-zA-Z0-9_\-/]/.test(modulePath))throw new ModuleAdminError('模块路径错误。');
  if(registered&&modulePath!==registered.path&&modulePath+'/'!==registered.path)throw new ModuleAdminError(`模块${name}的路径与静态注册不符。`);
  return {name,path:modulePath&& !modulePath.endsWith('/')?modulePath+'/':modulePath,enabled:entry.enabled};
 });
}
async function readState(stateRoot,baseConfig){
 let saved;try{saved=JSON.parse(await fs.readFile(await privateAccountPath(stateRoot,'native-module-state.json'),'utf8'));}catch(error){if(error.code==='ENOENT')return {version:1,active:normalize(baseConfig),candidate:null,checked:null};throw error;}
 if(saved?.version!==1)throw new ModuleAdminError('原生模块状态文件格式错误。');saved.active=normalize(saved.active);
 for(const key of ['candidate','checked'])if(saved[key]){if(!Number.isFinite(saved[key].updatedAt))throw new ModuleAdminError('原生模块候选文件格式错误。');saved[key].entries=normalize(saved[key].entries);}return saved;
}
export async function readModuleConfiguration(stateRoot,baseConfig){return (await readState(stateRoot,baseConfig)).active;}
async function checkedCandidate(state,options){
 if(!state.checked)throw new ModuleAdminError('没有已保存并检查通过的模块候选。');
 if(state.checked.baseHash!==hash(JSON.stringify(state.active)))throw new ModuleAdminError('活动清单已经改变，请重新保存候选清单。');
 const checked=await validateNativeModuleConfiguration(state.checked.entries,options);if(checked.fingerprint!==state.checked.fingerprint)throw new ModuleAdminError('原生构建发生变化，请重新保存候选清单。');return checked;
}
export async function validateStagedModuleConfiguration(stateRoot,baseConfig,options={}){
 return checkedCandidate(await readState(stateRoot,baseConfig),options);
}
/** Offline CLI entry: the caller MUST already own native-process-owner, the
 * same OS lease held for the entire running server. This is a local operator
 * operation, not an HTTP account bypass. Its own module lock serializes state
 * writes and the exact same checked candidate is revalidated before commit. */
export async function activateStagedModuleConfiguration(stateRoot,baseConfig,options={}){
 const locks=await createLockServices(stateRoot);let token;
 try{token=await locks.locks.acquire('module-administration');const state=await readState(stateRoot,baseConfig),checked=await checkedCandidate(state,options);state.active=checked.configuration;state.candidate=null;state.checked=null;await writeState(stateRoot,state);return checked;}
 finally{try{if(token)await locks.locks.release('module-administration',token);}finally{await locks.close();}}
}
async function writeState(stateRoot,state){const target=await privateAccountPath(stateRoot,'native-module-state.json'),temporary=await privateAccountPath(stateRoot,'native-module-state.'+randomBytes(12).toString('hex')+'.tmp');await fs.writeFile(temporary,JSON.stringify(state,null,2)+'\n',{flag:'wx',mode:0o600});try{await fs.rename(temporary,target);}catch(error){await fs.unlink(temporary);throw error;}}

/** Validate the native definitions actually loaded by this Node process and
 * every generated template against its build manifest. No source compilation,
 * PHP parser, eval, HTTP-selected imports, or execution of gameplay hooks. */
export async function validateNativeModuleConfiguration(configuration,{additionalModules=[]}={}){
 const entries=normalize(configuration),registry=createNativeGameRegistry(entries,additionalModules),available=new Map([...nativeGameplayModules,...additionalModules].map(definition=>[definition.name.toLowerCase(),definition]));
 const file=path.join(nativeRoot,'templates/manifest.json'),raw=await fs.readFile(file,'utf8'),manifest=JSON.parse(raw),declared=new Set(manifest.outputs.map(entry=>entry.source));
 for(const entry of entries.filter(entry=>entry.enabled))for(const template of sourceMetadata.get(entry.name)?.templates??available.get(entry.name)?.templates??[])if(!declared.has(template))throw new ModuleAdminError(`模块${entry.name}声明的模板${template}缺少原生构建。`);
 for(const template of manifest.outputs){const target=path.resolve(nativeRoot,'templates',template.output);if(!target.startsWith(path.join(nativeRoot,'templates')+path.sep)||!template.output.startsWith('generated/')||typeof templateLoaders[template.source]!=='function')throw new ModuleAdminError('原生模板清单包含未注册路径。');
  if(hash(await fs.readFile(target))!==template.generatedHash)throw new ModuleAdminError(`原生模板${template.source}与构建清单不一致。`);
  if(typeof(await templateLoaders[template.source]()).default!=='function')throw new ModuleAdminError(`原生模板${template.source}未提供渲染函数。`);
 }
 const order=registry.order,lookup=new Map(entries.map(entry=>[entry.name,entry])),sorted=[...order.map(name=>lookup.get(name)),...entries.filter(entry=>!entry.enabled)];
 const functions=order.map(name=>{const d=available.get(name);return [name,d.dependencies,d.optionalDependencies,d.conflicts,d.initialize?.toString(),Object.entries(d.functions??{}).map(([name,fn])=>[name,fn.toString()])];});
 return {configuration:sorted,order,templateCount:manifest.outputs.length,fingerprint:hash(JSON.stringify(functions)+raw),notice:'原生模块与静态模板验证完成。修改 JavaScript 实现后需重启 Node.js 载入新代码。'};
}

export function moduleTable(configuration,definitions,{readonly=false}={}){
 const available=new Map(definitions.map(entry=>[entry.name.toLowerCase(),entry])),enabled=new Set(configuration.filter(entry=>entry.enabled).map(entry=>entry.name));
 let output='<span><font color="red">红色</font>：损坏的模块或不满足的依赖关系<br><font color="green">绿色</font>：启用的模块或满足的依赖关系<br><font color="grey">灰色</font>：被禁用的模块或不满足的可选依赖关系</span><br><br><table border="1"><tr><td>模块名</td><td>依赖</td><td>可选依赖</td><td>冲突</td><td>操作</td>';
 configuration.forEach((entry,index)=>{const definition=available.get(entry.name),good=!!definition,color=good?entry.enabled?'green':'grey':'red';output+=`<tr><td><font color="${color}">${html(entry.name)}</font></td>`;
  for(const [property,optional,conflict]of [['dependencies',false,false],['optionalDependencies',true,false],['conflicts',true,true]]){output+=conflict?'<td>':'<td style="max-width:600px;word-wrap:break-word">';if(!good)output+='<font color="red">损坏</font>';else for(const dependency of definition[property]??[]){const active=dependency==='root'||enabled.has(dependency),shade=!entry.enabled?'grey':conflict?active?'red':'grey':active?'green':optional?'grey':'red';output+=`<font color="${shade}">${html(dependency)}</font>&nbsp;`;}output+='</td>';}
  output+='<td>';if(!readonly){if(!good&&!entry.enabled)output+='<span><font color="black">[无效]</font></span>';else output+=`<a href="modulemng.php?action=${entry.enabled?'disable':'enable'}&sid=${index}" style="text-decoration: none"><span><font color="${entry.enabled?'red':'blue'}">[${entry.enabled?'禁用':'启用'}]</font></span></a>`;output+=` | <a href="modulemng.php?action=remove&sid=${index}" style="text-decoration: none"><span><font color="red">[删除模块]</font></span></a>`;}output+='</td></tr>';
 });return output+'</table>';
}

/** Candidate editing is file-backed and serialized by real OS locks. Activation
 * drains gameplay through maintenance.run, rechecks code/template fingerprints,
 * then atomically persists and calls the host apply() for subsequent requests. */
export function createModuleAdminService({stateRoot,configuration,additionalModules=[],accounts,maintenance,apply,scheduler,database,tablePrefix='bra_',clock=()=>Date.now()/1000}){
 const definitions=[...nativeGameplayModules,...additionalModules],available=new Map(definitions.map(entry=>[entry.name.toLowerCase(),entry]));
 const authorize=async scope=>{const auth=await accounts.authorizeAdmin(scope);if(Number(auth.group)<9)throw new AccountError('no_power');};
 const locked=async action=>{const locks=await createLockServices(stateRoot);let token;try{token=await locks.locks.acquire('module-administration');return await action();}finally{try{if(token)await locks.locks.release('module-administration',token);}finally{await locks.close();}};};
 const activate=async(scope)=>{await authorize(scope);return required(maintenance,'run')(()=>locked(async()=>{
  const state=await readState(stateRoot,configuration),checked=state.checked;if(!checked)return {body:'文件不存在。<br>'};
  const verified=await checkedCandidate(state,{additionalModules});
  const previous=structuredClone(state);state.active=verified.configuration;state.candidate=null;state.checked=null;await writeState(stateRoot,state);
  try{await required({apply},'apply')(structuredClone(state.active));}catch(error){await writeState(stateRoot,previous);throw error;}
  return {body:header+html(verified.notice)+`<br>已验证${verified.order.length}个模块、${verified.templateCount}个静态模板。<br><font color="green">操作成功完成。修改已经被应用。<br><br></font><a href="modulemng.php" style="text-decoration: none"><span><font color="blue">[返回首页]</font></span></a><br>`,headers:{'Cache-Control':'no-cache'}};
 }));};
 const page=async(request,scope)=>{
  await authorize(scope);if(request.pathname==='/modulemng_activate.php'||request.get?.moduleaction==='activate')return activate(scope);
  return locked(async()=>{
   const state=await readState(stateRoot,configuration),get=request.get??{},post=request.post??{},action=get.action,now=clock();let edit=get.mode==='edit'||action==='reset',message='';state.checked=null;
   if(!state.candidate||now-state.candidate.updatedAt>86400)state.candidate={updatedAt:now,entries:structuredClone(state.active)};
   if(action==='reset'){state.candidate={updatedAt:now,entries:structuredClone(state.active)};message='<span><font color="green">成功重置到原先状态。</font></span><br><br>';}
   else if(get.mode==='autoscan'){
    const seen=new Set(state.active.map(entry=>entry.name)),added=[];for(const [name,definition]of available)if(!seen.has(name)){state.active.push({name,path:sourceMetadata.get(name)?.path??definition.path??'',enabled:false});added.push(name);}
    state.candidate={updatedAt:now,entries:structuredClone(state.active)};edit=true;message=`遍历了${available.size}个模块，检测到${added.length}个新增模块。`+(added.length?'<br>新增模块有：'+added.map(html).join(' ')+'。<br>新增模块默认关闭，请自行开启。<br><br>':'');
   }else if(['enable','disable'].includes(action)){const id=Math.trunc(Number(get.sid));if(id>=0&&id<state.candidate.entries.length)state.candidate.entries[id].enabled=action==='enable';state.candidate.updatedAt=now;edit=true;message='<br>点击保存后修改才能生效！<br><br>';}
   else if(action==='remove'){const id=Math.trunc(Number(get.sid));if(id>=0&&id<state.active.length&&!state.active[id].enabled){state.active.splice(id,1);state.candidate={updatedAt:now,entries:structuredClone(state.active)};}edit=true;}
   else if(post.action==='add'){
    const name=text(post.modname).toLowerCase();if(!available.has(name))throw new ModuleAdminError('仅可添加已经静态注册的原生模块。');const next=normalize([...state.active,{name,path:text(post.modpath).replace(/\/?$/,'/'),enabled:false}]);state.active=next;state.candidate={updatedAt:now,entries:structuredClone(next)};edit=true;
   }else if(action==='save'){
    try{const validated=await validateNativeModuleConfiguration(state.candidate.entries,{additionalModules});state.checked={updatedAt:now,entries:validated.configuration,fingerprint:validated.fingerprint,baseHash:hash(JSON.stringify(state.active))};state.candidate={updatedAt:now,entries:structuredClone(state.active)};await writeState(stateRoot,state);
     return {body:header+'<span>没有发现致命错误，请阅读以下日志，如没有问题，请点击“<font color="red">应用更改</font>”按钮令更改生效。</span><br><br>'+html(validated.notice)+'<br><br><a href="modulemng_activate.php" style="text-decoration: none"><span><font color="red">[应用更改]</font></span></a>&nbsp;&nbsp;'+back};
    }catch(error){await writeState(stateRoot,state);return {body:header+'<font color="red">'+html(error.message)+'</font>'+back};}
   }
   await writeState(stateRoot,state);
   if(!edit)return {body:header+'<font color="green">Node.js 原生模块及静态模板</font><br>PHP ADV 缓存与驻留进程选项不再适用。<br><br><a href="modulemng.php?mode=autoscan" style="text-decoration: none"><span><font color="red">[自动检测新增模块]</font></span></a><br><a href="modulemng.php?mode=edit" style="text-decoration: none"><span><font color="red">[进入编辑模式]</font></span></a><br><a href="modulemng.php?action=save" style="text-decoration: none"><span><font color="green">[验证模块与模板构建]</font></span></a><br>'};
   return {body:'<br><span><font size=5>模块管理系统<font size=4 color="red"> 编辑模式</font></font></span><br><br>'+message+'<a href="modulemng.php?action=reset" style="text-decoration: none"><span><font color="red">[重置]</font></span></a>&nbsp;&nbsp;<a href="modulemng.php?action=save" style="text-decoration: none"><span><font color="green">[保存]</font></span></a>&nbsp;&nbsp;<a href="modulemng.php" style="text-decoration: none"><span><font color="blue">[返回]</font></span></a><br><br><font color="green">添加模块:</font><br><form method="post" name="addmodule" action="modulemng.php"><input name="action" value="add" type="hidden">模块名<input name="modname" size="20" maxlength="100" type="text">路径<input name="modpath" size="20" maxlength="100" type="text"><input name="enter" value="添加" type="submit"></form>模块必须先在原生静态注册表中注册；此页面只修改启用清单。<br><br>'+moduleTable(state.candidate.entries,definitions)};
  });
 };
 const daemon=async(request,scope)=>{await authorize(scope);const action=present(request.post?.action)?request.post.action:request.get?.action;
  if(['start','stopall','restart'].includes(action)){await required(scheduler,action==='stopall'?'stop':action)();return {status:302,headers:{Location:'daemonmng.php'},body:''};}
  if(present(action)&&text(action).startsWith('stop'))throw new ModuleAdminError('原生宿主只管理本进程调度器，不接受旧 PHP 端口进程命令。');
  const status=await required(scheduler,'status')();return {body:'<br><span><font size=5>Daemon管理系统</font></span><br><br>Node.js 游戏调度器<br>自动调度：<font color="'+(status.enabled?'green':'red')+'">'+(status.enabled?'已开启':'已停止')+'</font><br>当前任务：'+(status.running?'执行中':'空闲')+'<br>调度间隔：'+html(status.intervalMs)+' ms<br>最后运行：'+html(status.lastRunAt??'尚未运行')+'<br>最后错误：'+html(status.lastError?'运行失败；请检查服务器日志':'无')+'<br><br><a href="daemonmng.php?action=start">[启动]</a> <a href="daemonmng.php?action=stopall">[停止调度]</a> <a href="daemonmng.php?action=restart">[重启调度]</a>'};
 };
 const legacyTool=async(pathname,scope)=>{
  await authorize(scope);if(!/^[a-zA-Z0-9_]*$/.test(tablePrefix))throw new TypeError('Invalid account table prefix');
  if(pathname==='/tools_users_table_alter.php'){
   const columns=await required(database,'query')(`DESCRIBE ${tablePrefix}users`),types=new Map(columns.map(column=>[column.Field,column.Type])),changes=[];
   if(!types.has('lastvisit'))changes.push('新增 lastvisit int unsigned DEFAULT 0');
   for(const key of ['validgames','wingames'])if(types.has(key)&&!types.get(key).startsWith('mediumint'))changes.push(`将 ${key} 转换为 mediumint unsigned`);
   if(types.has('lastgame')&&!types.get('lastgame').startsWith('char'))changes.push('将 lastgame 转换为 char(10)');
   return {body:'<h2>历史用户表升级工具（只读审计）</h2><p>对应原 tools_users_table_alter.php。当前原生安装使用完整原始表结构，此历史转换不会自动执行。</p>'+(changes.length?'<p>旧脚本计划：</p><ul>'+changes.map(change=>'<li>'+html(change)+'</li>').join('')+'</ul>':'<p>旧脚本检查的列已符合要求。</p>')+'<p>未执行 ALTER TABLE，现有数据未修改。</p>'};
  }
  if(pathname==='/tools_users_card_reissue.php'){
   const rows=await required(database,'query')(`SELECT COUNT(*) AS n FROM ${tablePrefix}users WHERE lastwin > 1430755201`);
   return {body:'<h2>历史合库补卡工具（只读审计）</h2><p>原 tools_users_card_reissue.php 针对 2015 年合库遗漏奖励，筛选 lastwin &gt; 1430755201 的账户。本库符合该历史时间条件的账户数：'+html(rows[0]?.n??0)+'。</p><p>原脚本存在 explode 参数缺失，以及从已有卡片交集中随机补发的逻辑。当前只保留源码供历史审计，未发送奖励邮件或修改卡片。</p>'};
  }
  return null;
 };
 return Object.freeze({page,activate,daemon,legacyTool,readConfiguration:()=>readModuleConfiguration(stateRoot,configuration),validate:entries=>validateNativeModuleConfiguration(entries,{additionalModules})});
}
