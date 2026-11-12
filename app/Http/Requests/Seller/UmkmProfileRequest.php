<?php

namespace App\Http\Requests\Seller;

use Illuminate\Foundation\Http\FormRequest;

class UmkmProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        $umkm = $this->user()->umkmProfile;

        return $umkm !== null && $this->user()->can('update', $umkm);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $maxKb = (int) config('pasarbanua.uploads.max_image_kb');
        $image = ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'max:'.$maxKb];

        return [
            'name' => ['required', 'string', 'min:3', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:2000'],
            'story' => ['nullable', 'string', 'max:5000'],
            'city' => ['required', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^[0-9+\-\s()]{8,30}$/'],
            'whatsapp' => ['nullable', 'string', 'regex:/^[0-9+\-\s()]{8,30}$/'],
            'instagram' => ['nullable', 'string', 'max:100', 'regex:/^@?[A-Za-z0-9._]{1,30}$/'],
            'logo' => $image,
            'cover' => $image,
            'remove_logo' => ['nullable', 'boolean'],
            'remove_cover' => ['nullable', 'boolean'],
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
            'description' => 'deskripsi usaha',
            'story' => 'cerita UMKM',
            'city' => 'kota/kabupaten',
            'address' => 'alamat',
            'phone' => 'nomor telepon',
            'whatsapp' => 'nomor WhatsApp',
            'instagram' => 'akun Instagram',
            'logo' => 'logo',
            'cover' => 'foto sampul',
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
            'instagram.regex' => 'Tulis nama akun Instagram saja, misalnya @dapurbanua.',
            'logo.max' => 'Ukuran logo maksimal :max KB.',
            'cover.max' => 'Ukuran foto sampul maksimal :max KB.',
        ];
    }
}
