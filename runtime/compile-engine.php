<?php
/**
 * Trusted Node-side compiler entrypoint. Never publish /runtime over HTTP.
 * Run validate and compile as separate PHP requests, after database installation.
 * Node supplies DTS_INTERNAL=1 and DTS_COMPILE_PHASE in the PHP server map.
 */
if ((string) ($_SERVER['DTS_INTERNAL'] ?? '') !== '1') {
    http_response_code(403);
    exit('Internal compiler only.');
}

$dtsxCompileRoot = rtrim((string) ($_SERVER['DTS_ENGINE_ROOT'] ?? '/game'), '/\\') . '/';
$dtsxCompilePhase = (string) ($_SERVER['DTS_COMPILE_PHASE'] ?? 'validate');
if (!in_array($dtsxCompilePhase, array('validate', 'compile'), true)) {
    http_response_code(400);
    exit('Unknown compiler phase.');
}
if (!is_file($dtsxCompileRoot . 'gamedata/modules.list.php')) {
    throw new RuntimeException('Engine module list is missing.');
}
chdir($dtsxCompileRoot);
defined('DTS_NODE_RUNTIME') || define('DTS_NODE_RUNTIME', true);
defined('DTS_NODE_COMPILE') || define('DTS_NODE_COMPILE', true);
defined('GAME_ROOT') || define('GAME_ROOT', $dtsxCompileRoot);
defined('IN_GAME') || define('IN_GAME', true);
@ini_set('memory_limit', '1024M');
@set_time_limit(0);
$_GET = $_POST = $_REQUEST = $_COOKIE = array();

if ($dtsxCompilePhase === 'validate') {
    define('IN_MODULEMNG', true);
    require GAME_ROOT . 'include/common.inc.php';
    require GAME_ROOT . 'include/modulemng/modulemng.func.php';
    $dtsxCandidate = GAME_ROOT . 'gamedata/modules.list.temp.php';
    $dtsxUseStaged = (string) ($_SERVER['DTS_COMPILE_STAGED'] ?? '') === '1';
    if ($dtsxUseStaged && !is_file($dtsxCandidate)) {
        throw new RuntimeException('No staged module list exists. Save changes in the module manager first.');
    }
    if (!$dtsxUseStaged && !copy(GAME_ROOT . 'gamedata/modules.list.php', $dtsxCandidate)) {
        throw new RuntimeException('Cannot stage the module list.');
    }
    $dtsxValidation = module_validity_check($dtsxCandidate);
    if ($dtsxValidation !== 1) {
        http_response_code(500);
        throw new RuntimeException('Module validation failed: ' . strip_tags((string) $dtsxValidation));
    }
    echo "\nDTS_VALIDATE_OK\n";
    if (!empty($notice_log)) {
        echo strip_tags($notice_log) . "\n";
    }
    return;
}

if (!is_file(GAME_ROOT . 'gamedata/modules.list.pass.php')) {
    throw new RuntimeException('Run the validate phase before compiling.');
}
require GAME_ROOT . 'include/modulemng/modulemng.config.php';
if (!$___MOD_CODE_ADV1 || !$___MOD_CODE_ADV2 || !$___MOD_CODE_ADV3 || $___MOD_SRV || $___MOD_CODE_COMBINE) {
    throw new RuntimeException('Compilation requires ADV1/ADV2/ADV3=1, SRV/COMBINE=0.');
}

// The Node preparation patch suppresses this entrypoint's final HTTP maintenance
// callback when DTS_NODE_COMPILE is set. The Node host runs maintenance separately.
require GAME_ROOT . 'modulemng_activate.php';
$dtsxDatalibPointer = GAME_ROOT . 'gamedata/javascript/datalib.current.txt';
if (!is_file($dtsxDatalibPointer)) {
    throw new RuntimeException('ADV3 did not produce a datalib pointer.');
}
$dtsxDatalibName = trim(file_get_contents($dtsxDatalibPointer));
if (basename($dtsxDatalibName) !== $dtsxDatalibName || !is_file(GAME_ROOT . 'gamedata/javascript/' . $dtsxDatalibName)) {
    throw new RuntimeException('ADV3 datalib is missing or invalid.');
}
if (!empty($faillog) || !is_file(GAME_ROOT . 'gamedata/run/core/sys/init.adv.php')) {
    throw new RuntimeException('Module compilation did not finish.');
}

// Ask the original path resolver which files ADV3 must have generated, without
// reparsing templates or changing the compression dictionary. Node verifies
// this manifest on the host filesystem, independently of WASM's file cache.
$dtsxPreviousRefresh = $tplrefresh;
$dtsxPreviousForce = $___TEMP_template_force_refresh;
$tplrefresh = $___TEMP_template_force_refresh = 0;
$dtsxExpectedTemplates = array();
try {
    foreach ($codelist as $dtsxModuleIndex => $dtsxCodeFiles) {
        foreach ($dtsxCodeFiles as $dtsxCodeFile) {
            if (substr($dtsxCodeFile, -4) !== '.htm') continue;
            $dtsxTemplateName = 'MOD_' . strtoupper($modn[$dtsxModuleIndex]) . '_' . strtoupper(substr($dtsxCodeFile, 0, -4));
            $dtsxExpectedTemplates[template($dtsxTemplateName)] = true;
            foreach ($___MOD_EXTRA_HTMLTPL_LIST as $dtsxTemplateId) $dtsxExpectedTemplates[template($dtsxTemplateName, $dtsxTemplateId)] = true;
        }
    }
    // The upstream ADV3 pass intentionally leaves these non-command pages for
    // ordinary on-demand rendering. Keep its exact selection for default HTM.
    foreach (scandir(GAME_ROOT . 'templates/default') as $dtsxDefaultFile) {
        if (substr($dtsxDefaultFile, -4) !== '.htm' || is_dir(GAME_ROOT . 'templates/default/' . $dtsxDefaultFile)) continue;
        if (preg_match('/^(admin|mixhelp|alive|winner|valid|user|rank|kuji)/', $dtsxDefaultFile) || substr($dtsxDefaultFile, -8) === 'help.htm') continue;
        if (in_array($dtsxDefaultFile, array('header.htm','footer.htm','donate.htm','map.htm','replay.htm','register.htm','end.htm','updatelist.htm','areainfo.htm'), true)) continue;
        $dtsxTemplateName = substr($dtsxDefaultFile, 0, -4);
        $dtsxExpectedTemplates[template($dtsxTemplateName)] = true;
        foreach ($___MOD_EXTRA_HTMLTPL_LIST as $dtsxTemplateId) $dtsxExpectedTemplates[template($dtsxTemplateName, $dtsxTemplateId)] = true;
    }
} finally {
    $tplrefresh = $dtsxPreviousRefresh;
    $___TEMP_template_force_refresh = $dtsxPreviousForce;
}
if (!$dtsxExpectedTemplates) throw new RuntimeException('Compiler produced no expected template paths.');
$dtsxManifest = json_encode(array('version'=>1, 'templates'=>array_keys($dtsxExpectedTemplates)), JSON_UNESCAPED_SLASHES);
if (file_put_contents(GAME_ROOT . 'gamedata/compiled-templates.json', $dtsxManifest) !== strlen($dtsxManifest)) {
    throw new RuntimeException('Cannot save compiled template manifest.');
}
echo "\nDTS_COMPILE_OK\n";
