<?php
if ((string)($_SERVER['DTS_INTERNAL'] ?? '') !== '1') { http_response_code(403); exit('Internal only'); }
chdir('/game');
define('IN_GAME', true);
define('GAME_ROOT', '/game/');
if (file_exists('gamedata/install.lock')) { echo "DTS_ALREADY_INSTALLED\n"; return; }
require 'include/modules/core/sys/config/server.config.php';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$connection = mysqli_connect($dbhost, $dbuser, $dbpw, $dbname);
mysqli_set_charset($connection, 'utf8');
mysqli_query($connection, "SET sql_mode=''");
// Never run the upstream DROP TABLE statements against a populated database.
$result = mysqli_query($connection, 'SHOW TABLES');
if (mysqli_num_rows($result) !== 0) throw new RuntimeException('Installation requires an empty database. Existing database was left unchanged.');
$user = (string)($_SERVER['DTS_ADMIN_USER'] ?? '');
$password = (string)($_SERVER['DTS_ADMIN_PASSWORD'] ?? '');
if (!preg_match('/^[\p{L}\p{N}_-]{1,15}$/u', $user) || mb_strlen($password, 'UTF-8') < 12 || mb_strlen($password, 'UTF-8') > 24) throw new RuntimeException('Admin name must be 1..15 letters/digits/_/- and password 12..24 characters');
$sql = '';
foreach (array('install/bra.install.sql','gamedata/sql/players.sql','gamedata/sql/shopitem.sql','gamedata/sql/reset.sql') as $file) $sql .= "\n" . file_get_contents($file);
$sql = preg_replace('/\bbra_/', $gtablepre, $sql);
mysqli_multi_query($connection, $sql);
do { if ($r = mysqli_store_result($connection)) mysqli_free_result($r); } while (mysqli_more_results($connection) && mysqli_next_result($connection));
$statement = mysqli_prepare($connection, "INSERT INTO {$gtablepre}users (username,password,groupid,gender,icon) VALUES (?,?,'9','f','0')");
$hash = md5($user.md5($password));
mysqli_stmt_bind_param($statement, 'ss', $user, $hash);
mysqli_stmt_execute($statement);
$start = time()+$moveut*3600+$moveutmin*60;
mysqli_query($connection, "INSERT INTO {$gtablepre}game (gamenum,starttime) VALUES (0,'$start')");
foreach (array('adminlog_nf','newsinfo') as $name) {
    if (file_put_contents('gamedata/'.$name.'.php', "<?php if(!defined('IN_GAME')) exit('Access Denied'); ?>\n") === false) {
        throw new RuntimeException('Database initialized but game state is not writable. Preserve the database and inspect the state directory.');
    }
}
if (file_put_contents('gamedata/install.lock', "DTS-X\n") === false) {
    throw new RuntimeException('Database initialized but installation marker could not be saved. Preserve the database and inspect the state directory.');
}
mysqli_close($connection);
echo "DTS_INSTALL_OK\n";
