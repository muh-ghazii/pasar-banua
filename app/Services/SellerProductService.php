<?php

namespace App\Services;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\UmkmProfile;
use App\Support\Slug;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

/**
 * Logika pengelolaan produk oleh UMKM: simpan data, foto, dan cerita singkat.
 */
class SellerProductService
{
    /**
     * Field yang memengaruhi hasil kurasi. Bila salah satunya berubah pada produk
     * yang sudah disetujui/ditolak, produk dikembalikan ke antrean kurasi admin
     * agar konten yang tayang selalu sudah ditinjau. Perubahan stok, berat, dan
     * status aktif tidak memerlukan kurasi ulang.
     */
    public const CURATED_FIELDS = ['name', 'summary', 'description', 'price', 'category_id'];

    public function __construct(private readonly ImageStorage $images) {}

    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, UploadedFile>  $files
     */
    public function create(UmkmProfile $umkm, array $data, array $files): Product
    {
        $stored = $this->storeFiles($umkm, $files);

        return DB::transaction(function () use ($umkm, $data, $stored) {
            $product = Product::create([
                ...$this->productAttributes($data),
                'umkm_profile_id' => $umkm->id,
                'slug' => Slug::unique(Product::class, $data['name']),
                'status' => ProductStatus::Pending,
                'is_featured' => false,
                'is_demo' => false,
            ]);

            $this->attachImages($product, $stored, 0);
            $this->syncStory($product, $data);

            return $product;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, UploadedFile>  $files
     * @param  array<int, int>  $removedIds
     * @return bool true bila produk dikembalikan ke antrean kurasi
     */
    public function update(Product $product, array $data, array $files, array $removedIds): bool
    {
        $stored = $this->storeFiles($product->umkm, $files);
        $removed = $product->images()->whereIn('id', $removedIds)->get();

        $requeued = DB::transaction(function () use ($product, $data, $stored, $removed) {
            $product->fill($this->productAttributes($data));

            $needsCuration = $product->isDirty(self::CURATED_FIELDS)
                || $stored !== []
                || $removed->isNotEmpty();

            $requeue = $needsCuration && $product->status !== ProductStatus::Pending;

            if ($requeue) {
                $product->status = ProductStatus::Pending;
                $product->rejection_reason = null;
            }

            $product->save();

            ProductImage::whereIn('id', $removed->pluck('id'))->delete();

            $this->attachImages($product, $stored, (int) $product->images()->max('sort_order') + 1);
            $this->syncStory($product, $data);

            return $requeue;
        });

        foreach ($removed as $image) {
            $this->images->delete($image->path);
        }

        return $requeued;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function productAttributes(array $data): array
    {
        return [
            'category_id' => (int) $data['category_id'],
            'name' => $data['name'],
            'summary' => $data['summary'] ?? null,
            'description' => $data['description'],
            'price' => (int) $data['price'],
            'stock' => (int) $data['stock'],
            'weight_gram' => isset($data['weight_gram']) && $data['weight_gram'] !== '' ? (int) $data['weight_gram'] : null,
            'is_active' => (bool) ($data['is_active'] ?? true),
        ];
    }

    /**
     * Simpan cerita singkat bila diisi dari form produk. Cerita tulisan UMKM
     * selalu berstatus belum diverifikasi.
     *
     * @param  array<string, mixed>  $data
     */
    private function syncStory(Product $product, array $data): void
    {
        if (blank($data['story_title'] ?? null) || blank($data['story_body'] ?? null)) {
            return;
        }

        $story = $product->story()->firstOrNew();
        $story->fill(['title' => $data['story_title'], 'body' => $data['story_body']]);

        if ($story->isDirty()) {
            $story->is_verified = false;
            $story->save();
        }
    }

    /**
     * File disimpan sebelum transaksi DB agar transaksi tetap singkat.
     *
     * @param  array<int, UploadedFile>  $files
     * @return array<int, string>
     */
    private function storeFiles(UmkmProfile $umkm, array $files): array
    {
        return array_map(fn (UploadedFile $f) => $this->images->store($f, "products/{$umkm->id}"), array_values($files));
    }

    /**
     * @param  array<int, string>  $paths
     */
    private function attachImages(Product $product, array $paths, int $startOrder): void
    {
        foreach ($paths as $i => $path) {
            $product->images()->create([
                'path' => $path,
                'alt' => $product->name,
                'sort_order' => $startOrder + $i,
            ]);
        }
    }
}
