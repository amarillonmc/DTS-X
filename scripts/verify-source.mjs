import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { projectRoot } from '../native/config.mjs';
const manifest = JSON.parse(await fs.readFile(path.join(projectRoot, 'upstream/manifest.json'), 'utf8'));
const changes = [];
for (const file of manifest.files) {
  try { if (createHash('sha256').update(await fs.readFile(path.join(projectRoot, 'engine', file.path))).digest('hex') !== file.sha256) changes.push(file.path); }
  catch { changes.push(`${file.path} (missing)`); }
}
console.log(`Upstream ${manifest.branch} ${manifest.commit}: ${manifest.files.length} files, ${changes.length} changed/missing`);
if (changes.length) { console.log(changes.join('\n')); process.exitCode = 1; }
