<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Sertifikasi extends Model
{
    protected $connection = 'mongodb';

    protected $table = 'sertifikasi';

    protected $fillable = [
        'user_id',
        'bidang_keahlian',
        'file_sertifikat',
        'status',
        'alasan_penolakan',
    ];

    protected $attributes = [
        'status' => 'pending',
    ];
}
