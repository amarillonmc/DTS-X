import PHP from 'php-parser';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PageEmitter } from './page-emitter.mjs';

const project = fileURLToPath(new URL('../../', import.meta.url));
const parser = new PHP({ parser: { version: '7.4' }, ast: { withPositions: true } });
export async function buildPages() {
  const files = ['roomcmd', 'winner', 'help', 'logistics', 'aranking'].map(name => `include/pages/command_${name}.php`)
    .concat(['index', 'replay', 'replay_receive', 'aranking_receive', 'updatelist', 'error', 'gencode_transformer', 'map', 'cardbook', 'kuji', 'kujilist', 'showcase', 'itemhelp', 'donate', 'instance8_testing_intro', 'instance10_intro', 'instance12_intro'].map(name => name + '.php'));
  const target = path.join(project, 'native/generated/pages'); await mkdir(target, { recursive: true });
  const outputs = [], failures = [];
  for (const source of files) {
    try {
      const text = await readFile(path.join(project, 'engine', source), 'utf8'), emitter = new PageEmitter(source);
      const code = emitter.emit(parser.parseCode(text, source)); const name = path.basename(source, '.php');
      await writeFile(path.join(target, name + '.mjs'), code);
      outputs.push({ name, source, sourceHash: createHash('sha256').update(text).digest('hex'), generatedHash: createHash('sha256').update(code).digest('hex'), calls: [...emitter.calls].sort() });
    } catch (error) { failures.push({ source, error: error.message }); }
  }
  await writeFile(path.join(target, 'catalog.mjs'), `${outputs.map((file, index) => `import p${index} from './${file.name}.mjs';`).join('\n')}\nexport const pages = {${outputs.map((file, index) => `${JSON.stringify(file.name)}: p${index}`).join(',')}};\n`);
  await writeFile(path.join(target, 'manifest.json'), JSON.stringify({ outputs, failures }, null, 2) + '\n');
  return { pages: outputs.length, failures, calls: [...new Set(outputs.flatMap(output => output.calls))].sort() };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(await buildPages(), null, 2));
