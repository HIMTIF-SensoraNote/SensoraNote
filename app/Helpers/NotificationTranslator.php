<?php

namespace App\Helpers;

use Illuminate\Support\Facades\File;

class NotificationTranslator
{
    /**
     * Sanitize LaTeX math expressions for plain-text contexts (e.g. push notifications).
     *
     * Replaces:
     *   $$...$$ (display math)   → [Rumus: ...]
     *   \[...\] (display math)   → [Rumus: ...]
     *   $...$   (inline math)    → [Rumus: ...]
     *   \(...\) (inline math)    → [Rumus: ...]
     *
     * The raw LaTeX content is preserved inside the brackets so the reader
     * still has a hint of what the formula contains, without needing a renderer.
     */
    public static function sanitizeLatex(string $text): string
    {
        // Display math:  $$...$$
        $text = preg_replace_callback(
            '/\$\$(.+?)\$\$/su',
            fn($m) => '[Rumus: ' . trim($m[1]) . ']',
            $text
        );

        // Display math:  \[...\]
        $text = preg_replace_callback(
            '/\\\\\[(.+?)\\\\\]/su',
            fn($m) => '[Rumus: ' . trim($m[1]) . ']',
            $text
        );

        // Inline math:  \(...\)
        $text = preg_replace_callback(
            '/\\\\\((.+?)\\\\\)/su',
            fn($m) => '[Rumus: ' . trim($m[1]) . ']',
            $text
        );

        // Inline math:  $...$  (must come last to avoid double-processing $$)
        $text = preg_replace_callback(
            '/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/su',
            fn($m) => '[Rumus: ' . trim($m[1]) . ']',
            $text
        );

        return $text;
    }

