<?php

namespace Tests\Feature\Admin;

use App\Models\UmkmProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/admin')->assertRedirect('/login');
    }

    public function test_customer_cannot_access_admin_pages(): void
    {
        $customer = User::factory()->create();

        foreach (['/admin', '/admin/umkm', '/admin/produk', '/admin/kategori', '/admin/pesanan', '/admin/pengguna', '/admin/pelatihan', '/admin/analitik'] as $url) {
            $this->actingAs($customer)->get($url)->assertForbidden();
        }
    }

    public function test_seller_cannot_access_admin_pages(): void
    {
        $umkm = UmkmProfile::factory()->create();

        $this->actingAs($umkm->user)->get('/admin')->assertForbidden();
        $this->actingAs($umkm->user)->post("/admin/umkm/{$umkm->id}/setujui")->assertForbidden();
    }

    public function test_admin_can_open_every_admin_page(): void
    {
        $admin = User::factory()->admin()->create();
        $umkm = UmkmProfile::factory()->create();

        foreach (['/admin', '/admin/umkm', "/admin/umkm/{$umkm->id}", '/admin/produk', '/admin/kategori', '/admin/pesanan', '/admin/pengguna', '/admin/pelatihan', '/admin/pelatihan/baru', '/admin/analitik'] as $url) {
            $this->actingAs($admin)->get($url)->assertOk();
        }
    }
}
