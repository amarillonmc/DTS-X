import snapshots from '../system/sys-config.json' with { type: 'json' };
import { sysGlobalFunctions } from '../system/sys-global.mjs';
import { sysNewsFunctions } from '../system/sys-news.mjs';
import { sysGameFunctions } from '../system/sys-game.mjs';
import { initializeSys } from '../system/sys-init.mjs';

/** Static data copied from the six original config files, in declared include
 * order. Sample server/system values are reference defaults, never credentials
 * used to establish a connection. The host provides deployment overrides. */
export function sysDefaultState(overrides = {}) {
  return Object.assign({
    mode: null, command: null, db: null, plock: null, url: null, uip: null,
    cudata: null, gameover_plist: null, gameover_ulist: null,
    pdata_pool: [], pdata_origin_pool: [], pdata_lock_pool: [], udata_lock_pool: [],
    u_templateid: null, new_messages: null, userdb_forced_local: null,
    room_id: 0, room_prefix: '', tablepre: null, ctablepre: null, wtablepre: null,
  }, ...Object.values(structuredClone(snapshots)), structuredClone(overrides));
}

/** Port of core/sys's four code files. Services are explicit asynchronous host
 * boundaries; missing capabilities throw instead of simulating a game:
 * database: query/execute/queries/arrayInsert/arrayUpdate (original SQL semantics)
 * system.request: {cookies,post,script,daemon,loadCoreOnly}, already input-filtered
 * system.files: read(path), write(path,data,mode), touch(path), clear(path,options)
 * system.locks: acquire(path,{pollMicroseconds}), release(path,token)
 * system.users: fetchByUsername(name,{forcedLocal}), fetchMany(fields,filters), updateMany(rows)
 * Username-indexed lists use ordered Map values (PHP numeric keys become
 * integer keys). User services may return a plain record when key order is
 * irrelevant; use Map to preserve arbitrary username order through hooks.
 * gameover_plist/gameover_ulist are ordered Maps; nested records remain mutable.
 * system.rooms: setCurrentId(id); system.messages: checkNew(name)
 * system.clock.now(): optional epoch seconds; otherwise native wall-clock time
 * output.take(): return and clear buffered output
 * File paths are relative to the host's explicitly configured game state root.
 */
export const sysModule = {
  name: 'sys',
  dependencies: ['input'],
  state: services => sysDefaultState(services.system?.config ?? {}),
  initialize: initializeSys,
  functions: { ...sysGlobalFunctions, ...sysGameFunctions, ...sysNewsFunctions },
};
