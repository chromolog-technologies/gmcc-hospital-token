<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add source column (online = app, offline = admin walk-in)
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('source', ['online', 'offline'])->default('online')->after('status');
        });

        // 2. Add 'followup' to the type enum (keeping 'normal' temporarily)
        DB::statement("ALTER TABLE bookings MODIFY COLUMN type ENUM('chemo', 'normal', 'followup') DEFAULT 'normal'");

        // 3. Migrate existing 'normal' records to 'followup'
        DB::table('bookings')->where('type', 'normal')->update(['type' => 'followup']);

        // 4. Remove 'normal' from enum, set followup as default
        DB::statement("ALTER TABLE bookings MODIFY COLUMN type ENUM('chemo', 'followup') DEFAULT 'followup'");

        // 5. Drop old unique constraint (unit + date + token, no type)
        //    The constraint did NOT include 'type', so chemo and followup shared token numbers.
        //    New system: 150 chemo + 150 followup = token numbers 1-150 per type → need type in key.
        Schema::table('bookings', function (Blueprint $table) {
            // Drop both potential constraints (created via inline unique and via named unique migration)
            try { $table->dropUnique('unique_unit_date_token'); } catch (\Exception $e) {}
            try { $table->dropUnique('bookings_unit_id_token_number_booking_date_unique'); } catch (\Exception $e) {}

            // New unique constraint: same token number can exist for chemo AND followup on same date/unit
            $table->unique(['unit_id', 'booking_date', 'type', 'token_number'], 'unique_unit_date_type_token');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropUnique('unique_unit_date_type_token');
            $table->dropColumn('source');
        });

        DB::statement("ALTER TABLE bookings MODIFY COLUMN type ENUM('chemo', 'normal') DEFAULT 'normal'");
        DB::table('bookings')->where('type', 'followup')->update(['type' => 'normal']);

        Schema::table('bookings', function (Blueprint $table) {
            $table->unique(['unit_id', 'booking_date', 'token_number'], 'unique_unit_date_token');
        });
    }
};
