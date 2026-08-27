<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendScheduleReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'schedule:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Periksa jadwal belajar hari ini dan kirimkan pengingat notifikasi ke HP/laptop pengguna';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now('Asia/Jakarta');
        $todayDate = $now->format('Y-m-d');
        $currentTime = $now->format('H:i');
        $currentTimestamp = $now->timestamp;

        $this->info("Menjalankan pemeriksaan jadwal belajar pada {$todayDate} {$currentTime} WIB...");

        $schedules = Schedule::where('date', $todayDate)->get();
        $sentCount = 0;

        foreach ($schedules as $schedule) {
            $user = User::find($schedule->user_id);
            if (!$user) continue;

            $items = is_array($schedule->items) ? $schedule->items : [];

            foreach ($items as $item) {
                if (!empty($item['is_completed'])) {
                    continue;
                }

                $timeStart = $item['time_start'] ?? null;
                if (!$timeStart) continue;

                // Hitung selisih menit antara sekarang dengan jam mulai
                try {
                    $itemTime = Carbon::createFromFormat('Y-m-d H:i', "{$todayDate} {$timeStart}", 'Asia/Jakarta');
                    $diffMinutes = ($itemTime->timestamp - $currentTimestamp) / 60;
                } catch (\Exception $e) {
                    continue;
                }

                // Kirim notifikasi jika jadwal dimulai antara 0 sampai 15 menit ke depan, atau baru saja dimulai (max 5 menit lalu)
                if ($diffMinutes >= -5 && $diffMinutes <= 15) {
                    $todayStart = Carbon::now('Asia/Jakarta')->startOfDay();

                    // Cek apakah sudah pernah dikirimkan notifikasi untuk item ini hari ini
                    $alreadyNotified = Notification::where('user_id', (string) $schedule->user_id)
                        ->where('type', 'schedule')
                        ->where('link', '/schedule')
                        ->where('message', 'like', "%{$item['title']}%")
                        ->where('created_at', '>=', $todayStart)
                        ->exists();

                    if (!$alreadyNotified) {
                        $timeRange = ($item['time_start'] ?? '') . ' - ' . ($item['time_end'] ?? '');
                        Notification::create([
                            'user_id' => (string) $schedule->user_id,
                            'title' => '⏰ Pengingat Jadwal: ' . ($item['title'] ?? 'Belajar'),
                            'message' => 'Waktunya belajar ' . ($item['title'] ?? '') . ' (' . $timeRange . '). Tetap semangat dan fokus belajar!',
                            'type' => 'schedule',
                            'link' => '/schedule',
                            'is_read' => false,
                        ]);
                        $sentCount++;
                        $this->line("Notifikasi dikirim ke user {$user->name} ({$user->email}) untuk jadwal '{$item['title']}' ({$timeStart})");
                    }
                }
            }
        }

        $this->info("Selesai. Total {$sentCount} pengingat jadwal berhasil dikirimkan.");
        return 0;
    }
}

