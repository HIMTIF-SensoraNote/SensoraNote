<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Post extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'post';

    protected $collection = 'post';

    protected $fillable = [
        'user_id',
        'topic_id',
        'category_id',
        'title',
        'content',
        'plain_content',
        'mapel',
        'jenjang',
        'kelas',
        'semester',
        'tags',
        'thumbnail',
        'thumbnail_fit',
        'description',
        'visibility',
        'is_verified',
        'likes_count',
        'comments_count',
        'is_rejected',
        'verify_reason',
        'expert_rating',
        'verified_by',
        'submitted_for_review',
    ];

    protected $attributes = [
        'visibility' => 'public',
        'is_verified' => false,
        'is_rejected' => false,
        'submitted_for_review' => false,
        'likes_count' => 0,
        'comments_count' => 0,
    ];

    protected $casts = [
        'likes_count' => 'integer',
        'comments_count' => 'integer',
        'tags' => 'array',
        'is_verified' => 'boolean',
        'is_rejected' => 'boolean',
        'submitted_for_review' => 'boolean',
    ];

    protected $appends = ['read_time'];

    public function getReadTimeAttribute()
    {
        $text = strip_tags($this->plain_content ?? $this->content ?? '');
        $wordCount = str_word_count($text);
        if ($wordCount == 0 && $text !== '') {
            $wordCount = count(preg_split('~[^\p{L}\p{N}\']+~u', $text, -1, PREG_SPLIT_NO_EMPTY));
        }
        $minutes = ceil($wordCount / 200);

        return max(1, (int) $minutes);
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function topic()
    {
        return $this->belongsTo(Topic::class, 'topic_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class, 'post_id');
    }

    public function likes()
    {
        return $this->hasMany(Like::class, 'post_id');
    }

    public function reports()
    {
        return $this->hasMany(Report::class, 'post_id');
    }
}
