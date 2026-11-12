<?php

namespace App\Http\Requests\Seller;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;

class ProductStoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        $product = $this->route('product');

        return $product instanceof Product && $this->user()->can('update', $product);
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:5', 'max:160'],
            'body' => ['required', 'string', 'min:50', 'max:5000'],
            'process_note' => ['nullable', 'string', 'max:1500'],
            'material_note' => ['nullable', 'string', 'max:1500'],
            'cultural_note' => ['nullable', 'string', 'max:1500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title' => 'judul cerita',
            'body' => 'isi cerita',
            'process_note' => 'catatan proses',
            'material_note' => 'catatan bahan',
            'cultural_note' => 'catatan budaya',
        ];
    }
}
