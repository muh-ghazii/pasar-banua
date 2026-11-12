<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Mode demo
    |--------------------------------------------------------------------------
    | Bila true, data hasil seeder dianggap simulasi dan ditandai "DEMO"
    | pada dashboard dan analitik. Matikan di produksi.
    */
    'demo' => (bool) env('PASARBANUA_DEMO_DATA', true),

    /*
    |--------------------------------------------------------------------------
    | Ongkos kirim (demo)
    |--------------------------------------------------------------------------
    | Belum ada integrasi ekspedisi. Setiap pesanan per UMKM memakai tarif
    | flat yang dihitung di backend.
    */
    'shipping_flat' => (int) env('PASARBANUA_SHIPPING_FLAT', 12000),

    /*
    |--------------------------------------------------------------------------
    | Target proyek (KPI)
    |--------------------------------------------------------------------------
    | Sumber: dokumen Project Charter Pasar Banua. Ini adalah TARGET, bukan
    | data aktual.
    */
    'targets' => [
        'active_umkm' => 50,
        'transaction_growth_percent' => 30,
        'transaction_growth_months' => 3,
        'satisfaction_min' => 4.0,
        'training_completion_percent' => 100,
    ],

    /*
    |--------------------------------------------------------------------------
    | Upload
    |--------------------------------------------------------------------------
    */
    'uploads' => [
        'disk' => env('PASARBANUA_UPLOAD_DISK', 'public'),
        'max_image_kb' => 3072,
        'max_product_images' => 6,
    ],

    'social' => [
        'instagram' => env('PASARBANUA_INSTAGRAM', 'https://instagram.com/pasarbanua'),
        'facebook' => env('PASARBANUA_FACEBOOK', 'https://facebook.com/pasarbanua'),
        'youtube' => env('PASARBANUA_YOUTUBE', 'https://youtube.com/@pasarbanua'),
    ],

    'contact' => [
        'email' => 'halo@pasarbanua.example',
        'phone' => '+62 800-0000-0000',
        'address' => 'Banjarmasin, Kalimantan Selatan',
    ],
];
