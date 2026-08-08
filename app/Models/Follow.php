<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Follow extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'follows';

    const STATUS_PENDING = 'pending';

    const STATUS_ACCEPTED = 'accepted';

    protected $fillable = [
        'follower_id',
        'following_id',
        'status',
    ];

    // Relasi balik ke User (Opsional tapi sangat berguna kedepannya)
    public function followerUser()
    {
        return $this->belongsTo(User::class, 'follower_id');
    }

    public function followingUser()
    {
        return $this->belongsTo(User::class, 'following_id');
    }
}
