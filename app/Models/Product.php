<?php

namespace App\Models;

use App\Enums\ProductStatus;
use App\Enums\UmkmStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'umkm_profile_id', 'category_id', 'name', 'slug', 'summary', 'description', 'price',
        'stock', 'weight_gram', 'status', 'is_active', 'is_featured', 'rejection_reason',
        'sold_count', 'is_demo',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ProductStatus::class,
            'price' => 'integer',
            'stock' => 'integer',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_demo' => 'boolean',
        ];
    }

    public function umkm(): BelongsTo
    {
        return $this->belongsTo(UmkmProfile::class, 'umkm_profile_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order')->orderBy('id');
    }

    public function story(): HasOne
    {
        return $this->hasOne(ProductStory::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Produk yang tampil ke publik: disetujui admin, aktif, dan UMKM terverifikasi.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('products.status', ProductStatus::Approved)
            ->where('products.is_active', true)
            ->whereHas('umkm', fn (Builder $q) => $q->where('status', UmkmStatus::Approved));
    }

    /**
     * Eager load + agregat yang dibutuhkan kartu produk (mencegah N+1).
     */
    public function scopeWithCardData(Builder $query): Builder
    {
        return $query
            ->with(['images', 'category:id,name,slug,icon', 'umkm:id,name,slug,city,status'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews');
    }

    public function isPublished(): bool
    {
        return $this->status === ProductStatus::Approved
            && $this->is_active
            && $this->umkm?->status === UmkmStatus::Approved;
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
