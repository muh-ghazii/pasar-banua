<?php

namespace App\Services;

use App\Enums\UmkmStatus;
use App\Http\Resources\ProductCardResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\UmkmProfile;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Query katalog publik: kategori, UMKM, dan filter/sorting produk.
 * Hanya menyajikan produk yang tayang (disetujui, aktif, UMKM terverifikasi).
 */
class CatalogService
{
    public const SORTS = ['terbaru', 'populer', 'termurah', 'termahal', 'rating'];

    /**
     * Kategori aktif beserta jumlah produk tayang dan foto sampul.
     *
     * @return array<int, array<string, mixed>>
     */
    public function categories(): array
    {
        $categories = Category::active()->ordered()->get();

        $counts = Product::published()
            ->select('category_id', DB::raw('count(*) as total'))
            ->groupBy('category_id')
            ->pluck('total', 'category_id');

        // Satu produk berfoto per kategori sebagai sampul (unggulan lebih dulu).
        $covers = Product::published()
            ->whereHas('images')
            ->with('images')
            ->orderByDesc('is_featured')
            ->orderByDesc('sold_count')
            ->get()
            ->groupBy('category_id')
            ->map(fn ($products) => $products->first()->images->first()?->url());

        return $categories->map(fn (Category $c) => [
            'id' => $c->id,
            'name' => $c->name,
            'slug' => $c->slug,
            'description' => $c->description,
            'icon' => $c->icon,
            'products_count' => (int) ($counts[$c->id] ?? 0),
            'cover_url' => $covers[$c->id] ?? null,
        ])->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function featuredUmkm(int $limit = 4): array
    {
        return UmkmProfile::approved()
            ->withCount(['products as products_count' => fn (Builder $q) => $q->published()])
            ->whereHas('products', fn (Builder $q) => $q->published())
            ->orderByDesc('products_count')
            ->limit($limit)
            ->get()
            ->map(fn (UmkmProfile $u) => $this->umkmCard($u))
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function umkmCard(UmkmProfile $u): array
    {
        return [
            'id' => $u->id,
            'name' => $u->name,
            'slug' => $u->slug,
            'tagline' => $u->tagline,
            'city' => $u->city,
            'logo_url' => $u->logoUrl(),
            'cover_url' => $u->coverUrl(),
            'products_count' => (int) ($u->products_count ?? 0),
            'is_demo' => $u->is_demo,
        ];
    }

    /**
     * @return array<int, string>
     */
    public function cities(): array
    {
        return UmkmProfile::query()
            ->where('status', UmkmStatus::Approved)
            ->whereHas('products', fn (Builder $q) => $q->published())
            ->orderBy('city')
            ->distinct()
            ->pluck('city')
            ->all();
    }

    /**
     * @return array{products: LengthAwarePaginator<int, array<string, mixed>>, filters: array<string, mixed>}
     */
    public function search(Request $request, int $perPage = 12, ?UmkmProfile $umkm = null): array
    {
        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'kategori' => (string) $request->query('kategori', ''),
            'kota' => (string) $request->query('kota', ''),
            'harga_min' => $request->query('harga_min') !== null && $request->query('harga_min') !== '' ? max(0, (int) $request->query('harga_min')) : null,
            'harga_maks' => $request->query('harga_maks') !== null && $request->query('harga_maks') !== '' ? max(0, (int) $request->query('harga_maks')) : null,
            'tersedia' => $request->boolean('tersedia'),
            'urut' => in_array($request->query('urut'), self::SORTS, true) ? (string) $request->query('urut') : 'terbaru',
        ];

        $query = Product::query()->published()->withCardData();

        if ($umkm) {
            $query->where('umkm_profile_id', $umkm->id);
        }

        if ($filters['q'] !== '') {
            $term = '%'.addcslashes($filters['q'], '\\%_').'%';
            $query->where(function (Builder $q) use ($term) {
                $q->where('products.name', 'like', $term)
                    ->orWhere('products.summary', 'like', $term)
                    ->orWhere('products.description', 'like', $term)
                    ->orWhereHas('umkm', fn (Builder $u) => $u->where('name', 'like', $term))
                    ->orWhereHas('category', fn (Builder $c) => $c->where('name', 'like', $term));
            });
        }

        if ($filters['kategori'] !== '') {
            $query->whereHas('category', fn (Builder $q) => $q->where('slug', $filters['kategori']));
        }

        if ($filters['kota'] !== '') {
            $query->whereHas('umkm', fn (Builder $q) => $q->where('city', $filters['kota']));
        }

        if ($filters['harga_min'] !== null) {
            $query->where('products.price', '>=', $filters['harga_min']);
        }

        if ($filters['harga_maks'] !== null) {
            $query->where('products.price', '<=', $filters['harga_maks']);
        }

        if ($filters['tersedia']) {
            $query->where('products.stock', '>', 0);
        }

        match ($filters['urut']) {
            'populer' => $query->orderByDesc('products.sold_count')->orderByDesc('products.id'),
            'termurah' => $query->orderBy('products.price')->orderByDesc('products.id'),
            'termahal' => $query->orderByDesc('products.price')->orderByDesc('products.id'),
            'rating' => $query->orderByDesc('reviews_avg_rating')->orderByDesc('reviews_count'),
            default => $query->orderByDesc('products.created_at')->orderByDesc('products.id'),
        };

        $paginator = $query->paginate($perPage)->withQueryString();
        $paginator->through(fn (Product $p) => ProductCardResource::make($p)->resolve());

        return ['products' => $paginator, 'filters' => $filters];
    }

    /**
     * @return array{min: int, max: int}
     */
    public function priceRange(): array
    {
        $row = Product::published()->selectRaw('min(price) as lo, max(price) as hi')->first();

        return ['min' => (int) ($row->lo ?? 0), 'max' => (int) ($row->hi ?? 0)];
    }
}
