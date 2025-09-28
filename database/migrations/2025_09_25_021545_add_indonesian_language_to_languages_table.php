<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add Indonesian language to the languages table
        DB::table('languages')->insert([
            'name' => 'Indonesian',
            'iso_code' => 'id',
            'is_default' => false,
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove Indonesian language from the languages table
        DB::table('languages')->where('iso_code', 'id')->delete();
    }
};
