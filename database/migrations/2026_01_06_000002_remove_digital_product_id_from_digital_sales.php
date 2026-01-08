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
            // Drop foreign key if exists
            $table->dropForeign(['digital_product_id']);
            // Drop the column
            $table->dropColumn('digital_product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('digital_sales', function (Blueprint $table) {
            // Re-add the column for rollback
            $table->foreignId('digital_product_id')->nullable()->constrained('digital_products')->nullOnDelete();
        });
    }
};
