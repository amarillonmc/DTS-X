import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { projectRoot } from '../runtime/config.mjs';

// Use an explicit source allowlist: never package .env, a running game, database
// files, node_modules, browser profiles or the neighbouring source repositories.
const sources = [
  'README.md', 'AGENTS.md', '.env.example', '.gitignore', '.dockerignore',
  'Dockerfile', 'compose.yaml', 'package.json', 'package-lock.json', 'server.mjs',
  'engine', 'runtime', 'public', 'scripts', 'tests', 'upstream', 'doc', 'docs',
];
const excluded = [
  'public/modern/test-output', 'public/modern/test-tools', 'runtime/probe',
  'engine/include/modules/core/sys/config/server.config.php',
  'engine/include/modules/core/sys/config/system.config.php',
  'engine/include/modules/core/sys/config/game.config.php',
  'engine/include/modulemng/modulemng.config.php',
  ...['cache', 'modinit', 'run', 'tmp', 'templates', 'javascript', 'replays', 'remote_replays', 'bak'].map(name => 'engine/gamedata/' + name),
  'engine/gamedata/*.lock', 'engine/gamedata/modules.list.temp.php', 'engine/gamedata/modules.list.pass.php',
  'engine/gamedata/compiled-templates.json',
];
const output = path.join(projectRoot, 'artifacts', 'dts-x-node.tar.gz');
await fs.mkdir(path.dirname(output), { recursive:true });
const manifest = JSON.parse(await fs.readFile(path.join(projectRoot, 'upstream/manifest.json'), 'utf8'));
const upstreamFiles = new Set(manifest.files.map(file => 'engine/' + file.path));
const filters = excluded.map(pattern => new RegExp('^' + pattern.split('*').map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '(?:/|$)'));
const files = [];
async function collect(relative) {
  if (relative === 'public/modern/test-output' || relative === 'public/modern/test-tools' || relative === 'runtime/probe') return;
  const stat = await fs.lstat(path.join(projectRoot, relative));
  if (stat.isSymbolicLink()) throw new Error('Bundle source cannot be a symlink: ' + relative);
  if (stat.isDirectory()) {
    for (const name of (await fs.readdir(path.join(projectRoot, relative))).sort()) await collect(relative + '/' + name);
  } else if (stat.isFile()) {
    // Original placeholder .gitignore files in generated directories are part
    // of the immutable source snapshot and must remain in a complete bundle.
    if (!upstreamFiles.has(relative) && filters.some(pattern => pattern.test(relative))) return;
    if (/[\r\n]/.test(relative)) throw new Error('Unsupported source filename');
    files.push(relative);
  }
}
for (const source of sources) await collect(source);
const listFile = path.join(projectRoot, 'artifacts', 'bundle-files.txt');
await fs.writeFile(listFile, files.join('\n') + '\n');
// Windows tar's -T decoding depends on the system codepage; staging preserves
// the original Chinese filenames independently of that codepage.
const staging = await fs.mkdtemp(path.join(projectRoot, 'artifacts', 'bundle-'));
let result;
try {
  for (let i = 0; i < files.length; i += 24) {
    await Promise.all(files.slice(i, i + 24).map(async file => {
      const target = path.join(staging, file);
      await fs.mkdir(path.dirname(target), { recursive:true });
      await fs.copyFile(path.join(projectRoot, file), target);
    }));
  }
  result = spawnSync('tar', ['-czf', output, ...sources], { cwd:staging, encoding:'utf8', windowsHide:true });
} finally {
  if (path.dirname(staging) !== path.join(projectRoot, 'artifacts')) throw new Error('Unexpected staging directory');
  await fs.rm(staging, { recursive:true, force:true });
}
if (result.error || result.status !== 0) throw new Error('Creating the bundle requires tar (available on current Windows and most Linux systems): ' + (result.error?.message || result.stderr));
console.log(`Deployment source bundle: ${output} (${(await fs.stat(output)).size} bytes). Credentials and saved games are excluded.`);
