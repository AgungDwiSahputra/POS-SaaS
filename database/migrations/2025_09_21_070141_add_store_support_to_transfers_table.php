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
        Schema::table('transfers', function (Blueprint $table) {
            // Add store support columns
            $table->unsignedBigInteger('from_store_id')->nullable()->after('to_warehouse_id');
            $table->unsignedBigInteger('to_store_id')->nullable()->after('from_store_id');
            
            // Add transfer type to distinguish between warehouse-to-warehouse and store operations
            $table->tinyInteger('transfer_type')->default(1)->after('to_store_id')
                  ->comment('1=warehouse_to_warehouse, 2=store_to_warehouse, 3=store_to_store');
            
            // Add foreign key constraints
            $table->foreign('from_store_id')->references('id')->on('stores')
                  ->onUpdate('cascade')->onDelete('cascade');
            $table->foreign('to_store_id')->references('id')->on('stores')
                  ->onUpdate('cascade')->onDelete('cascade');
            
            // Add indexes for performance
            $table->index(['from_store_id', 'to_store_id']);
            $table->index(['transfer_type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transfers', function (Blueprint $table) {
            // Drop foreign keys first
            $table->dropForeign(['from_store_id']);
            $table->dropForeign(['to_store_id']);
            
            // Drop indexes
            $table->dropIndex(['from_store_id', 'to_store_id']);
            $table->dropIndex(['transfer_type', 'status']);
            
            // Drop columns
            $table->dropColumn(['from_store_id', 'to_store_id', 'transfer_type']);
        });
    }
};
