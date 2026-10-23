import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const inventory = JSON.parse(await readFile(new URL('../native/inventory.json', import.meta.url), 'utf8'));
const statusBytes = await readFile(new URL('../native/migration-status.json', import.meta.url));
if (createHash('sha256').update(statusBytes).digest('hex') !== inventory.migration.statusSha256) {
  throw new Error('Native inventory is stale; run npm run native:inventory before reporting progress.');
}
const status = JSON.parse(statusBytes.toString('utf8'));
const counts = inventory.migration.counts;
console.log(`原生 Node.js 移植：${status.phase}`);
console.log(`原版模块 ${inventory.totals.modules} 个（启用 ${inventory.totals.enabledModules} 个）；已登记代码移植 ${counts.code_ported}，部分移植 ${counts.partial}，未移植 ${counts.not_ported}。`);
console.log('代码移植数不代表穷举全部玩法；这里报告已登记的验收结果，不重新执行测试。');
console.log(`完整原生服就绪：${inventory.migration.nativeGameReady ? '是' : '否'}；默认入口：${status.acceptance?.defaultEntry==='native'?'原生 Node.js':'旧兼容版'}。`);
for (const remaining of status.remainingSubsystems) console.log(`待完成：${remaining}`);
if (process.argv.includes('--require-ready') && !inventory.migration.nativeGameReady) process.exitCode = 1;
