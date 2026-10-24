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

可省略的引用参数须同时验证省略、显式 `null`、指向空值的引用槽以及实际玩家对象。生成技能钩子会把 `&$pa = NULL` 传成只读包装对象；手写模块应先用 `referenceValue()` 取得槽中的值，再按原函数的空值规则选择当前玩家。PHP 的局部引用重绑定不等于替换调用者的空槽；真正赋值替换参数的技能获得/失去函数仍须保留引用槽。不能全局取消引用包装，也不能把所有空数组都当作当前玩家。

请求级 `uip` 的初值是 `null`。在原 PHP 首次写入数组的位置初始化必要层级，测试不要预先填充所有状态来绕过该边界。基础交互回归 `tests/native-interactions-http.test.mjs` 使用默认完整模块链、独立数据库和原请求协议，检查成功、拒绝、保存重载及录像，并在真实浏览器中点击陷阱和经验道具；新增交互应接入相应真实调用链验证。

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

测试入口通过 `scripts/run-tests.mjs` 把附加选项放在 Node 的文件列表之前，使 `npm test -- --test-concurrency=1` 真正串行执行。只跑指定文件可用 `npm test -- --test-concurrency=1 -- tests/native-modules.test.mjs`；`test:native` 接受相同参数。直接调用 Node 时同样把选项置于文件前，例如 `node --test --test-concurrency=1 tests/native-*.test.mjs`。旧入口的追加并发参数没有实际生效，历史记录已注明这一限制。

经典界面和原协议保留。现代界面移动原 DOM，不复制控件；必须保留 ID、表单归属、快捷键和录像 DOM 路径。改变 UI 后检查两种界面、异步刷新、真实表单发送和录像点击回放。素材仍保留来源，设定中明确保密的内容不得写进公开界面。

部署与恢复见 [DEPLOYMENT.md](DEPLOYMENT.md)，测试范围与主动差异见 [NATIVE-MIGRATION.md](NATIVE-MIGRATION.md)。

## 原生请求性能基准

使用上面的专用测试数据库，停止其他基准或测试进程后运行：

```powershell
.\scripts\test-db.ps1 -Action start
npm run benchmark:native -- --samples=20 --label=local
npm run benchmark:native -- --samples=50 --actions=all --scheduler-ms=1000 --label=scheduled
npm run benchmark:native -- --samples=20 --actions=all --concurrency=4 --label=concurrent
```

该命令不读取 `.env`，只接受经端口和真实数据目录核验的独立测试库。它创建随机数据库与 `var/tests` 子目录，载入默认 770 模块、开局并参战，经回环 HTTP 发送普通指令与合成菜单请求，检查实际响应，最后关闭服务并清理自己创建的状态和数据库。`--actions=all` 还测真实移动、搜索、使用物品和提交合成，计时外恢复测试夹具并检查数据库中的实际结果。报告保存在 `var/tests/performance-local.json`，分别记录首次请求、每项首次调用、预热后每项的 P50/P95/P99/最大值和超过 50ms、120ms 的次数，以及逐次请求、模块初始化、连接、SQL 与进程 CPU 用时。初始化和 SQL 可能重叠，不能直接相加。首次 HTTP 请求发生在同一进程已完成夹具开局之后，不能把它当作全新 Node 进程冷启动时间。

默认关闭后台调度以隔离请求成本；添加 `--scheduler-ms=1000` 可测同机后台调度开启时的延迟，此时分项与 CPU 统计也可能计入后台工作。`--concurrency=4` 追加同一玩家的四路指令突发，包含玩家锁等待；此段只报告请求延迟，不把重叠的 CPU/初始化时间归给某一个请求。添加 `--profile` 可输出同名 `.cpuprofile`，`--phases` 可追踪各模块初始化、顶层规则调用和文件操作；用 `node scripts/analyze-native-profile.mjs var/tests/performance-local.cpuprofile` 查看采样热点。采样和分项追踪会产生额外开销，验收延迟时不要启用它们。基准不包含公网、Cloudflare、浏览器渲染；同玩家突发也不能替代多房间、多玩家容量测试。

`--diagnostics` 另外记录每次请求结束后的堆内存、进程内存、事件循环累计利用率，以及垃圾回收起止时间和整体事件循环延迟，用于区分持续增长和偶发长尾。它也属于有开销的诊断模式。短测最大值不能代替较长的连续请求测试；超过 120ms 的请求必须如实计入，不能删除离群值来宣称达标。

静态 JavaScript 模块由 Node 的模块缓存常驻，打成单个文件本身不会免除每次请求的配置复制和规则初始化。应用复用模块依赖、覆盖调用链、技能元数据和模板绑定的准备结果；管理页应用模块清单时先构造新计划，再替换旧计划。较大的纯字面量配置在模块加载时冻结，请求复制只展开实际访问的子树；包含随机数或其他运行时计算的表达式仍在原调用位置执行。模块导入的引用访问器仅在当前请求内复用；玩家、房间、随机状态、数据库连接和锁仍由请求持有。

应用监听端口之前预载 882 个静态模板函数，渲染时直接复用函数，避免每个片段再次调用动态 `import()`。这会把模板代码加载和解析移到启动阶段；不执行模板函数、游戏初始化或随机规则，也不缓存玩家 HTML。修改模板代码仍需重新校验构建并重启。

应用还复用玩家表的列定义与原始头像目录。两者只保存静态元数据，不保存玩家、房间或数据库连接；重启或成功应用模块清单时失效。直接执行玩家表结构迁移或更新头像资源后必须重启服务，或重新应用模块清单以刷新目录。各请求得到独立的头像数据副本，范围变化使用不同条目；覆盖头像列表、格式或检查钩子的扩展走原完整调用顺序。

底层头像服务仍按请求读取目录条目，通用文件查询、符号链接和实际图像字节读取仍检查当前真实路径，尺寸缓存由文件身份、大小和精确修改时间校验。目录缓存只含文件名和尺寸，不授权读取图片字节。单独创建的宿主没有应用目录缓存，资源变动在下一请求生效。源码更新后按前述步骤停服、`npm run compile`、重启，既有配置和存档继续使用。

开发期编译器只在可静态证明的局部作用域中裁剪导入字段，动态变量和作用域逃逸仍使用完整导入。已审计的六个配方返回函数仅移交当前函数独占的临时数组；导入的引用槽继续复制，函数指纹变化会回退。纯数组构造的重复复制也可省略。卡片表的纯静态行提前构建，六次随机调用仍在原初始化位置和顺序发生。编译器不会在生产解析代码、跳过规则或依赖 PHP daemon。
