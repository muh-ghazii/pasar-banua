<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReasonRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\UmkmProfile;
use App\Services\OrderService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $status = OrderStatus::tryFrom((string) $request->query('status'));
        $filters = [
            'status' => $status?->value,
            'q' => trim((string) $request->query('q', '')),
            'umkm' => $request->integer('umkm') ?: null,
        ];

        $counts = Order::query()->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');

        $orders = Order::query()
            ->with(['umkm:id,name,slug,city', 'user:id,name,email'])
            ->withCount('items')
            ->when($status, fn (Builder $q) => $q->where('status', $status))
            ->when($filters['umkm'], fn (Builder $q) => $q->where('umkm_profile_id', $filters['umkm']))
            ->when($filters['q'] !== '', function (Builder $q) use ($filters) {
                $term = '%'.addcslashes($filters['q'], '\\%_').'%';
                $q->where(fn (Builder $w) => $w->where('number', 'like', $term)
                    ->orWhere('recipient_name', 'like', $term)
                    ->orWhereHas('user', fn (Builder $u) => $u->where('name', 'like', $term)->orWhere('email', 'like', $term)));
            })
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Order $o) => [
                'id' => $o->id,
                'number' => $o->number,
                'status' => $o->status->value,
                'total' => $o->total,
                'items_count' => (int) $o->items_count,
                'buyer' => $o->user ? ['name' => $o->user->name, 'email' => $o->user->email] : null,
                'umkm' => $o->umkm ? ['name' => $o->umkm->name, 'city' => $o->umkm->city] : null,
                'payment_label' => OrderResource::PAYMENT_LABELS[$o->payment_method] ?? $o->payment_method,
                'is_demo' => $o->is_demo,
                'created_at' => $o->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/orders-index', [
            'orders' => $orders,
            'filters' => $filters,
            'counts' => collect(OrderStatus::cases())->mapWithKeys(fn ($s) => [$s->value => (int) ($counts[$s->value] ?? 0)])->all()
                + ['all' => (int) $counts->sum()],
            'umkms' => UmkmProfile::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        $order->load(['items.product:id,slug', 'umkm:id,name,slug,city,phone,whatsapp', 'user:id,name,email,phone']);

        return Inertia::render('admin/order-show', [
            'order' => OrderResource::make($order)->resolve($request),
            'buyerPhone' => $order->user?->phone,
            'sellerContact' => $order->umkm ? [
                'phone' => $order->umkm->whatsapp ?: $order->umkm->phone,
                'id' => $order->umkm->id,
            ] : null,
            'canCancel' => ! $order->status->isFinal(),
        ]);
    }

    public function cancel(ReasonRequest $request, Order $order, OrderService $orders): RedirectResponse
    {
        if ($order->status->isFinal()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Pesanan yang sudah selesai atau dibatalkan tidak dapat diubah.']);

            return back();
        }

        $orders->transition($order, OrderStatus::Cancelled, 'Dibatalkan admin: '.$request->validated('reason'), $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => "Pesanan {$order->number} dibatalkan dan stok dikembalikan."]);

        return back();
    }
}
