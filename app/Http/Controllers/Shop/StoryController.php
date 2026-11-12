<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductCardResource;
use App\Models\Product;
use App\Models\ProductStory;
use Inertia\Inertia;
use Inertia\Response;

class StoryController extends Controller
{
    public function index(): Response
    {
        $stories = ProductStory::query()
            ->whereHas('product', fn ($q) => $q->published())
            ->with(['product' => fn ($q) => $q->with(['images', 'category:id,name,slug,icon', 'umkm:id,name,slug,city'])])
            ->orderByDesc('is_verified')
            ->latest('updated_at')
            ->paginate(9)
            ->through(fn (ProductStory $s) => [
                'id' => $s->id,
                'title' => $s->title,
                'excerpt' => str($s->body)->limit(180)->toString(),
                'is_verified' => $s->is_verified,
                'product' => [
                    'name' => $s->product->name,
                    'slug' => $s->product->slug,
                    'image_url' => $s->product->images->first()?->url(),
                    'category' => $s->product->category ? ['name' => $s->product->category->name, 'slug' => $s->product->category->slug, 'icon' => $s->product->category->icon] : null,
                    'umkm' => $s->product->umkm?->name,
                    'city' => $s->product->umkm?->city,
                ],
            ]);

        return Inertia::render('shop/stories', ['stories' => $stories]);
    }

    public function show(Product $product): Response
    {
        abort_unless($product->isPublished() && $product->story, 404);

        $product->load(['images', 'story', 'category:id,name,slug,icon', 'umkm:id,name,slug,city,tagline,is_demo'])
            ->loadAvg('reviews', 'rating')
            ->loadCount('reviews');

        return Inertia::render('shop/story', [
            'story' => [
                'title' => $product->story->title,
                'body' => $product->story->body,
                'process_note' => $product->story->process_note,
                'material_note' => $product->story->material_note,
                'cultural_note' => $product->story->cultural_note,
                'is_verified' => $product->story->is_verified,
            ],
            'product' => ProductCardResource::make($product)->resolve(),
            'umkm' => [
                'name' => $product->umkm->name,
                'slug' => $product->umkm->slug,
                'city' => $product->umkm->city,
                'tagline' => $product->umkm->tagline,
            ],
        ]);
    }
}
