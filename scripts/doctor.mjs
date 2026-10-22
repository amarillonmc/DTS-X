import fs from 'node:fs/promises';
import path from 'node:path';
import { readConfig } from '../runtime/config.mjs';
import { createPhpRuntime } from '../runtime/php-runtime.mjs';
import { runtimeOptions } from '../runtime/lifecycle.mjs';
const config = readConfig();
await fs.access(config.engineRoot);
const runtime = await createPhpRuntime(runtimeOptions(config));
try {
  const response = await runtime.run({ scriptPath:'/runtime/doctor.php', server:{ DTS_INTERNAL:'1' } });
  console.log(response.text);
  if (response.exitCode || response.httpStatusCode >= 400) { console.error('Diagnostics failed. Database credentials were not printed.'); process.exitCode = 1; }
} finally { await runtime.close(); }
