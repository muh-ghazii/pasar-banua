<?php

namespace App\Policies;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        return $user->isAdmin() || $this->isBuyer($user, $order) || $this->isSeller($user, $order);
    }

    /** Penjual memperbarui status sesuai alur. */
    public function updateStatus(User $user, Order $order): bool
    {
        return $this->isSeller($user, $order) && ! $order->status->isFinal();
    }

    /** Pembeli boleh membatalkan selama pesanan belum dikonfirmasi penjual. */
    public function cancel(User $user, Order $order): bool
    {
        return $this->isBuyer($user, $order) && $order->status === OrderStatus::Pending;
    }

    /** Pembeli mengonfirmasi pesanan sudah diterima. */
    public function confirmReceived(User $user, Order $order): bool
    {
        return $this->isBuyer($user, $order) && $order->status === OrderStatus::Shipped;
    }

    private function isBuyer(User $user, Order $order): bool
    {
        return $order->user_id === $user->id;
    }

    private function isSeller(User $user, Order $order): bool
    {
        return $user->isSeller()
            && $user->umkmProfile !== null
            && $user->umkmProfile->id === $order->umkm_profile_id;
    }
}
