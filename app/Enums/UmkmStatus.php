<?php

namespace App\Enums;

enum UmkmStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Suspended = 'suspended';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Menunggu verifikasi',
            self::Approved => 'Terverifikasi',
            self::Rejected => 'Ditolak',
            self::Suspended => 'Dinonaktifkan',
        };
    }
}
