param(
  [string]$Host = "127.0.0.1",
  [int]$Port = 3306,
  [string]$User = "root",
  [string]$Password = "123456",
  [string]$Database = "bbs_mysql",
  [switch]$SkipImport
)

$ErrorActionPreference = "Stop"

function Require-Command($Name, $Hint) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name was not found. $Hint"
  }
}

Require-Command "node" "Install Node.js 20 or newer."
Require-Command "npm" "Install Node.js 20 or newer."
Require-Command "mysql" "Install MySQL client and ensure mysql is in PATH."
$mysqlExe = (Get-Command "mysql" -ErrorAction Stop).Source

npm install

$sessionSecret = [Guid]::NewGuid().ToString("N") + [Guid]::NewGuid().ToString("N")
$envLocal = @"
MYSQL_HOST=$Host
MYSQL_PORT=$Port
MYSQL_USER=$User
MYSQL_PASSWORD=$Password
MYSQL_DATABASE=$Database

SESSION_SECRET=$sessionSecret
SESSION_TTL_HOURS=72

NEXT_PUBLIC_SITE_URL=http://localhost:3000
"@

Set-Content -LiteralPath ".env.local" -Value $envLocal -Encoding UTF8

if (-not $SkipImport) {
  $schemaFile = (Resolve-Path "mysql/bbs_mysql_all.sql").Path
  $seedFile = (Resolve-Path "mysql/seed_restore_data.sql").Path

  Write-Host "Importing mysql/bbs_mysql_all.sql (schema, force mode) ..."
  $schemaImportCmd = "`"$mysqlExe`" --default-character-set=utf8mb4 --force -h $Host -P $Port -u $User --password=$Password < `"$schemaFile`""
  cmd /c $schemaImportCmd
  Write-Host "Importing mysql/seed_restore_data.sql ..."
  $seedImportCmd = "`"$mysqlExe`" --default-character-set=utf8mb4 -h $Host -P $Port -u $User --password=$Password < `"$seedFile`""
  cmd /c $seedImportCmd
}

Write-Host ""
Write-Host "MySQL local setup done."
Write-Host "Start app: npm run dev"
