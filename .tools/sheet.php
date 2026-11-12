<?php
// Contact sheet kandidat foto. Pakai: php sheet.php out.jpg file1 file2 ...
$args = array_slice($argv, 1);
$out = array_shift($args);
$cols = 4;
$tw = 360;
$th = 270;
$rows = (int) ceil(count($args) / $cols);
$sheet = imagecreatetruecolor($cols * $tw, $rows * ($th + 16));
imagefill($sheet, 0, 0, imagecolorallocate($sheet, 240, 240, 240));
$black = imagecolorallocate($sheet, 0, 0, 0);
foreach ($args as $i => $file) {
    $info = @getimagesize($file);
    if (! $info) {
        continue;
    }
    $img = match ($info[2]) {
        IMAGETYPE_PNG => imagecreatefrompng($file),
        IMAGETYPE_WEBP => imagecreatefromwebp($file),
        default => imagecreatefromjpeg($file),
    };
    [$w, $h] = $info;
    $scale = min($tw / $w, $th / $h);
    $nw = (int) ($w * $scale);
    $nh = (int) ($h * $scale);
    $x = ($i % $cols) * $tw + (int) (($tw - $nw) / 2);
    $y = intdiv($i, $cols) * ($th + 16);
    imagecopyresampled($sheet, $img, $x, $y + 16, 0, 0, $nw, $nh, $w, $h);
    imagestring($sheet, 2, ($i % $cols) * $tw + 4, $y + 1, $i.': '.substr(basename($file), 0, 48), $black);
}
imagejpeg($sheet, $out, 80);
echo "ok\n";
