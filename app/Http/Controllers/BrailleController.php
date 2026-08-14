<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class BrailleController extends Controller
{
    public function textToBraille(Request $request)
    {
        $validated = $request->validate([
            'text' => 'required|string',
        ]);

        return $this->proxy('/braille/text-to-braille', $validated);
    }

    public function brailleToText(Request $request)
    {
        $validated = $request->validate([
            'braille' => 'required|string',
        ]);

        return $this->proxy('/braille/braille-to-text', $validated);
    }

    private function proxy(string $path, array $payload)
    {
        try {
            $baseUrl = rtrim(config('services.doc_scanner.base_url'), '/');
            $response = Http::timeout(config('services.doc_scanner.timeout'))
                ->post("{$baseUrl}{$path}", $payload);

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Braille converter service gagal memproses request.',
                    'detail' => $response->body(),
                ], $response->status());
            }

            return response()->json(array_merge(['success' => true], $response->json() ?? []));
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
