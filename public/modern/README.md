# 电波终端界面

`modern.js` 与 `modern.css` 是原界面的可选壳层，不产生第二份游戏状态。默认仍为经典界面；右上角「电波终端」切换，在同一浏览器保存偏好。

## 注入契约

只对完整的、由游戏输出的 HTML 页面注入：

```html
<link rel="stylesheet" href="/modern/modern.css">
<script defer src="/modern/modern.js"></script>
```

JS 必须在上游 `common.*.js`、`game.*.js` 加载以后执行。使用 `defer` 并保留原脚本加载顺序即可。**不要向 AJAX、压缩 JSON、录像数据、图片等响应注入标签。** 两个资源文件都不需要打包工具或第三方前端依赖。建议生产静态路由只暴露这两个文件；本目录中的 fixture、测试脚本、说明不需要部署为公开页面。

页面没有 `#game_interface` 时仍提供切换入口并应用终端配色，保留其完整内容。地图窗格加载同源真实 `map.php?dts-frame=map`，沿用用户 Cookie 和地图权限；该参数只让壳层隐藏重复页头，不改变服务端地图规则。刷新按钮重新请求地图，展开链接打开完整原地图页。

真实后台联调还发现上游游戏管理表单把 `admin.php` 写在 `onsubmit` 中，浏览器会把它当 JavaScript 并报错。`runtime/patches.mjs` 在运行副本中将此单一属性改为正确的 `action="admin.php"`，不改管理逻辑或源快照。

录像页面不加载当前局地图，也不额外轮询当前局聊天，避免把现场信息混入历史录像；录像内容仍由原回放数据驱动。

## 窗口和交互

- 人物与现场、行动指令、装备、背包、行动记录、聊天、游戏状况、地图、导航均可独立移动、缩放和最小化；底栏恢复窗口。
- 桌面用标题栏拖动，用右下角缩放。聚焦标题栏后方向键移动、Shift + 方向键缩放、Enter 最小化；缩放柄也支持方向键。
- 宽度小于 780px 或选「紧凑排列」时使用纵向窗口，可触屏拖动标题栏改变顺序，方向键也可排序。旧游戏内容宽于窗口时在窗口内部滚动。
- 「窗口归位」清除布局并恢复全部窗口。布局以 `dtsx.terminal.v1` 存在 `localStorage`，不传给服务端；禁用存储时仍可正常使用。
- 视觉沿用旧版灰黑与钢蓝，辅以淡青色终端线条。UI 文案不新增世界观秘密或暗示隐藏设定。

## 保持旧机制的边界

1. **移动原节点，不复制 HTML。** `#main`、`#cmd_interface`、`#chat` 等节点带着原表单、内联事件和 `addEventListener` 监听移动；装备和背包表格从原容器拆出。模板 2 的装备折叠状态彼此耦合，所以保留在完整人物面板内。
2. **同步恢复原树后再执行旧函数。** `showData`、`postCmd` 在现代模式中通过 `withLegacyDOM` 包裹：按逆序还原节点、调用原函数、重新采集原节点挂载。`finally` 保证异常也恢复壳层。占位使用注释节点，不改变录像依据的 element index。点击记录不进入此包装，避免搬动正在展开的原生下拉框。
3. **服务器可以替换整个 `#main` / `#cmd_interface`。** 原树先恢复，替换发生在真正的原父节点；挂载阶段重新查找，新窗口不会保留已废弃 ID。
4. **录像保留原路径。** 现代模式记录时沿注释占位计算原树中的元素索引，保留原 INPUT/SELECT/OPTION 筛选、重复点击过滤和 OPTION 暂停标记，不移动真实控件。播放时先在原树定位目标，再执行与上游一致的按钮/下拉框交互，使目标位于可见现代窗口。经典模式及原树恢复期间直接调用原函数。
5. **聊天仍由原 `chat()` 发送并维护轮询。** 新壳层每次原轮询时只读请求另一条 feed，以支持聊天和新闻同时显示。额外请求复制原表单数据并强制 `sendmode=ref/news`、清空 `chatmsg`，绝不重复发送。返回仍交给原 `showChatdata` 解码/渲染；房间变化、过期游标、取消和服务器停止轮询均被处理。切回经典不改 `sendmode`、定时器或原聊天游标。
6. **不丢未发送草稿与焦点。** 移动前后保存原输入节点的焦点、选区，不通过重建表单保存值。

所有新样式以 `html.dts-modern` 或地图嵌入标记为作用域。经典模式只多一个切换按钮。旧游戏颜色、ID、接口字段和资源地址保持原意。

## 修改和扩展

