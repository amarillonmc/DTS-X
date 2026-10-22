<?php
// Preserve the old administrative permission check for maintenance guidance.
defined('IN_GAME') || define('IN_GAME', true);
defined('GAME_ROOT') || define('GAME_ROOT', '/game/');
$magic_quotes_gpc = false;
require GAME_ROOT . 'include/global.func.php';
check_authority();
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
?>
<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>DTS-X 模块维护</title>
<style>body{max-width:760px;margin:8vh auto;padding:24px;background:#101522;color:#dbe8ef;font:16px/1.8 system-ui,sans-serif}a{color:#72d9e7}code{padding:3px 8px;background:#243045}h1{font-size:25px}</style></head><body>
<h1>DTS-X 模块维护</h1>
<p>模块编辑与校验仍可在原管理界面完成。应用更改需要停止游戏服务，由服务器管理员在项目目录执行 <code>npm run compile -- --staged</code>，完成后重新启动游戏服务。</p>
<p>此命令应用已通过校验的暂存模块列表。更改源文件后重新生成当前模块，请执行 <code>npm run compile</code>。详细步骤见项目 <code>doc/</code> 下的开发文档。</p>
<p>本版本固定启用 ADV1、ADV2、ADV3，关闭 COMBINE 与旧 PHP daemon；请求调度、并发工作进程和房间等待由 Node.js 管理。高级运行模式开关不再直接修改这些配置。</p>
<p><a href="modulemng.php?mode=edit">返回模块编辑</a> · <a href="admin.php">返回管理界面</a></p>
</body></html>
