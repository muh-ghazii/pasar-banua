<?php

namespace App\Http\Controllers\Account;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $status = OrderStatus::tryFrom((string) $status);

        $base = Order::query()->where('user_id', $request->user()->id);

        $counts = (clone $base)->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        $orders = (clone $base)
            ->when($status, fn ($q) => $q->where('status', $status))
            ->with(['items', 'umkm:id,name,slug,city'])
            ->latest()
            ->paginate(8)
            ->withQueryString();

        $orders->through(fn (Order $o) => OrderResource::make($o)->resolve($request));

        return Inertia::render('shop/orders', [
            'orders' => $orders,
            'status' => $status?->value,
            'counts' => collect(OrderStatus::cases())->mapWithKeys(fn ($s) => [$s->value => (int) ($counts[$s->value] ?? 0)])->all()
                + ['all' => (int) $counts->sum()],
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        $this->authorize('view', $order);

        $order->load(['items.product:id,slug', 'umkm:id,name,slug,city,phone,whatsapp']);

        return Inertia::render('shop/order-show', [
            'order' => OrderResource::make($order)->resolve($request),
            'sellerContact' => $order->umkm ? ['phone' => $order->umkm->whatsapp ?: $order->umkm->phone] : null,
        ]);
    }

    public function cancel(Request $request, Order $order, OrderService $orders): RedirectResponse
    {
        $this->authorize('cancel', $order);

        $orders->transition($order, OrderStatus::Cancelled, 'Dibatalkan oleh pembeli.', $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => "Pesanan {$order->number} dibatalkan."]);

        return back();
    }

    public function received(Request $request, Order $order, OrderService $orders): RedirectResponse
    {
        $this->authorize('confirmReceived', $order);

        $orders->transition($order, OrderStatus::Completed, null, $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Terima kasih! Pesanan ditandai selesai. Anda kini dapat memberi ulasan.']);

        return back();
    }
}
