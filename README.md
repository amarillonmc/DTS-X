# DTS-X

新电波版 DTS 的 Node.js 部署版本，基于 `dts/Unstable` 提交 `ba8f607a57d5352327113f41b32676d16fe7c3ba`。Node.js 内嵌 PHP WebAssembly 执行原规则，保留原资源、模块、数据库格式及经典界面，增加可切换的「电波终端」窗口界面。

**本地实现验收已完成，可作为 VPS 验证交付版。** 已通过 27 项自动测试、真实主局和房间操作、两种界面及移动端检查、756 个编译模板完整性检查和重启持久化验证。Linux/Docker 部署、多人完整开战及全部技能组合仍需在目标服继续验证；范围与实测延迟见 [验证记录](doc/VALIDATION.md)。

这不是把规则改写成 JavaScript 的版本。选择兼容运行层是为了保留动态模块链、技能数值和现有开发方式；服务器无需安装 PHP、Apache 或独立 daemon。Node.js 管理隔离执行线程、内部请求、房间等待及定时维护。

## 部署到 VPS

准备 Docker Engine + Compose，复制本仓库完整目录。在有 Node.js 的电脑上生成配置后也可以整目录上传；VPS 使用 Docker 时无需另外安装 Node.js。

```sh
node scripts/configure.mjs --url=https://dts.example.com
docker compose up -d --build
docker compose logs -f app
```

`.env` 内有随机生成的数据库和站长密码。第一次启动自动安装空数据库并编译模块；出现 `DTS-X ready` 后访问配置的域名。数据库非空而没有安装锁时会拒绝初始化，避免覆盖旧服。反向代理指向 `127.0.0.1:3000`，按部署文档配置真实 IP 转发后启用 `TRUST_PROXY=1`；需要临时通过 VPS IP 直接访问时，在 `.env` 设置正确 `PUBLIC_URL=http://IP:3000` 及 `BIND_ADDRESS=0.0.0.0`，并保持 `TRUST_PROXY=0`。

部署、备份和迁移步骤见 [doc/DEPLOYMENT.md](doc/DEPLOYMENT.md)。没有 Docker 时使用 Node.js ≥24.18、MariaDB，然后 `npm ci`、配置 `.env`、`npm run setup`、`npm start`。

## 游玩与改造

页面右上角可切换经典界面与电波终端。现代界面提供窗口移动、调整尺寸、最小化、恢复、布局保存和归位；人物、装备、背包、操作、日志、聊天、游戏状况与地图均使用原游戏数据。

- [doc/DEVELOPMENT.md](doc/DEVELOPMENT.md)：资源、技能和模块的修改路径；旧开发流程与 Node 版的对应关系。
- [doc/ARCHITECTURE.md](doc/ARCHITECTURE.md)：运行结构、daemon 替代方式、持久化与兼容补丁。
- [docs/PORTING-AUDIT.md](docs/PORTING-AUDIT.md)：原版审计与验证边界。
- [doc/VALIDATION.md](doc/VALIDATION.md)：已覆盖的测试与公测清单。
- [AGENTS.md](AGENTS.md)：后续开发约定。

```sh
npm test
npm run verify:source
npm run doctor
```

`verify:source` 对照导入时清单核验原版全部文件。主动修改 `engine/` 后会报告差异，这是维护者检查改造范围的依据。它不代表对全部玩法的端到端证明；功能验证记录与人工回归清单另见文档。
