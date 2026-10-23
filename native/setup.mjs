import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readNativeConfig } from './config.mjs';
import { createDatabase } from './storage/database.mjs';
import { installNative } from './install/installer.mjs';
import {withStoppedNative} from './maintenance-command.mjs';

export async function setupNative(config) {
  const database=await createDatabase(config.databaseOptions);
  try { return await installNative({database,stateRoot:config.stateRoot,tablePrefix:config.tablePrefix,admin:config.admin}); }
  finally { await database.close(); }
}
export async function runSetupCli() {
  try {
    const config=readNativeConfig();await withStoppedNative(config.stateRoot,()=>setupNative(config));
    console.log('Native database and private state are ready. Existing owned data was preserved.');
  } catch(error){console.error(`Native setup failed (${error.code??error.name}); stop the server and verify the empty database or existing installation ownership. Saved state was preserved.`);process.exitCode=1;}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await runSetupCli();
