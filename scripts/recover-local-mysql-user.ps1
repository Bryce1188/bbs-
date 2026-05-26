param(
  [string]$ServiceName = "MySQL84",
  [string]$MySqlBin = "C:\Program Files\MySQL\MySQL Server 8.4\bin",
  [string]$DefaultsFile = "C:\ProgramData\MySQL\MySQL Server 8.0\my.ini",
  [string]$Database = "bbs_course",
  [string]$AppUser = "bbs_app",
  [string]$AppPassword = "xzr1234567"
)

$ErrorActionPreference = "Stop"

Write-Host "Stopping $ServiceName..."
Stop-Service $ServiceName

$mysqld = Join-Path $MySqlBin "mysqld.exe"
$mysql = Join-Path $MySqlBin "mysql.exe"
$sql = @"
flush privileges;
create database if not exists $Database default character set utf8mb4 collate utf8mb4_unicode_ci;
create user if not exists '$AppUser'@'localhost' identified by '$AppPassword';
grant all privileges on $Database.* to '$AppUser'@'localhost';
flush privileges;
"@

Write-Host "Starting temporary MySQL with --skip-grant-tables..."
$temp = Start-Process -FilePath $mysqld -ArgumentList @("--defaults-file=$DefaultsFile", "--skip-grant-tables", "--console") -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 6

try {
  $sql | & $mysql --user=root --skip-password
}
finally {
  Write-Host "Stopping temporary MySQL..."
  Stop-Process -Id $temp.Id -Force -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 3
  Write-Host "Starting $ServiceName..."
  Start-Service $ServiceName
}

Write-Host "Created local MySQL user $AppUser and database $Database."
