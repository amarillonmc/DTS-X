<?php
// Transport behavior previously supplied by the daemon's socket envelope.
function dtsx_import_room_input(&$input) {
    $room = isset($_POST['game_roomid']) ? $_POST['game_roomid'] : ($_COOKIE['game_roomid'] ?? '');
    if (is_scalar($room) && (string) $room !== '') $input['___GAME_ROOMID'] = (string) $room;
}

// The legacy game error handler consumes filesystem warnings. Capture the exact
// fopen failure for the private server log, while restoring that handler before
// returning to the engine. No retries or discarded template failures.
function dtsx_open_template_cache($file) {
    $warning = null;
    set_error_handler(function($type, $message) use (&$warning) { $warning = array('type'=>$type, 'message'=>$message); });
    try { $stream = fopen($file, 'w'); }
    finally { restore_error_handler(); }
    if ($stream === false) throw new RuntimeException('Cannot write template cache: '.$file.'; '.json_encode($warning));
    return $stream;
}

// The remote replay protocol intentionally permits anonymous retrieval, but all
// its filenames and server identifiers refer to one directory entry only.
function dtsx_replay_component($value, $extension = '') {
    if (!is_string($value) || $value === '' || $value === '.' || $value === '..' ||
        preg_match('/[\x00-\x1f\x7f\/\\\\:]/', $value) || preg_match('/[. ]$/', $value)) return false;
    return $extension === '' || substr($value, -strlen($extension)) === $extension;
}

function dtsx_validate_replay_request() {
    $cmd = $_POST['cmd'] ?? '';
    $valid = is_string($cmd) && in_array($cmd, array('storage_req', 'loadrep', 'checkdatalib', 'loaddatalib', 'storage_callback', 'storage_callback_datalib'), true);
    if ($valid && in_array($cmd, array('storage_req', 'loadrep', 'checkdatalib', 'loaddatalib'), true))
        $valid = dtsx_replay_component($_POST['sign'] ?? null);
    if ($valid && in_array($cmd, array('storage_req', 'loadrep', 'checkdatalib', 'storage_callback'), true))
        $valid = dtsx_replay_component($_POST['filename'] ?? null, '.dat');
    if ($valid && $cmd === 'loaddatalib') $valid = dtsx_replay_component($_POST['filename'] ?? null, '.js');
    if ($valid && ($cmd === 'storage_callback_datalib' || ($cmd === 'storage_req' && !empty($_POST['datalibname']))))
        $valid = dtsx_replay_component($_POST['datalibname'] ?? null, '.js');
    if (!$valid) { http_response_code(400); exit('Invalid replay request'); }
}
