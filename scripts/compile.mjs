import { readConfig } from '../runtime/config.mjs';
import { prepareEngine } from '../runtime/prepare.mjs';
import { compileEngine } from '../runtime/lifecycle.mjs';
import { acquireStateLock } from '../runtime/state-lock.mjs';
const config = readConfig();
const options = process.argv.slice(2);
if (options.some(option => option !== '--staged')) throw new Error('Usage: npm run compile -- [--staged]');
const release = acquireStateLock(config);
try {
  await prepareEngine(config);
  await compileEngine(config, { staged:options.includes('--staged') });
  console.log('Modules and template compression compiled successfully.');
} finally { release(); }
