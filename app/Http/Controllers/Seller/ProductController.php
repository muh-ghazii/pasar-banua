<?php

namespace App\Http\Controllers\Seller;

use App\Enums\ProductStatus;
use App\Http\Requests\Seller\ProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Services\SellerProductService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends SellerController
{
    public function index(Request $request): Response
    {
        $umkm = $this->umkm($request);
        $q = trim((string) $request->query('q', ''));
        $status = ProductStatus::tryFrom((string) $request->query('status', ''));
        $category = (string) $request->query('kategori', '');

        $base = Product::query()->where('umkm_profile_id', $umkm->id);

        $counts = (clone $base)->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        $products = (clone $base)
            ->with(['images', 'category:id,name,slug,icon', 'story:id,product_id'])
            ->when($q !== '', fn (Builder $query) => $query->where('name', 'like', '%'.addcslashes($q, '\\%_').'%'))
            ->when($status, fn (Builder $query) => $query->where('status', $status))
            ->when($category !== '', fn (Builder $query) => $query->whereHas('category', fn (Builder $c) => $c->where('slug', $category)))
            ->latest('updated_at')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Product $p) => $this->row($p));

        return Inertia::render('seller/products/index', [
            'products' => $products,
            'filters' => ['q' => $q, 'status' => $status?->value ?? '', 'kategori' => $category],
            'counts' => collect(ProductStatus::cases())->mapWithKeys(fn ($s) => [$s->value => (int) ($counts[$s->value] ?? 0)])->all()
                + ['all' => (int) $counts->sum()],
            'categories' => Category::active()->ordered()->get(['id', 'name', 'slug'])->all(),
            'canCreate' => $request->user()->can('create', Product::class),
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        if ($request->user()->cannot('create', Product::class)) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Status UMKM Anda belum memungkinkan menambah produk. Hubungi admin Pasar Banua.']);

            return to_route('seller.products.index');
        }

        return Inertia::render('seller/products/create', $this->formOptions() + ['product' => null]);
    }

    public function store(ProductRequest $request, SellerProductService $service): RedirectResponse
    {
        $product = $service->create($this->umkm($request), $request->validated(), $request->file('images', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => "Produk \"{$product->name}\" tersimpan dan menunggu kurasi admin."]);

        return to_route('seller.products.index');
    }

    public function edit(Request $request, Product $product): Response
    {
        $this->authorizeProduct($request, $product);

        $product->load(['images', 'story', 'category:id,name,slug']);

        return Inertia::render('seller/products/edit', $this->formOptions() + [
            'product' => [
                ...$this->row($product),
                'summary' => $product->summary,
                'description' => $product->description,
                'weight_gram' => $product->weight_gram,
                'category_id' => $product->category_id,
                'rejection_reason' => $product->rejection_reason,
                'images' => $product->images->map(fn ($i) => ['id' => $i->id, 'url' => $i->url(), 'alt' => $i->alt])->all(),
                'story_title' => $product->story?->title,
                'story_body' => $product->story?->body,
            ],
        ]);
    }

    public function update(ProductRequest $request, Product $product, SellerProductService $service): RedirectResponse
    {
        $this->authorizeProduct($request, $product);

        $requeued = $service->update(
            $product,
            $request->validated(),
            $request->file('images', []),
            array_map('intval', $request->input('removed_images', [])),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $requeued
                ? 'Perubahan tersimpan. Produk dikurasi ulang oleh admin sebelum tayang kembali.'
                : 'Perubahan produk tersimpan.',
        ]);

        return to_route('seller.products.index');
    }

    public function toggle(Request $request, Product $product): RedirectResponse
    {
        $this->authorizeProduct($request, $product);

        $product->update(['is_active' => ! $product->is_active]);

        Inertia::flash('toast', [
            'type' => 'info',
            'message' => $product->is_active ? "\"{$product->name}\" diaktifkan." : "\"{$product->name}\" disembunyikan dari katalog.",
        ]);

        return back();
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $this->authorizeProduct($request, $product);
        $this->authorize('delete', $product);

        // Soft delete: riwayat pesanan tetap menyimpan nama, harga, dan foto produk.
        $product->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "Produk \"{$product->name}\" dihapus."]);

        return to_route('seller.products.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'categories' => Category::active()->ordered()->get(['id', 'name', 'slug', 'icon'])->all(),
            'limits' => [
                'max_images' => (int) config('pasarbanua.uploads.max_product_images'),
                'max_image_mb' => round(config('pasarbanua.uploads.max_image_kb') / 1024, 1),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function row(Product $p): array
    {
        return [
            'id' => $p->id,
            'name' => $p->name,
            'slug' => $p->slug,
            'price' => $p->price,
            'stock' => $p->stock,
            'sold_count' => $p->sold_count,
            'status' => $p->status->value,
            'status_label' => $p->status->label(),
            'is_active' => $p->is_active,
            'is_featured' => $p->is_featured,
            'is_demo' => $p->is_demo,
            'has_story' => $p->relationLoaded('story') && $p->story !== null,
            'rejection_reason' => $p->rejection_reason,
            'image_url' => $p->images->first()?->url(),
            'category' => $p->category ? ['name' => $p->category->name, 'slug' => $p->category->slug, 'icon' => $p->category->icon ?? null] : null,
            'updated_at' => $p->updated_at?->toIso8601String(),
        ];
    }
}
