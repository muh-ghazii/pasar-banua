<?php

namespace App\Http\Controllers\Shop;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\ReviewRequest;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function store(ReviewRequest $request, Product $product): RedirectResponse
    {
        $user = $request->user();

        // Hanya pembeli yang pesanannya sudah selesai yang boleh mengulas.
        $purchased = Order::where('user_id', $user->id)
            ->where('status', OrderStatus::Completed)
            ->whereHas('items', fn ($q) => $q->where('product_id', $product->id))
            ->exists();

        abort_unless($purchased, 403, 'Ulasan hanya dapat diberikan setelah pesanan produk ini selesai.');

        $product->reviews()->updateOrCreate(
            ['user_id' => $user->id],
            ['rating' => $request->integer('rating'), 'comment' => $request->input('comment')],
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Terima kasih, ulasan Anda tersimpan.']);

        return back();
    }
}
