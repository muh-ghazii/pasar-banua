<?php

namespace Database\Factories;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Product;
use App\Models\UmkmProfile;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = ucfirst(fake()->unique()->words(3, true));

        return [
            'umkm_profile_id' => UmkmProfile::factory(),
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(4)),
            'summary' => fake()->sentence(8),
            'description' => fake()->paragraph(),
            'price' => fake()->numberBetween(10, 250) * 1000,
            'stock' => fake()->numberBetween(5, 60),
            'weight_gram' => fake()->numberBetween(100, 1500),
            'status' => ProductStatus::Approved,
            'is_active' => true,
            'is_featured' => false,
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => ProductStatus::Pending]);
    }

    public function rejected(): static
    {
        return $this->state(['status' => ProductStatus::Rejected]);
    }

    public function featured(): static
    {
        return $this->state(['is_featured' => true]);
    }

    public function outOfStock(): static
    {
        return $this->state(['stock' => 0]);
    }
}
