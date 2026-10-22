# 改资源与改机制

## 与旧版的对应关系

游戏逻辑仍为原版 PHP 模块。Node 负责运行与调度，所以不用先学 TypeScript 才能添加道具、NPC 或技能。`engine/` 下就是原仓库根目录；新服包含该分支完整 3,578 个受版本控制文件。

| 原路径 | 本项目源路径 | 用途 |
| --- | --- | --- |
| `include/modules/` | `engine/include/modules/` | 模块、技能、模式、物品、战斗与结局 |
| `gamedata/modules.list.php` | `engine/gamedata/modules.list.php` | 加载顺序及启停；顺序决定钩子覆盖链 |
| `include/modules/*/config/` | 同路径加 `engine/` | 各模块自己的数据和参数 |
| `gamedata/` | `engine/gamedata/` | 地图、SQL、展示数据及游戏资源 |
| `templates/default/` | `engine/templates/default/` | 原界面模板 |
| `img/`、`map/` | `engine/img/`、`engine/map/` | 原图片和地图资源 |
| `include/javascript/` | `engine/include/javascript/` | 原交互、快捷键、响应解码和录像 |
| PHP/Apache/daemon 配置 | `.env`、`runtime/`、`server.mjs` | Node 托管运行层 |
| 新窗口界面 | `public/modern/modern.js`、`modern.css` | 窗口布局与视觉样式 |

先用搜索定位真实条目，不要凭创作资料中另一个版本的路径修改。这个 Unstable 是模块版：例如战斗在 `base/attack`、`base/battle` 及属性/技能模块中，不能照搬常磐版 `include/game/revcombat.*` 的路径。

## 常见改造步骤

1. 停服并备份。修改仓库 `engine/` 内目标配置、图片或模块源文件，保留原编码和标识符。
2. 如果加技能，复制与目标行为最接近的现有模块，填写 `module.inc.php` 的名称、依赖、代码/模板列表，把模块加入 `gamedata/modules.list.php` 的正确位置。
3. 保留 `namespace`、`eval(__MAGIC__)`、`eval(import_module(...))`、`$chprocess` 的原约定。它们是钩子和变量引用系统，不能当无用模板删掉。
4. 执行 `npm run compile`，它会同步修改、进行原模块合法性检查，并重新生成 ADV1/ADV2/ADV3 缓存。错误详情在 `var/compile-*.log`。Docker 下修改源后重建镜像并启动也会同步编译。
5. 启动服务器，至少在经典/现代两种界面中验证新操作、失败条件、道具消耗和录像。涉及战斗要检查双方状态与技能连锁，涉及房间要用两个账号验证。

原模块管理页仍可用于查看和编辑模块清单。Node 版固定执行架构，不允许从该页重新启用 PHP daemon 或关闭录像所需的编译级别。网页保存的候选清单在 `var/game/gamedata/modules.list.temp.php`；停止服务后使用 `npm run compile -- --staged` 应用候选，再把最终清单同步回仓库，避免仅存在服务器上。

生成目录 `var/game/gamedata/modinit`、`run`、`templates`、`javascript` 不是源文件，不要在这里修技能。直接修改 `var/game/include/modules` 只适合临时排查：后续源更新与它冲突时会停止同步，需手动合并；正式修改应回到 `engine/`。

自动编译检查模块 PHP/HTM、模块编译器、模板、加载清单以及实际配置内容。图片和 HTTP 入口包装的变化只同步，不强制重编译 770 个模块。显式 `npm run compile` 总会编译，适用于临时修改运行副本后的验证。内部回调端口在每次启动时同步到生成配置，不影响编译指纹。

## 示例一：增加一种开局地图补给

以下示例仅供开发者照做，没有预先改变原游戏数据。在 `engine/include/modules/base/itemmain/config/mapitem.config.php` 的“端点”段，现有 `0,1,7,精神制剂,HS,300,1,,` 表示开局在地图 1 放 7 件、每件恢复 300 体力的单次补给。要添加测试品，可另加一行：

```text
0,1,2,测试用精神制剂,HS,150,1,,
```

