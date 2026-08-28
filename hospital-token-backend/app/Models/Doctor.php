<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Doctor extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'qualification',
        'username',
        'password',
        'department',
        'phone',
        'gender',
        'regno',
        'photo',
        'unit_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Include photo_url in every serialised response (toArray / toJson).
     */
    protected $appends = ['photo_url'];

    /**
     * Returns the publicly accessible URL for the doctor's photo.
     * Images are stored in public/storage/doctors/ and served directly
     * without relying on a symlink (required for Hostinger shared hosting).
     */
    public function getPhotoUrlAttribute(): ?string
    {
        if (!$this->photo) {
            return null;
        }
        $appUrl = rtrim(config('app.url'), '/');
        return $appUrl . '/storage/' . ltrim($this->photo, '/');
    }

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
