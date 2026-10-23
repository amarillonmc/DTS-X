import { createNativeHttpServer } from './server.mjs';
import { createNativeRequestHost } from './request-host.mjs';
import { createMaintenanceGate } from './maintenance.mjs';
import { createRoomBroadcast } from '../system/room-poll.mjs';
import { dispatchAccountPage } from './account-pages.mjs';
import { commandAct, commandGame, GamePageError } from './game-pages.mjs';
import { commandValid } from './valid-page.mjs';
import { commandAlive, commandEnd, commandNews, commandRank } from './information-pages.mjs';
import { chatPage } from './chat-page.mjs';
import { roomUpdate } from './room-update.mjs';
import { RoomError } from '../system/rooms.mjs';
import { AccountError } from '../accounts/service.mjs';
import { createNativeGameRegistry } from '../catalog.mjs';
import { createDatabase } from '../storage/database.mjs';
import { prepareInputRequest } from '../gameplay/input.mjs';
import { gencode } from '../protocol/codec.mjs';
import { present, n } from '../system/sys-support.mjs';
import { generatedPages } from '../generated/pages.mjs';
import { recordReplayResponse } from '../system/replay-recording.mjs';
import { createRemoteUserReceiver } from '../accounts/remote.mjs';
import { readRemoteUserPeers, readRemoteReplayPeers } from '../accounts/remote-configuration.mjs';
import { readModuleConfiguration,ModuleAdminError } from '../accounts/module-admin.mjs';

const accountRoutes = new Set(['login','logout','register','user','user_profile','messages','admin','userdb_receive']);
const implemented = { act:commandAct, game:commandGame, valid:commandValid, alive:commandAlive, end:commandEnd, news:commandNews, rank:commandRank, chat:chatPage };
const commandPages = new Set(['game','roomcmd','valid','end','winner','rank','alive','help','news','aranking','logistics']);

/** Shared native application. Generated page controllers are static imported
 * functions supplied by the build catalog, never paths chosen for execution
 * by HTTP input. The default executable is switched only after full acceptance. */
