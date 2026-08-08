<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Bookmark extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'bookmarks';

    protected $fillable = [
        'post_id',
        'user_id',
    ];
}
