<?php

namespace Tests\Feature\Seller;

use App\Enums\ProductStatus;
use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SellerProductTest extends SellerTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return [
            'name' => 'Amplang Ikan Tenggiri 250 g',
            'category_id' => $this->category()->id,
            'summary' => 'Kerupuk ikan renyah khas pesisir.',
            'description' => 'Dibuat dari ikan tenggiri segar dan tepung tapioka, digoreng dua kali.',
            'price' => 25000,
            'stock' => 30,
            'weight_gram' => 250,
            'is_active' => true,
            'images' => [UploadedFile::fake()->image('amplang.jpg', 800, 800)],
            ...$overrides,
        ];
    }

    public function test_seller_can_create_product_with_image_and_story(): void
    {
        $seller = $this->seller();

        $this->actingAs($seller)
            ->post('/seller/produk', $this->payload([
                'story_title' => 'Resep keluarga',
                'story_body' => 'Resep ini diwariskan dari nenek kami di Kotabaru.',
            ]))
            ->assertRedirect('/seller/produk')
            ->assertSessionHasNoErrors();

        $product = Product::with(['images', 'story'])->firstOrFail();

        $this->assertSame($seller->umkmProfile->id, $product->umkm_profile_id);
        $this->assertSame(ProductStatus::Pending, $product->status);
        $this->assertSame(25000, $product->price);
        $this->assertCount(1, $product->images);
        Storage::disk('public')->assertExists($product->images->first()->path);
        $this->assertFalse($product->story->is_verified);
    }

    public function test_product_requires_at_least_one_image(): void
    {
        $seller = $this->seller();

        $this->actingAs($seller)
            ->post('/seller/produk', $this->payload(['images' => []]))
            ->assertSessionHasErrors('images');

        $this->assertDatabaseCount('products', 0);
    }

    public function test_upload_rejects_non_image_and_oversized_files(): void
    {
        $seller = $this->seller();

        $this->actingAs($seller)
            ->post('/seller/produk', $this->payload([
                'images' => [UploadedFile::fake()->create('virus.php', 10, 'application/x-php')],
            ]))
            ->assertSessionHasErrors('images.0');

        $this->actingAs($seller)
            ->post('/seller/produk', $this->payload([
                'images' => [UploadedFile::fake()->image('besar.jpg')->size(5000)],
            ]))
            ->assertSessionHasErrors('images.0');

        $this->assertDatabaseCount('products', 0);
    }

    public function test_validation_rejects_invalid_price_and_stock(): void
    {
        $seller = $this->seller();

        $this->actingAs($seller)
            ->post('/seller/produk', $this->payload(['price' => 0, 'stock' => -1, 'name' => '']))
            ->assertSessionHasErrors(['price', 'stock', 'name']);
    }

    public function test_editing_curated_fields_requeues_approved_product(): void
    {
        $seller = $this->seller();
        $product = Product::factory()->for($seller->umkmProfile, 'umkm')->create(['status' => ProductStatus::Approved]);
        $product->images()->create(['path' => 'products/x.jpg']);

        $this->actingAs($seller)
            ->put("/seller/produk/{$product->slug}", [
                'name' => $product->name,
                'category_id' => $product->category_id,
                'description' => $product->description.' Kini lebih renyah.',
                'price' => $product->price + 1000,
                'stock' => $product->stock,
            ])
            ->assertRedirect('/seller/produk')
            ->assertSessionHasNoErrors();

        $this->assertSame(ProductStatus::Pending, $product->fresh()->status);
    }

    public function test_stock_only_change_keeps_approved_status(): void
    {
        $seller = $this->seller();
        $product = Product::factory()->for($seller->umkmProfile, 'umkm')->create(['status' => ProductStatus::Approved, 'stock' => 3]);

        $this->actingAs($seller)
            ->patch("/seller/stok/{$product->slug}", ['stock' => 40])
            ->assertSessionHasNoErrors();

        $product->refresh();
        $this->assertSame(40, $product->stock);
        $this->assertSame(ProductStatus::Approved, $product->status);
    }

    public function test_seller_can_remove_and_add_images(): void
    {
        $seller = $this->seller();
        $product = Product::factory()->for($seller->umkmProfile, 'umkm')->create();
        Storage::disk('public')->put('products/old.jpg', 'x');
        $old = $product->images()->create(['path' => 'products/old.jpg']);

        $this->actingAs($seller)
            ->put("/seller/produk/{$product->slug}", [
                'name' => $product->name,
                'category_id' => $product->category_id,
                'description' => $product->description,
                'price' => $product->price,
                'stock' => $product->stock,
                'removed_images' => [$old->id],
                'images' => [UploadedFile::fake()->image('baru.png')],
            ])
            ->assertSessionHasNoErrors();

        $this->assertModelMissing($old);
        Storage::disk('public')->assertMissing('products/old.jpg');
        $this->assertCount(1, $product->images()->get());
    }

    public function test_toggle_and_delete_product(): void
    {
        $seller = $this->seller();
        $product = Product::factory()->for($seller->umkmProfile, 'umkm')->create(['is_active' => true]);

        $this->actingAs($seller)->patch("/seller/produk/{$product->slug}/aktif")->assertRedirect();
        $this->assertFalse($product->fresh()->is_active);

        $this->actingAs($seller)->delete("/seller/produk/{$product->slug}")->assertRedirect('/seller/produk');
        $this->assertSoftDeleted($product);
    }

    public function test_seller_cannot_touch_another_sellers_product(): void
    {
        $seller = $this->seller();
        $other = $this->seller();
        $product = Product::factory()->for($other->umkmProfile, 'umkm')->create(['price' => 50000]);

        $this->actingAs($seller)->get("/seller/produk/{$product->slug}/ubah")->assertForbidden();
        $this->actingAs($seller)->put("/seller/produk/{$product->slug}", $this->payload(['price' => 1000]))->assertForbidden();
        $this->actingAs($seller)->patch("/seller/stok/{$product->slug}", ['stock' => 0])->assertForbidden();
        $this->actingAs($seller)->patch("/seller/produk/{$product->slug}/aktif")->assertForbidden();
        $this->actingAs($seller)->delete("/seller/produk/{$product->slug}")->assertForbidden();
        $this->actingAs($seller)->put("/seller/cerita/{$product->slug}", ['title' => 'Cerita palsu', 'body' => str_repeat('a', 60)])->assertForbidden();

        $this->assertSame(50000, $product->fresh()->price);
        $this->assertNotSoftDeleted($product);
    }

    public function test_product_list_only_shows_own_products(): void
    {
        $seller = $this->seller();
        Product::factory()->for($seller->umkmProfile, 'umkm')->create(['name' => 'Milik Saya']);
        Product::factory()->for($this->seller()->umkmProfile, 'umkm')->create(['name' => 'Milik Orang Lain']);

        $this->actingAs($seller)
            ->get('/seller/produk')
            ->assertInertia(fn ($page) => $page
                ->has('products.data', 1)
                ->where('products.data.0.name', 'Milik Saya'));
    }

    public function test_rejected_umkm_cannot_create_products(): void
    {
        $seller = $this->seller([], fn ($f) => $f->rejected());

        $this->actingAs($seller)->post('/seller/produk', $this->payload())->assertForbidden();
        $this->actingAs($seller)->get('/seller/produk/tambah')->assertRedirect('/seller/produk');
    }
}
