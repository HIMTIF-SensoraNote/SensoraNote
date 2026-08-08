<?php

namespace App\Http\Controllers;

use App\Models\Highlight;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HighlightController extends Controller
{
    /**
     * Get all highlights for the authenticated user on a specific post.
     */
    public function index($postId)
    {
        $highlights = Highlight::where('post_id', $postId)
            ->where('user_id', (string) Auth::id())
            ->orderBy('start_offset', 'asc')
            ->get();

        return response()->json([
            'data' => $highlights,
        ]);
    }

    /**
     * Store a new highlight.
     */
    public function store(Request $request, $postId)
    {
        $request->validate([
            'text' => 'required|string|max:2000',
            'start_offset' => 'required|integer|min:0',
            'end_offset' => 'required|integer|min:0',
            'color' => 'nullable|string|in:yellow,green,blue,red,purple',
        ]);

        $post = Post::find($postId);
        if (! $post) {
            return response()->json(['message' => 'Post tidak ditemukan'], 404);
        }

        // Check for overlapping highlights
        $existing = Highlight::where('post_id', $postId)
            ->where('user_id', (string) Auth::id())
            ->where(function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('start_offset', '<', $request->end_offset)
                        ->where('end_offset', '>', $request->start_offset);
                });
            })
            ->first();

        if ($existing) {
            // Merge overlapping: extend the existing highlight
            $existing->update([
                'start_offset' => min($existing->start_offset, $request->start_offset),
                'end_offset' => max($existing->end_offset, $request->end_offset),
                'text' => $request->text,
                'color' => $request->color ?? $existing->color,
            ]);

            return response()->json([
                'message' => 'Highlight diperbarui',
                'data' => $existing->fresh(),
            ], 200);
        }

        $highlight = Highlight::create([
            'user_id' => (string) Auth::id(),
            'post_id' => $postId,
            'text' => $request->text,
            'start_offset' => $request->start_offset,
            'end_offset' => $request->end_offset,
            'color' => $request->color ?? 'yellow',
        ]);

        return response()->json([
            'message' => 'Highlight berhasil ditambahkan',
            'data' => $highlight,
        ], 201);
    }

    /**
     * Delete a highlight.
     */
    public function destroy($id)
    {
        $highlight = Highlight::find($id);

        if (! $highlight) {
            return response()->json(['message' => 'Highlight tidak ditemukan'], 404);
        }

        if ((string) $highlight->user_id !== (string) Auth::id()) {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        $highlight->delete();

        return response()->json(['message' => 'Highlight berhasil dihapus'], 200);
    }
}
