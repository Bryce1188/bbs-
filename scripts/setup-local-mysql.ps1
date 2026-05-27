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
  Write-Host "Importing mysql/bbs_mysql_all.sql ..."
  Get-Content -Raw "mysql/bbs_mysql_all.sql" | mysql -h $Host -P $Port -u $User --password=$Password
}

Write-Host ""
Write-Host "MySQL local setup done."
Write-Host "Start app: npm run dev"
