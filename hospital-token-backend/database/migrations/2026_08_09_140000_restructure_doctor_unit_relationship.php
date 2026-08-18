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
        // 1. Add unit_id to doctors table
        Schema::table('doctors', function (Blueprint $table) {
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
        });

        // 2. Ensure the 3 fixed units exist in units table
        $units = [
            [
                'id' => 1,
                'name' => 'Radiation Oncology - Unit 1',
                'day' => 'Monday, Wednesday',
                'start_time' => '09:00:00',
                'slot_duration' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Radiation Oncology - Unit 2',
                'day' => 'Tuesday, Friday',
                'start_time' => '09:00:00',
                'slot_duration' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Radiation Oncology - Unit 3',
                'day' => 'Thursday, Saturday',
                'start_time' => '09:00:00',
                'slot_duration' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($units as $unit) {
            // Check if unit exists
            $exists = DB::table('units')->where('id', $unit['id'])->exists();
            if (!$exists) {
                DB::table('units')->insert($unit);
            } else {
                DB::table('units')->where('id', $unit['id'])->update([
                    'name' => $unit['name'],
                    'day' => $unit['day'],
                    'start_time' => $unit['start_time'],
                    'slot_duration' => $unit['slot_duration'],
                ]);
            }
        }

        // 3. Migrate existing doctor-unit assignments
        $existingAssignments = DB::table('units')->whereNotNull('doctor_id')->get();
        foreach ($existingAssignments as $assignment) {
            DB::table('doctors')
                ->where('id', $assignment->doctor_id)
                ->update(['unit_id' => $assignment->id]);
        }

        // 4. Drop doctor_id from units table
        Schema::table('units', function (Blueprint $table) {
            // Drop foreign key first
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['doctor_id']);
            }
            $table->dropColumn('doctor_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Add doctor_id back to units table
        Schema::table('units', function (Blueprint $table) {
            $table->foreignId('doctor_id')->nullable()->constrained('doctors')->nullOnDelete();
        });

        // 2. Rollback assignments
        $doctors = DB::table('doctors')->whereNotNull('unit_id')->get();
        foreach ($doctors as $doctor) {
            DB::table('units')
                ->where('id', $doctor->unit_id)
                ->update(['doctor_id' => $doctor->id]);
        }

        // 3. Drop unit_id from doctors table
        Schema::table('doctors', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['unit_id']);
            }
            $table->dropColumn('unit_id');
        });
    }
};
