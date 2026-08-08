<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class LearningHistory extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'learning_histories';

    protected $fillable = [
        'user_id',
        'post_id',
        'duration',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id');
    }
}
