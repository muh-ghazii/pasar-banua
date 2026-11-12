<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Shipped = 'shipped';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Menunggu konfirmasi',
            self::Processing => 'Diproses',
            self::Shipped => 'Dikirim',
            self::Completed => 'Selesai',
            self::Cancelled => 'Dibatalkan',
        };
    }

    /**
     * Status yang boleh dituju oleh penjual dari status ini.
     *
     * @return array<int, self>
     */
    public function sellerTransitions(): array
    {
        return match ($this) {
            self::Pending => [self::Processing, self::Cancelled],
            self::Processing => [self::Shipped, self::Cancelled],
            self::Shipped => [self::Completed],
            default => [],
        };
    }

    public function isFinal(): bool
    {
        return in_array($this, [self::Completed, self::Cancelled], true);
    }

    /**
     * Pesanan yang masih aktif menahan stok.
     */
    public function holdsStock(): bool
    {
        return $this !== self::Cancelled;
    }
}
