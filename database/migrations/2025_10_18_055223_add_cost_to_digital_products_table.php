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
        Schema::table('digital_products', function (Blueprint $table) {
            $table->decimal('cost', 15, 2)->default(0.00)->after('price');
            
            // Add index for better sorting performance
            $table->index(['tenant_id', 'cost']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('digital_products', function (Blueprint $table) {
            // Check if index exists before dropping
            if (Schema::hasIndex('digital_products', 'digital_products_tenant_id_cost_index')) {
                $table->dropIndex(['tenant_id', 'cost']);
            }
            $table->dropColumn('cost');
        });
    }
};
