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
        Schema::table('transfer_items', function (Blueprint $table) {
            // destination_product_id: ID produk di tenant tujuan (untuk cross-store sync)
            $table->unsignedBigInteger('destination_product_id')
                ->nullable()
                ->after('product_id')
                ->comment('Product ID at destination tenant (for cross-store transfer)');
            
            // is_synced: Flag apakah produk di-sync cross-tenant
            $table->boolean('is_synced')
                ->default(false)
                ->after('destination_product_id')
                ->comment('Flag: whether product was synced across tenants');
            
            // Foreign key ke products table
            $table->foreign('destination_product_id')
                ->references('id')->on('products')
                ->onUpdate('cascade')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transfer_items', function (Blueprint $table) {
            $table->dropForeign(['destination_product_id']);
            $table->dropColumn(['destination_product_id', 'is_synced']);
        });
    }
};
