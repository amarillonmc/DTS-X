import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createPhpRuntime } from './php-runtime.mjs';

export const runtimeOptions = config => ({
  engineRoot:config.engineRoot, runtimeRoot:config.runtimeRoot, stateRoot:path.join(config.stateRoot, 'php'),
  phpIni:{ post_max_size:`${Math.ceil(config.maxBody / 1024 / 1024)}M`, upload_max_filesize:`${Math.ceil(config.maxBody / 1024 / 1024)}M` },
});
export async function isInstalled(config) {
  try { await fs.access(path.join(config.engineRoot, 'gamedata/install.lock')); return true; } catch { return false; }
}
export async function sourceFingerprint(config) {
  const source = JSON.parse(await fs.readFile(path.join(config.stateRoot, 'source-state.json'), 'utf8'));
  const hash = createHash('sha256');
  // HTTP wrappers, pictures and other static files are not compiler inputs.
  // Include compiler implementation changes as well as module/template changes.
  for (const file of Object.keys(source).sort()) {
    if (/^include\/modules\/.*\.(?:php|htm)$/.test(file) || /^include\/modulemng\/.*\.php$/.test(file) ||
        file === 'gamedata/modules.list.php' || /^templates\/.*\.htm$/.test(file)) {
      hash.update(file).update('\0').update(source[file]).update('\0');
    }
  }
  // Local configuration is not part of the committed snapshot. Compile after
  // settings change, but the randomly assigned internal HTTP port is refreshed
  // directly in server.config.adv.php on each start and must not trigger a build.
  const localConfigs = new Set(Object.keys(source).filter(file => /\.config\.php$/.test(file)));
  for (const file of [
    'include/modules/core/sys/config/server.config.php',
    'include/modules/core/sys/config/system.config.php',
    'include/modules/core/sys/config/game.config.php',
    'include/modulemng/modulemng.config.php',
    'gamedata/modules.list.php',
  ]) localConfigs.add(file);
  for (const file of [...localConfigs].sort()) {
    let contents = await fs.readFile(path.join(config.engineRoot, file), 'utf8');
    if (file.endsWith('/server.config.php')) contents = contents.replace(/\$server_address\s*=\s*'(?:\\.|[^'\\])*';/g, '$server_address = <internal-url>;');
    hash.update(file).update('\0').update(contents).update('\0');
  }
  return hash.digest('hex');
}
export async function needsCompile(config) {
  try {
    if ((await fs.readFile(path.join(config.stateRoot,'compiled-source'), 'utf8')) !== await sourceFingerprint(config)) return true;
    await verifyCompiledTemplates(config);
    return false;
  } catch { return true; }
}
export async function verifyCompiledTemplates(config) {
  const file = path.join(config.engineRoot, 'gamedata/compiled-templates.json');
  let manifest;
  try { manifest = JSON.parse(await fs.readFile(file, 'utf8')); }
  catch (cause) { throw new Error('Compiled template manifest is missing or invalid; compilation cannot be accepted.', { cause }); }
  if (manifest?.version !== 1 || !Array.isArray(manifest.templates) || !manifest.templates.length || manifest.templates.length > 100000) throw new Error('Invalid compiled template manifest');
  const missing = [];
  for (const virtualPath of manifest.templates) {
    if (typeof virtualPath !== 'string' || virtualPath.includes('\\') || !virtualPath.startsWith('/game/')) throw new Error('Invalid path in compiled template manifest');
    const normalized = path.posix.normalize(virtualPath);
    if (!normalized.startsWith('/game/gamedata/templates/') || !normalized.endsWith('.tpl.php')) throw new Error('Compiled template manifest path escapes its cache directory');
    const relative = normalized.slice('/game/'.length);
    try {
      const stat = await fs.lstat(path.join(config.engineRoot, relative));
      if (!stat.isFile() || stat.size === 0) missing.push(relative);
    } catch (error) { if (error.code === 'ENOENT') missing.push(relative); else throw error; }
  }
  if (missing.length) throw new Error(`Compiled template files are missing or empty on the host (${missing.length}/${manifest.templates.length}): ${missing.slice(0,6).join(', ')}`);
  return manifest.templates.length;
}
export async function compileEngine(config, { staged = false } = {}) {
  console.log('Validating and compiling the original module chain (ADV1/2/3)…');
  // A failed compiler can leave partially rewritten caches. Never let a stamp
  // from an earlier successful build authorize those files on the next start.
  await fs.rm(path.join(config.stateRoot, 'compiled-source'), { force:true });
  await fs.rm(path.join(config.engineRoot, 'gamedata/compiled-templates.json'), { force:true });
  const runtime = await createPhpRuntime(runtimeOptions(config));
  try {
    for (const phase of ['validate','compile']) {
      const response = await runtime.run({ scriptPath:'/runtime/compile-engine.php', server:{ DTS_INTERNAL:'1', DTS_COMPILE_PHASE:phase, DTS_COMPILE_STAGED:staged ? '1' : '0' } });
      await fs.writeFile(path.join(config.stateRoot, `compile-${phase}.log`), response.text + '\n' + response.errors);
      if (response.exitCode !== 0 || response.httpStatusCode >= 400 || !response.text.includes(`DTS_${phase.toUpperCase()}_OK`)) throw new Error(`Module ${phase} failed; see ${path.join(config.stateRoot, `compile-${phase}.log`)}`);
    }
    const templateCount = await verifyCompiledTemplates(config);
    await fs.writeFile(path.join(config.stateRoot,'compiled-source'), await sourceFingerprint(config));
    console.log(`Verified ${templateCount} compiled template files on the host filesystem.`);
  } finally { await runtime.close(); }
}
export async function installEngine(config) {
  if (await isInstalled(config)) return;
  if (!config.dbPassword || !config.adminPassword) throw new Error('Set DB_PASSWORD and ADMIN_PASSWORD in .env before setup');
  const runtime = await createPhpRuntime(runtimeOptions(config));
  try {
    const response = await runtime.run({ scriptPath:'/runtime/install.php', server:{ DTS_INTERNAL:'1', DTS_ADMIN_USER:config.adminUser, DTS_ADMIN_PASSWORD:config.adminPassword } });
    await fs.writeFile(path.join(config.stateRoot,'install.log'), response.text + '\n' + response.errors, { mode:0o600 });
    if (response.exitCode !== 0 || response.httpStatusCode >= 400 || !(response.text.includes('DTS_INSTALL_OK') || response.text.includes('DTS_ALREADY_INSTALLED')) || !await isInstalled(config)) throw new Error(`Installation failed; see ${path.join(config.stateRoot, 'install.log')}. Existing databases are never overwritten.`);
  } finally { await runtime.close(); }
}
