<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Product;
use App\Models\ProductStory;
use App\Models\UmkmProfile;
use App\Services\CatalogService;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(CatalogService $catalog): Response
    {
        $featured = Product::published()->withCardData()
            ->orderByDesc('is_featured')
            ->orderByDesc('sold_count')
            ->limit(8)
            ->get();

        $stories = ProductStory::query()
            ->whereHas('product', fn ($q) => $q->published())
            ->with(['product' => fn ($q) => $q->with(['images', 'category:id,name,slug,icon', 'umkm:id,name,slug,city'])])
            ->latest('updated_at')
            ->limit(3)
            ->get()
            ->map(fn (ProductStory $s) => [
                'id' => $s->id,
                'title' => $s->title,
                'excerpt' => str($s->body)->limit(150)->toString(),
                'is_verified' => $s->is_verified,
                'product' => [
                    'name' => $s->product->name,
                    'slug' => $s->product->slug,
                    'image_url' => $s->product->images->first()?->url(),
                    'category' => $s->product->category ? ['name' => $s->product->category->name, 'slug' => $s->product->category->slug, 'icon' => $s->product->category->icon] : null,
                    'umkm' => $s->product->umkm?->name,
                ],
            ])->all();

        return Inertia::render('shop/home', [
            'categories' => $catalog->categories(),
            'featured' => ProductCardResource::collection($featured)->resolve(),
            'stories' => $stories,
            'umkms' => $catalog->featuredUmkm(4),
            'stats' => [
                'umkm' => UmkmProfile::approved()->count(),
                'products' => Product::published()->count(),
                'cities' => count($catalog->cities()),
            ],
        ]);
    }
}
