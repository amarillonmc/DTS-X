import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { moduleBuiltins } from '../../native/generated/builtins.mjs';
import { contextGlobalFunctions } from '../../native/generated/context.mjs';

const project = fileURLToPath(new URL('../../', import.meta.url));
/** Call with the actual initialized request's functions. This audits literal
 * bindings without invoking them or treating successful code generation as
 * behavioral evidence. Dynamic sites are reported separately for review. */
export async function auditGeneratedGlobals({ functions = {}, enabledModules = null } = {}) {
  const supplied = new Set(Object.entries(functions).filter(([, value]) => typeof value === 'function').map(([name]) => name));
  const builtin = new Set(Object.keys(moduleBuiltins())), context = new Set(contextGlobalFunctions), files = [];
  for (const prefix of ['', 'remaining/', 'pages/', 'resources/']) {
    const manifest = JSON.parse(await readFile(path.join(project, 'native/generated', prefix, 'manifest.json'), 'utf8'));
    for (const row of manifest.outputs) {
      if (row.module && enabledModules && !enabledModules.includes(row.module)) continue;
      files.push({ path: path.posix.join('native/generated', prefix, row.output ?? `${row.name}.mjs`), source: row.source ?? row.sources?.[0]?.source });
    }
  }
  const calls = new Map(), dynamic = [], locals = new Set();
  for (const file of files) {
    const code = await readFile(path.join(project, file.path), 'utf8');
    for (const match of code.matchAll(/r\.defineLocal\("([a-zA-Z_0-9]+)"/g)) locals.add(match[1]);
    for (const match of code.matchAll(/r\.call\("([a-zA-Z_0-9]+)"/g)) { const sites = calls.get(match[1]) ?? []; sites.push({ file: file.path, line: code.slice(0, match.index).split('\n').length, source: file.source }); calls.set(match[1], sites); }
    for (const match of code.matchAll(/r\.namedCall\(([^\n]+)|r\.call\("preg_replace_callback",([^\n]+)/g)) dynamic.push({ file: file.path, line: code.slice(0, match.index).split('\n').length, expression: (match[1] ?? match[2]).slice(0, 300), source: file.source });
  }
  const entries = [...calls].sort(([a], [b]) => a.localeCompare(b)).map(([name, sites]) => ({ name, provider: builtin.has(name) ? 'builtin' : context.has(name) ? 'context' : supplied.has(name) ? 'host' : locals.has(name) ? 'page-resource' : null, count: sites.length, sites }));
  return { files: files.length, totalCalls: entries.reduce((sum, entry) => sum + entry.count, 0), names: entries.length, unresolved: entries.filter(entry => !entry.provider), dynamic, entries };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) { const report = await auditGeneratedGlobals(); console.log(JSON.stringify({ ...report, entries: undefined }, null, 2)); }
