import path from 'node:path';
import {access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {readNativeConfig} from './config.mjs';
import {setupNative} from './setup.mjs';
import {createLockServices} from './storage/locks.mjs';
import {createNativeApplication} from './http/application.mjs';
import {readModuleConfiguration,validateNativeModuleConfiguration} from './accounts/module-admin.mjs';
import {defaultConfiguration,additionalModules,infoById} from './bootstrap.mjs';
import {reportNativeError} from './diagnostics.mjs';

/** Complete static native entry. Retains one real OS owner lock until requests,
 * scheduled jobs and remote account leases have drained on shutdown. */
export async function startNative(config=readNativeConfig(),{onError=reportNativeError}={}) {
  const locks=await createLockServices(config.stateRoot);let token,app;
  try {
    token=await locks.locks.acquire('native-process-owner',{timeoutMs:1000});
    if(!config.autoSetup)try{await access(path.join(config.stateRoot,'native-install.json'));}catch(error){if(error.code==='ENOENT')throw new Error('Native instance is not installed. Run native setup in a dedicated empty database and state directory.');throw error;}
    await setupNative(config); // Existing owners are verified without resetting.
    const configuration=await readModuleConfiguration(config.stateRoot,defaultConfiguration);
    await validateNativeModuleConfiguration(configuration,{additionalModules});
    app=createNativeApplication({...config,configuration,additionalModules,infoById,onError});
    const address=await app.listen({host:config.host,port:config.port});let closing;
    return {...app,address,close(){return closing??=(async()=>{try{await app.close();}finally{try{await locks.locks.release('native-process-owner',token);}finally{await locks.close();}}})();}};
  } catch(error){try{await app?.close();}finally{try{if(token)await locks.locks.release('native-process-owner',token);}finally{await locks.close();}}throw error;}
}

export async function runNativeCli() {
  try {
    const runtime=await startNative();console.log(`Native Node.js game listening on ${runtime.address.address}:${runtime.address.port}`);
    let stopping=false;
    const stop=async()=>{if(stopping)return;stopping=true;try{await runtime.close();}catch{console.error('Native graceful shutdown failed. Persistent state was preserved.');process.exitCode=1;}};
    process.on('SIGINT',stop);process.on('SIGTERM',stop);
  } catch(error){reportNativeError(error,'startup');console.error('Check installation ownership, module validation and private configuration; saved data was preserved.');process.exitCode=1;}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await runNativeCli();
