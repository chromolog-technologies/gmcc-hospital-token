<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'unit_id',
        'type',
        'token_number',
        'booking_date',
        'status',
        'source',
        'status_action',
        'status_action_at',
    ];

    /**
     * Attributes recording who/what last changed the booking status
     * (admin_approved, admin_cancelled, user_cancelled, auto_approved, ...).
     * Returns [] until the status_action migration has been run, so writes
     * never fail on an older schema.
     */
    public static function statusActionAttributes(string $action): array
    {
        $supported = Cache::remember('bookings:has_status_action', now()->addMinutes(10), function () {
            try {
                return Schema::hasColumn('bookings', 'status_action');
            } catch (\Throwable $e) {
                return false;
            }
        });

        return $supported ? ['status_action' => $action, 'status_action_at' => now()] : [];
    }

    protected function casts(): array
    {
        return [
            'booking_date' => 'date:Y-m-d',
            'status_action_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
