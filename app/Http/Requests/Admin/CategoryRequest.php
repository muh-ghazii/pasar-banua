<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
{
    public const ICONS = ['utensils', 'hand', 'shirt', 'house', 'package'];

    public function authorize(): bool
    {
        return (bool) $this->user()?->isAdmin();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $category = $this->route('category');

        return [
            'name' => ['required', 'string', 'min:3', 'max:80', Rule::unique('categories', 'name')->ignore($category?->id)],
            'description' => ['nullable', 'string', 'max:255'],
            'icon' => ['required', Rule::in(self::ICONS)],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:999'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama kategori',
            'description' => 'deskripsi',
            'icon' => 'ikon',
            'sort_order' => 'urutan',
        ];
    }
}
