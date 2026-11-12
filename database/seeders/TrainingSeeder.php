<?php

namespace Database\Seeders;

use App\Models\TrainingMaterial;
use Illuminate\Database\Seeder;

class TrainingSeeder extends Seeder
{
    public function run(): void
    {
        $materials = [
            [
                'title' => 'Mulai berjualan di Pasar Banua',
                'slug' => 'mulai-berjualan',
                'topic' => 'onboarding',
                'summary' => 'Langkah awal dari pendaftaran UMKM sampai produk pertama tayang.',
                'duration_minutes' => 6,
                'content' => <<<'TXT'
## Alur singkat
Pasar Banua adalah marketplace terkurasi. Artinya, setiap UMKM dan produk ditinjau admin sebelum tampil ke pembeli.

- Daftar sebagai Pelaku UMKM dan lengkapi profil usaha.
- Admin memverifikasi profil UMKM Anda.
- Tambahkan produk beserta foto, harga, stok, dan cerita.
- Admin mengkurasi produk. Setelah disetujui, produk tampil di katalog.

## Tips agar cepat disetujui
- Isi nama usaha, kota, dan kontak dengan benar.
- Gunakan foto asli produk Anda sendiri.
- Tulis deskripsi yang jujur: bahan, ukuran, dan berat.
TXT,
            ],
            [
                'title' => 'Foto produk yang menjual',
                'slug' => 'foto-produk',
                'topic' => 'katalog',
                'summary' => 'Panduan memotret produk dengan ponsel agar tampil menarik dan jujur.',
                'duration_minutes' => 8,
                'content' => <<<'TXT'
## Cahaya
Gunakan cahaya alami dari jendela. Hindari lampu kuning yang mengubah warna produk.

## Latar
Pilih latar polos (kain, meja kayu, atau kertas). Singkirkan benda yang tidak ikut dijual.

## Sudut
- Satu foto utama yang jelas dari depan.
- Satu foto detail tekstur atau bahan.
- Satu foto kemasan atau ukuran bila perlu.

## Yang sebaiknya dihindari
- Foto buram atau terlalu gelap.
- Foto milik orang lain.
- Filter berlebihan sehingga warna produk berbeda dari aslinya.
TXT,
            ],
            [
                'title' => 'Menulis deskripsi dan cerita produk',
                'slug' => 'deskripsi-dan-cerita',
                'topic' => 'katalog',
                'summary' => 'Ceritakan proses dan bahan produk Anda secara jujur dan menarik.',
                'duration_minutes' => 7,
                'content' => <<<'TXT'
## Deskripsi
Jawab pertanyaan pembeli sebelum mereka bertanya: bahan, ukuran, berat, rasa atau fungsi, dan cara penyimpanan.

## Cerita produk
Cerita membedakan Pasar Banua dari marketplace biasa. Tuliskan apa yang benar-benar Anda ketahui:

- Siapa yang membuatnya dan sejak kapan usaha berjalan.
- Dari mana bahan diperoleh.
- Bagaimana proses pembuatannya.

## Catatan penting
Jangan menulis sejarah atau makna budaya bila Anda belum yakin kebenarannya. Cerita yang belum diverifikasi admin akan diberi label "belum diverifikasi".
TXT,
            ],
            [
                'title' => 'Mengatur harga dan stok',
                'slug' => 'harga-dan-stok',
                'topic' => 'operasional',
                'summary' => 'Menetapkan harga yang adil dan menjaga stok tetap akurat.',
                'duration_minutes' => 6,
                'content' => <<<'TXT'
## Harga
- Hitung biaya bahan, tenaga, kemasan, dan ongkos kirim.
- Bandingkan dengan produk sejenis di katalog.
- Tulis harga dalam Rupiah tanpa titik atau koma.

## Stok
Stok berkurang otomatis saat pesanan dibuat dan kembali bila pesanan dibatalkan. Perbarui stok di menu Stok Produk setiap kali Anda selesai produksi.

## Produk habis
Bila stok 0, produk tetap tampil dengan label "Stok habis" dan tidak dapat dibeli.
TXT,
            ],
            [
                'title' => 'Mengelola pesanan masuk',
                'slug' => 'mengelola-pesanan',
                'topic' => 'operasional',
                'summary' => 'Alur status pesanan dari menunggu konfirmasi sampai selesai.',
                'duration_minutes' => 7,
                'content' => <<<'TXT'
## Alur status
- Menunggu konfirmasi: pesanan baru masuk, segera tinjau.
- Diproses: Anda menyiapkan dan mengemas pesanan.
- Dikirim: isi catatan pengiriman (misalnya nomor resi atau nama kurir).
- Selesai: pembeli menerima pesanan.
- Dibatalkan: pesanan dibatalkan dan stok dikembalikan.

## Kebiasaan baik
- Konfirmasi pesanan maksimal 1x24 jam.
- Hubungi pembeli lewat nomor telepon pesanan bila ada kendala stok.
- Pembayaran dan ekspedisi pada versi ini masih mode demo.
TXT,
            ],
            [
                'title' => 'Mengemas makanan dan kerajinan dengan aman',
                'slug' => 'packing-aman',
                'topic' => 'operasional',
                'summary' => 'Kemasan yang menjaga mutu produk selama pengiriman.',
                'duration_minutes' => 5,
                'content' => <<<'TXT'
## Makanan
- Gunakan kemasan kedap udara untuk camilan kering.
- Cantumkan tanggal produksi dan masa simpan.
- Pisahkan produk berbau kuat.

## Kerajinan dan kain
- Bungkus dengan plastik agar terhindar dari lembap.
- Beri pelindung (kardus atau bubble wrap) untuk produk yang mudah rusak.
- Lipat kain rapi dan tambahkan kartu ucapan.
TXT,
            ],
            [
                'title' => 'Membalas pembeli dengan ramah',
                'slug' => 'layanan-pembeli',
                'topic' => 'layanan',
                'summary' => 'Praktik komunikasi yang menjaga kepercayaan dan rating toko.',
                'duration_minutes' => 4,
                'content' => <<<'TXT'
## Prinsip
- Balas cepat, singkat, dan sopan.
- Jelaskan kondisi stok dan waktu pengiriman dengan jujur.
- Minta maaf bila ada kesalahan dan tawarkan solusi.

## Ulasan
Pembeli dapat memberi ulasan setelah pesanan selesai. Ulasan yang baik membantu produk lain di toko Anda ikut dikenal.
TXT,
            ],
            [
                'title' => 'Memahami kurasi produk',
                'slug' => 'memahami-kurasi',
                'topic' => 'onboarding',
                'summary' => 'Kriteria yang dipakai admin saat meninjau produk.',
                'duration_minutes' => 4,
                'content' => <<<'TXT'
## Yang ditinjau admin
- Kejelasan foto dan nama produk.
- Kelengkapan deskripsi, harga, dan stok.
- Kesesuaian kategori.
- Kejujuran informasi, termasuk cerita produk.

## Bila produk ditolak
Admin menuliskan alasan penolakan. Perbaiki sesuai catatan, lalu simpan kembali; produk akan kembali ke antrean kurasi.
TXT,
            ],
        ];

        foreach ($materials as $i => $material) {
            TrainingMaterial::updateOrCreate(
                ['slug' => $material['slug']],
                [...$material, 'sort_order' => $i + 1, 'is_published' => true],
            );
        }
    }
}
