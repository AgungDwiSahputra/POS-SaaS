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
        Schema::table('digital_sales', function (Blueprint $table) {
            // Add digital_product_id column
            $table->unsignedBigInteger('digital_product_id')->nullable()->after('provider_id');
            $table->foreign('digital_product_id')->references('id')->on('digital_products')
                ->onUpdate('cascade')->onDelete('set null');

            // Add index for better query performance
            $table->index(['tenant_id', 'digital_product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('digital_sales', function (Blueprint $table) {
            $table->dropForeign(['digital_product_id']);
            $table->dropIndex(['tenant_id', 'digital_product_id']);
            $table->dropColumn('digital_product_id');
        });
    }
};
