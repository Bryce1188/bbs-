param(
  [switch]$ForceImport
)

$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $false

function Require-Command($Name, $Hint) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name was not found. $Hint"
  }
}

function Get-EnvValue([string]$Path, [string]$Key) {
  if (-not (Test-Path -LiteralPath $Path)) { return $null }
  $line = Get-Content -LiteralPath $Path | Where-Object { $_ -match "^\s*$Key\s*=" } | Select-Object -First 1
  if (-not $line) { return $null }
  return ($line -split "=", 2)[1].Trim()
}

function Get-MySqlClientPath() {
  $cmd = Get-Command "mysql" -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }

  $candidates = @(
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.3\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.2\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
  )

  foreach ($item in $candidates) {
    if (Test-Path -LiteralPath $item) { return $item }
  }

  throw "mysql client was not found. Install MySQL client or add mysql.exe to PATH."
}

function Ensure-MySqlServiceStarted() {
  $services = Get-Service | Where-Object { $_.Name -like "MySQL*" -or $_.DisplayName -like "*MySQL*" }
  if (-not $services) { return $false }

  $running = $services | Where-Object { $_.Status -eq "Running" } | Select-Object -First 1
  if ($running) {
    Write-Host "MySQL service already running: $($running.Name)"
    return $true
  }

  $target = $services | Select-Object -First 1
  Write-Host "Starting MySQL service: $($target.Name)"
  Start-Service -Name $target.Name
  return $true
}

function Get-MySqlServerPath() {
  $cmd = Get-Command "mysqld" -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }

  $candidates = @(
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe",
    "C:\Program Files\MySQL\MySQL Server 8.3\bin\mysqld.exe",
    "C:\Program Files\MySQL\MySQL Server 8.2\bin\mysqld.exe",
    "C:\Program Files\MySQL\MySQL Server 8.1\bin\mysqld.exe",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"
  )

  foreach ($item in $candidates) {
    if (Test-Path -LiteralPath $item) { return $item }
  }

  return $null
}

function Try-StartMySqlDaemon() {
  $running = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($running) {
    Write-Host "mysqld process already running."
    return $true
  }

  $mysqldExe = Get-MySqlServerPath
  if (-not $mysqldExe) {
    return $false
  }

  $iniCandidates = @(
    (Join-Path $env:USERPROFILE ".codex\memories\mysql-bbs.ini"),
    (Join-Path $projectRoot "mysql\mysql-bbs.ini")
  )
  $iniPath = $iniCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

  if ($iniPath) {
    Write-Host "Starting mysqld with config: $iniPath"
    Start-Process -FilePath $mysqldExe -ArgumentList "--defaults-file=$iniPath", "--console" -WindowStyle Hidden
  } else {
    Write-Host "Starting mysqld without custom config."
    Start-Process -FilePath $mysqldExe -ArgumentList "--console" -WindowStyle Hidden
  }

  Start-Sleep -Seconds 2
  return $true
}

function Wait-ForMySql([string]$MySqlExe, [string]$DbHost, [string]$DbPort, [string]$DbUser, [string]$DbPassword) {
  $env:MYSQL_PWD = $DbPassword
  $tries = 25
  for ($i = 1; $i -le $tries; $i++) {
    try {
      & $MySqlExe --host=$DbHost --port=$DbPort --user=$DbUser -e "select 1;" 2>$null | Out-Null
    } catch {
      $global:LASTEXITCODE = 1
    }
    if ($LASTEXITCODE -eq 0) {
      Write-Host "MySQL is ready."
      return
    }
    Start-Sleep -Milliseconds 800
  }
  throw "Cannot connect to MySQL at ${DbHost}:${DbPort} with user '$DbUser'."
}

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location -LiteralPath $projectRoot

Require-Command "node" "Install Node.js 20 or newer."
Require-Command "npm" "Install Node.js 20 or newer."

if (-not (Test-Path -LiteralPath ".env.local")) {
  if (Test-Path -LiteralPath ".env.example") {
    Copy-Item -LiteralPath ".env.example" -Destination ".env.local"
    Write-Host "Created .env.local from .env.example"
  } else {
    throw ".env.local and .env.example are both missing."
  }
}

$dbHost = Get-EnvValue ".env.local" "MYSQL_HOST"
$dbPort = Get-EnvValue ".env.local" "MYSQL_PORT"
$dbUser = Get-EnvValue ".env.local" "MYSQL_USER"
$dbPassword = Get-EnvValue ".env.local" "MYSQL_PASSWORD"
$dbName = Get-EnvValue ".env.local" "MYSQL_DATABASE"

if (-not $dbHost -or -not $dbPort -or -not $dbUser -or -not $dbPassword -or -not $dbName) {
  throw "MySQL env vars are incomplete in .env.local. Required: MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE."
}

$mysqlExe = Get-MySqlClientPath
$env:MYSQL_PWD = $dbPassword
$startedByService = Ensure-MySqlServiceStarted
try {
  Wait-ForMySql -MySqlExe $mysqlExe -DbHost $dbHost -DbPort $dbPort -DbUser $dbUser -DbPassword $dbPassword
} catch {
  if (-not $startedByService) {
    $startedByDaemon = Try-StartMySqlDaemon
    if ($startedByDaemon) {
      Wait-ForMySql -MySqlExe $mysqlExe -DbHost $dbHost -DbPort $dbPort -DbUser $dbUser -DbPassword $dbPassword
    } else {
      throw "MySQL is not running, and no Windows service or mysqld executable was found. Start MySQL first, then rerun npm run start:all."
    }
  } else {
    throw
  }
}

$needsImport = $ForceImport.IsPresent
if (-not $needsImport) {
  $result = & $mysqlExe --host=$dbHost --port=$dbPort --user=$dbUser -N -B -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$dbName' AND table_name='users_auth';"
  $needsImport = ($LASTEXITCODE -ne 0) -or ($result -ne "1")
}

if ($needsImport) {
  $schemaFile = (Resolve-Path "mysql/bbs_mysql_all.sql").Path
  $seedFile = (Resolve-Path "mysql/seed_restore_data.sql").Path

  Write-Host "Importing mysql/bbs_mysql_all.sql (schema, force mode) ..."
  $schemaImportCmd = "`"$mysqlExe`" --default-character-set=utf8mb4 --force --host=$dbHost --port=$dbPort --user=$dbUser < `"$schemaFile`""
  cmd /c $schemaImportCmd
  Write-Host "Importing mysql/seed_restore_data.sql ..."
  $seedImportCmd = "`"$mysqlExe`" --default-character-set=utf8mb4 --host=$dbHost --port=$dbPort --user=$dbUser < `"$seedFile`""
  cmd /c $seedImportCmd
  if ($LASTEXITCODE -ne 0) {
    throw "SQL import failed."
  }
  Write-Host "SQL import completed."
} else {
  Write-Host "Database schema already exists. Skip SQL import."
}

if (-not (Test-Path -LiteralPath "node_modules")) {
  Write-Host "Installing npm dependencies ..."
  npm install
}

$port = 3000
$listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($listeners) {
  $listeners | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object {
    Write-Host "Stopping existing process on port ${port}: $_"
    Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
  }
  Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "Starting app on http://localhost:3000 ..."
npm run dev
