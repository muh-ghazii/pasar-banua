<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\UmkmProfile;
use Illuminate\Http\Request;

/**
 * Dasar controller dashboard UMKM. Semua query dibatasi ke profil UMKM milik
 * pengguna yang sedang login.
 */
abstract class SellerController extends Controller
{
    protected function umkm(Request $request): UmkmProfile
    {
        $umkm = $request->user()->umkmProfile;

        abort_unless($umkm instanceof UmkmProfile, 403);

        return $umkm;
    }

    /**
     * Pastikan produk milik UMKM ini. Produk UMKM lain dibalas 403 lewat Policy.
     */
    protected function authorizeProduct(Request $request, Product $product): void
    {
        $this->authorize('update', $product);
        abort_unless($product->umkm_profile_id === $this->umkm($request)->id, 403);
    }
}
