<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Notification;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function store(Request $request, $postId)
    {
        $request->validate([
            'reason' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $post = Post::find($postId);
        if (! $post) {
            return response()->json(['message' => 'Post tidak ditemukan'], 404);
        }

        $userId = (string) Auth::id();

        $existingReport = Report::where('reporter_id', $userId)
            ->where('post_id', (string) $postId)
            ->where('status', 'pending')
            ->first();

        if ($existingReport) {
            return response()->json(['message' => 'Kamu sudah melaporkan catatan ini.'], 400);
        }

        $report = Report::create([
            'reporter_id' => $userId,
            'post_id' => (string) $postId,
            'reason' => $request->reason,
            'description' => $request->description,
        ]);

        $reporter = Auth::user();

        // Notif ke pelapor
        Notification::create([
            'user_id' => $userId,
            'title' => 'Laporan Diterima',
            'message' => 'Laporan kamu untuk catatan "'.$post->title.'" sedang direview oleh tim kami.',
            'type' => 'report',
            'link' => '/note/'.$postId,
            'is_read' => false,
        ]);

        // Notif ke terlapor
        if ($post->user_id) {
            $postUserIdStr = is_array($post->user_id) ? current($post->user_id) : $post->user_id;
            Notification::create([
                'user_id' => (string) $postUserIdStr,
                'title' => 'Peringatan: Catatan Dilaporkan',
                'message' => 'Catatan kamu "'.$post->title.'" dilaporkan karena: '.$request->reason.'. Tim pakar/admin akan mereviewnya.',
                'type' => 'report',
                'link' => '/note/'.$postId,
                'is_read' => false,
            ]);
        }

        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => (string) $admin->id,
                'title' => 'Laporan Konten Baru',
                'message' => 'Ada laporan masuk dengan alasan: '.$request->reason.'. Segera periksa di Dasbor Admin.',
                'type' => 'report',
                'is_read' => false,
            ]);
        }

        return response()->json([
            'message' => 'Report berhasil dikirim',
            'data' => $report,
        ], 201);
    }

    public function storeCommentReport(Request $request, $commentId)
    {
        $request->validate([
            'reason' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $comment = Comment::find($commentId);
        if (! $comment) {
            return response()->json(['message' => 'Komentar tidak ditemukan'], 404);
        }

        $userId = (string) Auth::id();

        $report = Report::create([
            'reporter_id' => $userId,
            'comment_id' => (string) $commentId,
            'post_id' => (string) $comment->post_id,
            'reason' => $request->reason,
            'description' => $request->description,
        ]);

        $reporter = Auth::user();

        // Notif pelapor
        Notification::create([
            'user_id' => $userId,
            'title' => 'Laporan Komentar Diterima',
            'message' => 'Terima kasih, laporan kamu untuk sebuah komentar sedang direview oleh admin.',
            'type' => 'report',
            'link' => '/note/'.$comment->post_id,
            'is_read' => false,
        ]);

        // Notif terlapor
        if ($comment->user_id) {
            $commentUserIdStr = is_array($comment->user_id) ? current($comment->user_id) : $comment->user_id;
            Notification::create([
                'user_id' => (string) $commentUserIdStr,
                'title' => 'Peringatan: Komentar Dilaporkan',
                'message' => 'Komentar kamu dilaporkan atas alasan: '.$request->reason.'. Harap selalu jaga etika berdiskusi yang sehat.',
                'type' => 'report',
                'link' => '/note/'.$comment->post_id,
                'is_read' => false,
            ]);
        }

        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => (string) $admin->id,
                'title' => 'Laporan Komentar Baru',
                'message' => 'Ada komentar toxic dilaporkan: '.$request->reason.'. Segera periksa.',
                'type' => 'report',
                'is_read' => false,
            ]);
        }

        return response()->json([
            'message' => 'Laporan komentar berhasil dikirim',
            'data' => $report,
        ], 201);
    }

    public function storeUserReport(Request $request, $userId)
    {
        $request->validate([
            'reason' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $reportedUser = User::find($userId);
        if (! $reportedUser) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $reporterId = (string) Auth::id();

        $existingReport = Report::where('reporter_id', $reporterId)
            ->where('reported_user_id', (string) $userId)
            ->where('status', 'pending')
            ->first();

        if ($existingReport) {
            return response()->json(['message' => 'Kamu sudah melaporkan pengguna ini sebelumnya.'], 400);
        }

        $report = Report::create([
            'reporter_id' => $reporterId,
            'reported_user_id' => (string) $userId,
            'reason' => $request->reason,
            'description' => $request->description,
        ]);

        // Notif pelapor
        Notification::create([
            'user_id' => $reporterId,
            'title' => 'Laporan Pengguna Diterima',
            'message' => 'Laporan kamu untuk pengguna @'.$reportedUser->username.' sedang direview oleh admin.',
            'type' => 'report',
            'link' => '/profile/'.$userId,
            'is_read' => false,
        ]);

        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => (string) $admin->id,
                'title' => 'Laporan Pengguna Baru',
                'message' => 'Ada pengguna dilaporkan dengan alasan: '.$request->reason.'. Segera periksa.',
                'type' => 'report',
                'is_read' => false,
            ]);
        }

        return response()->json([
            'message' => 'Report pengguna berhasil dikirim',
            'data' => $report,
        ], 201);
    }

    public function index()
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $reports = Report::with(['reporter', 'post'])
            ->orderBy('created_at', 'desc')->get();

        return response()->json([
            'message' => 'Berhasil mengambil data report',
            'data' => $reports,
        ], 200);
    }

    public function update(Request $request, $id)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $request->validate([
            'action' => 'required|in:abaikan,takedown,banned',
            'admin_note' => 'nullable|string',
        ]);

        $report = Report::find($id);
        if (! $report) {
            return response()->json(['message' => 'Report tidak ditemukan'], 404);
        }

        $action = $request->action;
        $pesan = '';

        if ($action === 'abaikan') {
            $report->update(['status' => 'rejected', 'admin_note' => $request->admin_note]);
            $pesan = 'Laporan aman, berhasil diabaikan. 🛡️';

            // Notify reporter
            if ($report->reporter_id) {
                Notification::create([
                    'user_id' => (string) $report->reporter_id,
                    'title' => 'Laporan Ditolak',
                    'message' => 'Laporan kamu ditolak oleh admin dengan alasan: '.($request->admin_note ?: 'Tidak ada alasan khusus.'),
                    'type' => 'report',
                    'link' => $report->post_id ? '/note/'.$report->post_id : null,
                    'is_read' => false,
                ]);
            }

        } elseif ($action === 'takedown') {
            if ($report->comment_id) {
                $comment = Comment::find($report->comment_id);
                if ($comment) {
                    $postId = $comment->post_id;
                    $commentIdStr = (string) $comment->_id;
                    $commentUserId = $comment->user_id;

                    Comment::where('parent_comment_id', $commentIdStr)->delete();
                    $comment->delete();

                    if ($postId) {
                        $post = Post::find($postId);
                        if ($post) {
                            $post->update(['comments_count' => Comment::where('post_id', $postId)->count()]);
                        }
                    }

                    // Notif ke pembuat komentar
                    if ($commentUserId) {
                        Notification::create([
                            'user_id' => is_array($commentUserId) ? current($commentUserId) : (string) $commentUserId,
                            'title' => 'Komentar Dihapus (Takedown)',
                            'message' => 'Komentar kamu telah dihapus oleh Admin karena melanggar panduan komunitas kami. Alasan admin: '.($request->admin_note ?: 'Pelanggaran pedoman.'),
                            'type' => 'report',
                            'link' => null,
                            'is_read' => false,
                        ]);
                    }
                }
                $pesan = 'BAM! Komentar ngawur berhasil di-Take Down! 💥';
            } else {
                $post = Post::find($report->post_id);
                if ($post) {
                    $postUserId = $post->user_id;
                    $postTitle = $post->title;
                    $post->delete();

                    // Notif ke pembuat catatan
                    if ($postUserId) {
                        Notification::create([
                            'user_id' => is_array($postUserId) ? current($postUserId) : (string) $postUserId,
                            'title' => 'Catatan Dihapus (Takedown)',
                            'message' => 'Catatan kamu "'.$postTitle.'" telah dihapus oleh Admin karena melanggar panduan komunitas kami. Alasan admin: '.($request->admin_note ?: 'Pelanggaran pedoman.'),
                            'type' => 'report',
                            'link' => null,
                            'is_read' => false,
                        ]);
                    }
                }
                $pesan = 'BAM! Catatan ngawur berhasil di-Take Down! 💥';
            }
            $report->update(['status' => 'resolved', 'admin_note' => $request->admin_note]);

        } elseif ($action === 'banned') {
            if ($report->comment_id) {
                $comment = Comment::find($report->comment_id);
                if ($comment) {
                    User::where('id', $comment->user_id)->update(['role' => 'banned']);
                    $postId = $comment->post_id;
                    $commentIdStr = (string) $comment->_id;
                    $commentUserId = $comment->user_id;

                    Comment::where('parent_comment_id', $commentIdStr)->delete();
                    $comment->delete();

                    if ($postId) {
                        $post = Post::find($postId);
                        if ($post) {
                            $post->update(['comments_count' => Comment::where('post_id', $postId)->count()]);
                        }
                    }

                    if ($commentUserId) {
                        Notification::create([
                            'user_id' => is_array($commentUserId) ? current($commentUserId) : (string) $commentUserId,
                            'title' => 'Akun Diblokir (Banned)',
                            'message' => 'Akun kamu telah diblokir secara permanen oleh Admin akibat pelanggaran berat pada komentarmu. Alasan admin: '.($request->admin_note ?: 'Pelanggaran pedoman berat.'),
                            'type' => 'report',
                            'link' => null,
                            'is_read' => false,
                        ]);
                    }
                }
            } else {
                $post = Post::find($report->post_id);
                if ($post) {
                    $postUserId = $post->user_id;
                    $postTitle = $post->title;
                    User::where('id', $postUserId)->update(['role' => 'banned']);
                    $post->delete();

                    if ($postUserId) {
                        Notification::create([
                            'user_id' => is_array($postUserId) ? current($postUserId) : (string) $postUserId,
                            'title' => 'Akun Diblokir (Banned)',
                            'message' => 'Akun kamu telah diblokir secara permanen oleh Admin akibat pelanggaran berat pada catatan "'.$postTitle.'". Alasan admin: '.($request->admin_note ?: 'Pelanggaran pedoman berat.'),
                            'type' => 'report',
                            'link' => null,
                            'is_read' => false,
                        ]);
                    }
                }
            }
            $report->update(['status' => 'resolved', 'admin_note' => $request->admin_note]);
            $pesan = 'MAMPUS! User toxic berhasil di-Banned permanen! 🔨';
        }

        return response()->json([
            'message' => $pesan,
            'data' => $report,
        ], 200);
    }
}
