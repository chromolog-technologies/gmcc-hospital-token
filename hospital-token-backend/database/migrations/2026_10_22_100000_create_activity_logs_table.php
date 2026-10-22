<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Login / activity audit trail for admins, doctors and patients.
     * Rows older than ActivityLog::RETENTION_DAYS are pruned automatically.
     */
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('actor_type', 20);                 // admin | doctor | patient | system
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->string('actor_name')->nullable();          // snapshot (name / email / crno / regno)
            $table->string('action', 50);                      // login, login_failed, logout, booking_*
            $table->string('description')->nullable();
            $table->string('subject_type', 50)->nullable();    // e.g. 'booking'
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('platform', 20)->nullable();        // web | android | ios | server
            $table->string('ip_address', 45)->nullable();
            $table->string('location')->nullable();            // "City, Region, Country"
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('browser', 100)->nullable();
            $table->string('os', 100)->nullable();
            $table->string('device', 150)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('device_info')->nullable();           // raw client-supplied system info
            $table->json('meta')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('created_at');
            $table->index(['actor_type', 'actor_id']);
            $table->index('action');
            $table->index(['subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
