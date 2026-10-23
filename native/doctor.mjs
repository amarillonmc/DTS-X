import path from 'node:path';
import {readFile,lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {readNativeConfig} from './config.mjs';
import {createDatabase} from './storage/database.mjs';
import {createLockServices} from './storage/locks.mjs';
import {privateStateRoot} from './storage/private-root.mjs';
import {installationSchema,isInstallationOwner} from './install/installer.mjs';
import {readModuleConfiguration,validateNativeModuleConfiguration} from './accounts/module-admin.mjs';
import {readRemoteUserPeers,readRemoteReplayPeers} from './accounts/remote-configuration.mjs';
import {defaultConfiguration,additionalModules} from './bootstrap.mjs';

/** Read-only database diagnostics. The only write is a retained OS-lock probe
 * inside the private state directory. No SQL or credentials reach the report. */
export async function doctorNative(config) {
  const stateRoot=await privateStateRoot(config.stateRoot);
  const [major,minor]=process.versions.node.split('.').map(Number);
  if(major<24||(major===24&&minor<18))throw new Error('Node.js >=24.18.0 is required');
  const checked=await validateNativeModuleConfiguration(await readModuleConfiguration(stateRoot,defaultConfiguration),{additionalModules});
  const marker=path.join(stateRoot,'native-install.json');
  if((await lstat(marker)).isSymbolicLink())throw new Error('Installation marker must not be a symlink');
  const journal=JSON.parse(await readFile(marker,'utf8'));
  if(journal.format!==1||journal.status!=='ready'||journal.database!==config.databaseOptions.database||journal.tablePrefix!==config.tablePrefix||!isInstallationOwner(journal.owner))throw new Error('Instance ownership marker is invalid');
  const locks=await createLockServices(stateRoot);let token,database;
  try {
    token=await locks.locks.acquire('diagnostics',{timeoutMs:1000});
    database=await createDatabase(config.databaseOptions);
    const schema=await installationSchema(config.tablePrefix),tables=(await database.query('SHOW TABLES')).map(row=>Object.values(row)[0]);
    const markerTable=config.tablePrefix+'native_install';
    if([...schema.statements.map(item=>item.name),markerTable].some(name=>!tables.includes(name)))throw new Error('Installed tables are incomplete');
    const markers=await database.query(`SELECT owner FROM ${markerTable} WHERE singleton=1`);
    if(markers.length!==1||markers[0].owner!==journal.owner)throw new Error('Database and filesystem ownership differs');
    if(!(await database.query(`SELECT groomid FROM ${config.tablePrefix}game WHERE groomid=0`)).length)throw new Error('Main game is missing');
    const users=await readRemoteUserPeers(stateRoot),replays=await readRemoteReplayPeers(stateRoot);
    return {runtime:'native-node',modules:checked.order.length,templates:checked.templateCount,ownership:'verified',database:'connected',osLocks:'available',remoteUserPeers:users.size,remoteReplayPeers:replays.size};
  } finally {try{await database?.close();}finally{try{if(token)await locks.locks.release('diagnostics',token);}finally{await locks.close();}}}
}
export async function runDoctorCli() {
  try {console.log(JSON.stringify(await doctorNative(readNativeConfig()),null,2));}
  catch(error){console.error(`Native diagnostics failed (${error.code??error.name}); verify the private configuration, installation ownership, database and native lock support.`);process.exitCode=1;}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await runDoctorCli();
