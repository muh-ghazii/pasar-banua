# syntax=docker/dockerfile:1
# Image produksi Pasar Banua: PHP 8.3 + Apache, aset frontend dibangun di dalam image.

# ---------- 1. Dependensi PHP ----------
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction --ignore-platform-reqs

# ---------- 2. Build aset (butuh PHP untuk plugin Wayfinder) ----------
FROM php:8.3-cli-bookworm AS assets
COPY --from=node:22-bookworm-slim /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-bookworm-slim /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm install --no-audit --no-fund
COPY . .
COPY --from=vendor /app/vendor ./vendor
RUN cp .env.example .env \
    && composer dump-autoload --no-dev --optimize --no-scripts \
    && php artisan key:generate --force \
    && npm run build \
    && rm .env

# ---------- 3. Runtime ----------
FROM php:8.3-apache-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends libzip-dev libicu-dev ca-certificates \
    && docker-php-ext-install pdo_mysql zip intl opcache \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
    && printf '<Directory /var/www/html/public>\n    AllowOverride All\n</Directory>\n' > /etc/apache2/conf-available/laravel.conf \
    && a2enconf laravel \
    && cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && printf 'upload_max_filesize=8M\npost_max_size=40M\nmemory_limit=256M\nexpose_php=Off\n' > "$PHP_INI_DIR/conf.d/pasarbanua.ini"

WORKDIR /var/www/html
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build
RUN rm -rf .tools public/hot public/storage tests node_modules \
    && composer dump-autoload --no-dev --optimize \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs storage/app/public \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod +x docker/entrypoint.sh

# Izinkan berjalan sebagai user non-root (mis. Hugging Face Spaces, UID 1000).
RUN chmod -R a+rwX storage bootstrap/cache database public \
    && chmod a+rw /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf \
    && chmod a+rwx /etc/apache2 /etc/apache2/sites-available \
    && mkdir -p /var/run/apache2 /var/lock/apache2 \
    && chmod -R a+rwX /var/run/apache2 /var/lock/apache2 /var/log/apache2

EXPOSE 8080
ENTRYPOINT ["docker/entrypoint.sh"]
CMD ["apache2-foreground"]
