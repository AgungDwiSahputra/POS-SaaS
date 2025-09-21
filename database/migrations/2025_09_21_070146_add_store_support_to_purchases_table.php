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
        Schema::table('purchases', function (Blueprint $table) {
            // Add store support columns
            $table->unsignedBigInteger('from_store_id')->nullable()->after('warehouse_id');
            
            // Add purchase type to distinguish between regular purchase and store-to-store purchase
            $table->tinyInteger('purchase_type')->default(1)->after('from_store_id')
                  ->comment('1=regular_purchase, 2=store_to_warehouse_purchase');
            
            // Add foreign key constraint
            $table->foreign('from_store_id')->references('id')->on('stores')
                  ->onUpdate('cascade')->onDelete('cascade');
            
            // Add indexes for performance
            $table->index(['from_store_id', 'warehouse_id']);
            $table->index(['purchase_type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['from_store_id']);
            
            // Drop indexes
            $table->dropIndex(['from_store_id', 'warehouse_id']);
            $table->dropIndex(['purchase_type', 'status']);
            
            // Drop columns
            $table->dropColumn(['from_store_id', 'purchase_type']);
        });
    }
};
