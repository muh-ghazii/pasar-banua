# Pasar Banua

Marketplace terkurasi untuk produk kuliner dan kerajinan khas Kalimantan Selatan. Pembeli menemukan produk UMKM lokal beserta ceritanya, UMKM mengelola katalog, stok, dan pesanan, dan admin memverifikasi UMKM serta mengkurasi produk.

> **Mode demo.** Seluruh UMKM, produk, pesanan, dan ulasan hasil seeder adalah fiktif (ditandai `is_demo`). Pembayaran dan ekspedisi **belum** terintegrasi: checkout membuat pesanan sungguhan di database, tetapi tanpa penagihan.

## Teknologi

| Lapisan | Teknologi |
|---|---|
| Backend | Laravel 13, PHP 8.3, Laravel Fortify (autentikasi sesi) |
| Frontend | React 19 + TypeScript, Inertia.js v3, Vite |
| UI | Tailwind CSS v4, komponen shadcn/ui (Radix) yang disesuaikan, Lucide React |
| Database | MySQL 8 (pengujian memakai SQLite in-memory) |
| Testing | PHPUnit 12 |

Arsitektur monolitik: Laravel menangani routing, validasi (Form Request), otorisasi (Gate + Policy), dan business logic (folder `app/Services`). React hanya menerima data lewat Inertia dan tidak pernah mengakses database.

## Instalasi

Prasyarat: PHP 8.3+ (ekstensi `pdo_mysql`, `pdo_sqlite`, `gd`/`fileinfo`), Composer, Node.js 22+, MySQL 8.

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
```

Atur koneksi database di `.env`:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pasar_banua
DB_USERNAME=root
DB_PASSWORD=
```

Buat database `pasar_banua`, lalu:

```bash
php artisan migrate --seed     # struktur tabel + kategori + materi pelatihan + data demo
php artisan storage:link       # agar foto unggahan dapat diakses publik
npm run build                  # atau `npm run dev` saat pengembangan
php artisan serve
```

Buka http://localhost:8000. Untuk mengulang data demo: `php artisan migrate:fresh --seed`.

Konfigurasi tambahan (opsional) di `.env`:

| Variabel | Fungsi | Bawaan |
|---|---|---|
| `PASARBANUA_DEMO_DATA` | Seeder data demo & label DEMO | `true` |
| `PASARBANUA_SHIPPING_FLAT` | Ongkir flat per UMKM (Rupiah) | `12000` |
| `PASARBANUA_UPLOAD_DISK` | Disk penyimpanan foto (mis. `s3`) | `public` |
| `PASARBANUA_PUBLIC_STORAGE_URL` | URL dasar file publik (CDN) | `/storage` |

### Catatan lingkungan lokal pengembang (Windows)

Folder `.tools/` berisi skrip untuk menjalankan MySQL portabel di port 3310 (`.tools/start-mysql.ps1`) dan `.tools/env.sh` untuk memakai PHP 8.3 dari Herd di Git Bash. Ini hanya untuk mesin pengembang; instalasi biasa tidak membutuhkannya.

## Akun demo

Semua kata sandi: `password`

| Role | Email | Keterangan |
|---|---|---|
| Admin | `admin@pasarbanua.test` | Panel admin `/admin` |
| Seller (UMKM) | `penjual@pasarbanua.test` | UMKM "Dapur Kayuh Banua", terverifikasi, `/seller` |
| Seller | `seller2@pasarbanua.test` … `seller8@pasarbanua.test` | UMKM terverifikasi lainnya |
| Seller | `baru@pasarbanua.test` | UMKM menunggu verifikasi |
| Seller | `tolak@pasarbanua.test` | UMKM ditolak |
| Customer | `pembeli@pasarbanua.test` | Memiliki riwayat pesanan |

## Fitur

**Pembeli**: beranda, katalog dengan pencarian, filter (kategori, kota, harga, ketersediaan) dan pengurutan; detail produk dengan galeri, cerita, ulasan, produk terkait; keranjang tersimpan di database (tamu lewat token sesi, digabung saat login); checkout dengan validasi backend (pesanan dipecah per UMKM, harga/stok/total dihitung ulang server di dalam transaksi dengan row lock); riwayat & detail pesanan, pembatalan, konfirmasi diterima, ulasan setelah pesanan selesai; direktori UMKM; Cerita Banua; notifikasi dalam aplikasi.

**Seller / UMKM** (`/seller`): ringkasan & grafik penjualan, CRUD produk + unggah foto (JPG/PNG/WebP, maks. 3 MB, maks. 6 foto), manajemen stok, pesanan masuk dengan alur status (Menunggu → Diproses → Dikirim → Selesai / Dibatalkan, stok dikembalikan saat batal), profil UMKM (logo & sampul), cerita produk, panduan & pelatihan dengan progres.

