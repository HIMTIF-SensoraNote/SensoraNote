<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Highlight extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'highlights';

    protected $fillable = [
        'user_id',
        'post_id',
        'text',
        'start_offset',
        'end_offset',
        'color',
    ];

    protected $casts = [
        'start_offset' => 'integer',
        'end_offset' => 'integer',
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
