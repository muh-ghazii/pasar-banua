<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'number', 'user_id', 'umkm_profile_id', 'status', 'recipient_name', 'phone', 'address_line',
        'city', 'postal_code', 'notes', 'payment_method', 'subtotal', 'shipping_fee', 'total',
        'tracking_note', 'cancel_reason', 'processed_at', 'shipped_at', 'completed_at',
        'cancelled_at', 'is_demo',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'subtotal' => 'integer',
            'shipping_fee' => 'integer',
            'total' => 'integer',
            'processed_at' => 'datetime',
            'shipped_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'is_demo' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function umkm(): BelongsTo
    {
        return $this->belongsTo(UmkmProfile::class, 'umkm_profile_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getRouteKeyName(): string
    {
        return 'number';
    }
}
