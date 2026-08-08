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
        $targetUser = User::findOrFail($userId);
        $meId = auth('sanctum')->id();

        // Privacy check: If target is private and I am not the target and I don't follow target
        if ($targetUser->is_private && (string) $meId !== (string) $userId) {
            $loggedInUser = $meId ? User::find((string) $meId) : null;
            if (! $loggedInUser || ! $loggedInUser->isFollowing($userId)) {
                return response()->json(['message' => 'Akun ini privat'], 403);
            }
        }

        $followers = Follow::where('following_id', (string) $userId)
            ->where('status', Follow::STATUS_ACCEPTED)
            ->with('followerUser')
            ->get()
            ->pluck('followerUser')
            ->filter();

        if ($meId) {
            $me = User::find((string) $meId);
            $myFollowingIds = Follow::where('follower_id', (string) $meId)->where('status', Follow::STATUS_ACCEPTED)->pluck('following_id')->toArray();

            $followers = $followers->map(function ($user) use ($myFollowingIds, $meId) {
                $user->is_followed_by_me = in_array((string) $user->id, $myFollowingIds);

                $isPending = Follow::where('follower_id', (string) $meId)
                    ->where('following_id', (string) $user->id)
                    ->where('status', Follow::STATUS_PENDING)
                    ->exists();
                $user->is_follow_pending = $isPending;

                return $user;
            });
        }

        return response()->json($followers->values());
    }

    public function following($userId)
    {
        $targetUser = User::findOrFail($userId);
        $meId = auth('sanctum')->id();

        // Privacy check
        if ($targetUser->is_private && (string) $meId !== (string) $userId) {
            $loggedInUser = $meId ? User::find((string) $meId) : null;
            if (! $loggedInUser || ! $loggedInUser->isFollowing($userId)) {
                return response()->json(['message' => 'Akun ini privat'], 403);
            }
        }

        $following = Follow::where('follower_id', (string) $userId)
            ->where('status', Follow::STATUS_ACCEPTED)
            ->with('followingUser')
            ->get()
            ->pluck('followingUser')
            ->filter();

        if ($meId) {
            $myFollowingIds = Follow::where('follower_id', (string) $meId)->where('status', Follow::STATUS_ACCEPTED)->pluck('following_id')->toArray();

            $following = $following->map(function ($user) use ($myFollowingIds) {
                $user->is_followed_by_me = in_array((string) $user->id, $myFollowingIds);

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
