import {present,text,isNumeric,number as n} from '../gameplay/numbers.mjs';
import {gencode} from '../protocol/codec.mjs';
import {utcParts} from '../system/sys-support.mjs';
import {playerAdminPage} from './player-admin.mjs';
import {parseAdminAudit} from './audit-log.mjs';

const int=value=>Math.trunc(Number.parseFloat(value)||0);
const req=(owner,key)=>{if(typeof owner?.[key]!=='function')throw new Error(`Game administration requires ${key} service`);return owner[key].bind(owner);};
const values=value=>value instanceof Map?[...value.values()]:Object.values(value??{});

/** Non-account admin handlers use the real request module chain and persistent
 * services. Their direct SQL effects intentionally retain upstream's distinct
 * admin rules (e.g. AFK removal state 32, versus player death hooks). The host
 * maintenance gate drains concurrent gameplay before modifying shared rows. */
export function createGameAdminService({accounts,admin,session,database,files,maintenance,configuration,clock=()=>Date.now()/1000,showLimit=50}){
 const state=()=>session.state('sys'),call=(module,name,...args)=>session.call(module,name,...args);
 const audit=(scope,...args)=>req(admin,'recordAudit')(scope,...args);
 const save=()=>call('sys','save_gameinfo'),news=(...args)=>call('sys','addnews',...args);
 const handleCore=async(command,input,scope,request)=>{
  const sys=state(),context=Object.assign(Object.create(null),scope),now=sys.now;let info=false,body;
  const merged=(template,extra={})=>({template,context:{...context,...sys,...extra,cmd_info:info}});
  if(command==='pcmng'||command==='npcmng')return playerAdminPage({npc:command==='npcmng',input,scope,session,database,admin,showLimit});
  if(command==='adminlogcheck')return merged('admin_adminlogcheck',{showdata:parseAdminAudit(await req(admin,'readAudit')(scope),{...scope,...sys,...(session.hasModule('weather')?session.state('weather'):{})})});
  // admin.php lists dbmng, but this source snapshot has no corresponding file.
  // Preserve its empty submenu without inventing database administration rules.
  if(command==='dbmng')return {body:'',context:{cmd_info:false}};
  if(command==='rankclear'){
   for(const sql of ['totalcredits=totalcredits+floor(credits/2000)',"credits='0'","elo_playedtimes='0'","elo_rating='1500'","elo_volatility='400'","elo_history=''"])await database.execute(`UPDATE ${sys.gtablepre}users SET ${sql}`);
   return merged('admin_menu');
  }
  if(command==='gamecheck'){
   if(n(sys.gamestate)>=20){sys.validnum=(await database.query(`SELECT pid FROM ${sys.tablepre}players WHERE type=0`)).length;sys.alivenum=(await database.query(`SELECT pid FROM ${sys.tablepre}players WHERE hp>0 AND type=0`)).length;sys.deathnum=(await database.query(`SELECT pid FROM ${sys.tablepre}players WHERE hp<=0 OR state>=10`)).length;await save();await audit(scope,'infomng');info=`状态更新：激活人数 ${sys.validnum},生存人数 ${sys.alivenum},死亡人数 ${sys.deathnum}<br>已重置移动地点缓存数据`;}else info='当前游戏未开始！';return merged('admin_menu');
  }
  if(command==='roomclose'){
   if(input.command==='kill'){
    info='';const rid=text(input.roomtoclose??1);if(!/^\d+$/.test(rid))info='房间不存在！<br>';
    else{const row=(await database.query(`SELECT groomid,groomstatus,gamestate FROM ${sys.gtablepre}game WHERE groomid = ${database.escape(rid)}`))[0];
     if(!row)info='房间不存在！<br>';else if(Number(row.groomstatus)===0)info='房间已经关闭！<br>';else if(Number(row.groomstatus)===40||Number(row.gamestate)>0)info='不能关闭游戏中的房间！<br>';
     else if(!await req(files,'exists')(`gamedata/tmp/rooms/${rid}.txt`))info='房间不存在！<br>';
     else{await database.execute(`UPDATE ${sys.gtablepre}game SET groomstatus = 0 WHERE groomid=${database.escape(rid)}`);await req(files,'remove')(`gamedata/tmp/rooms/${rid}.txt`);info=rid+'号房间已关闭。<br>';await audit(scope,'roomclose',rid);}
    }
   }
   body='<form method="post" name="roomclose" onsubmit="admin.php">\r\n<input type="hidden" name="mode" value="roomclose">\r\n<input type="hidden" name="command" value="kill">\r\n关闭<input type="text" name="roomtoclose" value="1" size="4" maxlength="4">号房间。<br>\r\n<input type="submit" value="提交"><br>\r\n</form>';
   return {body,context:{cmd_info:info}};
  }
  if(command==='antiAFKmng'){
   if(input.command==='kill'){
    info='';const limit=input.timelimit??1;
    if(!isNumeric(limit))info='时间间隔错误！<br>';else if(Number(limit)<3)info='时间间隔太短，可能波及正常玩家。';
    else{info=`将杀死： ${limit} 分钟内没有任何行动的玩家。<br>`;const rows=await database.query(`SELECT * FROM ${sys.tablepre}players WHERE type=0 AND endtime < '${text(n(now)-Number(limit)*60)}' AND hp>'0' AND state<'10'`);
     if(!rows.length)info+='没有符合条件的角色。';else{const affected=[];
      for(const row of rows){const result=await database.execute(`UPDATE ${sys.tablepre}players SET hp='0',state='32' WHERE pid=${database.escape(row.pid)} AND type='0' AND hp>'0' AND state<'10'`);
       if(result.affectedRows){affected.push(row.name);info+=`角色 ${row.name} 被杀死。<br>`;await news(now,'death32',row.name,'',row.pls);sys.alivenum=n(sys.alivenum)-1;sys.deathnum=n(sys.deathnum)+1;}else info+=`无法杀死角色 ${row.name} 。<br>`;
      }
      // In upstream kill_all_AFKer omits room_prefix from global declarations.
      await audit(scope,'killafker',null,sys.gamenum,gencode(affected));await save();
     }
    }
   }
   body='<form method="post" name="antiAFKmng" onsubmit="admin.php">\r\n<input type="hidden" name="mode" value="antiAFKmng">\r\n<input type="hidden" name="command" value="kill">\r\n杀死<input type="text" name="timelimit" value="3" size="4" maxlength="4">分钟内没有行动的玩家。<br>\r\n<input type="submit" value="挂机党都去死吧！"><br>\r\n</form>';
   return {body,context:{cmd_info:info}};
  }
  if(command==='gameinfomng'){
   const weather=session.state('weather'),map=session.state('map'),allowed=[0,1,4,6,7,18,19],operation=text(input.command);
   const record=async(event,value,notification=true)=>{await save();await audit(scope,event,sys.room_prefix,sys.gamenum,value);if(notification)await news(now,({wthedit:'syswthchg',hackedit:'syshackchg',gsedit:'sysgschg',gametypeset:'gametypeset'})[event],value);};
   if(operation==='wthedit'){
    const value=int(input.iweather);if(value===Number(sys.weather))info='当前天气已经为'+text(weather.wthinfo[value])+'，无需修改天气！';else if(weather.wthinfo[value]==null)info='天气数据错误，请重新输入！';else{info='当前天气修改为：'+weather.wthinfo[value];sys.weather=value;await record('wthedit',value);}
   }else if(operation==='hackedit'){
    const value=Number(input.ihack)!==0?1:0;if(value===Number(sys.hack))info='当前禁区已经为该状态，无需修改！';else{info='当前禁区状态修改为：'+(value?'解除':'未解除');sys.hack=value;await record('hackedit',value);}
   }else if(operation.startsWith('gsedit')){
    const value=operation.split('_')[1];
    if(sys.gstate?.[value]==null)info='游戏状态数据错误，请重新输入！';else if(Number(value)===Number(sys.gamestate))info='游戏当前已经处于此状态，请重新输入！';else if(n(sys.gamestate)<10&&Number(value)>20)info='游戏未准备，不可进入后期状态！';else if(n(sys.gamestate)===10&&Number(value)>20)info='游戏未开始，不可进入后期状态！';else if(present(value)&&Number(value)<n(sys.gamestate))info='游戏已开始，状态不可回溯！';
    else if(Number(value)>20){info='当前游戏状态修改为：'+sys.gstate[value];sys.gamestate=value;await record('gsedit',value);}
    else if(Number(value)===20){info='游戏立即开始！请访问任意游戏页面以刷新游戏状态。';sys.starttime=now;await record('gsedit',value);}
    else if(Number(value)===10){info='游戏立即进入准备状态！请访问任意游戏页面以刷新游戏状态。';sys.readymin=n(sys.readymin)>0?sys.readymin:1;sys.starttime=n(now)+n(sys.readymin)*60;await record('gsedit',value,false);}
    else{info=`第 ${sys.gamenum} 局大逃杀紧急中止`;await call('sys','gameover',now,'end6');await save();await audit(scope,'gameover',sys.room_prefix,sys.gamenum);}
   }else if(operation==='sttimeedit'){
    if(present(sys.gamestate))info='本局游戏尚未结束，不能设置时间。';else{let year=int(input.setyear);if(year>=0&&year<=69)year+=2000;else if(year>=70&&year<=100)year+=1900;const time=Date.UTC(year,int(input.setmonth)-1,int(input.setday),int(input.sethour),int(input.setmin),0)/1000;if(time<=n(now))info='开始时间不能早于当前时间。';else{sys.starttime=time;await save();info='游戏开始时间设置成功。';}}
   }else if(operation==='areaadd'){
    const wave=await call('map','get_area_wavenum');if(n(sys.gamestate)<=10)info='本局游戏尚未开始，不能增加禁区。';else if((!present(wave)&&n(sys.starttime)+10>n(now))||(present(wave)&&n(sys.areatime)-n(await call('map','get_area_interval'))*60+10>n(now)))info='禁区到来后10秒内不能增加禁区。';
    else{sys.areatime=now;await save();sys.areatime=n(sys.areatime)+n(await call('map','get_area_interval'))*60;info='下一次禁区时间提前到来。请访问任意游戏页面以刷新游戏状态。';await audit(scope,'addarea',sys.room_prefix,sys.gamenum,'I');await news(now,'sysaddarea');}
   }else if(operation==='areawarn'){
    if(n(sys.gamestate)<=10)info='本局游戏尚未开始，不能增加禁区。';else{sys.areatime=n(now)+60;await save();info='下一次禁区时间已设为60秒后。请访问任意游戏页面以刷新游戏状态。';await audit(scope,'addarea',sys.room_prefix,sys.gamenum,'L');await news(now,'sysaddarea');}
   }else if(operation==='gametypeset'){
    if(!allowed.includes(Number(input.sgtype)))info='游戏类型修改错误！';else if(n(sys.groomtype)>0)info='房间不允许修改下局类型！';else{sys.gamevars??={};sys.gamevars.next_gametype=int(input.sgtype);info='游戏类型修改成功。';await record('gametypeset',input.sgtype);}
   }
   const start=utcParts(present(sys.starttime)?sys.starttime:n(now)+3600),area=utcParts(sys.areatime),display=ids=>values(ids).map((id,index)=>text(map.plsinfo[id])+(index%5===4?'<br>':' ')).join('');
   const dates={};for(const [prefix,p] of [['st',start],['ar',area]])for(const [key,value] of Object.entries(p))dates[prefix+key]=value;if(!present(sys.starttime))dates.stmin=sys.startmin;
   return merged('admin_gameinfomng',{...weather,...map,...dates,sgtypelist:allowed,arealiststr:display(await call('map','get_current_area')),nextarealiststr:display(await call('map','get_current_area',1))});
  }
  if(['configmng','globalgamemng','gamecfgmng','banlistmng'].includes(command))return req(configuration,'page')(command,input,scope,request);
  throw new Error(`Native game administrator handler is not implemented: ${command}`);
 };
 return Object.freeze({async handle(command,input,scope,request={}){
  await accounts.authorizeAdmin(scope,command);return req(maintenance,'run')(()=>handleCore(command,input,scope,request));
 }});
}
