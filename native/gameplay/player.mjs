import { isReferenceDescriptor, referenceValue } from '../templates/values.mjs';
import { readFile } from 'node:fs/promises';
import { isNumeric, number as n, present, round, sameDurability, text } from './numbers.mjs';

const call = (ctx, name, ...args) => ctx.call('player', name, ...args);
const isset = value => value !== undefined && value !== null;
const filled = value => present(value) && (typeof value !== 'object' || Object.keys(value).length !== 0);
const copy = value => value === undefined ? null : structuredClone(value);
const iconSnapshotProbe = Symbol('built-in icon directory snapshot');
// PHP copies an array parameter but keeps reference slots inside that array.
// Only explicitly declared native getter/setter aliases retain that identity;
// plain records are ordinary value parameters. Pool snapshots use copy().
function parameterCopy(value) {
  const result = copy(value);
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (isReferenceDescriptor(descriptor)) Object.defineProperty(result, key, descriptor);
  }
  return result;
}
const field = (ctx, key) => ctx.state('player')[key];
const service = (ctx, name, method) => {
  const owner = ctx.services[name];
  if (typeof owner?.[method] !== 'function') throw new Error(`Native player requires ${name}.${method}().`);
  return owner[method].bind(owner);
};
const table = (ctx, schema = false) => {
  const sys = ctx.state('sys'), prefix = schema ? sys.gtablepre ?? sys.tablepre : sys.tablepre;
  if (typeof prefix !== 'string' || !/^[a-zA-Z0-9_]*$/.test(prefix)) throw new TypeError('Invalid player table prefix');
  return `${prefix}players`;
};
const query = async (ctx, sql) => {
  const rows = await service(ctx, 'database', 'query')(sql);
  if (!Array.isArray(rows)) throw new TypeError('database.query must return an array of row records');
  return rows;
};
const update = (ctx, data, where, oldData = null) => service(ctx, 'database', 'arrayUpdate')(table(ctx), copy(data), where, copy(oldData));
const pools = ctx => {
  const sys = ctx.state('sys');
  // These three request pools are insertion-ordered pid maps. Object's numeric
  // key ordering changes which same-name player fetch_playerdata returns and
  // the sequence in which locks are released. Normalize legacy empty []/{},
  // but callers preloading a meaningful non-numeric order must supply a Map:
  // an object has already lost that information before this module receives it.
  for (const name of ['pdata_pool', 'pdata_origin_pool', 'pdata_lock_pool']) {
    const pool = sys[name];
    if (pool instanceof Map) {
      if ([...pool.keys()].some(key => typeof key !== 'string')) sys[name] = new Map([...pool].map(([key, value]) => [String(key), value]));
    } else if (pool == null) sys[name] = new Map();
    else if (typeof pool === 'object') sys[name] = new Map(Object.entries(pool));
    else throw new TypeError(`Native player requires an ordered Map for ${name}`);
  }
  return sys;
};
function strictFieldEqual(left, right) {
  if (left === right) return true;
  if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object') return false;
  const a = Object.entries(left), b = Object.entries(right);
  return a.length === b.length && a.every(([key, value], i) => key === b[i][0] && strictFieldEqual(value, b[i][1]));
}
function extension(filename) {
  const name = text(filename).split(/[\\/]/).at(-1), index = name.lastIndexOf('.');
  return index === -1 ? '' : name.slice(index + 1);
}
// PHP substr($name, 0, 0) is empty (a filename without an extension matters).
const removeEnding = (name, count) => count === 0 ? '' : name.slice(0, -count);
function interfaceState(ctx) {
  const sys = ctx.state('sys');
  sys.uip ??= {};
  sys.uip.innerHTML ??= {};
  sys.uip.value ??= {};
  return sys.uip;
}

