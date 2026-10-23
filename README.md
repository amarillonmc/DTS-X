# DTS-X

`XX` 分支将 `dts/Unstable` 完整移植为原生 Node.js：游戏规则、账号、HTTP、调度、模板和录像均执行 JavaScript。保留 779 个模块（默认启用 770 个）、全部原资源、经典界面及可切换的电波终端界面。来源提交为 `ba8f607a57d5352327113f41b32676d16fe7c3ba`。

生产运行不依赖 PHP、PHP WebAssembly 或解释器。`engine/` 保留 3,578 个原文件作为资源及行为对照；`native/` 是实际运行实现。开发期静态转换器和 PHP 差分测试不参与生产请求。

## 本地部署

准备 Node.js ≥24.18.0、MariaDB/MySQL，以及一个专用空数据库：

```sh
npm ci --omit=dev
node scripts/configure.mjs --url=http://localhost:3000
# 私下编辑 .env，填入专用数据库连接，保管随机站长密码
npm run setup
npm run compile
npm run doctor
npm start
```

访问 `.env` 中的 `PUBLIC_URL`。默认私有状态位于 `var/native`，可用 `NATIVE_DATA_DIR` 指定；不要放在源文件或公开资源目录。重复启动会验证数据库与目录所有权并保留数据。安装器拒绝非空未知库，不会清空或自动认领旧服。

Compose 配置也已指向原生入口；本轮没有 Docker 环境，尚未实际验证容器部署。详细的反向代理、私有远端授权、备份恢复和旧服切换约束见 [部署说明](doc/DEPLOYMENT.md)。不要直接用正式旧服数据库试安装。

## 开发与验证

修改规则直接编辑原生 JavaScript；依赖顺序、参数引用、随机分支和原数值语义必须保留。停服后 `npm run compile` 校验模块及模板，管理页候选可用 `npm run compile -- --staged` 应用。图片、地图和原交互脚本仍位于原资源路径。

```sh
npm ci
npm test
npm run verify:source
npm run verify:native
npm run native:status
```

已覆盖原 PHP 差分、真实隔离数据库、19 种模式、账号和房间、整局持久化与结局、真实 Edge 经典/现代操作及录像播放、远端接口、维护、空库安装和重启。测试需要专用测试数据库；缺少对照环境时的 skip 不算验收。没有穷举全部技能组合和随机种子，具体范围及原有缺陷见 [原生移植记录](doc/NATIVE-MIGRATION.md)。

- [开发说明](doc/DEVELOPMENT.md)：修改路径、模块 API、静态产物与测试方法。
- [架构说明](doc/ARCHITECTURE.md)：请求、模块、存储、调度和录像。
- [移植审计](docs/PORTING-AUDIT.md)：来源与明确行为差异。
- [开发约定](AGENTS.md)：数据保护和后续验证要求。

`runtime/` 只保留为旧兼容层的开发回归材料；默认部署不加载它。旧版验证记录保留其历史范围，不替代本轮原生验证。
