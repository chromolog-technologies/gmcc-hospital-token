<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('units', function (Blueprint $table) {
            $table->time('start_time')->default('09:00:00')->after('name');
            $table->integer('slot_duration')->default(5)->after('start_time')->comment('Duration in minutes');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->time('slot_time')->nullable()->after('booking_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('units', function (Blueprint $table) {
            $table->dropColumn(['start_time', 'slot_duration']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('slot_time');
        });
    }
};
