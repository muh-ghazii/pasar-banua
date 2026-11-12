<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Kuliner', 'slug' => 'kuliner', 'icon' => 'utensils', 'description' => 'Camilan, kue basah, dan olahan khas Banua.'],
            ['name' => 'Kerajinan', 'slug' => 'kerajinan', 'icon' => 'hand', 'description' => 'Anyaman dan karya tangan pengrajin lokal.'],
            ['name' => 'Kain dan Fashion', 'slug' => 'kain-fashion', 'icon' => 'shirt', 'description' => 'Kain, busana, dan aksesori bermotif khas.'],
            ['name' => 'Produk Rumah Tangga', 'slug' => 'rumah-tangga', 'icon' => 'house', 'description' => 'Perlengkapan rumah yang fungsional dan hangat.'],
        ];

        foreach ($categories as $i => $category) {
            Category::updateOrCreate(['slug' => $category['slug']], [...$category, 'sort_order' => $i + 1, 'is_active' => true]);
        }
    }
}
