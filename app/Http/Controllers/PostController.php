<?php

namespace App\Http\Controllers;

use App\Models\Follow;
use App\Models\LearningHistory;
use App\Models\Like;
use App\Models\Notification;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Mews\Purifier\Facades\Purifier;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $query = Post::with(['user', 'topic', 'category', 'comments', 'likes'])
            ->where('visibility', 'public');

        $userId = null;
        try {
            $userId = Auth::guard('sanctum')->id();
        } catch (\Exception $e) {
        }
        if (! $userId) {
            try {
                $userId = Auth::guard('api')->id();
            } catch (\Exception $e) {
            }
        }
        if (! $userId) {
            $userId = Auth::id();
        }

        $followingIds = [];
        if ($userId) {
            $followingIds = Follow::where('follower_id', (string) $userId)->pluck('following_id')->toArray();
        }

        // Exclude dormant users
        $dormantUserIds = User::where('is_dormant', true)->pluck('_id')->toArray();

        // Exclude dormant users
        $dormantUserIds = User::where('is_dormant', true)->pluck('_id')->toArray();

        if (! empty($dormantUserIds)) {
            $query->whereNotIn('user_id', $dormantUserIds);
        }

        if ($request->filled('is_verified')) {
            $isVerified = filter_var($request->query('is_verified'), FILTER_VALIDATE_BOOLEAN);
            $query->where('is_verified', $isVerified);
        }

        if ($request->filled('submitted_for_review')) {
            $submitted = filter_var($request->query('submitted_for_review'), FILTER_VALIDATE_BOOLEAN);
            $query->where('submitted_for_review', $submitted);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->query('user_id'));
        }

        // Filter by specific post IDs (used for bookmarks)
        if ($request->filled('ids')) {
            $ids = explode(',', $request->query('ids'));
            $query = Post::with(['user', 'topic', 'category', 'comments', 'likes'])
                ->whereIn('_id', $ids);
        }

        $isSearch = $request->filled('search');
        if ($isSearch) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%'.$search.'%')->orWhere('plain_content', 'like', '%'.$search.'%')->orWhere('mapel', 'like', '%'.$search.'%');
            });
        }

        $isRandom = false;
        $sort = $request->query('sort', 'untuk_anda');

        $limit = $request->query('limit', 12);

        if ($sort === 'populer') {
            $query->orderBy('likes_count', 'desc')->orderBy('comments_count', 'desc');

        } elseif ($sort === 'terbaru') {
            $query->orderBy('created_at', 'desc');

        } else {
            if ($userId && ! $isSearch) {
                $user = User::find((string) $userId);
                if ($user && $user->role !== 'admin') {
                    $likedPostIds = Like::where('user_id', (string) $user->id)
                        ->whereNotNull('post_id')
                        ->pluck('post_id');

                    $preferredMapels = [];
                    if ($likedPostIds->count() > 0) {
                        $preferredMapels = Post::whereIn('_id', $likedPostIds)->pluck('mapel')->filter()->unique()->toArray();
                    }

                    if (! empty($preferredMapels)) {
                        $query->whereIn('mapel', $preferredMapels);
                    } elseif (! empty($user->jenjang_pendidikan)) {
                        $query->where('jenjang', $user->jenjang_pendidikan);
                    }
                }
            }

            $query->orderBy('created_at', 'desc');
            $isRandom = ! $isSearch;
        }

        $paginator = $query->paginate($limit);
        $posts = collect($paginator->items());

        if ($isRandom) {
            $posts = $posts->shuffle()->values();
        }

        $posts->each(function ($post) {
            $realLikes = $post->likes ? $post->likes->count() : 0;
            $realComments = $post->comments ? $post->comments->count() : 0;

            $post->setAttribute('likes_count', $realLikes);
            $post->setAttribute('comments_count', $realComments);

            if ($post->isDirty(['likes_count', 'comments_count'])) {
                $post->save();
            }

            $post->is_liked = $post->likes ? $post->likes->where('user_id', Auth::id())->isNotEmpty() : false;

            // Listing tidak butuh body artikel penuh (bisa berisi gambar base64 belasan MB).
            // Kartu feed hanya pakai description/plain_content/thumbnail. Body lengkap
            // tetap tersedia lewat endpoint detail GET /v1/posts/{id} (method show()).
            $post->makeHidden(['content']);
        });

        return response()->json([
            'message' => 'Berhasil mengambil daftar post',
            'data' => $posts,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ], 200);
    }

    public function store(Request $request)
    {
        $isDraft = $request->visibility === 'draft';
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => $isDraft ? 'nullable|string' : 'required|string',
            'description' => 'nullable|string',
            'mapel' => 'nullable|string',
            'jenjang' => 'nullable|string',
            'kelas' => 'nullable|string',
            'semester' => 'nullable|string',
            'tags' => 'nullable|array',
            'thumbnail' => 'nullable|string',
            'thumbnail_fit' => 'nullable|in:cover,contain',
            'topic_id' => 'nullable|string',
            'category_id' => 'nullable|string',
            'visibility' => 'in:public,private,draft',
            'submitted_for_review' => 'nullable|boolean',
        ]);

        $rawContent = $request->input('content');
        $cleanContent = $rawContent ? Purifier::clean($rawContent, 'quill') : '';

        $post = Post::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'content' => $cleanContent,
            // FIX ERROR 500: Cek dulu content-nya ada isinya nggak sebelum di-strip_tags
            'plain_content' => $cleanContent ? html_entity_decode(str_replace('&nbsp;', ' ', strip_tags($cleanContent))) : '',
            'description' => $request->description,
            'mapel' => $request->mapel,
            'jenjang' => $request->jenjang,
            'kelas' => $request->kelas,
            'semester' => $request->semester,
            'tags' => $request->tags ?? [],
            'thumbnail' => $request->thumbnail,
            'thumbnail_fit' => $request->thumbnail_fit ?? 'cover',
            'topic_id' => $request->topic_id,
            'category_id' => $request->category_id,
            'visibility' => $request->visibility ?? 'public',
        ]);

        if ($post->visibility !== 'draft') {
            LearningHistory::create([
                'user_id' => Auth::id(),
                'post_id' => $post->id,
                'duration' => 0,
            ]);
        }

        return response()->json([
            'message' => $post->visibility === 'draft' ? 'Draf berhasil disimpan' : 'Catatan berhasil masuk ke awan',
            'data' => $post,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $post = Post::find($id);

        if (! $post) {
            return response()->json(['message' => 'Post tidak ditemukan'], 404);
        }

        if ($post->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $isDraft = $request->visibility === 'draft';
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => $isDraft ? 'nullable|string' : 'required|string',
            'description' => 'nullable|string',
            'mapel' => 'nullable|string',
            'jenjang' => 'nullable|string',
            'kelas' => 'nullable|string',
            'semester' => 'nullable|string',
            'tags' => 'nullable|array',
            'thumbnail' => 'nullable|string',
            'thumbnail_fit' => 'nullable|in:cover,contain',
            'topic_id' => 'nullable|string',
            'category_id' => 'nullable|string',
            'visibility' => 'in:public,private,draft',
        ]);

        if ($post->visibility === 'draft' && $request->visibility !== 'draft') {
            $post->created_at = now();
            $post->save();
        }

        $rawContent = $request->input('content');
        $cleanContent = $rawContent ? Purifier::clean($rawContent, 'quill') : '';

        $post->update([
            'title' => $request->title,
            'content' => $cleanContent,
            'plain_content' => $cleanContent ? html_entity_decode(str_replace('&nbsp;', ' ', strip_tags($cleanContent))) : '',
            'description' => $request->description,
            'mapel' => $request->mapel,
            'jenjang' => $request->jenjang,
            'kelas' => $request->kelas,
            'semester' => $request->semester,
            'tags' => $request->tags ?? [],
            'thumbnail' => $request->thumbnail,
            'thumbnail_fit' => $request->thumbnail_fit ?? 'cover',
            'topic_id' => $request->topic_id,
            'category_id' => $request->category_id,
            'visibility' => $request->visibility ?? 'public',
        ]);

        // If transitioning to public, send notifications
        if ($post->visibility === 'public' && ! $post->is_verified) {
            $pakars = User::where('role', 'pakar')->get();
            foreach ($pakars as $pakar) {
                // Check if notif already exists for this post to avoid spam
                $exists = Notification::where('user_id', $pakar->id)
                    ->where('type', 'verifikasi')
                    ->where('message', 'like', '%"'.$post->title.'"%')
                    ->exists();

                if (! $exists) {
                    Notification::create([
                        'user_id' => $post->user_id,
                        'actor_id' => Auth::id(),
                        'title' => 'Catatan Perlu Perbaikan',
                        'message' => 'Catatanmu "'.$post->title.'" memerlukan perbaikan berdasarkan tinjauan pakar.',
                        'type' => 'report',
                        'link' => '/upload?edit='.$id,
                        'is_read' => false,
                    ]);
                }
            }
        }

        return response()->json([
            'message' => $post->visibility === 'draft' ? 'Draf berhasil diperbarui' : 'Catatan berhasil diperbarui',
            'data' => $post,
        ], 200);
    }

    public function drafts(Request $request)
    {
        $userId = Auth::id();
        if (! $userId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $drafts = Post::with(['topic', 'category'])
            ->where('user_id', $userId)
            ->where('visibility', 'draft')
            ->orderBy('created_at', 'desc')
            ->get();

        // Sama seperti index(): listing draf tidak perlu body penuh (base64 berat).
        $drafts->each(fn (Post $draft) => $draft->makeHidden(['content']));

        return response()->json([
            'message' => 'Berhasil mengambil daftar draf',
            'data' => $drafts,
        ], 200);
    }

    public function show($id)
    {
        $post = Post::with(['user', 'topic', 'category', 'comments.user', 'likes'])->find($id);

        if (! $post) {
            return response()->json(['message' => 'Post tidak ditemukan'], 404);
        }

        // Hide post if author is dormant
        if ($post->user && $post->user->is_dormant) {
            return response()->json(['message' => 'Post tidak ditemukan'], 404);
        }

        $realLikes = $post->likes ? $post->likes->count() : 0;
        $realComments = $post->comments ? $post->comments->count() : 0;

        $post->setAttribute('likes_count', $realLikes);
        $post->setAttribute('comments_count', $realComments);
        if ($post->isDirty(['likes_count', 'comments_count'])) {
            $post->save();
        }

        $userId = null;
        try {
            $userId = Auth::guard('sanctum')->id();
        } catch (\Exception $e) {
        }
        if (! $userId) {
            try {
                $userId = Auth::guard('api')->id();
            } catch (\Exception $e) {
            }
        }
        if (! $userId) {
            $userId = Auth::id();
        }

        $userIdStr = (string) $userId;

        if ($userIdStr !== '') {
            $post->is_liked = Like::where('post_id', (string) $id)->where('user_id', $userIdStr)->exists();
        } else {
            $post->is_liked = false;
        }

        if ($post->comments) {
            // Filter out comments from dormant users
            $post->setRelation('comments', $post->comments->filter(function ($comment) {
                return ! $comment->user || ! $comment->user->is_dormant;
            })->values());

            $post->comments->each(function ($comment) use ($userIdStr) {
                $commentIdStr = (string) $comment->id;
                $comment->likes_count = Like::where('comment_id', $commentIdStr)->count();

                if ($userIdStr !== '') {
                    $comment->is_liked = Like::where('comment_id', $commentIdStr)->where('user_id', $userIdStr)->exists();
                } else {
                    $comment->is_liked = false;
                }
            });
        }

        if ($post->user) {
            $post->user->setAttribute('followers_count', $post->user->followers()->count());
            $post->user->setAttribute('totalCatatan', Post::where('user_id', (string) $post->user->id)->where('visibility', 'public')->count());

            if ($userIdStr !== '') {
                $loggedInUser = User::find($userIdStr);
                $isFollowed = $loggedInUser ? $loggedInUser->isFollowing($post->user->id) : false;

                $isPending = Follow::where('follower_id', $userIdStr)
                    ->where('following_id', (string) $post->user->id)
                    ->where('status', Follow::STATUS_PENDING)
                    ->exists();

                $post->user->setAttribute('is_followed_by_me', $isFollowed);
                $post->user->setAttribute('is_follow_pending', $isPending);
            } else {
                $post->user->setAttribute('is_followed_by_me', false);
                $post->user->setAttribute('is_follow_pending', false);
            }
        }

        // Content truncation for private accounts
        $isAuthorPrivate = $post->user && $post->user->is_private;
        $isOwner = $userIdStr !== '' && (string) $post->user_id === $userIdStr;

        $loggedInUser = $userIdStr !== '' ? User::find($userIdStr) : null;
        $isFollowed = ($loggedInUser && $post->user) ? $loggedInUser->isFollowing($post->user->id) : false;

        if ($isAuthorPrivate && ! $isOwner && ! $isFollowed && (Auth::user()?->role !== 'admin')) {
            $post->is_restricted = true;
            // Removed backend truncation as requested by user to show real blurred text
        }

        return response()->json([
            'message' => 'Berhasil mengambil post',
            'data' => $post,
        ], 200);
    }

    public function verify(Request $request, $id)
    {
        $post = Post::find($id);

        if (! $post) {
            return response()->json(['message' => 'Post tidak ditemukan'], 404);
        }

        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'pakar') {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $rating = $request->input('rating', 5);
        $feedback = $request->input('reason', 'Sangat direkomendasikan!');

        $post->update([
            'is_verified' => true,
            'verify_reason' => $feedback,
            'expert_rating' => $rating,
            'verified_by' => Auth::id(),
        ]);

        Notification::create([
            'user_id' => $post->user_id,
            'actor_id' => Auth::id(),
            'title' => 'Catatan Disetujui Pakar! 🎉',
            'message' => 'Selamat! Catatan "'.$post->title.'" telah diverifikasi. Rating: '.$rating.' Bintang. Pesan: "'.$feedback.'"',
            'type' => 'verifikasi',
            'link' => '/note/'.$post->id.'?view=review',
            'is_read' => false,
        ]);

        return response()->json(['message' => 'Catatan berhasil diverifikasi!'], 200);
    }

    public function unverify(Request $request, $id)
    {
        $post = Post::find($id);

        if (! $post) {
            return response()->json(['message' => 'Catatan tidak ditemukan'], 404);
        }

        if (Auth::user()->role !== 'admin' && Auth::user()->role !== 'pakar') {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $post->update([
            'is_verified' => false,
            'verified_by' => null,
            'verify_reason' => null,
            'expert_rating' => null,
        ]);

        $reason = $request->input('reason');
        $message = 'Status verifikasi pada catatan "'.$post->title.'" telah dicabut oleh '.Auth::user()->role.'.';
        if ($reason) {
            $message .= ' Alasan: "'.$reason.'"';
        }

        Notification::create([
            'user_id' => $post->user_id,
            'actor_id' => Auth::id(),
            'title' => 'Verifikasi Catatan Dicabut ⚠️',
            'message' => $message,
            'type' => 'system',
            'link' => '/note/'.$post->id,
            'is_read' => false,
        ]);

        return response()->json(['message' => 'Verifikasi berhasil dicabut!'], 200);
    }

    public function reject($id)
    {
        $post = Post::find($id);

        if (! $post) {
            return response()->json(['message' => 'Catatan tidak ditemukan'], 404);
        }

        Post::where('_id', $id)->update(['is_rejected' => true]);

        Notification::create([
            'user_id' => $post->user_id,
            'title' => 'Catatan Ditolak Pakar 😔',
            'message' => 'Maaf, catatan kamu yang berjudul "'.$post->title.'" belum memenuhi standar dan ditolak oleh Pakar.',
            'type' => 'catatan_ditolak',
            'link' => null,
            'is_read' => false,
        ]);

        return response()->json(['message' => 'Catatan resmi ditolak dan notif terkirim!'], 200);
    }

    public function destroy($id)
    {
        $post = Post::find($id);

        if (! $post) {
            return response()->json(['message' => 'Post tidak ditemukan'], 404);
        }

        if ($post->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post berhasil dihapus'], 200);
    }

    public function ajukanVerifikasi($id)
    {
        $post = Post::find($id);

        if (! $post) {
            return response()->json(['message' => 'Catatan tidak ditemukan'], 404);
        }

        if ($post->submitted_for_review) {
            return response()->json(['message' => 'Catatan sudah diajukan untuk verifikasi.'], 400);
        }

        // Mark the post as submitted for review
        $post->update(['submitted_for_review' => true]);

        $pakars = User::where('role', 'pakar')->get();

        foreach ($pakars as $pakar) {
            Notification::create([
                'user_id' => $pakar->id,
                'actor_id' => Auth::id(),
                'title' => 'Pengajuan Verifikasi Baru! 📝',
                'message' => 'Ada catatan baru berjudul "'.$post->title.'" yang butuh direview nih!',
                'type' => 'sistem',
                'link' => '/pakar',
                'is_read' => false,
            ]);
        }

        return response()->json(['message' => 'Catatan berhasil diajukan ke Pakar!'], 200);
    }

    /**
     * Pakar Choice — Rekomendasi catatan terverifikasi pakar
     * Algoritma scoring:
     *  - expert_rating  : 40% (rating dari pakar, 1-5)
     *  - likes_count    : 25% (interaksi positif)
     *  - views          : 15% (jangkauan)
     *  - comments_count : 10% (diskusi / engagement)
     *  - recency        : 10% (catatan baru diprioritaskan)
     */
    public function pakarChoice(Request $request)
    {
        $limit = (int) $request->query('limit', 5);

        // Kunci cache unik berdasarkan limit
        $cacheKey = "pakar_choice_top_{$limit}";

        // Simpan hasil perhitungan ke dalam cache selama 60 menit (1 jam)
        $top = Cache::remember($cacheKey, now()->addMinutes(60), function () use ($limit) {
            // Ambil semua post yang sudah diverifikasi pakar
            $dormantUserIds = User::where('is_dormant', true)->pluck('_id')->toArray();

            $query = Post::with(['user'])
                ->where('visibility', 'public')
                ->where('is_verified', true);

            if (! empty($dormantUserIds)) {
                $query->whereNotIn('user_id', $dormantUserIds);
            }

            $verifiedPosts = $query->get();

            if ($verifiedPosts->isEmpty()) {
                return collect([]);
            }

            // Hitung nilai max untuk normalisasi
            $maxLikes = max($verifiedPosts->max('likes_count'), 1);
            $maxViews = max($verifiedPosts->max('views'), 1);
            $maxComments = max($verifiedPosts->max('comments_count'), 1);

            // Skor tiap post
            $scored = $verifiedPosts->map(function ($post) use ($maxLikes, $maxViews, $maxComments) {
                $rating = $post->expert_rating ?? 3;         // default 3/5
                $likes = $post->likes_count ?? 0;
                $views = $post->views ?? 0;
                $comments = $post->comments_count ?? 0;

                // Recency: semakin baru semakin tinggi (0-1, decay 30 hari)
                $daysAgo = now()->diffInDays($post->created_at);
                $recency = max(0, 1 - ($daysAgo / 30));

                // Normalized scores (0-1)
                $normRating = $rating / 5;
                $normLikes = $likes / $maxLikes;
                $normViews = $views / $maxViews;
                $normComments = $comments / $maxComments;

                // Weighted final score
                $score = ($normRating * 0.40)
                       + ($normLikes * 0.25)
                       + ($normViews * 0.15)
                       + ($normComments * 0.10)
                       + ($recency * 0.10);

                $post->recommendation_score = round($score, 4);

                return $post;
            });

            // Sort descending by score, take top N
            return $scored->sortByDesc('recommendation_score')->take($limit)->values();
        });

        if ($top->isEmpty()) {
            return response()->json([
                'message' => 'Belum ada catatan terverifikasi',
                'data' => [],
            ]);
        }

        // Attach is_liked for authenticated user (Ini tidak di-cache karena tiap user beda-beda)
        $userId = Auth::id();
        $top->each(function ($post) use ($userId) {
            $post->is_liked = $userId
                ? Like::where('post_id', (string) $post->id)->where('user_id', (string) $userId)->exists()
                : false;
        });

        return response()->json([
            'message' => 'Pakar Choice berhasil diambil (dari '.(Cache::has($cacheKey) ? 'cache' : 'database').')',
            'data' => $top,
        ]);
    }
}
