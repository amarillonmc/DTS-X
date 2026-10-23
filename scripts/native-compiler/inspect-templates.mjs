import PHP from 'php-parser';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { templateSource } from '../../native/templates/source.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const parser = new PHP({ parser: { version: '7.4' }, ast: { withPositions: true } });
const manifest = JSON.parse(await readFile(path.join(root, 'upstream/manifest.json'), 'utf8'));
const kinds = new Map(), samples = {}, errors = [], operators = new Map();
for (const file of manifest.files.filter(file => /\.(htm|html)$/i.test(file.path))) {
  const source = templateSource(await readFile(path.join(root, 'engine', file.path), 'utf8'));
  let ast;
  try { ast = parser.parseCode(source, file.path); }
  catch (error) { errors.push({ file: file.path, message: error.message, line: error.lineNumber, source: source.split('\n').slice(error.lineNumber - 2, error.lineNumber + 1).join('\n') }); continue; }
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    if (value.kind) { kinds.set(value.kind, (kinds.get(value.kind) ?? 0) + 1); samples[value.kind] ??= value; }
    if (value.kind === 'bin' || value.kind === 'assign') operators.set(value.type ?? value.operator, (operators.get(value.type ?? value.operator) ?? 0) + 1);
    for (const [key, child] of Object.entries(value)) if (key !== 'loc') visit(child);
  }
  visit(ast);
}
await mkdir(path.join(root, 'var/tests'), { recursive: true });
await writeFile(path.join(root, 'var/tests/template-ast-samples.json'), JSON.stringify(samples, null, 2));
console.log(JSON.stringify({ kinds: Object.fromEntries(kinds), operators: Object.fromEntries(operators), errors }, null, 2));
