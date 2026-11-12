<?php

namespace App\Http\Requests\Shop;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'recipient_name' => ['required', 'string', 'min:3', 'max:120'],
            'phone' => ['required', 'string', 'regex:/^[0-9+\-\s()]{8,30}$/'],
            'address_line' => ['required', 'string', 'min:10', 'max:500'],
            'city' => ['required', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'regex:/^[0-9]{5}$/'],
            'notes' => ['nullable', 'string', 'max:500'],
            'payment_method' => ['required', Rule::in(['transfer_demo', 'cod_demo'])],
            'save_address' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'recipient_name' => 'nama penerima',
            'phone' => 'nomor telepon',
            'address_line' => 'alamat lengkap',
            'city' => 'kota/kabupaten',
            'postal_code' => 'kode pos',
            'notes' => 'catatan pesanan',
            'payment_method' => 'metode pembayaran',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.regex' => 'Nomor telepon hanya boleh berisi angka, spasi, +, -, dan tanda kurung (8–30 karakter).',
            'postal_code.regex' => 'Kode pos harus 5 digit angka.',
            'address_line.min' => 'Alamat lengkap minimal 10 karakter agar kurir mudah menemukan lokasi.',
        ];
    }
}