/** Native implementation of core/player/main.php and config/player.config.php.
 *
 * Host contracts, all asynchronous except the request-local random generator:
 * - database.query(sql) -> row records, database.arrayUpdate(table,data,where,
 *   oldData), database.queries(sql). Numeric DB values remain mysqli strings;
 *   this module's strict diff intentionally distinguishes '1' from 1. Source
 *   callers supply pre-escaped SQL values; the storage adapter must not escape
 *   them twice. It must surface errors, not invent an empty player or save.
 * - playerLocks.check(room,pid,timeoutMs), create(room,pid), release(room,pid).
 *   check returns true when blocked, create true on success. The service must
 *   use real process-safe locks or fail; services.inCommand marks IN_COMMAND.
 * - playerAssets.exists(filename), dimensions(filename) -> [width,height],
 *   relative to the original img directory. Unsupported/corrupt resources must
 *   be reported by that service. The icon cache is request-local native data;
 *   no executable PHP cache is loaded or written.
 * - random.rand(min,max), random.arrayRandPacked(safeAreas), output.peek() -> text.
 * - optional playerDiagnostics.fetchedSelf({by,value}) receives the original
 *   self-fetch diagnostic. It replaces source debug_backtrace/log.txt details.
 *
 * Initialization uses the application's schema metadata, or DESCRIBEs the
 * installed players table for a standalone host. It never creates a PHP
 * compile-time tmp_players table or executes a PHP schema cache. The table
 * must already be installed from the original players.sql. Gameplay
 * reset executes that same original SQL only when rs_game's bit 4 is requested.
 * Skill/map/sys/weapon hooks are real registry dependencies, not placeholders.
 * By-value player inputs are cloned at each source by-value boundary; sdata's
 * DB fields alone are live getters/setters to the flattened module variables.
 * sys.pdata_pool, pdata_origin_pool and pdata_lock_pool use Map<string pid,...>.
 * Hooks access these through get/set/delete/values, preserving insertion order.
 */
