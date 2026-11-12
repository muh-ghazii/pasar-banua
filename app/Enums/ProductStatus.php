<?php

namespace App\Enums;

/**
 * Status kurasi produk oleh admin.
 */
enum ProductStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Menunggu kurasi',
            self::Approved => 'Disetujui',
            self::Rejected => 'Ditolak',
        };
    }
}
