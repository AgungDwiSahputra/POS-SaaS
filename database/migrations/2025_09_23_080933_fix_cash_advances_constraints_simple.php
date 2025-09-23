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
        // First, clean up invalid data before adding constraints
        $this->cleanupInvalidData();
        
        // Then, check if the foreign key constraint already exists
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
     * Clean up invalid data before adding foreign key constraints
     */
    private function cleanupInvalidData(): void
    {
        try {
            // Get all valid identity IDs
            $validIdentityIds = DB::table('cash_advance_identities')->pluck('id')->toArray();
            
            \Log::info('Valid identity IDs found: ' . implode(', ', $validIdentityIds));
            
            if (empty($validIdentityIds)) {
                \Log::warning('No cash advance identities found. Deleting all cash advances.');
                // If no identities exist, delete all cash advances
                DB::table('cash_advances')->delete();
                return;
            }
            
            // Find cash advances with invalid identity_id
            $invalidCashAdvances = DB::table('cash_advances')
                ->whereNotIn('identity_id', $validIdentityIds)
                ->whereNotNull('identity_id')
                ->get();
            
            if ($invalidCashAdvances->count() > 0) {
                \Log::warning('Found invalid cash advances with identity_id not in cash_advance_identities', [
                    'count' => $invalidCashAdvances->count(),
                    'invalid_ids' => $invalidCashAdvances->pluck('identity_id')->toArray(),
                    'valid_ids' => $validIdentityIds
                ]);
                
                // Delete invalid records
                $deletedCount = DB::table('cash_advances')
                    ->whereNotIn('identity_id', $validIdentityIds)
                    ->whereNotNull('identity_id')
                    ->delete();
                
                \Log::info("Deleted {$deletedCount} invalid cash advances");
            }
            
            // Handle NULL identity_id values
            $nullIdentityCount = DB::table('cash_advances')->whereNull('identity_id')->count();
            
            if ($nullIdentityCount > 0) {
                \Log::warning("Found {$nullIdentityCount} cash advances with NULL identity_id");
                
                if (!empty($validIdentityIds)) {
                    // Set NULL identity_id to the first valid identity
                    $defaultIdentityId = $validIdentityIds[0];
                    $updatedCount = DB::table('cash_advances')
                        ->whereNull('identity_id')
                        ->update(['identity_id' => $defaultIdentityId]);
                    
                    \Log::info("Updated {$updatedCount} cash advances with NULL identity_id to default identity {$defaultIdentityId}");
                } else {
                    // If no identities exist, delete cash advances with NULL identity_id
                    $deletedCount = DB::table('cash_advances')->whereNull('identity_id')->delete();
                    \Log::info("Deleted {$deletedCount} cash advances with NULL identity_id");
                }
            }
            
            // Final verification
            $remainingInvalid = DB::table('cash_advances')
                ->whereNotIn('identity_id', $validIdentityIds)
                ->whereNotNull('identity_id')
                ->count();
            
            if ($remainingInvalid > 0) {
                \Log::error("Still found {$remainingInvalid} invalid cash advances after cleanup");
                throw new Exception("Data cleanup failed. {$remainingInvalid} invalid records remain.");
            }
            
            \Log::info('Data cleanup completed successfully');
            
        } catch (Exception $e) {
            \Log::error('Error cleaning up invalid data in cash_advances migration', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
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