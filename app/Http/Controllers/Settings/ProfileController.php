<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'canDelete' => ! $request->user()->isAdmin(),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated())->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Profil berhasil diperbarui.']);

        return to_route('profile.edit');
    }

    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        abort_if($user->isAdmin(), 403, 'Akun admin tidak dapat dihapus dari sini.');

        if ($user->orders()->exists()) {
            return back()->withErrors(['password' => 'Akun yang memiliki riwayat pesanan tidak dapat dihapus. Hubungi admin untuk bantuan.']);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
