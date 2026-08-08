<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Category extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'category';

    protected $table = 'category';

    protected $fillable = [
        'nama',
        'tingkat',
    ];

    protected $casts = [
        'tingkat' => 'integer',
    ];

    // Relationships
    public function posts()
    {
        return $this->hasMany(Post::class, 'category_id');
    }
}
