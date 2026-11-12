<?php

namespace App\Enums;

enum Role: string
{
    case Customer = 'customer';
    case Seller = 'seller';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Customer => 'Pembeli',
            self::Seller => 'Pelaku UMKM',
            self::Admin => 'Admin',
        };
    }

    /**
     * Halaman awal setelah login untuk masing-masing role.
     */
    public function homePath(): string
    {
        return match ($this) {
            self::Customer => '/',
            self::Seller => '/seller',
            self::Admin => '/admin',
        };
    }
}