export const playerModule = {
  name: 'player',
  dependencies: ['sys', 'map', 'input'],
  state: () => ({
    db_player_structure: [], db_player_structure_types: {}, gamedata: {}, cmd: null, main: null, sdata: {},
    fog: null, upexp: null, lvlupexp: null, iconImg: null, iconImgB: null, iconImgBwidth: null, ardef: null,
    hpcolor: null, spcolor: null, newhpimg: null, newspimg: null, splt: null, hplt: null, tpldata: [],
    icon_list: {}, icon_list_contents_to_frontend: {}, typeinfo: { 0: '参战者' }, killmsginfo: { 0: '' },
    lwinfo: { 0: '' }, sexinfo: { 0: '未定', m: '男生', f: '女生' }, equip_list: [], battle_equip_list: [],
    pc_icon_range: { f: [0, 24], m: [0, 22], n: [0, 999] },
  }),
  async initialize(ctx) {
    const state = ctx.state();
    pools(ctx);
    state.db_player_structure = [];
    state.db_player_structure_types = {};
    state.tpldata = [];
    // New rooms have no players table until reset_game. The installed main
    // schema is shared by every room, as was the original compile-time cache.
    const rows = ctx.services.playerSchema
      ? await ctx.services.playerSchema.describe(ctx.services.database, table(ctx, true))
      : await query(ctx, `DESCRIBE ${table(ctx, true)}`);
    if (!rows.length) throw new Error('Native player requires an installed players table with a real schema');
    for (const { Field: key, Type: type } of rows) {
      if (typeof key !== 'string' || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) || typeof type !== 'string' || Object.hasOwn(state.db_player_structure_types, key)) throw new TypeError('Invalid or duplicate player schema column');
      state.db_player_structure.push(key);
      state.db_player_structure_types[key] = type;
      if (!Object.hasOwn(state, key)) state[key] = null;
    }
  },
  functions: {
    async create_player_lock(ctx, pid, forced = 0) {
      if (!ctx.services.inCommand && !filled(forced)) return 3;
      const sys = pools(ctx);
      if (isset(sys.pdata_lock_pool.get(String(pid)))) return 1;
      let result = 2;
      if (!filled(await service(ctx, 'playerLocks', 'check')(sys.groomid, pid, 15000))) {
        if (filled(await service(ctx, 'playerLocks', 'create')(sys.groomid, pid))) result = 0;
      }
      // The original records attempted locks even if check/create failed.
      sys.pdata_lock_pool.set(String(pid), 1);
      return result;
    },
    async release_player_lock(ctx, pid) {
      const sys = pools(ctx);
      await service(ctx, 'playerLocks', 'release')(sys.groomid, pid);
      sys.pdata_lock_pool.delete(String(pid));
    },
    async release_player_lock_from_pool(ctx) {
      // Source array_keys snapshots the pool before callbacks release entries.
      for (const pid of [...pools(ctx).pdata_lock_pool.keys()]) await call(ctx, 'release_player_lock', /^-?(?:0|[1-9]\d*)$/.test(pid) ? Number(pid) : pid);
    },
    async fetch_playerdata(ctx, name, type = 0, ignorePool = 0, ignoreLock = 0) {
      const sys = pools(ctx);
      let data = null;
      // Preserve the source pool lookup by name only, even if type differs.
      if (!filled(ignorePool)) for (const candidate of sys.pdata_pool.values()) {
        if (isset(candidate.name) && sameDurability(candidate.name, name)) { data = copy(candidate); break; }
      }
      if (sameDurability(name, field(ctx, 'name')) && ctx.services.playerDiagnostics?.fetchedSelf) await ctx.services.playerDiagnostics.fetchedSelf({ by: 'name', value: name });
      if (!filled(data)) {
        const found = await query(ctx, `SELECT pid FROM ${table(ctx)} WHERE name = '${text(name)}' AND type = '${text(type)}'`);
        if (!found.length) return null;
        const pid = found[0].pid;
        if (!filled(ignoreLock)) await call(ctx, 'create_player_lock', pid);
        [data] = await query(ctx, `SELECT * FROM ${table(ctx)} WHERE pid = '${text(pid)}'`);
        if (!data) throw new Error('Player disappeared after existence check and lock');
        sys.pdata_origin_pool.set(String(data.pid), copy(data));
        sys.pdata_pool.set(String(data.pid), copy(data));
      }
      return call(ctx, 'playerdata_construct_process', copy(data));
    },
    async fetch_playerdata_by_pid(ctx, pid, ignorePool = 0, ignoreLock = 0) {
      const sys = pools(ctx);
      if (sameDurability(pid, field(ctx, 'pid')) && ctx.services.playerDiagnostics?.fetchedSelf) await ctx.services.playerDiagnostics.fetchedSelf({ by: 'pid', value: pid });
      let data;
      if (!filled(ignorePool) && isset(sys.pdata_pool.get(String(pid)))) data = copy(sys.pdata_pool.get(String(pid)));
      else {
        const found = await query(ctx, `SELECT pid FROM ${table(ctx)} WHERE pid = '${text(pid)}'`);
        if (!found.length) return null;
        const actualPid = found[0].pid;
        if (!filled(ignoreLock)) await call(ctx, 'create_player_lock', actualPid);
        [data] = await query(ctx, `SELECT * FROM ${table(ctx)} WHERE pid = '${text(actualPid)}'`);
        if (!data) throw new Error('Player disappeared after existence check and lock');
        sys.pdata_origin_pool.set(String(data.pid), copy(data));
        sys.pdata_pool.set(String(data.pid), copy(data));
      }
      return call(ctx, 'playerdata_construct_process', copy(data));
    },
    async fetch_original_playerdata_by_id(ctx, pid) { return copy(pools(ctx).pdata_origin_pool.get(String(pid)) ?? null); },
    async playerdata_construct_process(ctx, data) { data = parameterCopy(data); data.state_backup = data.state ?? null; return data; },
    async load_playerdata(ctx, data) {
      data = parameterCopy(data);
      const scope = ctx.importInto({}, 'sys', 'player');
      for (const [key, value] of Object.entries(data)) if (Object.hasOwn(scope, key)) scope[key] = value;
      const state = ctx.state(), sdata = {};
      for (const key of state.db_player_structure) Object.defineProperty(sdata, key, {
        enumerable: true, configurable: true, get: () => state[key], set: value => { state[key] = value; },
      });
      if (filled(data.state_backup)) sdata.state_backup = data.state_backup;
      state.sdata = sdata;
    },
    async post_load_profile_event() {},
    async get_alivenum_for_display(ctx) { return ctx.state('sys').alivenum; },
    async check_alive_player_displayable() { return true; },
    async get_player_killmsg(ctx, data) { return data.killmsg ?? null; },
    async get_player_lastword(ctx, data) { return data.lastword ?? null; },
    async create_dummy_playerdata(ctx) {
      return Object.fromEntries(Object.entries(ctx.state().db_player_structure_types).map(([key, type]) => [key, type.includes('int') ? 0 : '']));
    },
    async icon_parser_valid(ctx, data = null) {
      data = referenceValue(data);
      if (!filled(data)) data = field(ctx, 'sdata');
      const gender = data.gender ?? data.gd ?? 'x', range = field(ctx, 'pc_icon_range')[gender];
      return filled(data.type) || (isNumeric(data.icon) && Math.trunc(n(data.icon)) === n(data.icon) && isset(range) && n(data.icon) <= n(range[1]) && n(data.icon) >= n(range[0]));
    },
    async get_pc_icon_selecting_list(ctx) {
      const state = ctx.state();
      if (filled(state.icon_list)) return copy(state.icon_list);
      // Only the built-in pair is pure filename/metadata work. An extension
      // can observe every original call, so any override keeps the full range
      // and sequential hook dispatch. Ordinary file names use a request-local
      // snapshot; symlinks and actual image reads still validate current paths.
      const indexed = typeof ctx.services.playerAssets?.numberedCandidates === 'function'
        && ['icon_parser_name_format', 'icon_parser_file_check'].every(name =>
          ctx.isUnhookedFunction('player', name, playerModule.functions[name]));
      if (indexed && ctx.services.playerIconCatalog && ctx.isUnhookedFunction('player', 'get_pc_icon_selecting_list', playerModule.functions.get_pc_icon_selecting_list)) {
        const catalog = await ctx.services.playerIconCatalog.read(JSON.stringify(state.pc_icon_range), async () => {
          await playerModule.functions.get_pc_icon_selecting_list({ ...ctx, services: { ...ctx.services, playerIconCatalog: undefined } });
          return { icon_list: state.icon_list, icon_list_contents_to_frontend: state.icon_list_contents_to_frontend };
        });
        Object.assign(state, catalog);
        return copy(state.icon_list);
      }
      state.icon_list = { f: {}, m: {} };
      state.icon_list_contents_to_frontend = {};
      for (const gender of ['f', 'm', 'n']) {
        const [minimum, maximum] = state.pc_icon_range[gender].map(n);
        const step = minimum <= maximum ? 1 : -1;
        const inspect = async index => {
          const [small, big] = await call(ctx, 'icon_parser_name_format', gender === 'n' ? 1 : 0, gender, index);
          return indexed && typeof ctx.services.playerAssets.snapshotExists === 'function'
            ? call(ctx, 'icon_parser_file_check', small, big, iconSnapshotProbe)
            : call(ctx, 'icon_parser_file_check', small, big);
        };
        const candidates = indexed ? await ctx.services.playerAssets.numberedCandidates(gender, minimum, maximum) : null;
        // Independent read-only image probes run together, then publish in
        // source range order. No player state, hook or random call is cached.
        const results = candidates && await Promise.allSettled(candidates.map(inspect));
        let position = 0;
        for (let index = candidates ? candidates[position] : minimum;
          candidates ? position < candidates.length : step > 0 ? index <= maximum : index >= maximum;
          index = candidates ? candidates[++position] : index + step) {
          if (candidates && results[position].status === 'rejected') throw results[position].reason;
          const result = candidates ? results[position].value : await inspect(index);
          if (!filled(result[0])) continue;
          (state.icon_list[gender] ??= {})[index] = result;
          if (gender !== 'n') {
            if (!filled(state.icon_list_contents_to_frontend[gender])) state.icon_list_contents_to_frontend[gender] = [];
            state.icon_list_contents_to_frontend[`${gender}_${index}`] = result[0];
          }
        }
      }
      return copy(state.icon_list);
    },
    async icon_parser_shell(ctx, data = null) {
      data = referenceValue(data);
      if (!filled(data)) data = field(ctx, 'sdata');
      if (!filled(await call(ctx, 'icon_parser_valid', data))) return ['punish.png', '', 0];
      return call(ctx, 'icon_parser', data.type ?? 0, data.gender ?? data.gd ?? 'f', data.icon);
    },
    async icon_parser(ctx, type, gender, icon) {
      const icons = await call(ctx, 'get_pc_icon_selecting_list');
      if (filled(type)) gender = 'n';
      if (filled(icons[gender]?.[icon])) return copy(icons[gender][icon]);
      const [small, big] = await call(ctx, 'icon_parser_name_format', type, gender, icon);
      return call(ctx, 'icon_parser_file_check', small, big);
    },
    async icon_parser_name_format(ctx, type, gender, icon) {
      if (isNumeric(icon)) {
        if (filled(type)) gender = 'n';
        return [`${text(gender)}_${text(icon)}.gif`, `${text(gender)}_${text(icon)}a.gif`];
      }
      const name = text(icon), ext = extension(name);
      return [name, `${removeEnding(name, Buffer.byteLength(ext) + 1)}_a.${ext}`];
    },
    async icon_parser_file_check(ctx, small, big, probe) {
      const exists = service(ctx, 'playerAssets', probe === iconSnapshotProbe ? 'snapshotExists' : 'exists');
      const fallback = async name => {
        if (await exists(name)) return name;
        const stem = removeEnding(name, extension(name).length);
        for (const ext of ['png', 'jpg']) if (await exists(stem + ext)) return stem + ext;
        return '';
      };
      let width = 0;
      small = await fallback(small);
      if (filled(small)) big = await fallback(big);
      if (filled(small) && filled(big)) {
        const [w, h] = await service(ctx, 'playerAssets', 'dimensions')(big);
        if (n(h) <= 80) big = '';
        else if (n(h) <= 340) width = w;
        else width = round(n(w) / (n(h) / 340));
      }
      return [small, big, width];
    },
    async get_icon_num_limit(ctx, gender = 'f') {
      if (gender !== 'f' && gender !== 'm') gender = 'f';
      return copy(field(ctx, 'pc_icon_range')[gender]);
    },
    async get_icon_num_random(ctx, gender = 'f') {
      if (gender !== 'f' && gender !== 'm') gender = 'f';
      const [minimum, maximum] = await call(ctx, 'get_icon_num_limit', gender);
      const icons = await call(ctx, 'get_pc_icon_selecting_list');
      let result;
      do { result = service(ctx, 'random', 'rand')(n(minimum), n(maximum)); }
      while (!filled(result) || !filled(icons[gender]?.[result]));
      return result;
    },
    async check_fog() { return false; },
    async init_playerdata(ctx) {
      const scope = ctx.importInto({}, 'sys', 'player');
      [scope.iconImg, scope.iconImgB, scope.iconImgBwidth] = await call(ctx, 'icon_parser_shell', scope.sdata);
      if (!filled(scope.weps)) Object.assign(scope, { wep: scope.nowep, wepk: 'WN', wepsk: '', wepe: 0, weps: scope.nosta });
      if (!filled(scope.arbs)) Object.assign(scope, { arb: scope.noarb, arbk: 'DN', arbsk: '', arbe: 0, arbs: 0 });
      scope.fog = await call(ctx, 'check_fog');
    },
    async parse_interface_gameinfo(ctx) {
      const scope = ctx.importInto({}, 'sys', 'player', 'logger'), uip = interfaceState(ctx);
      uip.innerHTML.log = scope.log;
      uip.innerHTML.anum = n(scope.gametype) !== 2 ? await call(ctx, 'get_alivenum_for_display') : scope.validnum;
      uip.value.cpls = scope.pls; uip.value.croomid = scope.groomid;
      if (!filled(uip.cmd_buttons)) uip.cmd_buttons = [];
    },
    async parse_interface_profile(ctx) {
      const scope = ctx.importInto({}, 'sys', 'player', 'map'), uip = interfaceState(ctx), data = scope.sdata;
      const dummy = await call(ctx, 'create_dummy_playerdata'); dummy.bskill = 0; dummy.wep_kind = 'N';
      data.wep_kind = await ctx.call('weapon', 'get_attack_method', data);
      uip.total_att = round(n(await ctx.call('weapon', 'get_att', data, dummy, 1)) * 10) / 10;
      if (filled(data.att_m_words)) data.att_words = data.att_m_words;
      uip.att_words = `${text(uip.total_att)}=${text(data.att_words)}`;
      uip.total_def = round(n(await ctx.call('weapon', 'get_def', dummy, data, 0)) * 10) / 10;
      if (filled(data.def_m_words)) data.def_words = data.def_m_words;
      uip.def_words = `${text(uip.total_def)}=${text(data.def_words)}`;
      delete data.wep_kind;
      scope.hpcolor = n(scope.hp) <= n(scope.mhp) * 0.2 ? 'red b' : n(scope.hp) <= n(scope.mhp) * 0.5 ? 'yellow b' : 'cyan b';
      scope.spcolor = n(scope.sp) <= n(scope.msp) * 0.2 ? 'grey b' : n(scope.sp) <= n(scope.msp) * 0.5 ? 'yellow b' : 'cyan b';
      const hp = Math.floor(155 * (1 - n(scope.hp) / Math.max(n(scope.mhp), 1)));
      const sp = Math.floor(155 * (1 - n(scope.sp) / Math.max(n(scope.msp), 1)));
      const bar = (file, top) => `<img src="img/${file}.gif" style="position:absolute; clip:rect(${text(top)}px,55px,160px,0px);">`;
      scope.newhpimg = bar('hpman', 6 + hp); scope.hplt = bar('hplt', 3 + hp);
      scope.newspimg = bar('spman', 6 + sp); scope.splt = bar('splt', 3 + sp);
      uip.innerHTML.pls = scope.plsinfo[scope.pls]; uip.value.teamID = scope.teamID;
      uip.innerHTML.chattype_sl = filled(scope.teamID)
        ? `<option value="0">${text(scope.chatinfo[0])}</option><option value="1" selected>${text(scope.chatinfo[1])}</option>`
        : `<option value="0" selected>${text(scope.chatinfo[0])}</option>`;
      await ctx.call('map', 'init_areatiming');
    },
    async addarea_pc_process(ctx, time) {
      if (!filled(await ctx.call('map', 'get_current_not_area'))) return;
      const areas = await ctx.call('map', 'get_current_area');
      const where = `('${Object.values(areas).map(text).join("','")}')`;
      for (const data of await query(ctx, `SELECT * FROM ${table(ctx)} WHERE pls IN ${where} AND hp>0`)) await call(ctx, 'addarea_pc_process_single', copy(data), time);
      const rows = await query(ctx, `SELECT COUNT(*) FROM ${table(ctx)} WHERE hp>0 AND type=0`);
      ctx.state('sys').alivenum = Object.values(rows[0])[0];
      await ctx.next(time);
    },
    async addarea_pc_process_single(ctx, data, time) {
      data = copy(data);
      const previous = copy(data), pid = data.pid;
      if (filled(data.type)) return;
      if (!filled(await call(ctx, 'check_pc_avoid_killarea', copy(data), time))) {
        Object.assign(data, { hp: 0, state: 11, bid: 0, endtime: time, player_dead_flag: 1 });
        await update(ctx, data, `pid='${text(pid)}'`, previous);
        await ctx.call('sys', 'addnews', time, 'death11', data.name, data.type, data.pls, '', '');
        ctx.state('sys').deathnum = n(ctx.state('sys').deathnum) + 1;
      } else {
        let available = await ctx.call('map', 'get_safe_plslist');
        if (!filled(available)) available = await ctx.call('map', 'get_safe_plslist', 0);
        if (!Array.isArray(available)) throw new TypeError('Native safe area list must retain the packed source numeric keys');
        data.pls = available[service(ctx, 'random', 'arrayRandPacked')(available)];
        await update(ctx, data, `pid='${text(pid)}'`, previous);
        await call(ctx, 'post_pc_avoid_killarea', copy(data), time);
      }
    },
    async check_pc_avoid_killarea(ctx) {
      const scope = ctx.importInto({}, 'sys', 'map');
      return n(scope.gamestate) < 40 && filled(scope.areaesc);
    },
    async post_pc_avoid_killarea() {},
    async update_sdata() {},
    async before_last_player_save_event() {},
    async player_format_with_db_structure(ctx, data) {
      const result = {};
      for (const key of field(ctx, 'db_player_structure')) if (isset(data[key])) result[key] = copy(data[key]);
      return result;
    },
    async player_diff_from_poll(ctx, data) {
      if (!isset(data.pid)) return null;
      const original = pools(ctx).pdata_origin_pool.get(String(data.pid));
      if (!isset(original)) return copy(data);
      return Object.fromEntries(Object.entries(data).filter(([key, value]) => !isset(original[key]) || !strictFieldEqual(value, original[key])).map(([key, value]) => [key, copy(value)]));
    },
    async player_save(ctx, data, inProc = 0) {
      data = parameterCopy(data);
      if (!isset(data.pid)) return;
      const sys = pools(ctx), pid = data.pid;
      if (n(data.hp) <= 0 && n(data.state) < 10 && filled(data.deathmark)) data.state = Math.trunc(n(data.deathmark));
      sys.pdata_pool.set(String(pid), copy(data));
      let changes = await call(ctx, 'player_format_with_db_structure', copy(data));
      changes = await call(ctx, 'player_diff_from_poll', changes);
      delete changes.pid;
      if (n(data.hp) <= 0) {
        changes.player_dead_flag = 1;
        if (!isset(sys.pdata_origin_pool.get(String(pid)))) sys.pdata_origin_pool.set(String(pid), {});
        sys.pdata_origin_pool.get(String(pid)).player_dead_flag = sys.pdata_pool.get(String(pid)).player_dead_flag = 1;
      }
      if (isset(changes.player_dead_flag) && !filled(changes.player_dead_flag)) delete changes.player_dead_flag;
      if (Object.keys(changes).length) {
        let where = `pid='${text(pid)}'`;
        if (!filled(data.type)) where += ` AND name='${text(data.name)}'`;
        await update(ctx, changes, where);
        // Keep the source snapshot order, including the dead-flag value in data.
        sys.pdata_origin_pool.set(String(pid), copy(data));
      }
    },
    async rs_game(ctx, mode) {
      await ctx.next(mode);
      if (n(mode) & 4) {
        const sql = await readFile(new URL('../../engine/gamedata/sql/players.sql', import.meta.url), 'utf8');
        const prefix = table(ctx).slice(0, -'players'.length);
        await service(ctx, 'database', 'queries')(sql.replaceAll(' bra_', ` ${prefix}`).replaceAll('\r', '\n'));
        Object.assign(ctx.state('sys'), { validnum: 0, alivenum: 0, deathnum: 0 });
      }
    },
    async deathnews(ctx, pa, pd) {
      const lastword = await call(ctx, 'get_player_lastword', pd);
      const name = `${text(field(ctx, 'typeinfo')[pd.type])} ${text(pd.name)}`;
      await ctx.call('sys', 'addchat', 3, lastword, name, '', 0, pd.pls);
      await ctx.call('sys', 'addnews', ctx.state('sys').now, `death${text(pd.state)}`, pd.name, pd.type, filled(pd.sourceless) ? '' : pa.name, pa.attackwith, lastword);
    },
    async get_dinfo(ctx, data) { return ctx.state('sys').dinfo?.[data.state] ?? `你莫名地死了。这应该是BUG，请通知管理员。<br>死亡代号：${text(data.state)}`; },
    async set_revive_sequence(ctx, pa, pd) { pd.revive_sequence = {}; },
    async revive_process(ctx, pa, pd) {
      if (!filled(pd.revive_sequence) || filled(await call(ctx, 'revive_veto', pa, pd))) return;
      const entries = Object.entries(pd.revive_sequence).sort(([a], [b]) => n(a) - n(b));
      pd.revive_sequence = Object.fromEntries(entries);
      for (const [, key] of entries) if (filled(await call(ctx, 'revive_check', pa, pd, key))) {
        await call(ctx, 'pre_revive_events', pa, pd, key);
        await call(ctx, 'revive_events', pa, pd, key);
        await call(ctx, 'post_revive_events', pa, pd, key);
        break;
      }
    },
    async revive_veto() { return false; },
    async revive_check() { return false; },
    async pre_revive_events(ctx, pa, pd) { pd.o_state = pd.state; },
    async post_revive_events() {},
    async revive_post_deathnews(ctx, news) { await ctx.call('sys', 'addnews', 0, news[0], news[1], filled(news[2]) ? news[2] : '', '', '', ''); },
    async revive_events(ctx, pa, pd) {
      const sys = ctx.state('sys');
      pd.state = 0; pd.hp = 1; sys.deathnum = n(sys.deathnum) - 1;
      if (n(pd.type) === 0) sys.alivenum = n(sys.alivenum) + 1;
      else if (n(pd.type) > 0) pd.npc_revived = 1;
      await ctx.call('sys', 'save_gameinfo');
    },
    async kill(ctx, pa, pd) {
      const sys = ctx.state('sys');
      pd.hp = 0;
      if (!isset(pd.sourceless) || !filled(pd.sourceless)) pd.bid = pa.pid;
      const message = !sameDurability(pa.pid, pd.pid) ? await call(ctx, 'get_player_killmsg', pa) : '';
      if (n(pd.type) === 0 && !sameDurability(pd.pid, pa.pid)) pa.killnum = n(pa.killnum) + 1;
      else if (n(pd.type) > 0) pa.npckillnum = n(pa.npckillnum) + 1;
      sys.deathnum = n(sys.deathnum) + 1;
      if (n(pd.type) === 0) sys.alivenum = n(sys.alivenum) - 1;
      pd.endtime = sys.now;
      await ctx.call('sys', 'save_gameinfo');
      const previous = copy(pd);
      await call(ctx, 'set_revive_sequence', pa, pd);
      await call(ctx, 'revive_process', pa, pd);
      previous.hp = pd.hp;
      await call(ctx, 'deathnews', pa, previous);
      if (filled(pd.rivival_news)) await call(ctx, 'revive_post_deathnews', copy(pd.rivival_news));
      return message;
    },
    async pre_act(ctx) { const state = ctx.state(); if (filled(state.player_dead_flag)) state.hp = 0; if (n(state.hp) <= 0) state.player_dead_flag = 1; },
    async act(ctx) {
      const scope = ctx.importInto({}, 'sys', 'player');
      if (scope.command === 'menu') scope.mode = 'command';
      else if (scope.mode === 'command' && scope.command === 'special') scope.mode = ctx.state('input').sp_cmd ?? null;
    },
    async post_act(ctx) {
      const scope = ctx.importInto({}, 'sys', 'player');
      for (const key of ['motto', 'killmsg', 'lastword']) scope[key] = scope.cudata[key] ?? null;
    },
    async get_max_rage() { return 100; },
    async prepare_response_content(ctx) {
      const output = await service(ctx, 'output', 'peek')();
      if (typeof output !== 'string') throw new TypeError('output.peek() must return buffered HTML text');
      (ctx.state().gamedata.innerHTML ??= {}).notice = output;
    },
    async prepare_initial_response_content() {},
    async post_enterbattlefield_events() {},
  },
};
