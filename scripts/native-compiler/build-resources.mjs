import PHP from 'php-parser';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PageEmitter } from './page-emitter.mjs';
import { resourceSources } from './resource-list.mjs';

const project = fileURLToPath(new URL('../../', import.meta.url));
const parser = new PHP({ parser: { version: '7.4' }, ast: { withPositions: true } });
export async function buildResources() {
  const target = path.join(project, 'native/generated/resources'); await mkdir(target, { recursive: true });
  const outputs = [], failures = [];
  for (const source of resourceSources) {
    try {
      const text = await readFile(path.join(project, 'engine', source), 'utf8'), emitter = new PageEmitter(source);
      const code = emitter.emit(parser.parseCode(text, source)), name = `resource${outputs.length}.mjs`;
      await writeFile(path.join(target, name), code);
      outputs.push({ source, output: name, sourceHash: createHash('sha256').update(text).digest('hex'), generatedHash: createHash('sha256').update(code).digest('hex'), calls: [...emitter.calls].sort() });
    } catch (error) { failures.push({ source, error: error.message }); }
  }
  await writeFile(path.join(target, 'catalog.mjs'), `${outputs.map((row, i) => `import r${i} from './${row.output}';`).join('\n')}\nexport const resources = {${outputs.map((row, i) => `${JSON.stringify(row.source)}:r${i}`).join(',')}};\n`);
  await writeFile(path.join(target, 'manifest.json'), JSON.stringify({ outputs, failures }, null, 2) + '\n');
  return { resources: outputs.length, failures };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(await buildResources(), null, 2));
