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
            // Add new columns for provider-based transactions
            $table->unsignedBigInteger('provider_id')->nullable()->after('id');
            $table->foreign('provider_id')->references('id')->on('providers')
                ->onUpdate('cascade')->onDelete('cascade');

            $table->double('cost')->nullable()->after('provider_id'); // Biaya modal
            $table->double('price')->nullable()->after('cost'); // Harga jual
            $table->double('margin')->nullable()->after('price'); // Margin = price - cost
            $table->text('description')->nullable()->after('note'); // Description
        });

        // Remove old columns that are no longer needed
        Schema::table('digital_sales', function (Blueprint $table) {
            // Drop customer_id - not needed for provider transactions
            $table->dropForeign(['customer_id']);
            $table->dropColumn('customer_id');

            // Drop payment-related columns - not needed
            $table->dropColumn(['tax_rate', 'tax_amount', 'discount', 'discount_type', 'discount_value']);
            $table->dropColumn(['shipping', 'grand_total', 'received_amount', 'paid_amount']);
            $table->dropColumn(['payment_type', 'payment_status', 'is_sale_created']);

            // Drop old index that's no longer needed
            $table->dropIndex(['tenant_id', 'customer_id']);
        });

        // Add index for provider_id (check if schema supports it)
        $schemaManager = Schema::getConnection()->getDoctrineSchemaManager();
        $indexes = $schemaManager->listTableIndexes('digital_sales');

        if (!isset($indexes['digital_sales_tenant_id_provider_id_index'])) {
            Schema::table('digital_sales', function (Blueprint $table) {
                $table->index(['tenant_id', 'provider_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('digital_sales', function (Blueprint $table) {
            // Drop new columns
            $table->dropForeign(['provider_id']);
            $table->dropIndex(['tenant_id', 'provider_id']);
            $table->dropColumn(['provider_id', 'cost', 'price', 'margin', 'description']);

            // Restore old columns
            $table->unsignedBigInteger('customer_id')->nullable()->after('id');
            $table->foreign('customer_id')->references('id')->on('customers')
                ->onUpdate('cascade')->onDelete('cascade');

            $table->double('tax_rate')->nullable();
            $table->double('tax_amount')->nullable();
            $table->double('discount')->nullable();
            $table->integer('discount_type')->default(2);
            $table->double('discount_value')->default(0);
            $table->double('shipping')->nullable();
            $table->double('grand_total')->nullable();
            $table->double('received_amount')->nullable();
            $table->double('paid_amount')->nullable();
            $table->integer('payment_type')->nullable();
            $table->integer('payment_status')->nullable();
            $table->boolean('is_sale_created')->default(false);

            // Restore old index
            $table->index(['tenant_id', 'customer_id']);
        });
    }
};
