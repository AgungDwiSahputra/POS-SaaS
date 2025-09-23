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
        // First, check if the foreign key constraint already exists
        $this->addForeignKeyConstraintIfNotExists();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            Schema::table('cash_advances', function (Blueprint $table) {
                $table->dropForeign(['identity_id']);
            });
        } catch (Exception $e) {
            // Foreign key doesn't exist, continue
        }
    }
    
    /**
     * Add foreign key constraint if it doesn't exist
     */
    private function addForeignKeyConstraintIfNotExists(): void
    {
        try {
            // Check if foreign key already exists
            $foreignKeys = DB::select("
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'cash_advances' 
                AND COLUMN_NAME = 'identity_id' 
                AND REFERENCED_TABLE_NAME = 'cash_advance_identities'
            ");
            
            if (empty($foreignKeys)) {
                // Add the foreign key constraint
                Schema::table('cash_advances', function (Blueprint $table) {
                    $table->foreign('identity_id')->references('id')->on('cash_advance_identities')->onDelete('cascade')->onUpdate('cascade');
                });
                
                \Log::info('Foreign key constraint added successfully');
            } else {
                \Log::info('Foreign key constraint already exists');
            }
            
        } catch (Exception $e) {
            \Log::error('Error adding foreign key constraint', [
                'error' => $e->getMessage()
            ]);
            
            // Try alternative approach - use raw SQL
            try {
                DB::statement('ALTER TABLE cash_advances ADD CONSTRAINT cash_advances_identity_id_foreign FOREIGN KEY (identity_id) REFERENCES cash_advance_identities(id) ON DELETE CASCADE ON UPDATE CASCADE');
                \Log::info('Foreign key constraint added using raw SQL');
            } catch (Exception $e2) {
                \Log::error('Failed to add foreign key constraint with raw SQL', [
                    'error' => $e2->getMessage()
                ]);
                throw $e2;
            }
        }
    }
};