前八个逗号分隔字段依次是刷新禁区回数、地图编号、件数、名称、类型、效果、耐久或使用次数、附加属性。`0` 为开局，`99` 为每禁刷新，`98` 为一禁后每禁刷新；地图 `99` 表示随机地图。地图编号和名称对应 `engine/include/modules/core/map/config/map.config.php`；`HS` 的“体力恢复”处理在 `engine/include/modules/base/items/edible/main.php`。保留文件顶部 PHP 访问保护与现有文本格式，名称中不要放英文逗号或换行。

停服后执行 `npm run compile`，启动隔离测试服并新开普通游戏。旧局数据库里已经刷出的道具不会自动替换。到端点检查测试品是否出现，拾取后在体力不足时使用，验证实际恢复量、上限截断以及使用后消失；同时确认原精神制剂仍存在。这个改动没有新增类型，所以不必注册新模块。特殊副本可覆盖 `get_itemfilecont()` 并使用自己的表，不能只改基础表便假定所有副本一起改变。

## 示例二：调整头部受伤的命中惩罚

`engine/include/modules/base/skills/skill2/main.php` 是真实的头部受伤技能。它在载入人物时检查 `$pa['inf']` 是否包含 `h`，通过 `skillbase` 临时获得技能 2。`get_hitrate_multiplier(&$pa,&$pd,$active)` 先调用已有钩子链，再在攻击方具有该技能时将倍率乘以 `0.75`。若希望把这一层惩罚改为减少 10%，只把函数中的数值改为 `0.90`，保留其余调用：

```php
function get_hitrate_multiplier(&$pa,&$pd,$active)
{
    if (eval(__MAGIC__)) return $___RET_VALUE;
    $ret = $chprocess($pa,$pd,$active);
    if (\skillbase\skill_query(2,$pa))
        $ret *= 0.90;
    return $ret;
}
```

这里 `$pa` 是攻击方、`$pd` 是防御方；保留引用参数、`eval(__MAGIC__)` 和 `$chprocess` 才能与其他命中技能叠加。它不是把最终命中率固定为 90%。该技能已有 `module.inc.php` 与加载清单条目，无需新增条目；若另建技能，应使用未占用的技能编号、独立 namespace，并声明实际依赖，不能复制后仍叫 `skill2`。

停服编译，在隔离服比较其他条件一致的有头伤、无头伤人物：钩子前倍率为 `R` 时，这一层分别应给出 `R × 0.90` 和 `R`，治疗头伤后应恢复无伤分支。再与另一种命中修正同时启用，验证连锁仍生效，并检查一次真实攻击及录像播放。少量攻击的命中次数受随机数影响，不能用“连中几次”证明倍率正确；数值检查应在调试入口调用真实钩子链或增加针对该机制的差分测试。完成验证后再把数值改造用于正式服。

## 站点配置

`DB_*`、`PUBLIC_URL`、`TABLE_PREFIX`、站长名称由 `.env` 覆盖。通用游戏配置仍在运行目录的 `include/modules/core/sys/config/*.config.php`。首次从原 `.sample.php` 创建，后续不覆盖游戏设置。修改通用模块配置后也要重新编译。

初次安装保持原游戏参数和手动开局配置。启用某个原本关闭的活动、模式或功能，是运营决定，不作为移植时的默认改动。

## 新界面

现代界面只重组真实 DOM，不复制玩家信息、不重新计算游戏数值。每个窗口有标题栏、最小化按钮和尺寸控制；布局和模式保存在当前浏览器 localStorage。游戏服务器不会因为用户拖动窗口而修改玩家状态。

对 UI 做改造时，必须保留原控件的 ID、name、表单归属、事件和快捷键；服务器会替换 `main`、`cmd_interface` 等区域，不能只给初次页面挂事件。录像的操作坐标依赖经典 DOM 树，现代代码在原树上记录/定位后再恢复窗口布局。改动后运行 `public/modern/browser-test.mjs` 的浏览器回归。

视觉采用克制的暗色公共终端、钢蓝和细青色边界，沿用原图片和道具色彩。不要把设定库明确要求保密的底层真相写进公开 UI 文案。新增素材要同时记录来源和使用条件；本次默认界面不新增外部付费素材依赖。
