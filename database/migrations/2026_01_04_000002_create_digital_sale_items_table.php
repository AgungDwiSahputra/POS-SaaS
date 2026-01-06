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
        Schema::create('digital_sale_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('digital_sale_id');
            $table->foreign('digital_sale_id')
                ->references('id')->on('digital_sales')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->unsignedBigInteger('digital_product_id');
            $table->foreign('digital_product_id')->references('id')
                ->on('digital_products')
                ->onDelete('cascade')
                ->onUpdate('cascade');
            $table->double('product_price')->nullable();
            $table->double('net_unit_price')->nullable();
            $table->integer('tax_type');
            $table->double('tax_value')->nullable();
            $table->double('tax_amount')->nullable();
            $table->integer('discount_type');
            $table->double('discount_value')->nullable();
            $table->double('discount_amount')->nullable();
            // NO sale_unit - digital products don't have units
            $table->double('quantity')->nullable()->default(1);
            $table->double('sub_total')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('digital_sale_items');
    }
};
