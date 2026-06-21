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
        // Check if user_id column exists, if not add it
        if (!Schema::hasColumn('providers', 'user_id')) {
            Schema::table('providers', function ($table) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id');
            });
        }

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

        // Note: We don't drop the user_id column here as it might be used by other migrations
        // The column will be dropped by the alter_providers_add_store_id migration if needed
    }
};
