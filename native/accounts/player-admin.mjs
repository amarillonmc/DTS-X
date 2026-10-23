import {text,present,isNumeric,sameDurability} from '../gameplay/numbers.mjs';
import {protocolJson,gencode} from '../protocol/codec.mjs';
import {decodeAdminHtml} from './configuration.mjs';

const int=value=>Math.trunc(Number.parseFloat(value)||0),entries=value=>value instanceof Map?[...value]:Object.entries(value??{});
const pfields=['gd','icon','club','sNo','hp','mhp','sp','msp','ss','mss','att','def','pls','lvl','exp','money','skillpoint','bid','inf','rage','state','pose','tactic','killnum','npckillnum','wp','wk','wg','wc','wd','wf','card','cardname','action','rp','teamID','teamPass',...['wep','arb','arh','ara','arf','art'].flatMap(name=>[name,name+'k',name+'e',name+'s',name+'sk']),...Array.from({length:7},(_,i)=>['itm','itmk','itme','itms','itmsk'].map(prefix=>prefix+i)).flat()];
const decode=value=>{try{return JSON.parse(decodeAdminHtml(value,{quotes:true}))||[];}catch{return [];}};
const assocDiff=(next,old)=>new Map(entries(next).filter(([key,value])=>!entries(old).some(([oldKey,oldValue])=>String(oldKey)===String(key)&&text(oldValue)===text(value))));

/** pcmng.php and npcmng.php intentionally have different death flags, counters,
 * corpse display state and endtime updates. Keep these administrator actions
 * separate from normal combat deaths and execute their real SQL unchanged. */
