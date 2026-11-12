<?php

namespace App\Http\Controllers\Seller;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends SellerController
{
    /** Batas stok yang dianggap menipis. */
    public const LOW_STOCK = 5;

    public function index(Request $request): Response
    {
        $umkm = $this->umkm($request);
        $filter = in_array($request->query('filter'), ['menipis', 'habis'], true) ? (string) $request->query('filter') : 'semua';
        $q = trim((string) $request->query('q', ''));

        $base = Product::query()->where('umkm_profile_id', $umkm->id);

        $summary = [
            'total' => (clone $base)->count(),
            'units' => (int) (clone $base)->sum('stock'),
            'low' => (clone $base)->whereBetween('stock', [1, self::LOW_STOCK])->count(),
            'empty' => (clone $base)->where('stock', 0)->count(),
        ];

        $products = (clone $base)
            ->with(['images', 'category:id,name,slug,icon'])
            ->when($filter === 'menipis', fn (Builder $query) => $query->whereBetween('stock', [1, self::LOW_STOCK]))
            ->when($filter === 'habis', fn (Builder $query) => $query->where('stock', 0))
            ->when($q !== '', fn (Builder $query) => $query->where('name', 'like', '%'.addcslashes($q, '\\%_').'%'))
            ->orderBy('stock')
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Product $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'stock' => $p->stock,
                'price' => $p->price,
                'sold_count' => $p->sold_count,
                'is_active' => $p->is_active,
                'status' => $p->status->value,
                'image_url' => $p->images->first()?->url(),
                'category' => $p->category ? ['name' => $p->category->name, 'slug' => $p->category->slug, 'icon' => $p->category->icon] : null,
                'updated_at' => $p->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('seller/stock', [
            'products' => $products,
            'summary' => $summary,
            'filters' => ['filter' => $filter, 'q' => $q],
            'lowStock' => self::LOW_STOCK,
        ]);
    }

    /**
     * Ubah stok saja. Perubahan stok tidak memicu kurasi ulang.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $this->authorizeProduct($request, $product);

        $data = $request->validate(
            ['stock' => ['required', 'integer', 'min:0', 'max:100000']],
            [],
            ['stock' => 'stok'],
        );

        $product->update(['stock' => $data['stock']]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Stok \"{$product->name}\" diperbarui menjadi {$product->stock}."]);

        return back();
    }
}
