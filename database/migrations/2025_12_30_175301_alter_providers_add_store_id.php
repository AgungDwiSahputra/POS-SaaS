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
        // Step 1: Add store_id column
        Schema::table('providers', function ($table) {
            $table->unsignedBigInteger('store_id')->nullable()->after('id');
        });

        // Step 2: Update store_id based on user_id -> stores mapping
        DB::statement('
            UPDATE providers p
            INNER JOIN stores s ON s.user_id = p.user_id
            SET p.store_id = s.id
        ');

        // Step 3: Delete providers without valid store_id
        DB::statement('DELETE FROM providers WHERE store_id IS NULL');

        // Step 4: Drop user_id foreign key if exists
        try {
            Schema::table('providers', function ($table) {
                $table->dropForeign(['user_id']);
            });
        } catch (\Exception $e) {}

        // Step 5: Drop user_id column
        Schema::table('providers', function ($table) {
            $table->dropColumn('user_id');
        });

        // Step 6: Make store_id NOT NULL
        DB::statement('ALTER TABLE providers MODIFY COLUMN store_id BIGINT UNSIGNED NOT NULL');

        // Step 7: Add foreign key
        Schema::table('providers', function ($table) {
            $table->foreign('store_id')
                ->references('id')->on('stores')
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
            $table->dropForeign(['store_id']);
        });

        // Add user_id column back
        Schema::table('providers', function ($table) {
            $table->unsignedBigInteger('user_id')->nullable()->after('id');
        });

        // Map store_id back to user_id
        DB::statement('
            UPDATE providers p
            INNER JOIN stores s ON s.id = p.store_id
            SET p.user_id = s.user_id
        ');

        // Make user_id NOT NULL
        DB::statement('ALTER TABLE providers MODIFY COLUMN user_id BIGINT UNSIGNED NOT NULL');

        // Add foreign key to users
        Schema::table('providers', function ($table) {
            $table->foreign('user_id')
                ->references('id')->on('users')
                ->onUpdate('cascade')
                ->onDelete('cascade');
        });

        // Drop store_id column
        Schema::table('providers', function ($table) {
            $table->dropColumn('store_id');
        });
    }
};
