<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\UmkmProfile;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    public function __invoke(): Response
    {
        $path = resource_path('data/photo-credits.json');

        return Inertia::render('shop/about', [
            'credits' => File::exists($path) ? json_decode(File::get($path), true) : [],
            'stats' => [
                'umkm' => UmkmProfile::approved()->count(),
                'products' => Product::published()->count(),
            ],
            'targets' => config('pasarbanua.targets'),
        ]);
    }
}
