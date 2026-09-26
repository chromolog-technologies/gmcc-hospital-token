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
        Schema::table('bookings', function (Blueprint $table) {
            $table->index(['unit_id', 'booking_date', 'status'], 'idx_bookings_unit_date_status');
            $table->index(['user_id', 'booking_date', 'status'], 'idx_bookings_user_date_status');
            $table->index(['status', 'source', 'created_at'], 'idx_bookings_status_source_created');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex('idx_bookings_unit_date_status');
            $table->dropIndex('idx_bookings_user_date_status');
            $table->dropIndex('idx_bookings_status_source_created');
        });
    }
};
