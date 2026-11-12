<?php

use App\Http\Controllers\Seller\DashboardController;
use App\Http\Controllers\Seller\OrderController;
use App\Http\Controllers\Seller\ProductController;
use App\Http\Controllers\Seller\ProfileController;
use App\Http\Controllers\Seller\StockController;
use App\Http\Controllers\Seller\StoryController;
use App\Http\Controllers\Seller\TrainingController;
use Illuminate\Support\Facades\Route;

// Rute dashboard UMKM. Dimuat dari routes/web.php dengan prefix `/seller`,
// nama `seller.*`, dan middleware `auth` + `can:access-seller`.
// Kepemilikan data (produk/pesanan milik UMKM sendiri) diperiksa lewat Policy
// di setiap controller.

Route::get('/', DashboardController::class)->name('dashboard');

Route::get('produk', [ProductController::class, 'index'])->name('products.index');
Route::get('produk/tambah', [ProductController::class, 'create'])->name('products.create');
Route::post('produk', [ProductController::class, 'store'])->middleware('throttle:uploads')->name('products.store');
Route::get('produk/{product}/ubah', [ProductController::class, 'edit'])->name('products.edit');
Route::put('produk/{product}', [ProductController::class, 'update'])->middleware('throttle:uploads')->name('products.update');
Route::patch('produk/{product}/aktif', [ProductController::class, 'toggle'])->name('products.toggle');
Route::delete('produk/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

Route::get('pesanan', [OrderController::class, 'index'])->name('orders.index');
Route::get('pesanan/{order}', [OrderController::class, 'show'])->name('orders.show');
Route::post('pesanan/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.status');

Route::get('stok', [StockController::class, 'index'])->name('stock.index');
Route::patch('stok/{product}', [StockController::class, 'update'])->name('stock.update');

Route::get('profil', [ProfileController::class, 'edit'])->name('profile.edit');
Route::put('profil', [ProfileController::class, 'update'])->middleware('throttle:uploads')->name('profile.update');

Route::get('cerita', [StoryController::class, 'index'])->name('stories.index');
Route::get('cerita/{product}', [StoryController::class, 'edit'])->name('stories.edit');
Route::put('cerita/{product}', [StoryController::class, 'update'])->name('stories.update');
Route::delete('cerita/{product}', [StoryController::class, 'destroy'])->name('stories.destroy');

Route::get('pelatihan', [TrainingController::class, 'index'])->name('training.index');
Route::get('pelatihan/{training}', [TrainingController::class, 'show'])->name('training.show');
Route::post('pelatihan/{training}/selesai', [TrainingController::class, 'complete'])->name('training.complete');
