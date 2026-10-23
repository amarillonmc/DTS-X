# 原生 Node.js 开发

`XX` 分支的游戏规则、账号、HTTP、调度和模板均由 `native/` 内的 JavaScript 执行。运行游戏不需要 PHP 或 PHP WebAssembly。原版 3,578 个文件保留在 `engine/`，用作资源和行为对照；它们不是生产逻辑的第二个执行层。

## 定位与修改

| 修改目标 | 实际路径 |
| --- | --- |
| 人物、探索、战斗、地图、物品、经验等基础规则 | `native/gameplay/` |
| NPC、队伍、商店、合成、姿态与伤害状态 | `native/gameplay/base-extra/` |
| 582 个技能 | `native/generated/modules/skill*.mjs` |
| 卡片、副本、属性、结局及其他扩展 | `native/generated/remaining/modules/` |
| 模块调用链与引用 | `native/modules/registry.mjs` |
| 模板服务和 882 个静态模板 | `native/templates/` |
| 账号、管理、消息、房间、维护、录像 | `native/accounts/`、`native/system/` |
| HTTP 控制器及真实请求服务 | `native/http/` |
| 图片、地图、原浏览器脚本、文本型物品表 | `engine/img/`、`engine/map/`、`engine/include/javascript/`、原资源路径 |
| 现代界面 | `public/modern/modern.js`、`modern.css` |
| 私有站点配置和模块启用清单 | 原生状态目录内的 `native-admin-config.json`、`native-module-state.json` |

静态迁移产物也是普通 JavaScript，可以直接调试、修改和提交。不要在生产服改 PHP 文件后期待规则自动变化。部分带 `.php` 后缀的文件是原版访问保护头加 CSV 文本资源，仍按数据读取；配置数组已迁为 JSON 或静态 JS。

修改机制前先定位原函数、调用链和相应测试。保留依赖、钩子顺序、参数引用、随机数调用顺序和数值类型。新模块须提供 `name`、依赖、`state`、`functions`，在静态目录注册，然后进入启用清单；网页不能执行任意路径的代码。调用覆盖链须 `await ctx.next(...)` 或 `await ctx.call(...)`，外部入口用 `session.call(...)`。完整 API 见 [原生模块说明](../native/modules/README.md)。

停止服务器后运行：

```sh
npm run compile
npm run test:native
npm run verify:source
npm start
```

`compile` 校验实际原生模块依赖、顺序、模板注册及构建哈希；它不运行 PHP ADV，也不改存档。管理页保存的候选清单经校验后可在页面应用；停服应用同一候选用 `npm run compile -- --staged`。源码变更仍需重启 Node。不能通过删除锁、数据库或存档绕过失败。

## 构建工具与覆盖风险

`scripts/native-compiler/` 是开发期静态转换工具，使用开发依赖 `php-parser` 读取固定来源文件，输出可检查的 async JavaScript。生产不加载 parser，不解析 PHP，不执行 AST，也不使用 eval。首次迁移保留这些工具是为了复现来源和审计语义；它们不应成为新增机制必须依赖的 PHP 开发流程。

工具会覆盖对应生成目录。已经直接修改原生 JS 时，先保存差异并审查生成结果，禁止无条件重建后丢掉修改。需要从对照源重新移植时，按这个顺序运行并检查各报告的 failures 为空：

```sh
node scripts/native-compiler/build-modules.mjs
node scripts/native-compiler/build-modules.mjs --remaining
node scripts/native-compiler/build-resources.mjs
node scripts/native-compiler/build-pages.mjs
node scripts/native-compiler/build-templates.mjs
```

改模板可编辑已提交的静态模板并同步其构建清单哈希，或修改原 HTM 再用模板构建器重建；后者会被来源核验报告为主动改造。不得重写 `upstream/manifest.json` 隐藏差异。移植产生的兼容数值、数组、引用和字节操作在 `native/generated/context.mjs`、`native/templates/values.mjs` 等公共函数中；不要绕开它们改变旧机制。

## 数据、测试和 UI

`.env` 只放部署参数。管理页持久配置保存为私有 JSON，重启继续生效。默认模块清单来自不可变来源清单，保留原本关闭的 9 个模块、模式可用时间和运营开关。修改公开可用性是另一个产品决定，不属于等价移植。

集成测试只使用 `scripts/test-db.ps1` 准备的独立 MariaDB（127.0.0.1:33317、`var/test-db`），每项另建随机数据库和 `var/tests` 子目录。测试不得借用 `.env` 的正式数据库。缺少 PHP 对照时，相关差分测试会明确跳过；部分数据库测试也会跳过，而最终默认入口验收缺少专用数据库会直接失败，浏览器验收缺少浏览器也会失败。出现 skip 不能算完成验收。本机原生 PHP 7.4 仅用作开发对照。

机制变更须验证成功和拒绝分支、状态重载及录像。运行层变更执行 `npm test`。真实 HTTP/浏览器整合在 `tests/native-full-http.test.mjs` 与 `tests/native-full-gameplay.test.mjs`，模式矩阵在 `tests/native-modes.test.mjs`。Windows 沙箱可能阻止 Edge 子进程；使用独立测试 profile 运行浏览器，不接入个人浏览器。

经典界面和原协议保留。现代界面移动原 DOM，不复制控件；必须保留 ID、表单归属、快捷键和录像 DOM 路径。改变 UI 后检查两种界面、异步刷新、真实表单发送和录像点击回放。素材仍保留来源，设定中明确保密的内容不得写进公开界面。

部署与恢复见 [DEPLOYMENT.md](DEPLOYMENT.md)，测试范围与主动差异见 [NATIVE-MIGRATION.md](NATIVE-MIGRATION.md)。

## 原生请求性能基准

使用上面的专用测试数据库，停止其他基准或测试进程后运行：

```powershell
.\scripts\test-db.ps1 -Action start
npm run benchmark:native -- --samples=20 --label=local
```

该命令不读取 `.env`，只接受经端口和真实数据目录核验的独立测试库。它创建随机数据库与 `var/tests` 子目录，载入默认 770 模块、开局并参战，经回环 HTTP 发送普通指令与合成菜单请求，检查实际响应，最后关闭服务并清理自己创建的状态和数据库。报告保存在 `var/tests/performance-local.json`，包含预热后每项的 P50/P95、各次请求、模块初始化、连接、SQL 与进程 CPU 用时。初始化和 SQL 可能重叠，不能直接相加。

默认关闭后台调度以隔离请求成本；添加 `--scheduler-ms=1000` 可测同机后台调度开启时的延迟，此时分项与 CPU 统计也可能计入后台工作。添加 `--profile` 可输出同名 `.cpuprofile`，供开发者工具分析热点；采样会产生额外开销，比较前后性能时必须使用相同参数。基准不包含公网、Cloudflare、浏览器渲染或多人并发，不能当作目标服务器的容量保证。

静态 JavaScript 模块由 Node 的模块缓存常驻。值操作共用无请求状态的辅助函数，模块导入的引用访问器仅在当前请求内复用；玩家、房间、随机状态、数据库连接和锁仍由请求持有。头像服务按请求读取一次根目录文件名来排除缺失的编号图片，已有文件继续经过真实路径和文件检查；新增图片下一请求可见，无需清缓存。源码更新后按前述步骤停服、`npm run compile`、重启，既有配置和存档继续使用。
