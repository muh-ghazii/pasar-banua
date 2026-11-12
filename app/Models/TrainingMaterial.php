<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TrainingMaterial extends Model
{
    protected $fillable = [
        'title', 'slug', 'topic', 'summary', 'content', 'duration_minutes', 'sort_order', 'is_published',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['is_published' => 'boolean'];
    }

    public function completedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'training_progress')
            ->withPivot('completed_at')
            ->withTimestamps();
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
