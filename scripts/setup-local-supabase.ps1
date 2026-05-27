param(
  [switch]$SkipDbReset
)

$ErrorActionPreference = "Stop"

function Require-Command($Name, $InstallHint) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name was not found. $InstallHint"
  }
}

Require-Command "node" "Install Node.js 20 or newer."
Require-Command "npm" "Install Node.js 20 or newer."
Require-Command "docker" "Install and start Docker Desktop first."

try {
  docker info *> $null
} catch {
  throw "Docker is installed but not running. Start Docker Desktop and wait until it is ready."
}

npm install
npx supabase start

if (-not $SkipDbReset) {
  npx supabase db reset
}

$envText = npx supabase status -o env `
  --override-name api.url=NEXT_PUBLIC_SUPABASE_URL `
  --override-name auth.anon_key=NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY `
  --override-name auth.service_role_key=SUPABASE_SERVICE_ROLE_KEY `
  --override-name db.url=DATABASE_URL

$values = @{}
foreach ($line in ($envText -split "`r?`n")) {
  if ($line -match '^([A-Z0-9_]+)=(.*)$') {
    $values[$Matches[1]] = $Matches[2].Trim('"')
  }
}

$required = @(
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL"
)

foreach ($key in $required) {
  if (-not $values.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($values[$key])) {
    throw "Could not read $key from Supabase status output."
  }
}

$envLocal = @"
NEXT_PUBLIC_SUPABASE_URL=$($values["NEXT_PUBLIC_SUPABASE_URL"])
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$($values["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"])
NEXT_PUBLIC_SITE_URL=http://localhost:3000

ADMIN_DEMO_MODE=false

SUPABASE_SERVICE_ROLE_KEY=$($values["SUPABASE_SERVICE_ROLE_KEY"])
DATABASE_URL=$($values["DATABASE_URL"])

UPLOAD_BUCKET_AVATARS=avatars
UPLOAD_BUCKET_POST_IMAGES=post-images
"@

Set-Content -LiteralPath ".env.local" -Value $envLocal -Encoding UTF8
npx supabase status

Write-Host ""
Write-Host "Local Supabase is configured. Restart the Next.js dev server with: npm run dev"
