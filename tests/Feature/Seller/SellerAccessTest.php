<?php

namespace Tests\Feature\Seller;

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;

class SellerAccessTest extends SellerTestCase
{
    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/seller')->assertRedirect('/login');
    }

    public function test_customer_cannot_access_seller_dashboard(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer)->get('/seller')->assertForbidden();
        $this->actingAs($customer)->get('/seller/produk')->assertForbidden();
        $this->actingAs($customer)->post('/seller/produk', [])->assertForbidden();
    }

    public function test_admin_cannot_access_seller_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/seller')->assertForbidden();
    }

    /**
     * @return array<string, array{0: string, 1: string}>
     */
    public static function pages(): array
    {
        return [
            'ringkasan' => ['/seller', 'seller/dashboard'],
            'produk' => ['/seller/produk', 'seller/products/index'],
            'tambah produk' => ['/seller/produk/tambah', 'seller/products/create'],
            'pesanan' => ['/seller/pesanan', 'seller/orders/index'],
            'stok' => ['/seller/stok', 'seller/stock'],
            'profil' => ['/seller/profil', 'seller/profile'],
            'cerita' => ['/seller/cerita', 'seller/stories/index'],
            'pelatihan' => ['/seller/pelatihan', 'seller/training/index'],
        ];
    }

    #[DataProvider('pages')]
    public function test_seller_pages_render(string $url, string $component): void
    {
        $seller = $this->seller();

        $this->actingAs($seller)
            ->get($url)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component($component));
    }

    public function test_pending_umkm_sees_dashboard_with_status(): void
    {
        $seller = $this->seller([], fn ($f) => $f->pending());

        $this->actingAs($seller)
            ->get('/seller')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('umkm.status', 'pending'));
    }
}
