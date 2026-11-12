<?php

namespace App\Http\Controllers\Seller;

use App\Enums\OrderStatus;
use App\Http\Requests\Seller\OrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends SellerController
{
    public function index(Request $request): Response
    {
        $umkm = $this->umkm($request);
        $status = OrderStatus::tryFrom((string) $request->query('status', ''));
        $q = trim((string) $request->query('q', ''));

        $base = Order::query()->where('umkm_profile_id', $umkm->id);

        $counts = (clone $base)->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        $orders = (clone $base)
            ->when($status, fn (Builder $query) => $query->where('status', $status))
            ->when($q !== '', function (Builder $query) use ($q) {
                $term = '%'.addcslashes($q, '\\%_').'%';
                $query->where(fn (Builder $w) => $w->where('number', 'like', $term)->orWhere('recipient_name', 'like', $term));
            })
            ->with(['items', 'user:id,name,email'])
            ->withCount('items')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $orders->through(fn (Order $o) => OrderResource::make($o)->resolve($request));

        return Inertia::render('seller/orders/index', [
            'orders' => $orders,
            'filters' => ['status' => $status?->value ?? '', 'q' => $q],
            'counts' => collect(OrderStatus::cases())->mapWithKeys(fn ($s) => [$s->value => (int) ($counts[$s->value] ?? 0)])->all()
                + ['all' => (int) $counts->sum()],
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        $this->authorizeOrder($request, $order);

        $order->load(['items.product:id,slug', 'user:id,name,email', 'umkm:id,name,slug,city']);

        return Inertia::render('seller/orders/show', [
            'order' => OrderResource::make($order)->resolve($request),
        ]);
    }

    public function updateStatus(OrderStatusRequest $request, Order $order, OrderService $orders): RedirectResponse
    {
        $this->authorizeOrder($request, $order);

        $to = OrderStatus::from($request->string('status')->toString());
        $note = $request->filled('note') ? $request->string('note')->toString() : null;

        $orders->transition($order, $to, $note, $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => "Pesanan {$order->number} kini berstatus: {$to->label()}."]);

        return back();
    }

    /**
     * Pesanan UMKM lain dibalas 404 agar keberadaannya tidak bocor.
     */
    private function authorizeOrder(Request $request, Order $order): void
    {
        abort_unless($order->umkm_profile_id === $this->umkm($request)->id, 404);
    }
}
