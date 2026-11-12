<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\TrainingMaterial;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Hanya diisi saat tabel masih kosong, agar perubahan admin tidak
        // tertimpa ketika seeder dijalankan ulang (mis. setiap deploy).
        if (Category::query()->doesntExist()) {
            $this->call(CategorySeeder::class);
        }

        if (TrainingMaterial::query()->doesntExist()) {
            $this->call(TrainingSeeder::class);
        }

        // Data demonstrasi hanya dibuat bila belum ada dan mode demo aktif.
        if (config('pasarbanua.demo') && ! User::where('email', 'admin@pasarbanua.test')->exists()) {
            $this->call(DemoMarketplaceSeeder::class);
        }
    }
}
