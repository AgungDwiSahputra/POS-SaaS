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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->foreign('product_id')->references('id')
                ->on('products')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->unsignedBigInteger('warehouse_id');
            $table->foreign('warehouse_id')->references('id')
                ->on('warehouses')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->double('quantity');
            $table->string('type'); // purchase, transfer_in, transfer_out, sale, etc.
            $table->string('reference_type'); // purchase, transfer, sale, etc.
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->double('old_hpp')->nullable();
            $table->double('new_hpp')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['product_id', 'warehouse_id']);
            $table->index(['reference_type', 'reference_id']);
            $table->index('type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};