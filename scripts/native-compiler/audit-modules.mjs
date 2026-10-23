import PHP from 'php-parser';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('../../', import.meta.url));
export async function auditModules({ skillsOnly = true } = {}) {
  const inventory = JSON.parse(await readFile(path.join(project, 'native/inventory.json'), 'utf8'));
  const parser = new PHP({ parser: { version: '7.4' }, ast: { withPositions: true } });
  const kinds = new Map(), operators = new Map(), calls = new Map(), errors = [], samples = {}, modules = [];
  for (const module of inventory.modules.filter(module => skillsOnly ? /^skill\d+$/.test(module.name) : module.name !== 'user_settings')) {
    const files = [];
    for (const file of module.code) {
      const source = await readFile(path.join(project, 'engine', file.source), 'utf8');
      let ast;
      try { ast = parser.parseCode(source, file.source); }
      catch (error) { errors.push({ module: module.name, source: file.source, message: error.message }); continue; }
      let functions = 0;
      function visit(value) {
        if (!value || typeof value !== 'object') return;
        if (value.kind) { kinds.set(value.kind, (kinds.get(value.kind) ?? 0) + 1); samples[value.kind] ??= value; }
        if (value.kind === 'function') functions++;
        if (value.kind === 'bin' || value.kind === 'assign') operators.set(value.type ?? value.operator, (operators.get(value.type ?? value.operator) ?? 0) + 1);
        if (value.kind === 'call') calls.set(value.what.name ?? value.what.kind, (calls.get(value.what.name ?? value.what.kind) ?? 0) + 1);
        for (const [key, child] of Object.entries(value)) if (key !== 'loc') visit(child);
      }
      visit(ast); files.push({ source: file.source, functions });
    }
    modules.push({ name: module.name, files });
  }
  return { modules, kinds: Object.fromEntries(kinds), operators: Object.fromEntries(operators), calls: Object.fromEntries(calls), errors, samples };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await auditModules({ skillsOnly: !process.argv.includes('--all') });
  await mkdir(path.join(project, 'var/tests'), { recursive: true });
  await writeFile(path.join(project, 'var/tests/module-ast-audit.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ modules: report.modules.length, functions: report.modules.reduce((sum, module) => sum + module.files.reduce((count, file) => count + file.functions, 0), 0), kinds: report.kinds, operators: report.operators, errors: report.errors }, null, 2));
}
