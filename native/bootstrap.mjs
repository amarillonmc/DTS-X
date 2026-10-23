import inventory from './inventory.json' with {type:'json'};
import {nativeGameplayModules} from './catalog.mjs';
import {definitions as skills,infoById} from './generated/catalog.mjs';
import {definitions as remaining} from './generated/remaining/catalog.mjs';

const manual=new Set(nativeGameplayModules.map(module=>module.name));
export const additionalModules=[...skills,...remaining].filter(module=>!manual.has(module.name));
export const defaultConfiguration=inventory.modules.map(({name,enabled})=>({name,enabled}));
export {infoById};
