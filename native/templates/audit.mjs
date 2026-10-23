import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('../../', import.meta.url));
export async function auditTemplates() {
  const manifest = JSON.parse(await readFile(path.join(project, 'upstream/manifest.json'), 'utf8'));
  const files = [], directives = new Map(), calls = new Map(), code = [];
  for (const item of manifest.files.filter(item => /\.(htm|html)$/i.test(item.path))) {
    const source = await readFile(path.join(project, 'engine', item.path), 'utf8');
    const embedded = [];
    for (const match of source.matchAll(/(?:<!--)?\{(eval|echo|if|elseif|loop|template|template_fixed|lang)\s+([\s\S]*?)\}(?:-->)?/g)) {
      directives.set(match[1], (directives.get(match[1]) ?? 0) + 1);
      if (['eval', 'echo', 'if', 'elseif', 'loop'].includes(match[1])) {
        embedded.push({ directive: match[1], code: match[2], line: source.slice(0, match.index).split('\n').length });
        for (const call of match[2].matchAll(/(?:^|[^\w$])([\\\w]+)\s*\(/g)) calls.set(call[1], (calls.get(call[1]) ?? 0) + 1);
      }
    }
    code.push(...embedded.map(block => ({ file: item.path, ...block })));
    files.push({ path: item.path, sha256: item.sha256, bytes: item.bytes, embeddedBlocks: embedded.length });
  }
  return { fileCount: files.length, files, directiveCounts: Object.fromEntries([...directives].sort()), calls: Object.fromEntries([...calls].sort((a, b) => b[1] - a[1])), blocks: code };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const audit = await auditTemplates();
  console.log(JSON.stringify({ fileCount: audit.fileCount, withLogic: audit.files.filter(file => file.embeddedBlocks).length, directives: audit.directiveCounts, calls: audit.calls }, null, 2));
}