export async function playerAdminPage({npc,input,scope,session,database,admin,showLimit=50}){
 const sys=session.state('sys'),call=(module,name,...args)=>session.call(module,name,...args),prefix=npc?'npc':'pc',label=npc?'NPC':'玩家',type=npc?"type>'0'":"type='0'";
 const audit=(...args)=>admin.recordAudit(scope,...args),news=(...args)=>call('sys','addnews',...args),save=()=>call('sys','save_gameinfo');
 let command=input.command??'list',start=int(input.start),checkmode=input.checkmode??'',checkinfo=input.checkinfo??'',info='',resultinfo='',selected=null;
 if(input.pagemode==='up')start=Math.max(0,start-showLimit);else if(input.pagemode==='down')start+=showLimit;else if(input.pagemode==='ref')start=0;
 // A negative offset was invalid SQL in the source. Fail before sending it.
 if(start<0)throw new RangeError('Administrator page offset must be nonnegative');
 const search=async()=>{let where=type,sort='',none=false;
  if(checkmode==='name'&&present(checkinfo))where=`name LIKE ${database.escape('%'+text(checkinfo)+'%')} AND ${type}`;
  else if(checkmode==='teamID'){if(present(checkinfo)){where=`teamID LIKE ${database.escape('%'+text(checkinfo)+'%')} AND ${type}`;sort=' ORDER BY teamID';}else sort=' ORDER BY teamID DESC';}
  else if(!npc&&checkmode==='club'){if(present(checkinfo))where=`club=${database.escape(checkinfo)} AND ${type}`;else sort=' ORDER BY club';}
  else if(npc&&checkmode==='pls'){
   sort=' ORDER BY pls';if(present(checkinfo)){const ids=entries(session.state('map').plsinfo).filter(([,name])=>text(name).includes(text(checkinfo))).map(([key])=>int(key));if(isNumeric(checkinfo))ids.push(int(checkinfo));if(ids.length)where=`pls IN (${ids.join(',')}) AND ${type}`;else none=true;}
  }
  const rows=none?[]:await database.query(`SELECT * FROM ${sys.tablepre}players WHERE ${where}${sort} LIMIT ${start},${showLimit}`);
  if(!rows.length){info='没有符合条件的角色。';resultinfo=`位置：第${start+1}条记录`;}else resultinfo=`第${start+1}条-第${start+rows.length}条记录`;return rows;
 };
 let rows=command==='submitedit'?[]:await search();
 if(['kill','live','del'].includes(command)){
  const active=new Map(),dead=new Map(),invalid=[],unchanged=[];
  for(let i=0;i<showLimit;i++)if(input[prefix+'_'+i]!=null){const pid=input[prefix+'_'+i],row=rows[i];if(!row||!sameDurability(row.pid,pid)){invalid.push(pid);continue;}
   const name=row.name+(npc?`(PID:${row.pid})`:''),alive=Number(row.hp)>0;
   if((command==='kill'&&!alive)||(command==='live'&&alive)){unchanged.push(name);continue;}
   if(command==='del'&&!alive){dead.set(row.pid,name);if(!npc)row.state=16;await audit(npc?'delncp':'delcp',sys.room_prefix,sys.gamenum,row.name);await news(sys.now,'delcp',row.name);continue;}
   active.set(row.pid,name);row.hp=command==='live'?row.mhp:0;row.state=command==='live'?0:command==='kill'?15:16;
   sys.deathnum=Number(sys.deathnum)+(command==='live'?-1:1);if(!npc)sys.alivenum=Number(sys.alivenum)+(command==='live'?1:-1);
   await audit(command+prefix,sys.room_prefix,sys.gamenum,row.name);await news(sys.now,command==='live'?'alive':command==='kill'?'death15':'death16',row.name);
  }
  if(active.size||dead.size||invalid.length||unchanged.length){
   const word={kill:'被杀死',live:'被复活',del:'被清除'}[command],clear="weps='0',state='16',arbs='0',arhs='0',aras='0',arfs='0',arts='0',itms0='0',itms1='0',itms2='0',itms3='0',itms4='0',itms5='0',itms6='0',money='0'";
   if(active.size){let changes=command==='kill'?"hp='0',state='15'":command==='live'?"hp=mhp,state='0'":"hp='0',"+clear;if(!npc)changes=`player_dead_flag='${command==='live'?0:1}',`+changes+(command==='live'?`,endtime=${database.escape(sys.now)}`:'');
    await database.execute(`UPDATE ${sys.tablepre}players SET ${changes} WHERE pid IN (${[...active.keys()].map(int).join(',')})`);info+=` ${label} ${[...active.values()].join(npc?',':'、')} ${word} 。<br>`;
   }
   if(dead.size){await database.execute(`UPDATE ${sys.tablepre}players SET ${clear} WHERE pid IN (${[...dead.keys()].map(int).join(',')})`);info+=` ${label} ${[...dead.values()].join(',')} 的尸体被清除 。<br>`;}
   if(unchanged.length)info+=` ${label} ${unchanged.join(',')} 已经处于该状态，无法 ${word}  。<br>`;
   if(invalid.length)info+=` PID为 ${invalid.join(',')} 的${npc?'NPC':'玩家'}不存在或位于查询范围外  。<br>`;
   await save();
  }else info='指定的帐户超出查询范围或指令错误。';command='list';
 }else if(command.startsWith('edit')){
  const [,position,id]=command.split('_'),pid=int(id),row=rows[int(position)];
  if(!pid)info='帐户UID错误。';else if(!row||Number(row.pid)!==pid)info='该帐户不存在或超出查询范围。';else{
   selected=(await database.query(`SELECT * FROM ${sys.tablepre}players WHERE pid='${pid}' AND ${type}`))[0];if(!selected)info=`找不到角色 ${row.name} 。`;else{command='check';await call('skillbase','skillbase_load',selected);selected.acquired_list=entries(selected.acquired_list).map(([key])=>key);selected.skillv=protocolJson(selected.acquired_list);selected.skillparav=protocolJson(selected.parameter_list);}
  }
 }else if(command==='submitedit'){
  const pid=int(input.pid),old=(await database.query(`SELECT * FROM ${sys.tablepre}players WHERE pid='${pid}' AND ${npc?"type!='0'":type}`))[0];
  // Upstream issued UPDATE by pid even if the type-filtered SELECT failed.
  // Refuse this cross-category mutation instead of updating an unseen record.
  if(!old)info='该帐户不存在或超出查询范围。';else{
   const next=Object.fromEntries(pfields.map(key=>[key,input[key]??null])),skillValues=decode(input.skillv),skillParameters=decode(input.skillparav),acquired=new Map(entries(skillValues).map(([,key])=>[int(key),1])),parameters=new Map(entries(skillParameters).map(([key,value])=>[String(key),value]));
   const [oldAcquired,oldParameters]=await call('skillbase','skillbase_load_process',old.nskill,old.nskillpara);
   [next.nskill,next.nskillpara]=await call('skillbase','skillbase_save_process',acquired,parameters);
   await database.arrayUpdate(sys.tablepre+'players',next,`pid='${pid}'`);
   if(!database.affected_rows())info=`无法修改角色 ${text(input.name)}`;else{
    const diff=new Map(),added=[...assocDiff(acquired,oldAcquired).keys()].join(' '),lost=[...assocDiff(oldAcquired,acquired).keys()].join(' ');if(added)diff.set('nskill',added);if(lost)diff.set('nskilldel',lost);
    if(protocolJson(parameters)!==protocolJson(oldParameters))diff.set('nskillpara',protocolJson(assocDiff(parameters,oldParameters)));
    for(const key of pfields)if(text(next[key])!==text(old[key]))diff.set(key,next[key]);
    await audit('edit'+prefix,text(sys.room_prefix)+'_'+text(sys.gamenum),text(input.name),gencode(diff));await news(sys.now,'editpc',text(input.name));info=`角色 ${text(input.name)} 的属性被修改了`;
   }
  }rows=await search();
 }
 const context={...scope,...sys,...session.state('map'),command,start,checkmode,checkinfo,showlimit:showLimit,resultinfo,cmd_info:info,[prefix+'data']:rows};if(selected)context[prefix]=selected;
 if(session.hasModule('clubbase'))Object.assign(context,session.state('clubbase'));
 return {template:'admin_'+prefix+'mng',context};
}
