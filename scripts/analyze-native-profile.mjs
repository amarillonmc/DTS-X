// Read a Node/V8 CPU profile; no application, database or credentials are loaded.
// CPU sample times are diagnostics, not HTTP latency or awaited I/O duration.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const file = process.argv[2];
if (!file || process.argv.length > 3) throw new Error('Usage: node scripts/analyze-native-profile.mjs var/tests/performance-name.cpuprofile');
const profile = JSON.parse(await readFile(file, 'utf8'));
if (!Array.isArray(profile.nodes) || !Array.isArray(profile.samples) || !Array.isArray(profile.timeDeltas)) throw new Error('Expected a V8 CPU profile with samples');
const root = path.resolve(import.meta.dirname, '..');
const nodes = new Map(profile.nodes.map(node => [node.id, node])), parents = new Map();
for (const node of profile.nodes) for (const child of node.children ?? []) parents.set(child, node.id);
const label = node => {
  const frame = node.callFrame; let url = frame.url;
  if (url.startsWith('file:')) url = path.relative(root, fileURLToPath(url)).replaceAll('\\', '/');
  return `${frame.functionName || '(anonymous)'} ${url}:${frame.lineNumber + 1}`;
};
const add = (map, key, ms) => map.set(key, (map.get(key) ?? 0) + ms);
const self = new Map(), inclusive = new Map(), modules = new Map();
let sampledMs = 0, idleMs = 0, gcMs = 0;
for (let index = 0; index < profile.samples.length; index++) {
  const id = profile.samples[index], node = nodes.get(id), ms = (profile.timeDeltas[index] ?? 0) / 1000;
  if (!node) throw new Error('Profile sample references an absent stack node');
  sampledMs += ms;
  if (node.callFrame.functionName === '(idle)') idleMs += ms;
  if (node.callFrame.functionName === '(garbage collector)') gcMs += ms;
  add(self, label(node), ms);
  // Deduplicate recursive frames: inclusive time is presence on a synchronous
  // sampled stack. Async ancestors and time spent awaiting I/O are not implied.
  const seen = new Set();
  for (let at = id; at !== undefined; at = parents.get(at)) {
    const current = nodes.get(at), name = label(current);
    if (!seen.has(name)) { add(inclusive, name, ms); seen.add(name); }
  }
  let module;
  for (let at = id; at !== undefined; at = parents.get(at)) {
    const frame = nodes.get(at).callFrame;
    if (/\/native\/(?:generated\/(?:remaining\/)?modules|gameplay)\//.test(frame.url)) { module = label(nodes.get(at)); break; }
  }
  if (module) add(modules, module, ms);
}
const top = (map, count = 35) => [...map].sort((a, b) => b[1] - a[1]).slice(0, count).map(([name, ms]) => ({ name, ms: Number(ms.toFixed(3)), samplePercent: Number((ms / sampledMs * 100).toFixed(2)) }));
console.log(JSON.stringify({ file: path.resolve(file), sampledMs, idleMs, gcMs, topSelf: top(self), topInclusive: top(inclusive), nearestGameplayFrame: top(modules) }, null, 2));
