<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change source column from ENUM('online','offline') to VARCHAR(50)
        // so it can store 'offline-walkin', 'offline-staff', 'online', etc.
        try {
            DB::statement("ALTER TABLE bookings MODIFY COLUMN source VARCHAR(50) NOT NULL DEFAULT 'online'");
        } catch (\Exception $e) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->string('source', 50)->default('online')->change();
            });
        }
    }

    public function down(): void
    {
        try {
            DB::statement("ALTER TABLE bookings MODIFY COLUMN source ENUM('online', 'offline') NOT NULL DEFAULT 'online'");
        } catch (\Exception $e) {
            Schema::table('bookings', function (Blueprint $table) {
                $table->enum('source', ['online', 'offline'])->default('online')->change();
            });
        }
    }
};
