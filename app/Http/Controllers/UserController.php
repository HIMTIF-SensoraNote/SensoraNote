<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Follow;
use App\Models\Post;
use App\Models\User;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'users.admin_only'], 403);
        }

        $users = User::orderBy('created_at', 'desc')->get();

        $users->each(function ($u) {
            $u->followers = $u->followers()->count();
            $u->followings = $u->followings()->count();
        });

        return response()->json([
            'message' => 'users.fetch_all_success',
            'data' => $users,
        ], 200);
    }

    public function search(Request $request)
    {
        $query = $request->input('q', '');
        $limit = (int) $request->input('limit', 12);

        $usersQuery = User::where(function ($q) {
            $q->where('is_dormant', false)->orWhereNull('is_dormant');
        });

        if (strlen($query) > 0) {
            $usersQuery->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('username', 'like', "%{$query}%");
            });
        }

        $paginator = $usersQuery->orderBy('created_at', 'desc')->paginate($limit);
        $users = collect($paginator->items());

        $viewerId = null;
        try {
            $viewerId = Auth::guard('sanctum')->id();
        } catch (\Exception $e) {
        }
        if (! $viewerId) {
            try {
                $viewerId = Auth::guard('api')->id();
            } catch (\Exception $e) {
            }
        }
        if (! $viewerId) {
            $viewerId = Auth::id();
        }

        $viewer = $viewerId ? User::find((string) $viewerId) : null;

        $users->each(function (User $u) use ($viewer) {
            $u->setAttribute('followers_count', $u->followers()->count());
            $u->setAttribute('posts_count', $u->posts()->count());
            // @phpstan-ignore-next-line
            $u->setAttribute('is_followed_by_me', $viewer ? $viewer->isFollowing($u->getKey()) : false);
            $u->makeHidden(['email', 'phone', 'password', 'remember_token', 'deactivated_at']);
        });

        return response()->json([
            'message' => 'users.search_success',
            'data' => $users,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ], 200);
    }

    public function updateFcmToken(Request $request)
    {
        $request->validate([
            'fcm_token' => 'required|string',
        ]);

        $user = auth()->user();
        $user->fcm_token = $request->fcm_token;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'FCM Token updated successfully.',
        ], 200);
    }

    public function updateLocale(Request $request)
    {
        $validated = $request->validate([
            'locale' => 'required|string|max:10',
        ]);

        $user = Auth::user();
        if ($user) {
            $user->locale = $validated['locale'];
            $user->save();

            return response()->json(['message' => 'Locale updated', 'data' => ['locale' => $user->locale]], 200);
        }

        return response()->json(['message' => 'Unauthorized'], 401);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:50|regex:/^[a-zA-Z0-9_]+$/',
            'bio' => 'nullable|string|max:255',
            'jenjang_pendidikan' => 'sometimes|string|in:SD,SMP,SMA,Kuliah,Umum',
            'profesi' => 'nullable|string|in:Pelajar,Mahasiswa,Pengajar,Umum',
            'school' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable',
        ]);

        $user = Auth::user();

        // 1. Handle avatar removal
        if ($request->boolean('remove_avatar') || $request->input('remove_avatar') === 'true' || $request->input('avatar') === 'null' || $request->input('avatar') === '') {
            $user->avatar = null;
            $validated['avatar'] = null;
        } elseif ($request->hasFile('avatar')) {
            $cloudinaryUrl = config('services.cloudinary.url') ?: env('CLOUDINARY_URL');
            if (!$cloudinaryUrl) {
                return response()->json(['message' => 'Konfigurasi CLOUDINARY_URL belum tersedia pada server.'], 500);
            }
            $cloudinary = new Cloudinary($cloudinaryUrl);

            $upload = $cloudinary->uploadApi()->upload($request->file('avatar')->getRealPath(), [
                'folder' => 'sensoranote-avatars',
            ]);

            $validated['avatar'] = $upload['secure_url'];
            $user->avatar = $upload['secure_url'];
        }

        if (isset($validated['username']) && $validated['username'] !== $user->username) {
            $validated['username'] = strtolower($validated['username']);
            $exists = User::where('username', $validated['username'])->where('_id', '!=', $user->_id)->exists();
            if ($exists) {
                return response()->json(['message' => 'users.username_taken'], 400);
            }

            if ($user->username_updated_at) {
                $daysSinceUpdate = now()->diffInDays($user->username_updated_at);
                if ($daysSinceUpdate < 15) {
                    $daysLeft = 15 - $daysSinceUpdate;

                    return response()->json([
                        'message' => 'users.username_cooldown_error',
                        'daysLeft' => $daysLeft,
                    ], 400);
                }
            }

            $user->username_updated_at = Carbon::now();
        }

        $user->fill($validated);

        // If profile was incomplete (social login), mark it complete
        if (isset($user->profile_completed) && ! $user->profile_completed) {
            $user->profile_completed = true;
        }

        $user->save();

        return response()->json([
            'message' => 'users.profile_updated',
            'user' => $user,
        ], 200);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => ['required', 'string', 'min:8', 'max:128', 'confirmed', 'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/'],
        ], [
            'new_password.min' => 'auth.error_password_min',
            'new_password.max' => 'auth.error_password_max',
            'new_password.regex' => 'auth.error_password_regex',
        ]);

        $user = auth()->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'users.current_password_wrong',
            ], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'users.password_updated',
        ], 200);
    }

    public function show($id)
    {
        $user = Cache::remember("user_profile_{$id}", now()->addSeconds(10), function () use ($id) {
            $u = User::find($id) ?? User::where('_id', $id)->first();
            if ($u) {
                $uIdStr = (string) ($u->_id ?? $u->id);
                $u->setAttribute('followers_count', Follow::where('following_id', $uIdStr)->where('status', Follow::STATUS_ACCEPTED)->count());
                $u->setAttribute('following_count', Follow::where('follower_id', $uIdStr)->where('status', Follow::STATUS_ACCEPTED)->count());
            }

            return $u;
        });

        if (! $user) {
            return response()->json(['message' => 'users.user_not_found'], 404);
        }

        $viewerId = null;
        try {
            $viewerId = Auth::guard('sanctum')->id();
        } catch (\Exception $e) {
        }
        if (! $viewerId) {
            try {
                $viewerId = Auth::guard('api')->id();
            } catch (\Exception $e) {
            }
        }
        if (! $viewerId) {
            $viewerId = Auth::id();
        }
        $viewerIdStr = (string) $viewerId;
        $userIdStr = (string) $user->id;

        $isAdmin = false;
        if ($viewerIdStr) {
            $viewer = User::find($viewerIdStr);
            $isAdmin = $viewer && $viewer->role === 'admin';
        }

        // Prevent viewing dormant accounts unless admin or owner
        if ($user->is_dormant && ! $isAdmin && $viewerIdStr !== $userIdStr) {
            return response()->json(['message' => 'users.user_dormant'], 403);
        }

        // Prevent viewing private accounts unless admin, owner, or follower
        if ($user->is_private && ! $isAdmin && $viewerIdStr !== $userIdStr) {
            $isFollower = false;
            $isPending = false;
            if ($viewerIdStr) {
                $follow = Follow::where('follower_id', $viewerIdStr)->where('following_id', $userIdStr)->first();
                $isFollower = $follow && $follow->status === Follow::STATUS_ACCEPTED;
                $isPending = $follow && $follow->status === Follow::STATUS_PENDING;
            }
            if (! $isFollower) {
                $followersCount = Follow::where('following_id', $userIdStr)->where('status', Follow::STATUS_ACCEPTED)->count();
                $followingCount = Follow::where('follower_id', $userIdStr)->where('status', Follow::STATUS_ACCEPTED)->count();
                $postsCount = Post::where('user_id', $userIdStr)->where('visibility', 'public')->count();

                return response()->json([
                    'message' => 'users.user_private',
                    'is_private_restricted' => true,
                    'is_follow_pending' => $isPending,
                    'data' => [
                        '_id' => (string) ($user->_id ?? $user->id),
                        'id' => (string) ($user->_id ?? $user->id),
                        'name' => $user->name,
                        'username' => $user->username,
                        'avatar' => $user->avatar,
                        'role' => $user->role,
                        'is_private' => true,
                        'bio' => $user->bio,
                        'jenjang_pendidikan' => $user->jenjang_pendidikan,
                        'profesi' => $user->profesi,
                        'school' => $user->school,
                        'created_at' => $user->created_at,
                        'followers_count' => $followersCount,
                        'following_count' => $followingCount,
                        'posts_count' => $postsCount,
                        'is_followed_by_me' => false,
                        'is_follow_pending' => $isPending,
                        'follows_me' => $viewerIdStr ? $user->isFollowing($viewerIdStr) : false,
                    ],
                ], 403);
            }
        }

        $user->makeHidden(['email', 'phone', 'is_verified']);

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

        if ($userId) {
            $loggedInUser = User::find((string) $userId);
            $isFollowed = $loggedInUser ? $loggedInUser->isFollowing($user->id) : false;

            $isPending = Follow::where('follower_id', (string) $userId)
                ->where('following_id', (string) $user->id)
                ->where('status', Follow::STATUS_PENDING)
                ->exists();

            $user->setAttribute('is_followed_by_me', $isFollowed);
            $user->setAttribute('is_follow_pending', $isPending);
            $user->setAttribute('follows_me', $user->isFollowing($userId));
        } else {
            $user->setAttribute('is_followed_by_me', false);
            $user->setAttribute('is_follow_pending', false);
            $user->setAttribute('follows_me', false);
        }

        return response()->json([
            'message' => 'users.fetch_profile_success',
            'data' => $user,
        ], 200);
    }

    public function activities($id)
    {
        $user = User::find($id);

        if (! $user) {
            return response()->json(['message' => 'users.user_not_found'], 404);
        }

        $activities = Comment::with('post')
            ->where('user_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'message' => 'users.fetch_activities_success',
            'data' => $activities,
        ], 200);
    }

    public function experts()
    {
        $experts = User::where('role', 'pakar')
            ->where(function ($q) {
                $q->where('is_dormant', false)->orWhereNull('is_dormant');
            })->get();

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

        $loggedInUser = $userId ? User::find((string) $userId) : null;

        $experts->each(function (User $expert) use ($loggedInUser) {
            $expert->setAttribute('followers_count', $expert->followers()->count());
            $expert->setAttribute('is_followed_by_me', $loggedInUser ? $loggedInUser->isFollowing($expert->getKey()) : false);
            $expert->makeHidden(['email', 'phone', 'password', 'remember_token']);
        });

        return response()->json([
            'message' => 'users.fetch_experts_success',
            'data' => $experts,
        ], 200);
    }

    public function updateTarget(Request $request)
    {
        $request->validate([
            'target' => 'required|numeric',
        ]);

        $user = Auth::user();
        $user->target_belajar = $request->target;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'users.target_saved',
            'target' => $user->target_belajar,
        ]);
    }

    public function demote($id)
    {
        if (Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'users.demote_admin_only'], 403);
        }

        $user = User::find($id);
        if (! $user) {
            return response()->json(['message' => 'users.user_not_found'], 404);
        }

        if ($user->id === Auth::id()) {
            return response()->json(['message' => 'users.cannot_demote_self'], 400);
        }

        $oldRole = $user->role;
        $user->role = 'user';
        $user->save();

        return response()->json([
            'message' => 'users.demote_success',
            'oldRole' => $oldRole,
            'user' => $user,
        ], 200);
    }

    public function updatePrivacy(Request $request)
    {
        $request->validate([
            'is_private' => 'required|boolean',
        ]);

        $user = Auth::user();
        $user->is_private = $request->is_private;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'users.privacy_updated',
            'user' => $user,
        ]);
    }

    public function deactivate(Request $request)
    {
        $user = Auth::user();

        // Mark as dormant and set deactivation timestamp
        $user->is_dormant = true;
        $user->deactivated_at = Carbon::now();
        $user->save();

        // Optional: revoke all tokens so they are fully logged out
        if (method_exists($user, 'tokens')) {
            $user->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'users.account_deactivated',
        ]);
    }
}
