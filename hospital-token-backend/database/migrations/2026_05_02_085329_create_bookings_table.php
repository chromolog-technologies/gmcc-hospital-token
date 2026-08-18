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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id(); // Replaces tbl_booking_id
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Replaces tbl_booking_crno & tbl_booking_name (normalized)
            $table->foreignId('unit_id')->constrained()->cascadeOnDelete(); // Replaces tbl_unit_id
            $table->integer('token_number'); // Replaces tbl_token_number
            $table->date('booking_date'); // Replaces tbl_booking_date
            $table->enum('status', ['active', 'cancelled', 'completed'])->default('active'); // Replaces tbl_booking_status
            $table->timestamps();
            
            // Unique token per unit per day
            $table->unique(['unit_id', 'token_number', 'booking_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