    public static function translate($title, $message, $locale = 'id')
    {
        // 1. Ambil file JSON dari Frontend Web
        // Asumsi struktur ada di resources/frontend/app/locales
        $jsonPath = resource_path("frontend/app/locales/{$locale}.json");

        // Fallback ke id jika tidak ada
        if (! File::exists($jsonPath)) {
            $locale = 'id';
            $jsonPath = resource_path('frontend/app/locales/id.json');
        }

        $dictionary = [];
        if (File::exists($jsonPath)) {
            $dictionary = json_decode(File::get($jsonPath), true)['notif'] ?? [];
        }

        // 2. Sanitize any LaTeX math before translation pattern-matching.
        //    Formulas are converted to [Rumus: <content>] so plain-text contexts
        //    (push notifications, SMS) display a readable fallback.
        $title   = self::sanitizeLatex((string) $title);
        $message = self::sanitizeLatex((string) $message);

        // Helper untuk me-replace template {{var}}
        $t = function ($key, $replacements = []) use ($dictionary) {
            $str = $dictionary[$key] ?? $key;
            foreach ($replacements as $k => $v) {
                $str = str_replace('{{'.$k.'}}', $v, $str);
                $str = str_replace('{{ '.$k.' }}', $v, $str); // space fallback
            }

            return $str;
        };

        $origTitle = $title;

        // --- LIKES ---
        if ($origTitle === 'Ada yang menyukai Catatan Anda!') {
            $title = $t('like_note_title');
        }
        if ($origTitle === 'Seseorang Menyukai Catatanmu') {
            $title = $t('like_note_title_alt');
        }
        if ($origTitle === 'Ada yang menyukai Komentar Anda!') {
            $title = $t('like_comment_title');
        }

        if (preg_match('/^(.*?) menyukai catatanmu "(.*)"\.$/', $message, $m)) {
            $message = $t('like_note_msg', ['name' => $m[1], 'note' => $m[2]]);
        }
        if (preg_match('/^(.*?) menyukai komentarmu\.$/', $message, $m)) {
            $message = $t('like_comment_msg', ['name' => $m[1]]);
        }

        // --- COMMENTS & RESPONDS ---
        if ($origTitle === 'Seseorang membalas komentarmu') {
            $title = $t('reply_title');
        }
        if ($origTitle === 'Komentar Baru di Catatanmu') {
            $title = $t('comment_title');
        }
        if ($origTitle === 'Respons Baru di Catatanmu') {
            $title = $t('respond_title');
        }

        if (preg_match('/^(.*?) membalas: "(.*)"$/', $message, $m)) {
            $message = $t('reply_msg', ['name' => $m[1], 'content' => $m[2]]);
        }
        if (preg_match('/^(.*?) berkomentar: "(.*)"$/', $message, $m)) {
            $message = $t('comment_msg', ['name' => $m[1], 'content' => $m[2]]);
        }
        if (preg_match('/^(.*?) merespons catatan anda$/', $message, $m)) {
            $message = $t('respond_msg', ['name' => $m[1]]);
        }

        // --- POST REVIEW ---
        if ($origTitle === 'Catatan Perlu Perbaikan') {
            $title = $t('post_needs_work_title');
        }
        if (str_contains($origTitle, 'Catatan Disetujui Pakar')) {
            $title = $t('post_approved_title');
        }

        if (preg_match('/^Catatanmu "(.*?)" memerlukan perbaikan berdasarkan tinjauan pakar\.$/', $message, $m)) {
            $message = $t('post_needs_work_msg', ['title' => $m[1]]);
        }
        if (preg_match('/^Selamat! Catatan "(.*?)" telah diverifikasi\. Rating: (.*?) Bintang\. Pesan: "(.*?)"$/', $message, $m)) {
            $message = $t('post_approved_msg', ['title' => $m[1], 'rating' => $m[2], 'feedback' => $m[3]]);
        }

        // --- FOLLOWS ---
        if ($origTitle === 'Pengikut Baru') {
            $title = $t('follow_new_title');
        }
        if ($origTitle === 'Permintaan Mengikuti') {
            $title = $t('follow_req_title');
        }
        if ($origTitle === 'Permintaan Diterima') {
            $title = $t('follow_acc_title');
        }

        if (preg_match('/^(.*?) mulai mengikuti anda\.$/', $message, $m)) {
            $message = $t('follow_new_msg', ['username' => $m[1]]);
        }
        if (preg_match('/^(.*?) ingin mengikuti anda\.$/', $message, $m)) {
            $message = $t('follow_req_msg', ['username' => $m[1]]);
        }
        if (preg_match('/^(.*?) menerima permintaan mengikuti anda\.$/', $message, $m)) {
            $message = $t('follow_acc_msg', ['username' => $m[1]]);
        }

        // --- SYSTEM / VERIFIKASI ---
        if ($origTitle === 'Sertifikasi Diterima!') {
            $title = $t('cert_acc_title');
        }
        if ($origTitle === 'Sertifikasi Ditolak') {
            $title = $t('cert_rej_title');
        }
        if ($origTitle === 'Pengajuan Pakar Baru') {
            $title = $t('cert_new_title');
        }

        if (preg_match('/^(.*?) mengajukan diri sebagai pakar di bidang (.*?)\.$/', $message, $m)) {
            $message = $t('cert_new_msg', ['name' => $m[1], 'field' => $m[2]]);
        }
        if (preg_match('/^Selamat! Pengajuan sertifikasi pakarmu untuk bidang (.*?) telah disetujui Admin\.$/', $message, $m)) {
            $message = $t('cert_acc_msg_2', ['field' => $m[1]]);
        }
        if (preg_match('/^Mohon maaf, pengajuan sertifikasi pakarmu untuk bidang (.*?) belum dapat disetujui saat ini\.$/', $message, $m)) {
            $message = $t('cert_rej_msg_2', ['field' => $m[1]]);
        }

        // --- REPORTS ---
        if (str_contains($origTitle, 'Laporan Diterima') || str_contains($origTitle, 'Laporan Komentar Diterima') || str_contains($origTitle, 'Laporan Pengguna Diterima')) {
            $title = $t('report_recv_title');
        }
        if (str_contains($origTitle, 'Peringatan: Catatan Dilaporkan')) {
            $title = $t('report_warn_note_title');
        }
        if (str_contains($origTitle, 'Peringatan: Komentar Dilaporkan')) {
            $title = $t('report_warn_comment_title');
        }
        if (str_contains($origTitle, 'Catatan Dihapus')) {
            $title = $t('report_del_note_title');
        }
        if (str_contains($origTitle, 'Komentar Dihapus')) {
            $title = $t('report_del_comment_title');
        }
        if (str_contains($origTitle, 'Akun Diblokir')) {
            $title = $t('report_banned_title');
        }
        if (str_contains($origTitle, 'Laporan Ditolak')) {
            $title = $t('report_rejected_title');
        }

        if (preg_match('/^Catatan kamu "(.*?)" telah dihapus oleh Admin karena melanggar panduan komunitas kami\. Alasan admin: (.*)$/', $message, $m)) {
            $message = $t('report_del_note_msg', ['title' => $m[1], 'reason' => $m[2]]);
        }
        if (preg_match('/^Komentar kamu telah dihapus oleh Admin karena melanggar panduan komunitas kami\. Alasan admin: (.*)$/', $message, $m)) {
            $message = $t('report_del_comment_msg', ['reason' => $m[1]]);
        }
        if (preg_match('/^Catatan kamu "(.*?)" dilaporkan karena: (.*?)\. Tim pakar\/admin akan mereviewnya\.$/', $message, $m)) {
            $message = $t('report_warn_note_msg', ['title' => $m[1], 'reason' => $m[2]]);
        }
        if (preg_match('/^Laporan kamu untuk catatan "(.*?)" sedang direview oleh tim kami\.$/', $message, $m)) {
            $message = $t('report_recv_note_msg', ['title' => $m[1]]);
        }
        if (preg_match('/^Laporan kamu untuk pengguna @(.*?) sedang direview oleh admin\.$/', $message, $m)) {
            $message = $t('report_recv_user_msg', ['username' => $m[1]]);
        }
        if (preg_match('/^Laporan kamu ditolak oleh admin dengan alasan: (.*)$/', $message, $m)) {
            $message = $t('report_rej_msg', ['reason' => $m[1]]);
        }

        return ['title' => $title, 'message' => $message];
    }
}
