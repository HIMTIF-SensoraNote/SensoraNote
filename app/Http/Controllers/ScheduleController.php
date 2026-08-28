<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ScheduleController extends Controller
{
    /**
     * Parse voice/text prompt using Google Gemini into structured schedule items
     */
    public function parseVoiceSchedule(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string|max:3000',
            'target_date' => 'nullable|string',
        ]);

        $userId = (string) auth()->id();
        $prompt = trim($request->input('prompt'));
        $targetDate = $request->input('target_date') ?: date('Y-m-d');
        $currentTime = $request->input('current_time') ?: date('H:i');

        $apiKey = config('services.gemini.api_key') ?: env('GEMINI_API_KEY');
        $primaryModel = config('services.gemini.model') ?: env('GEMINI_MODEL', 'gemini-2.0-flash');
        $timeout = (int) (config('services.gemini.timeout') ?: env('GEMINI_TIMEOUT', 45));

        if (empty($apiKey)) {
            return response()->json([
                'status' => 'error',
                'message' => 'GEMINI_API_KEY belum dikonfigurasi di server backend.',
            ], 500);
        }

        $systemInstruction = "Anda adalah AI Smart Schedule Assistant di platform SensoraNote.\n" .
            "Tugas Anda: Menganalisis ucapan/teks jadwal harian pengguna (dalam bahasa Indonesia) dan mengekstraknya menjadi array JSON jadwal yang terstruktur, kronologis, realistis, dan MENGGUNAKAN STANDAR FORMAT WAKTU 24 JAM (00:00 - 23:59).\n\n" .
            "KONTEKS WAKTU REAL-TIME SAAT INI:\n" .
            "- Waktu saat ini ketika ucapan dibuat: {$currentTime} (Format 24 Jam)\n" .
            "- Tanggal target jadwal: {$targetDate}\n\n" .
            "ATURAN KONVERSI FORMAT WAKTU 24 JAM (SANGAT PENTING & MUTLAK):\n" .
            "1. JANGAN PERNAH menyamakan waktu malam/sore/siang dengan waktu pagi! Selalu gunakan standar waktu 24 jam:\n" .
            "   - Jam 8 malam = '20:00' (Bukan 08:00)\n" .
            "   - Jam 1 siang = '13:00' (Bukan 01:00)\n" .
            "   - Jam 2 siang = '14:00' (Bukan 02:00)\n" .
            "   - Jam 3 sore = '15:00' (Bukan 03:00)\n" .
            "   - Jam 4 sore = '16:00' (Bukan 04:00)\n" .
            "   - Jam 5 sore = '17:00' (Bukan 05:00)\n" .
            "   - Jam 6 sore / maghrib = '18:00' (Bukan 06:00)\n" .
            "   - Jam 7 malam = '19:00' (Bukan 07:00)\n" .
            "   - Jam 9 malam = '21:00' (Bukan 09:00)\n" .
            "   - Jam 10 malam = '22:00' (Bukan 10:00)\n" .
            "   - Jam 11 malam = '23:00' (Bukan 11:00)\n" .
            "   - Jam 12 siang = '12:00', Jam 12 malam = '00:00' / '23:59'\n\n" .
            "2. RESOLUSI AMBIGUITAS WAKTU RELATIF ('DARI SEKARANG SAMPAI JAM X'):\n" .
            "   - Kasus: Pengguna berkata 'buatkan jadwal dari sekarang sampai jam 8' (atau jam 1..11 lainnya).\n" .
            "   - Jika waktu saat ini ({$currentTime}) sudah melewati jam pagi tersebut (misal waktu sekarang 14:00), maka batas waktu sampai 'jam 8' tersebut PASTI maksudnya adalah JAM 8 MALAM ('20:00') pada hari ini!\n" .
            "   - Kegiatan pertama WAJIB dimulai dari waktu saat ini ({$currentTime}) dan kegiatan terakhir berakhir tepat pada waktu target (misal '20:00').\n" .
            "   - Buat beberapa slot kegiatan belajar dan istirahat yang realistis, proporsional, dan teratur di antara rentang waktu tersebut (misal dari {$currentTime} sampai 20:00).\n\n" .
            "3. ATURAN LAINNYA:\n" .
            "   - Setiap kegiatan harus memiliki 'time_start' dan 'time_end' berurutan maju tanpa bentrok.\n" .
            "   - Format waktu harus 2 digit jam dan 2 digit menit: HH:mm (contoh: '08:00', '13:30', '20:00').\n\n" .
            "ATURAN OUTPUT JSON:\n" .
            "1. HANYA kembalikan JSON valid murni tanpa markdown.\n" .
            "2. Format JSON:\n" .
            "   - 'summary': Ringkasan tema/fokus hari ini (1-2 kalimat bahasa Indonesia).\n" .
            "   - 'items': Array objek jadwal:\n" .
            "       - 'time_start': Format 24 jam HH:mm\n" .
            "       - 'time_end': Format 24 jam HH:mm\n" .
            "       - 'title': Nama aktivitas yang jelas dan spesifik\n" .
            "       - 'category': Kategori ('Matematika', 'Informatika', 'Bahasa', 'Sains', 'Sosial', 'Istirahat', 'Olahraga', 'Umum')\n" .
            "       - 'priority': 'tinggi', 'sedang', atau 'rendah'\n" .
            "       - 'color': 'blue', 'emerald', 'amber', 'purple', 'rose', atau 'indigo'";

        $userPrompt = "Waktu sekarang: {$currentTime}. Tanggal target: {$targetDate}.\n" .
            "Ubah transkripsi ucapan jadwal berikut menjadi format JSON jadwal harian yang akurat:\n\n\"{$prompt}\"";

        $payload = [
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        ['text' => $userPrompt]
                    ]
                ]
            ],
            'systemInstruction' => [
                'parts' => [
                    ['text' => $systemInstruction]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.2,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 2048,
                'responseMimeType' => 'application/json',
            ]
        ];

        $modelsToTry = array_unique([$primaryModel, 'gemini-2.0-flash', 'gemini-3.5-flash-lite', 'gemini-3.7-flash', 'gemini-2.5-pro']);
        $rawResult = null;
        $lastError = null;

        foreach ($modelsToTry as $model) {
            $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

            try {
                $response = Http::timeout($timeout)
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                        'x-goog-api-key' => $apiKey,
                    ])
                    ->post($endpoint, $payload);

                if ($response->successful()) {
                    $responseData = $response->json();
                    $rawResult = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? null;
                    if ($rawResult) {
                        break;
                    }
                } else {
                    $lastError = $response->body();
                }
            } catch (\Exception $e) {
                $lastError = $e->getMessage();
            }
        }

        if (!$rawResult) {
            return response()->json([
                'status' => 'error',
                'message' => 'AI sedang sibuk. Silakan coba beberapa saat lagi.',
                'debug' => $lastError,
            ], 500);
        }

        // Clean JSON markdown if wrapped
        $cleanJson = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($rawResult));
        $parsed = json_decode($cleanJson, true);

        if (!$parsed || !isset($parsed['items']) || !is_array($parsed['items'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memproses struktur jadwal AI. Coba bicarakan jadwal dengan lebih spesifik.',
                'raw' => $rawResult,
            ], 422);
        }

        // Add UUID, normalized 24h times, and is_completed to each item
        $newItems = [];
        $lastEnd = $currentTime;
        foreach ($parsed['items'] as $item) {
            $start = $this->normalizeTime24h($item['time_start'] ?? null, $lastEnd);
            $end = $this->normalizeTime24h($item['time_end'] ?? null, $start);

            // Ensure end time is strictly after start time
            if (strcmp($end, $start) <= 0) {
                $endParts = explode(':', $end);
                $endH = (int) ($endParts[0] ?? 0);
                if ($endH < 12) {
                    $endH += 12;
                    $end = sprintf('%02d:%02d', min(23, $endH), (int) ($endParts[1] ?? 0));
                }
                if (strcmp($end, $start) <= 0) {
                    $startParts = explode(':', $start);
                    $newEndH = min(23, ((int) ($startParts[0] ?? 0)) + 1);
                    $end = sprintf('%02d:%02d', $newEndH, (int) ($startParts[1] ?? 0));
                }
            }

            $lastEnd = $end;

            $newItems[] = [
                'id' => (string) Str::uuid(),
                'time_start' => $start,
                'time_end' => $end,
                'title' => $item['title'] ?? 'Belajar Mandiri',
                'category' => $item['category'] ?? 'Umum',
                'priority' => $item['priority'] ?? 'sedang',
                'color' => $item['color'] ?? 'blue',
                'is_completed' => false,
            ];
        }

        // Check if caller requests preview only (default true for confirmation workflow)
        $previewOnly = $request->boolean('preview_only', true);

        if ($previewOnly) {
            usort($newItems, function($a, $b) {
                return strcmp($a['time_start'] ?? '00:00', $b['time_start'] ?? '00:00');
            });

            return response()->json([
                'status' => 'success',
                'preview' => true,
                'message' => 'Jadwal berhasil dianalisis oleh AI! Silakan konfirmasi.',
                'data' => [
                    'date' => $targetDate,
                    'summary' => $parsed['summary'] ?? 'Fokus belajar hari ini',
                    'items' => $newItems,
                    'raw_prompt' => $prompt,
                ],
            ]);
        }

        // Find or create schedule for this user and date
        $schedule = Schedule::where('user_id', $userId)
            ->where('date', $targetDate)
            ->first();

        if ($schedule) {
            // Replace with newly generated items (Overwrite old schedule for this date)
            $schedule->items = $newItems;
            $schedule->raw_prompt = $prompt;
            $schedule->summary = $parsed['summary'] ?? $schedule->summary;
            $schedule->save();
        } else {
            usort($newItems, function($a, $b) {
                return strcmp($a['time_start'] ?? '00:00', $b['time_start'] ?? '00:00');
            });

            $schedule = Schedule::create([
                'user_id' => $userId,
                'date' => $targetDate,
                'items' => $newItems,
                'raw_prompt' => $prompt,
                'summary' => $parsed['summary'] ?? 'Jadwal belajar harian SensoraNote',
                'is_published' => false,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Jadwal berhasil diperbarui!',
            'data' => $schedule,
        ]);
    }

    /**
     * Save confirmed schedule items from AI preview
     */
    public function saveConfirmedSchedule(Request $request)
    {
        $request->validate([
            'date' => 'required|string',
            'items' => 'required|array',
            'summary' => 'nullable|string',
            'raw_prompt' => 'nullable|string',
        ]);

        $userId = (string) auth()->id();
        $date = $request->input('date');
        $newItems = $request->input('items', []);
        $summary = $request->input('summary', 'Jadwal belajar harian SensoraNote');
        $rawPrompt = $request->input('raw_prompt', '');

        $schedule = Schedule::where('user_id', $userId)->where('date', $date)->first();

        $formattedItems = [];
        foreach ($newItems as $it) {
            $formattedItems[] = [
                'id' => $it['id'] ?? (string) Str::uuid(),
                'time_start' => $it['time_start'] ?? '08:00',
                'time_end' => $it['time_end'] ?? '09:00',
                'title' => $it['title'] ?? 'Aktivitas Belajar',
                'category' => $it['category'] ?? 'Umum',
                'priority' => $it['priority'] ?? 'sedang',
                'color' => $it['color'] ?? 'blue',
                'is_completed' => !empty($it['is_completed']),
            ];
        }

        usort($formattedItems, function($a, $b) {
            return strcmp($a['time_start'] ?? '00:00', $b['time_start'] ?? '00:00');
        });

        if ($schedule) {
            // Overwrite old items with the newly confirmed schedule
            $schedule->items = $formattedItems;
            if ($rawPrompt) {
                $schedule->raw_prompt = $rawPrompt;
            }
            $schedule->summary = $summary ?: $schedule->summary;
            $schedule->save();
        } else {
            $schedule = Schedule::create([
                'user_id' => $userId,
                'date' => $date,
                'items' => $formattedItems,
                'raw_prompt' => $rawPrompt,
                'summary' => $summary,
                'is_published' => false,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Jadwal berhasil dikonfirmasi dan disimpan!',
            'data' => $schedule,
        ]);
    }

    /**
     * Get schedule for a specific date
     */
    public function index(Request $request)
    {
        $userId = (string) auth()->id();
        $date = $request->query('date', date('Y-m-d'));

        $schedule = Schedule::where('user_id', $userId)
            ->where('date', $date)
            ->first();

        if (!$schedule) {
            return response()->json([
                'status' => 'success',
                'data' => [
                    'date' => $date,
                    'items' => [],
                    'summary' => 'Belum ada jadwal belajar untuk tanggal ini.',
                    'is_published' => false,
                ],
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data' => $schedule,
        ]);
    }

    /**
     * Manually add an item to the schedule
     */
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|string',
            'title' => 'required|string|max:255',
            'time_start' => 'required|string',
            'time_end' => 'required|string',
            'category' => 'nullable|string',
            'priority' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $userId = (string) auth()->id();
        $date = $request->input('date');

        $newItem = [
            'id' => (string) Str::uuid(),
            'time_start' => $request->input('time_start'),
            'time_end' => $request->input('time_end'),
            'title' => $request->input('title'),
            'category' => $request->input('category', 'Umum'),
            'priority' => $request->input('priority', 'sedang'),
            'color' => $request->input('color', 'blue'),
            'is_completed' => false,
        ];

        $schedule = Schedule::where('user_id', $userId)->where('date', $date)->first();

        if ($schedule) {
            $items = $schedule->items ?: [];
            $items[] = $newItem;
            usort($items, function($a, $b) {
                return strcmp($a['time_start'] ?? '00:00', $b['time_start'] ?? '00:00');
            });
            $schedule->items = $items;
            $schedule->save();
        } else {
            $schedule = Schedule::create([
                'user_id' => $userId,
                'date' => $date,
                'items' => [$newItem],
                'summary' => 'Jadwal belajar mandiri',
                'is_published' => false,
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Kegiatan berhasil ditambahkan',
            'data' => $schedule,
        ]);
    }

    /**
     * Toggle item completion
     */
    public function toggleItem(Request $request, $id, $itemId)
    {
        $userId = (string) auth()->id();
        $schedule = Schedule::where('user_id', $userId)->where('_id', $id)->first()
            ?? Schedule::where('user_id', $userId)->where('id', $id)->first();

        if (!$schedule) {
            return response()->json(['status' => 'error', 'message' => 'Jadwal tidak ditemukan'], 404);
        }

        $items = $schedule->items ?: [];
        $found = false;

        foreach ($items as &$item) {
            if (($item['id'] ?? '') === $itemId) {
                $item['is_completed'] = !($item['is_completed'] ?? false);
                $found = true;
                break;
            }
        }

        if (!$found) {
            return response()->json(['status' => 'error', 'message' => 'Item kegiatan tidak ditemukan'], 404);
        }

        $schedule->items = $items;
        $schedule->save();

        // Invalidate learning stats cache so stats immediately refresh
        Cache::forget("learning_stats_user_{$userId}");
        Cache::forget("learning_stats_user_{$userId}_" . date('Y-m-d'));

        return response()->json([
            'status' => 'success',
            'message' => 'Status kegiatan diperbarui',
            'data' => $schedule,
        ]);
    }

    /**
     * Delete an item from schedule
     */
    public function destroyItem(Request $request, $id, $itemId)
    {
        $userId = (string) auth()->id();
        $schedule = Schedule::where('user_id', $userId)->where('_id', $id)->first()
            ?? Schedule::where('user_id', $userId)->where('id', $id)->first();

        if (!$schedule) {
            return response()->json(['status' => 'error', 'message' => 'Jadwal tidak ditemukan'], 404);
        }

        $items = array_values(array_filter($schedule->items ?: [], function($item) use ($itemId) {
            return ($item['id'] ?? '') !== $itemId;
        }));

        $schedule->items = $items;
        $schedule->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Kegiatan berhasil dihapus',
            'data' => $schedule,
        ]);
    }

    /**
     * Publish schedule as a public SensoraNote note/post
     */
    public function publishAsNote(Request $request, $id)
    {
        $user = auth()->user();
        $userId = (string) $user->id;
        
        $schedule = Schedule::where('user_id', $userId)->where('_id', $id)->first()
            ?? Schedule::where('user_id', $userId)->where('id', $id)->first();

        if (!$schedule || empty($schedule->items)) {
            return response()->json(['status' => 'error', 'message' => 'Jadwal kosong atau tidak ditemukan'], 404);
        }

        // Format nice Markdown Content
        $formattedDate = date('d F Y', strtotime($schedule->date));
        $content = "## 📅 Rencana Belajar Harian ({$formattedDate})\n\n";
        
        if ($schedule->summary) {
            $content .= "> 💡 **Fokus & Motivasi:** {$schedule->summary}\n\n";
        }

        $content .= "### ⏱️ Rincian Jadwal & Target Belajar:\n\n";
        $content .= "| Waktu | Mata Pelajaran / Kegiatan | Kategori | Prioritas |\n";
        $content .= "| :--- | :--- | :--- | :--- |\n";

        foreach ($schedule->items as $item) {
            $prioBadge = ($item['priority'] ?? 'sedang') === 'tinggi' ? '🔥 Tinggi' : (($item['priority'] ?? '') === 'rendah' ? '🌱 Rendah' : '⚡ Sedang');
            $content .= "| **{$item['time_start']} - {$item['time_end']}** | {$item['title']} | {$item['category']} | {$prioBadge} |\n";
        }

        $content .= "\n---\n*Dibuat otomatis dengan asisten suara cerdas SensoraNote.*";

        $post = Post::create([
            'user_id' => $userId,
            'title' => "Rencana Belajar: {$formattedDate}",
            'description' => $schedule->summary ?: "Jadwal belajar harian tanggal {$formattedDate}",
            'content' => $content,
            'plain_content' => strip_tags($content),
            'mapel' => 'Umum',
            'jenjang' => $user->jenjang_pendidikan ?: 'SMA/SMK',
            'kelas' => 'Umum',
            'semester' => '1',
            'tags' => ['JadwalBelajar', 'StudyPlan', 'Produktivitas', 'SensoraAI'],
            'is_verified' => false,
            'likes_count' => 0,
            'comments_count' => 0,
            'views' => 0,
        ]);

        $schedule->is_published = true;
        $schedule->published_post_id = (string) $post->_id;
        $schedule->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Jadwal berhasil dipublikasikan sebagai Catatan Komunitas!',
            'post_id' => (string) $post->_id,
            'data' => $schedule,
        ]);
    }

    /**
     * Normalize time strings to clean 24-hour HH:mm format
     */
    private function normalizeTime24h(?string $timeStr, ?string $referenceTime = null): string
    {
        if (empty($timeStr)) {
            return $referenceTime ?: '08:00';
        }

        $timeStr = trim($timeStr);
        // Replace dot with colon (e.g. 08.00 -> 08:00)
        $timeStr = str_replace('.', ':', $timeStr);

        $parts = explode(':', $timeStr);
        $hours = isset($parts[0]) ? (int) $parts[0] : 8;
        $minutes = isset($parts[1]) ? (int) $parts[1] : 0;

        // If reference time is in the afternoon (>= 12:00) and this hour is 1..11, convert to PM (+12)
        if ($referenceTime) {
            $refParts = explode(':', str_replace('.', ':', $referenceTime));
            $refHours = (int) ($refParts[0] ?? 0);
            if ($refHours >= 12 && $hours < 12 && $hours > 0) {
                if ($hours + 12 >= $refHours) {
                    $hours += 12;
                }
            }
        }

        $hours = max(0, min(23, $hours));
        $minutes = max(0, min(59, $minutes));

        return sprintf('%02d:%02d', $hours, $minutes);
    }
}

