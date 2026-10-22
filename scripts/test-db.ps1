param([ValidateSet('start', 'stop', 'status')][string]$Action = 'start')

# Local integration fixture only. Never registers a service or uses port 3306.
# Official archive: https://dlm.mariadb.com/4801422/MariaDB/mariadb-11.4.13/winx64-packages/mariadb-11.4.13-winx64.zip
# SHA256: d62986d433eeebfde218560b276103831604a61e929e87f1a17f5aebd80257e2
$ErrorActionPreference = 'Stop'
$dtsxRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$dtsxVar = Join-Path $dtsxRoot 'var'
$dtsxData = Join-Path $dtsxVar 'test-db'
$dtsxBin = Join-Path $dtsxVar 'tools/mariadb-11.4.13-winx64/bin'
$dtsxCredentialsFile = Join-Path $dtsxVar 'test-db-credentials.json'
$dtsxClientFile = Join-Path $dtsxVar 'test-db-client.ini'
$dtsxPort = 33317

if (!(Test-Path -LiteralPath (Join-Path $dtsxBin 'mariadbd.exe'))) {
    throw 'Download and checksum-verify the documented MariaDB archive, then extract it under var/tools.'
}

function Test-DtsxPort {
    $dtsxProbe = [Net.Sockets.TcpClient]::new()
    try {
        $dtsxConnect = $dtsxProbe.ConnectAsync('127.0.0.1', $dtsxPort)
        if (!$dtsxConnect.Wait(500)) { return $false }
        return $dtsxProbe.Connected
    } catch { return $false } finally { $dtsxProbe.Dispose() }
}

