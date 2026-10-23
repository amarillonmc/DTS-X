import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

/** Private account/config files never follow symlinks or enter source/public. */
export async function privateAccountPath(stateRoot,relative,{directory=false}={}){
 if(typeof stateRoot!=='string'||!path.isAbsolute(stateRoot))throw new TypeError('An absolute private state root is required');
 const project=path.resolve(fileURLToPath(new URL('../../',import.meta.url))),root=path.resolve(stateRoot),fold=value=>process.platform==='win32'?value.toLowerCase():value;
 if(fold(root)===fold(project)||['engine','public'].some(name=>fold(root)===fold(path.join(project,name))||fold(root).startsWith(fold(path.join(project,name))+path.sep)))throw new Error('Private account files must be outside source/public directories');
 const target=path.resolve(root,relative);if(!target.startsWith(root+path.sep))throw new Error('Account path escapes private state');
 const parts=path.relative(path.parse(root).root,target).split(path.sep);let current=path.parse(root).root;
 for(let index=0;index<parts.length;index++){
  current=path.join(current,parts[index]);const dir=index<parts.length-1||directory;
  try{const stat=await fs.lstat(current);if(stat.isSymbolicLink())throw new Error('Private account paths cannot contain symlinks');if(dir&&!stat.isDirectory())throw new Error('Private account parent is not a directory');}
  catch(error){if(error.code!=='ENOENT')throw error;if(dir)await fs.mkdir(current,{mode:0o700});}
 }
 return target;
}
