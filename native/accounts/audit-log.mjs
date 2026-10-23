import adminConfig from './admin-config.json' with {type:'json'};
import language from './log-language.json' with {type:'json'};
import entities from '../templates/html-entities.json' with {type:'json'};
import {gdecode,protocolJson} from '../protocol/codec.mjs';
import {text,isNumeric,present} from '../gameplay/numbers.mjs';
const entries=value=>value instanceof Map?[...value]:Object.entries(value??{}),values=value=>entries(value).map(([,item])=>item);
const html=value=>[...text(value)].map(character=>entities[character]??character).join('');
const game=(room,num)=>(present(room)?'房间区':'')+'第'+text(num)+'局';
const date=value=>{const d=new Date(Number(value)*1000),pad=value=>String(value).padStart(2,'0');return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours()%12||12)}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;};

/** Render persisted original-format admin log rows; unknown historic operations
 * retain their original fallback text instead of disappearing from the audit. */
export function parseAdminAudit(content,{lang={},wthinfo={},gstate={},gtinfo={}}={}){
 lang={...language,...adminConfig.lang,...lang};const result=[];
 for(const line of content.split(/\r?\n/)){const [timestamp,user,operation,p1='',p2='',p3='']=line.split(',');if(!isNumeric(timestamp))continue;let action='',detail='',gameNumber='';
  if(operation==='infomng')action='游戏自检';
  else if(operation==='killafker'){action='手动清挂机';gameNumber=game(p1,p2);detail=values(gdecode(p3)).join(' ');}
  else if(operation==='roomclose'){action='关闭房间';detail=p1+'号房间';}
  else if(['addgm','delgm','editgm'].includes(operation)){action={addgm:'添加权限',delgm:'删除权限',editgm:'修改权限'}[operation];detail=`账户 <span class="cyan b">${p1}</span> → <span class="yellow b">${Math.trunc(Number(p2)||0)}权限</span>`;}
  else if(operation==='editbanlist'){action='修改屏蔽词/IP';detail='用户名屏蔽：<br>'+html(gdecode(p1))+'<br>IP屏蔽：<br>'+html(gdecode(p2));}
  else if(['configmng','gamecfgmng','globalgamemng','systemmng'].includes(operation)){
   action=lang[operation]??'';for(let [key,value]of entries(gdecode(p1))){if(['adminmsg','systemmsg'].includes(key))value='<a title="'+text(value).replaceAll('"',"'")+'">悬浮查看</a>';key=lang[key]??key;
    if(value&&typeof value==='object'){for(let [subkey,subvalue]of entries(value)){subkey=lang[subkey]??subkey;detail+=subkey+' → '+text(subvalue)+'<br>';}}
    else detail+=key+' → '+(key.includes('密码')?'****':text(value))+'<br>';
   }
  }else if(['wthedit','hackedit','gsedit','gameover','addarea','gametypeset'].includes(operation)){
   action={wthedit:'修改天气',hackedit:'修改禁区状态',gsedit:'游戏状态设置',gameover:'中止游戏',gametypeset:'修改游戏类别',addarea:p3==='I'?'立刻增加禁区':p3==='L'?'60s后增加禁区':''}[operation];
   detail=operation==='wthedit'?text(wthinfo[p3]):operation==='hackedit'?present(p3)?'解除':'未解除':operation==='gsedit'?text(gstate[p3]):operation==='gametypeset'?text(gtinfo[p3]):'';gameNumber=game(p1,p2);
  }else if(['killpc','livepc','delpc','delcp','editpc','killnpc','livenpc','delnpc','delncp','editnpc'].includes(operation)){
   action=(operation.startsWith('kill')?'杀死':operation.startsWith('live')?'复活':operation.startsWith('del')?'清除':'修改')+(operation.at(-3)==='n'?'NPC':'玩家')+(operation.endsWith('cp')?'尸体':'');
   if(operation.startsWith('edit')){const [room,num]=p1.split('_');gameNumber=game(room,num);detail=`<span class="yellow b">${p2}</span> 修改内容：<br>`;for(const [key,value]of entries(gdecode(p3)))detail+=(lang[key]??({pls:'当前位置',nskill:'添加技能',nskilldel:'删除技能',nskillpara:'技能参数修改',nskillparadel:'技能参数删除'})[key]??key)+' → '+text(value)+'<br>';}
   else{gameNumber=game(p1,p2);detail='<span class="yellow b">'+p3+'</span>';}
  }else if(operation==='downloadurdata')action='下载用户数据库';
  else if(operation==='uploadurdata')action='上传并覆盖用户数据库';
  else if(['banur','unbanur','delur','delur2','editur'].includes(operation)){
   action={banur:'封禁账户',unbanur:'解封账户',delur:'删除账户',delur2:'批量删除账户',editur:'修改账户数据'}[operation];detail='<span class="yellow b">'+p1+'</span>';
   if(operation==='editur'){detail+=' 修改内容：<br>';for(let [key,value]of entries(gdecode(p2))){if(value&&typeof value==='object')value=protocolJson(value);key=lang[key]??key;if(key==='gender')key='默认性别';else if(key==='gold')key='切糕';else if(['a_achievements','cardlist'].includes(key)){key=key==='a_achievements'?'成就':'卡片';value='<a title="'+text(value).replaceAll('"',"'")+'">悬浮查看</a>';}detail+=key+' → '+text(value)+'<br>';}}
  }else if(operation==='sendmessageur'){action='发送站内邮件';detail='收件账户：<span class="yellow b">'+p1+'</span>&nbsp;&nbsp;&nbsp;';if(p2!=='Array')detail+='邮件标题：'+text(gdecode(p2));}
  else{action=operation;detail=p1+' '+p2+' '+p3;}
  result.push([date(timestamp),user,action,detail,gameNumber]);
 }
 return result;
}
