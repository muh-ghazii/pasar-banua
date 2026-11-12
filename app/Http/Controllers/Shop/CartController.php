<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\AddToCartRequest;
use App\Models\CartItem;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cart) {}

    public function index(Request $request): Response
    {
        return Inertia::render('shop/cart', [
            'cart' => $this->cart->summary($request->user()),
        ]);
    }

    public function store(AddToCartRequest $request): RedirectResponse
    {
        $product = Product::with('umkm')->findOrFail($request->integer('product_id'));

        try {
            $this->cart->add($request->user(), $product, $request->integer('quantity', 1));
        } catch (InvalidArgumentException $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $e->getMessage()]);

            return back();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$product->name} ditambahkan ke keranjang."]);

        return back();
    }

    public function update(Request $request, CartItem $item): RedirectResponse
    {
        $this->authorizeItem($request, $item);

        $data = $request->validate(['quantity' => ['required', 'integer', 'min:1', 'max:99']]);

        try {
            $this->cart->updateQuantity($item->load('product.umkm'), $data['quantity']);
        } catch (InvalidArgumentException $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $e->getMessage()]);
        }

        return back();
    }

    public function destroy(Request $request, CartItem $item): RedirectResponse
    {
        $this->authorizeItem($request, $item);

        $this->cart->remove($item);

        Inertia::flash('toast', ['type' => 'info', 'message' => 'Produk dihapus dari keranjang.']);

        return back();
    }

    /** Item keranjang hanya boleh diubah oleh pemilik keranjangnya. */
    private function authorizeItem(Request $request, CartItem $item): void
    {
        $current = $this->cart->current($request->user());

        abort_unless($current && $item->cart_id === $current->id, 404);
    }
}
