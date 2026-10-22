import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import { patches, applyExactPatch } from './patches.mjs';

const phpString = value => "'" + String(value).replaceAll('\\', '\\\\').replaceAll("'", "\\'") + "'";
async function exists(file) { try { await fs.access(file); return true; } catch { return false; } }
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const within = (candidate, root) => { const relative = path.relative(root, candidate); return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative)); };
async function atomicWrite(file, bytes, options = {}) {
  await fs.mkdir(path.dirname(file), { recursive:true });
  const temporary = `${file}.dtsx-${randomBytes(8).toString('hex')}.tmp`;
  try { await fs.writeFile(temporary, bytes, options); await fs.rename(temporary, file); }
  finally { await fs.rm(temporary, { force:true }); }
}
export async function prepareEngine(config, { internalUrl = `http://127.0.0.1:${config.port}` } = {}) {
  await fs.mkdir(config.stateRoot, { recursive: true });
  const sourceReal = await fs.realpath(config.sourceRoot);
  const stateReal = await fs.realpath(config.stateRoot);
  if (within(stateReal, sourceReal) || within(sourceReal, stateReal)) throw new Error('Game source and state directories must not contain one another');
  await fs.mkdir(config.engineRoot, { recursive:true });
  const engineReal = await fs.realpath(config.engineRoot);
  if (!within(engineReal, stateReal)) throw new Error('Game runtime directory must stay inside DATA_DIR');
  const stateFile = path.join(config.stateRoot, 'source-state.json');
  let previous = {};
  try { previous = JSON.parse(await fs.readFile(stateFile, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw new Error('Cannot read source-state.json; restore its valid backup before syncing source', { cause:error }); }
  if (!previous || Array.isArray(previous) || typeof previous !== 'object' || Object.entries(previous).some(([file, hash]) => !/^[a-f0-9]{64}$/.test(hash) || file.includes('\\') || path.isAbsolute(file) || file.split('/').some(part => part === '..' || part === '.' || !part))) throw new Error('Invalid source-state.json; no source files were changed');
  const next = {};
  const operations = [];
  const checkedDirectories = new Set();
  async function assertTarget(target) {
    if (!within(target, config.engineRoot)) throw new Error('Source target escapes runtime directory');
    let current = path.dirname(target);
    while (current !== config.engineRoot && !checkedDirectories.has(current)) {
      try { const stat = await fs.lstat(current); if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error(`Runtime source parent is not a real directory: ${current}`); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      checkedDirectories.add(current); current = path.dirname(current);
    }
    try { const stat = await fs.lstat(target); if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Runtime source is not a regular file: ${target}`); return true; }
    catch (error) { if (error.code === 'ENOENT') return false; throw error; }
  }
  const conflict = relative => new Error(`Source synchronization conflict: ${relative} changed both in engine/ and DATA_DIR/game/. Back up and reconcile both copies, then retry. No source files were synchronized.`);
  async function sync(dir, prefix = '') {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const relative = prefix + entry.name;
      if (entry.isDirectory()) { await sync(path.join(dir, entry.name), relative + '/'); continue; }
      if (!entry.isFile()) throw new Error(`Source symlinks are not supported: ${relative}`);
      let bytes = await fs.readFile(path.join(dir, entry.name));
      const patch = patches.filter(p => p.file === relative);
      for (const p of patch) bytes = Buffer.from(applyExactPatch(bytes.toString('utf8'), p));
      const hash = digest(bytes);
      next[relative] = hash;
      const target = path.join(config.engineRoot, relative);
      const present = await assertTarget(target);
      if (previous[relative] !== hash || !present) {
        if (present) {
          const runtimeHash = digest(await fs.readFile(target));
          if (runtimeHash !== hash && runtimeHash !== previous[relative]) throw conflict(relative);
          if (runtimeHash === hash) continue;
        }
        operations.push({ target, bytes });
      }
    }
  }
  await sync(config.sourceRoot);
  for (const relative of Object.keys(previous)) {
    if (Object.hasOwn(next, relative)) continue;
    const target = path.join(config.engineRoot, relative);
    if (await assertTarget(target)) {
      if (digest(await fs.readFile(target)) !== previous[relative]) throw conflict(relative);
      operations.push({ target });
    }
  }
  // Preflight the entire source tree before the first mutation. The state lock
  // prevents concurrent startup/compilation from invalidating this decision.
  for (const { target, bytes } of operations) {
    if (bytes !== undefined) await atomicWrite(target, bytes);
    else await fs.unlink(target);
  }
  for (const dir of ['cache','modinit','run','bak','javascript','templates','replays','remote_replays','tmp/log','tmp/news','tmp/replay','tmp/response','tmp/rooms','tmp/server','tmp/processlock','tmp/playerlock','tmp/userlock']) await fs.mkdir(path.join(config.engineRoot, 'gamedata', dir), { recursive: true });
  const sys = path.join(config.engineRoot, 'include/modules/core/sys/config');
  for (const kind of ['server','system','game']) {
    if (!await exists(path.join(sys, `${kind}.config.php`))) await fs.copyFile(path.join(sys, `${kind}.config.sample.php`), path.join(sys, `${kind}.config.php`));
  }
  const modConfig = path.join(config.engineRoot, 'include/modulemng/modulemng.config.php');
  if (!await exists(modConfig)) await fs.copyFile(modConfig.replace('.config.php', '.config.sample.php'), modConfig);
  let moduleConfig = await fs.readFile(modConfig, 'utf8');
  for (const [key, value] of Object.entries({ ADV1:1, ADV2:1, ADV3:1, COMBINE:0 })) moduleConfig = moduleConfig.replace(new RegExp('\\$___MOD_CODE_' + key + '\\s*=\\s*\\d+;'), '$___MOD_CODE_' + key + ' = ' + value + ';');
  moduleConfig = moduleConfig.replace(/\$___MOD_SRV\s*=\s*\d+;/, '$___MOD_SRV = 0;');
  await atomicWrite(modConfig, moduleConfig);
  const configFile = path.join(sys, 'server.config.php');
  let server = (await fs.readFile(configFile, 'utf8')).split('// DTS-X environment overrides')[0].replace(/\?>\s*$/, '').trimEnd();
  const overrides = { server_address:internalUrl, gameurl:config.publicUrl, dbhost:`${config.dbHost}:${config.dbPort}`, dbuser:config.dbUser, dbpw:config.dbPassword, dbname:config.dbName, gtablepre:config.tablePrefix, gamefounder:config.adminUser, gtitle:config.title, errorinfo:0 };
  server += '\n// DTS-X environment overrides\n' + Object.entries(overrides).map(([key,value]) => `$${key} = ${typeof value === 'number' ? value : phpString(value)};`).join('\n') + '\n';
  await atomicWrite(configFile, server, { mode: 0o600 });
  // These config assignments do not require ADV2 module-hook rewriting. Refresh
  // the generated copy on every startup so
  // the randomly assigned internal callback port cannot remain from last run.
  const compiledConfig = path.join(config.engineRoot, 'gamedata/run/core/sys/config/server.config.adv.php');
  if (await exists(compiledConfig)) await atomicWrite(compiledConfig, server, { mode:0o600 });
  const secretFile = path.join(config.stateRoot, 'internal-secret');
  if (!await exists(secretFile)) await fs.writeFile(secretFile, randomBytes(32).toString('hex'), { mode:0o600 });
  await atomicWrite(stateFile, JSON.stringify(next, null, 2));
  return { changed:operations.length, installed: await exists(path.join(config.engineRoot, 'gamedata/install.lock')) };
}
