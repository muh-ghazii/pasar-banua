<?php

namespace App\Policies;

use App\Enums\UmkmStatus;
use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function create(User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isSeller()
            && in_array($user->umkmProfile?->status, [UmkmStatus::Pending, UmkmStatus::Approved], true);
    }

    public function update(User $user, Product $product): bool
    {
        return $user->isAdmin() || $this->owns($user, $product);
    }

    public function delete(User $user, Product $product): bool
    {
        return $this->update($user, $product);
    }

    private function owns(User $user, Product $product): bool
    {
        return $user->isSeller()
            && $user->umkmProfile !== null
            && $user->umkmProfile->id === $product->umkm_profile_id;
    }
}
