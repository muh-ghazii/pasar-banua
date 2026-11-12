<?php

namespace Tests\Feature\Shop;

use App\Models\Product;
use App\Models\UmkmProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StorefrontTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_pages_render(): void
    {
        $product = Product::factory()->create();

        $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page->component('shop/home'));
        $this->get('/produk')->assertOk()->assertInertia(fn (Assert $page) => $page->component('shop/catalog'));
        $this->get('/kategori')->assertOk();
        $this->get('/cerita-banua')->assertOk();
        $this->get('/umkm')->assertOk();
        $this->get('/tentang')->assertOk();
        $this->get('/keranjang')->assertOk();
        $this->get("/produk/{$product->slug}")->assertOk()->assertInertia(
            fn (Assert $page) => $page->component('shop/product')->where('product.id', $product->id)
        );
        $this->get("/umkm/{$product->umkm->slug}")->assertOk();
    }

    public function test_catalog_hides_unpublished_products(): void
    {
        $visible = Product::factory()->create(['name' => 'Amplang Tenggiri']);
        Product::factory()->pending()->create(['name' => 'Dodol Belum Kurasi']);
        Product::factory()->create([
            'name' => 'Produk UMKM Belum Verifikasi',
            'umkm_profile_id' => UmkmProfile::factory()->pending(),
        ]);

        $this->get('/produk')->assertInertia(fn (Assert $page) => $page
            ->has('products.data', 1)
            ->where('products.data.0.id', $visible->id));
    }

    public function test_catalog_search_filter_and_sort(): void
    {
        Product::factory()->create(['name' => 'Amplang Ikan Pipih', 'price' => 30000]);
        Product::factory()->create(['name' => 'Kain Sasirangan', 'price' => 250000]);
        Product::factory()->outOfStock()->create(['name' => 'Amplang Habis', 'price' => 20000]);

        $this->get('/produk?q=amplang')->assertInertia(fn (Assert $page) => $page->has('products.data', 2));
        $this->get('/produk?q=amplang&tersedia=1')->assertInertia(fn (Assert $page) => $page->has('products.data', 1));
        $this->get('/produk?harga_min=100000')->assertInertia(fn (Assert $page) => $page->has('products.data', 1));
        $this->get('/produk?urut=termurah')->assertInertia(fn (Assert $page) => $page->where('products.data.0.name', 'Amplang Habis'));
    }

    public function test_unpublished_product_detail_is_not_public(): void
    {
        $product = Product::factory()->pending()->create();

        $this->get("/produk/{$product->slug}")->assertNotFound();
    }
}
