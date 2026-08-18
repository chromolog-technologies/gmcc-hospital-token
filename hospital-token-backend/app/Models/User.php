<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    protected $fillable = [
        'crno',
        'name',
        'user_age',
        'user_gender',
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Format CRNO from format "number/year" to "YY0000X"
     * Example: "1/2021" -> "2100001"
     * Example: "35/2026" -> "2600035"
     */
    public static function formatCrno($crno)
    {
        $crno = trim($crno);
        if (str_contains($crno, '/')) {
            $parts = explode('/', $crno);
            if (count($parts) === 2) {
                $number = (int)$parts[0];
                $year = trim($parts[1]);
                
                if (strlen($year) === 4) {
                    $shortYear = substr($year, 2, 2);
                    $paddedNumber = str_pad($number, 5, '0', STR_PAD_LEFT);
                    return $shortYear . $paddedNumber;
                }
            }
        }
        return $crno;
    }
}
