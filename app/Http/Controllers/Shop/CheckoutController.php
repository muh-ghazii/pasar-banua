<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\CartService;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function create(Request $request, CartService $cart): Response|RedirectResponse
    {
        $user = $request->user();
        $summary = $cart->summary($user);

        if ($summary['items_count'] === 0) {
            Inertia::flash('toast', ['type' => 'info', 'message' => 'Keranjang Anda masih kosong.']);

            return to_route('cart.index');
        }

        return Inertia::render('shop/checkout', [
            'cart' => $summary,
            'addresses' => $user->addresses()->orderByDesc('is_default')->latest()->get()->map(fn ($a) => [
                'id' => $a->id,
                'label' => $a->label,
                'recipient_name' => $a->recipient_name,
                'phone' => $a->phone,
                'address_line' => $a->address_line,
                'city' => $a->city,
                'postal_code' => $a->postal_code,
                'is_default' => $a->is_default,
            ])->all(),
            'defaults' => [
                'recipient_name' => $user->name,
                'phone' => $user->phone,
            ],
            'paymentMethods' => collect(OrderResource::PAYMENT_LABELS)->map(fn ($label, $value) => [
                'value' => $value,
                'label' => $label,
            ])->values()->all(),
        ]);
    }

    public function store(CheckoutRequest $request, OrderService $orders, CartService $cart): RedirectResponse
    {
        $summary = $cart->summary($request->user());

        if ($summary['has_issues']) {
            return back()->withErrors(['cart' => 'Ada produk yang stoknya habis. Hapus produk tersebut dari keranjang sebelum checkout.']);
        }

        $placed = $orders->placeFromCart($request->user(), [
            ...$request->validated(),
            'save_address' => $request->boolean('save_address'),
        ]);

        $request->session()->flash('placed_orders', $placed->pluck('number')->all());

        return to_route('checkout.success');
    }

    public function success(Request $request): Response|RedirectResponse
    {
        $numbers = $request->session()->get('placed_orders');

        if (! $numbers) {
            return to_route('account.orders.index');
        }

        $request->session()->keep('placed_orders');

        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('number', $numbers)
            ->with(['items', 'umkm:id,name,slug,city'])
            ->get();

        return Inertia::render('shop/checkout-success', [
            'orders' => OrderResource::collection($orders)->resolve(),
        ]);
    }
}
