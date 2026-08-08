<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function verify(Request $request, $id, $hash)
    {
        // Web SPA result pages live at {APP_URL}/app/verify-{success,failed}
        // (see routes/web.php `/app/{any}` + frontend routes.tsx). VerifyResultPage
        // then bridges to the bayumobile:// deep link when opened on a device.
        // Mirrors the reset-password URL pattern in AppServiceProvider.
        $base = rtrim(config('app.url'), '/').'/app';

        $user = User::find($id);

        if (! $user) {
            // User tidak ditemukan (misalnya deep link kadaluwarsa)
            return redirect($base.'/verify-failed');
        }

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            // Token/Hash tidak cocok
            return redirect($base.'/verify-failed');
        }

        if ($user->hasVerifiedEmail()) {
            // Sudah terverifikasi sebelumnya
            return redirect($base.'/verify-success');
        }

        $user->markEmailAsVerified();

        return redirect($base.'/verify-success');
    }

    /**
     * Resend the email verification notification.
     */
    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email sudah terverifikasi.',
            ], 400);
        }

        $request->user()->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Link verifikasi email telah dikirim ulang.',
        ]);
    }
}
