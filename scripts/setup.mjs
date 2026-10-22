import { readConfig } from '../runtime/config.mjs';
import { prepareEngine } from '../runtime/prepare.mjs';
import { installEngine, compileEngine, needsCompile } from '../runtime/lifecycle.mjs';
import { acquireStateLock } from '../runtime/state-lock.mjs';
const config = readConfig();
const release = acquireStateLock(config);
try {
  await prepareEngine(config);
  await installEngine(config);
  if (await needsCompile(config)) await compileEngine(config);
  console.log('DTS-X installed. Start with npm start. Administrator credentials are in .env.');
} finally { release(); }
