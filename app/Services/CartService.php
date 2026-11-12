<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Contracts\Session\Session;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

/**
 * Keranjang tersimpan di database.
 * - Pengguna login: keranjang terikat ke user_id.
 * - Tamu: keranjang terikat ke token acak yang disimpan di session.
 * Saat login, keranjang tamu digabung ke keranjang pengguna.
 */
class CartService
{
    private const SESSION_KEY = 'pasarbanua.cart_token';

    private ?Cart $resolved = null;

    /** Pemilik keranjang yang sedang di-cache (id user, atau 'guest'). */
    private int|string|null $resolvedFor = null;

    public function __construct(private readonly Session $session) {}

    public function current(?User $user, bool $create = false): ?Cart
    {
        $owner = $user?->id ?? 'guest';

        if ($this->resolved && $this->resolvedFor === $owner && ($create || $this->resolved->exists)) {
            return $this->resolved;
        }

        $this->resolvedFor = $owner;

        if ($user) {
            $cart = $create
                ? Cart::firstOrCreate(['user_id' => $user->id])
                : Cart::where('user_id', $user->id)->first();
        } else {
            $token = $this->session->get(self::SESSION_KEY);
            $cart = $token ? Cart::where('token', $token)->whereNull('user_id')->first() : null;

            if (! $cart && $create) {
                $token = Str::random(40);
                $cart = Cart::create(['token' => $token]);
                $this->session->put(self::SESSION_KEY, $token);
            }
        }

        return $this->resolved = $cart;
    }

    public function add(?User $user, Product $product, int $quantity): CartItem
    {
        $this->assertPurchasable($product);

        return DB::transaction(function () use ($user, $product, $quantity) {
            $cart = $this->current($user, create: true);

            $item = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $product->id)
                ->lockForUpdate()
                ->first();

            $newQuantity = min(($item?->quantity ?? 0) + max($quantity, 1), $product->stock);

            if ($item) {
                $item->update(['quantity' => $newQuantity]);
            } else {
                $item = CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $product->id,
                    'quantity' => $newQuantity,
                ]);
            }

            $cart->touch();

            return $item;
        });
    }

    public function updateQuantity(CartItem $item, int $quantity): CartItem
    {
        $product = $item->product;

        if (! $product || ! $product->isPublished() || $product->stock < 1) {
            throw new InvalidArgumentException('Produk ini sedang tidak tersedia.');
        }

        $item->update(['quantity' => max(1, min($quantity, $product->stock))]);

        return $item;
    }

    public function remove(CartItem $item): void
    {
        $item->delete();
    }

    /**
     * Gabungkan keranjang tamu (jika ada) ke keranjang pengguna yang baru login.
     */
    public function mergeGuestCart(User $user): void
    {
        $token = $this->session->get(self::SESSION_KEY);

        if (! $token) {
            return;
        }

        $guest = Cart::where('token', $token)->whereNull('user_id')->with('items')->first();

        if ($guest) {
            DB::transaction(function () use ($guest, $user) {
                $target = Cart::firstOrCreate(['user_id' => $user->id]);

                foreach ($guest->items as $guestItem) {
                    $product = Product::published()->find($guestItem->product_id);

                    if (! $product || $product->stock < 1) {
                        continue;
                    }

                    $existing = CartItem::where('cart_id', $target->id)
                        ->where('product_id', $guestItem->product_id)
                        ->first();

                    $quantity = min(($existing?->quantity ?? 0) + $guestItem->quantity, $product->stock);

                    CartItem::updateOrCreate(
                        ['cart_id' => $target->id, 'product_id' => $guestItem->product_id],
                        ['quantity' => $quantity],
                    );
                }

                $guest->delete();
            });
        }

        $this->session->forget(self::SESSION_KEY);
        $this->resolved = null;
    }

    public function clear(Cart $cart): void
    {
        $cart->items()->delete();
    }

    /**
     * Jumlah total unit di keranjang (untuk badge navbar).
     */
    public function count(?User $user): int
    {
        $cart = $this->current($user);

        return $cart ? (int) $cart->items()->sum('quantity') : 0;
    }

    /**
     * Ringkasan keranjang yang dihitung di backend, dikelompokkan per UMKM.
     * Kuantitas otomatis dibatasi stok terkini.
     *
     * @return array{groups: array<int, array<string, mixed>>, items_count: int, subtotal: int, shipping_fee: int, total: int, has_issues: bool}
     */
    public function summary(?User $user): array
    {
        $cart = $this->current($user);

        /** @var Collection<int, CartItem> $items */
        $items = $cart
            ? $cart->items()->with(['product.umkm', 'product.images', 'product.category'])->get()
            : collect();

        $groups = [];
        $subtotal = 0;
        $shippingTotal = 0;
        $count = 0;
        $hasIssues = false;
        $shippingFlat = (int) config('pasarbanua.shipping_flat');

        foreach ($items as $item) {
            $product = $item->product;

            if (! $product || ! $product->isPublished()) {
                $item->delete();

                continue;
            }

            $available = $product->stock >= 1;
            $quantity = $available ? min($item->quantity, $product->stock) : $item->quantity;
            $issue = null;

            if (! $available) {
                $issue = 'Stok habis';
                $hasIssues = true;
            } elseif ($quantity !== $item->quantity) {
                $issue = "Stok tersisa {$product->stock}";
                $item->update(['quantity' => $quantity]);
            }

            $lineTotal = $available ? $product->price * $quantity : 0;
            $umkm = $product->umkm;

            $groups[$umkm->id] ??= [
                'umkm' => ['id' => $umkm->id, 'name' => $umkm->name, 'slug' => $umkm->slug, 'city' => $umkm->city],
                'items' => [],
                'subtotal' => 0,
                'shipping_fee' => $shippingFlat,
            ];

            $groups[$umkm->id]['items'][] = [
                'id' => $item->id,
                'quantity' => $quantity,
                'line_total' => $lineTotal,
                'issue' => $issue,
                'available' => $available,
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->price,
                    'stock' => $product->stock,
                    'image_url' => $product->images->first()?->url(),
                    'category' => $product->category?->name,
                    'category_slug' => $product->category?->slug,
                ],
            ];

            $groups[$umkm->id]['subtotal'] += $lineTotal;

            if ($available) {
                $subtotal += $lineTotal;
                $count += $quantity;
            }
        }

        foreach ($groups as $key => $group) {
            if ($group['subtotal'] === 0) {
                $groups[$key]['shipping_fee'] = 0;

                continue;
            }

            $shippingTotal += $group['shipping_fee'];
        }

        return [
            'groups' => array_values($groups),
            'items_count' => $count,
            'subtotal' => $subtotal,
            'shipping_fee' => $shippingTotal,
            'total' => $subtotal + $shippingTotal,
            'has_issues' => $hasIssues,
        ];
    }

    private function assertPurchasable(Product $product): void
    {
        if (! $product->isPublished()) {
            throw new InvalidArgumentException('Produk ini belum tersedia untuk dibeli.');
        }

        if ($product->stock < 1) {
            throw new InvalidArgumentException('Maaf, stok produk ini sedang habis.');
        }
    }
}
