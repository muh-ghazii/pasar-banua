<?php

namespace Tests\Feature\Seller;

use App\Models\Category;
use App\Models\UmkmProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

abstract class SellerTestCase extends TestCase
{
    use RefreshDatabase;

    protected function seller(array $umkm = [], ?callable $state = null): User
    {
        $user = User::factory()->seller()->create();
        $factory = UmkmProfile::factory()->forUser($user);

        if ($state) {
            $factory = $state($factory);
        }

        $factory->create($umkm);

        return $user->fresh();
    }

    protected function category(): Category
    {
        return Category::factory()->create();
    }
}
