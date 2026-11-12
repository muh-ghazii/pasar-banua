<?php

// Rute dashboard Admin. Dimuat dari routes/web.php dengan prefix `/admin`,
// nama `admin.*`, dan middleware `auth` + `can:access-admin`.

use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\TrainingController;
use App\Http\Controllers\Admin\UmkmController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', DashboardController::class)->name('dashboard');

// Data UMKM & verifikasi
Route::get('/umkm', [UmkmController::class, 'index'])->name('umkm.index');
Route::get('/umkm/{umkm:id}', [UmkmController::class, 'show'])->name('umkm.show');
Route::put('/umkm/{umkm:id}', [UmkmController::class, 'update'])->name('umkm.update');
Route::post('/umkm/{umkm:id}/setujui', [UmkmController::class, 'approve'])->name('umkm.approve');
Route::post('/umkm/{umkm:id}/tolak', [UmkmController::class, 'reject'])->name('umkm.reject');
Route::post('/umkm/{umkm:id}/nonaktifkan', [UmkmController::class, 'suspend'])->name('umkm.suspend');
Route::post('/umkm/{umkm:id}/aktifkan', [UmkmController::class, 'reactivate'])->name('umkm.reactivate');

// Kurasi produk
Route::get('/produk', [ProductController::class, 'index'])->name('products.index');
Route::get('/produk/{product:id}', [ProductController::class, 'show'])->name('products.show')->withTrashed();
Route::post('/produk/{product:id}/setujui', [ProductController::class, 'approve'])->name('products.approve');
Route::post('/produk/{product:id}/tolak', [ProductController::class, 'reject'])->name('products.reject');
Route::post('/produk/{product:id}/unggulan', [ProductController::class, 'toggleFeatured'])->name('products.featured');
Route::post('/produk/{product:id}/tampil', [ProductController::class, 'toggleActive'])->name('products.active');

// Kategori
Route::get('/kategori', [CategoryController::class, 'index'])->name('categories.index');
Route::post('/kategori', [CategoryController::class, 'store'])->name('categories.store');
Route::put('/kategori/{category:id}', [CategoryController::class, 'update'])->name('categories.update');
Route::delete('/kategori/{category:id}', [CategoryController::class, 'destroy'])->name('categories.destroy');

// Pesanan
Route::get('/pesanan', [OrderController::class, 'index'])->name('orders.index');
Route::get('/pesanan/{order:number}', [OrderController::class, 'show'])->name('orders.show');
Route::post('/pesanan/{order:number}/batalkan', [OrderController::class, 'cancel'])->name('orders.cancel');

// Pengguna
Route::get('/pengguna', [UserController::class, 'index'])->name('users.index');
Route::post('/pengguna/{user}/status', [UserController::class, 'toggleActive'])->name('users.toggle');

// Pelatihan UMKM
Route::get('/pelatihan', [TrainingController::class, 'index'])->name('training.index');
Route::get('/pelatihan/baru', [TrainingController::class, 'create'])->name('training.create');
Route::post('/pelatihan', [TrainingController::class, 'store'])->name('training.store');
Route::get('/pelatihan/{training:id}/ubah', [TrainingController::class, 'edit'])->name('training.edit');
Route::put('/pelatihan/{training:id}', [TrainingController::class, 'update'])->name('training.update');
Route::post('/pelatihan/{training:id}/terbit', [TrainingController::class, 'togglePublished'])->name('training.publish');
Route::delete('/pelatihan/{training:id}', [TrainingController::class, 'destroy'])->name('training.destroy');

// Analitik
Route::get('/analitik', AnalyticsController::class)->name('analytics');
