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
        // First, let's check what foreign keys exist and drop them safely
        $this->dropForeignKeysSafely();
        
        // Now modify the columns
        Schema::table('cash_advances', function (Blueprint $table) {
            // Make warehouse_id nullable
            $table->bigInteger('warehouse_id')->nullable()->change();
            
            // Make identity_id NOT NULL and UNSIGNED to match cash_advance_identities.id
            $table->unsignedBigInteger('identity_id')->nullable(false)->change();
        });
        
        // Drop columns that are no longer needed (if they exist)
        $this->dropColumnsSafely();
        
        // Re-add the identity_id foreign key constraint with CASCADE
        Schema::table('cash_advances', function (Blueprint $table) {
            $table->foreign('identity_id')->references('id')->on('cash_advance_identities')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the foreign key constraint
        Schema::table('cash_advances', function (Blueprint $table) {
            $table->dropForeign(['identity_id']);
        });
        
        Schema::table('cash_advances', function (Blueprint $table) {
            // Add back the columns
            $table->string('issued_to_name');
            $table->string('issued_to_phone')->nullable();
            $table->string('issued_to_email')->nullable();
            
            // Make warehouse_id NOT NULL again
            $table->bigInteger('warehouse_id')->nullable(false)->change();
            
            // Make identity_id nullable again
            $table->bigInteger('identity_id')->nullable()->change();
            
            // Add back foreign key constraint
            $table->foreign('warehouse_id')->references('id')->on('warehouses')->onDelete('cascade')->onUpdate('cascade');
        });
    }
    
    /**
     * Safely drop foreign keys if they exist
     */
    private function dropForeignKeysSafely(): void
    {
        try {
            // Drop warehouse_id foreign key if it exists
            Schema::table('cash_advances', function (Blueprint $table) {
                $table->dropForeign(['warehouse_id']);
            });
        } catch (Exception $e) {
            // Foreign key doesn't exist, continue
        }
        
        try {
            // Drop identity_id foreign key if it exists
            Schema::table('cash_advances', function (Blueprint $table) {
                $table->dropForeign(['identity_id']);
            });
        } catch (Exception $e) {
            // Foreign key doesn't exist, continue
        }
    }
    
    /**
     * Safely drop columns if they exist
     */
    private function dropColumnsSafely(): void
    {
        $columnsToDrop = ['issued_to_name', 'issued_to_phone', 'issued_to_email'];
        
        foreach ($columnsToDrop as $column) {
            try {
                Schema::table('cash_advances', function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                });
            } catch (Exception $e) {
                // Column doesn't exist, continue
            }
        }
    }
};