#!/bin/sh
set -e

# Berjalan sebagai root (Render/Docker biasa) maupun non-root (Hugging Face, UID 1000).

# Port dari platform ($PORT); pengaturan Apache sudah dibuat dapat ditulis saat build.
PORT="${PORT:-8080}"
sed -ri "s/Listen [0-9]+/Listen ${PORT}/" /etc/apache2/ports.conf 2>/dev/null || true
sed -ri "s/<VirtualHost \*:[0-9]+>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf 2>/dev/null || true

# APP_KEY boleh berupa string acak apa pun (mis. dari tombol "Generate");
# diturunkan menjadi kunci 32 byte format Laravel.
case "$APP_KEY" in
    base64:*) ;;
    "") echo "APP_KEY belum diisi" >&2; exit 1 ;;
    *) APP_KEY="base64:$(php -r 'echo base64_encode(hash("sha256", getenv("APP_KEY"), true));')"; export APP_KEY ;;
esac

# Sertifikat CA database (opsional, mis. Aiven) dapat diberikan sebagai isi PEM.
if [ -n "$DB_SSL_CA_PEM" ]; then
    printf '%s\n' "$DB_SSL_CA_PEM" > /tmp/db-ca.pem
    export MYSQL_ATTR_SSL_CA=/tmp/db-ca.pem
fi

# MySQL dipilih tetapi password belum diisi: pakai SQLite sementara agar situs tetap jalan.
if [ "$DB_CONNECTION" = "mysql" ] && [ -z "$DB_PASSWORD" ]; then
    echo "DB_PASSWORD kosong; memakai SQLite sementara." >&2
    DB_CONNECTION=sqlite
    DB_DATABASE=""
    export DB_CONNECTION DB_DATABASE
fi

# Mode tanpa server database: SQLite di dalam container (data kembali ke demo
# setiap container dibuat ulang). Untuk data permanen pakai DB_CONNECTION=mysql.
if [ "$DB_CONNECTION" = "sqlite" ]; then
    DB_DATABASE="${DB_DATABASE:-/var/www/html/database/database.sqlite}"
    export DB_DATABASE
    touch "$DB_DATABASE"
    chown www-data:www-data "$DB_DATABASE" "$(dirname "$DB_DATABASE")" 2>/dev/null || true
fi

php artisan storage:link --force >/dev/null 2>&1 || true
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Migrasi aman dijalankan berulang. Seeder hanya membuat data bila belum ada.
php artisan migrate --force
php artisan db:seed --force

chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

exec "$@"
