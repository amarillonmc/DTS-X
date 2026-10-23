import {createLockServices} from './storage/locks.mjs';

/** Offline administrative operations share the executable's actual owner lock.
 * Never delete a lock file or retry without locking when the server is running. */
export async function withStoppedNative(stateRoot, action) {
  const locks=await createLockServices(stateRoot);let token;
  try {
    token=await locks.locks.acquire('native-process-owner',{timeoutMs:1000});
    return await action();
  } finally {
    try {if(token)await locks.locks.release('native-process-owner',token);}
    finally {await locks.close();}
  }
}
