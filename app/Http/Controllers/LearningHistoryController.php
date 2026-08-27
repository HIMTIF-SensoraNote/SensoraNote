<?php

namespace App\Http\Controllers;

use App\Models\LearningHistory;
use App\Models\Post;
use App\Models\Schedule;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class LearningHistoryController extends Controller
{
    private const TIMEZONE = 'Asia/Jakarta';

    public function logAktivitas(Request $request)
    {
        $request->validate([
            'post_id' => 'required|string',
            'duration' => 'required|numeric',
        ]);

        $userId = (string) Auth::id();
        $postId = $request->post_id;
        $durationTambah = (int) $request->duration;
        $nowWIB = Carbon::now(self::TIMEZONE);
        $todayDateWIB = $nowWIB->format('Y-m-d');

        // Cari riwayat belajar untuk materi ini yang tercatat hari ini (WIB)
        $userHistories = LearningHistory::where('user_id', $userId)
            ->where('post_id', $postId)
            ->get();

        $riwayat = null;
        foreach ($userHistories as $h) {
            $createdWIB = Carbon::parse($h->created_at)->setTimezone(self::TIMEZONE)->format('Y-m-d');
            if ($createdWIB === $todayDateWIB) {
                $riwayat = $h;
                break;
            }
        }

        if ($riwayat) {
            $riwayat->increment('duration', $durationTambah);
        } else {
            LearningHistory::create([
                'user_id' => $userId,
                'post_id' => $postId,
                'duration' => $durationTambah,
            ]);
        }

        // Hapus cache statistik belajar user ini agar datanya langsung diperbarui
        Cache::forget("learning_stats_user_{$userId}");
        Cache::forget("learning_stats_user_{$userId}_{$todayDateWIB}");

        return response()->json(['message' => 'Berhasil mencatat aktivitas belajar!'], 200);
    }

    public function getStatistics(Request $request)
    {
        $userId = (string) Auth::id();
        $nowWIB = Carbon::now(self::TIMEZONE);
        $todayDateStr = $nowWIB->format('Y-m-d');
        $cacheKey = "learning_stats_user_{$userId}_{$todayDateStr}";

        // Real-time cached computation (Short TTL for responsive stats)
        $statsData = Cache::remember($cacheKey, now()->addMinutes(2), function () use ($userId, $nowWIB, $todayDateStr) {
            $allHistories = LearningHistory::where('user_id', $userId)->get();

            // 1. Duration from Note Reads (WIB Aware)
            $durasiHariIni = 0;
            foreach ($allHistories as $log) {
                $logDateWIB = Carbon::parse($log->created_at)->setTimezone(self::TIMEZONE)->format('Y-m-d');
                if ($logDateWIB === $todayDateStr) {
                    $durasiHariIni += (int) $log->duration;
                }
            }

            $riwayatTerakhir = LearningHistory::with('post.user')
                ->where('user_id', $userId)
                ->orderBy('updated_at', 'desc')
                ->take(5)
                ->get();

            $totalMateriSelesai = $allHistories->pluck('post_id')->unique()->count();
            $catatanDibuat = Post::where('user_id', $userId)->where('visibility', 'public')->count();

            $awalMinggu = Carbon::now(self::TIMEZONE)->startOfWeek();
            $akhirMinggu = Carbon::now(self::TIMEZONE)->endOfWeek();

            $awalBulan = Carbon::now(self::TIMEZONE)->startOfMonth();
            $akhirBulan = Carbon::now(self::TIMEZONE)->endOfMonth();

            $grafikMentah = ['Mon' => 0, 'Tue' => 0, 'Wed' => 0, 'Thu' => 0, 'Fri' => 0, 'Sat' => 0, 'Sun' => 0];
            $grafikBulananMentah = ['W1' => 0, 'W2' => 0, 'W3' => 0, 'W4' => 0, 'W5' => 0];

            foreach ($allHistories as $log) {
                $cDate = Carbon::parse($log->created_at)->setTimezone(self::TIMEZONE);
                if ($cDate->between($awalMinggu, $akhirMinggu)) {
                    $hari = $cDate->format('D');
                    if (isset($grafikMentah[$hari])) {
                        $grafikMentah[$hari] += (int) $log->duration;
                    }
                }
                if ($cDate->between($awalBulan, $akhirBulan)) {
                    $weekOfMonth = min(5, (int) ceil($cDate->day / 7));
                    $grafikBulananMentah['W' . $weekOfMonth] += (int) $log->duration;
                }
            }

            // 2. Integration with Smart Schedule Activities
            $schedules = Schedule::where('user_id', $userId)->get();
            $completedScheduleDates = [];
            $scheduleMateriCount = 0;

            foreach ($schedules as $sc) {
                $scDate = $sc->date;
                $items = $sc->items ?: [];

                foreach ($items as $it) {
                    if (!empty($it['is_completed'])) {
                        $completedScheduleDates[] = $scDate;
                        $scheduleMateriCount++;

                        // Calculate duration in minutes from time_start to time_end
                        $durationMins = 45;
                        if (!empty($it['time_start']) && !empty($it['time_end'])) {
                            try {
                                $sParts = explode(':', $it['time_start']);
                                $eParts = explode(':', $it['time_end']);
                                if (count($sParts) >= 2 && count($eParts) >= 2) {
                                    $diff = ((int) $eParts[0] * 60 + (int) $eParts[1]) - ((int) $sParts[0] * 60 + (int) $sParts[1]);
                                    if ($diff > 0 && $diff <= 720) {
                                        $durationMins = $diff;
                                    }
                                }
                            } catch (\Exception $e) {}
                        }

                        // Add to today's duration if schedule is today (WIB)
                        if ($scDate === $todayDateStr) {
                            $durasiHariIni += $durationMins;
                        }

                        // Add to weekly & monthly charts
                        try {
                            $cDate = Carbon::parse($scDate)->setTimezone(self::TIMEZONE);
                            if ($cDate->between($awalMinggu, $akhirMinggu)) {
                                $dayKey = $cDate->format('D');
                                if (isset($grafikMentah[$dayKey])) {
                                    $grafikMentah[$dayKey] += $durationMins;
                                }
                            }
                            if ($cDate->between($awalBulan, $akhirBulan)) {
                                $wIdx = min(5, (int) ceil($cDate->day / 7));
                                $grafikBulananMentah['W' . $wIdx] += $durationMins;
                            }
                        } catch (\Exception $e) {}
                    }
                }
            }

            $totalMateriSelesai += $scheduleMateriCount;

            $grafikMingguan = [
                'Sen' => $grafikMentah['Mon'],
                'Sel' => $grafikMentah['Tue'],
                'Rab' => $grafikMentah['Wed'],
                'Kam' => $grafikMentah['Thu'],
                'Jum' => $grafikMentah['Fri'],
                'Sab' => $grafikMentah['Sat'],
                'Min' => $grafikMentah['Sun'],
            ];

            if ($grafikBulananMentah['W5'] == 0) {
                unset($grafikBulananMentah['W5']);
            }

            // 3. Extract all unique active dates (From Note Reads + Schedule Completions)
            $noteDates = [];
            foreach ($allHistories as $item) {
                $noteDates[] = Carbon::parse($item->created_at)->setTimezone(self::TIMEZONE)->format('Y-m-d');
            }

            $semuaTanggalBelajar = array_values(array_unique(array_merge($noteDates, $completedScheduleDates)));
            rsort($semuaTanggalBelajar);

            // 4. Calculate Streak
            $streak = 0;
            $cekTanggal = Carbon::today(self::TIMEZONE);

            foreach ($semuaTanggalBelajar as $tanggal) {
                if ($tanggal === $cekTanggal->format('Y-m-d')) {
                    $streak++;
                    $cekTanggal->subDay();
                } elseif ($tanggal === Carbon::yesterday(self::TIMEZONE)->format('Y-m-d') && $streak == 0) {
                    $streak++;
                    $cekTanggal = Carbon::yesterday(self::TIMEZONE)->subDay();
                } else {
                    break;
                }
            }

            $user = User::find($userId);

            return [
                'daily_target' => $user->target_belajar ?? 0,
                'summary' => [
                    'today_duration' => $durasiHariIni,
                    'current_streak' => $streak,
                ],
                'achievements' => [
                    'notes_created' => $catatanDibuat,
                    'materials_completed' => $totalMateriSelesai,
                ],
                'weekly_chart' => $grafikMingguan,
                'monthly_chart' => $grafikBulananMentah,
                'recent_history' => $riwayatTerakhir,
                'active_dates' => $semuaTanggalBelajar,
            ];
        });

        return response()->json([
            'message' => 'Berhasil mengambil statistik belajar',
            'data' => $statsData,
        ], 200);
    }
}
