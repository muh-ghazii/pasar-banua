<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUmkmRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->isAdmin();
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:2000'],
            'city' => ['required', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'regex:/^[0-9+\-\s()]{8,30}$/'],
            'whatsapp' => ['nullable', 'string', 'regex:/^[0-9+\-\s()]{8,30}$/'],
            'instagram' => ['nullable', 'string', 'max:100', 'regex:/^@?[A-Za-z0-9._]+$/'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama UMKM',
            'tagline' => 'tagline',
            'description' => 'deskripsi',
            'city' => 'kota/kabupaten',
            'address' => 'alamat',
            'phone' => 'telepon',
            'whatsapp' => 'WhatsApp',
            'instagram' => 'Instagram',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.regex' => 'Nomor telepon hanya boleh berisi angka, spasi, +, -, dan tanda kurung.',
            'whatsapp.regex' => 'Nomor WhatsApp hanya boleh berisi angka, spasi, +, -, dan tanda kurung.',
            'instagram.regex' => 'Nama pengguna Instagram hanya boleh berisi huruf, angka, titik, dan garis bawah.',
        ];
    }
}
