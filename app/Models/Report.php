<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Report extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'report';

    protected $fillable = [
        'reporter_id',
        'reported_user_id',
        'post_id',
        'comment_id',
        'reason',
        'description',
        'status',
        'admin_note',
    ];

    protected $attributes = [
        'status' => 'pending',
    ];

    // Relationships
    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id');
    }
}
