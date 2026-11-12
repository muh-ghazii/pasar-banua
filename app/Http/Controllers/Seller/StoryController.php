<?php

namespace App\Http\Controllers\Seller;

use App\Http\Requests\Seller\ProductStoryRequest;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoryController extends SellerController
{
    public function index(Request $request): Response
    {
        $umkm = $this->umkm($request);
        $filter = in_array($request->query('filter'), ['ada', 'belum'], true) ? (string) $request->query('filter') : 'semua';

        $base = Product::query()->where('umkm_profile_id', $umkm->id);

        $total = (clone $base)->count();
        $withStory = (clone $base)->whereHas('story')->count();

        $products = (clone $base)
            ->with(['images', 'category:id,name,slug,icon', 'story'])
            ->when($filter === 'ada', fn ($q) => $q->whereHas('story'))
            ->when($filter === 'belum', fn ($q) => $q->whereDoesntHave('story'))
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Product $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'status' => $p->status->value,
                'image_url' => $p->images->first()?->url(),
                'category' => $p->category ? ['name' => $p->category->name, 'slug' => $p->category->slug, 'icon' => $p->category->icon] : null,
                'story' => $p->story ? [
                    'title' => $p->story->title,
                    'excerpt' => str($p->story->body)->limit(140)->toString(),
                    'is_verified' => $p->story->is_verified,
                    'updated_at' => $p->story->updated_at?->toIso8601String(),
                ] : null,
            ]);

        return Inertia::render('seller/stories/index', [
            'products' => $products,
            'summary' => ['total' => $total, 'with_story' => $withStory],
            'filters' => ['filter' => $filter],
        ]);
    }

    public function edit(Request $request, Product $product): Response
    {
        $this->authorizeProduct($request, $product);

        $product->load(['images', 'story', 'category:id,name,slug,icon']);
        $story = $product->story;

        return Inertia::render('seller/stories/edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'status' => $product->status->value,
                'image_url' => $product->images->first()?->url(),
                'category' => $product->category ? ['name' => $product->category->name, 'slug' => $product->category->slug, 'icon' => $product->category->icon] : null,
            ],
            'story' => $story ? [
                'title' => $story->title,
                'body' => $story->body,
                'process_note' => $story->process_note,
                'material_note' => $story->material_note,
                'cultural_note' => $story->cultural_note,
                'is_verified' => $story->is_verified,
                'updated_at' => $story->updated_at?->toIso8601String(),
            ] : null,
        ]);
    }

    public function update(ProductStoryRequest $request, Product $product): RedirectResponse
    {
        $this->authorizeProduct($request, $product);

        // Cerita yang ditulis/diubah UMKM selalu berstatus belum diverifikasi
        // dan ditampilkan ke publik dengan label "konten contoh".
        $product->story()->updateOrCreate([], [...$request->validated(), 'is_verified' => false]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Cerita \"{$product->name}\" tersimpan."]);

        return to_route('seller.stories.index');
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $this->authorizeProduct($request, $product);

        $product->story()->delete();

        Inertia::flash('toast', ['type' => 'info', 'message' => "Cerita \"{$product->name}\" dihapus."]);

        return to_route('seller.stories.index');
    }
}
