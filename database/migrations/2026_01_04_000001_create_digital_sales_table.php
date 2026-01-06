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
        Schema::create('digital_sales', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->unsignedBigInteger('customer_id');
            $table->foreign('customer_id')->references('id')
                ->on('customers')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            // NO warehouse_id - digital sales don't need warehouse
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
            $table->text('note')->nullable();
            $table->string('reference_code')->nullable();
            $table->integer('status')->nullable();
            $table->integer('payment_status')->nullable();
            $table->boolean('is_sale_created')->default(false);
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->string('tenant_id')->nullable();
            $table->foreign('tenant_id')->references('id')->on('tenants')
                ->onUpdate('cascade')->onDelete('cascade');
            $table->timestamps();

            // Indexes
            $table->index(['tenant_id', 'reference_code']);
            $table->index(['tenant_id', 'date']);
            $table->index(['tenant_id', 'customer_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('digital_sales');
    }
};
