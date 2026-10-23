# Unstable 移植审计

## 2026-10-23：XX 原生 Node.js

用户要求已替代此前 PHP/WASM 技术路线。779 个模块现均有原生 JavaScript 实现，默认启用清单仍为 770 个；账号、HTTP、882 个静态模板、房间、管理、调度、录像及远端接口均已整合。原 `engine/` 的 3,578 个来源文件未改动，资源沿原路径使用。

完整实现、差分与实际整合证据见 [原生移植记录](../doc/NATIVE-MIGRATION.md)。模块清单只报告代码范围，不能由静态函数数量推导玩法覆盖。生产默认入口为原生 Node；开发转换器只在构建时读取固定 PHP 源并生成普通 JS，生产无 PHP 执行器或 AST 解释器。旧 runtime 与 WASM 依赖仅保留用于开发回归。

本轮已验证独立 MySQL、原生 OS 锁、真实 Edge、整局持久化与录像、19 种模式、账号/活动榜/录像真实 HTTP 回调、安装和重启。全部技能组合、随机种子及所有结局没有穷举；Docker/Linux 尚未实际验证。安装保护、缓存格式、管理器、历史工具及保留的上游缺陷，均在原生记录中明确列出。

同日补充交互回归：实际复现并修复 `command.php` 请求上下文错误导致 AJAX 后伤口缺少点击事件，以及现代录像记录重挂载 DOM 导致移动下拉框关闭。新增真实教程 HTTP/Edge 检查成功、体力不足拒绝和跨请求保存；两个原主题、两种界面均通过。原 `engine/` 不变，详细验证边界见原生记录。URL 的 `.php` 后缀为保留的 Node 路由协议，不是 PHP 执行层。

本轮两次完整套件分别为 1238/1240、1239/1240，均无跳过；第二轮全部原生测试通过，仅旧兼容生命周期测试出现 Windows 原子重命名 `EPERM`。失败项均单独复测通过，但没有一轮完整套件全绿；精确失败和复测范围见原生记录，不归因于未经确认的外部进程。

随后确认教学与普通局的合成提交均会因请求级 `uip=null` 触发 500。手写合成模块已补齐原 PHP 数组首次写入和空值读取的语义；旧配方夹具预先填充该状态，覆盖不了这个边界。新增空状态 PHP 差分和真实浏览器合成流程，覆盖范围及实际结果继续记录于原生移植记录，不把配方数量当作全部请求路径的验收。

下面是旧兼容方案的历史审计，只描述当时的技术选择与验证；其中 PHP VM、ADV、worker 和旧部署说明不适用于当前默认原生服务。

