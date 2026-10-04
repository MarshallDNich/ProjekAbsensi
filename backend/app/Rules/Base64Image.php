<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Validasi bahwa input berupa gambar yang dikirim dalam bentuk
 * data URL base64 (hasil tangkapan kamera), sesuai tipe & ukuran
 * yang diizinkan di config/absensi.php.
 */
class Base64Image implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value) || !preg_match('/^data:image\/(\w+);base64,/', $value, $matches)) {
            $fail('Foto harus berupa gambar base64 (image/jpeg atau image/png).');
            return;
        }

        $mime = strtolower($matches[1]);
        $allowed = config('absensi.foto.allowed_mimes', ['jpeg', 'png']);

        if (!in_array($mime, $allowed)) {
            $fail('Tipe foto tidak didukung. Gunakan JPEG atau PNG.');
            return;
        }

        $base64 = substr($value, strpos($value, ',') + 1);
        $decoded = base64_decode($base64, true);

        if ($decoded === false) {
            $fail('Foto tidak valid (gagal mendecode).');
            return;
        }

        $maxBytes = (int) config('absensi.foto.max_size_kb', 2048) * 1024;

        if (strlen($decoded) > $maxBytes) {
            $fail('Ukuran foto melebihi batas maksimal yang diizinkan.');
            return;
        }

        if (@getimagesizefromstring($decoded) === false) {
            $fail('File bukan gambar yang valid.');
            return;
        }
    }
}