if ($Action -eq 'status') {
    @{ running = (Test-DtsxPort); host = '127.0.0.1'; port = $dtsxPort; credentialsFile = $dtsxCredentialsFile } | ConvertTo-Json
    exit
}
if ($Action -eq 'stop') {
    if (!(Test-Path -LiteralPath $dtsxClientFile)) { throw 'No fixture client configuration exists.' }
    $dtsxStopData = & (Join-Path $dtsxBin 'mariadb.exe') "--defaults-file=$dtsxClientFile" '--batch' '--skip-column-names' '-e' 'SELECT @@datadir'
    if ($LASTEXITCODE -ne 0) { throw 'Cannot verify fixture identity; refusing shutdown.' }
    if ([IO.Path]::GetFullPath($dtsxStopData.Trim().TrimEnd('/','\')) -ne [IO.Path]::GetFullPath($dtsxData)) {
        throw 'Listener belongs to a different data directory; refusing shutdown.'
    }
    & (Join-Path $dtsxBin 'mariadb-admin.exe') "--defaults-file=$dtsxClientFile" shutdown
    if ($LASTEXITCODE -ne 0) { throw 'Fixture shutdown failed.' }
    Write-Output 'DTS-X integration database stopped.'
    exit
}

New-Item -ItemType Directory -Force -Path $dtsxVar | Out-Null
if (Test-Path -LiteralPath $dtsxCredentialsFile) {
    $dtsxCredentials = Get-Content -Raw -LiteralPath $dtsxCredentialsFile | ConvertFrom-Json
    if ($dtsxCredentials.port -ne $dtsxPort -or $dtsxCredentials.host -ne '127.0.0.1' -or $dtsxCredentials.database -ne 'dtsx_test') {
        throw 'Unexpected existing fixture credentials; refusing to reuse them.'
    }
} else {
    if (Test-DtsxPort) { throw 'Fixture port is occupied; no changes were made to the listener.' }
    $dtsxRandom = [byte[]]::new(32)
    [Security.Cryptography.RandomNumberGenerator]::Fill($dtsxRandom)
    $dtsxSecret = [Convert]::ToHexString($dtsxRandom).ToLowerInvariant()
    $dtsxCredentials = [pscustomobject]@{
        host = '127.0.0.1'; port = $dtsxPort; user = 'root'; password = $dtsxSecret
        database = 'dtsx_test'; version = '11.4.13'; dataDir = $dtsxData
    }
    $dtsxCredentials | ConvertTo-Json | Set-Content -LiteralPath $dtsxCredentialsFile -Encoding utf8NoBOM
}

@"
[client]
host=127.0.0.1
port=$dtsxPort
protocol=tcp
skip-ssl
user=root
password=$($dtsxCredentials.password)
"@ | Set-Content -LiteralPath $dtsxClientFile -Encoding utf8NoBOM

if (!(Test-Path -LiteralPath (Join-Path $dtsxData 'mysql'))) {
    if (Test-DtsxPort) { throw 'Fixture port is occupied; refusing initialization.' }
    $dtsxInitArgs = @("--datadir=$dtsxData", "--port=$dtsxPort", "--password=$($dtsxCredentials.password)", '--silent')
    $dtsxInit = Start-Process -FilePath (Join-Path $dtsxBin 'mariadb-install-db.exe') -ArgumentList $dtsxInitArgs -WindowStyle Hidden -Wait -PassThru -RedirectStandardOutput (Join-Path $dtsxVar 'test-db-init.stdout.log') -RedirectStandardError (Join-Path $dtsxVar 'test-db-init.stderr.log')
    if ($dtsxInit.ExitCode -ne 0) { throw 'Database fixture initialization failed; inspect var/test-db-init.*.log.' }
}

if (!(Test-DtsxPort)) {
    $dtsxUnixData = $dtsxData.Replace('\', '/')
    $dtsxBasedir = (Split-Path -Parent $dtsxBin).Replace('\', '/')
    $dtsxIni = Join-Path $dtsxData 'my.ini'
@"
[mariadbd]
basedir=$dtsxBasedir
datadir=$dtsxUnixData
port=$dtsxPort
bind-address=127.0.0.1
skip-log-bin
log-error=$dtsxUnixData/server-error.log
pid-file=$dtsxUnixData/server.pid
character-set-server=utf8mb3
collation-server=utf8mb3_general_ci
innodb_buffer_pool_size=64M
max_connections=40
"@ | Set-Content -LiteralPath $dtsxIni -Encoding utf8NoBOM
    $dtsxServer = Start-Process -FilePath (Join-Path $dtsxBin 'mariadbd.exe') -ArgumentList @("--defaults-file=$dtsxIni", '--console') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $dtsxVar 'test-db.stdout.log') -RedirectStandardError (Join-Path $dtsxVar 'test-db.stderr.log')
    $dtsxServer.Id | Set-Content -LiteralPath (Join-Path $dtsxVar 'test-db-process.pid') -Encoding ascii
    $dtsxDeadline = [DateTime]::UtcNow.AddSeconds(25)
    while (!(Test-DtsxPort) -and [DateTime]::UtcNow -lt $dtsxDeadline) {
        if ($dtsxServer.HasExited) { throw 'Database fixture exited; inspect var/test-db.stderr.log.' }
        Start-Sleep -Milliseconds 250
    }
}
if (!(Test-DtsxPort)) { throw 'Database fixture did not become ready.' }

# Confirm the listening server really belongs to this fixture before any writes.
$dtsxActualData = & (Join-Path $dtsxBin 'mariadb.exe') "--defaults-file=$dtsxClientFile" '--batch' '--skip-column-names' '-e' 'SELECT @@datadir'
if ($LASTEXITCODE -ne 0) { throw 'Fixture authentication failed.' }
if ([IO.Path]::GetFullPath($dtsxActualData.Trim().TrimEnd('/','\')) -ne [IO.Path]::GetFullPath($dtsxData)) {
    throw 'Port belongs to a different database directory; refusing to write.'
}
& (Join-Path $dtsxBin 'mariadb.exe') "--defaults-file=$dtsxClientFile" '-e' 'CREATE DATABASE IF NOT EXISTS dtsx_test CHARACTER SET utf8 COLLATE utf8_general_ci;'
if ($LASTEXITCODE -ne 0) { throw 'Fixture database creation failed.' }
@{ running = $true; host = '127.0.0.1'; port = $dtsxPort; database = 'dtsx_test'; credentialsFile = $dtsxCredentialsFile } | ConvertTo-Json
