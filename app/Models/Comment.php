<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Comment extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'comment';

    protected $fillable = [
        'post_id',
        'user_id',
        'content',
        'parent_comment_id',
        'quote_context',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id');
    }

    // Parent comment (for nested/reply comments)
    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_comment_id');
    }

    // Child replies
    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_comment_id');
    }
}
