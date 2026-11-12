<?php

namespace Database\Factories;

use App\Enums\UmkmStatus;
use App\Models\UmkmProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<UmkmProfile>
 */
class UmkmProfileFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = 'UMKM '.fake()->unique()->words(2, true);

        return [
            'user_id' => User::factory()->seller(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(4)),
            'description' => fake()->sentence(12),
            'city' => fake()->randomElement(['Banjarmasin', 'Martapura', 'Kandangan', 'Barabai', 'Amuntai']),
            'phone' => '08'.fake()->numerify('##########'),
            'status' => UmkmStatus::Approved,
            'verified_at' => now(),
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => UmkmStatus::Pending, 'verified_at' => null]);
    }

    public function rejected(): static
    {
        return $this->state(['status' => UmkmStatus::Rejected, 'verified_at' => null]);
    }

    public function forUser(User $user): static
    {
        return $this->state(['user_id' => $user->id]);
    }
}
