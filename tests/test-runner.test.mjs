import assert from 'node:assert/strict';
import test from 'node:test';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('../', import.meta.url));
const run = args => new Promise((resolve, reject) => {
  // Simulate a fresh CLI invocation, not node:test recursively scheduling its
  // parent's files. The explicit fixture file list prevents suite recursion.
  const env = { ...process.env }; delete env.NODE_TEST_CONTEXT;
  const child = spawn(process.execPath, ['scripts/run-tests.mjs', ...args], { cwd: project, windowsHide: true, env });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; }); child.stderr.on('data', chunk => { output += chunk; });
  child.once('error', reject); child.once('exit', code => resolve({ code, output }));
});

test('npm test wrapper enforces serial file execution, selection and failure status', async t => {
  const parent = path.join(project, 'var/tests'); await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'test-runner-'));
  t.after(async () => { assert.equal(path.dirname(root), parent); await rm(root, { recursive: true, force: true }); });
  const files = ['a', 'b'].map(name => path.join(root, name + '.test.mjs'));
  for (const [index, file] of files.entries()) await writeFile(file,
    `import test from 'node:test'; test('probe-${index}', async t => { t.diagnostic('start-${index}=' + Date.now()); await new Promise(resolve => setTimeout(resolve, 150)); t.diagnostic('end-${index}=' + Date.now()); });`);
  const serial = await run(['--test-concurrency=1', '--', ...files]);
  assert.equal(serial.code, 0, serial.output);
  const timestamp = name => Number(serial.output.match(new RegExp(name + '=(\\d+)'))?.[1]);
  assert.ok(timestamp('start-1') >= timestamp('end-0'), serial.output);
  const selected = await run(['--test-name-pattern=probe-1', '--', ...files]);
  assert.equal(selected.code, 0, selected.output); assert.doesNotMatch(selected.output, /start-0=/); assert.match(selected.output, /start-1=/);
  const failure = path.join(root, 'failure.test.mjs');
  await writeFile(failure, "import test from 'node:test'; test('expected probe failure', () => { throw new Error('intentional failure probe'); });");
  const failed = await run(['--', failure]); assert.notEqual(failed.code, 0); assert.match(failed.output, /intentional failure probe/);
});
