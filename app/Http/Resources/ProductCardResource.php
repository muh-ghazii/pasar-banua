<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Format ringkas produk untuk kartu/daftar. Gunakan bersama Product::withCardData().
 *
 * @mixin Product
 */
class ProductCardResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'summary' => $this->summary,
            'price' => $this->price,
            'stock' => $this->stock,
            'sold_count' => $this->sold_count,
            'is_featured' => $this->is_featured,
            'image_url' => $this->images->first()?->url(),
            'image_alt' => $this->images->first()?->alt ?? $this->name,
            'category' => $this->category ? [
                'name' => $this->category->name,
                'slug' => $this->category->slug,
                'icon' => $this->category->icon,
            ] : null,
            'umkm' => $this->umkm ? [
                'name' => $this->umkm->name,
                'slug' => $this->umkm->slug,
                'city' => $this->umkm->city,
            ] : null,
            'rating' => $this->reviews_avg_rating !== null ? round((float) $this->reviews_avg_rating, 1) : null,
            'reviews_count' => (int) ($this->reviews_count ?? 0),
        ];
    }
}
