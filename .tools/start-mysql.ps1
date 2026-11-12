# Menjalankan instance MySQL 8.0 lokal untuk pengembangan (port 3310) di latar belakang.
$exe = 'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe'
$ini = Join-Path $PSScriptRoot 'my.ini'
Start-Process -WindowStyle Hidden -FilePath $exe -ArgumentList @("--defaults-file=`"$ini`"")
