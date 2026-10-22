<?php
if ((string)($_SERVER['DTS_INTERNAL'] ?? '') !== '1') { http_response_code(403); exit('Internal only'); }
chdir('/game');
$checks = array('php'=>PHP_VERSION, 'runtime'=>'Node.js + WebAssembly');
foreach (array('mysqli','curl','mbstring','gd','zlib') as $extension) $checks[$extension] = extension_loaded($extension);
require 'include/modules/core/sys/config/server.config.php';
$db = @mysqli_connect($dbhost, $dbuser, $dbpw, $dbname);
$checks['database'] = (bool)$db;
if ($db) { $checks['databaseVersion'] = mysqli_get_server_info($db); mysqli_close($db); }
$checks['installed'] = file_exists('gamedata/install.lock');
$checks['compiled'] = file_exists('gamedata/javascript/datalib.current.txt');
if (!$checks['database']) http_response_code(503);
echo json_encode($checks, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
