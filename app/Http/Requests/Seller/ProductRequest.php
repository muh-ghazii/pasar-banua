<?php

namespace App\Http\Requests\Seller;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        $product = $this->route('product');

        return $product instanceof Product
            ? $this->user()->can('update', $product)
            : $this->user()->can('create', Product::class);
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_active', true),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $maxKb = (int) config('pasarbanua.uploads.max_image_kb');
        $maxImages = (int) config('pasarbanua.uploads.max_product_images');

        return [
            'name' => ['required', 'string', 'min:3', 'max:120'],
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')->where('is_active', true)],
            'summary' => ['nullable', 'string', 'max:200'],
            'description' => ['required', 'string', 'min:20', 'max:5000'],
            'price' => ['required', 'integer', 'min:1000', 'max:100000000'],
            'stock' => ['required', 'integer', 'min:0', 'max:100000'],
            'weight_gram' => ['nullable', 'integer', 'min:1', 'max:100000'],
            'is_active' => ['boolean'],
            'images' => ['nullable', 'array', 'max:'.$maxImages],
            'images.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'max:'.$maxKb],
            'removed_images' => ['nullable', 'array'],
            'removed_images.*' => ['integer'],
            'story_title' => ['nullable', 'string', 'max:160', 'required_with:story_body'],
            'story_body' => ['nullable', 'string', 'max:5000', 'required_with:story_title'],
        ];
    }

    /**
     * Jumlah foto akhir (lama yang dipertahankan + baru) minimal 1 dan maksimal sesuai konfigurasi.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->has('images') || $validator->errors()->has('images.*')) {
                    return;
                }

                $product = $this->route('product');
                $removed = collect($this->input('removed_images', []))->map(fn ($id) => (int) $id)->all();
                $existing = $product instanceof Product
                    ? $product->images()->whereNotIn('id', $removed)->count()
                    : 0;
                $total = $existing + count($this->file('images', []));
                $max = (int) config('pasarbanua.uploads.max_product_images');

                if ($total < 1) {
                    $validator->errors()->add('images', 'Unggah minimal satu foto produk.');
                } elseif ($total > $max) {
                    $validator->errors()->add('images', "Maksimal {$max} foto per produk.");
                }
            },
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama produk',
            'category_id' => 'kategori',
            'summary' => 'ringkasan',
            'description' => 'deskripsi',
            'price' => 'harga',
            'stock' => 'stok',
            'weight_gram' => 'berat',
            'images' => 'foto produk',
            'images.*' => 'foto produk',
            'story_title' => 'judul cerita',
            'story_body' => 'isi cerita',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'images.*.max' => 'Ukuran setiap foto maksimal :max KB.',
            'images.*.mimes' => 'Foto harus berformat JPG, PNG, atau WebP.',
            'images.*.mimetypes' => 'Foto harus berformat JPG, PNG, atau WebP.',
            'images.*.image' => 'File yang diunggah harus berupa gambar.',
            'price.min' => 'Harga minimal Rp1.000.',
        ];
    }
}
