<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TrainingRequest extends FormRequest
{
    public const TOPICS = [
        'onboarding' => 'Memulai',
        'katalog' => 'Katalog & foto produk',
        'operasional' => 'Pesanan & stok',
        'layanan' => 'Layanan pelanggan',
    ];

    public function authorize(): bool
    {
        return (bool) $this->user()?->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:5', 'max:160'],
            'topic' => ['required', Rule::in(array_keys(self::TOPICS))],
            'summary' => ['nullable', 'string', 'max:240'],
            'content' => ['required', 'string', 'min:20', 'max:20000'],
            'duration_minutes' => ['required', 'integer', 'min:1', 'max:240'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:999'],
            'is_published' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => 'judul',
            'topic' => 'topik',
            'summary' => 'ringkasan',
            'content' => 'isi materi',
            'duration_minutes' => 'durasi',
            'sort_order' => 'urutan',
        ];
    }
}
