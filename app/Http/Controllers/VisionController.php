<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VisionController extends Controller
{
    // URL API Gateway diambil dari .env (DOC_SCANNER_SERVICE_URL)
    private string $gatewayUrl;
    private int $timeout;

    public function __construct()
    {
        $this->gatewayUrl = rtrim(config('services.doc_scanner.base_url', 'http://127.0.0.1:8010'), '/');
        $this->timeout    = (int) config('services.doc_scanner.timeout', 60);
    }

    // =========================================================
    // HELPER: Validasi file gambar yang diupload
    // =========================================================
    private function validateImageFile(Request $request, string $field = 'file'): ?\Illuminate\Http\JsonResponse
    {
        if (!$request->hasFile($field)) {
            return response()->json(['status' => 'error', 'message' => 'File gambar wajib disertakan.'], 422);
        }

        $file = $request->file($field);

        if (!$file->isValid()) {
            return response()->json(['status' => 'error', 'message' => 'File yang diupload tidak valid atau rusak.'], 422);
        }

        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp', 'image/gif'];
        if (!in_array($file->getMimeType(), $allowedMimes)) {
            return response()->json(['status' => 'error', 'message' => 'Tipe file tidak didukung. Gunakan JPEG, PNG, atau WebP.'], 422);
        }

        // Maks 20 MB
        if ($file->getSize() > 20 * 1024 * 1024) {
            return response()->json(['status' => 'error', 'message' => 'Ukuran file terlalu besar. Maksimal 20 MB.'], 422);
        }

        return null; // Tidak ada error
    }

    // =========================================================
    // HELPER: Kirim file ke AI Gateway dengan error handling
    // =========================================================
    private function forwardFile(Request $request, string $endpoint, array $extraData = [])
    {
        try {
            $file     = $request->file('file');
            $filename = $file->getClientOriginalName() ?: 'upload.jpg';

            $http = Http::timeout($this->timeout)
                ->attach('file', file_get_contents($file->getRealPath()), $filename, [
                    'Content-Type' => $file->getMimeType(),
                ]);

            $response = empty($extraData)
                ? $http->post("{$this->gatewayUrl}{$endpoint}")
                : $http->post("{$this->gatewayUrl}{$endpoint}", $extraData);

            return response()->json($response->json(), $response->status());

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error("[VisionController] Tidak dapat terhubung ke AI Service: {$e->getMessage()}");
            return response()->json([
                'status'  => 'error',
                'message' => 'AI Service tidak dapat dijangkau. Pastikan DocScanner-Service sedang berjalan.',
            ], 503);
        } catch (\Exception $e) {
            Log::error("[VisionController] Error: {$e->getMessage()}");
            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan internal saat memproses gambar.',
            ], 500);
        }
    }

    // =========================================================
    // 1. DETEKSI SUDUT KERTAS (POST /api/scanner/detect)
    // =========================================================
    public function detectCorners(Request $request)
    {
        if ($err = $this->validateImageFile($request)) return $err;
        return $this->forwardFile($request, '/scanner/detect');
    }

    // =========================================================
    // 2. CROP PERSPEKTIF (POST /api/scanner/crop)
    // =========================================================
    public function cropImage(Request $request)
    {
        if ($err = $this->validateImageFile($request)) return $err;

        if (!$request->filled('corners')) {
            return response()->json(['status' => 'error', 'message' => 'Parameter corners wajib diisi.'], 422);
        }

        // Validasi corners adalah JSON array dengan 4 elemen
        $corners = json_decode($request->input('corners'), true);
        if (!is_array($corners) || count($corners) !== 4) {
            return response()->json(['status' => 'error', 'message' => 'corners harus berisi tepat 4 titik koordinat dalam format JSON.'], 422);
        }

        return $this->forwardFile($request, '/scanner/crop', ['corners' => $request->input('corners')]);
    }

    // =========================================================
    // 3. OCR TEKS ABJAD — DARI KAMERA (POST /api/scanner/ocr)
    // =========================================================
    public function ocrStandard(Request $request)
    {
        if ($err = $this->validateImageFile($request)) return $err;
        return $this->forwardFile($request, '/scanner/ocr');
    }

    // =========================================================
    // 4. OCR TEKS ABJAD — DARI GALERI HP (POST /api/scanner/ocr-gallery)
    //    Endpoint khusus untuk gambar statis dari galeri.
    //    Logika sama dengan ocrStandard, bisa dikembangkan nanti
    //    untuk pre-processing khusus gambar galeri (rotate, enhance, dll).
    // =========================================================
    public function ocrFromGallery(Request $request)
    {
        if ($err = $this->validateImageFile($request)) return $err;
        return $this->forwardFile($request, '/scanner/ocr');
    }

    // =========================================================
    // 5. OCR BRAILLE (POST /api/scanner/braille-ocr)
    // =========================================================
    public function brailleOcr(Request $request)
    {
        if ($err = $this->validateImageFile($request)) return $err;
        return $this->forwardFile($request, '/scanner/braille-ocr');
    }

    // =========================================================
    // 6. KONVERSI TEKS KE BRAILLE UNICODE (POST /api/braille/text-to-braille)
    // =========================================================
    public function textToBraille(Request $request)
    {
        if (!$request->filled('text')) {
            return response()->json(['status' => 'error', 'message' => 'Parameter text wajib diisi.'], 422);
        }

        try {
            $response = Http::timeout($this->timeout)
                ->post("{$this->gatewayUrl}/braille/text-to-braille", [
                    'text' => $request->input('text'),
                ]);

            return response()->json($response->json(), $response->status());

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error("[VisionController] Tidak dapat terhubung ke Braille Service: {$e->getMessage()}");
            return response()->json([
                'status'  => 'error',
                'message' => 'Braille Service tidak dapat dijangkau.',
            ], 503);
        } catch (\Exception $e) {
            Log::error("[VisionController] Error: {$e->getMessage()}");
            return response()->json([
                'status'  => 'error',
                'message' => 'Terjadi kesalahan internal.',
            ], 500);
        }
    }
}