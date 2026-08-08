<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Like;
use App\Models\Notification;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    public function toggle($postId)
    {
        $post = Post::find($postId);
        if (! $post) {
            return response()->json(['message' => 'Post tidak ditemukan'], 404);
        }

        $userId = (string) Auth::id();
        $postIdStr = (string) $postId;

        // 🔥 JURUS PAMUNGKAS: Langsung coba hapus.
        // Ini bakal nge-unlike, dan mencegah adanya data DUPLIKAT.
        $deleted = Like::where('post_id', $postIdStr)
            ->where('user_id', $userId)
            ->delete();

        if ($deleted) {
            // Kalau ada yang terhapus, berarti action-nya adalah UNLIKE
            $isLikedNow = false;
            $msg = 'Berhasil unlike post';
            $statusCode = 200;
        } else {
            // Kalau nggak ada yang terhapus, berarti user emang belum like.
            // Bikin data Like BARU.
            Like::create([
                'post_id' => $postIdStr,
                'user_id' => $userId,
            ]);
            $isLikedNow = true;
            $msg = 'Berhasil like post';
            $statusCode = 201;

            // Logika Notifikasi Lu (Aman!)
            if ($post->user_id) {
                $postUserIdStr = is_array($post->user_id) ? (string) current($post->user_id) : (string) $post->user_id;
                if ($postUserIdStr !== $userId) {
                    Notification::create([
                        'user_id' => $postUserIdStr,
                        'actor_id' => $userId,
                        'title' => 'Seseorang Menyukai Catatanmu',
                        'message' => Auth::user()->name.' menyukai catatanmu "'.$post->title.'".',
                        'type' => 'like',
                        'link' => '/note/'.$postIdStr,
                        'is_read' => false,
                    ]);
                }
            }
        }

        // 🔥 JURUS PAMUNGKAS: Ngitung LANGSUNG dari tabel likes!
        // Ini buat mastiin angka di Post Model selalu sinkron sama tabel Like.
        $actualLikesCount = Like::where('post_id', $postIdStr)->count();
        $post->update(['likes_count' => $actualLikesCount]);

        // 🔥 Suapin FE data mateng.
        // FE lu HARUS pake data `is_liked` ini buat nentuin warna hati!
        return response()->json([
            'message' => $msg,
            'likes_count' => $actualLikesCount,
            'is_liked' => $isLikedNow,
        ], $statusCode);
    }

    public function toggleCommentLike($commentId)
    {
        $comment = Comment::find($commentId);
        if (! $comment) {
            return response()->json(['message' => 'Komentar tidak ditemukan'], 404);
        }

        $userId = (string) Auth::id();
        $commentIdStr = (string) $commentId;

        // 🔥 JURUS PAMUNGKAS: Langsung coba hapus.
        $deleted = Like::where('comment_id', $commentIdStr)->where('user_id', $userId)->delete();

        if ($deleted) {
            // UNLIKE KOMENTAR
            $isLikedNow = false;
            $msg = 'Berhasil unlike komentar';
            $statusCode = 200;
        } else {
            // LIKE KOMENTAR
            Like::create([
                'comment_id' => $commentIdStr,
                'user_id' => $userId,
            ]);
            $isLikedNow = true;
            $msg = 'Berhasil like komentar! 👍';
            $statusCode = 201;

            // Logika Notifikasi Lu (Aman!)
            if ($comment->user_id) {
                $commentUserIdStr = is_array($comment->user_id) ? (string) current($comment->user_id) : (string) $comment->user_id;
                if ($commentUserIdStr !== $userId) {
                    Notification::create([
                        'user_id' => $commentUserIdStr,
                        'actor_id' => $userId,
                        'title' => 'Seseorang Menyukai Komentarmu',
                        'message' => Auth::user()->name.' menyukai komentarmu.',
                        'type' => 'like',
                        'link' => '/note/'.$comment->post_id.'#comment-'.$commentIdStr,
                        'is_read' => false,
                    ]);
                }
            }
        }

        // 🔥 JURUS PAMUNGKAS: Ngitung LANGSUNG dari tabel likes!
        $actualLikesCount = Like::where('comment_id', $commentIdStr)->count();
        $comment->update(['likes_count' => $actualLikesCount]);

        return response()->json([
            'message' => $msg,
            'likes_count' => $actualLikesCount,
            'is_liked' => $isLikedNow,
        ], $statusCode);
    }
}
