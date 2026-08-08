<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Topic extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'topic';

    protected $fillable = [
        'name',
        'deskripsi',
    ];

    // Relationships
    public function posts()
    {
        return $this->hasMany(Post::class, 'topic_id');
    }
}
