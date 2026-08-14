<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class VisionController extends Controller
{
    public function detectCorners(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:5120',
        ]);

        try {
            $file = $request->file('image');
            $baseUrl = rtrim(config('services.doc_scanner.base_url'), '/');

            $response = Http::timeout(config('services.doc_scanner.timeout'))
                ->attach('file', file_get_contents($file->getRealPath()), $file->getClientOriginalName())
                ->post("{$baseUrl}/scanner/detect-corners");

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'error' => 'DocScanner-Service gagal mendeteksi tepi kertas.',
                    'detail' => $response->body(),
                ], $response->status());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Menerima gambar dari frontend dan memindainya lewat FastAPI DocScanner-Service.
     */
    public function detectText(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:5120',
        ]);

        try {
            $file = $request->file('image');
            $baseUrl = rtrim(config('services.doc_scanner.base_url'), '/');

            $scanResponse = Http::timeout(config('services.doc_scanner.timeout'))
                ->attach('file', file_get_contents($file->getRealPath()), $file->getClientOriginalName())
                ->post("{$baseUrl}/scanner/scan/base64");

            if ($scanResponse->failed()) {
                return response()->json([
                    'success' => false,
                    'error' => 'DocScanner-Service gagal memproses gambar.',
                    'detail' => $scanResponse->body(),
                ], $scanResponse->status());
            }

            $scanPayload = $scanResponse->json();
            $scannedImage = base64_decode($scanPayload['image_base64'] ?? '', true);

            if ($scannedImage === false) {
                return response()->json([
                    'success' => false,
                    'error' => 'Hasil scan tidak valid.',
                ], 502);
            }

            $brailleResponse = Http::timeout(config('services.doc_scanner.timeout'))
                ->attach('file', $scannedImage, 'scanned-document.png')
                ->post("{$baseUrl}/braille/image-to-braille");

            if ($brailleResponse->failed()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Braille service gagal membaca teks dari gambar.',
                    'detail' => $brailleResponse->body(),
                ], $brailleResponse->status());
            }

            $braillePayload = $brailleResponse->json();

            return response()->json([
                'success' => true,
                'mime_type' => $scanPayload['mime_type'] ?? 'image/png',
                'image_base64' => $scanPayload['image_base64'] ?? null,
                'text' => $braillePayload['text'] ?? '',
                'braille' => $braillePayload['braille'] ?? '',
                'unsupported' => $braillePayload['unsupported'] ?? [],
                'pdf_base64' => $braillePayload['pdf_base64'] ?? null,
                'pdf_mime_type' => $braillePayload['pdf_mime_type'] ?? 'application/pdf',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
