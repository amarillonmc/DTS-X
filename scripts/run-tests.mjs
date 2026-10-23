// Node stops parsing runner options after the first test-file argument. npm
// appends user options to its script, so place them before the file selection.
import { spawn } from 'node:child_process';
import { constants } from 'node:os';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const nativeOnly = args[0] === '--native';
if (nativeOnly) args.shift();
const separator = args.indexOf('--');
const files = separator < 0 ? [nativeOnly ? 'tests/native-*.test.mjs' : 'tests/*.test.mjs'] : args.splice(separator + 1);
if (separator >= 0) args.pop();
if (!files.length) throw new Error('Specify test files after --');
const child = spawn(process.execPath, ['--test', ...args, ...files], {
  cwd: fileURLToPath(new URL('../', import.meta.url)), stdio: 'inherit', windowsHide: true,
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.once('error', error => { console.error('Cannot start test runner:', error.message); process.exitCode = 1; });
child.once('exit', (code, signal) => { process.exitCode = code ?? 128 + (constants.signals[signal] ?? 1); });
