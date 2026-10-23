import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {registerHooks} from 'node:module';

// Test-only preload for the REAL root executable. Reject forbidden imports
// before loading; no service, database, rule or production entry is replaced.
const root=fileURLToPath(new URL('../../',import.meta.url));
const normalized=value=>value.replaceAll('\\','/').toLowerCase();
const legacyRoots=[root,process.env.NATIVE_ACCEPTANCE_RUNTIME_ROOT??root].map(base=>normalized(path.join(base,'runtime'))+'/');
const forbidden=value=>{
 const name=normalized(value);
 return name==='php-parser'||name.startsWith('php-parser/')||name.startsWith('@php-wasm/')
  ||name.includes('/node_modules/@php-wasm/')||name.includes('/node_modules/php-parser/');
};
const reject=value=>{
 let target=value;
 if(value.startsWith('file:'))target=fileURLToPath(value);
 if(forbidden(target)||legacyRoots.some(legacyRoot=>normalized(target).startsWith(legacyRoot)))throw Object.assign(new Error('Native production entry attempted a forbidden legacy import'),{code:'NATIVE_FORBIDDEN_IMPORT'});
};
registerHooks({
 resolve(specifier,context,nextResolve){reject(specifier);const result=nextResolve(specifier,context);reject(result.url);return result;},
 load(url,context,nextLoad){reject(url);return nextLoad(url,context);},
});

if(typeof process.send!=='function')throw new Error('Native entry acceptance preload requires its dedicated IPC parent');
const cli=process.env.NATIVE_ACCEPTANCE_MODE==='cli';
process.send({type:'native-import-guard-ready'},()=>{if(cli)process.disconnect();});
if(!cli)process.on('message',message=>{
 if(message?.type!=='native-entry-test-stop')return;
 const listeners=process.listenerCount('SIGTERM');
 process.send({type:'native-shutdown-signal',listeners});
 // Windows cannot deliver POSIX SIGTERM with child.kill(). Emit the actual
 // process event handled by runNativeCli, then remove this test-only IPC ref.
 process.emit('SIGTERM');
 process.disconnect();
});
