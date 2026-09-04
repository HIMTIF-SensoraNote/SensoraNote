<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    /**
     * Handle chat message with Google Gemini API with smart model fallback.
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'message' => 'nullable|string|max:4000',
            'file' => 'nullable|array',
            'file.data' => 'nullable|string',
            'file.mime_type' => 'nullable|string',
            'file.name' => 'nullable|string',
            'file.text_content' => 'nullable|string',
            'history' => 'nullable|array',
            'history.*.role' => 'required_with:history|string|in:user,model,assistant',
            'history.*.parts' => 'nullable|array',
            'history.*.content' => 'nullable|string',
        ]);

        $apiKey = config('services.gemini.api_key') ?: env('GEMINI_API_KEY');
        $primaryModel = config('services.gemini.model') ?: env('GEMINI_MODEL', 'gemini-3-flash-preview');
        $timeout = (int) (config('services.gemini.timeout') ?: env('GEMINI_TIMEOUT', 15));

        if (empty($apiKey)) {
            return response()->json([
                'status' => 'error',
                'message' => 'GEMINI_API_KEY belum dikonfigurasi pada file .env di backend. Silakan tambahkan GEMINI_API_KEY untuk menggunakan fitur AI Chatbot.',
            ], 500);
        }

        $userMessage = trim((string) $request->input('message'));
        $fileInput = $request->input('file');
        $history = $request->input('history', []);

        if (empty($userMessage) && empty($fileInput)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pesan atau lampiran file tidak boleh kosong.',
            ], 422);
        }

        // System Instruction tailored for SensoraNote
        $systemInstruction = [
            'parts' => [
                [
                    'text' => "Anda adalah Sensora AI, asisten belajar cerdas, ramah, dan inklusif di platform SensoraNote.\n" .
                              "SensoraNote adalah platform berbagi catatan belajar inklusif yang mendukung aksesibilitas, translasi huruf Braille, ringkasan materi, dan analisis dokumen multi-modal.\n\n" .
                              "Panduan Pemformatan & Struktur Jawaban:\n" .
                              "1. Jika pengguna melampirkan gambar, foto dokumen, grafik, atau file teks/PDF, analisis materi tersebut secara detail, akurat, dan jelaskan langkah demi langkah.\n" .
                              "2. Gunakan format Markdown yang kaya, terstruktur, dan elegan:\n" .
                              "   - Gunakan heading (## dan ###) untuk membagi topik dan subtopik.\n" .
                              "   - Gunakan blok kode (```bahasa ... ```) dan inline code (`kode`) untuk contoh kode, perintah terminal, atau skrip.\n" .
                              "   - Gunakan notasi LaTeX untuk SEMUA rumus matematika, fisika, atau kimia: \$rumus\$ untuk inline dan \$\$rumus\$\$ untuk rumus terpusat (block).\n" .
                              "   - Gunakan garis pemisah (---) untuk memisahkan bagian materi atau topik yang berbeda.\n" .
                              "   - Gunakan kutipan/blockquote (> Teks) untuk definisi penting, hukum/teori, catatan khusus, atau tips belajar.\n" .
                              "   - Gunakan daftar berpoin (-) atau nomor (1. 2.) untuk rincian langkah atau poin-poin penjelasan.\n" .
                              "   - Gunakan **bold** untuk istilah penting/istilah kunci.\n" .
                              "3. Berikan jawaban yang akurat, terstruktur, mudah dipahami, dan berbahasa Indonesia yang baik."
                ]
            ]
        ];

        // Format contents for Gemini API (multi-turn)
        $contents = [];

        foreach ($history as $msg) {
            $role = ($msg['role'] === 'assistant' || $msg['role'] === 'model') ? 'model' : 'user';
            
            $text = '';
            if (!empty($msg['parts']) && is_array($msg['parts'])) {
                $text = $msg['parts'][0]['text'] ?? '';
            } elseif (!empty($msg['content'])) {
                $text = $msg['content'];
            }

            if (!empty(trim($text))) {
                $contents[] = [
                    'role' => $role,
                    'parts' => [
                        ['text' => $text]
                    ]
                ];
            }
        }

        // Build current user message parts (supporting multimodal inlineData and text documents)
        $userParts = [];

        if (!empty($fileInput)) {
            $fileData = $fileInput['data'] ?? '';
            $mimeType = $fileInput['mime_type'] ?? '';
            $fileName = $fileInput['name'] ?? 'lampiran';
            $textContent = $fileInput['text_content'] ?? '';

            // Clean Base64 prefix if exists
            $rawBase64 = $fileData;
            if (preg_match('/^data:([^;]+);base64,(.*)$/', $fileData, $matches)) {
                if (empty($mimeType)) {
                    $mimeType = $matches[1];
                }
                $rawBase64 = $matches[2];
            }

            $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

            // 1. Image formats or PDF -> Gemini inlineData
            $isImage = str_starts_with($mimeType, 'image/') || in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'avif', 'tiff', 'heic', 'heif', 'ico']);
            $isPdf = $mimeType === 'application/pdf' || $extension === 'pdf';

            if (!empty($rawBase64) && ($isImage || $isPdf)) {
                $actualMime = $isPdf ? 'application/pdf' : ($mimeType ?: 'image/jpeg');
                $userParts[] = [
                    'inlineData' => [
                        'mimeType' => $actualMime,
                        'data' => $rawBase64,
                    ]
                ];
            }
            // 2. Word documents (.docx)
            elseif ($extension === 'docx' || str_contains($mimeType, 'wordprocessingml.document')) {
                $extractedDocx = !empty($rawBase64) ? $this->extractTextFromDocx($rawBase64) : '';
                $finalDocxText = !empty($extractedDocx) ? $extractedDocx : $textContent;
                if (!empty($finalDocxText)) {
                    $userParts[] = [
                        'text' => "[Isi Dokumen Microsoft Word ({$fileName})]:\n\n" . $finalDocxText
                    ];
                }
            }
            // 3. HTML, Text, Markdown, CSV, Code, JSON, RTF
            elseif (!empty($textContent)) {
                $docTypeLabel = match ($extension) {
                    'html', 'htm' => 'Halaman Web / Dokumen HTML',
                    'doc' => 'Dokumen Word (DOC)',
                    'csv' => 'Tabel Data CSV',
                    'json' => 'Data JSON',
                    'md' => 'Dokumen Markdown',
                    'rtf' => 'Dokumen Rich Text (RTF)',
                    'xml' => 'Dokumen XML',
                    default => 'Dokumen Teks'
                };
                $userParts[] = [
                    'text' => "[Isi {$docTypeLabel} ({$fileName})]:\n\n" . $textContent
                ];
            }
            // 4. Fallback base64 decoded text
            elseif (!empty($rawBase64)) {
                $decodedText = base64_decode($rawBase64);
                if ($decodedText && mb_check_encoding($decodedText, 'UTF-8')) {
                    $userParts[] = [
                        'text' => "[Isi Berkas ({$fileName})]:\n\n" . $decodedText
                    ];
                }
            }
        }

        $promptText = !empty($userMessage) 
            ? $userMessage 
            : 'Tolong analisis, jelaskan, dan rangkum informasi penting dari file dokumen/gambar yang saya lampirkan ini.';

        $userParts[] = [
            'text' => $promptText
        ];

        $contents[] = [
            'role' => 'user',
            'parts' => $userParts
        ];

        $payload = [
            'contents' => $contents,
            'systemInstruction' => $systemInstruction,
            'generationConfig' => [
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 2048,
            ]
        ];

        // Model fallback queue
        $modelsToTry = array_unique([$primaryModel, 'gemini-3-flash-preview', 'gemini-3.7-flash', 'gemini-3.1-flash-lite-preview', 'gemini-3.8-flash', 'gemma-4-31b-it']);
        $lastError = null;

        foreach ($modelsToTry as $model) {
            $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

            try {
                $response = Http::timeout($timeout)
                    ->withOptions([
                        'curl' => [
                            CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
                        ],
                    ])
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                        'x-goog-api-key' => $apiKey,
                    ])
                    ->post($endpoint, $payload);

                if ($response->successful()) {
                    $responseData = $response->json();
                    $replyText = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? 'Maaf, Sensora AI tidak dapat menghasilkan jawaban saat ini.';

                    return response()->json([
                        'status' => 'success',
                        'reply' => $replyText,
                        'model' => $model,
                    ]);
                }

                $errorData = $response->json();
                $lastError = $errorData['error']['message'] ?? $response->body();
                Log::warning("Gemini model {$model} failed: {$lastError}. Trying fallback model if available.");

            } catch (\Exception $e) {
                $lastError = $e->getMessage();
                Log::warning("Gemini model {$model} threw exception: {$lastError}");
            }
        }

        if (str_contains($lastError, 'invalid authentication credentials') || str_contains($lastError, 'ACCESS_TOKEN_TYPE_UNSUPPORTED')) {
            $lastError = 'Kunci API Gemini (GEMINI_API_KEY) di .env tidak valid. Pastikan menggunakan API Key Google Gemini resmi.';
        }

        return response()->json([
            'status' => 'error',
            'message' => $lastError ?: 'Gagal menghubungi server Google Gemini API.',
        ], 500);
    }

    /**
     * Polish and reconstruct raw OCR text into structured Markdown and LaTeX using Gemini AI.
     */
    public function polishText(Request $request)
    {
        $request->validate([
            'text' => 'required|string|max:10000',
        ]);

        $apiKey = config('services.gemini.api_key') ?: env('GEMINI_API_KEY');
        $primaryModel = config('services.gemini.model') ?: env('GEMINI_MODEL', 'gemini-3-flash-preview');
        $timeout = (int) (config('services.gemini.timeout') ?: env('GEMINI_TIMEOUT', 15));

        if (empty($apiKey)) {
            return response()->json([
                'status' => 'error',
                'message' => 'GEMINI_API_KEY belum dikonfigurasi pada file .env.',
            ], 500);
        }

        $rawText = $request->input('text');

        $systemInstruction = [
            'parts' => [
                [
                    'text' => "Anda adalah asisten AI ahli pengoreksi dan penyusun catatan belajar untuk platform SensoraNote.\n" .
                              "Tugas Anda adalah membaca teks mentah hasil scan (OCR) yang mungkin memiliki banyak typo, kata terpotong, atau urutan berantakan, lalu menyusunnya kembali menjadi catatan yang rapi, profesional, dan enak dibaca.\n\n" .
                              "Aturan Pemformatan:\n" .
                              "1. Koreksi semua typo dan kesalahan pembacaan OCR agar kalimat menjadi koheren dan bermakna sesuai konteks materi.\n" .
                              "2. Gunakan format Markdown yang bersih dan terstruktur:\n" .
                              "   - Judul utama gunakan heading (## Judul Catatan)\n" .
                              "   - Subjudul gunakan heading (### Sub Topik)\n" .
                              "   - Gunakan poin-poin (-) atau nomor (1. 2.) untuk daftar/klasifikasi.\n" .
                              "   - Gunakan **bold** untuk istilah penting atau kata kunci utama. JANGAN gunakan single asterisk (*kata*) atau tanda kurung berlebihan.\n" .
                              "   - Jika ada rumus matematika, sains, fisika, atau kimia, WAJIB gunakan format LaTeX standar: \$rumus\$ untuk inline dan \$\$rumus\$\$ untuk block formula.\n" .
                              "3. Output HANYA berupa teks hasil rekonstruksi yang bersih. JANGAN tambahkan kalimat pembuka atau penutup lainnya."
                ]
            ]
        ];

        $payload = [
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        ['text' => "Teks mentah hasil OCR:\n\n" . $rawText]
                    ]
                ]
            ],
            'systemInstruction' => $systemInstruction,
            'generationConfig' => [
                'temperature' => 0.3,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 4096,
            ]
        ];

        $modelsToTry = array_unique([$primaryModel, 'gemini-3-flash-preview', 'gemini-3.7-flash', 'gemini-3.1-flash-lite-preview', 'gemini-3.8-flash', 'gemma-4-31b-it']);
        $lastError = null;

        foreach ($modelsToTry as $model) {
            $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

            try {
                $response = Http::timeout($timeout)
                    ->withOptions([
                        'curl' => [
                            CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
                        ],
                    ])
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                        'x-goog-api-key' => $apiKey,
                    ])
                    ->post($endpoint, $payload);

                if ($response->successful()) {
                    $responseData = $response->json();
                    $polished = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? '';

                    // Extract clean title from the first heading if available
                    $title = 'Catatan Hasil Scan';
                    if (preg_match('/^#+\s*(.+)$/m', $polished, $matches)) {
                        $title = trim($matches[1]);
                    }

                    return response()->json([
                        'status' => 'success',
                        'polished_text' => $polished,
                        'title' => $title,
                        'model' => $model,
                    ]);
                }

                $errorData = $response->json();
                $lastError = $errorData['error']['message'] ?? $response->body();

            } catch (\Exception $e) {
                $lastError = $e->getMessage();
            }
        }

        return response()->json([
            'status' => 'error',
            'message' => $lastError ?: 'Gagal merapikan teks dengan AI.',
        ], 500);
    }

    /**
     * Extract clean text from a Base64 encoded DOCX file using ZipArchive.
     */
    private function extractTextFromDocx(string $base64Data): string
    {
        $raw = base64_decode($base64Data);
        if (!$raw) return '';

        $tempFile = tempnam(sys_get_temp_dir(), 'docx_');
        file_put_contents($tempFile, $raw);

        $text = '';
        if (class_exists(\ZipArchive::class)) {
            $zip = new \ZipArchive();
            if ($zip->open($tempFile) === true) {
                if (($xml = $zip->getFromName('word/document.xml')) !== false) {
                    $xml = preg_replace('/<\/w:p>/', "\n", $xml);
                    $xml = preg_replace('/<\/w:br>/', "\n", $xml);
                    $text = trim(strip_tags($xml));
                    $text = html_entity_decode($text, ENT_QUOTES | ENT_XML1, 'UTF-8');
                }
                $zip->close();
            }
        }
        @unlink($tempFile);
        return $text;
    }
}
