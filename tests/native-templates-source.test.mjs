import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { templateSource } from '../native/templates/source.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const phpSource = String.raw`<?php
define('IN_GAME',true);
$input=json_decode(stream_get_contents(STDIN),true);
function language($file,$id,$dir){return $GLOBALS['input']['language'];}
function gexit($message){throw new Exception($message);}
require $input['compiler'];
$out=[];
foreach($input['files'] as $file){parse_template($file,$input['compiled'],1,'',1);$out[]=base64_encode(file_get_contents($input['compiled']));}
echo json_encode(['language'=>$language,'compiled'=>$out],JSON_UNESCAPED_UNICODE);
`;
test('native template source transformation matches all 882 upstream files byte for byte', { timeout: 60000 }, async t => {
  const php = process.env.DTS_REFERENCE_PHP || 'php';
  const version = spawnSync(php, ['-r', 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  if (version.error?.code === 'ENOENT' || version.stdout !== '7.4') { t.skip('Requires development-only PHP 7.4 oracle'); return; }
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'native-templates-source-'));
  t.after(async () => { assert.ok(path.resolve(root).startsWith(path.resolve(parent) + path.sep)); await rm(root, { recursive: true, force: true }); });
  const manifest = JSON.parse(await readFile(path.join(project, 'upstream/manifest.json'), 'utf8'));
  const files = manifest.files.filter(file => /\.(htm|html)$/i.test(file.path)); assert.equal(files.length, 882);
  const input = { compiler: path.join(project, 'engine/include/template.func.php'), language: path.join(project, 'engine/templates/default/templates.lang.php'), compiled: path.join(root, 'compiled.php'), files: files.map(file => path.join(project, 'engine', file.path)) };
  const oracle = path.join(root, 'oracle.php'); await writeFile(oracle, phpSource);
  const result = spawnSync(php, ['-d', 'display_errors=stderr', oracle], { input: JSON.stringify(input), encoding: 'utf8', windowsHide: true, timeout: 45000, maxBuffer: 24 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr);
  const expected = JSON.parse(result.stdout);
  const differences = [];
  for (const [i, file] of files.entries()) {
    const actual = templateSource(await readFile(path.join(project, 'engine', file.path), 'utf8'), { language: expected.language });
    const wanted = Buffer.from(expected.compiled[i], 'base64').toString('utf8');
    if (actual !== wanted) {
      let position = 0; while (actual[position] === wanted[position] && position < Math.min(actual.length, wanted.length)) position++;
      differences.push({ file: file.path, position, actual: actual.slice(Math.max(0, position - 50), position + 100), expected: wanted.slice(Math.max(0, position - 50), position + 100) });
    }
  }
  assert.deepEqual(differences, []);
});
