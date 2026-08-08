<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:App\Models\User,username|regex:/^[a-zA-Z0-9_]+$/',
            'email' => 'required|string|email|max:255|unique:App\Models\User,email',
            'password' => ['required', 'string', 'min:8', 'max:128', 'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/'],
            'jenjang_pendidikan' => 'required|string',
            'profesi' => 'required|string',
        ], [
            'password.min' => 'auth.error_password_min',
            'password.max' => 'auth.error_password_max',
            'password.regex' => 'auth.error_password_regex',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $user = User::create([
            'name' => $request->name,
            'username' => strtolower($request->username),
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'jenjang_pendidikan' => $request->jenjang_pendidikan,
            'profesi' => $request->profesi,
        ]);

        $user->sendEmailVerificationNotification();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'auth.register_success',
            'data' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required',
        ]);

        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::where($loginField, $request->login)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'auth.invalid_credentials',
            ], 401);
        }

        if ($user->role === 'banned') {
            return response()->json([
                'message' => 'auth.account_banned',
            ], 403);
        }

        if ($user->is_dormant) {
            $user->is_dormant = false;
            $user->deactivated_at = null;
            $user->save();
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'auth.login_success',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->_id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'jenjang_pendidikan' => $user->jenjang_pendidikan,
                'avatar' => $user->avatar,
                'bio' => $user->bio,
                'school' => $user->school,
                'phone' => $user->phone,
                'is_private' => $user->is_private ?? false,
                'is_dormant' => $user->is_dormant,
                'username_updated_at' => $user->username_updated_at,
                'email_verified_at' => $user->email_verified_at,
            ],
        ]);
    }

    public function forgotPassword(Request $request)
    {
        // Validasi: cukup format email. JANGAN pakai `exists` — itu membocorkan
        // email mana yang terdaftar (user enumeration).
        $request->validate([
            'email' => 'required|email',
            'lang' => 'nullable|string',
        ]);

        if ($request->has('lang')) {
            App::setLocale($request->lang);
        }

        $status = Password::sendResetLink(
            $request->only('email')
        );

        // SECURITY: balas identik baik email terdaftar maupun tidak, supaya endpoint
        // ini tidak bisa dipakai menebak email mana yang punya akun.
        if ($status === Password::RESET_LINK_SENT || $status === Password::INVALID_USER) {
            return response()->json([
                'message' => 'passwords.sent',
            ], 200);
        }

        // Terlalu banyak permintaan (throttled).
        return response()->json([
            'message' => 'passwords.throttled',
        ], 429);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email|exists:user,email',
            'password' => ['required', 'string', 'min:8', 'max:128', 'confirmed', 'regex:/^(?=.*[A-Za-z])(?=.*\d).+$/'],
        ], [
            'password.min' => 'auth.error_password_min',
            'password.max' => 'auth.error_password_max',
            'password.regex' => 'auth.error_password_regex',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'auth.password_changed_success',
            ], 200);
        }

        return response()->json([
            'message' => 'auth.password_reset_failed',
        ], 400);
    }

    /**
     * Redirect to OAuth provider (Google/Facebook)
     */
    public function redirectToProvider($provider)
    {
        if (! in_array($provider, ['google', 'facebook'])) {
            return response()->json(['message' => 'auth.provider_not_supported'], 400);
        }

        /** @var AbstractProvider $driver */
        $driver = Socialite::driver($provider);

        return $driver->stateless()->redirect();
    }

    /**
     * Handle OAuth callback
     */
    public function handleProviderCallback($provider)
    {
        if (! in_array($provider, ['google', 'facebook'])) {
            return redirect(config('app.url').'/app/login?error=provider_invalid');
        }

        try {
            /** @var AbstractProvider $driver */
            $driver = Socialite::driver($provider);
            $socialUser = $driver->stateless()->user();
        } catch (\Exception $e) {
            return redirect(config('app.url').'/app/login?error=oauth_failed');
        }

        // Check if user already exists with this email
        $existingUser = User::where('email', $socialUser->getEmail())->first();

        if ($existingUser) {
            if ($existingUser->role === 'banned') {
                return redirect(config('app.url').'/app/login?error=banned');
            }

            // Update provider info if not set
            if (! $existingUser->provider) {
                $existingUser->update([
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                ]);
            }

            // Reactivate dormant user
            if ($existingUser->is_dormant) {
                $existingUser->is_dormant = false;
                $existingUser->deactivated_at = null;
                $existingUser->save();
            }

            $token = $existingUser->createToken('auth_token')->plainTextToken;
            $code = (string) Str::uuid();
            Cache::put('oauth_exchange:'.$code, $token, now()->addSeconds(60));

            return redirect(config('app.url').'/app/login?code='.$code.'&existing=true');
        }

        // Create new user from social login
        $baseUsername = strtolower(Str::slug($socialUser->getName(), '_'));
        $username = $baseUsername;
        $counter = 1;
        // Ensure username is unique
        while (User::where('username', $username)->exists()) {
            $username = $baseUsername.'_'.$counter;
            $counter++;
        }

        $newUser = User::create([
            'name' => $socialUser->getName(),
            'email' => $socialUser->getEmail(),
            'username' => strtolower($username),
            'avatar' => $socialUser->getAvatar(),
            'provider' => $provider,
            'provider_id' => $socialUser->getId(),
            'profile_completed' => false, // Needs to complete profile
        ]);
        // email_verified_at is guarded; set explicitly (OAuth email is provider-verified).
        $newUser->forceFill(['email_verified_at' => now()])->save();

        $token = $newUser->createToken('auth_token')->plainTextToken;
        $code = (string) Str::uuid();
        Cache::put('oauth_exchange:'.$code, $token, now()->addSeconds(60));

        return redirect(config('app.url').'/app/login?code='.$code.'&new=true');
    }

    /**
     * Exchange a short-lived OAuth code for an access token.
     * Code is one-time-use and expires in 60 seconds.
     */
    public function exchangeOAuthCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:36',
        ]);

        $cacheKey = 'oauth_exchange:'.$request->input('code');
        $token = Cache::pull($cacheKey); // pull = get + forget (one-time use)

        if (! $token) {
            return response()->json([
                'message' => 'auth.oauth_code_invalid',
            ], 400);
        }

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Verify Google ID token from mobile native app
     */
    public function verifyGoogleToken(Request $request)
    {
        $request->validate([
            'id_token' => 'required|string',
        ]);

        try {
            $response = Http::get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $request->id_token,
            ]);

            if (! $response->successful()) {
                return response()->json(['message' => 'Invalid Google token'], 401);
            }

            $payload = $response->json();

            // SECURITY: A valid Google token is not enough — it must have been minted
            // for OUR OAuth clients. Without this, an ID token issued to ANY Google app
            // could be replayed here to authenticate as its email (account takeover).
            $allowedAudiences = array_filter(array_map('trim', explode(',', (string) config('services.google.allowed_audiences'))));
            $aud = $payload['aud'] ?? null;
            $iss = $payload['iss'] ?? '';
            $emailVerified = ($payload['email_verified'] ?? null) === true
                || ($payload['email_verified'] ?? null) === 'true';

            if (empty($allowedAudiences) || ! in_array($aud, $allowedAudiences, true)) {
                return response()->json(['message' => 'Invalid Google token audience'], 401);
            }
            if (! in_array($iss, ['accounts.google.com', 'https://accounts.google.com'], true)) {
                return response()->json(['message' => 'Invalid Google token issuer'], 401);
            }
            if (! $emailVerified) {
                return response()->json(['message' => 'Google email not verified'], 401);
            }

            $email = $payload['email'] ?? null;
            $name = $payload['name'] ?? null;
            $googleId = $payload['sub'] ?? null;
            $picture = $payload['picture'] ?? null;

            if (! $email) {
                return response()->json(['message' => 'Email not found in Google payload'], 400);
            }

            // Check if user already exists
            $existingUser = User::where('email', $email)->first();

            if ($existingUser) {
                if ($existingUser->role === 'banned') {
                    return response()->json(['message' => 'auth.account_banned'], 403);
                }

                // Update provider info if not set
                if (! $existingUser->provider) {
                    $existingUser->update([
                        'provider' => 'google',
                        'provider_id' => $googleId,
                    ]);
                }

                // Reactivate dormant user
                if ($existingUser->is_dormant) {
                    $existingUser->is_dormant = false;
                    $existingUser->deactivated_at = null;
                    $existingUser->save();
                }

                \Illuminate\Support\Facades\Auth::login($existingUser, true);
                $token = $existingUser->createToken('auth_token')->plainTextToken;

                return response()->json([
                    'message' => 'auth.login_success',
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                    'user' => $existingUser,
                ]);
            }

            // Create new user from social login
            $baseUsername = strtolower(Str::slug($name, '_'));
            $username = $baseUsername;
            $counter = 1;
            while (User::where('username', $username)->exists()) {
                $username = $baseUsername.'_'.$counter;
                $counter++;
            }

            $newUser = User::create([
                'name' => $name,
                'email' => $email,
                'username' => strtolower($username),
                'avatar' => $picture,
                'provider' => 'google',
                'provider_id' => $googleId,
                'profile_completed' => false,
            ]);
            // email_verified_at is guarded; set explicitly (Google email is verified).
            $newUser->forceFill(['email_verified_at' => now()])->save();

            \Illuminate\Support\Facades\Auth::login($newUser, true);
            $token = $newUser->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'auth.login_success',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => $newUser,
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to verify Google token', 'error' => $e->getMessage()], 500);
        }
    }
}
