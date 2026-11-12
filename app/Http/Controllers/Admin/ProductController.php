<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReasonRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\UmkmProfile;
use App\Notifications\AppNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $status = ProductStatus::tryFrom((string) $request->query('status'));
        $filters = [
            'status' => $status?->value,
            'q' => trim((string) $request->query('q', '')),
            'kategori' => (string) $request->query('kategori', ''),
            'umkm' => $request->integer('umkm') ?: null,
            'unggulan' => $request->boolean('unggulan'),
        ];

        $counts = Product::query()->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');

        $products = Product::query()
            ->with(['images', 'category:id,name,slug,icon', 'umkm:id,name,slug,city,status'])
            ->when($status, fn (Builder $q) => $q->where('status', $status))
            ->when($filters['q'] !== '', function (Builder $q) use ($filters) {
                $term = '%'.addcslashes($filters['q'], '\\%_').'%';
                $q->where(fn (Builder $w) => $w->where('name', 'like', $term)
                    ->orWhereHas('umkm', fn (Builder $u) => $u->where('name', 'like', $term)));
            })
            ->when($filters['kategori'] !== '', fn (Builder $q) => $q->whereHas('category', fn (Builder $c) => $c->where('slug', $filters['kategori'])))
            ->when($filters['umkm'], fn (Builder $q) => $q->where('umkm_profile_id', $filters['umkm']))
            ->when($filters['unggulan'], fn (Builder $q) => $q->where('is_featured', true))
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->latest('updated_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Product $p) => $this->row($p));

        return Inertia::render('admin/products-index', [
            'products' => $products,
            'filters' => $filters,
            'counts' => collect(ProductStatus::cases())->mapWithKeys(fn ($s) => [$s->value => (int) ($counts[$s->value] ?? 0)])->all()
                + ['all' => (int) $counts->sum()],
            'categories' => Category::ordered()->get(['id', 'name', 'slug']),
            'umkms' => UmkmProfile::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function show(Product $product): Response
    {
        $product->load(['images', 'category:id,name,slug,icon', 'umkm:id,name,slug,city,status,is_demo', 'story'])
            ->loadAvg('reviews', 'rating')
            ->loadCount(['reviews', 'orderItems']);

        return Inertia::render('admin/product-show', [
            'product' => [
                ...$this->row($product),
                'summary' => $product->summary,
                'description' => $product->description,
                'weight_gram' => $product->weight_gram,
                'rejection_reason' => $product->rejection_reason,
                'rating' => $product->reviews_avg_rating !== null ? round((float) $product->reviews_avg_rating, 1) : null,
                'reviews_count' => (int) $product->reviews_count,
                'order_items_count' => (int) $product->order_items_count,
                'images' => $product->images->map(fn ($i) => ['id' => $i->id, 'url' => $i->url(), 'alt' => $i->alt ?? $product->name])->all(),
                'story' => $product->story ? [
                    'title' => $product->story->title,
                    'body' => $product->story->body,
                    'process_note' => $product->story->process_note,
                    'material_note' => $product->story->material_note,
                    'cultural_note' => $product->story->cultural_note,
                    'is_verified' => $product->story->is_verified,
                ] : null,
            ],
        ]);
    }

    public function approve(Product $product): RedirectResponse
    {
        $product->update(['status' => ProductStatus::Approved, 'rejection_reason' => null]);

        $this->notify($product, 'Produk disetujui', "\"{$product->name}\" lolos kurasi dan kini tampil di katalog.", 'success');

        return $this->done("\"{$product->name}\" disetujui.");
    }

    public function reject(ReasonRequest $request, Product $product): RedirectResponse
    {
        $reason = $request->validated('reason');

        $product->update([
            'status' => ProductStatus::Rejected,
            'rejection_reason' => $reason,
            'is_featured' => false,
        ]);

        $this->notify($product, 'Produk perlu diperbaiki', "\"{$product->name}\" belum lolos kurasi. Catatan admin: {$reason}", 'danger');

        return $this->done("\"{$product->name}\" ditolak dan penjual sudah diberi tahu.");
    }

    public function toggleFeatured(Product $product): RedirectResponse
    {
        if (! $product->is_featured && $product->status !== ProductStatus::Approved) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Hanya produk yang sudah disetujui yang bisa dijadikan unggulan.']);

            return back();
        }

        $product->update(['is_featured' => ! $product->is_featured]);

        return $this->done($product->is_featured
            ? "\"{$product->name}\" ditandai sebagai produk unggulan."
            : "\"{$product->name}\" tidak lagi menjadi produk unggulan.");
    }

    public function toggleActive(Product $product): RedirectResponse
    {
        $product->update(['is_active' => ! $product->is_active]);

        if (! $product->is_active) {
            $this->notify($product, 'Produk disembunyikan', "\"{$product->name}\" disembunyikan sementara dari katalog oleh admin.", 'warning');
        }

        return $this->done($product->is_active
            ? "\"{$product->name}\" kembali ditampilkan."
            : "\"{$product->name}\" disembunyikan dari katalog.");
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
            'is_active' => $p->is_active,
            'is_featured' => $p->is_featured,
            'is_demo' => $p->is_demo,
            'is_published' => $p->isPublished(),
            'image_url' => $p->images->first()?->url(),
            'category' => $p->category ? ['name' => $p->category->name, 'slug' => $p->category->slug, 'icon' => $p->category->icon] : null,
            'umkm' => $p->umkm ? ['id' => $p->umkm->id, 'name' => $p->umkm->name, 'city' => $p->umkm->city, 'status' => $p->umkm->status->value] : null,
            'updated_at' => $p->updated_at?->toIso8601String(),
            'created_at' => $p->created_at?->toIso8601String(),
        ];
    }

    private function notify(Product $product, string $title, string $message, string $tone): void
    {
        $product->loadMissing('umkm.user');
        $product->umkm?->user?->notify(new AppNotification($title, $message, '/seller/produk', $tone));
    }

    private function done(string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return back();
    }
}
