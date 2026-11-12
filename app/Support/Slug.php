<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Slug
{
    /**
     * Buat slug unik untuk sebuah model.
     *
     * @param  class-string<Model>  $model
     */
    public static function unique(string $model, string $value, ?int $ignoreId = null, string $column = 'slug'): string
    {
        $base = Str::slug($value) ?: 'item';
        $slug = $base;
        $i = 2;

        while (self::exists($model, $column, $slug, $ignoreId)) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }

    /**
     * @param  class-string<Model>  $model
     */
    private static function exists(string $model, string $column, string $slug, ?int $ignoreId): bool
    {
        $query = $model::query();

        if (in_array(SoftDeletes::class, class_uses_recursive($model), true)) {
            $query->withTrashed();
        }

        return $query
            ->where($column, $slug)
            ->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))
            ->exists();
    }
}
