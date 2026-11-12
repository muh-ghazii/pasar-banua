<?php

namespace Tests\Feature\Seller;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;

class SellerOrderTest extends SellerTestCase
{
    /**
     * @return array{0: User, 1: Order, 2: Product}
     */
    private function orderFor(OrderStatus $status = OrderStatus::Pending): array
    {
        $seller = $this->seller();
        $product = Product::factory()->for($seller->umkmProfile, 'umkm')->create(['stock' => 10, 'sold_count' => 3]);
        $order = Order::factory()->status($status)->create(['umkm_profile_id' => $seller->umkmProfile->id]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => $product->price,
            'quantity' => 3,
            'subtotal' => $product->price * 3,
        ]);

        return [$seller, $order, $product];
    }

    public function test_seller_can_view_own_order(): void
    {
        [$seller, $order] = $this->orderFor();

        $this->actingAs($seller)
            ->get("/seller/pesanan/{$order->number}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('seller/orders/show')
                ->where('order.number', $order->number)
                ->where('order.can.update_status', true));
    }

    public function test_seller_cannot_view_or_update_other_sellers_order(): void
    {
        [, $order] = $this->orderFor();
        $intruder = $this->seller();

        $this->actingAs($intruder)->get("/seller/pesanan/{$order->number}")->assertNotFound();
        $this->actingAs($intruder)
            ->post("/seller/pesanan/{$order->number}/status", ['status' => 'processing'])
            ->assertForbidden();

        $this->assertSame(OrderStatus::Pending, $order->fresh()->status);
    }

    public function test_full_status_flow(): void
    {
        [$seller, $order] = $this->orderFor();

        $this->actingAs($seller)->post("/seller/pesanan/{$order->number}/status", ['status' => 'processing'])->assertSessionHasNoErrors();
        $this->assertSame(OrderStatus::Processing, $order->fresh()->status);
        $this->assertNotNull($order->fresh()->processed_at);

        $this->actingAs($seller)
            ->post("/seller/pesanan/{$order->number}/status", ['status' => 'shipped', 'note' => 'Kurir lokal, tiba besok.'])
            ->assertSessionHasNoErrors();
        $this->assertSame(OrderStatus::Shipped, $order->fresh()->status);
        $this->assertSame('Kurir lokal, tiba besok.', $order->fresh()->tracking_note);

        $this->actingAs($seller)->post("/seller/pesanan/{$order->number}/status", ['status' => 'completed'])->assertSessionHasNoErrors();
        $this->assertSame(OrderStatus::Completed, $order->fresh()->status);

        // Pesanan selesai tidak dapat diubah lagi.
        $this->actingAs($seller)->post("/seller/pesanan/{$order->number}/status", ['status' => 'cancelled', 'note' => 'x'])->assertForbidden();
    }

    public function test_invalid_transition_is_rejected(): void
    {
        [$seller, $order] = $this->orderFor();

        $this->actingAs($seller)
            ->post("/seller/pesanan/{$order->number}/status", ['status' => 'completed'])
            ->assertSessionHasErrors('status');

        $this->assertSame(OrderStatus::Pending, $order->fresh()->status);
    }

    public function test_cancel_requires_reason_and_restores_stock(): void
    {
        [$seller, $order, $product] = $this->orderFor(OrderStatus::Processing);

        $this->actingAs($seller)
            ->post("/seller/pesanan/{$order->number}/status", ['status' => 'cancelled'])
            ->assertSessionHasErrors('note');

        $this->actingAs($seller)
            ->post("/seller/pesanan/{$order->number}/status", ['status' => 'cancelled', 'note' => 'Bahan baku habis.'])
            ->assertSessionHasNoErrors();

        $order->refresh();
        $product->refresh();

        $this->assertSame(OrderStatus::Cancelled, $order->status);
        $this->assertSame('Bahan baku habis.', $order->cancel_reason);
        $this->assertSame(13, $product->stock);
        $this->assertSame(0, $product->sold_count);
        $this->assertCount(1, $order->user->notifications);
    }

    public function test_order_list_is_scoped_to_seller(): void
    {
        [$seller] = $this->orderFor();
        $this->orderFor();

        $this->actingAs($seller)
            ->get('/seller/pesanan')
            ->assertInertia(fn ($page) => $page->has('orders.data', 1)->where('counts.all', 1));
    }
}
