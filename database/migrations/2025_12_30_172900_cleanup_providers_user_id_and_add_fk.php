<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Delete providers where user_id doesn't exist in users table
        DB::statement("
            DELETE FROM providers
            WHERE user_id IS NOT NULL
            AND user_id NOT IN (SELECT id FROM users)
        ");

        // Add foreign key to users table
        Schema::table('providers', function ($table) {
            $table->foreign('user_id')
                ->references('id')->on('users')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop foreign key
        Schema::table('providers', function ($table) {
            $table->dropForeign(['user_id']);
        });
    }
};
