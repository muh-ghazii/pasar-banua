#!/bin/sh
set -e

# Render (dan PaaS lain) memberi port lewat $PORT.
PORT="${PORT:-8080}"
sed -ri "s/Listen [0-9]+/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:[0-9]+>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

# Sertifikat CA database (opsional, mis. Aiven) dapat diberikan sebagai isi PEM.
if [ -n "$DB_SSL_CA_PEM" ]; then
    printf '%s\n' "$DB_SSL_CA_PEM" > /tmp/db-ca.pem
    export MYSQL_ATTR_SSL_CA=/tmp/db-ca.pem
fi

# APP_KEY boleh berupa string acak apa pun (mis. dari tombol "Generate" Render);
# diturunkan menjadi kunci 32 byte format Laravel.
case "$APP_KEY" in
    base64:*) ;;
    "") echo "APP_KEY belum diisi" >&2; exit 1 ;;
    *) APP_KEY="base64:$(php -r 'echo base64_encode(hash("sha256", getenv("APP_KEY"), true));')"; export APP_KEY ;;
esac

php artisan storage:link --force >/dev/null 2>&1 || true
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Migrasi aman dijalankan berulang. Seeder hanya membuat data bila belum ada.
php artisan migrate --force
php artisan db:seed --force

chown -R www-data:www-data storage bootstrap/cache

exec "$@"
