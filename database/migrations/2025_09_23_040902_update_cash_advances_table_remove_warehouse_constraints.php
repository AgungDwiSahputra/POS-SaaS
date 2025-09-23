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
        Schema::table('cash_advances', function (Blueprint $table) {
            // Drop foreign key constraints first
            $table->dropForeign(['warehouse_id']);
            $table->dropForeign(['identity_id']);
            
            // Make warehouse_id nullable
            $table->bigInteger('warehouse_id')->nullable()->change();
            
            // Make identity_id NOT NULL since it's now required
            $table->bigInteger('identity_id')->nullable(false)->change();
            
            // Drop columns that are no longer needed
            $table->dropColumn(['issued_to_name', 'issued_to_phone', 'issued_to_email']);
        });
        
        // Re-add the identity_id foreign key constraint
        Schema::table('cash_advances', function (Blueprint $table) {
            $table->foreign('identity_id')->references('id')->on('cash_advance_identities')->onDelete('cascade')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
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
};
