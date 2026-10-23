import fs from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {privateAccountPath} from './private-files.mjs';
import banlist from './banlist.json' with {type:'json'};
import adminConfig from './admin-config.json' with {type:'json'};
import sysConfig from '../system/sys-config.json' with {type:'json'};
import roomConfig from '../system/room-config.json' with {type:'json'};
import mapConfig from '../gameplay/map-config.json' with {type:'json'};
import restConfig from '../gameplay/base-extra/rest-config.json' with {type:'json'};
import cooldownConfig from '../gameplay/base-extra/cooldown-config.json' with {type:'json'};
import teamConfig from '../gameplay/base-extra/team-config.json' with {type:'json'};
import htmlEntities from '../templates/html-entities.json' with {type:'json'};
import {text,present,sameDurability} from '../gameplay/numbers.mjs';
import {gencode} from '../protocol/codec.mjs';
import {matchesBan} from './primitives.mjs';

const int=value=>Math.trunc(Number.parseFloat(value)||0),astr=value=>text(value).replaceAll('eval','');
const htmlNames=new Map(Object.entries(htmlEntities).map(([character,entity])=>[entity,character]));
export function decodeAdminHtml(value,{quotes=false}={}){return text(value).replace(/&(?:#(?:x[0-9a-f]+|\d+)|[a-z][\da-z]+);/gi,entity=>{
 let character=htmlNames.get(entity);if(entity.startsWith('&#')){const hex=entity[2].toLowerCase()==='x',point=Number.parseInt(entity.slice(hex?3:2,-1),hex?16:10);if(point>0&&point<=0x10ffff&&!(point>=0xd800&&point<=0xdfff))character=String.fromCodePoint(point);}
 return character==null||(!quotes&&character==="'")?entity:character;
 });}
const serverFormat={authkey:'',bbsurl:'',gtitle:'',gameurl:'',server_address:'',homepage:'',moveut:'int',moveutmin:'int',tplrefresh:'b',errorinfo:'b',userdb_remote_storage:'',userdb_remote_storage_sign:'',userdb_remote_storage_pass:'',replay_remote_send:'b',replay_remote_storage:'',replay_remote_storage_sign:'',replay_remote_storage_key:''};
const globalFormat={adminmsg:'html',systemmsg:'html',startmode:'int',starthour:'int',startmin:'int',readymin:'int',iplimit:'int',newslimit:'int',alivelimit:'int',winlimit:'int',chatlimit:'int',chatrefresh:'int',chatinnews:'int',max_room_num:'int',disable_access:'int',disable_event:'int',disable_newgame:'int',disable_newroom:'int'};
const gameFormat={sys:{validlimit:'int',splimit:'int',hplimit:'int',hack_obbs:'int'},map:{areaadd:'int',areawarntime:'int',arealimit:'int',areaesc:'b'},gameflow_antiafk:{antiAFKertime:'int'},corpse:{corpseprotect:'int'},rest:{rest_sleep_time:'int',rest_heal_time:'int'},cooldown:{coldtimeon:'b',movecoldtime:'int',searchcoldtime:'int',itemusecoldtime:'int',showcoldtimer:'b'},team:{teamlimit:'int'}};
export const defaultAccountBans=Object.freeze({nameLimit:banlist.nameLimit,ipLimit:banlist.ipLimit});
const empty=()=>({account:{},server:{},game:{},messages:{},room:{}});
const merge=(base,extra)=>{const result=structuredClone(base);for(const category of ['account','server','messages','room'])Object.assign(result[category],extra?.[category]);for(const [module,fields]of Object.entries(extra?.game??{}))result.game[module]={...result.game[module],...fields};return result;};

/** JSON overrides are read by the host for every new request and survive a
 * restart. PHP source is never parsed, evaluated or rewritten. Unknown keys in
 * the private file fail closed instead of becoming arbitrary module globals. */
