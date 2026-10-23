import {spawn} from 'node:child_process';
import {access,mkdir,mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';

/** Isolated real browser for native acceptance; never attaches to personal
 * profiles/tabs. Artifacts stay under var/tests and cleanup checks containment. */
export async function launchNativeBrowser(t,{outputRoot}) {
  let executable;
  for(const candidate of [process.env.CHROME_PATH,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe','/usr/bin/chromium','/usr/bin/google-chrome'].filter(Boolean)) {
    try{await access(candidate);executable=candidate;break;}catch{}
  }
  if(!executable)throw new Error('Native browser acceptance requires CHROME_PATH or installed Chromium/Edge');
  await mkdir(outputRoot,{recursive:true});const profile=await mkdtemp(path.join(outputRoot,'browser-'));
  const child=spawn(executable,['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--remote-debugging-port=0',`--user-data-dir=${profile}`,'--window-size=1440,1000','about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
  let socket,closing;const errors=[],networkErrors=[],pending=new Map();let sequence=0;
  const close=()=>closing??=(async()=>{
    socket?.close();for(const job of pending.values()){clearTimeout(job.timer);job.reject(new Error('Browser closed'));}pending.clear();
    if(child.exitCode==null&&child.signalCode==null){const exited=new Promise(resolve=>child.once('exit',resolve));child.kill();await Promise.race([exited,new Promise(resolve=>setTimeout(resolve,3000))]);}
    if(!path.resolve(profile).startsWith(path.resolve(outputRoot)+path.sep))throw new Error('Browser cleanup escaped fixture directory');
    await rm(profile,{recursive:true,force:true,maxRetries:10,retryDelay:100});
  })();t.after(close);
  try {
    const endpoint=await new Promise((resolve,reject)=>{let text='';const timer=setTimeout(()=>reject(new Error('Browser startup timeout')),20000);
      child.once('error',error=>{clearTimeout(timer);reject(error);});child.stderr.on('data',part=>{text+=part;const match=text.match(/DevTools listening on (ws:\/\/\S+)/);if(match){clearTimeout(timer);resolve(match[1]);}});
      child.once('exit',()=>{clearTimeout(timer);reject(new Error('Browser exited during startup'));});
    });
    socket=new WebSocket(endpoint);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
    socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id){const job=pending.get(message.id);if(job){pending.delete(message.id);clearTimeout(job.timer);message.error?job.reject(new Error(message.error.message)):job.resolve(message.result);}}
      else if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.exception?.description??message.params.exceptionDetails.text);
      else if(message.method==='Network.responseReceived'&&message.params.response.status>=400)networkErrors.push({url:message.params.response.url,status:message.params.response.status});
      else if(message.method==='Network.loadingFailed'&&!message.params.canceled)networkErrors.push({error:message.params.errorText});
    });
    const cdp=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(new Error('Browser command timeout: '+method));},30000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params,sessionId}));});
    const {targetId}=await cdp('Target.createTarget',{url:'about:blank'}),{sessionId}=await cdp('Target.attachToTarget',{targetId,flatten:true});
    const send=(method,params={})=>cdp(method,params,sessionId);
    await send('Runtime.enable');await send('Page.enable');await send('Network.enable');
    const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text);return result.result.value;};
    const waitFor=async(expression,timeout=20000)=>{const until=Date.now()+timeout;while(Date.now()<until){if(await evaluate(expression))return;await new Promise(resolve=>setTimeout(resolve,50));}throw new Error('Browser condition timeout: '+expression);};
    return {send,evaluate,waitFor,errors,networkErrors,close};
  } catch(error){await close();throw error;}
}
