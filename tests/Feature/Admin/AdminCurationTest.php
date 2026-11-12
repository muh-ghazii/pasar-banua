<?php

namespace Tests\Feature\Admin;

use App\Enums\OrderStatus;
use App\Enums\ProductStatus;
use App\Enums\UmkmStatus;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\TrainingMaterial;
use App\Models\UmkmProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCurationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_approves_pending_umkm_and_seller_is_notified(): void
    {
        $umkm = UmkmProfile::factory()->pending()->create();

        $this->actingAs($this->admin)->post("/admin/umkm/{$umkm->id}/setujui")->assertRedirect();

        $umkm->refresh();
        $this->assertSame(UmkmStatus::Approved, $umkm->status);
        $this->assertNotNull($umkm->verified_at);
        $this->assertSame(1, $umkm->user->notifications()->count());
    }

    public function test_rejecting_umkm_requires_reason(): void
    {
        $umkm = UmkmProfile::factory()->pending()->create();

        $this->actingAs($this->admin)->post("/admin/umkm/{$umkm->id}/tolak", ['reason' => ''])
            ->assertSessionHasErrors('reason');
        $this->assertSame(UmkmStatus::Pending, $umkm->refresh()->status);

        $this->actingAs($this->admin)->post("/admin/umkm/{$umkm->id}/tolak", ['reason' => 'Data kontak tidak valid'])
            ->assertSessionHasNoErrors();

        $umkm->refresh();
        $this->assertSame(UmkmStatus::Rejected, $umkm->status);
        $this->assertSame('Data kontak tidak valid', $umkm->rejection_reason);
    }

    public function test_suspended_umkm_products_are_hidden_from_catalog(): void
    {
        $product = Product::factory()->create();
        $umkm = $product->umkm;

        $this->assertTrue($product->isPublished());

        $this->actingAs($this->admin)->post("/admin/umkm/{$umkm->id}/nonaktifkan", ['reason' => 'Pesanan tidak diproses'])
            ->assertSessionHasNoErrors();

        $this->assertSame(UmkmStatus::Suspended, $umkm->refresh()->status);
        $this->assertFalse($product->fresh()->isPublished());

        $this->actingAs($this->admin)->post("/admin/umkm/{$umkm->id}/aktifkan");
        $this->assertTrue($product->fresh()->isPublished());
    }

    public function test_admin_updates_umkm_information(): void
    {
        $umkm = UmkmProfile::factory()->create();

        $this->actingAs($this->admin)->put("/admin/umkm/{$umkm->id}", [
            'name' => 'Sasirangan Bu Ijah',
            'city' => 'Banjarmasin',
            'instagram' => '@sasirangan.ijah',
        ])->assertSessionHasNoErrors();

        $umkm->refresh();
        $this->assertSame('Sasirangan Bu Ijah', $umkm->name);
        $this->assertSame('sasirangan.ijah', $umkm->instagram);
    }

    public function test_admin_approves_and_rejects_products(): void
    {
        $pending = Product::factory()->pending()->create();
        $other = Product::factory()->pending()->create();

        $this->actingAs($this->admin)->post("/admin/produk/{$pending->id}/setujui");
        $this->assertSame(ProductStatus::Approved, $pending->refresh()->status);
        $this->assertTrue($pending->isPublished());

        $this->actingAs($this->admin)->post("/admin/produk/{$other->id}/tolak", ['reason' => 'Foto produk kurang jelas']);
        $other->refresh();
        $this->assertSame(ProductStatus::Rejected, $other->status);
        $this->assertSame('Foto produk kurang jelas', $other->rejection_reason);
        $this->assertSame(1, $other->umkm->user->notifications()->count());
    }

    public function test_only_approved_products_can_be_featured(): void
    {
        $pending = Product::factory()->pending()->create();
        $approved = Product::factory()->create();

        $this->actingAs($this->admin)->post("/admin/produk/{$pending->id}/unggulan");
        $this->assertFalse($pending->refresh()->is_featured);

        $this->actingAs($this->admin)->post("/admin/produk/{$approved->id}/unggulan");
        $this->assertTrue($approved->refresh()->is_featured);

        $this->actingAs($this->admin)->post("/admin/produk/{$approved->id}/unggulan");
        $this->assertFalse($approved->refresh()->is_featured);
    }

    public function test_admin_can_hide_product(): void
    {
        $product = Product::factory()->create();

        $this->actingAs($this->admin)->post("/admin/produk/{$product->id}/tampil");

        $this->assertFalse($product->refresh()->is_active);
        $this->assertFalse($product->isPublished());
    }

    public function test_category_crud(): void
    {
        $this->actingAs($this->admin)->post('/admin/kategori', [
            'name' => 'Oleh-oleh Khas',
            'icon' => 'package',
            'sort_order' => 5,
            'is_active' => true,
        ])->assertSessionHasNoErrors();

        $category = Category::where('name', 'Oleh-oleh Khas')->firstOrFail();
        $this->assertSame('oleh-oleh-khas', $category->slug);

        $this->actingAs($this->admin)->put("/admin/kategori/{$category->id}", [
            'name' => 'Oleh-oleh Banua',
            'icon' => 'utensils',
            'is_active' => false,
        ])->assertSessionHasNoErrors();

        $category->refresh();
        $this->assertSame('Oleh-oleh Banua', $category->name);
        $this->assertFalse($category->is_active);

        $this->actingAs($this->admin)->delete("/admin/kategori/{$category->id}");
        $this->assertModelMissing($category);
    }

    public function test_category_with_products_cannot_be_deleted(): void
    {
        $product = Product::factory()->create();

        $this->actingAs($this->admin)->delete("/admin/kategori/{$product->category_id}")->assertRedirect();

        $this->assertModelExists($product->category);
    }

    public function test_category_icon_is_validated(): void
    {
        $this->actingAs($this->admin)->post('/admin/kategori', ['name' => 'Kategori Uji', 'icon' => 'rocket'])
            ->assertSessionHasErrors('icon');
    }

    public function test_admin_deactivates_user_and_user_is_logged_out(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($this->admin)->post("/admin/pengguna/{$customer->id}/status")->assertRedirect();
        $this->assertFalse($customer->refresh()->is_active);

        $this->actingAs($customer)->get('/akun/pesanan')->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_admin_cannot_deactivate_self_or_other_admin(): void
    {
        $other = User::factory()->admin()->create();

        $this->actingAs($this->admin)->post("/admin/pengguna/{$this->admin->id}/status")->assertForbidden();
        $this->actingAs($this->admin)->post("/admin/pengguna/{$other->id}/status")->assertForbidden();

        $this->assertTrue($this->admin->refresh()->is_active);
        $this->assertTrue($other->refresh()->is_active);
    }

    public function test_admin_cancel_order_restores_stock(): void
    {
        $product = Product::factory()->create(['stock' => 5, 'sold_count' => 2]);
        $order = Order::factory()->create([
            'umkm_profile_id' => $product->umkm_profile_id,
            'status' => OrderStatus::Processing,
        ]);
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => $product->price,
            'quantity' => 2,
            'subtotal' => $product->price * 2,
        ]);

        $this->actingAs($this->admin)->post("/admin/pesanan/{$order->number}/batalkan", ['reason' => ''])
            ->assertSessionHasErrors('reason');

        $this->actingAs($this->admin)->post("/admin/pesanan/{$order->number}/batalkan", ['reason' => 'Permintaan pembeli'])
            ->assertSessionHasNoErrors();

        $this->assertSame(OrderStatus::Cancelled, $order->refresh()->status);
        $this->assertSame(7, $product->refresh()->stock);
        $this->assertSame(0, $product->sold_count);
    }

    public function test_admin_order_detail_is_viewable(): void
    {
        $order = Order::factory()->create();

        $this->actingAs($this->admin)->get("/admin/pesanan/{$order->number}")->assertOk();
    }

    public function test_training_material_crud(): void
    {
        $this->actingAs($this->admin)->post('/admin/pelatihan', [
            'title' => 'Memotret produk dengan cahaya alami',
            'topic' => 'katalog',
            'content' => 'Letakkan produk di dekat jendela pada pagi hari agar cahaya lembut.',
            'duration_minutes' => 6,
            'is_published' => true,
        ])->assertRedirect('/admin/pelatihan');

        $material = TrainingMaterial::where('title', 'Memotret produk dengan cahaya alami')->firstOrFail();
        $this->assertTrue($material->is_published);

        $this->actingAs($this->admin)->get("/admin/pelatihan/{$material->id}/ubah")->assertOk();

        $this->actingAs($this->admin)->post("/admin/pelatihan/{$material->id}/terbit");
        $this->assertFalse($material->refresh()->is_published);

        $this->actingAs($this->admin)->delete("/admin/pelatihan/{$material->id}");
        $this->assertModelMissing($material);
    }

    public function test_dashboard_and_analytics_render_with_data(): void
    {
        $product = Product::factory()->create();
        Order::factory()->count(3)->create(['umkm_profile_id' => $product->umkm_profile_id, 'status' => OrderStatus::Completed]);

        $this->actingAs($this->admin)->get('/admin')->assertOk()
            ->assertInertia(fn ($page) => $page->component('admin/dashboard')
                ->where('kpis.active_umkm.target', 50)
                ->where('totals.orders', 3));

        $this->actingAs($this->admin)->get('/admin/analitik')->assertOk()
            ->assertInertia(fn ($page) => $page->component('admin/analytics')->has('trend', 12));
    }
}
