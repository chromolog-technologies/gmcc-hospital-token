<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Hospital;
use App\Models\Doctor;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Admin User (Hospital Table)
        Hospital::create([
            'name' => 'Admin User',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password123'),
        ]);

        // 2. Create Test Doctor
        Doctor::create([
            'name' => 'Dr. Test Doctor',
            'username' => 'testdoctor',
            'password' => Hash::make('password123'),
            'department' => 'General Medicine',
        ]);

        // 3. Create Test User (Patient)
        User::create([
            'name' => 'Test User',
            'crno' => '9900001',
            'user_age' => 30,
            'user_gender' => 'Male',
        ]);
    }
}
