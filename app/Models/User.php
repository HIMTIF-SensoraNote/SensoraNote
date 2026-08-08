<?php

namespace App\Models;

use App\Notifications\CustomResetPassword;
use App\Notifications\CustomVerifyEmail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Contracts\Translation\HasLocalePreference;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;
use MongoDB\Laravel\Auth\User as Authenticatable;

/**
 * @property string $_id
 * @property string $id
 * @property string $name
 * @property string $email
 * @property string $avatar
 * @property string $password
 * @property string $role
 * @property string $jenjang_pendidikan
 * @property string $profesi
 * @property string $username
 * @property string $display_name
 * @property string $phone
 * @property string $bio
 * @property string $school
 * @property bool $is_verified
 * @property bool $is_private
 * @property bool $is_dormant
 * @property Carbon|null $deactivated_at
 * @property Carbon|null $username_updated_at
 * @property string $provider
 * @property string $provider_id
 * @property Carbon|null $email_verified_at
 * @property bool $profile_completed
 * @property int|null $target_belajar
 * @property bool $is_followed_by_me
 * @property bool $is_follow_pending
 * @property bool $follows_me
 * @property int $followers_count
 * @property int $following_count
 * @property int $posts_count
 */
class User extends Authenticatable implements HasLocalePreference, MustVerifyEmail
{
    use HasApiTokens, Notifiable;

    protected $connection = 'mongodb';

    protected $collection = 'user';

    protected $table = 'user';

    protected $primaryKey = '_id';

    protected $fillable = [
        'name',
        'email',
        'avatar',
        'password',
        'jenjang_pendidikan',
        'profesi',
        'username',
        'display_name',
        'phone',
        'bio',
        'locale',
        'fcm_token',
        'school',
        'is_private',
        'is_dormant',
        'deactivated_at',
        'username_updated_at',
        'provider',
        'provider_id',
        'profile_completed',
        // Intentionally NOT mass-assignable (set explicitly via forceFill / direct
        // assignment): 'role', 'is_verified', 'email_verified_at'. Keeping them out
        // of $fillable prevents a careless create()/update() with raw request input
        // from granting email verification or expert/admin status.
    ];

    protected $attributes = [
        'role' => 'user',
        'is_verified' => false,
        'is_private' => false,
        'is_dormant' => false,
        'profile_completed' => true,
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'is_private' => 'boolean',
        'is_dormant' => 'boolean',
        'profile_completed' => 'boolean',
        'deactivated_at' => 'datetime',
        'username_updated_at' => 'datetime',
        'email_verified_at' => 'datetime',
    ];

    // Relationships
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPassword($token));
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new CustomVerifyEmail);
    }

    public function preferredLocale()
    {
        return $this->locale ?? config('app.locale');
    }

    public function posts()
    {
        return $this->hasMany(Post::class, 'user_id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'user_id');
    }

    public function likes()
    {
        return $this->hasMany(Like::class, 'user_id');
    }

    public function sertifikasi()
    {
        return $this->hasMany(Sertifikasi::class, 'user_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function isFollowing($userId)
    {
        return Follow::where('follower_id', (string) $this->id)
            ->where('following_id', (string) $userId)
            ->where('status', Follow::STATUS_ACCEPTED)
            ->exists();
    }

    public function followings()
    {
        return $this->hasMany(Follow::class, 'follower_id')->where('status', Follow::STATUS_ACCEPTED);
    }

    public function followers()
    {
        return $this->hasMany(Follow::class, 'following_id')->where('status', Follow::STATUS_ACCEPTED);
    }

    public function createToken(string $name, array $abilities = ['*'], ?\DateTimeInterface $expiresAt = null)
    {
        $plainTextToken = Str::random(40);

        $token = $this->tokens()->create([
            'name' => $name,
            'token' => hash('sha256', $plainTextToken),
            'abilities' => $abilities,
            'expires_at' => $expiresAt,
        ]);

        return new class($token, $token->getKey().'|'.$plainTextToken)
        {
            public $accessToken;

            public $plainTextToken;

            public function __construct($token, $plainText)
            {
                $this->accessToken = $token;
                $this->plainTextToken = $plainText;
            }
        };
    }
}
