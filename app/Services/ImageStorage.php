<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Penyimpanan gambar lewat Laravel Filesystem. Nama file asli tidak dipakai;
 * selalu diganti nama acak agar aman dari path traversal dan tabrakan nama.
 */
class ImageStorage
{
    public function store(UploadedFile $file, string $directory): string
    {
        $extension = match ($file->getMimeType()) {
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => 'jpg',
        };

        $name = Str::lower(Str::random(32)).'.'.$extension;

        return $file->storeAs(trim($directory, '/'), $name, $this->disk());
    }

    public function delete(?string $path): void
    {
        if (blank($path) || str_starts_with($path, 'http') || str_starts_with($path, '/')) {
            return;
        }

        Storage::disk($this->disk())->delete($path);
    }

    private function disk(): string
    {
        return config('pasarbanua.uploads.disk');
    }
}
