<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    /**
     * Arahkan pengguna ke halaman tujuan semula, atau ke beranda sesuai role.
     */
    public function toResponse($request): Response
    {
        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        return redirect()->intended($request->user()->role->homePath());
    }
}
