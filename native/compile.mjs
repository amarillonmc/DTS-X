import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readNativeConfig} from './config.mjs';
import {withStoppedNative} from './maintenance-command.mjs';
import * as modules from './accounts/module-admin.mjs';
import {defaultConfiguration,additionalModules} from './bootstrap.mjs';

/** Production installs ship static JavaScript. Compile validates that complete
 * build and its selected module order; development emitters are separate tools. */
export async function compileNative(config,{staged=false}={}) {
  return withStoppedNative(config.stateRoot,async()=>staged
    ? modules.activateStagedModuleConfiguration(config.stateRoot,defaultConfiguration,{additionalModules})
    : modules.validateNativeModuleConfiguration(await modules.readModuleConfiguration(config.stateRoot,defaultConfiguration),{additionalModules}));
}
export async function runCompileCli() {
  const args=process.argv.slice(2);
  if(args.some(arg=>arg!=='--staged'))throw new Error('Usage: npm run compile -- [--staged]');
  try {const result=await compileNative(readNativeConfig(),{staged:args.includes('--staged')});console.log(`Validated ${result.order.length} native modules and ${result.templateCount} static templates${args.includes('--staged')?'; checked candidate activated':''}.`);}
  catch(error){console.error(`Native validation failed (${error.code??error.name}); stop the server and inspect the module candidate/build. Persistent state was preserved.`);process.exitCode=1;}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await runCompileCli();
