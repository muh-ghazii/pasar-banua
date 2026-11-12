<?php

use App\Http\Controllers\Account\OrderController as AccountOrderController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Shop\AboutController;
use App\Http\Controllers\Shop\CartController;
use App\Http\Controllers\Shop\CatalogController;
use App\Http\Controllers\Shop\CategoryController;
use App\Http\Controllers\Shop\CheckoutController;
use App\Http\Controllers\Shop\HomeController;
use App\Http\Controllers\Shop\ReviewController;
use App\Http\Controllers\Shop\StoryController;
use App\Http\Controllers\Shop\UmkmDirectoryController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Publik (pembeli & tamu)
|--------------------------------------------------------------------------
*/
Route::get('/', HomeController::class)->name('home');
Route::get('/tentang', AboutController::class)->name('about');

Route::get('/produk', [CatalogController::class, 'index'])->name('catalog.index');
Route::get('/produk/{product:slug}', [CatalogController::class, 'show'])->name('catalog.show');

Route::get('/kategori', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/kategori/{slug}', [CategoryController::class, 'show'])->name('categories.show');

Route::get('/cerita-banua', [StoryController::class, 'index'])->name('stories.index');
Route::get('/cerita-banua/{product:slug}', [StoryController::class, 'show'])->name('stories.show');

Route::get('/umkm', [UmkmDirectoryController::class, 'index'])->name('umkm.index');
Route::get('/umkm/{umkm:slug}', [UmkmDirectoryController::class, 'show'])->name('umkm.show');

// Keranjang: tersedia untuk tamu (disimpan di database lewat token sesi).
Route::get('/keranjang', [CartController::class, 'index'])->name('cart.index');
Route::middleware('throttle:cart')->group(function () {
    Route::post('/keranjang', [CartController::class, 'store'])->name('cart.store');
    Route::patch('/keranjang/{item}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/keranjang/{item}', [CartController::class, 'destroy'])->name('cart.destroy');
});

/*
|--------------------------------------------------------------------------
| Wajib login
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return redirect(auth()->user()->role->homePath());
    })->name('dashboard');

    Route::get('/checkout', [CheckoutController::class, 'create'])->name('checkout.create');
    Route::post('/checkout', [CheckoutController::class, 'store'])->middleware('throttle:checkout')->name('checkout.store');
    Route::get('/checkout/selesai', [CheckoutController::class, 'success'])->name('checkout.success');

    Route::get('/akun/pesanan', [AccountOrderController::class, 'index'])->name('account.orders.index');
    Route::get('/akun/pesanan/{order}', [AccountOrderController::class, 'show'])->name('account.orders.show');
    Route::post('/akun/pesanan/{order}/batal', [AccountOrderController::class, 'cancel'])->name('account.orders.cancel');
    Route::post('/akun/pesanan/{order}/diterima', [AccountOrderController::class, 'received'])->name('account.orders.received');

    Route::post('/produk/{product:slug}/ulasan', [ReviewController::class, 'store'])->middleware('throttle:reviews')->name('reviews.store');

    Route::post('/notifikasi/baca-semua', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::post('/notifikasi/{id}/baca', [NotificationController::class, 'read'])->name('notifications.read');
});

/*
|--------------------------------------------------------------------------
| Dashboard UMKM dan Admin (dilindungi Gate di backend, bukan hanya menu)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'can:access-seller'])
    ->prefix('seller')
    ->name('seller.')
    ->group(base_path('routes/seller.php'));

Route::middleware(['auth', 'can:access-admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(base_path('routes/admin.php'));

require __DIR__.'/settings.php';
