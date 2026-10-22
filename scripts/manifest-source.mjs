import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { projectRoot } from '../runtime/config.mjs';
const source = path.join(projectRoot, 'engine');
const files = [];
async function walk(dir, prefix = '') {
  for (const entry of (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const name = prefix + entry.name;
    if (entry.isDirectory()) await walk(path.join(dir, entry.name), name + '/');
    else { const content = await fs.readFile(path.join(dir, entry.name)); files.push({ path: name, bytes: content.length, sha256: createHash('sha256').update(content).digest('hex') }); }
  }
}
await walk(source);
await fs.mkdir(path.join(projectRoot, 'upstream'), { recursive: true });
await fs.writeFile(path.join(projectRoot, 'upstream/manifest.json'), JSON.stringify({ repository: 'dts', branch: 'Unstable', commit: 'ba8f607a57d5352327113f41b32676d16fe7c3ba', files }, null, 2) + '\n');
console.log(`Recorded ${files.length} original files`);
