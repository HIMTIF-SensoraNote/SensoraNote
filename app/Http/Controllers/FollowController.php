<?php

namespace App\Http\Controllers;

use App\Models\Follow;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function toggleFollow($userId)
    {
        $targetUser = User::findOrFail($userId);
        $me = auth()->user();

        if ($me->id === $targetUser->id) {
            return response()->json(['message' => 'Nggak bisa follow diri sendiri bro!'], 400);
        }

        $targetIdStr = (string) $targetUser->id;
        $myIdStr = (string) $me->id;

        $existingFollow = Follow::where('follower_id', $myIdStr)
            ->where('following_id', $targetIdStr)
            ->first();

        if ($existingFollow) {
            $existingFollow->delete();

            return response()->json(['status' => 'unfollowed', 'message' => 'Berhenti mengikuti']);
        } else {
            $status = $targetUser->is_private ? Follow::STATUS_PENDING : Follow::STATUS_ACCEPTED;

            Follow::create([
                'follower_id' => $myIdStr,
                'following_id' => $targetIdStr,
                'status' => $status,
            ]);

            // Notifikasi
            Notification::create([
                'user_id' => $targetIdStr,
                'actor_id' => $myIdStr,
                'title' => $status === Follow::STATUS_PENDING ? 'Permintaan Mengikuti' : 'Pengikut Baru',
                'message' => $me->name.($status === Follow::STATUS_PENDING ? ' ingin mengikuti anda.' : ' mulai mengikuti anda.'),
                'type' => 'follow',
                'link' => $status === Follow::STATUS_PENDING ? '/settings/follow-requests' : '/profile/'.$myIdStr.'?hint=follower',
                'is_read' => false,
            ]);

            $message = $status === Follow::STATUS_PENDING
                ? 'Permintaan mengikuti dikirim'
                : 'Berhasil mengikuti';

            return response()->json(['status' => $status, 'message' => $message]);
        }
    }

    public function followers($userId)
    {
        $targetUser = User::find($userId) ?? User::where('_id', $userId)->first();
        if (!$targetUser) {
            return response()->json(['message' => 'users.user_not_found'], 404);
        }
        $targetIdStr = (string) ($targetUser->_id ?? $targetUser->id);

        $meId = null;
        try {
            $meId = auth('sanctum')->id() ?: auth('api')->id() ?: auth()->id();
        } catch (\Exception $e) {}

        // Privacy check: If target is private and I am not the target and I don't follow target
        if ($targetUser->is_private && (string) $meId !== $targetIdStr) {
            $loggedInUser = $meId ? User::find((string) $meId) : null;
            if (! $loggedInUser || ! $loggedInUser->isFollowing($targetIdStr)) {
                return response()->json(['message' => 'Akun ini privat'], 403);
            }
        }

        $follows = Follow::where('following_id', $targetIdStr)
            ->where('status', Follow::STATUS_ACCEPTED)
            ->get();

        $followerIds = $follows->pluck('follower_id')->map(fn($id) => (string) $id)->toArray();
        $followers = User::whereIn('_id', $followerIds)->get();
        $validIds = $followers->map(fn($u) => (string) ($u->_id ?? $u->id))->toArray();

        // Delete orphan follows
        foreach ($follows as $f) {
            if (!in_array((string) $f->follower_id, $validIds)) {
                $f->delete();
            }
        }

        if ($meId) {
            $meIdStr = (string) $meId;
            $myFollowingIds = Follow::where('follower_id', $meIdStr)
                ->where('status', Follow::STATUS_ACCEPTED)
                ->pluck('following_id')
                ->map(fn($id) => (string) $id)
                ->toArray();

            $myPendingIds = Follow::where('follower_id', $meIdStr)
                ->where('status', Follow::STATUS_PENDING)
                ->pluck('following_id')
                ->map(fn($id) => (string) $id)
                ->toArray();

            $followers = $followers->map(function ($user) use ($myFollowingIds, $myPendingIds) {
                $uid = (string) ($user->_id ?? $user->id);
                $user->is_followed_by_me = in_array($uid, $myFollowingIds);
                $user->is_follow_pending = in_array($uid, $myPendingIds);

                return $user;
            });
        }

        return response()->json($followers->values());
    }

    public function following($userId)
    {
        $targetUser = User::find($userId) ?? User::where('_id', $userId)->first();
        if (!$targetUser) {
            return response()->json(['message' => 'users.user_not_found'], 404);
        }
        $targetIdStr = (string) ($targetUser->_id ?? $targetUser->id);

        $meId = null;
        try {
            $meId = auth('sanctum')->id() ?: auth('api')->id() ?: auth()->id();
        } catch (\Exception $e) {}

        // Privacy check
        if ($targetUser->is_private && (string) $meId !== $targetIdStr) {
            $loggedInUser = $meId ? User::find((string) $meId) : null;
            if (! $loggedInUser || ! $loggedInUser->isFollowing($targetIdStr)) {
                return response()->json(['message' => 'Akun ini privat'], 403);
            }
        }

        $follows = Follow::where('follower_id', $targetIdStr)
            ->where('status', Follow::STATUS_ACCEPTED)
            ->get();

        $followingIds = $follows->pluck('following_id')->map(fn($id) => (string) $id)->toArray();
        $following = User::whereIn('_id', $followingIds)->get();
        $validIds = $following->map(fn($u) => (string) ($u->_id ?? $u->id))->toArray();

        // Delete orphan follows
        foreach ($follows as $f) {
            if (!in_array((string) $f->following_id, $validIds)) {
                $f->delete();
            }
        }

        if ($meId) {
            $meIdStr = (string) $meId;
            $myFollowingIds = Follow::where('follower_id', $meIdStr)
                ->where('status', Follow::STATUS_ACCEPTED)
                ->pluck('following_id')
                ->map(fn($id) => (string) $id)
                ->toArray();

            $myPendingIds = Follow::where('follower_id', $meIdStr)
                ->where('status', Follow::STATUS_PENDING)
                ->pluck('following_id')
                ->map(fn($id) => (string) $id)
                ->toArray();

            $following = $following->map(function ($user) use ($myFollowingIds, $myPendingIds) {
                $uid = (string) ($user->_id ?? $user->id);
                $user->is_followed_by_me = in_array($uid, $myFollowingIds);
                $user->is_follow_pending = in_array($uid, $myPendingIds);

                return $user;
            });
        }

        return response()->json($following->values());
    }

    public function getPendingRequests()
    {
        $userId = auth()->id();
        $requests = Follow::where('following_id', (string) $userId)
            ->where('status', Follow::STATUS_PENDING)
            ->with('followerUser')
            ->get();

        return response()->json($requests);
    }

    public function respondToRequest(Request $request, $followId)
    {
        $request->validate([
            'action' => 'required|in:accept,decline',
        ]);

        $follow = Follow::where('_id', (string) $followId)->first();

        if (! $follow) {
            return response()->json(['message' => 'Permintaan tidak ditemukan'], 404);
        }

        // Ensure the current user is the one being followed
        if ((string) $follow->following_id !== (string) auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($request->action === 'accept') {
            $follow->status = Follow::STATUS_ACCEPTED;
            $follow->save();

            // Notifikasi ke pemohon
            Notification::create([
                'user_id' => (string) $follow->follower_id,
                'actor_id' => (string) auth()->id(),
                'title' => 'Permintaan Diterima',
                'message' => auth()->user()->name.' menerima permintaan mengikuti anda.',
                'type' => 'follow',
                'link' => '/profile/'.auth()->id().'?hint=follower',
                'is_read' => false,
            ]);

            return response()->json(['message' => 'Permintaan diterima']);
        } else {
            $follow->delete();

            return response()->json(['message' => 'Permintaan ditolak']);
        }
    }
}
