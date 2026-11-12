<?php

namespace Tests\Feature\Seller;

use App\Enums\UmkmStatus;
use App\Models\Product;
use App\Models\TrainingMaterial;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SellerProfileStoryTrainingTest extends SellerTestCase
{
    public function test_seller_can_update_profile_with_logo(): void
    {
        Storage::fake('public');
        $seller = $this->seller();
        $slug = $seller->umkmProfile->slug;

        $this->actingAs($seller)
            ->put('/seller/profil', [
                'name' => 'Dapur Amplang Kotabaru',
                'tagline' => 'Amplang renyah dari dapur keluarga',
                'description' => 'Usaha keluarga sejak 2015.',
                'city' => 'Kotabaru',
                'phone' => '081234567890',
                'whatsapp' => '081234567890',
                'instagram' => '@dapuramplang',
                'logo' => UploadedFile::fake()->image('logo.png', 300, 300),
            ])
            ->assertRedirect('/seller/profil')
            ->assertSessionHasNoErrors();

        $umkm = $seller->umkmProfile->fresh();
        $this->assertSame('Dapur Amplang Kotabaru', $umkm->name);
        $this->assertSame('dapuramplang', $umkm->instagram);
        $this->assertSame($slug, $umkm->slug);
        Storage::disk('public')->assertExists($umkm->logo_path);
    }

    public function test_profile_validation(): void
    {
        $seller = $this->seller();

        $this->actingAs($seller)
            ->put('/seller/profil', ['name' => '', 'city' => '', 'phone' => 'abc'])
            ->assertSessionHasErrors(['name', 'city', 'phone']);
    }

    public function test_rejected_umkm_is_resubmitted_after_profile_update(): void
    {
        $seller = $this->seller(['rejection_reason' => 'Kontak tidak valid.'], fn ($f) => $f->rejected());

        $this->actingAs($seller)
            ->put('/seller/profil', ['name' => 'UMKM Baru', 'city' => 'Banjarmasin', 'phone' => '081234567890'])
            ->assertSessionHasNoErrors();

        $umkm = $seller->umkmProfile->fresh();
        $this->assertSame(UmkmStatus::Pending, $umkm->status);
        $this->assertNull($umkm->rejection_reason);
    }

    public function test_seller_story_is_saved_unverified(): void
    {
        $seller = $this->seller();
        $product = Product::factory()->for($seller->umkmProfile, 'umkm')->create();
        $product->story()->create(['title' => 'Lama', 'body' => 'Isi lama', 'is_verified' => true]);

        $this->actingAs($seller)
            ->put("/seller/cerita/{$product->slug}", [
                'title' => 'Dari dapur kecil di tepi sungai',
                'body' => str_repeat('Cerita tentang proses pembuatan produk ini. ', 3),
                'material_note' => 'Ikan tenggiri dari nelayan setempat.',
            ])
            ->assertRedirect('/seller/cerita')
            ->assertSessionHasNoErrors();

        $story = $product->story()->first();
        $this->assertSame('Dari dapur kecil di tepi sungai', $story->title);
        $this->assertFalse($story->is_verified);

        $this->actingAs($seller)->delete("/seller/cerita/{$product->slug}")->assertRedirect('/seller/cerita');
        $this->assertNull($product->story()->first());
    }

    public function test_seller_can_complete_training(): void
    {
        $seller = $this->seller();
        $material = TrainingMaterial::create([
            'title' => 'Mulai berjualan',
            'slug' => 'mulai-berjualan',
            'content' => "## Alur\n- Daftar\n- Unggah produk",
        ]);

        $this->actingAs($seller)
            ->get('/seller/pelatihan/mulai-berjualan')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('seller/training/show')->where('material.completed_at', null));

        $this->actingAs($seller)->post('/seller/pelatihan/mulai-berjualan/selesai')->assertRedirect();

        $this->assertTrue($seller->completedTrainings()->whereKey($material->id)->exists());

        $this->actingAs($seller)
            ->get('/seller/pelatihan')
            ->assertInertia(fn ($page) => $page->where('progress.completed', 1)->where('progress.total', 1));
    }

    public function test_unpublished_training_is_hidden(): void
    {
        $seller = $this->seller();
        TrainingMaterial::create(['title' => 'Draf', 'slug' => 'draf', 'content' => 'x', 'is_published' => false]);

        $this->actingAs($seller)->get('/seller/pelatihan/draf')->assertNotFound();
    }
}
