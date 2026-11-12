<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\ProductStatus;
use App\Enums\UmkmStatus;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductReview;
use App\Models\ProductStory;
use App\Models\UmkmProfile;
use App\Models\User;
use App\Support\Slug;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * Data demonstrasi. Seluruh UMKM, produk, pesanan, dan ulasan di sini FIKTIF
 * dan ditandai is_demo. Foto berasal dari Wikimedia Commons (lihat CREDITS.md).
 */
class DemoMarketplaceSeeder extends Seeder
{
    /** @var array<string, array<string, string>> */
    private array $images = [];

    public function run(): void
    {
        mt_srand(42);
        fake()->seed(42);

        $this->loadImageManifest();
        $this->seedStaff();

        $categories = Category::pluck('id', 'slug');
        $sellers = $this->seedUmkmAndProducts($categories->all());
        $this->seedPendingQueue($categories->all());

        $customers = $this->seedCustomers();
        $this->seedOrdersAndReviews($customers);
    }

    private function loadImageManifest(): void
    {
        $path = database_path('seeders/demo-images/manifest.json');

        if (! File::exists($path)) {
            return;
        }

        foreach (json_decode(File::get($path), true) as $entry) {
            $this->images[$entry['key']] = $entry;
        }
    }

    private function seedStaff(): void
    {
        User::factory()->admin()->create([
            'name' => 'Admin Pasar Banua',
            'email' => 'admin@pasarbanua.test',
            'is_demo' => true,
        ]);
    }

