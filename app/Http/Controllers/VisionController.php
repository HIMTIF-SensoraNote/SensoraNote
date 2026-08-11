<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Google\Cloud\Vision\V1\ImageAnnotatorClient;

class VisionController extends Controller
{
    /**
     * Menerima gambar dari frontend dan mengekstrak teks menggunakan Google Cloud Vision.
     */
    public function detectText(Request $request)
    {
        // 1. Validasi file yang diunggah (wajib berupa gambar, maksimal 5MB)
        $request->validate([
            'image' => 'required|image|max:5120',
        ]);

        try {
            // 2. Ambil path kredensial Google dari .env
            $credentialsPath = base_path(env('GOOGLE_APPLICATION_CREDENTIALS'));
            
            // 3. Inisialisasi client Vision API
            $imageAnnotator = new ImageAnnotatorClient([
                'credentials' => $credentialsPath
            ]);

            // 4. Baca file gambar yang diunggah
            $imageContent = file_get_contents($request->file('image')->getPathname());
            
            // 5. Lakukan deteksi teks
            $response = $imageAnnotator->textDetection($imageContent);
            $texts = $response->getTextAnnotations();
            
            // 6. Selalu tutup koneksi client setelah selesai
            $imageAnnotator->close();

            // 7. Jika ada teks yang berhasil dideteksi, kembalikan response JSON
            if (count($texts) > 0) {
                return response()->json([
                    'success' => true,
                    // Index [0] selalu berisi seluruh teks gabungan yang ditemukan pada gambar
                    'text' => $texts[0]->getDescription()
                ]);
            }

            // Jika tidak ada teks di dalam gambar
            return response()->json([
                'success' => false, 
                'text' => null
            ]);

        } catch (\Exception $e) {
            // Tangkap dan tampilkan pesan jika terjadi error pada API Google
            return response()->json([
                'success' => false, 
                'error' => $e->getMessage()
            ], 500);
        }
    }
}