2026-10-23 请求性能复核：Node 静态模块本已常驻，主要开销来自值复制和请求内头像枚举。公共复制保留数组键序、删除桶及引用访问器；辅助函数共用，导入访问器仅按请求复用；缺失头像用每请求目录索引排除，已有文件仍校验真实路径。原资源、模块钩子和玩家状态隔离保留。独立真实 HTTP 每类20次，无采样器、无后台调度，普通指令P50 784→326ms、合成菜单1478→503ms；打开每秒调度后为445/516ms。详细方法与范围见 [原生迁移记录](../doc/NATIVE-MIGRATION.md#2026-10-23-原生请求性能回归)。

本轮全量1247项中1242通过，五项在Codex沙箱内Edge调试初始化超时；相同浏览器项目移至沙箱外、保留Edge自身沙箱，1+4项全部通过，覆盖双账号、教学疗伤、八组合合成与普通局原录像。数组复制/宿主隔离/头像索引相关19项通过，后续图像服务完善另3项通过；未声称单次完整套件全绿或公网容量已经验证。

## 旧兼容方案审计

审计基线：`dts` 仓库 `Unstable` 分支，提交 `ba8f607a57d5352327113f41b32676d16fe7c3ba`。本文件区分源码保留、兼容适配与实际验证，不能把“文件都在”当作所有组合已经完成游戏回归。

## 源码规模与运行方式

该提交有 3,578 个 Git 跟踪文件，其中 1,842 个 PHP 文件、196,335 行 PHP 源码。`gamedata/modules.list.php` 共 779 个模块条目，770 个启用。未找到 Git 跟踪的 AGENTS.md 或自动化测试框架；名字带 `testing` 的副本介绍页面不是测试套件。

原游戏采用 PHP 模块钩子引擎：`module.inc.php` 声明代码、模板、依赖和冲突；同名函数形成调用链；`eval(__MAGIC__)`、`eval(import_module(...))`、引用参数、动态变量、ReflectionFunction 和 debug_backtrace 参与运行。ADV 编译器生成 PHP 初始化代码、展开宏并压缩模板。直接将函数逐个改写为 JavaScript 会同时影响数百个钩子的继承顺序与 PHP 值语义。

本移植因此选择 Node.js 内嵌 PHP WebAssembly 执行原规则。开发者继续修改原 PHP 模块和资源格式；Node 负责服务、部署、运行时边界和现代界面。它不是游戏逻辑的 JavaScript 重写，部署也无需系统 PHP/Apache。

原 README 要求 PHP 7.0 以上，推荐 8.0 以上，注明测试到 8.2.9；旧 Dockerfile 却固定 PHP 7.2。因此不能单凭 README 版本说明推定所有 PHP 8 行为已经回归。PHP 7.4 可作为保守的初始兼容目标；以后升级运行时应重新执行编译和游戏回归。

## 数据库和运行时需求

| 项目 | 源码事实 | 移植处理原则 |
| --- | --- | --- |
| 数据库 | 实际驱动是 `include/db/db_mysqli.class.php`；样例声明只支持 mysqli | 使用真实 MySQL/MariaDB，不能把普通 SQLite 查询替换当作等价 |
| SQL | 包括 multi_query、SET sql_mode=''、ON DUPLICATE KEY UPDATE、行元组条件、动态房间表 | 保留 SQL 和表结构语义 |
| 表引擎 | 安装 SQL 使用 MyISAM，reset.sql 还使用 HEAP；归档 all.sql 有 MEMORY/InnoDB | 数据库须支持所需引擎，不随意改为统一事务表 |
| 中文 | UTF-8/utf8；存在 mb_strlen、mb_substr 的原生 PHP 回退实现 | 仍需验证中文用户名、物品名、模板输出和数据库往返 |
| 压缩 | gencode = base64(gzip(JSON))；录像也使用 gzip | zlib 和 JSON 必需；浏览器继续使用原解压协议 |
| 编译器 | tokenizer、ReflectionFunction、highlight_file、eval、动态 include | 使用完整 PHP VM；不能只做模板静态转换 |
| 文件 | 配置、缓存、响应、录像、模板均写磁盘；存在 flock 以及文件存在性锁 | Node 必须挂载真实持久目录，并保留锁语义 |
| 网络 | curl 本地回调及可配置远程用户库、活动榜、录像、NPC 接口 | 本地回调必须可重入；远端功能必须使用真实网络适配 |

原 README 建议 PHP 内存至少 256 MB、最好 512 MB 以上、执行时间 180 秒以上。ADV 编译同时加载全部模块，通常比普通页面更耗内存；编译入口允许 1 GB PHP 内存并解除 PHP 时间限制。VPS 容量还必须计入 Node、WASM 堆和数据库，不能把这个值当作整个进程的内存上限。

## 无 PHP daemon 的兼容点

原 SRV 模式使用 PHP socket 常驻进程来避免每次请求载入模块。它也承担了几个业务入口，关闭 SRV 时必须补齐这些行为。

1. **页面自调用。** `game.php`、`roomcmd.php`、`news.php`、`help.php`、`alive.php`、`rank.php` 等使用 `render_page()`，通过 curl 请求本机 `command.php`。单个不可重入的 WASM 请求队列会相互等待；需要内部请求分派或独立处理能力。
2. **录像记录。** 原 `command.php` 的 response 文件和操作索引写入位于 daemon 分支，且检查 SRV 与 ADV3。`runtime/replay-bridge.php` 在普通命令保存完成后写出同样格式，使用原 `replay_record_op()` 过滤点击路径。响应按房间 ID 存储，索引按房间前缀存储，两者不可混淆。
3. **录像归档。** 原 `replay/post_gameover_events()` 在 SRV 关闭时提前返回；适配允许受信任的 `DTS_NODE_RUNTIME` 进入该函数，其余胜利条件、模式排除、分块和打包规则仍使用原函数。仅打开 ADV3 不足以恢复录像。
4. **房间长轮询。** `roomupdate.php` 在没有新状态时绑定临时 TCP 端口，`room_save_broadcast()` 连接端口唤醒。Node 可以重复执行 socket 创建之前的状态检查，保持原压缩回应、跳转和无更新空响应协议。广播函数仍必须写数据库、更新时间并清理旧监听记录。
5. **自动维护。** 原 `command.php` 只在 SRV 开启、游戏时间凌晨 3 点且有请求时触发维护。Node 调度需调用同一个 `command=maintain` 路径；该路径执行 `am_main(63)` 并按日志修改时间限制 24 小时内重复维护。

全树 `socket_*` 活跃使用仅发现于 `command.php`、`include/socket.func.php`、`roomupdate.php`、`include/roommng/roommng.func.php`；安装器另外检查 socket 扩展。除 daemon 外，真正使用 socket 的业务是房间更新通知。

普通 HTTP 分支的冷却计算本来使用 `command.php` 的 `$pagestartime`，与 daemon 传递客户端开始时间对应。录像桥也采用这个时间，保持上游时间和 `moveut`/`moveutmin` 的转换。请求排队带来的体感延迟仍需压力测试，代码语义保留不等于性能相同。

## ADV 编译流程

生产配置应为 ADV1=1、ADV2=1、ADV3=1、SRV=0、CODE_COMBINE=0。上游注释已说明 CODE_COMBINE 不再维护且生产建议关闭。ADV3 的字典是原录像播放器的依赖，不能省略。

`runtime/compile-engine.php` 供受信任的 Node 工具调用，服务器变量要求 `DTS_INTERNAL=1`。默认引擎挂载 `/game`，运行时挂载 `/runtime`。编译必须在数据库和配置完成初始化后进行：

1. 新 PHP 请求中设 `DTS_COMPILE_PHASE=validate`，调用原 `module_validity_check()`。检查模块依赖、文件、钩子入口和签名，生成 `modules.list.pass.php`。成功标记是 `DTS_VALIDATE_OK`。
2. 另一个新 PHP 请求中设 `DTS_COMPILE_PHASE=compile`，运行原 `modulemng_activate.php`。成功标记是 `DTS_COMPILE_OK`，并检查 ADV2 输出及 ADV3 字典。
3. Node 在编译后单独执行维护；受信任编译入口跳过原编译页面末尾的本机 HTTP 维护回调。

编译成功还需要宿主文件系统验证：PHP 用原模板解析器列出启用模块及默认页面的实际模板缓存路径，写入 `gamedata/compiled-templates.json`；Node 检查每个文件确实存在、是非空普通文件且路径位于模板缓存目录，然后才写成功标记。每次启动重新检查这份清单，失败的编译会撤销旧标记。仅看到 PHP 输出“编译完成”不足以确认缓存可用。

两个阶段不可在同一 PHP 请求中连续 include：验证阶段已定义模块函数，编译阶段会再次定义它们。不要在游戏流量仍写状态时运行完整编译。

若在旧模块管理页已编辑并保存暂存清单，验证阶段另外传 `DTS_COMPILE_STAGED=1`，便使用现存 `modules.list.temp.php`；暂存文件不存在时明确报错。默认行为仍从正式模块清单创建候选文件。

原安装器每次进入都会把 ADV1/ADV2/ADV3/SRV 改为 0，且安装过程中会检测本机 HTTP 与 socket。Node 使用受限安装工具后不应继续公开原安装器。

## 机制与资源覆盖的判断方式

移植完整性首先通过原提交文件清单和内容摘要核对。原模块清单的启用状态、顺序和依赖仍是行为基线；禁用模块也应保留，不能为缩小体积丢弃。图像、地图、模板、配置列表、剧情和历史说明应与源码一起复制。

游戏功能继续由上游规则提供，包括基础探索/移动/战斗/物品、合成和商店、技能与卡片、成就、随机机制、NPC、副本、房间和团战、聊天、排行、结算及录像。这个列表表示架构覆盖范围，不表示已对每张卡片、每个副本及任意组合完成手工测试。

现代界面必须保留原控件、ID、表单字段和响应协议；拖动与最小化只是显示层。尤其录像的点击路径、动态替换的指令区、聊天轮询和地图更新需要浏览器验证。

## 已确认的验证与边界

2026-10-22 最终本地验收完成：完整自动测试 27/27 通过、0 跳过，doctor 的 PHP 7.4.33/扩展/MariaDB 11.4.13 与安装/编译状态均通过；全量编译产生的 756 个模板经宿主验证。真实主局 9 项检查及 7 个动作、房间 4 项、实服截图 6 项、独立界面夹具 15 组通过。通过同一生产 shutdown 入口退出再启动后，数据库和持久文件摘要一致且未重复编译。细项、性能和仍需目标 VPS 验证的范围以 [doc/VALIDATION.md](../doc/VALIDATION.md) 为准。

审计阶段完成：

- 两个 runtime PHP 文件通过本机 PHP 7.4 语法检查。
- 录像桥使用真实上游 `replay_record_op()` 完成一次独立格式验证：header 与索引可读、响应 payload 原样保存、时间一致、非法 DOM 路径过滤、跳转/排除模式/新闻请求不记录。该验证不替代完整局结束后的归档和浏览器播放回归。
- 源码规模、全部 socket 使用点、ADV 开关依赖、数据库驱动和安装流程已经逐项检查。
- `node --test tests/lifecycle.test.mjs` 的 6 项检查通过：冲突同步不覆盖或部分写入、未改源保留管理页编辑、源删除保护本地改动；内部端口刷新生成配置且不触发编译；模块和实际配置变动使缓存失效；真实 WASM 编译失败撤销旧成功标记并接收 staged 参数；第二进程被原生状态锁拒绝且退出后可重新取得锁；上传限制与非法状态路径检查；编译器即便报告成功，只要模板清单中的宿主文件缺失、为空或路径越界，仍拒绝写入成功标记。启动也会重新验证清单完整性。
- `node --test tests/engine-parity.test.mjs` 实测 2/2 通过，无跳过。其中将本机 PHP 7.4 与嵌入式 WASM 的 17 组真实上游行为逐一比较：中文、压缩编解码、64 进制数值、固定种子的随机选择、fatenum、数组引用、组合、时间格式、配置、武器基础攻击经验、录像点击与颜色、BMP。测试调用真实 `modules.func.php` 的 `__MAGIC__` 与 `hook_register` 链，并将两种运行时生成的压缩消息交叉解码。另一个测试检查全部 779 条模块声明引用的源码和模板存在。
- 已建立独立的 Windows MariaDB 11.4.13 集成测试实例：只监听 `127.0.0.1:33317`，数据在 `var/test-db`，测试库为 `dtsx_test`。官方 ZIP 的 SHA-256 已核对；没有注册 Windows 服务或修改机器既有 MySQL。随机凭据只写入 Git 忽略的 `var/test-db-credentials.json`，不要把该文件提交或贴入日志。`scripts/test-db.ps1 -Action start|status|stop` 管理这个测试进程；此工具不属于 Linux VPS 的正式部署步骤。
- `node --test tests/replay-archive.test.mjs` 通过真实归档集成检查：先确认测试 MariaDB 的 `@@datadir`，只在随机命名的新数据库和 `var/tests` 临时副本中执行。使用原 SQL schema、原 mysqli 驱动和真实 sys→replay 结束钩子，将 Node 录像桥产生的 416 个响应归档为主局及子房间录像。验证原 `fold/unfold`、200 操作分片、优胜者优先索引、响应顺序与中文、点击过滤、时区偏移、字典指针、BMP 缩略图以及原 `get_replay_by_gnum()` 与模板读取；并检查低活跃幸存、永续模式、GM 中止三个不归档分支。测试正常结束销毁独立数据库，不读取或改写当前服玩家表。没有本地测试数据库凭据时该项明确跳过。
- `node --test tests/cookie-forwarding.test.mjs` 通过真实 HTTP 转发检查。原 `curl_post()` 用大小写敏感的 `Set-Cookie` 正则，而 PHPResponse 使用小写头键；Node 现规范化该头名。测试执行生产响应转发代码，经过真实 PHP `curl_post()`、`render_page()` 和 `gsetcookie()`，确认重复房间 Cookie 的最后值以及其他多个 Cookie 都送达浏览器，避免“数据库已创建房间但浏览器 roomid 仍为 0”。
- `node --test tests/proxy-ip.test.mjs` 的 3 项检查通过：显式 `TRUST_PROXY=1` 才接收单个合法转发 IP，默认与非法/多值回退到连接对端；进入 PHP 前剔除原 `real_ip()` 会无条件信任的 IP 头及下划线别名。真实原函数在重复 WASM 请求中验证伪造头无效，IPv6 `REMOTE_ADDR` 保真，但原函数的 IPv4 解析局限仍保留。

差分测试只复制所需原源码到 `var/tests` 中的临时目录，并使用发布的配置样例，不修改 `engine` 或数据库。它验证基础函数和真实钩子分派，不代表载入全部 770 个模块后的最终战斗结果已经逐例核对。没有原生 PHP 7.4 的机器会明确跳过差分部分，可用 `DTS_REFERENCE_PHP` 指定解释器；正常部署本身仍不需要系统 PHP。

本地完成的安装、全模块编译、基础游戏动作、界面切换、房间聊天/退出、录像归档集成与重启持久化之外，仍需验证两人完整开战、主局及房间全部结局、复杂合成/商店/技能组合、浏览器逐帧录像播放，以及目标 VPS 的部署、备份恢复、并发和延迟。集成验证的最新结果由项目测试输出和验证文档给出，本审计不宣称全部 770 个模块组合已逐例通过。

发现一个上游既存维护问题：`am_main()` 开始写入日志后，在处理用户备份（bit16）和缓存清理（bit32）之前再次依据同一日志的修改时间检查 24 小时限制，常规非强制执行可能在此提前返回。迁移适配不应偷偷改变这条业务行为；若修复，应作为独立变更说明并验证。

真实归档测试还确认两个上游既存细节：录像索引的 PHP 保护头被计入 `$cnt`，而实际响应列表过滤了该行，因此显示操作数多 1，最后一片末尾有一个空数组；原气泡框模板把带 `px` 的参数作为数值使用，在 PHP 7.4 下产生 Notice。兼容运行层保留了这两项行为，测试没有把它们描述为新修复。归档集成检查不是所有结局分支或真实浏览器逐帧播放的替代品。

## Windows 验证机上的外部文件删除

2026-10-22 的真实编译/游玩验证曾出现模板日志已报告成功，但宿主磁盘缺少 `1_mod_base_weather_profile_weather.adv.tpl.php`，后续移动请求补编模板失败。源码审计确认上游只在 ADV3 开始前清空旧模板缓存，内联模板并不会删除对应文件。独立复现进一步排除了 PHP/WASM：单独使用 Node `fs.writeFile` 写入原始 178 字节天气模板，立即检查文件存在，约 500 毫秒后变为 `ENOENT`，写入进程期间没有删除操作。因此该现象属于进程外删除，不能据此宣称 NodeFS 或 WASM 的写文件实现存在缺陷。

随后通过火绒隔离记录确认了删除来源：1,023 个 DTS-X 文件被报告为 `HEUR:Backdoor/PHP.WebShell.g` 并隔离，其中 539 个来自实际服务的 `var/game` 模板目录；独立 Node 天气模板探针也在记录中。本机证据摘要为忽略文件 `var/antivirus-dts-evidence.json`。验证机同时运行 Windows Defender，但本次已找到的隔离记录来自火绒，不应笼统归因于所有防护软件。

助手没有修改或关闭主机防护设置，也没有添加写入重试来掩盖文件消失。用户随后处理了真实生成模板目录的信任；放行后首轮全量编译成功，Node 在宿主确认 756 个模板完整，紧接着启动未重复编译，真实浏览器主局与房间操作随后通过。模板清单验证继续保留，用于拒绝缺失缓存。该环境问题已经解除。

另有两次完整测试在独立临时目录中 Node 原子替换 `server.config.adv.php` 或 `modulemng.config.php` 时报告 `EPERM`。夹具目录彼此独立、操作串行 await，失败项尚未创建 PHP 或目标文件锁；独立纯 Node 连续替换 200 次通过，但实际占用者尚未确定，不能直接等同于上述火绒隔离。完整错误/堆栈保存在忽略文件 `var/atomic-rename-audit.json`，探针结果为 `var/atomic-rename-probe-result.json`。没有增加重试或扩大信任范围；后续复测与最终 `npm test` 均为 27/27 通过、0 跳过，偶发 Windows 原子替换失败仍如实保留在验证记录中。

## 运行时参考

使用 WordPress 官方 PHP.wasm 平台适配器，而非只加载裸 WASM 文件，才能获得 Node 侧文件系统、网络和锁集成。官方说明允许 Node 构建通过网络适配连接 MySQL；浏览器版 WordPress 的 SQLite 翻译方案不能直接套用到此游戏。

- [PHP.wasm Node 运行说明](https://developer.wordpress.org/playground/developers/local-development/php-wasm-node/)
- [PHP.wasm 包与平台适配职责](https://wordpress.github.io/wordpress-playground/developers/architecture/php-wasm-packages/)
- [WebAssembly PHP 网络架构](https://wordpress.github.io/wordpress-playground/developers/architecture/wasm-php-overview)

这些资料说明运行时能力；本游戏是否可用仍由固定依赖版本和实际检查决定。
