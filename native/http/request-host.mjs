import path from 'node:path';
import { readFile } from 'node:fs/promises';
import {randomInt} from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';
import { createDatabase } from '../storage/database.mjs';
import { createLockServices } from '../storage/locks.mjs';
import { createFileServices } from '../storage/files.mjs';
import { createFileFunctions } from '../storage/file-functions.mjs';
import { createPlayerAssets } from '../storage/player-assets.mjs';
import { createNativeGameRegistry, nativeGameplayModules } from '../catalog.mjs';
import { createSkillCatalog } from '../gameplay/skills.mjs';
import { sysDefaultState } from '../gameplay/sys.mjs';
import { filterInputValue } from '../gameplay/input.mjs';
import { createPhp74Random } from '../random.mjs';
import { createUserService } from '../accounts/users.mjs';
import { createAccountService } from '../accounts/service.mjs';
import { createUserSettingsService } from '../accounts/settings.mjs';
import { createVerificationService } from '../accounts/verification.mjs';
import { createAccountAdminService } from '../accounts/admin.mjs';
import { createAdminConfigurationService } from '../accounts/configuration.mjs';
import { createGameAdminService } from '../accounts/game-admin.mjs';
import { createConfiguredRemoteUserClient } from '../accounts/remote-configuration.mjs';
import { createModuleAdminService } from '../accounts/module-admin.mjs';
import { convertTime, passCompare, timestampSalt, compareTimestampPass } from '../accounts/primitives.mjs';
import { createMessageService } from '../system/messages.mjs';
import {createAutoMaintainService} from '../system/auto-maintain.mjs';
import { createRoomService, roomIdToPrefix, roomIsSubroom, roomPrefixKind, roomPrefixToId, instance3DebuffTips } from '../system/rooms.mjs';
import { createTemplateServices, createOutput } from '../templates/index.mjs';
import { createGeneratedServices } from '../generated/context.mjs';
import { createBubbleboxFunctions } from './bubbles.mjs';
import { serializeGameCookie } from './request.mjs';
import { enterBattlefield } from './enter-battlefield.mjs';
import { GamePageError } from './game-pages.mjs';
import { createOutboundFunctions } from './outbound.mjs';
import { renderPage } from '../generated/pages.mjs';
import { gencode, gdecode } from '../protocol/codec.mjs';
import { reference } from '../modules/registry.mjs';
import { n, text, present, values } from '../system/sys-support.mjs';

/** One real database connection, lock owner, PRNG, module state and output
 * buffer per HTTP request. The selected configuration must be complete; the
 * registry rejects unavailable modules before connecting any database. */
