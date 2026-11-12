<?php

namespace Tests\Feature\Shop;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CartCheckoutTest extends TestCase
{
    use RefreshDatabase;

    private function checkoutPayload(array $overrides = []): array
    {
        return array_merge([
            'recipient_name' => 'Siti Rahmah',
            'phone' => '081234567890',
            'address_line' => 'Jl. Lambung Mangkurat No. 12, Kertak Baru',
            'city' => 'Banjarmasin',
            'postal_code' => '70111',
            'notes' => 'Titip di pos satpam',
            'payment_method' => 'transfer_demo',
        ], $overrides);
    }

    public function test_guest_cart_persists_and_merges_on_login(): void
    {
        $product = Product::factory()->create(['stock' => 10]);

        $this->post('/keranjang', ['product_id' => $product->id, 'quantity' => 2])->assertRedirect();
        $this->get('/keranjang')->assertInertia(fn (Assert $page) => $page->where('cart.items_count', 2));

        $user = User::factory()->create();
        $this->post('/login', ['email' => $user->email, 'password' => 'password']);

        $this->assertDatabaseHas('cart_items', ['product_id' => $product->id, 'quantity' => 2]);
        $this->assertSame(2, (int) $user->cart()->first()?->items()->sum('quantity'));
    }

    public function test_cart_quantity_is_capped_by_stock(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock' => 3]);

        $this->actingAs($user)->post('/keranjang', ['product_id' => $product->id, 'quantity' => 10]);

        $this->assertDatabaseHas('cart_items', ['product_id' => $product->id, 'quantity' => 3]);
    }

    public function test_cannot_add_unpublished_or_sold_out_product(): void
    {
        $user = User::factory()->create();
        $pending = Product::factory()->pending()->create();
        $soldOut = Product::factory()->outOfStock()->create();

        $this->actingAs($user)->post('/keranjang', ['product_id' => $pending->id]);
        $this->actingAs($user)->post('/keranjang', ['product_id' => $soldOut->id]);

        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_user_cannot_modify_another_users_cart_item(): void
    {
        $owner = User::factory()->create();
        $product = Product::factory()->create();
        $this->actingAs($owner)->post('/keranjang', ['product_id' => $product->id]);
        $item = $owner->cart->items()->first();

        $other = User::factory()->create();
        $this->actingAs($other)->patch("/keranjang/{$item->id}", ['quantity' => 5])->assertNotFound();
        $this->actingAs($other)->delete("/keranjang/{$item->id}")->assertNotFound();
    }

    public function test_checkout_requires_login(): void
    {
        $this->get('/checkout')->assertRedirect('/login');
    }

    public function test_checkout_validates_input(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $this->actingAs($user)->post('/keranjang', ['product_id' => $product->id]);

        $this->actingAs($user)
            ->post('/checkout', $this->checkoutPayload(['recipient_name' => '', 'phone' => 'abc', 'postal_code' => '12', 'payment_method' => 'kartu_kredit']))
            ->assertSessionHasErrors(['recipient_name', 'phone', 'postal_code', 'payment_method']);

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_splits_orders_per_umkm_computes_totals_and_decrements_stock(): void
    {
        $user = User::factory()->create();
        $a = Product::factory()->create(['price' => 25000, 'stock' => 10]);
        $b = Product::factory()->create(['price' => 40000, 'stock' => 5]);

        $this->actingAs($user)->post('/keranjang', ['product_id' => $a->id, 'quantity' => 2]);
        $this->actingAs($user)->post('/keranjang', ['product_id' => $b->id, 'quantity' => 1]);

        // Harga yang dikirim klien diabaikan; total dihitung di backend.
        $this->actingAs($user)
            ->post('/checkout', $this->checkoutPayload(['total' => 1]))
            ->assertRedirect('/checkout/selesai');

        $shipping = (int) config('pasarbanua.shipping_flat');

        $this->assertDatabaseCount('orders', 2);
        $this->assertDatabaseHas('orders', ['umkm_profile_id' => $a->umkm_profile_id, 'subtotal' => 50000, 'total' => 50000 + $shipping]);
        $this->assertDatabaseHas('orders', ['umkm_profile_id' => $b->umkm_profile_id, 'subtotal' => 40000, 'total' => 40000 + $shipping]);
        $this->assertSame(8, $a->fresh()->stock);
        $this->assertSame(4, $b->fresh()->stock);
        $this->assertSame(0, $user->cart->items()->count());
    }

    public function test_checkout_fails_when_stock_changed(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock' => 5]);
        $this->actingAs($user)->post('/keranjang', ['product_id' => $product->id, 'quantity' => 5]);

        $product->update(['stock' => 0]);

        $this->actingAs($user)->post('/checkout', $this->checkoutPayload())->assertSessionHasErrors('cart');
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_buyer_can_cancel_pending_order_and_stock_is_restored(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock' => 5]);
        $this->actingAs($user)->post('/keranjang', ['product_id' => $product->id, 'quantity' => 2]);
        $this->actingAs($user)->post('/checkout', $this->checkoutPayload());

        $order = Order::first();
        $this->assertSame(3, $product->fresh()->stock);

        $this->actingAs($user)->post("/akun/pesanan/{$order->number}/batal")->assertRedirect();

        $this->assertSame(OrderStatus::Cancelled, $order->fresh()->status);
        $this->assertSame(5, $product->fresh()->stock);
    }

    public function test_orders_are_private_to_their_buyer(): void
    {
        $order = Order::factory()->create();
        $stranger = User::factory()->create();

        $this->actingAs($stranger)->get("/akun/pesanan/{$order->number}")->assertForbidden();
        $this->actingAs($stranger)->post("/akun/pesanan/{$order->number}/batal")->assertForbidden();
        $this->actingAs($order->user)->get("/akun/pesanan/{$order->number}")->assertOk();
    }

    public function test_review_requires_completed_purchase(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)->post("/produk/{$product->slug}/ulasan", ['rating' => 5])->assertForbidden();
    }
}
