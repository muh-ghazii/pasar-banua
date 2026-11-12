<?php

namespace App\Http\Controllers\Shop;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Order;
use App\Models\Product;
use App\Services\CatalogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(Request $request, CatalogService $catalog): Response
    {
        ['products' => $products, 'filters' => $filters] = $catalog->search($request, 12);

        return Inertia::render('shop/catalog', [
            'products' => $products,
            'filters' => $filters,
            'categories' => collect($catalog->categories())->map(fn ($c) => [
                'name' => $c['name'], 'slug' => $c['slug'], 'products_count' => $c['products_count'],
            ])->all(),
            'cities' => $catalog->cities(),
            'priceRange' => $catalog->priceRange(),
        ]);
    }

    public function show(Request $request, Product $product): Response
    {
        $user = $request->user();

        // Produk yang belum tayang hanya bisa dipratinjau pemilik atau admin.
        $isPreview = ! $product->isPublished();
        abort_if($isPreview && ! ($user && $user->can('update', $product)), 404);

        $product->load([
            'images',
            'category:id,name,slug,icon',
            'umkm:id,name,slug,city,tagline,description,logo_path,status,whatsapp,phone,is_demo',
            'story',
        ])->loadAvg('reviews', 'rating')->loadCount('reviews');

        $reviews = $product->reviews()
            ->with('user:id,name')
            ->latest()
            ->paginate(5, ['*'], 'ulasan')
            ->withQueryString()
            ->through(fn ($r) => [
                'id' => $r->id,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'author' => $r->user?->name ? $this->maskName($r->user->name) : 'Pembeli',
                'created_at' => $r->created_at?->toIso8601String(),
            ]);

        $distribution = $product->reviews()
            ->selectRaw('rating, count(*) as total')
            ->groupBy('rating')
            ->pluck('total', 'rating');

        $related = Product::published()->withCardData()
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->id)
            ->orderByDesc('is_featured')
            ->orderByDesc('sold_count')
            ->limit(4)
            ->get();

        $canReview = false;
        $myReview = null;

        if ($user) {
            $myReview = $product->reviews()->where('user_id', $user->id)->first(['id', 'rating', 'comment']);
            $canReview = Order::where('user_id', $user->id)
                ->where('status', OrderStatus::Completed)
                ->whereHas('items', fn ($q) => $q->where('product_id', $product->id))
                ->exists();
        }

        $story = $product->story;
        $umkm = $product->umkm;

        return Inertia::render('shop/product', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'summary' => $product->summary,
                'description' => $product->description,
                'price' => $product->price,
                'stock' => $product->stock,
                'weight_gram' => $product->weight_gram,
                'sold_count' => $product->sold_count,
                'is_featured' => $product->is_featured,
                'is_demo' => $product->is_demo,
                'rating' => $product->reviews_avg_rating !== null ? round((float) $product->reviews_avg_rating, 1) : null,
                'reviews_count' => (int) $product->reviews_count,
                'category' => $product->category ? ['name' => $product->category->name, 'slug' => $product->category->slug, 'icon' => $product->category->icon] : null,
                'images' => $product->images->map(fn ($i) => ['id' => $i->id, 'url' => $i->url(), 'alt' => $i->alt ?? $product->name])->all(),
            ],
            'story' => $story ? [
                'title' => $story->title,
                'body' => $story->body,
                'process_note' => $story->process_note,
                'material_note' => $story->material_note,
                'cultural_note' => $story->cultural_note,
                'is_verified' => $story->is_verified,
            ] : null,
            'umkm' => $umkm ? [
                'name' => $umkm->name,
                'slug' => $umkm->slug,
                'city' => $umkm->city,
                'tagline' => $umkm->tagline,
                'description' => $umkm->description,
                'logo_url' => $umkm->logoUrl(),
                'is_demo' => $umkm->is_demo,
            ] : null,
            'reviews' => $reviews,
            'ratingDistribution' => collect([5, 4, 3, 2, 1])->map(fn ($star) => ['star' => $star, 'count' => (int) ($distribution[$star] ?? 0)])->all(),
            'related' => ProductCardResource::collection($related)->resolve(),
            'canReview' => $canReview,
            'myReview' => $myReview,
            'isPreview' => $isPreview,
            'previewStatus' => $isPreview ? ['status' => $product->status->value, 'label' => $product->status->label(), 'active' => $product->is_active] : null,
        ]);
    }

    private function maskName(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name));

        return count($parts) > 1
            ? $parts[0].' '.mb_substr($parts[count($parts) - 1], 0, 1).'.'
            : $parts[0];
    }
}