    /**
     * @param  array<string, int>  $categories
     * @return array<int, UmkmProfile>
     */
    private function seedUmkmAndProducts(array $categories): array
    {
        $created = [];

        foreach ($this->umkmData() as $i => $data) {
            $user = User::factory()->seller()->create([
                'name' => $data['owner'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'is_demo' => true,
            ]);

            $umkm = UmkmProfile::create([
                'user_id' => $user->id,
                'name' => $data['name'],
                'slug' => Slug::unique(UmkmProfile::class, $data['name']),
                'tagline' => $data['tagline'],
                'description' => $data['description'],
                'story' => $data['story'],
                'city' => $data['city'],
                'address' => $data['address'],
                'phone' => $data['phone'],
                'whatsapp' => $data['phone'],
                'instagram' => $data['instagram'],
                'status' => UmkmStatus::Approved,
                'verified_at' => now()->subDays(80 - $i * 6),
                'is_demo' => true,
            ]);

            foreach ($data['products'] as $p) {
                $this->createProduct($umkm, $categories, $p);
            }

            $created[] = $umkm;
        }

        return $created;
    }

    /**
     * @param  array<string, int>  $categories
     * @param  array<string, mixed>  $p
     */
    private function createProduct(UmkmProfile $umkm, array $categories, array $p, ProductStatus $status = ProductStatus::Approved): Product
    {
        $product = Product::create([
            'umkm_profile_id' => $umkm->id,
            'category_id' => $categories[$p['category']],
            'name' => $p['name'],
            'slug' => Slug::unique(Product::class, $p['name']),
            'summary' => $p['summary'],
            'description' => $p['description'],
            'price' => $p['price'],
            'stock' => $p['stock'],
            'weight_gram' => $p['weight'] ?? null,
            'status' => $status,
            'is_active' => true,
            'is_featured' => $status === ProductStatus::Approved && ($p['featured'] ?? false),
            'is_demo' => true,
        ]);

        if (! empty($p['image']) && isset($this->images[$p['image']])) {
            $this->attachImage($product, $this->images[$p['image']]);
        }

        if (! empty($p['story'])) {
            ProductStory::create([
                'product_id' => $product->id,
                'title' => $p['story']['title'],
                'body' => $p['story']['body'],
                'process_note' => $p['story']['process'] ?? null,
                'material_note' => $p['story']['material'] ?? null,
                'is_verified' => false,
            ]);
        }

        return $product;
    }

    /**
     * @param  array<string, string>  $image
     */
    private function attachImage(Product $product, array $image): void
    {
        // Foto demo disajikan sebagai aset statis (public/images/demo) agar tetap
        // tersedia di hosting dengan filesystem sementara (mis. Render free).
        if (! File::exists(public_path('images/demo/'.$image['file']))) {
            return;
        }

        $target = '/images/demo/'.$image['file'];

        ProductImage::create([
            'product_id' => $product->id,
            'path' => $target,
            'alt' => $image['alt'],
            'sort_order' => 0,
        ]);
    }

    /**
     * Antrean untuk demo dashboard admin: UMKM & produk menunggu verifikasi/kurasi.
     *
     * @param  array<string, int>  $categories
     */
    private function seedPendingQueue(array $categories): void
    {
        $pendingUser = User::factory()->seller()->create([
            'name' => 'Hendra Saputra',
            'email' => 'baru@pasarbanua.test',
            'phone' => '081355500101',
            'is_demo' => true,
        ]);

        $pending = UmkmProfile::create([
            'user_id' => $pendingUser->id,
            'name' => 'Kue Kering Tepian Martapura',
            'slug' => Slug::unique(UmkmProfile::class, 'Kue Kering Tepian Martapura'),
            'tagline' => 'Kue kering rumahan dari Martapura',
            'description' => 'Usaha rumahan kue kering dan camilan oleh-oleh. Profil demonstrasi, menunggu verifikasi admin.',
            'city' => 'Martapura',
            'phone' => '081355500101',
            'status' => UmkmStatus::Pending,
            'is_demo' => true,
        ]);

        $this->createProduct($pending, $categories, [
            'name' => 'Nastar Keju Toples',
            'category' => 'kuliner',
            'price' => 78000,
            'stock' => 24,
            'weight' => 350,
            'summary' => 'Nastar isi selai nanas dengan taburan keju.',
            'description' => 'Nastar buatan rumah dalam toples 350 gram. Produk contoh untuk antrean kurasi.',
        ], ProductStatus::Pending);

        $rejectedUser = User::factory()->seller()->create([
            'name' => 'Yuliana Dewi',
            'email' => 'tolak@pasarbanua.test',
            'phone' => '081355500102',
            'is_demo' => true,
        ]);

        UmkmProfile::create([
            'user_id' => $rejectedUser->id,
            'name' => 'Rotan Kreasi Tapin',
            'slug' => Slug::unique(UmkmProfile::class, 'Rotan Kreasi Tapin'),
            'description' => 'Kerajinan rotan. Profil demonstrasi.',
            'city' => 'Rantau',
            'phone' => '081355500102',
            'status' => UmkmStatus::Rejected,
            'rejection_reason' => 'Data kontak dan alamat usaha belum lengkap. Silakan lengkapi lalu ajukan kembali.',
            'is_demo' => true,
        ]);

        // Produk menunggu kurasi & satu produk ditolak pada UMKM terverifikasi.
        $approved = UmkmProfile::approved()->where('is_demo', true)->orderBy('id')->get();

        $this->createProduct($approved[4], $categories, [
            'name' => 'Keranjang Pakaian Purun',
            'category' => 'rumah-tangga',
            'price' => 145000,
            'stock' => 8,
            'weight' => 900,
            'summary' => 'Keranjang anyaman purun berukuran besar dengan tutup.',
            'description' => 'Keranjang pakaian anyaman purun dengan tutup. Menunggu kurasi admin.',
        ], ProductStatus::Pending);

        $rejected = $this->createProduct($approved[5], $categories, [
            'name' => 'Kain Sasirangan Premium Super',
            'category' => 'kain-fashion',
            'price' => 999000,
            'stock' => 5,
            'weight' => 400,
            'summary' => 'Kain sasirangan terbaik.',
            'description' => 'Kain terbaik.',
        ], ProductStatus::Rejected);

        $rejected->update(['rejection_reason' => 'Deskripsi terlalu singkat dan belum ada foto produk. Tambahkan bahan, ukuran, dan foto asli.']);
    }

    /**
     * @return array<int, User>
     */
    private function seedCustomers(): array
    {
        $names = [
            ['Dewi Anggraini', 'pembeli@pasarbanua.test'],
            ['Muhammad Fadli', 'fadli@pasarbanua.test'],
            ['Nur Aisyah', 'aisyah@pasarbanua.test'],
            ['Rahmat Hidayat', 'rahmat@pasarbanua.test'],
            ['Lestari Wulandari', 'lestari@pasarbanua.test'],
            ['Agus Salim', 'agus@pasarbanua.test'],
            ['Putri Maharani', 'putri@pasarbanua.test'],
            ['Bayu Pratama', 'bayu@pasarbanua.test'],
            ['Siska Amelia', 'siska@pasarbanua.test'],
            ['Taufik Ramadhan', 'taufik@pasarbanua.test'],
        ];

        return array_map(fn ($n) => User::factory()->create([
            'name' => $n[0],
            'email' => $n[1],
            'is_demo' => true,
        ]), $names);
    }

    /**
     * @param  array<int, User>  $customers
     */
    private function seedOrdersAndReviews(array $customers): void
    {
        $shipping = (int) config('pasarbanua.shipping_flat');
        $comments = [
            5 => ['Rasanya pas dan kemasan rapi. Pasti pesan lagi.', 'Produk sesuai foto, pengiriman cepat.', 'Kualitasnya bagus sekali untuk harganya.', 'Cocok untuk oleh-oleh. Keluarga suka.'],
            4 => ['Bagus, hanya kemasan bisa lebih rapat lagi.', 'Sesuai deskripsi, penjual ramah.', 'Produknya enak, pengiriman agak lama.'],
            3 => ['Cukup baik, tetapi ukuran lebih kecil dari bayangan saya.'],
        ];

        $umkms = UmkmProfile::approved()->where('is_demo', true)->with(['products' => fn ($q) => $q->published()->with('images')])->get();

        // Volume pesanan naik dari waktu ke waktu agar grafik tren terasa wajar.
        // Rentang 6 bulan: 3 bulan terakhir ±30% lebih ramai dari 3 bulan sebelumnya.
        $total = 130;
        for ($n = 0; $n < $total; $n++) {
            $progress = $n / $total;
            $daysAgo = (int) round(179 * (1 - $progress ** 0.85));
            $createdAt = now()->subDays($daysAgo)->setTime(mt_rand(7, 21), mt_rand(0, 59));

            $umkm = $umkms->random();
            $customer = $customers[array_rand($customers)];

            $products = $umkm->products->shuffle()->take(mt_rand(1, min(3, $umkm->products->count())));
            if ($products->isEmpty()) {
                continue;
            }

            $status = $this->pickStatus($daysAgo);

            $lines = $products->map(fn (Product $p) => [$p, mt_rand(1, 3)]);
            $subtotal = $lines->sum(fn ($l) => $l[0]->price * $l[1]);

            $order = new Order([
                'number' => 'PB-'.$createdAt->format('ymd').'-'.Str::upper(Str::random(5)),
                'user_id' => $customer->id,
                'umkm_profile_id' => $umkm->id,
                'status' => $status,
                'recipient_name' => $customer->name,
                'phone' => $customer->phone ?? '081200000000',
                'address_line' => 'Jl. Contoh Demo No. '.mt_rand(1, 99).', RT '.mt_rand(1, 12),
                'city' => 'Banjarmasin',
                'postal_code' => '70'.mt_rand(100, 999),
                'payment_method' => mt_rand(0, 1) ? 'transfer_demo' : 'cod_demo',
                'subtotal' => $subtotal,
                'shipping_fee' => $shipping,
                'total' => $subtotal + $shipping,
                'is_demo' => true,
            ]);

            $order->processed_at = in_array($status, [OrderStatus::Processing, OrderStatus::Shipped, OrderStatus::Completed], true) ? $createdAt->addHours(3) : null;
            $order->shipped_at = in_array($status, [OrderStatus::Shipped, OrderStatus::Completed], true) ? $createdAt->addDay() : null;
            $order->completed_at = $status === OrderStatus::Completed ? $createdAt->addDays(3) : null;
            $order->cancelled_at = $status === OrderStatus::Cancelled ? $createdAt->addHours(5) : null;
            $order->cancel_reason = $status === OrderStatus::Cancelled ? 'Dibatalkan atas permintaan pembeli.' : null;
            $order->tracking_note = $order->shipped_at ? 'Dikirim via kurir lokal (data demo)' : null;
            $order->created_at = $createdAt;
            $order->updated_at = $order->completed_at ?? $order->shipped_at ?? $order->processed_at ?? $createdAt;
            $order->save();

            foreach ($lines as [$product, $qty]) {
                $item = new OrderItem([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_image' => $product->images->first()?->path,
                    'unit_price' => $product->price,
                    'quantity' => $qty,
                    'subtotal' => $product->price * $qty,
                ]);
                $item->created_at = $createdAt;
                $item->updated_at = $createdAt;
                $item->save();

                if ($status !== OrderStatus::Cancelled) {
                    $product->increment('sold_count', $qty);
                }

                if ($status === OrderStatus::Completed && mt_rand(1, 100) <= 60) {
                    $this->review($product, $customer, $comments, $order->completed_at->addDay());
                }
            }
        }
    }

    /**
     * @param  array<int, array<int, string>>  $comments
     */
    private function review(Product $product, User $customer, array $comments, $at): void
    {
        if (ProductReview::where('product_id', $product->id)->where('user_id', $customer->id)->exists()) {
            return;
        }

        $roll = mt_rand(1, 100);
        $rating = $roll <= 62 ? 5 : ($roll <= 90 ? 4 : 3);

        $review = new ProductReview([
            'product_id' => $product->id,
            'user_id' => $customer->id,
            'rating' => $rating,
            'comment' => $comments[$rating][array_rand($comments[$rating])],
            'is_demo' => true,
        ]);
        $review->created_at = $at;
        $review->updated_at = $at;
        $review->save();
    }

    private function pickStatus(int $daysAgo): OrderStatus
    {
        $roll = mt_rand(1, 100);

        if ($daysAgo <= 1) {
            return $roll <= 55 ? OrderStatus::Pending : ($roll <= 85 ? OrderStatus::Processing : OrderStatus::Shipped);
        }

        if ($daysAgo <= 5) {
            return $roll <= 20 ? OrderStatus::Pending : ($roll <= 45 ? OrderStatus::Processing : ($roll <= 80 ? OrderStatus::Shipped : OrderStatus::Completed));
        }

        return $roll <= 82 ? OrderStatus::Completed : ($roll <= 94 ? OrderStatus::Cancelled : OrderStatus::Shipped);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function umkmData(): array
    {
        return [
            [
                'owner' => 'Rina Marlina',
                'email' => 'penjual@pasarbanua.test',
                'phone' => '081355500001',
                'name' => 'Dapur Kayuh Banua',
                'tagline' => 'Camilan ikan renyah dari dapur rumahan',
                'city' => 'Banjarmasin',
                'address' => 'Kawasan tepian sungai, Banjarmasin (alamat demo)',
                'instagram' => 'dapurkayuh.demo',
                'description' => 'Usaha rumahan yang mengolah ikan menjadi camilan dan lauk tahan lama. UMKM demonstrasi untuk contoh tampilan Pasar Banua.',
                'story' => 'Dapur Kayuh Banua dimulai dari dapur keluarga yang rutin memproduksi camilan untuk tetangga. Seiring waktu, pesanan bertambah dan usaha ini mulai menjual lewat marketplace. (Profil contoh — belum diverifikasi.)',
                'products' => [
                    [
                        'name' => 'Amplang Ikan Tenggiri 250 g',
                        'category' => 'kuliner', 'price' => 38000, 'stock' => 64, 'weight' => 250, 'featured' => true,
                        'image' => 'amplang',
                        'summary' => 'Camilan ikan tenggiri yang gurih, renyah, dan tidak berminyak.',
                        'description' => "Amplang berbahan ikan tenggiri dan tepung tapioka yang digoreng hingga renyah. Dikemas kedap udara 250 gram agar tetap garing.\n\nCocok untuk teman minum teh, bekal perjalanan, atau oleh-oleh khas Kalimantan Selatan.",
                        'story' => [
                            'title' => 'Renyah dari dapur kecil',
                            'body' => 'Amplang dikenal sebagai camilan berbahan ikan yang menjadi oleh-oleh dari Kalimantan Selatan. Di dapur ini, adonan dibuat dari daging ikan tenggiri yang digiling, dicampur tepung tapioka dan bumbu sederhana, lalu dibentuk memanjang.',
                            'process' => 'Adonan dibentuk satu per satu, digoreng bertahap pada api sedang, lalu ditiriskan sebelum dikemas.',
                            'material' => 'Ikan tenggiri, tepung tapioka, bawang putih, garam, dan penyedap alami.',
                        ],
                    ],
                    [
                        'name' => 'Abon Ikan Haruan 100 g',
                        'category' => 'kuliner', 'price' => 56000, 'stock' => 30, 'weight' => 100, 'featured' => false,
                        'image' => 'abon-ikan',
                        'summary' => 'Abon ikan haruan bertekstur lembut dengan rasa gurih manis.',
                        'description' => "Abon dari ikan haruan yang disuwir, dibumbui, dan disangrai hingga kering. Enak untuk nasi hangat, bubur, atau isian roti.\n\nKemasan 100 gram dengan tutup rapat.",
                        'story' => [
                            'title' => 'Dari ikan sungai menjadi lauk tahan lama',
                            'body' => 'Haruan adalah ikan air tawar yang mudah ditemui di perairan Kalimantan Selatan. Usaha ini mengolahnya menjadi abon agar bisa disimpan lebih lama dan dinikmati di mana saja.',
                            'process' => 'Ikan dikukus, disuwir, dimasak dengan bumbu, lalu disangrai sampai kering dan berserat.',
                            'material' => 'Ikan haruan, bawang, gula, garam, dan rempah.',
                        ],
                    ],
                ],
            ],
            [
                'owner' => 'Hj. Norhayati',
                'email' => 'seller2@pasarbanua.test',
                'phone' => '081355500002',
                'name' => 'Rumah Wadai Hulu Sungai',
                'tagline' => 'Wadai tradisional untuk meja keluarga',
                'city' => 'Kandangan',
                'address' => 'Kandangan, Hulu Sungai Selatan (alamat demo)',
                'instagram' => 'rumahwadai.demo',
                'description' => 'Usaha pembuat wadai (kue tradisional) rumahan di Kandangan. UMKM demonstrasi untuk contoh tampilan Pasar Banua.',
                'story' => 'Rumah Wadai Hulu Sungai menyiapkan wadai dalam jumlah terbatas setiap hari agar tetap segar. (Profil contoh — belum diverifikasi.)',
                'products' => [
                    [
                        'name' => 'Dodol Kandangan Original 300 g',
                        'category' => 'kuliner', 'price' => 45000, 'stock' => 48, 'weight' => 300, 'featured' => true,
                        'image' => 'dodol-kandangan',
                        'summary' => 'Dodol legit berwarna cokelat tua, dikemas per potong.',
                        'description' => "Dodol dengan rasa manis legit dan tekstur kenyal. Dikemas 300 gram, cocok sebagai buah tangan.\n\nSimpan di tempat sejuk dan kering, tahan hingga beberapa minggu.",
                        'story' => [
                            'title' => 'Diaduk sabar, dipotong rapi',
                            'body' => 'Dodol Kandangan sering dijadikan oleh-oleh dari Hulu Sungai Selatan. Pembuatannya membutuhkan waktu dan kesabaran karena adonan harus terus diaduk di atas api kecil.',
                            'process' => 'Adonan diaduk terus-menerus hingga mengental dan mengilap, didinginkan, lalu dipotong dan dibungkus satu per satu.',
                            'material' => 'Tepung ketan, gula merah, santan, dan sedikit garam.',
                        ],
                    ],
                    [
                        'name' => 'Dodol Kandangan Pandan 300 g',
                        'category' => 'kuliner', 'price' => 45000, 'stock' => 36, 'weight' => 300,
                        'summary' => 'Dodol dengan aroma pandan yang harum dan manis lembut.',
                        'description' => 'Varian dodol beraroma pandan dalam kemasan 300 gram. Teksturnya kenyal dengan rasa manis yang tidak berlebihan.',
                    ],
                ],
            ],
            [
                'owner' => 'Maulida Rahmah',
                'email' => 'seller3@pasarbanua.test',
                'phone' => '081355500003',
                'name' => 'Dapur Wadai Barabai',
                'tagline' => 'Apam dan bingka hangat setiap pagi',
                'city' => 'Barabai',
                'address' => 'Barabai, Hulu Sungai Tengah (alamat demo)',
                'instagram' => 'wadaibarabai.demo',
                'description' => 'Dapur kue basah yang membuat apam dan bingka dalam porsi kecil. UMKM demonstrasi untuk contoh tampilan Pasar Banua.',
                'story' => 'Dapur Wadai Barabai memproduksi kue basah berdasarkan pesanan harian agar selalu segar. (Profil contoh — belum diverifikasi.)',
                'products' => [
                    [
                        'name' => 'Apam Barabai isi 6',
                        'category' => 'kuliner', 'price' => 30000, 'stock' => 22, 'weight' => 450, 'featured' => true,
                        'image' => 'apam',
                        'summary' => 'Apam lembut berwarna cokelat, disajikan dengan kelapa parut.',
                        'description' => "Satu kotak berisi 6 apam dengan kuah gula merah dan kelapa parut terpisah. Paling nikmat disantap hari yang sama.\n\nPesanan dibuat segar, simpan pada suhu ruang maksimal 1 hari.",
                        'story' => [
                            'title' => 'Wadai yang dinikmati hangat',
                            'body' => 'Apam Barabai dikenal sebagai wadai dari Barabai, Hulu Sungai Tengah. Di dapur ini apam dikukus dalam porsi kecil dan dikemas sebelum matahari tinggi.',
                            'process' => 'Adonan difermentasi sebentar, dikukus dalam cetakan kecil, lalu disajikan dengan kuah gula merah.',
                            'material' => 'Tepung beras, gula merah, santan, dan kelapa parut.',
                        ],
                    ],
                    [
                        'name' => 'Bingka Kentang Loyang Kecil',
                        'category' => 'kuliner', 'price' => 42000, 'stock' => 18, 'weight' => 500, 'featured' => false,
                        'image' => 'bingka-kentang',
                        'summary' => 'Bingka kentang bertekstur lembut dengan aroma susu dan telur.',
                        'description' => "Bingka kentang dipanggang dalam loyang kecil berisi sekitar 8 potong. Bagian atasnya kecokelatan, bagian dalamnya lembut.\n\nTersedia hanya jika stok produksi hari ini masih ada.",
                    ],
                    [
                        'name' => 'Bingka Aneka Rasa isi 8',
                        'category' => 'kuliner', 'price' => 48000, 'stock' => 15, 'weight' => 600,
                        'image' => 'bingka',
                        'summary' => 'Kotak bingka berbentuk bunga dalam beberapa pilihan rasa.',
                        'description' => 'Satu kotak berisi 8 bingka mini dengan rasa campuran. Cocok untuk arisan, hantaran, atau teman minum teh.',
                    ],
                ],
            ],
            [
                'owner' => 'Samsul Arifin',
                'email' => 'seller4@pasarbanua.test',
                'phone' => '081355500004',
                'name' => 'Kebun Kelulut Meratus',
                'tagline' => 'Madu kelulut dari kebun kecil',
                'city' => 'Loksado',
                'address' => 'Loksado, Hulu Sungai Selatan (alamat demo)',
                'instagram' => 'kelulutmeratus.demo',
                'description' => 'Peternak madu kelulut skala kecil. UMKM demonstrasi untuk contoh tampilan Pasar Banua.',
                'story' => 'Kebun Kelulut Meratus mengelola beberapa stup kelulut dan memanen madu secara berkala. (Profil contoh — belum diverifikasi.)',
                'products' => [
                    [
                        'name' => 'Madu Kelulut Murni 250 ml',
                        'category' => 'kuliner', 'price' => 95000, 'stock' => 40, 'weight' => 350, 'featured' => true,
                        'image' => 'madu',
                        'summary' => 'Madu kelulut dengan rasa manis-asam yang segar.',
                        'description' => "Madu dari lebah kelulut tanpa tambahan gula atau pengawet, dikemas botol kaca 250 ml. Rasanya cenderung manis dengan sedikit asam.\n\nSimpan di tempat sejuk dan hindari sinar matahari langsung.",
                        'story' => [
                            'title' => 'Dari stup kecil di tepi kebun',
                            'body' => 'Kelulut adalah lebah tanpa sengat yang menghasilkan madu dalam jumlah kecil. Karena itu, setiap botol diproduksi terbatas dan dipanen dengan hati-hati.',
                            'process' => 'Madu disaring dan dimasukkan ke dalam botol bersih tanpa pemanasan berlebih.',
                            'material' => 'Madu kelulut murni.',
                        ],
                    ],
                    [
                        'name' => 'Madu Kelulut Murni 500 ml',
                        'category' => 'kuliner', 'price' => 175000, 'stock' => 20, 'weight' => 700,
                        'image' => 'madu',
                        'summary' => 'Kemasan hemat madu kelulut untuk keluarga.',
                        'description' => 'Madu kelulut murni dalam botol 500 ml. Lebih hemat untuk konsumsi rutin keluarga.',
                    ],
                ],
            ],
            [
                'owner' => 'Hj. Aminah',
                'email' => 'seller5@pasarbanua.test',
                'phone' => '081355500005',
                'name' => 'Sanggar Anyam Purun',
                'tagline' => 'Anyaman purun karya pengrajin lokal',
                'city' => 'Amuntai',
                'address' => 'Amuntai, Hulu Sungai Utara (alamat demo)',
                'instagram' => 'anyampurun.demo',
                'description' => 'Kelompok pengrajin yang menganyam purun menjadi tas, tikar, dan perlengkapan rumah. UMKM demonstrasi untuk contoh tampilan Pasar Banua.',
                'story' => 'Sanggar Anyam Purun beranggotakan beberapa pengrajin yang bekerja bergantian sesuai pesanan. (Profil contoh — belum diverifikasi.)',
                'products' => [
                    [
                        'name' => 'Tas Anyaman Purun Motif Belah Ketupat',
                        'category' => 'kerajinan', 'price' => 165000, 'stock' => 14, 'weight' => 450, 'featured' => true,
                        'image' => 'purun-craft',
                        'summary' => 'Tas tangan anyaman purun dengan tali kokoh dan lapisan kain.',
                        'description' => "Tas anyaman purun berukuran sedang (sekitar 30 x 25 cm) dengan lapisan kain di bagian dalam. Ringan dan cocok untuk aktivitas harian.\n\nHindari terkena air dalam waktu lama agar anyaman awet.",
                        'story' => [
                            'title' => 'Satu tas, banyak jam menganyam',
                            'body' => 'Purun adalah tanaman rawa yang batangnya dikeringkan lalu dianyam. Satu tas membutuhkan waktu menganyam beberapa hari tergantung motif.',
                            'process' => 'Batang purun dijemur, dipipihkan, diwarnai bila perlu, lalu dianyam dan dijahit dengan lapisan kain.',
                            'material' => 'Purun, benang, kain pelapis, dan resleting.',
                        ],
                    ],
                    [
                        'name' => 'Tikar Purun 120 x 180 cm',
                        'category' => 'rumah-tangga', 'price' => 135000, 'stock' => 12, 'weight' => 1800,
                        'summary' => 'Tikar anyaman purun yang adem dan mudah digulung.',
                        'description' => 'Tikar purun berukuran 120 x 180 cm. Teksturnya rapat dan adem untuk alas duduk atau tidur siang.',
                    ],
                    [
                        'name' => 'Tudung Saji Anyaman Purun',
                        'category' => 'rumah-tangga', 'price' => 85000, 'stock' => 20, 'weight' => 500,
                        'summary' => 'Tudung saji ringan dengan anyaman rapat.',
                        'description' => 'Tudung saji diameter sekitar 45 cm untuk menutup hidangan di meja makan.',
                    ],
                    [
                        'name' => 'Alas Piring Purun Set 4',
                        'category' => 'rumah-tangga', 'price' => 68000, 'stock' => 35, 'weight' => 300,
                        'summary' => 'Empat alas piring anyaman untuk meja makan.',
                        'description' => 'Set 4 alas piring anyaman purun berdiameter 30 cm. Tampilan alami untuk meja makan sehari-hari.',
                    ],
                    [
                        'name' => 'Tempat Tisu Anyaman Purun',
                        'category' => 'kerajinan', 'price' => 55000, 'stock' => 26, 'weight' => 250,
                        'summary' => 'Kotak tisu anyaman dengan penutup rapi.',
                        'description' => 'Tempat tisu persegi panjang dari anyaman purun, muat tisu ukuran standar.',
                    ],
                ],
            ],
            [
                'owner' => 'Fitriani',
                'email' => 'seller6@pasarbanua.test',
                'phone' => '081355500006',
                'name' => 'Sasirangan Tepian Sungai',
                'tagline' => 'Kain sasirangan dengan warna yang hidup',
                'city' => 'Banjarmasin',
                'address' => 'Banjarmasin (alamat demo)',
                'instagram' => 'sasirangan.tepiansungai.demo',
                'description' => 'Pembuat kain sasirangan yang menyediakan kain meteran dan busana. UMKM demonstrasi untuk contoh tampilan Pasar Banua.',
                'story' => 'Sasirangan Tepian Sungai mengerjakan kain secara bertahap: dijelujur, diikat, dicelup, dan dijemur. (Profil contoh — belum diverifikasi.)',
                'products' => [
                    [
                        'name' => 'Kain Sasirangan Hijau Biru 2 meter',
                        'category' => 'kain-fashion', 'price' => 185000, 'stock' => 16, 'weight' => 400, 'featured' => true,
                        'image' => 'sasirangan-kain',
                        'summary' => 'Kain sasirangan dengan perpaduan hijau dan biru yang dalam.',
                        'description' => "Kain sasirangan berukuran 2 meter (lebar sekitar 110 cm). Cocok untuk dijahit menjadi busana, selendang, atau hiasan.\n\nCuci terpisah dengan air dingin pada pemakaian pertama.",
                        'story' => [
                            'title' => 'Motif lahir dari jelujur dan ikatan',
                            'body' => 'Sasirangan dikenal sebagai kain khas Kalimantan Selatan yang polanya dibentuk dengan teknik jelujur dan ikat sebelum dicelup. Setiap lembar kain bisa menghasilkan corak yang sedikit berbeda.',
                            'process' => 'Pola digambar, dijelujur dengan benang, diikat kencang, dicelup warna, lalu dijemur dan benang dilepas.',
                            'material' => 'Kain katun, pewarna tekstil, dan benang jelujur.',
                        ],
                    ],
                    [
                        'name' => 'Kain Sasirangan Set Empat Warna',
                        'category' => 'kain-fashion', 'price' => 640000, 'stock' => 6, 'weight' => 1500,
                        'image' => 'sasirangan-panel',
                        'summary' => 'Empat lembar kain dengan warna kuning, hitam, hijau, dan merah muda.',
                        'description' => 'Set empat lembar kain sasirangan masing-masing 2 meter. Cocok untuk seragam keluarga atau koleksi.',
                    ],
                    [
                        'name' => 'Kain Sasirangan Pewarna Alami',
                        'category' => 'kain-fashion', 'price' => 260000, 'stock' => 9, 'weight' => 400,
                        'image' => 'sasirangan-alami',
                        'summary' => 'Kain dengan nuansa biru dan kuning dari pewarna alami.',
                        'description' => 'Kain sasirangan berpewarna alami dengan gradasi warna lembut. Warna dapat sedikit berbeda antar lembar karena proses celup manual.',
                    ],
                    [
                        'name' => 'Blus Sasirangan Lengan Panjang',
                        'category' => 'kain-fashion', 'price' => 225000, 'stock' => 11, 'weight' => 350, 'featured' => true,
                        'image' => 'sasirangan-produk',
                        'summary' => 'Blus bermotif sasirangan dengan potongan sederhana.',
                        'description' => 'Blus lengan panjang berbahan katun adem bermotif sasirangan. Tersedia ukuran M dan L (hubungi penjual untuk pilihan ukuran).',
                    ],
                    [
                        'name' => 'Selendang Sasirangan Polos Motif',
                        'category' => 'kain-fashion', 'price' => 115000, 'stock' => 25, 'weight' => 150,
                        'summary' => 'Selendang ringan untuk padanan busana harian.',
                        'description' => 'Selendang sasirangan ukuran 50 x 180 cm. Ringan, mudah dipadukan dengan pakaian formal maupun kasual.',
                    ],
                ],
            ],
            [
                'owner' => 'Nurlaila',
                'email' => 'seller7@pasarbanua.test',
                'phone' => '081355500007',
                'name' => 'Banua Jahit Martapura',
                'tagline' => 'Jahitan rapi dari kain sasirangan',
                'city' => 'Martapura',
                'address' => 'Martapura, Banjar (alamat demo)',
                'instagram' => 'banuajahit.demo',
                'description' => 'Penjahit rumahan yang mengubah kain sasirangan menjadi perlengkapan rumah dan aksesori. UMKM demonstrasi untuk contoh tampilan Pasar Banua.',
                'story' => 'Banua Jahit Martapura memanfaatkan sisa kain agar tidak terbuang. (Profil contoh — belum diverifikasi.)',
                'products' => [
                    [
                        'name' => 'Dompet Kain Sasirangan Resleting',
                        'category' => 'kain-fashion', 'price' => 48000, 'stock' => 40, 'weight' => 100,
                        'summary' => 'Dompet kecil untuk koin, kartu, dan kunci.',
                        'description' => 'Dompet kain bermotif sasirangan dengan resleting dan lapisan dalam. Ukuran sekitar 12 x 9 cm.',
                    ],
                    [
                        'name' => 'Taplak Meja Sasirangan 100 x 100 cm',
                        'category' => 'rumah-tangga', 'price' => 125000, 'stock' => 14, 'weight' => 300,
                        'summary' => 'Taplak persegi untuk meja makan atau meja tamu.',
                        'description' => 'Taplak meja bermotif sasirangan ukuran 100 x 100 cm. Mudah dicuci dan cepat kering.',
                    ],
                    [
                        'name' => 'Sarung Bantal Sasirangan Set 2',
                        'category' => 'rumah-tangga', 'price' => 98000, 'stock' => 22, 'weight' => 250,
                        'summary' => 'Sepasang sarung bantal sofa bermotif.',
                        'description' => 'Set 2 sarung bantal sofa ukuran 40 x 40 cm dengan resleting tersembunyi. Isi bantal tidak termasuk.',
                    ],
                    [
                        'name' => 'Kemeja Pria Sasirangan',
                        'category' => 'kain-fashion', 'price' => 245000, 'stock' => 9, 'weight' => 400,
                        'summary' => 'Kemeja lengan pendek dengan panel sasirangan di bagian depan.',
                        'description' => 'Kemeja pria lengan pendek berpanel sasirangan. Tersedia ukuran M, L, dan XL (hubungi penjual untuk ketersediaan).',
                    ],
                ],
            ],
            [
                'owner' => 'Ahmad Zaini',
                'email' => 'seller8@pasarbanua.test',
                'phone' => '081355500008',
                'name' => 'Bengkel Kayu Jukung',
                'tagline' => 'Karya kayu dan anyaman bertema sungai',
                'city' => 'Banjarmasin',
                'address' => 'Banjarmasin (alamat demo)',
                'instagram' => 'kayujukung.demo',
                'description' => 'Bengkel kecil yang membuat miniatur perahu, talenan, dan topi anyaman. UMKM demonstrasi untuk contoh tampilan Pasar Banua.',
                'story' => 'Bengkel Kayu Jukung mengerjakan pesanan dalam jumlah kecil dengan perhatian pada detail. (Profil contoh — belum diverifikasi.)',
                'products' => [
                    [
                        'name' => 'Tanggui Anyaman Dekoratif',
                        'category' => 'kerajinan', 'price' => 95000, 'stock' => 18, 'weight' => 300, 'featured' => true,
                        'image' => 'tanggui',
                        'summary' => 'Tanggui anyaman berukuran sedang untuk hiasan dinding.',
                        'description' => 'Tanggui (topi lebar anyaman) berdiameter sekitar 50 cm yang dibuat untuk dekorasi. Tidak untuk dipakai di bawah hujan.',
                        'story' => [
                            'title' => 'Topi lebar untuk matahari dan hujan',
                            'body' => 'Tanggui adalah topi lebar anyaman yang dikenal di Kalimantan Selatan. Versi dekoratif ini dibuat lebih rapi dan cocok untuk menghias dinding.',
                            'process' => 'Bilah bahan dianyam berlapis membentuk kerucut lebar, lalu diikat dengan rangka tepi.',
                            'material' => 'Bilah anyaman alami dan tali pengikat.',
                        ],
                    ],
                    [
                        'name' => 'Miniatur Jukung Kayu 30 cm',
                        'category' => 'kerajinan', 'price' => 120000, 'stock' => 10, 'weight' => 500,
                        'summary' => 'Miniatur perahu sungai untuk pajangan meja.',
                        'description' => 'Miniatur jukung dari kayu sepanjang 30 cm lengkap dengan dayung kecil. Cocok sebagai hiasan atau cenderamata.',
                    ],
                    [
                        'name' => 'Talenan Kayu Ulin Kecil',
                        'category' => 'rumah-tangga', 'price' => 89000, 'stock' => 20, 'weight' => 700,
                        'summary' => 'Talenan kayu ulin yang padat dan awet.',
                        'description' => 'Talenan kayu ulin ukuran 25 x 15 cm dengan tebal sekitar 2 cm. Cuci dengan air biasa lalu keringkan, jangan direndam.',
                    ],
                ],
            ],
        ];
    }
}
