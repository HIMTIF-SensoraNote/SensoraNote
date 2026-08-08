<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function getNotifikasi()
    {
        $userId = (string) Auth::id();

        $notifikasi = Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        // Manual attach actor for stability (MongoDB relationship fix)
        $actorIds = $notifikasi->pluck('actor_id')->filter()->unique()->map(fn ($id) => (string) $id)->toArray();

        $actors = User::whereIn('_id', $actorIds)
            ->get(['_id', 'name', 'avatar'])
            ->mapWithKeys(fn ($user) => [(string) $user->_id => $user]);

        if ($actors->isEmpty()) {
            $actors = User::whereIn('id', $actorIds)
                ->get(['id', 'name', 'avatar'])
                ->mapWithKeys(fn ($user) => [(string) $user->id => $user]);
        }

        $notifikasi->each(function ($item) use ($actors) {
            $actorId = (string) $item->actor_id;
            if ($actors->has($actorId)) {
                $item->actor = $actors->get($actorId);
            } else {
                $item->actor = null;
            }
        });

        return response()->json([
            'message' => 'Berhasil mengambil data notifikasi',
            'data' => $notifikasi,
        ], 200);
    }

    public function getNotifikasiById($id)
    {
        $notifikasi = Notification::find($id);

        if (! $notifikasi) {
            return response()->json(['message' => 'Notifikasi tidak ditemukan'], 404);
        }

        if ((string) $notifikasi->user_id !== (string) Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Attach actor if exists
        if ($notifikasi->actor_id) {
            $actorId = (string) $notifikasi->actor_id;
            $actor = User::where('_id', $actorId)->first() ?? User::where('id', $actorId)->first();
            if ($actor) {
                $notifikasi->actor = ['_id' => (string) $actor->id, 'name' => $actor->name, 'avatar' => $actor->avatar];
            }
        }

        return response()->json([
            'message' => 'Berhasil mengambil data notifikasi',
            'data' => $notifikasi,
        ], 200);
    }

    public function markAsRead($id)
    {
        $notifikasi = Notification::find($id);

        if (! $notifikasi) {
            return response()->json(['message' => 'Notifikasi tidak ditemukan'], 404);
        }

        if ((string) $notifikasi->user_id !== (string) Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notifikasi->update(['is_read' => true]);

        return response()->json(['message' => 'Berhasil ditandai sudah dibaca'], 200);
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', (string) Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Semua berhasil ditandai sudah dibaca'], 200);
    }
}
