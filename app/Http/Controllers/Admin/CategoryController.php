<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use App\Support\Slug;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::query()
            ->withCount([
                'products',
                'products as published_count' => fn ($q) => $q->published(),
            ])
            ->ordered()
            ->get()
            ->map(fn (Category $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'description' => $c->description,
                'icon' => $c->icon,
                'sort_order' => $c->sort_order,
                'is_active' => $c->is_active,
                'products_count' => (int) $c->products_count,
                'published_count' => (int) $c->published_count,
            ]);

        return Inertia::render('admin/categories', [
            'categories' => $categories,
            'icons' => CategoryRequest::ICONS,
        ]);
    }

    public function store(CategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();

        Category::create([
            ...$data,
            'slug' => Slug::unique(Category::class, $data['name']),
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return $this->done("Kategori \"{$data['name']}\" ditambahkan.");
    }

    public function update(CategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();

        $category->update([
            ...$data,
            // Slug hanya berubah bila nama berubah, agar tautan lama tetap stabil sebisa mungkin.
            'slug' => $category->name === $data['name'] ? $category->slug : Slug::unique(Category::class, $data['name'], $category->id),
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $request->boolean('is_active'),
        ]);

        return $this->done("Kategori \"{$category->name}\" diperbarui.");
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->withTrashed()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => "Kategori \"{$category->name}\" masih dipakai produk. Pindahkan produknya atau nonaktifkan kategori ini.",
            ]);

            return back();
        }

        $category->delete();

        return $this->done("Kategori \"{$category->name}\" dihapus.");
    }

    private function done(string $message): RedirectResponse
    {
        Cache::forget('nav.categories');
        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return back();
    }
}
