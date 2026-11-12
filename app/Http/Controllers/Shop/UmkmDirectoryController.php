<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\UmkmProfile;
use App\Services\CatalogService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UmkmDirectoryController extends Controller
{
    public function index(Request $request, CatalogService $catalog): Response
    {
        $city = (string) $request->query('kota', '');

        $umkms = UmkmProfile::approved()
            ->withCount(['products as products_count' => fn (Builder $q) => $q->published()])
            ->whereHas('products', fn (Builder $q) => $q->published())
            ->when($city !== '', fn ($q) => $q->where('city', $city))
            ->orderByDesc('products_count')
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (UmkmProfile $u) => $catalog->umkmCard($u));

        return Inertia::render('shop/umkm-index', [
            'umkms' => $umkms,
            'cities' => $catalog->cities(),
            'filters' => ['kota' => $city],
        ]);
    }

    public function show(Request $request, UmkmProfile $umkm, CatalogService $catalog): Response
    {
        abort_unless($umkm->isApproved(), 404);

        ['products' => $products, 'filters' => $filters] = $catalog->search($request, 12, $umkm);

        return Inertia::render('shop/umkm-show', [
            'umkm' => [
                'name' => $umkm->name,
                'slug' => $umkm->slug,
                'tagline' => $umkm->tagline,
                'description' => $umkm->description,
                'story' => $umkm->story,
                'city' => $umkm->city,
                'address' => $umkm->address,
                'instagram' => $umkm->instagram,
                'logo_url' => $umkm->logoUrl(),
                'cover_url' => $umkm->coverUrl(),
                'verified_at' => $umkm->verified_at?->toIso8601String(),
                'is_demo' => $umkm->is_demo,
            ],
            'products' => $products,
            'filters' => $filters,
        ]);
    }
}
