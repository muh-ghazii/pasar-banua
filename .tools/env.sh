#!/usr/bin/env bash
# Environment pengembangan lokal (Git Bash di Windows).
# Pakai:  . ./.tools/env.sh && php artisan about
export PHPRC="G:/Pasar Banua/.tools"
export PATH="/c/Users/lenovo/.config/herd/bin/php83:/c/Users/lenovo/.config/herd/bin:$PATH"
composer() { php /c/Users/lenovo/.config/herd/bin/composer.phar "$@"; }
export -f composer
