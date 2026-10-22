// Exact, checked compatibility patches. The engine/ snapshot is never edited.
export const patches = [
  { file: 'templates/default/admin_gameinfomng.htm', before: '<form method="post" name="gameinfomng" onsubmit="admin.php">', after: '<form method="post" name="gameinfomng" action="admin.php">' },
  { file: 'include/template.func.php', before: "if(!$fp = fopen($objfile, 'w')) {", after: "if(!$fp = (defined('DTS_NODE_RUNTIME') ? dtsx_open_template_cache($objfile) : fopen($objfile, 'w'))) {" },
  { file: 'include/template.func.php', before: 'gexit("Directory \'./gamedata/templates/\' not found or have no access!");', after: "throw new RuntimeException('Cannot write template cache: '.$objfile.'; '.json_encode(error_get_last()));" },
  { file: 'index.php', before: 'if($___MOD_SRV) {', after: "if($___MOD_SRV || defined('DTS_NODE_RUNTIME')) {" },
  { file: 'include/modules/core/sys/init.php', before: "//从玩家提交的信息（一般是$_POST）里获取用户名和密码\n\t\tglobal $___LOCAL_INPUT__VARS__INPUT_VAR_LIST;", after: "//从玩家提交的信息（一般是$_POST）里获取用户名和密码\n\t\tglobal $___LOCAL_INPUT__VARS__INPUT_VAR_LIST;\n\t\t// The daemon transport normally supplies this canonical room selector.\n\t\tif (defined('DTS_NODE_RUNTIME')) dtsx_import_room_input($___LOCAL_INPUT__VARS__INPUT_VAR_LIST);" },
  { file: 'replay_receive.php', before: "$valid = false;", after: "if (defined('DTS_NODE_RUNTIME')) dtsx_validate_replay_request();\n\n$valid = false;" },
  { file: 'include/admin/globalgamemng.php', before: "file_get_contents($daemonmng_url.'?'.$get_var);", after: "if (!defined('DTS_NODE_RUNTIME')) file_get_contents($daemonmng_url.'?'.$get_var); // Node requests reload config on each execution." },
  { file: 'include/roommng/roommng.func.php', before: 'foreach ($lis as $port)', after: "if (defined('DTS_NODE_RUNTIME')) return; // Node owns room long-poll waiting.\n\t\tforeach ($lis as $port)" },
  { file: 'command.php', before: '//清除进程锁，避免烂代码导致daemon卡死\nif(!empty($plock))', after: "// Node owns request execution; retain the original replay format.\nif (defined('DTS_NODE_RUNTIME')) dtsx_record_replay_response();\n\n//清除进程锁，避免烂代码导致daemon卡死\nif(!empty($plock))" },
  { file: 'include/modules/extra/misc/replay/main.php', before: 'if (!$___MOD_SRV || !$___MOD_CODE_ADV3) return;', after: "if ((!$___MOD_SRV && !defined('DTS_NODE_RUNTIME')) || !$___MOD_CODE_ADV3) return;" },
  { file: 'modulemng_activate.php', before: 'curl_post($url, $context, NULL, 1);', after: "if (!defined('DTS_NODE_COMPILE')) curl_post($url, $context, NULL, 1);" },
  { file: 'roomupdate.php', before: '//创建socket', after: "// Node performs the wait without holding a PHP request or socket.\nif (defined('DTS_NODE_RUNTIME')) { ob_clean(); exit(); }\n\n//创建socket" },
];
export function applyExactPatch(content, patch) {
  const normalized = content.replaceAll('\r\n', '\n');
  if (normalized.includes(patch.after)) return normalized;
  if (normalized.split(patch.before).length !== 2) throw new Error(`Patch no longer matches exactly: ${patch.file}`);
  return normalized.replace(patch.before, patch.after);
}
