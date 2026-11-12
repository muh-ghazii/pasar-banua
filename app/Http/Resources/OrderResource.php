<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Format pesanan untuk pembeli, penjual, dan admin (sesuai tipe OrderData di TypeScript).
 * Eager load yang disarankan: items.product:id,slug, umkm:id,name,slug,city, user:id,name,email.
 *
 * @mixin Order
 */
class OrderResource extends JsonResource
{
    public const PAYMENT_LABELS = [
        'transfer_demo' => 'Transfer bank (demo)',
        'cod_demo' => 'Bayar di tempat / COD (demo)',
    ];

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $request->user();

        return [
            'id' => $this->id,
            'number' => $this->number,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'recipient_name' => $this->recipient_name,
            'phone' => $this->phone,
            'address_line' => $this->address_line,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'notes' => $this->notes,
            'payment_method' => $this->payment_method,
            'payment_label' => self::PAYMENT_LABELS[$this->payment_method] ?? $this->payment_method,
            'subtotal' => $this->subtotal,
            'shipping_fee' => $this->shipping_fee,
            'total' => $this->total,
            'tracking_note' => $this->tracking_note,
            'cancel_reason' => $this->cancel_reason,
            'created_at' => $this->created_at?->toIso8601String(),
            'processed_at' => $this->processed_at?->toIso8601String(),
            'shipped_at' => $this->shipped_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'is_demo' => $this->is_demo,
            'umkm' => $this->whenLoaded('umkm', fn () => $this->umkm ? [
                'name' => $this->umkm->name,
                'slug' => $this->umkm->slug,
                'city' => $this->umkm->city,
            ] : null),
            'buyer' => $this->whenLoaded('user', fn () => $this->user ? [
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'product_slug' => $item->relationLoaded('product') ? $item->product?->slug : null,
                'image_url' => $item->imageUrl(),
                'unit_price' => $item->unit_price,
                'quantity' => $item->quantity,
                'subtotal' => $item->subtotal,
            ])->all()),
            'items_count' => $this->whenCounted('items'),
            'can' => $user ? [
                'cancel' => $user->can('cancel', $this->resource),
                'confirm_received' => $user->can('confirmReceived', $this->resource),
                'update_status' => $user->can('updateStatus', $this->resource),
            ] : null,
            'next_statuses' => collect($this->status->sellerTransitions())
                ->map(fn ($s) => ['value' => $s->value, 'label' => $s->label()])
                ->all(),
        ];
    }
}
