<?php

namespace App\Models;

use App\Enums\Role;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Role $role
 * @property string|null $phone
 * @property bool $is_active
 * @property bool $is_demo
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'phone'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Nilai bawaan pada model (selaras dengan default kolom di database) agar
     * instance yang baru dibuat langsung dianggap aktif, mis. saat registrasi.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'role' => 'customer',
        'is_active' => true,
        'is_demo' => false,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => Role::class,
            'is_active' => 'boolean',
            'is_demo' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === Role::Admin;
    }

    public function isSeller(): bool
    {
        return $this->role === Role::Seller;
    }

    public function isCustomer(): bool
    {
        return $this->role === Role::Customer;
    }

    public function umkmProfile(): HasOne
    {
        return $this->hasOne(UmkmProfile::class);
    }

    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function completedTrainings(): BelongsToMany
    {
        return $this->belongsToMany(TrainingMaterial::class, 'training_progress')
            ->withPivot('completed_at')
            ->withTimestamps();
    }
}
