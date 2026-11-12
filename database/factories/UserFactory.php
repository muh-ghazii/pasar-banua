<?php

namespace Database\Factories;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'phone' => '08'.fake()->numerify('##########'),
            'remember_token' => Str::random(10),
        ];
    }

    public function configure(): static
    {
        // `role` tidak mass-assignable; set lewat afterMaking.
        return $this->afterMaking(function (User $user): void {
            $user->role ??= Role::Customer;
        });
    }

    public function role(Role $role): static
    {
        return $this->afterMaking(fn (User $user) => $user->role = $role);
    }

    public function admin(): static
    {
        return $this->role(Role::Admin);
    }

    public function seller(): static
    {
        return $this->role(Role::Seller);
    }

    public function inactive(): static
    {
        return $this->afterMaking(fn (User $user) => $user->is_active = false);
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
