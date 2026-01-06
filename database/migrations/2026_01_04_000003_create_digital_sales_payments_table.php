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
        Schema::create('digital_sales_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('digital_sale_id');
            $table->foreign('digital_sale_id')
                ->references('id')->on('digital_sales')
                ->onUpdate('cascade')
                ->onDelete('cascade');
            $table->date('payment_date');
            $table->integer('payment_type')->nullable();
            $table->double('amount')->nullable();
            $table->string('reference')->nullable();
            $table->double('received_amount')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('digital_sales_payments');
    }
};