窗口定义和默认布局在 `descriptors`、`defaultLayout()`；收集边界在 `mountNodes()`。新增可拆分组件应使用 `moveNode(existingNode, panelId)`，不得复制含 ID 或表单的 DOM。新增服务器渲染入口应按需包裹 `DTSModern.withLegacyDOM(callback)`，或渲染后派发 `document.dispatchEvent(new Event('dts:render'))` 重新安装 hooks。

公开调试接口：

```js
DTSModern.setMode('modern'); // 或 false / 'classic'
DTSModern.resetLayout();
DTSModern.refresh();
DTSModern.getState(); // 只读副本，含窗口几何信息
DTSModern.withLegacyDOM(() => { /* 需要原DOM层级的同步代码 */ });
```

`withLegacyDOM` 只用于**同步**函数；异步回调在收到响应时再进入该函数。不要包住等待网络的整个 Promise。

## 真实浏览器回归

测试用原 `engine/include/javascript` 文件，模拟页面仅提供数据，不重写上游协议函数。命令：

```sh
node public/modern/browser-test.mjs
# 如未自动找到浏览器：
CHROME_PATH=/path/to/chrome node public/modern/browser-test.mjs
```

Windows PowerShell：

```powershell
$env:CHROME_PATH = 'D:\path\chrome.exe'
node public/modern/browser-test.mjs
```

可用 `DTS_ENGINE_DIR` 指定上游快照位置。测试仅用 Node 内置模块、Chromium DevTools Protocol，不要求安装 npm 包。浏览器以独立临时 profile 无头运行。

若在已经隔离的 CI/执行沙箱内 Chromium renderer 无法启动，可为该次合成 fixture 测试设置 `DTS_BROWSER_NO_SANDBOX=1`；默认保留浏览器沙箱，不要把此测试选项用于真实用户浏览会话。Windows Edge 测试进程使用 `--edge-skip-compat-layer-relaunch`，避免兼容层重启后丢失 DevTools 管道；该参数不关闭浏览器沙箱。

覆盖节点身份、监听、草稿/焦点/选区、所有控件的录像原路径（含嵌套装备区、OPTION 暂停与去重）和播放、下拉框真实鼠标按下/松开后保持展开及选择、表单序列化、聊天/新闻请求、最小化/恢复、键盘移动、真实指针拖拽/缩放、经典还原、整块 AJAX 替换、偏好持久化、同源地图和移动端横向溢出。截图和报告写入忽略目录 `test-output/`。fixture 是合成数据回归，不能替代服务器端实际登录/战斗/录像端到端验证。

### 真实本地游戏联调

`live-test.mjs` 读取根目录 `.env` 中的测试管理员凭据，只允许 localhost 服务和名称含 `test` / `smoke` / `dev` 的隔离库。它会通过原管理员表单开始游戏、激活测试参与者并执行移动/探索/可用道具，因此**只可用于专用测试库**。默认只测试未发送的聊天草稿。浏览器拦截所有非本地 origin 请求，包括旧页面中的第三方统计资源。

```powershell
$env:DTS_LIVE_TEST_ACK = 'isolated'
$env:CHROME_PATH = 'D:\path\chrome.exe'
node public/modern/live-test.mjs
```

服务须已完成 setup/compile 且 `/healthz` 为 ready。真实截图及结果写入 `artifacts/ui-live/`；缺少可用携带道具时报告为 `PARTIAL`，不把未执行的道具操作当作通过。此测试不会自动结束现有游戏或清空数据。

若专用测试参与者已经死亡，可显式设置 `DTS_LIVE_RESTART_GAME=1`，由测试点击原管理页的「结束游戏」「开始游戏」重新建立测试局；这会结束该隔离服当前局，默认关闭。既有录像仍由原结算流程保存。

设置 `DTS_LIVE_ROOMS=1` 可追加房间联调：通过原按钮创建/进入 SOLO 等待房、发送一次明确标注的本地测试消息、确认消息唯一、切换保留输入节点，最后退出房间。设置 `DTS_LIVE_ROOM_ONLY=1` 则只执行登录和房间联调，方便独立诊断。不会自动开始双人对战，也不绕过原注册验证。测试报告只记录请求路径、状态和耗时，不记录 Cookie、密码或请求体。

`DTS_LIVE_CAPTURE_ONLY=1` 可对已激活、位于主游戏的测试参与者只做界面切换、草稿保存、地图/新闻可见性和截图检查，不提交游戏动作。主游戏、房间与截图检查分别保存 `report-game.json`、`report-room.json`、`report-capture.json`，同时更新最新 `report.json`。地图验证检查真实表格可见尺寸，避免仅有隐藏 DOM 也被判为通过。
