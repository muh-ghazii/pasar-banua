<?php

namespace App\Http\Responses;

use Inertia\Inertia;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Symfony\Component\HttpFoundation\Response;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request): Response
    {
        if ($request->wantsJson()) {
            return response()->json('', 201);
        }

        $user = $request->user();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $user->isSeller()
                ? 'Selamat datang! Lengkapi profil dan produk UMKM Anda. Admin akan memverifikasi pendaftaran Anda.'
                : 'Akun berhasil dibuat. Selamat berbelanja di Pasar Banua!',
        ]);

        return redirect()->intended($user->role->homePath());
    }
}
