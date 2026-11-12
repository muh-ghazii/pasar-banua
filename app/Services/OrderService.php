<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Notifications\AppNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(private readonly CartService $carts) {}

    /**
     * Ubah isi keranjang menjadi pesanan (satu pesanan per UMKM).
     * Seluruh perhitungan harga, ongkir, total, dan stok dilakukan di backend
     * di dalam satu transaksi dengan penguncian baris produk.
     *
     * @param  array{recipient_name: string, phone: string, address_line: string, city?: ?string, postal_code?: ?string, notes?: ?string, payment_method: string, save_address?: bool}  $data
     * @return Collection<int, Order>
     */
    public function placeFromCart(User $user, array $data): Collection
    {
        $cart = $this->carts->current($user);

        if (! $cart || $cart->items()->doesntExist()) {
            throw ValidationException::withMessages(['cart' => 'Keranjang Anda masih kosong.']);
        }

        $orders = DB::transaction(function () use ($user, $cart, $data) {
            $items = $cart->items()->get();

            $products = Product::query()
                ->whereIn('id', $items->pluck('product_id'))
                ->with(['umkm', 'images'])
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $lines = [];

            foreach ($items as $item) {
                /** @var Product|null $product */
                $product = $products->get($item->product_id);

                if (! $product || ! $product->isPublished()) {
                    throw ValidationException::withMessages([
                        'cart' => 'Salah satu produk di keranjang sudah tidak tersedia. Silakan periksa kembali keranjang Anda.',
                    ]);
                }

                if ($product->stock < $item->quantity) {
                    throw ValidationException::withMessages([
                        'cart' => "Stok \"{$product->name}\" tidak mencukupi (tersisa {$product->stock}).",
                    ]);
                }

                $lines[$product->umkm_profile_id][] = [$product, $item->quantity];
            }

            $created = new \Illuminate\Database\Eloquent\Collection;
            $shippingFlat = (int) config('pasarbanua.shipping_flat');

            foreach ($lines as $umkmId => $group) {
                $subtotal = collect($group)->sum(fn ($line) => $line[0]->price * $line[1]);

                $order = Order::create([
                    'number' => $this->generateNumber(),
                    'user_id' => $user->id,
                    'umkm_profile_id' => $umkmId,
                    'status' => OrderStatus::Pending,
                    'recipient_name' => $data['recipient_name'],
                    'phone' => $data['phone'],
                    'address_line' => $data['address_line'],
                    'city' => $data['city'] ?? null,
                    'postal_code' => $data['postal_code'] ?? null,
                    'notes' => $data['notes'] ?? null,
                    'payment_method' => $data['payment_method'],
                    'subtotal' => $subtotal,
                    'shipping_fee' => $shippingFlat,
                    'total' => $subtotal + $shippingFlat,
                    'is_demo' => (bool) config('pasarbanua.demo'),
                ]);

                foreach ($group as [$product, $quantity]) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'product_image' => $product->images->first()?->path,
                        'unit_price' => $product->price,
                        'quantity' => $quantity,
                        'subtotal' => $product->price * $quantity,
                    ]);

                    $product->decrement('stock', $quantity);
                    $product->increment('sold_count', $quantity);
                }

                $created->push($order);
            }

            if (! empty($data['save_address'])) {
                $this->rememberAddress($user, $data);
            }

            $this->carts->clear($cart);

            return $created;
        });

        foreach ($orders as $order) {
            $order->umkm->user->notify(new AppNotification(
                'Pesanan baru masuk',
                "Pesanan {$order->number} dari {$order->recipient_name} menunggu konfirmasi.",
                "/seller/pesanan/{$order->number}",
                'success',
            ));
        }

        return $orders->load(['items', 'umkm']);
    }

    /**
     * Ubah status pesanan sesuai alur. Pembatalan mengembalikan stok.
     */
    public function transition(Order $order, OrderStatus $to, ?string $note = null, ?User $actor = null): Order
    {
        return DB::transaction(function () use ($order, $to, $note) {
            $order = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();

            if ($order->status->isFinal()) {
                throw ValidationException::withMessages(['status' => 'Pesanan ini sudah selesai diproses dan tidak dapat diubah lagi.']);
            }

            if ($order->status === $to) {
                return $order;
            }

            $attributes = ['status' => $to];

            match ($to) {
                OrderStatus::Processing => $attributes['processed_at'] = now(),
                OrderStatus::Shipped => $attributes += ['shipped_at' => now(), 'tracking_note' => $note],
                OrderStatus::Completed => $attributes['completed_at'] = now(),
                OrderStatus::Cancelled => $attributes += ['cancelled_at' => now(), 'cancel_reason' => $note],
                default => null,
            };

            if ($to === OrderStatus::Cancelled) {
                $this->restoreStock($order);
            }

            $order->update($attributes);

            $order->user->notify(new AppNotification(
                'Status pesanan diperbarui',
                "Pesanan {$order->number} kini berstatus: {$to->label()}.",
                "/akun/pesanan/{$order->number}",
                $to === OrderStatus::Cancelled ? 'danger' : 'info',
            ));

            return $order;
        });
    }

    private function restoreStock(Order $order): void
    {
        $order->load('items');

        foreach ($order->items as $item) {
            if (! $item->product_id) {
                continue;
            }

            Product::withTrashed()->whereKey($item->product_id)->lockForUpdate()->first()?->increment('stock', $item->quantity);
            Product::withTrashed()
                ->whereKey($item->product_id)
                ->where('sold_count', '>=', $item->quantity)
                ->decrement('sold_count', $item->quantity);
        }
    }

    private function generateNumber(): string
    {
        do {
            $number = 'PB-'.now()->format('ymd').'-'.Str::upper(Str::random(5));
        } while (Order::where('number', $number)->exists());

        return $number;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function rememberAddress(User $user, array $data): void
    {
        $isFirst = ! $user->addresses()->exists();

        $user->addresses()->updateOrCreate(
            ['address_line' => $data['address_line'], 'recipient_name' => $data['recipient_name']],
            [
                'phone' => $data['phone'],
                'city' => $data['city'] ?? null,
                'postal_code' => $data['postal_code'] ?? null,
                'is_default' => $isFirst,
            ],
        );
    }
}
