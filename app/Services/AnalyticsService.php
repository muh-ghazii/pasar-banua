<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\ProductStatus;
use App\Enums\Role;
use App\Enums\UmkmStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\UmkmProfile;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * Agregasi data untuk dashboard admin dan halaman analitik.
 * Query dibuat portabel (MySQL & SQLite) — pengelompokan per periode
 * dilakukan di PHP agar tidak bergantung pada fungsi tanggal spesifik database.
 */
class AnalyticsService
{
    /**
     * Pesanan yang dihitung sebagai transaksi (bukan dibatalkan).
     */
    private function transactions()
    {
        return Order::query()->where('status', '!=', OrderStatus::Cancelled->value);
    }

    /**
     * Angka aktual yang dibandingkan dengan target proyek.
     *
     * @return array<string, mixed>
     */
    public function kpis(): array
    {
        $targets = config('pasarbanua.targets');
        $months = (int) $targets['transaction_growth_months'];
        $now = CarbonImmutable::now();

        $current = $this->transactions()->where('created_at', '>=', $now->subMonths($months))->count();
        $previous = $this->transactions()
            ->where('created_at', '>=', $now->subMonths($months * 2))
            ->where('created_at', '<', $now->subMonths($months))
            ->count();

        $growth = $previous > 0 ? round(($current - $previous) / $previous * 100, 1) : null;
        $rating = ProductReview::avg('rating');

        $sellers = User::where('role', Role::Seller)->count();
        $publishedTrainings = DB::table('training_materials')->where('is_published', true)->count();
        $completions = $publishedTrainings > 0 && $sellers > 0
            ? DB::table('training_progress')
                ->join('training_materials', 'training_materials.id', '=', 'training_progress.training_material_id')
                ->join('users', 'users.id', '=', 'training_progress.user_id')
                ->where('training_materials.is_published', true)
                ->where('users.role', Role::Seller->value)
                ->count()
            : 0;

        return [
            'active_umkm' => [
                'actual' => UmkmProfile::approved()->count(),
                'target' => (int) $targets['active_umkm'],
            ],
            'transaction_growth' => [
                'actual' => $growth,
                'target' => (int) $targets['transaction_growth_percent'],
                'months' => $months,
                'current' => $current,
                'previous' => $previous,
            ],
            'satisfaction' => [
                'actual' => $rating !== null ? round((float) $rating, 2) : null,
                'target' => (float) $targets['satisfaction_min'],
                'reviews' => ProductReview::count(),
            ],
            'training' => [
                'actual' => $publishedTrainings > 0 && $sellers > 0
                    ? round($completions / ($publishedTrainings * $sellers) * 100, 1)
                    : null,
                'target' => (int) $targets['training_completion_percent'],
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function totals(): array
    {
        $tx = $this->transactions();

        return [
            'umkm_active' => UmkmProfile::approved()->count(),
            'umkm_pending' => UmkmProfile::where('status', UmkmStatus::Pending)->count(),
            'products' => Product::count(),
            'products_published' => Product::published()->count(),
            'products_pending' => Product::where('status', ProductStatus::Pending)->count(),
            'orders' => (clone $tx)->count(),
            'gmv' => (int) (clone $tx)->sum('total'),
            'customers' => User::where('role', Role::Customer)->count(),
            'rating' => ($r = ProductReview::avg('rating')) !== null ? round((float) $r, 2) : null,
            'reviews' => ProductReview::count(),
            'has_demo' => Order::where('is_demo', true)->exists() || UmkmProfile::where('is_demo', true)->exists(),
        ];
    }

    /**
     * Tren transaksi per bulan (12 bulan terakhir).
     *
     * @return array<int, array{label: string, key: string, orders: int, revenue: int}>
     */
    public function monthlyTrend(int $months = 12): array
    {
        $start = CarbonImmutable::now()->startOfMonth()->subMonths($months - 1);

        $rows = $this->transactions()
            ->where('created_at', '>=', $start)
            ->get(['created_at', 'total']);

        $buckets = [];

        for ($i = 0; $i < $months; $i++) {
            $month = $start->addMonths($i);
            $buckets[$month->format('Y-m')] = [
                'label' => $month->locale('id')->translatedFormat('M y'),
                'key' => $month->format('Y-m'),
                'orders' => 0,
                'revenue' => 0,
            ];
        }

        foreach ($rows as $row) {
            $key = $row->created_at->format('Y-m');

            if (isset($buckets[$key])) {
                $buckets[$key]['orders']++;
                $buckets[$key]['revenue'] += (int) $row->total;
            }
        }

        return array_values($buckets);
    }

    /**
     * Kategori terpopuler berdasarkan jumlah unit terjual.
     *
     * @return array<int, array{name: string, slug: string, quantity: int, revenue: int}>
     */
    public function popularCategories(int $limit = 6): array
    {
        return DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->join('categories', 'categories.id', '=', 'products.category_id')
            ->where('orders.status', '!=', OrderStatus::Cancelled->value)
            ->groupBy('categories.id', 'categories.name', 'categories.slug')
            ->orderByDesc('quantity')
            ->limit($limit)
            ->get([
                'categories.name',
                'categories.slug',
                DB::raw('SUM(order_items.quantity) as quantity'),
                DB::raw('SUM(order_items.subtotal) as revenue'),
            ])
            ->map(fn ($r) => [
                'name' => $r->name,
                'slug' => $r->slug,
                'quantity' => (int) $r->quantity,
                'revenue' => (int) $r->revenue,
            ])
            ->all();
    }

    /**
     * @return array<int, array{name: string, slug: string, city: string, orders: int, revenue: int}>
     */
    public function topUmkm(int $limit = 5): array
    {
        $rows = $this->transactions()
            ->select('umkm_profile_id', DB::raw('COUNT(*) as orders'), DB::raw('SUM(total) as revenue'))
            ->groupBy('umkm_profile_id')
            ->orderByDesc('revenue')
            ->limit($limit)
            ->get();

        $profiles = UmkmProfile::whereIn('id', $rows->pluck('umkm_profile_id'))->get(['id', 'name', 'slug', 'city'])->keyBy('id');

        return $rows->map(fn ($r) => [
            'id' => (int) $r->umkm_profile_id,
            'name' => $profiles[$r->umkm_profile_id]->name ?? '-',
            'slug' => $profiles[$r->umkm_profile_id]->slug ?? '',
            'city' => $profiles[$r->umkm_profile_id]->city ?? '',
            'orders' => (int) $r->orders,
            'revenue' => (int) $r->revenue,
        ])->all();
    }

    /**
     * @return array<int, array{status: string, label: string, count: int}>
     */
    public function statusDistribution(): array
    {
        $counts = Order::query()->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');

        return collect(OrderStatus::cases())->map(fn (OrderStatus $s) => [
            'status' => $s->value,
            'label' => $s->label(),
            'count' => (int) ($counts[$s->value] ?? 0),
        ])->all();
    }

    /**
     * @return array<int, array{rating: int, count: int}>
     */
    public function ratingDistribution(): array
    {
        $counts = ProductReview::query()->selectRaw('rating, COUNT(*) as total')->groupBy('rating')->pluck('total', 'rating');

        return collect([5, 4, 3, 2, 1])->map(fn ($r) => ['rating' => $r, 'count' => (int) ($counts[$r] ?? 0)])->all();
    }
}
