<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Enums\Role;
use App\Enums\UmkmStatus;
use App\Models\UmkmProfile;
use App\Models\User;
use App\Support\Slug;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validasi dan buat pengguna baru. Admin tidak dapat dibuat lewat registrasi publik.
     * Pendaftar UMKM otomatis memperoleh profil UMKM berstatus "menunggu verifikasi".
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $isSeller = ($input['role'] ?? null) === Role::Seller->value;

        $validated = Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'role' => ['required', Rule::in([Role::Customer->value, Role::Seller->value])],
            'phone' => [$isSeller ? 'required' : 'nullable', 'string', 'max:30', 'regex:/^[0-9+\-\s()]{8,30}$/'],
            'umkm_name' => [Rule::requiredIf($isSeller), 'nullable', 'string', 'max:120'],
            'city' => [Rule::requiredIf($isSeller), 'nullable', 'string', 'max:100'],
        ], [
            'phone.regex' => 'Nomor telepon hanya boleh berisi angka, spasi, +, -, dan tanda kurung.',
            'umkm_name.required' => 'Nama UMKM wajib diisi.',
            'city.required' => 'Kota/kabupaten wajib diisi.',
            'phone.required' => 'Nomor telepon wajib diisi untuk pendaftar UMKM.',
        ])->validate();

        return DB::transaction(function () use ($validated, $isSeller) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'phone' => $validated['phone'] ?? null,
            ]);

            // role tidak mass-assignable agar tidak bisa disisipkan dari request.
            $user->role = $isSeller ? Role::Seller : Role::Customer;
            $user->save();

            if ($isSeller) {
                UmkmProfile::create([
                    'user_id' => $user->id,
                    'name' => $validated['umkm_name'],
                    'slug' => Slug::unique(UmkmProfile::class, $validated['umkm_name']),
                    'city' => $validated['city'],
                    'phone' => $validated['phone'],
                    'status' => UmkmStatus::Pending,
                ]);
            }

            return $user;
        });
    }
}
