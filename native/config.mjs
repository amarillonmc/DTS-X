import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = path.resolve(fileURLToPath(new URL('../',import.meta.url)));
export function readNativeConfig(env = process.env) {
  const integer = (name,fallback,min,max) => { const value=Number(env[name]||fallback);if(!Number.isInteger(value)||value<min||value>max)throw new TypeError(`${name} must be ${min}..${max}`);return value; };
  const port=integer('PORT',3000,1,65535),publicUrl=new URL(env.PUBLIC_URL||`http://localhost:${port}`);
  if(!['http:','https:'].includes(publicUrl.protocol)||publicUrl.pathname!=='/'||publicUrl.search||publicUrl.hash||publicUrl.username||publicUrl.password)throw new TypeError('PUBLIC_URL must be an HTTP origin');
  const tablePrefix=env.TABLE_PREFIX||'dtsx_',database=env.DB_NAME||'dtsx';
  if(!/^[a-zA-Z0-9_]+$/.test(database)||!/^[a-zA-Z][a-zA-Z0-9_]*_$/.test(tablePrefix))throw new TypeError('Invalid DB_NAME or TABLE_PREFIX');
  const sourceRoot=path.join(projectRoot,'engine'),publicRoot=path.join(projectRoot,'public');
  const stateRoot=path.resolve(projectRoot,env.NATIVE_DATA_DIR||path.join(env.DATA_DIR||'var','native'));
  const within=(candidate,root)=>candidate===root||candidate.startsWith(root+path.sep);
  if(within(projectRoot,stateRoot)||within(stateRoot,sourceRoot)||within(stateRoot,publicRoot))throw new TypeError('NATIVE_DATA_DIR must be separate from source and public resources');
  return {sourceRoot,stateRoot,modernRoot:path.join(publicRoot,'modern'),port,host:env.HOST||'127.0.0.1',publicUrl:publicUrl.origin,
    tablePrefix,databaseOptions:{host:env.DB_HOST||'127.0.0.1',port:integer('DB_PORT',3306,1,65535),database,user:env.DB_USER||'dtsx',password:env.DB_PASSWORD||'',charset:'utf8'},
    admin:{username:env.ADMIN_USER||'admin',password:env.ADMIN_PASSWORD||''},autoSetup:env.AUTO_SETUP==='1',trustProxy:env.TRUST_PROXY==='1',
    maxBytes:integer('MAX_BODY_MB',64,1,1024)*1024*1024,schedulerIntervalMs:integer('NATIVE_TICK_MS',1000,100,60000),
    systemConfig:{gtablepre:tablePrefix,gamefounder:env.ADMIN_USER||'admin',gtitle:env.GAME_TITLE||'新电波 DTS',server_address:publicUrl.origin,gameurl:publicUrl.origin},
  };
}
