<?php

namespace App\Policies;

use App\Models\UmkmProfile;
use App\Models\User;

class UmkmProfilePolicy
{
    public function update(User $user, UmkmProfile $profile): bool
    {
        return $user->isAdmin() || ($user->isSeller() && $profile->user_id === $user->id);
    }
}
