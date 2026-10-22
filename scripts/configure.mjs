import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { projectRoot } from '../runtime/config.mjs';
const url = process.argv.find(arg => arg.startsWith('--url='))?.slice(6) || 'http://localhost:3000';
const origin = new URL(url);
if (!['http:', 'https:'].includes(origin.protocol) || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw new Error('Use --url=https://your-domain.example (no subdirectory, credentials, query, or fragment)');
const secret = () => randomBytes(24).toString('hex');
// Original password forms and pass_check() accept at most 24 characters.
const adminSecret = randomBytes(12).toString('hex');
await fs.writeFile(path.join(projectRoot, '.env'), `# Generated locally. Keep this file with your private backups.\nPUBLIC_URL=${origin.origin}\nPORT=3000\nHOST=127.0.0.1\nDB_HOST=127.0.0.1\nDB_PORT=3306\nDB_NAME=dtsx\nDB_USER=dtsx\nDB_PASSWORD=${secret()}\nDB_ROOT_PASSWORD=${secret()}\nTABLE_PREFIX=dtsx_\nADMIN_USER=admin\nADMIN_PASSWORD=${adminSecret}\nPHP_WORKERS=2\nPHP_INTERNAL_WORKERS=4\nTRUST_PROXY=0\nAUTO_SETUP=1\n`, { flag:'wx', mode:0o600 });
console.log('Created .env with random database and administrator passwords. Existing .env files are never overwritten.');
