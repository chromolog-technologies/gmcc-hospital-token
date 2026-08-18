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
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable()->after('name');
        });

        // Seed existing users with a hashed version of their crno
        $users = \DB::table('users')->get();
        foreach ($users as $user) {
            \DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'password' => \Hash::make($user->crno),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('password');
        });
    }
};
