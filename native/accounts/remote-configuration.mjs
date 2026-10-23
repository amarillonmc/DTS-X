import fs from 'node:fs/promises';
import {privateAccountPath} from './private-files.mjs';
import {createRemoteUserClient} from './users.mjs';
import {present,text} from '../gameplay/numbers.mjs';

/** Called once per outgoing game request, with trusted deployment/admin config.
 * Never reuse a client across unrelated requests: its key owns a remote lock
 * lease and users.close() releases that request's key in the host finally. */
export function createConfiguredRemoteUserClient(config={},options={}){
 if(!present(config.userdb_remote_storage))return null;
 const fail=()=>{throw new TypeError('Invalid native remote user configuration');};
 let url;try{url=new URL(text(config.userdb_remote_storage));}catch{fail();}
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.hash)fail();
 const sign=config.userdb_remote_storage_sign,password=config.userdb_remote_storage_pass;
 if(typeof sign!=='string'||!sign||typeof password!=='string'||!password)fail();
 const retries=Math.max(1,Math.trunc(Number(config.userdb_remote_reconnect_times??1))),retryDelayMs=Math.trunc(Number(config.userdb_remote_reconnect_duration??0)),timeoutMs=options.timeoutMs??10000;
 if(!Number.isSafeInteger(retries)||!Number.isSafeInteger(retryDelayMs)||retryDelayMs<0||!Number.isSafeInteger(timeoutMs)||timeoutMs<1)fail();
 return createRemoteUserClient({url:url.href,sign,password,retries,retryDelayMs,timeoutMs,clock:options.clock,fetch:options.fetch});
}

/** Inbound SQL-capable peers are explicitly provisioned by the operator. They
 * must not inherit the public upstream sample secret merely because the game
 * uses the source's default configuration. The optional private JSON schema is
 * {version:1,peers:{SIGN:{pass:SECRET,ip:EXACT_IPV4_OR_EMPTY}}}. Load at startup;
 * keep one receiver/database alive until after HTTP requests have drained.
 * To rotate these peers, drain requests, close old leases, then create a new
 * receiver. The configuration/editor response never exposes this peer file.
 */
export async function readRemoteUserPeers(stateRoot,{configured}={}){
 let peers=configured;
 if(peers===undefined){let data;try{data=JSON.parse(await fs.readFile(await privateAccountPath(stateRoot,'native-userdb-peers.json'),'utf8'));}catch(error){if(error.code==='ENOENT')return new Map();throw new TypeError('Invalid private remote user peer configuration');}
  if(!data||data.version!==1||Object.keys(data).some(key=>!['version','peers'].includes(key)))throw new TypeError('Invalid private remote user peer configuration');peers=data.peers;
 }
 const fail=()=>{throw new TypeError('Invalid private remote user peer configuration');};
 if(!peers||typeof peers!=='object'||Array.isArray(peers))fail();
 const result=new Map();for(const [sign,peer]of peers instanceof Map?peers:Object.entries(peers)){
  if(typeof sign!=='string'||!sign||sign.includes('\0')||!peer||typeof peer!=='object'||Array.isArray(peer)||Object.keys(peer).some(key=>!['pass','ip'].includes(key))||typeof peer.pass!=='string'||!peer.pass||typeof(peer.ip??'')!=='string')fail();
  const ip=peer.ip??'';if(ip&&(!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)||ip.split('.').some(value=>Number(value)>255)))fail();
  result.set(sign,Object.freeze({pass:peer.pass,ip}));
 }
 return result;
}

/** Explicit incoming replay storage peers. A sign is also a private directory
 * segment in the original receiver, so reject path syntax at provisioning.
 * No sample secret is enabled by default; JSON stays outside public assets. */
export async function readRemoteReplayPeers(stateRoot,{configured}={}){
 const fail=()=>{throw new TypeError('Invalid private remote replay peer configuration');};let peers=configured;
 if(peers===undefined){let data;try{data=JSON.parse(await fs.readFile(await privateAccountPath(stateRoot,'native-replay-peers.json'),'utf8'));}catch(error){if(error.code==='ENOENT')return new Map();fail();}
  if(!data||data.version!==1||Object.keys(data).some(key=>!['version','peers'].includes(key)))fail();peers=data.peers;
 }
 if(!peers||typeof peers!=='object'||Array.isArray(peers))fail();const result=new Map();
 for(const [sign,secret]of peers instanceof Map?peers:Object.entries(peers)){
  if(typeof sign!=='string'||!sign||sign.startsWith('.')||sign.includes('..')||/[\\/:\0]/.test(sign)||typeof secret!=='string'||!secret||secret.includes('\0'))fail();result.set(sign,secret);
 }
 return result;
}
