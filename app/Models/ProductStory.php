<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductStory extends Model
{
    protected $fillable = [
        'product_id', 'title', 'body', 'process_note', 'material_note', 'cultural_note', 'is_verified',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['is_verified' => 'boolean'];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
