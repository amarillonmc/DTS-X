<?php
// Injected by the embedded runtime, never served as a public endpoint.
define('DTS_NODE_RUNTIME', true);
@ini_set('display_errors', '0');
@ini_set('log_errors', '1');
@ini_set('date.timezone', 'UTC');
require_once '/runtime/replay-bridge.php';
require_once '/runtime/request-bridge.php';
