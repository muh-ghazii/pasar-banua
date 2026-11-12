<?php

namespace App\Models;

use App\Support\Media;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 'product_id', 'product_name', 'product_image', 'unit_price', 'quantity', 'subtotal',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['unit_price' => 'integer', 'quantity' => 'integer', 'subtotal' => 'integer'];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function imageUrl(): ?string
    {
        return Media::url($this->product_image);
    }
}
