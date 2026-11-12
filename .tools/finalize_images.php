<?php
// Finalisasi foto demo: resize, simpan, tulis manifest & kredit.
$dir = 'G:/Pasar Banua/database/seeders/demo-images';
$cand = $dir.'/_candidates';
$meta = json_decode(file_get_contents($cand.'/meta.json'), true)['meta'];

// kunci => [file kandidat, alt Indonesia (deskripsi jujur isi foto)]
$picks = [
    'hero' => ['Banjarmasin_floating_market_2018.jpg', 'Deretan jukung berisi sayur dan buah di pasar terapung Banjarmasin'],
    'pasar-terapung' => ['Jukung_Pasar_Terapung.jpg', 'Pemandangan udara ratusan jukung pedagang di pasar terapung'],
    'jukung-teratai' => ['Jukung_Teratai.jpg', 'Jukung-jukung tersusun melingkar seperti bunga teratai di atas sungai'],
    'amplang' => ['Amplang_001.jpg', 'Amplang goreng di atas piring'],
    'dodol-kandangan' => ['Dodol_Kandangan_Original.jpg', 'Potongan dodol Kandangan rasa original di atas piring'],
    'bingka' => ['Bingka.jpg', 'Kue bingka berbentuk bunga dalam nampan di pasar kuliner'],
    'bingka-kentang' => ['Bingka_Kentang.jpg', 'Sepotong kue bingka kentang di atas piring'],
    'apam' => ['Apam_Barabai.jpg', 'Kue apam Barabai disajikan dengan parutan kelapa'],
    'abon-ikan' => ['Abon_Garih_Haruan_Iwak_Garih_Haruan.JPG', 'Abon ikan haruan dalam wadah plastik'],
    'madu' => ['Madu_Kelulut_di_Event_Rancah_Mampulang_Desa_Balida_Kecamatan_Paringin.jpg', 'Botol madu kelulut dalam keranjang anyaman'],
    'purun-craft' => ['Purun_craft.jpg', 'Pengrajin menganyam purun di antara berbagai produk anyaman'],
    'tanggui' => ['Tanggui._JPG.jpg', 'Tanggui anyaman tergantung di teras'],
    'sasirangan-kain' => ['Kain_Sasirangan_di_Kampung_Sasirangan_Banjarmasin.jpg', 'Kain sasirangan berwarna hijau dan biru dengan motif beragam'],
    'sasirangan-panel' => ['Kain_Sasirangan_002.JPG', 'Empat panel kain sasirangan berwarna kuning, hitam, hijau, dan merah muda'],
    'sasirangan-produk' => ['Baju_Sasirangan_di_Kampung_Sasirangan.jpg', 'Busana sasirangan berwarna kuning pada manekin'],
    'sasirangan-alami' => ['Kain_Sasirangan_Pewarna_Alami.jpg', 'Kain sasirangan dengan warna biru dan kuning hasil pewarna alami'],
    'rumah-banjar' => ['Rumah_Banjar_Bubungan_Tinggi_Habirau.jpg', 'Rumah Banjar bubungan tinggi dari kayu'],
];

function load(string $file)
{
    $info = getimagesize($file);

    return match ($info[2]) {
        IMAGETYPE_PNG => imagecreatefrompng($file),
        IMAGETYPE_WEBP => imagecreatefromwebp($file),
        default => imagecreatefromjpeg($file),
    };
}

$manifest = [];
$credits = "# Kredit Foto Demo Pasar Banua\n\nFoto pada data demonstrasi diambil dari Wikimedia Commons dan dipakai sesuai lisensinya masing-masing. Foto bersifat ilustrasi; produk, UMKM, dan harga pada aplikasi ini adalah data demo dan bukan produk mitra sungguhan.\n\n";

foreach ($picks as $key => [$file, $alt]) {
    $path = $cand.'/'.$file;
    if (! is_file($path) || filesize($path) < 20000) {
        fwrite(STDERR, "SKIP $key ($file)\n");
        continue;
    }
    $src = load($path);
    [$w, $h] = [imagesx($src), imagesy($src)];
    $scale = min(1, 1600 / max($w, $h));
    $nw = (int) round($w * $scale);
    $nh = (int) round($h * $scale);
    $dst = imagecreatetruecolor($nw, $nh);
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
    imagejpeg($dst, "$dir/$key.jpg", 82);
    if ($key === 'hero') {
        @mkdir('G:/Pasar Banua/public/images', 0777, true);
        imagejpeg($dst, 'G:/Pasar Banua/public/images/hero.jpg', 82);
    }

    $norm = fn ($s) => preg_replace('/[^a-z0-9]/', '', strtolower($s));
    $m = null;
    foreach ($meta as $metaKey => $metaVal) {
        if ($norm(substr($metaKey, 5)) === $norm($file)) {
            $m = $metaVal;
            break;
        }
    }
    if (! $m) {
        fwrite(STDERR, "NO META $key\n");
    }
    $title = str_replace('_', ' ', $file);
    $author = $m ? trim(html_entity_decode(strip_tags($m['author'] ?? ''))) : '';
    $manifest[] = [
        'key' => $key,
        'file' => "$key.jpg",
        'title' => $title,
        'author' => $author ?: 'Tidak dicantumkan',
        'license' => $m['lic'] ?? '',
        'license_url' => $m['licurl'] ?? '',
        'source_url' => $m['desc'] ?? '',
        'alt' => $alt,
    ];
    $credits .= "- **{$key}** — \"{$title}\" oleh {$author}, lisensi {$m['lic']} ({$m['desc']})\n";
    echo "$key ok {$nw}x{$nh} {$m['lic']}\n";
}

file_put_contents($dir.'/manifest.json', json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
file_put_contents($dir.'/CREDITS.md', $credits);
