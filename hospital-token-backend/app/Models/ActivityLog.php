<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    /** Number of days log records are kept before being deleted. */
    const RETENTION_DAYS = 30;

    const UPDATED_AT = null;

    protected $fillable = [
        'actor_type',
        'actor_id',
        'actor_name',
        'action',
        'description',
        'subject_type',
        'subject_id',
        'platform',
        'ip_address',
        'location',
        'latitude',
        'longitude',
        'browser',
        'os',
        'device',
        'user_agent',
        'device_info',
        'meta',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'device_info' => 'array',
            'meta'        => 'array',
            'created_at'  => 'datetime',
        ];
    }
}
