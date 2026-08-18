<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Unit extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'day',
        'time',
        'start_time',
        'slot_duration',
    ];

    protected $appends = ['doctor'];

    public function getDoctorAttribute()
    {
        // Return the first doctor of this unit for backward compatibility
        return $this->doctors->first();
    }

    public function doctors()
    {
        return $this->hasMany(Doctor::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
