import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createLockServices } from '../storage/locks.mjs';
import { protectedHeader } from '../system/sys-support.mjs';
import { createCookiePass, createStoredPass } from './primitives.mjs';
import { gencode,gdecode } from '../protocol/codec.mjs';
import { present,text } from '../gameplay/numbers.mjs';
import { privateAccountPath } from './private-files.mjs';

export class AdminInputError extends Error {}

const int=value=>Math.trunc(Number.parseFloat(value)||0);
const required=(owner,method)=>{if(typeof owner?.[method]!=='function')throw new Error(`Account administration requires ${method} service`);return owner[method].bind(owner);};
const decodeHtml=value=>text(value).replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&#039;',"'").replaceAll('&amp;','&');
const nonempty=value=>value&&typeof value==='object'&&Object.keys(value).length>0;

/** Native account management for admin.php's gmlist/urlist handlers.
 * Full user rows and backup bytes contain authentication hashes: these results
 * are for authenticated admin templates/downloads only, never public JSON.
 * Restoration deliberately stages and validates a whole table before atomic
 * replacement; unlike legacy TRUNCATE it cannot erase users on malformed input.
 * A real host maintenance.run callback must drain writers during replacement.
 */
export function createAccountAdminService({accounts,users,database,stateRoot,founder='',showLimit=50,clock=()=>Date.now()/1000,messages,achievements,maintenance}){
 if(!database||!users||!accounts)throw new TypeError('Administration requires native account services');
 const table=users.table; if(!/^[A-Za-z0-9_]+$/.test(table)||!Number.isSafeInteger(showLimit)||showLimit<=0)throw new TypeError('Invalid account administration configuration');
 const privateRoot=async()=>{
   if(typeof stateRoot!=='string'||!path.isAbsolute(stateRoot))throw new TypeError('A private absolute state root is required');
   await fs.mkdir(stateRoot,{recursive:true,mode:0o700});if((await fs.lstat(stateRoot)).isSymbolicLink())throw new Error('Account state root must not be a symlink');
   const root=await fs.realpath(stateRoot),project=path.resolve(fileURLToPath(new URL('../../',import.meta.url)));
   if(root===project||['engine','public'].some(name=>root===path.join(project,name)||root.startsWith(path.join(project,name)+path.sep)))throw new Error('Account backups must be outside public/source directories');
   return root;
 };
 const backupDirectory=async()=>privateAccountPath(await privateRoot(),'gamedata/cache/user_backup',{directory:true});
 const audit=async(actor,operation,...args)=>{
   const root=await privateRoot(),locks=await createLockServices(root);let token;
   try{token=await locks.locks.acquire('accounts/adminlog');const file=await privateAccountPath(root,'gamedata/adminlog_nf.php');let exists=true;try{await fs.lstat(file);}catch(error){if(error.code==='ENOENT')exists=false;else throw error;}
     if(!exists)await fs.writeFile(file,protectedHeader,{flag:'wx',mode:0o600});
     await fs.appendFile(file,[Math.floor(clock()),actor,operation,...args.map(text),''].join(',')+'\n');
   }finally{try{if(token)await locks.locks.release('accounts/adminlog',token);}finally{await locks.close();}}
 };
 const writeBackup=async(prefix='userdb')=>{
   const directory=await backupDirectory(),name=prefix+'_'+randomBytes(12).toString('hex')+'.php';
   const rows=await database.query(`SELECT * FROM ${table}`),data=protectedHeader+rows.map(row=>JSON.stringify(row).replaceAll('/','\\/')+'\r\n').join('');
   await fs.writeFile(path.join(directory,name),data,{flag:'wx',mode:0o600});return {filename:name,bytes:Buffer.from(data),count:rows.length};
 };
 const listBackups=async()=>{const directory=await backupDirectory(),result=[];for(const entry of await fs.readdir(directory,{withFileTypes:true})){if(!entry.isFile()||!/^[-A-Za-z0-9_.]+\.(?:dat|php)$/.test(entry.name))continue;const stat=await fs.stat(path.join(directory,entry.name));result.push({filename:entry.name,modified:stat.mtimeMs/1000,size:stat.size});}return result;};
 const parseBackup=async(bytes,actor)=>{
   if(!Buffer.isBuffer(bytes)&&typeof bytes!=='string')throw new TypeError('Backup content must be bytes or UTF-8 text');
   let content;try{content=Buffer.isBuffer(bytes)?new TextDecoder('utf-8',{fatal:true}).decode(bytes):bytes;}catch{throw new AdminInputError('备份不是有效的UTF-8文本');}
   const columns=new Set((await database.query(`DESCRIBE ${table}`)).map(row=>row.Field)),rows=[];
   for(const line of content.split(/\r?\n/)){if(!line.trim()||line===protectedHeader.trim())continue;let row;try{row=JSON.parse(line);}catch{throw new AdminInputError('上传文件的格式错误');}
     if(!row||Array.isArray(row)||typeof row.username!=='string'||typeof row.password!=='string'||!row.password||Object.entries(row).some(([key,value])=>!columns.has(key)||(value!==null&&!['string','number'].includes(typeof value))))throw new AdminInputError('上传文件的格式错误');rows.push(row);
   }
   if(!rows.length)throw new AdminInputError('不能恢复空用户备份');
   const self=rows.find(row=>row.username===actor.username);if(!self||Number(self.groupid)<Number(actor.groupid))throw new AdminInputError('覆盖后将导致管理员信息不正确');
   return rows;
 };
 const restoreBytes=async(bytes,actor)=>{
   const rows=await parseBackup(bytes,actor),run=required(maintenance,'run');
   return run(async()=>{
     const suffix=randomBytes(10).toString('hex'),stage=table+'_restore_'+suffix,old=table+'_old_'+suffix;let stageOwned=false,oldOwned=false;
     const previous=await writeBackup('old_db');
     try{
       await database.execute(`CREATE TABLE ${stage} LIKE ${table}`);stageOwned=true;
       // Source records are raw database strings, not SQL-preescaped input.
       for(const row of rows)await database.arrayInsert(stage,Object.fromEntries(Object.entries(row).map(([key,value])=>[key,typeof value==='string'?database.escape(value).slice(1,-1):value])));
       const count=(await database.query(`SELECT COUNT(*) AS n FROM ${stage}`))[0].n;if(Number(count)!==rows.length)throw new Error('Restored row count mismatch');
       await database.execute(`RENAME TABLE ${table} TO ${old}, ${stage} TO ${table}`);stageOwned=false;oldOwned=true;
       await audit(actor.username,'uploadurdata');
       await database.execute(`DROP TABLE ${old}`);oldOwned=false;
       return {backup:previous.filename,count:rows.length,cmd_info:`旧数据库已保存为"${previous.filename}"<br>${rows.length}条记录已恢复，用户数据恢复成功`};
     }finally{
       if(stageOwned)await database.execute(`DROP TABLE ${stage}`);
       // Once replacement succeeds, a later audit/cleanup failure leaves the
       // uniquely named previous table for recovery. Never delete it blindly.
       // oldOwned means the previous table remains available to an operator.
     }
   });
 };
 const backup=async scope=>{const {user}=await accounts.authorizeAdmin(scope,'urlist');const result=await writeBackup();await audit(user.username,'downloadurdata');return result;};
 const restore=async(scope,filename)=>{const {user}=await accounts.authorizeAdmin(scope,'urlist');const listed=await listBackups();if(!listed.some(row=>row.filename===filename))throw new AdminInputError('恢复参数错误');const directory=await backupDirectory(),file=path.join(directory,filename);if((await fs.lstat(file)).isSymbolicLink())throw new Error('Backup must not be a symlink');return restoreBytes(await fs.readFile(file),user);};
 const upload=async(scope,bytes)=>{const {user}=await accounts.authorizeAdmin(scope,'urlist');return restoreBytes(bytes,user);};
 const gmList=async(input,scope)=>{
   const {user,group}=await accounts.authorizeAdmin(scope,'gmlist');let info='';
   const data=await users.fetch('uid,username,groupid','groupid > 1','groupid DESC',2,0,{forcedLocal:true});
   const fd=await users.fetchByUsername(founder,{fields:'uid,username,groupid',forcedLocal:true});if(fd){fd.groupid=Number(fd.groupid)>10?fd.groupid:10;data.set(Number(fd.uid),fd);}else info+='创建者账号尚未被注册，请尽快注册！';
   if(input.command==='add'){
     const level=int(input.addgroup);if(!present(input.addname))info='必须填写GM账号';else if(level<2||level>=group||level>10)info='权限设置错误！';
     else{const target=await users.fetchByUsername(input.addname,{fields:'uid,username,groupid',forcedLocal:true});if(!target)info='此账号不存在。';else if(Number(target.groupid)>1)info='此账号已经是管理员！';else{await users.writeRaw({groupid:level},input.addname,{forcedLocal:true});await audit(user.username,'addgm',input.addname,level);target.groupid=level;data.set(Number(target.uid),target);info=`管理员 ${input.addname} 添加成功，权限等级：${level}`;}}
   }else if(['del','edit'].includes(input.command)){
     const id=int(input.adminuid),target=data.get(id),level=int(input[id+'_group']);
     if(!target)info='请输入正确的数据！';else if(input.command==='del'){
       if(Number(target.groupid)>=group)info=`权限不够，不能删除管理员 ${target.username}！`;
       else{await users.update({groupid:1},`uid='${id}'`,{forcedLocal:true});await audit(user.username,'delgm',target.username);data.delete(id);info=`管理员 ${target.username} 的管理权限被删除！`;}
     }else if(level<2||level>=group||level>10)info='权限设置错误！';else if(Number(target.groupid)>=group)info=`权限不够，不能编辑管理员 ${text(input.editname)} ！<br>`;
     else{await users.update({groupid:level},`uid='${id}'`,{forcedLocal:true});await audit(user.username,'editgm',target.username,level);target.groupid=level;info=`管理员 ${target.username} 权限修改成功，权限等级：${level}`;}
   }
   return {template:'admin_gmlist',context:{gmdata:data,cmd_info:info,mygroup:group,command:'gmlist'}};
 };
 const userList=async(input,scope)=>{
   const {user,group}=await accounts.authorizeAdmin(scope,'urlist');
   if(input.pagecmd==='download')return backup(scope);if(input.pagecmd==='recover')return restore(scope,input.recover_file);if(input.pagecmd==='upload')throw new Error('Uploaded bytes must use admin.upload(scope, bytes)');
   let start=int(input.start);if(input.pagemode==='up')start-=showLimit;else if(input.pagemode==='down')start+=showLimit;else if(input.pagemode==='ref')start=0;start=Math.max(0,start);
   const order=['uid','groupid','lastgame'].includes(input.urorder)?input.urorder:'uid',direction=input.urorder2==='ASC'?'ASC':'DESC';
   let where='1',sort=`${order} ${direction}, uid DESC LIMIT ${start},${showLimit}`;
   if(input.pagecmd==='find'){where=`${input.checkmode==='ip'?'ip':'username'} LIKE ${database.escape('%'+text(input.checkinfo)+'%')}`;sort=`uid DESC LIMIT ${start},${showLimit}`;}
   const rows=present(input.urcmd)?await users.fetch('*',where,sort,0,0,{forcedLocal:true}):[];let info=false,command=text(input.urcmd);
   const resultInfo=rows.length?`第${start+1}条-第${start+rows.length}条记录`:`位置：第${start+1}条记录`;
   for(const row of rows){if(!present(row.gender))row.gender='0';row.card_data=JSON.stringify(gdecode(row.card_data));row.a_achievements=JSON.stringify(await required(achievements,'decode')(row));}
   if(present(input.urcmd)&&!rows.length)info='没有符合条件的帐户！';
   if(['ban','unban','del','sendmessage'].includes(command)){
     const success=new Map(),denied=[],outside=[];
     for(let i=0;i<showLimit;i++)if(input['user_'+i]!=null){const id=input['user_'+i],target=rows[i];if(target&&String(target.uid)===String(id)){if(Number(target.groupid)<group||command==='sendmessage'){success.set(target.uid,target.username);if(command==='ban')target.groupid=0;else if(command==='unban')target.groupid=1;else if(command==='del')delete rows[i];}else denied.push(target.username);}else outside.push(id);}
     const word={ban:'封停',unban:'解封',del:'删除',sendmessage:'发送邮件给'}[command];
     if(success.size||denied.length||outside.length){info='';if(success.size){const names=[...success.values()].join(',');if(command==='sendmessage'){for(const name of success.values())await required(messages,'create')(name,input.stitle,input.scontent,input.senclosure,'sys');info+=` 给帐户 ${names} 发送了邮件 。<br>`;await audit(user.username,'sendmessageur',names,gencode(input.stitle??''));}else{const condition='uid IN ('+[...success.keys()].map(id=>int(id)).join(',')+')';if(command==='del')await users.delete(condition);else await users.update({groupid:command==='ban'?0:1},condition,{forcedLocal:true});info+=` 帐户 ${names} 被 ${word} 。<br>`;await audit(user.username,command+'ur',names);}}
       if(denied.length)info+=` 权限不够，无法 ${word} 帐户 ${denied.join(',')} 。<br>`;if(outside.length)info+=` UID为 ${outside.join(',')} 的帐户不在当前查询范围。<br>`;
     }else info='指定的帐户超出查询范围或指令错误。';command='list';
   }else if(command.startsWith('edit')){
     const [,position,idText]=command.split('_'),index=int(position),id=int(idText),target=rows[index];
     if(!id)info='帐户UID错误。';else if(!target||Number(target.uid)!==id)info='该帐户不存在或超出查询范围。';else if(Number(target.groupid)>=group&&target.username!==user.username)info='权限不够，不能修改此帐户信息！';
     else{
       const field=name=>input[name+'_'+index],clean=value=>text(value).replaceAll('eval','');
       const changes={motto:clean(field('motto')),killmsg:clean(field('killmsg')),lastword:clean(field('lastword')),icon:int(field('icon')),gender:['0','m','f'].includes(field('gender'))?field('gender'):'0',gold:clean(field('gold'))};info='';
       if(present(field('pass'))){changes.password=createStoredPass(target.username,createCookiePass(field('pass')));changes.alt_pswd=1;info=`修改了帐户 ${target.username} 的密码！<br>`;}
       let cardData,achievement;try{cardData=JSON.parse(decodeHtml(field('card_data')));}catch{}try{achievement=JSON.parse(decodeHtml(field('a_achievements')));}catch{}
       if(nonempty(cardData))changes.card_data=gencode(cardData);else info+='提交的卡片参数无效，已被忽略！<br>';
       if(nonempty(achievement))changes.u_achievements=await required(achievements,'encode')(achievement);else info+='提交的成就参数无效，已被忽略！<br>';
       await users.writeRaw(changes,target.username,{forcedLocal:true});for(const key of ['motto','killmsg','lastword','icon','gender','gold'])target[key]=changes[key];target.card_data=clean(field('card_data'));target.a_achievements=clean(field('a_achievements'));info+=`帐户 ${target.username} 的信息已修改！`;
       const logged={...changes};delete logged.password;delete logged.alt_pswd;await audit(user.username,'editur',target.username,gencode(logged));
     }command='list';
   }else if(command==='del2'){
     const inactive=await users.fetch('username,uid',`lastgame = 0 AND groupid<='${group}'`,'',0,0,{forcedLocal:true});info='';for(const target of inactive.slice(0,1000)){await audit(user.username,'delur',target.username);await users.delete(`uid='${int(target.uid)}'`);info+=` 帐户 ${target.username} 被删除。<br>`;}
   }
   const backups=await listBackups();return {template:'admin_urlist',context:{urdata:rows,urcmd:command,cmd_info:info,start,showlimit:showLimit,mygroup:group,
     resultinfo:resultInfo,user_backup_list:backups.map(row=>row.filename),user_backup_date_list:backups.map(row=>new Date(row.modified*1000).toISOString().slice(0,19).replace('T',' '))}};
 };
 return Object.freeze({backup,restore,upload,gmList,userList,recordAudit:async(scope,operation,...args)=>{const {user}=await accounts.authorizeAdmin(scope);return audit(user.username,operation,...args);},readAudit:async scope=>{await accounts.authorizeAdmin(scope,'adminlogcheck');try{return await fs.readFile(await privateAccountPath(stateRoot,'gamedata/adminlog_nf.php'),'utf8');}catch(error){if(error.code==='ENOENT')return '';throw error;}},listBackups:async scope=>{await accounts.authorizeAdmin(scope,'urlist');return listBackups();}});
}
