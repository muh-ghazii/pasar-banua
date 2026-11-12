<?php

namespace App\Models;

use App\Enums\UmkmStatus;
use App\Support\Media;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UmkmProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'slug', 'tagline', 'description', 'story', 'city', 'address',
        'phone', 'whatsapp', 'instagram', 'logo_path', 'cover_path', 'status',
        'verified_at', 'rejection_reason', 'is_demo',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => UmkmStatus::class,
            'verified_at' => 'datetime',
            'is_demo' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('status', UmkmStatus::Approved);
    }

    public function isApproved(): bool
    {
        return $this->status === UmkmStatus::Approved;
    }

    public function logoUrl(): ?string
    {
        return Media::url($this->logo_path);
    }

    public function coverUrl(): ?string
    {
        return Media::url($this->cover_path);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
