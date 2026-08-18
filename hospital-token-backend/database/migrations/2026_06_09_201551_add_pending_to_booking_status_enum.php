<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (config('database.default') === 'mysql') {
            DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('active', 'cancelled', 'completed', 'pending') NOT NULL DEFAULT 'active'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (config('database.default') === 'mysql') {
            DB::statement("ALTER TABLE bookings MODIFY COLUMN status ENUM('active', 'cancelled', 'completed') NOT NULL DEFAULT 'active'");
        }
    }
};
