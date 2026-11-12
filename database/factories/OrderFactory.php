<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\UmkmProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->numberBetween(2, 40) * 5000;

        return [
            'number' => 'PB-'.now()->format('ymd').'-'.Str::upper(Str::random(5)),
            'user_id' => User::factory(),
            'umkm_profile_id' => UmkmProfile::factory(),
            'status' => OrderStatus::Pending,
            'recipient_name' => fake()->name(),
            'phone' => '08'.fake()->numerify('##########'),
            'address_line' => fake()->streetAddress(),
            'city' => 'Banjarmasin',
            'payment_method' => 'transfer_demo',
            'subtotal' => $subtotal,
            'shipping_fee' => 12000,
            'total' => $subtotal + 12000,
        ];
    }

    public function status(OrderStatus $status): static
    {
        return $this->state(['status' => $status]);
    }
}