export function createNativeApplication({ configuration, additionalModules = [], pages: overrides = {}, onError = () => {}, schedulerIntervalMs = 1000, ...options }) {
  const pages = { ...generatedPages, ...overrides };
  createNativeGameRegistry(configuration, additionalModules); // Fail before any socket or database side effect.
  let currentConfiguration=configuration,ready=false;
  const broadcast = createRoomBroadcast(), maintenance = createMaintenanceGate();
  const appOptions = { ...options, configuration, additionalModules, broadcast, maintenance };
  let timer, tickPromise, stopping = false, schedulerEnabled=schedulerIntervalMs>0, remoteDatabase, remoteReceiver, lastRunAt=null,lastError=null;
  const scheduler={status:()=>({enabled:schedulerEnabled,running:!!tickPromise,intervalMs:schedulerIntervalMs,lastRunAt,lastError}),
    start(){if(stopping)throw new Error('Application is shutting down');schedulerEnabled=true;schedule();},
    async stop(){schedulerEnabled=false;clearTimeout(timer);timer=null;await tickPromise;},
    async restart(){await this.stop();this.start();}};
  const setup = request => createNativeRequestHost({ ...appOptions,configuration:currentConfiguration,scheduler,
    applyConfiguration:next=>{createNativeGameRegistry(next,additionalModules);currentConfiguration=next;},request });
  const server = createNativeHttpServer({ ...options, maintenance, onError, health: () => ({ runtime:'native-node', ready, enabledModules:currentConfiguration.filter(item=>item.enabled).length }),
    async dispatch(request) {
      let name = request.pathname.slice(1,-4);
      if(name==='gencode_transformer' && request.clientAddress!=='127.0.0.1')return {status:403,body:'Access Denied'};
      const rawCommand = name === 'command';
      if (rawCommand) {
        const page = request.input.values.page;
        if (page == null || page === 'command') name = 'act';
        else if (typeof page === 'string' && page.startsWith('command_') && commandPages.has(page.slice(8))) name = page.slice(8);
        else return null;
      }
      if (!accountRoutes.has(name) && !Object.hasOwn(implemented,name) && !Object.hasOwn(pages,name) && !['roomupdate','error','modulemng','modulemng_activate','daemonmng','tools_users_table_alter','tools_users_card_reissue'].includes(name)) return null;
      const host = await setup(request), scope = host.scope;
      try {
        if (name === 'help') scope.___IN_HELP = 1;
        if (name === 'valid') scope.valid_ip = request.clientAddress;
        if (name === 'roomcmd' && Object.hasOwn(request.get ?? {},'command')) scope.not_ajax = 1;
        if (present(scope.disable_access) && !['login','admin'].includes(name)) throw new GamePageError('access_disabled');
        if(['modulemng','modulemng_activate','daemonmng'].includes(name)) {
          const result=name==='modulemng'?await host.moduleAdmin.page(request,scope):name==='modulemng_activate'?await host.moduleAdmin.activate(scope):await host.moduleAdmin.daemon(request,scope);
          return {...result,headers:{...result.headers,'Set-Cookie':host.cookies}};
        }
        if(name.startsWith('tools_users_'))return host.moduleAdmin.legacyTool(request.pathname,scope);
        if (name === 'roomupdate') return { body:await roomUpdate(host,scope,{timestamp:request.input.post?.timestamp,roomId:request.input.cookies?.[scope.gtablepre+'roomid'],signal:request.signal}),headers:{'Set-Cookie':host.cookies} };
        if (!['chat','help','error','userdb_receive','replay_receive'].includes(name) && !(name === 'news' && scope.sendmode === 'news')) await host.session.call('sys','routine');
        if(rawCommand && scope.command==='room_routine_single')return {body:'',headers:{'Set-Cookie':host.cookies}};
        if(rawCommand && scope.command==='maintain'){await host.autoMaintain.run(63);return {body:'',headers:{'Set-Cookie':host.cookies}};}
        if(rawCommand && scope.mode==='bot') {
          const input=host.session.state('input');
          const body=input.sign===scope.userdb_remote_storage_sign && scope.command==='npc_action' && host.session.hasModule('npc_action') ? await host.session.call('npc_action','bot_action') : '';
          return {body,headers:{'Set-Cookie':host.cookies}};
        }
        if (accountRoutes.has(name)) {
          const result = await dispatchAccountPage(host,request,scope);
          if (host.cookies.length) result.headers = { ...result.headers, 'Set-Cookie':[...(result.headers?.['Set-Cookie'] ?? []),...host.cookies] };
          return result;
        }
        if (name === 'game' && scope.mode === 'quit') {
          host.setCookie('user','');host.setCookie('pass','');return {status:302,body:'',headers:{Location:'index.php','Set-Cookie':host.cookies}};
        }
        let body;
        if (name === 'error') body = await host.templates.render('error',{...scope,message:scope.errormsg});
        else if (rawCommand && scope.command === 'area_timing_refresh') { await host.session.call('map','init_areatiming');body=gencode({timing:scope.uip?.timing}); }
        else body = await (implemented[name] ?? pages[name])(host,scope);
        if(name==='act')await recordReplayResponse(host,body);
        const headers = { ...host.headers, 'Set-Cookie':host.cookies };
        if (!rawCommand && typeof body === 'string' && body.startsWith('redirect:')) return {status:302,headers:{...headers,Location:body.slice(9)},body:''};
        return {body,headers,status:host.status};
      } catch (error) {
        if (!(error instanceof GamePageError || error instanceof AccountError || error instanceof RoomError || error instanceof ModuleAdminError)) throw error;
        const message = scope._ERROR?.[error.code] ?? error.message;
        const body = rawCommand || name === 'roomupdate' ? gencode({url:'error.php',errormsg:message}) : await host.templates.render('error',{...scope,message});
        return {body,headers:{'Set-Cookie':host.cookies}};
      } finally { await host.close(); }
    },
  });
  async function tick() {
    const connection = await createDatabase(options.databaseOptions);
    let rows;
    try { rows = await connection.query(`SELECT groomid FROM ${options.systemConfig?.gtablepre ?? 'bra_'}game WHERE groomid=0 OR groomstatus>=40`); }
    finally { await connection.close(); }
    for (const row of rows) {
      if (stopping) break;
      await maintenance.request(async () => {
        const input = prepareInputRequest({cookies:{[`${options.systemConfig?.gtablepre ?? 'bra_'}roomid`]:row.groomid}});
        const host = await setup({pathname:'/command.php',input,server:{SERVER_PORT:new URL(options.publicUrl).port||'80'},pageStartTime:Date.now()/1000});
        try { await host.session.call('sys','routine');if(Number(row.groomid)===0 && new Date(Number(host.scope.now)*1000).getUTCHours()===3 && await host.autoMaintain.isOldEnough())await host.autoMaintain.run(63); }
        finally { await host.close(); }
      });
    }
  }
  const schedule = () => {
    if (stopping || !schedulerEnabled || tickPromise || timer || !(schedulerIntervalMs > 0)) return;
    timer = setTimeout(() => {
      timer=null;lastRunAt=Date.now()/1000;
      tickPromise = tick().then(()=>{lastError=null;}).catch(error => { lastError='Scheduled update failed';if (!stopping) onError(error); }).finally(() => { tickPromise=null;schedule(); });
    },schedulerIntervalMs);timer.unref();
  };
  return { ...server, scheduler, async listen(address) {
      currentConfiguration=await readModuleConfiguration(options.stateRoot,configuration);createNativeGameRegistry(currentConfiguration,additionalModules);
      const replayPeers=await readRemoteReplayPeers(options.stateRoot,{configured:options.remoteReplayPeers});
      appOptions.systemConfig={...options.systemConfig,replay_receive_list:replayPeers};
      if(!appOptions.remoteUsers) {
        const peers=await readRemoteUserPeers(options.stateRoot,{configured:options.remoteUserPeers});
        appOptions.systemConfig={...appOptions.systemConfig,userdb_receive_list:peers};
        remoteDatabase=await createDatabase(options.databaseOptions);
        remoteReceiver=appOptions.remoteUsers=createRemoteUserReceiver({database:remoteDatabase,tablePrefix:options.systemConfig?.gtablepre??'bra_',stateRoot:options.stateRoot,peers,clock:options.clock?.now});
      }
      try { const result=await server.listen(address);ready=true;schedule();return result; }
      catch(error){await remoteReceiver?.close();await remoteDatabase?.close();throw error;}
    },
    async close() { ready=false;stopping=true;clearTimeout(timer);broadcast.close();await server.close();await tickPromise;try{await remoteReceiver?.close();}finally{await remoteDatabase?.close();} },
  };
}
