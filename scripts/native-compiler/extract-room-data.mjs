// Development-only snapshot extraction from the unchanged trusted source.
// Production imports the resulting JSON and never needs the oracle executable.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const source = 'engine/include/roommng/roommng.config.php';
const root = fileURLToPath(new URL('../../', import.meta.url));
const php = String.raw`require $argv[1];echo json_encode(compact('max_room_num','max_private_room_num','room_poll_port_low','room_poll_port_high','soleroom_resettime','soleroom_private_resettime','roomtypelist'),JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);`;
const result = spawnSync(process.env.DTS_REFERENCE_PHP || 'php', ['-r', php, source], { cwd: root, encoding: 'utf8', windowsHide: true });
if (result.status !== 0) throw new Error('Development room config extraction failed');
const snapshot = { source, sha256: createHash('sha256').update(await readFile(new URL('../../' + source, import.meta.url))).digest('hex'), values: JSON.parse(result.stdout) };
await writeFile(new URL('../../native/system/room-config.json', import.meta.url), JSON.stringify(snapshot, null, 2) + '\n');
