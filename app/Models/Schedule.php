<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Schedule extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'schedules';

    protected $fillable = [
        'user_id',
        'date',            // Format: YYYY-MM-DD
        'items',           // Array of tasks/activities: [{ id, time_start, time_end, title, category, priority, is_completed }]
        'raw_prompt',      // Transkripsi suara asli
        'summary',         // Ringkasan motivasi / fokus belajar dari AI
        'is_published',    // Boolean apakah sudah diupload ke catatan publik
        'published_post_id',
    ];

    protected $casts = [
        'items' => 'array',
        'is_published' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

