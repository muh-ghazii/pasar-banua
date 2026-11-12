<?php

namespace App\Http\Controllers\Seller;

use App\Enums\OrderStatus;
use App\Enums\ProductStatus;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\TrainingMaterial;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends SellerController
{
    private const TREND_WEEKS = 12;

    public function __invoke(Request $request): Response
    {
        $umkm = $this->umkm($request);
        $user = $request->user();

        $products = Product::query()->where('umkm_profile_id', $umkm->id);
        $orders = Order::query()->where('umkm_profile_id', $umkm->id);

        $statusCounts = (clone $orders)->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');
        $count = fn (OrderStatus $s) => (int) ($statusCounts[$s->value] ?? 0);

        // Pendapatan UMKM dihitung dari subtotal barang (ongkir tidak termasuk).
        $revenueCompleted = (int) (clone $orders)->where('status', OrderStatus::Completed)->sum('subtotal');
        $revenueInProgress = (int) (clone $orders)
            ->whereIn('status', [OrderStatus::Pending, OrderStatus::Processing, OrderStatus::Shipped])
            ->sum('subtotal');

        $latestOrders = (clone $orders)
            ->with(['items', 'user:id,name,email'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Order $o) => OrderResource::make($o)->resolve($request))
            ->all();

        $lowStock = (clone $products)
            ->with('images')
            ->where('is_active', true)
            ->where('stock', '<=', StockController::LOW_STOCK)
            ->orderBy('stock')
            ->limit(5)
            ->get()
            ->map(fn (Product $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'stock' => $p->stock,
                'image_url' => $p->images->first()?->url(),
            ])->all();

        $topProducts = (clone $products)
            ->with('images')
            ->where('sold_count', '>', 0)
            ->orderByDesc('sold_count')
            ->limit(5)
            ->get()
            ->map(fn (Product $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'sold_count' => $p->sold_count,
                'price' => $p->price,
                'image_url' => $p->images->first()?->url(),
            ])->all();

        $trainingTotal = TrainingMaterial::published()->count();
        $trainingDone = $user->completedTrainings()->where('is_published', true)->count();

        return Inertia::render('seller/dashboard', [
            'umkm' => [
                'name' => $umkm->name,
                'slug' => $umkm->slug,
                'status' => $umkm->status->value,
                'status_label' => $umkm->status->label(),
                'rejection_reason' => $umkm->rejection_reason,
                'is_demo' => $umkm->is_demo,
                'profile_complete' => filled($umkm->description) && filled($umkm->logo_path),
            ],
            'stats' => [
                'active_products' => (clone $products)->where('status', ProductStatus::Approved)->where('is_active', true)->count(),
                'pending_products' => (clone $products)->where('status', ProductStatus::Pending)->count(),
                'rejected_products' => (clone $products)->where('status', ProductStatus::Rejected)->count(),
                'total_products' => (clone $products)->count(),
                'total_orders' => (int) $statusCounts->sum(),
                'to_process' => $count(OrderStatus::Pending) + $count(OrderStatus::Processing),
                'awaiting_confirmation' => $count(OrderStatus::Pending),
                'completed_orders' => $count(OrderStatus::Completed),
                'revenue_completed' => $revenueCompleted,
                'revenue_in_progress' => $revenueInProgress,
            ],
            'orderStatus' => collect(OrderStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'count' => $count($s),
            ])->all(),
            'trend' => $this->weeklyTrend($umkm->id),
            'latestOrders' => $latestOrders,
            'lowStock' => $lowStock,
            'topProducts' => $topProducts,
            'training' => ['completed' => $trainingDone, 'total' => $trainingTotal],
        ]);
    }

    /**
     * Penjualan mingguan (subtotal pesanan yang tidak dibatalkan) selama 12 minggu terakhir.
     * Pengelompokan dilakukan di PHP agar portabel antara MySQL dan SQLite.
     *
     * @return array<int, array{label: string, value: int}>
     */
    private function weeklyTrend(int $umkmId): array
    {
        $start = CarbonImmutable::now()->startOfWeek()->subWeeks(self::TREND_WEEKS - 1);

        $rows = Order::query()
            ->where('umkm_profile_id', $umkmId)
            ->where('status', '!=', OrderStatus::Cancelled)
            ->where('created_at', '>=', $start)
            ->get(['created_at', 'subtotal']);

        $buckets = [];

        for ($i = 0; $i < self::TREND_WEEKS; $i++) {
            $buckets[$start->addWeeks($i)->format('Y-m-d')] = 0;
        }

        foreach ($rows as $row) {
            $key = CarbonImmutable::parse($row->created_at)->startOfWeek()->format('Y-m-d');

            if (array_key_exists($key, $buckets)) {
                $buckets[$key] += (int) $row->subtotal;
            }
        }

        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        return collect($buckets)->map(function ($value, $date) use ($months) {
            $d = CarbonImmutable::parse($date);

            return ['label' => $d->day.' '.$months[$d->month - 1], 'value' => $value];
        })->values()->all();
    }
}
