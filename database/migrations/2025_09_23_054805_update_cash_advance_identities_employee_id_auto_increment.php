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
        Schema::table('cash_advance_identities', function (Blueprint $table) {
            // Make employee_id unique but not auto-increment
            $table->unique('employee_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cash_advance_identities', function (Blueprint $table) {
            // Remove unique constraint
            $table->dropUnique(['employee_id']);
        });
    }
};