**Admin** (`/admin`): overview KPI target proyek (50 UMKM aktif, +30% transaksi dalam 3 bulan, kepuasan ≥ 4/5) yang dipisah dari angka aktual; verifikasi UMKM (setujui/tolak/nonaktifkan); kurasi produk (setujui/tolak/unggulan/sembunyikan); CRUD kategori; manajemen pesanan; manajemen pengguna (nonaktifkan akun); CRUD materi pelatihan; laporan & analitik.

### Keamanan

- Otorisasi di backend: Gate `access-seller` / `access-admin` pada grup rute, Policy untuk produk, pesanan, dan profil UMKM. Seller tidak dapat melihat/mengubah produk atau pesanan UMKM lain.
- Role tidak mass-assignable; registrasi publik hanya untuk Customer dan Seller.
- Validasi Form Request, CSRF, hashing kata sandi, rate limiting (login, keranjang, checkout, unggah, ulasan).
- Nama file unggahan diacak; tipe & ukuran divalidasi.
- Pengguna yang dinonaktifkan otomatis dikeluarkan dari sesi.

### Yang masih simulasi

- Pembayaran (transfer/COD berlabel demo) dan ongkos kirim (tarif flat).
- Data UMKM, produk, pesanan, ulasan, dan grafik analitik hasil seeder (berlabel DEMO).
- Cerita produk tulisan penjual ditandai "Konten contoh" sampai diverifikasi.
- Notifikasi hanya di dalam aplikasi (tanpa email/WhatsApp).
- Foto demo dari Wikimedia Commons (lihat `/tentang#kredit-foto`); produk tanpa foto memakai ilustrasi cadangan.

## Deploy gratis (Render + TiDB Cloud)

Repo sudah berisi `Dockerfile`, `docker/entrypoint.sh`, dan `render.yaml`. Saat container menyala, entrypoint menjalankan `migrate --force` lalu `db:seed --force` (seeder hanya mengisi data bila masih kosong, jadi aman dijalankan ulang).

1. **Database (TiDB Cloud Serverless, gratis, kompatibel MySQL):** daftar di tidbcloud.com → buat cluster *Serverless* (region Singapore) → buat database `pasar_banua` → klik *Connect* dan catat host, port (4000), user, dan password.
2. **Kode:** push repo ini ke GitHub.
3. **Render:** daftar di render.com dengan akun GitHub → *New → Blueprint* → pilih repo ini. Render membaca `render.yaml` dan meminta nilai berikut:
   - `APP_KEY`: hasil `php artisan key:generate --show` di laptop.
   - `APP_URL`: URL layanan, mis. `https://pasar-banua.onrender.com`.
   - `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`: dari TiDB.
4. Tunggu build selesai (±5–10 menit), lalu buka URL-nya.

Batasan paket gratis:
- Layanan tidur setelah 15 menit tanpa pengunjung; akses pertama butuh ±30–60 detik.
- Filesystem Render bersifat sementara: foto yang **diunggah** seller/admin hilang saat layanan restart atau deploy ulang. Foto data demo aman karena disajikan dari `public/images/demo`. Untuk foto unggahan permanen, arahkan `PASARBANUA_UPLOAD_DISK` ke object storage (mis. S3/R2).
- Memakai Aiven MySQL sebagai ganti TiDB? Hapus `MYSQL_ATTR_SSL_CA` dan isi `DB_SSL_CA_PEM` dengan isi file `ca.pem` dari Aiven.

## Pengujian

```bash
php artisan test
```

82 tes fitur mencakup autentikasi, akses antar-role, katalog, keranjang, checkout (perhitungan total & stok), pembatalan, CRUD produk & validasi unggahan, alur status pesanan, profil UMKM, kurasi dan verifikasi admin, kategori, serta manajemen pengguna.

## Struktur penting

```
app/Services/            CartService, OrderService, CatalogService, SellerProductService, AnalyticsService, ImageStorage
app/Http/Controllers/    Shop/, Account/, Seller/, Admin/
app/Policies/            ProductPolicy, OrderPolicy, UmkmProfilePolicy
routes/                  web.php, seller.php, admin.php
resources/js/pages/      shop/, seller/, admin/, auth/, settings/
resources/js/components/ brand/, shared/, shop/, dashboard/, seller/, admin/, ui/
database/seeders/        CategorySeeder, TrainingSeeder, DemoMarketplaceSeeder
```
