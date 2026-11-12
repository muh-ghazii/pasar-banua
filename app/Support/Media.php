<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class Media
{
    /**
     * Ubah path penyimpanan menjadi URL publik. Mendukung URL absolut
     * (mis. aset eksternal) dan path pada disk yang dikonfigurasi,
     * sehingga mudah dipindah ke object storage.
     */
    public static function url(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, '/')) {
            return $path;
        }

        return Storage::disk(config('pasarbanua.uploads.disk'))->url($path);
    }
}
