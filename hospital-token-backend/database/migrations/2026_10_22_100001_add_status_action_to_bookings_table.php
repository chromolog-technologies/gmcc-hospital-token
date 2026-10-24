<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Records WHO/WHAT last changed a booking's status, e.g.
     * admin_approved, admin_cancelled, user_cancelled, auto_approved,
     * doctor_completed, online_booked, offline_booked.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'status_action')) {
                $table->string('status_action', 50)->nullable()->after('status');
            }
            if (!Schema::hasColumn('bookings', 'status_action_at')) {
                $table->timestamp('status_action_at')->nullable()->after('status_action');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['status_action', 'status_action_at']);
        });
    }
};