export async function createNativeRequestHost({ configuration, additionalModules = [], infoById = {}, databaseOptions, sourceRoot, stateRoot,
  publicUrl, request, systemConfig = {}, accountConfig = {}, broadcast, maintenance, remoteUsers, remoteUserClient, randomSeed, applyConfiguration, scheduler,
  clock = { now: () => Date.now() / 1000 }, databaseFactory = () => createDatabase(databaseOptions) }) {
  const registry = createNativeGameRegistry(configuration, additionalModules);
  if (!broadcast || !maintenance) throw new TypeError('Request host requires shared room broadcast and maintenance services');
  const definitions = [...nativeGameplayModules, ...additionalModules], enabled = configuration.filter(item => item.enabled).map(item => item.name);
  // The upstream snapshot does not ship announcement files: PHP displays their
  // missing read as empty text. Preserve that initial content, then JSON edits.
  const configurationDefaults = { messages: Object.fromEntries(await Promise.all(['adminmsg','systemmsg'].map(async name => [name,await readFile(path.join(sourceRoot,'gamedata',name+'.htm'),'utf8').catch(error=>{if(error.code==='ENOENT')return '';throw error;})]))) };
  const snapshot = await createAdminConfigurationService({stateRoot,defaults:configurationDefaults}).getSnapshot();
  const effectiveSystem = { ...snapshot.server, ...snapshot.game.sys, replay_receive_list:{},userdb_receive_list:{}, ...systemConfig, gameurl:systemConfig.gameurl ?? publicUrl };
  const selected = definitions.filter(item => enabled.includes(item.name)), config = sysDefaultState(effectiveSystem);
  config.server_address = new URL(publicUrl).origin; config.dbpass = ''; config.dbpw = '';
  const script = request.pathname.slice(1, -4), page = ['act','game','valid','end','news','rank','alive','roomcmd','winner','help'].includes(script) ? `command_${script}` : '';
  let session, database, locks, users, closed = false;
  const output = createOutput(), globals = Object.create(null), functions = Object.create(null), cookies = [];
  const constants = Object.assign(Object.create(null), { IN_GAME: true, IN_COMMAND: true, CURSCRIPT: script, GAME_ROOT: sourceRoot.replaceAll('\\','/') + '/',
    GAMENAME: 'bra', STYLEID: '1', TEMPLATEID: '1', TPLDIR: './templates/default', IN_GAME_CHECK_STR: "<?php if(!defined('IN_GAME')) exit('Access Denied'); ?>\r\n" });
  const host = { output, globals, functions, constants, cookies, headers:Object.create(null), status:200, broadcast, maintenance, remoteUsers, request, clock, config };
  Object.assign(globals,{_GET:request.get??{},_POST:request.post??request.input.post??{},_COOKIE:request.cookies??request.input.cookies??{},_SERVER:request.server??{},_FILES:request.files??{}});
  // Upstream command.php renders game fragments with CURSCRIPT='game'. Keep
  // that context for the native act alias too, or AJAX removes wound handlers.
  if (script === 'command' || script === 'act') constants.CURSCRIPT='game';
  if (script === 'replay') { constants.CURSCRIPT='game'; constants.IN_REPLAY=true; }
  host.close = async () => {
    if (closed) return; closed = true;
    // Release all acquired resources even when a preceding close fails.
    const failures = [];
    for (const resource of [users, locks, database]) try { await resource?.close(); } catch (error) { failures.push(error); }
    if (failures.length) throw new AggregateError(failures, 'Native request cleanup failed');
  };
  try {
    database = host.database = await databaseFactory(); locks = await createLockServices(stateRoot);
    const originalFiles = await createFileServices({ sourceRoot, stateRoot, locks: locks.locks, clock: clock.now });
    const relative = value => {
      let name = text(value).replaceAll('\\','/');
      if (name.startsWith(constants.GAME_ROOT)) name = name.slice(constants.GAME_ROOT.length).replace(/^\/+/, '');
      return name.replace(/^(?:\.\/)+/, '');
    };
    const files = host.files = Object.fromEntries(Object.entries(originalFiles).map(([name, method]) => [name, (file,...args) => method(relative(file),...args)]));
    for (const method of ['read','readText','readBytes']) {
      const read = files[method];
      files[method] = (file,...args) => {
        const message = /^gamedata\/(adminmsg|systemmsg)\.htm$/.exec(relative(file));
        return message ? Promise.resolve(method === 'readBytes' ? Buffer.from(snapshot.messages[message[1]]) : snapshot.messages[message[1]]) : read(file,...args);
      };
    }
    const now = () => Math.floor(clock.now());
    const random = host.random = createPhp74Random(randomSeed);
    const call = (module, name, ...args) => session.call(module, name, ...args), state = name => session.state(name);
    const mutateUser = async (module, name, index, args) => {
      const original = args[index], holder = { value: original }; args[index] = reference(holder, 'value');
      const result = await call(module,name,...args);
      if (holder.value !== original) { for (const key of Object.keys(original)) delete original[key]; Object.assign(original,holder.value); }
      return result;
    };
    const cards = {
      get cards() { return state('cardbase').cards; }, get rareColors() { return state('cardbase').card_rarecolor; }, get packlist() { return state('cardbase').packlist; },
      get template() { return host.templates.names.MOD_CARDBASE_CARD_FRAME; },
      async getCardList(user) { return values((await call('cardbase','get_cardlist_energy_from_udata',user))[0]); },
      getUserCardInfo: user => call('cardbase','get_user_cardinfo',user), packFilter: packs => call('cardbase','pack_filter',packs),
      getEnergyRecoverRate: (...args) => call('cardbase','get_energy_recover_rate',...args),
      getCardAlternative: (...args) => mutateUser('cardbase','get_card_alternative',1,args),
    };
    const achievements = {
      decode: user => call('achievement_base','decode_achievements',user), getValid: value => call('achievement_base','get_valid_achievements',value),
      checkGlobal: user => mutateUser('achievement_base','ach_global_ach_check',0,[user]), refreshDaily: user => mutateUser('achievement_base','refresh_daily_quest',0,[user]),
      get dailyInterval() { return n(state('achievement_base').daily_intv); },
    };
    const logistics = { get items() { return state('logistics').logistics_shop_items; }, itemGet: (...args) => mutateUser('logistics','logistics_itemget',1,args) };
    users = host.users = createUserService({ database, tablePrefix: config.gtablepre, locks: locks.locks, script, page, remote: remoteUserClient ?? createConfiguredRemoteUserClient(config,{clock:now}), forcedLocal: !!config.userdb_forced_local });
    host.accounts = createAccountService({ users, clock: now, cards, achievements, settings: createUserSettingsService({ currentUser: () => state('sys').cudata }),
      verification: await createVerificationService({ gameUrl: config.server_address, clock: now, helpFile: path.join(sourceRoot,'templates/default/help.htm') }),
      config: { tablePrefix: config.gtablepre, cookiePath: config.cookiepath, cookieDomain: config.cookiedomain, oldPasswordCompatibility: !!config.oldpswdcmp, founder: config.gamefounder, ...snapshot.account, ...accountConfig } });
    host.templates = createTemplateServices({ session: () => session, enabledModules: enabled, constants, globals, functions, files, output, random,
      clock: { nowSeconds: now }, templateId: request.input.post?.templateid || request.input.cookies?.templateid || 1 });
    host.messages = createMessageService({ database, tablePrefix: config.gtablepre, users, accounts: host.accounts, clock: now, cards, achievements, logistics, templates: host.templates });
    host.admin = createAccountAdminService({ database, tablePrefix: config.gtablepre, stateRoot, users, accounts: host.accounts, founder: config.gamefounder, clock: now, messages: host.messages, achievements, maintenance });
    host.configuration = createAdminConfigurationService({ stateRoot, defaults:configurationDefaults, accounts:host.accounts, admin:host.admin, clock:now });
    host.moduleAdmin = createModuleAdminService({stateRoot,configuration,additionalModules,accounts:host.accounts,maintenance,apply:applyConfiguration,scheduler,clock:now,database,tablePrefix:config.gtablepre});
    host.setCookie = (name,value,life=0,prefix=1) => cookies.push(serializeGameCookie(name,value,{tablePrefix:config.gtablepre,life,prefix:!!prefix,now:now(),path:config.cookiepath||'/',domain:config.cookiedomain||'',secure:request.server.SERVER_PORT==='443'}));
    host.enterBattlefield = (...args) => enterBattlefield(host,...args);
    host.rooms = createRoomService({ state: () => state('sys'), session: () => session, database, files, templates: host.templates, output, setCookie: host.setCookie, broadcast, enterBattlefield: host.enterBattlefield, clock: now, config:snapshot.room });
    Object.assign(functions, createFileFunctions(files), createOutboundFunctions(globals), createBubbleboxFunctions({ templates: () => host.templates, output }), {
      gencode, gdecode, convert_tm: convertTime, gstrfilter: filterInputValue, getmicrotime: clock.now, get_now: msec => present(msec) ? clock.now() : now(), url_dir: () => config.server_address + '/',
      gurl: () => text(config.gameurl || config.server_address).replace(/\/?$/, '/'),
      real_ip: () => request.clientAddress ?? request.server.REMOTE_ADDR ?? '0.0.0.0',
      getenv: name => ['HTTP_X_FORWARDED_FOR','HTTP_CLIENT_IP','REMOTE_ADDR'].includes(text(name)) ? request.server[text(name)] ?? false : false,
      pass_compare: (username,cookie,stored) => passCompare(username,cookie,stored,config.oldpswdcmp),
      timestamp_salt: (password,offset=0) => timestampSalt(password,offset,clock.now()),
      compare_ts_pass: (received,password) => compareTimestampPass(received,password,clock.now()),
      sleep: async seconds => {await sleep(Math.max(0,Math.trunc(n(seconds)))*1000);return 0;},
      uniqid: (prefix='',entropy=false) => {
        const microseconds=BigInt(Math.floor(clock.now()*1e6));
        const suffix=String(randomInt(1000000000)).padStart(9,'0');
        return text(prefix)+(microseconds/1000000n).toString(16).padStart(8,'0')+(microseconds%1000000n).toString(16).padStart(5,'0')+(present(entropy)?suffix[0]+'.'+suffix.slice(1):'');
      },
      startmicrotime: () => { globals.startmicrotime=clock.now(); },
      get_script_runtime: started => (clock.now()-n(started)).toFixed(2),
      putmicrotime: (start,end,file,info) => {
        if(!/^[A-Za-z0-9_-]+$/.test(text(file)))throw new TypeError('Invalid diagnostic log name');
        return files.write(`gamedata/tmp/diagnostics/${text(file)}.txt`,`${text(info)} ；执行时间：${(n(end)-n(start))*1000} 毫秒 \r\n`,'ab');
      },
      logmicrotime: async info => { const end=clock.now();await functions.putmicrotime(globals.startmicrotime,end,'microtimelog',info);globals.startmicrotime=end; },
      // Node continues an already dispatched handler on disconnect; shutdown
      // drains it. This setting records the source's explicit callback intent.
      ignore_user_abort: value => { const previous=host.ignoreUserAbort?1:0;host.ignoreUserAbort=present(value);return previous; },
      header: (line,replace=true,status=null) => {
        if (/[\r\n]/.test(text(line))) throw new TypeError('Invalid response header');
        const split=text(line).indexOf(':');if(split<1)throw new TypeError('Invalid response header');
        const name=text(line).slice(0,split),value=text(line).slice(split+1).trim();
        if(!/^[A-Za-z0-9-]+$/.test(name))throw new TypeError('Invalid response header name');
        const key=Object.keys(host.headers).find(key=>key.toLowerCase()===name.toLowerCase())??name;
        host.headers[key]=!replace&&host.headers[key]!=null?[].concat(host.headers[key],value):value;
        if(status!=null)host.status=n(status);else if(name.toLowerCase()==='location')host.status=302;
      },
      render_page: async (name,extra={}) => {
        const target=Object.assign(Object.create(null),host.scope,globals._POST,extra);
        return renderPage(text(name),host,target);
      },
      gexit: message => { throw new GamePageError('game_error', message); },
      gsetcookie: host.setCookie, gsetcookie_comp: host.setCookie, clearcookies: () => { host.setCookie('user','');host.setCookie('pass',''); },
      fetch_udata: (...args) => users.fetch(...args), fetch_udata_by_username: (username,fields='*') => users.fetchByUsername(username,{fields}), fetch_udata_multilist: (...args) => users.fetchMany(...args),
      update_udata: (...args) => users.update(...args), update_udata_by_username: (...args) => users.updateByUsername(...args), update_udata_multilist: (...args) => users.updateMany(...args),
      insert_udata: (...args) => users.insert(...args), udata_check: () => host.accounts.authenticate({ ...state('sys'), script }),
      message_create: (...args) => host.messages.create(...args), check_new_messages: (...args) => host.messages.checkNew(...args),
      room_check_subroom: roomIsSubroom, room_prefix_kind: roomPrefixKind, room_prefix2id: roomPrefixToId, room_id2prefix: roomIdToPrefix,
      room_get_tablepre: (...args) => host.rooms.tablePrefix(...args), set_current_roomid: (...args) => host.rooms.setCurrentId(...args),
      room_get_vars: (...args) => host.rooms.getVars(...args), room_creater_check: (...args) => host.rooms.creatorCheck(...args), room_team_leader_check: (...args) => host.rooms.teamLeader(...args),
      room_get_vars_ref: (...args) => host.rooms.getVarRef(...args),
      room_create: (...args) => host.rooms.create(...args), room_enter: (...args) => host.rooms.enter(...args),
      update_roomstate: (...args) => host.rooms.updateState(...args), room_auto_kick_check: (...args) => host.rooms.autoKick(...args),
      room_check_game_option: (...args) => host.rooms.checkOption(...args), room_set_game_option: (...args) => host.rooms.setOption(...args),
      room_getteamhtml: (...args) => host.rooms.teamHtml(...args), room_init: (...args) => host.rooms.initialize(...args), room_new_chat: (...args) => host.rooms.newChat(...args),
      room_refresh_team_pos: (...args) => host.rooms.refreshTeamPositions(...args), room_save_broadcast: (...args) => host.rooms.saveBroadcast(...args),
      room_timestamp_tick: (...args) => host.rooms.tick(...args), room_upos_check: (...args) => host.rooms.userPosition(...args), roomdata_save: (...args) => host.rooms.save(...args),
      check_room_available: (...args) => host.rooms.available(...args), get_instance3_debuff_tips: instance3DebuffTips,
      room_check_gamenum: (...args) => host.rooms.checkGameNumber(...args), fetch_roomdata: (...args) => host.rooms.fetch(...args),
      room_gettype_from_gtype: (...args) => host.rooms.getTypeFromGameType(...args), room_participant_get:(...args)=>host.rooms.participants(...args),
      save_gameinfo: (...args) => call('sys','save_gameinfo',...args), addnews: (...args) => call('sys','addnews',...args), getchat: (...args) => call('sys','getchat',...args),
      systemputchat: (...args) => call('sys','systemputchat',...args), enter_battlefield: host.enterBattlefield,
      get_var_input: async name => (await call('input','get_var',name)).value,
      get_var_in_module: (name,module) => state(module)[name] ?? null,
      filemtime: value => files.mtime(value), touch: value => files.touch(value), unlink: value => files.remove(value), readover: value => files.read(value),
      clear_dir: (value,keep,expire) => files.clear(value,{keepRoot:!!keep,expireSeconds:n(expire)}),
    });
    const services = host.services = { input: request.input, database, output, templates: host.templates, random, files, inCommand: true,
      playerLocks: locks.playerLocks, playerAssets: await createPlayerAssets(path.join(sourceRoot,'img')), skills: createSkillCatalog(selected,infoById),
      system: { config: systemConfig, request: { cookies: request.input.cookies, post: request.input.post, script, page, pageStartTime: request.pageStartTime, daemon: false },
        files, locks: locks.locks, users, rooms: host.rooms, messages: host.messages, clock } };
    services.system.config = { ...effectiveSystem, server_address: config.server_address };
    services.generated = createGeneratedServices({ constants, globals, functions, files, clock:{nowSeconds:now}, random, output, templates:host.templates, capabilities:{replayRecording:true} });
    const {sys: _sys, ...gameStates} = snapshot.game;
    await registry.createSession({ services, states:gameStates, onCreate: value => { session = host.session = value; } });
    if (session.hasModule('gameflow_antiafk')) Object.assign(state('gameflow_antiafk'),snapshot.game.gameflow_antiafk);
    host.gameAdmin = createGameAdminService({ accounts:host.accounts, admin:host.admin, session, database, files, maintenance, configuration:host.configuration, clock:now });
    host.autoMaintain = createAutoMaintainService({stateRoot,database,files,locks:locks.locks,maintenance,tablePrefix:config.gtablepre,gameNow:()=>state('sys').now,clock:now,configuration:()=>state('sys')});
    state('sys').db = database;
    host.scope = session.importInto(globals, 'input','sys','map');
    // replay.php deliberately sets CURSCRIPT=game before common.inc.php. Its
    // dummy player and profile fields must share the same imported live slots.
    if (session.hasModule('player') && (constants.CURSCRIPT === 'game' || ['act','command'].includes(script))) session.importInto(host.scope,'player','logger','itemmain');
    Object.assign(host.scope, { roomtypelist: host.rooms.config.roomtypelist, script, game_url: config.server_address });
    return host;
  } catch (error) { try { await host.close(); } catch (cleanup) { throw new AggregateError([error,cleanup],error.message); } throw error; }
}
