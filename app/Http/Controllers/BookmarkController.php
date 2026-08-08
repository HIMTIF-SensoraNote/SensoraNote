<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;

class BookmarkController extends Controller
{
    public function toggle($postId)
    {
        $post = Post::find($postId);
        if (! $post) {
            return response()->json(['message' => 'Post tidak ditemukan'], 404);
        }

        $userId = (string) Auth::id();
        $postIdStr = (string) $postId;
        $bookmark = Bookmark::where('post_id', $postIdStr)->where('user_id', $userId)->first();

        if ($bookmark) {
            // Unbookmark
            $bookmark->delete();
            $post->decrement('bookmarks_count');

            return response()->json(['message' => 'Berhasil unbookmark post'], 200);
        } else {
            // Bookmark
            Bookmark::create([
                'post_id' => $postIdStr,
                'user_id' => $userId,
            ]);
            $post->increment('bookmarks_count');

            return response()->json(['message' => 'Berhasil bookmark post'], 201);
        }
    }

    public function index()
    {
        $userId = (string) Auth::id();
        // Since MongoDB doesn't do complex joins cleanly, we fetch the bookmarked IDs
        $bookmarks = Bookmark::where('user_id', $userId)->get();
        // Return just an array of the post IDs
        $bookmarkedIds = $bookmarks->pluck('post_id');

        return response()->json([
            'bookmarkedIds' => $bookmarkedIds,
        ]);
    }
}
