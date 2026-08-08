<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\HighlightController;
use App\Http\Controllers\LearningHistoryController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SertifikasiController;
use App\Http\Controllers\TopicController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VerificationController;
use App\Models\Follow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/v1/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/v1/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,10');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,10');

// Email Verification Routes
Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])->name('verification.verify');
Route::post('/email/resend', [VerificationController::class, 'resend'])->middleware('auth:sanctum');

// Social Auth (OAuth)
Route::get('/auth/{provider}/redirect', [AuthController::class, 'redirectToProvider'])->middleware('throttle:30,1');
Route::get('/auth/{provider}/callback', [AuthController::class, 'handleProviderCallback'])->middleware('throttle:30,1');
Route::post('/v1/auth/oauth-exchange', [AuthController::class, 'exchangeOAuthCode'])->middleware('throttle:10,1');
Route::post('/v1/auth/google/verify', [AuthController::class, 'verifyGoogleToken'])->middleware('throttle:10,1');

Route::get('/v1/posts', [PostController::class, 'index']);
Route::get('/v1/posts/pakar-choice', [PostController::class, 'pakarChoice']);
Route::get('/v1/posts/{id}', [PostController::class, 'show']);

// Public User Endpoints
Route::get('/v1/users/search', [UserController::class, 'search']);
Route::get('/v1/users/{id}', [UserController::class, 'show']);
Route::get('/v1/users/{id}/activities', [UserController::class, 'activities']);
Route::get('/v1/experts', [UserController::class, 'experts']);
Route::get('/v1/users/{id}/followers', [FollowController::class, 'followers']);
Route::get('/v1/users/{id}/following', [FollowController::class, 'following']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/v1/sertifikasi', [SertifikasiController::class, 'ajukan']);
    Route::get('/v1/sertifikasi/pending', [SertifikasiController::class, 'getPending']);
    Route::put('/v1/sertifikasi/{id}/verifikasi', [SertifikasiController::class, 'verifikasi']);
    Route::get('/v1/notifikasi', [NotificationController::class, 'getNotifikasi']);
    Route::get('/v1/notifikasi/{id}', [NotificationController::class, 'getNotifikasiById']);
    Route::put('/v1/notifikasi/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::put('/v1/notifikasi/{id}/read', [NotificationController::class, 'markAsRead']);

    // Posts
    Route::get('/v1/drafts', [PostController::class, 'drafts']);
    Route::post('/v1/posts', [PostController::class, 'store']);
    Route::put('/v1/posts/{id}', [PostController::class, 'update']);
    Route::delete('/v1/posts/{id}', [PostController::class, 'destroy']);

    // Verify
    Route::put('/v1/posts/{id}/verify', [PostController::class, 'verify']);
    Route::put('/v1/posts/{id}/unverify', [PostController::class, 'unverify']);
    Route::put('/v1/posts/{id}/reject', [PostController::class, 'reject']);
    Route::post('/v1/posts/{id}/ajukan', [PostController::class, 'ajukanVerifikasi']);

    // Comments
    Route::post('/v1/posts/{postId}/comments', [CommentController::class, 'store']);
    Route::put('/v1/comments/{id}', [CommentController::class, 'update']);
    Route::delete('/v1/comments/{id}', [CommentController::class, 'destroy']);

    // Likes
    Route::post('/v1/posts/{postId}/like', [LikeController::class, 'toggle']);
    Route::post('/v1/comments/{commentId}/like', [LikeController::class, 'toggleCommentLike']);

    // Bookmarks
    Route::post('/v1/posts/{postId}/bookmark', [BookmarkController::class, 'toggle']);
    Route::get('/v1/bookmarks', [BookmarkController::class, 'index']);

    // Highlights (personal)
    Route::get('/v1/posts/{postId}/highlights', [HighlightController::class, 'index']);
    Route::post('/v1/posts/{postId}/highlights', [HighlightController::class, 'store']);
    Route::delete('/v1/highlights/{id}', [HighlightController::class, 'destroy']);

    // Reports
    Route::post('/v1/posts/{postId}/report', [ReportController::class, 'store']);
    Route::post('/v1/comments/{commentId}/report', [ReportController::class, 'storeCommentReport']);
    Route::post('/v1/users/{userId}/report', [ReportController::class, 'storeUserReport']);
    Route::get('/v1/reports', [ReportController::class, 'index']); // Admin only
    Route::put('/v1/reports/{id}', [ReportController::class, 'update']); // Admin only

    // Users
    Route::get('/v1/users', [UserController::class, 'index']);
    Route::put('/v1/users/fcm-token', [UserController::class, 'updateFcmToken']);
    Route::put('/v1/users/{id}/demote', [UserController::class, 'demote']);
    Route::put('/v1/users/me', [UserController::class, 'updateProfile']);
    Route::put('/v1/users/locale', [UserController::class, 'updateLocale']);
    Route::put('/v1/users/privacy', [UserController::class, 'updatePrivacy']);
    Route::post('/v1/users/deactivate', [UserController::class, 'deactivate']);
    Route::post('/v1/users/change-password', [UserController::class, 'changePassword']);

    // Following
    Route::post('/v1/users/{id}/follow', [FollowController::class, 'toggleFollow']);
    Route::get('/v1/follow-requests', [FollowController::class, 'getPendingRequests']);
    Route::post('/v1/follow-requests/{id}/respond', [FollowController::class, 'respondToRequest']);

    // Categories & Topics
    Route::get('/v1/categories', [CategoryController::class, 'index']);
    Route::get('/v1/topics', [TopicController::class, 'index']);

    // Activities
    Route::get('/profile/activities', [ProfileController::class, 'myActivities']);

    // History
    Route::post('/v1/learn/history', [LearningHistoryController::class, 'logAktivitas']);

    // Statistik Belajar
    Route::get('/v1/learn/statistics', [LearningHistoryController::class, 'getStatistics']);
    Route::post('/v1/user/target', [UserController::class, 'updateTarget']);

    Route::get('/user', function (Request $request) {
        $user = clone $request->user();
        if ($user) {
            // Ngitung langsung dari tabel Follow tempat kita nyimpen datanya!
            $followers = Follow::where('following_id', (string) $user->id)->count();
            $following = Follow::where('follower_id', (string) $user->id)->count();

            $user->setAttribute('followers_count', $followers);
            $user->setAttribute('following_count', $following);
        }

        return $user;
    });
});
