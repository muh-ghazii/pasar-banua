<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ProductStatus;
use App\Enums\UmkmStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\UmkmProfile;
use App\Services\AnalyticsService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(AnalyticsService $analytics): Response
    {
        $pendingUmkm = UmkmProfile::where('status', UmkmStatus::Pending)
            ->with('user:id,name,email')
            ->withCount('products')
            ->oldest()
            ->limit(5)
            ->get()
            ->map(fn (UmkmProfile $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'city' => $u->city,
                'owner' => $u->user?->name,
                'products_count' => (int) $u->products_count,
                'created_at' => $u->created_at?->toIso8601String(),
            ]);

        $pendingProducts = Product::where('status', ProductStatus::Pending)
            ->with(['images', 'umkm:id,name', 'category:id,name,slug,icon'])
            ->oldest()
            ->limit(5)
            ->get()
            ->map(fn (Product $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'price' => $p->price,
                'umkm' => $p->umkm?->name,
                'category' => $p->category?->name,
                'category_slug' => $p->category?->slug,
                'category_icon' => $p->category?->icon,
                'image_url' => $p->images->first()?->url(),
                'created_at' => $p->created_at?->toIso8601String(),
            ]);

        $latestOrders = Order::with(['umkm:id,name', 'user:id,name'])
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (Order $o) => [
                'number' => $o->number,
                'status' => $o->status->value,
                'total' => $o->total,
                'buyer' => $o->user?->name,
                'umkm' => $o->umkm?->name,
                'is_demo' => $o->is_demo,
                'created_at' => $o->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/dashboard', [
            'kpis' => $analytics->kpis(),
            'totals' => $analytics->totals(),
            'trend' => $analytics->monthlyTrend(6),
            'pendingUmkm' => $pendingUmkm,
            'pendingProducts' => $pendingProducts,
            'latestOrders' => $latestOrders,
        ]);
    }
}
