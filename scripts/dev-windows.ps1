$ErrorActionPreference = "Stop"

$port = 3000
$listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

if ($listeners) {
  $listeners |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object {
      Write-Host "Stopping existing process on port ${port}: $_"
      Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
  Start-Sleep -Seconds 2
}

if (-not (Test-Path -LiteralPath ".env.local")) {
  Copy-Item -LiteralPath ".env.example" -Destination ".env.local"
}

if (-not (Test-Path -LiteralPath "node_modules")) {
  npm install
}

npm run dev
