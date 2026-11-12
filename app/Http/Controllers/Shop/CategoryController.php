<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Services\CatalogService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(CatalogService $catalog): Response
    {
        return Inertia::render('shop/categories', [
            'categories' => $catalog->categories(),
        ]);
    }

    public function show(string $slug): RedirectResponse
    {
        return redirect()->route('catalog.index', ['kategori' => $slug]);
    }
}