export function createAdminConfigurationService({stateRoot,defaults={},accounts,admin,clock=()=>Date.now()/1000}){
 const serverDefaults={...sysConfig['server.config.sample.php'],...sysConfig['system.config.sample.php']};
 const initial=merge({account:defaultAccountBans,server:Object.fromEntries(Object.keys(serverFormat).map(key=>[key,serverDefaults[key]??''])),game:{sys:sysConfig['game.config.sample.php'],map:mapConfig,rest:restConfig.values,cooldown:cooldownConfig.values,team:teamConfig.values,corpse:{corpseprotect:10},gameflow_antiafk:{}},messages:{adminmsg:'',systemmsg:''},room:roomConfig.values},defaults);
 const permitted=(category,key,module)=>category==='account'?['nameLimit','ipLimit'].includes(key):category==='server'?Object.hasOwn(serverFormat,key):category==='messages'?['adminmsg','systemmsg'].includes(key):category==='room'?key==='max_room_num':category==='game'&&(Object.hasOwn(gameFormat[module]??{},key)||(module==='sys'&&Object.hasOwn(globalFormat,key)&&!['adminmsg','systemmsg','max_room_num'].includes(key)));
 const read=async()=>{let data;try{data=JSON.parse(await fs.readFile(await privateAccountPath(stateRoot,'native-admin-config.json'),'utf8'));}catch(error){if(error.code==='ENOENT')return empty();throw error;}
  if(data.version!==1||!data.overrides||typeof data.overrides!=='object')throw new Error('Invalid native administrator configuration');const overrides=data.overrides;
  for(const [category,fields]of Object.entries(overrides)){if(!Object.hasOwn(empty(),category)||!fields||typeof fields!=='object'||Array.isArray(fields))throw new Error('Invalid native administrator configuration category');for(const [key,value]of Object.entries(fields)){
   if(category==='game'){if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid native game configuration');for(const [field,scalar]of Object.entries(value))if(!permitted(category,field,key)||!['string','number'].includes(typeof scalar))throw new Error('Invalid native game override');}
   else if(!permitted(category,key)||!['string','number'].includes(typeof value))throw new Error('Invalid native administrator override');
  }}return merge(empty(),overrides);
 };
 const getSnapshot=async()=>merge(initial,await read());
 const page=async(command,input,scope,request={})=>{
  await accounts.authorizeAdmin(scope,command);const overrides=await read(),current=merge(initial,overrides),lang={...adminConfig.lang,...scope.lang},post=request.input?.post??input;let info=false,changed=0,edlist={};
  const set=(category,key,value,module)=>{if(category==='game'){overrides.game[module]??={};overrides.game[module][key]=value;current.game[module]??={};current.game[module][key]=value;}else{overrides[category][key]=value;current[category][key]=value;}};
  if(command==='banlistmng'&&input.command==='write'){
   const names=astr(input.postnmlmt),ips=astr(input.postiplmt);
   // Native RegExp accepts the snapshot's PCRE subset. Unsupported patterns are
   // rejected here before persistence, rather than silently changing policy.
   matchesBan(names,'');matchesBan(ips,'');set('account','nameLimit',names);set('account','ipLimit',ips);changed=1;info='新的屏蔽列表已经写入。';
  }else if(input.command==='edit'){
   info='';const groups=command==='gamecfgmng'?gameFormat:{flat:command==='configmng'?serverFormat:globalFormat};
   for(const [module,fields]of Object.entries(groups))for(const [key,format]of Object.entries(fields))if(post[key]!=null){
    const category=command==='configmng'?'server':command==='gamecfgmng'?'game':['adminmsg','systemmsg'].includes(key)?'messages':key==='max_room_num'?'room':'game',owner=category==='game'?(command==='gamecfgmng'?module:'sys'):null;
    const old=category==='game'?current.game[owner]?.[key]:current[category][key],value=format==='int'?int(post[key]):format==='b'?int(post[key])!==0?1:0:format==='html'?decodeAdminHtml(astr(post[key])):astr(post[key]);
    if(sameDurability(old??null,value))continue;changed++;set(category,key,value,owner);info+=`${lang[key]??''} ${value===''?'已清空<br>':'修改为 '+text(value)+' <br>'}`;
    if(command==='gamecfgmng'){const group=module==='sys'?'game':module;edlist[group]??={};edlist[group][key]=value;}else edlist[key]=value;
   }
   info+=`提交的修改请求数量： ${changed} <br>`;
  }
  if(changed){const file=await privateAccountPath(stateRoot,'native-admin-config.json'),temp=await privateAccountPath(stateRoot,'native-admin-config.'+randomBytes(12).toString('hex')+'.tmp');
   await fs.writeFile(temp,JSON.stringify({version:1,overrides},null,2)+'\n',{flag:'wx',mode:0o600});try{await fs.rename(temp,file);}catch(error){await fs.unlink(temp);throw error;}
   if(command==='banlistmng')await admin.recordAudit(scope,'editbanlist',gencode(current.account.nameLimit),gencode(current.account.ipLimit));else{await admin.recordAudit(scope,command,gencode(edlist));info+=({configmng:'服务参数已修改',globalgamemng:'系统环境修改完毕',gamecfgmng:'游戏数据修改完毕'})[command];}
  }
  const context={...scope,...current.server,...current.game.sys,...current.messages,...current.room,...Object.assign({},...Object.values(current.game)),cmd_info:info};
  if(command==='banlistmng'){context.nmlimit=current.account.nameLimit;context.iplimit=current.account.ipLimit;}
  if(command==='globalgamemng')context.startmode_input=Array.from({length:4},(_,i)=>`<input type="radio" name="startmode" value="${i}"${Number(context.startmode)===i?' checked':''}>${lang['startmode_'+i]}<br>`).join('');
  if(command==='configmng'){const date=value=>{const d=new Date(value*1000);return `${d.getUTCFullYear()}${lang.year}${d.getUTCMonth()+1}${lang.month}${d.getUTCDate()}${lang.day}${d.getUTCHours()}${lang.hour}${d.getUTCMinutes()}${lang.min}`;};context.orin_time=date(clock());context.set_time=date(clock()+Number(context.moveut??0)*3600+Number(context.moveutmin??0)*60);}
  return {template:command==='gamecfgmng'?'admin_gamecfg':'admin_'+command,context};
 };
 return Object.freeze({getSnapshot,page});
}
