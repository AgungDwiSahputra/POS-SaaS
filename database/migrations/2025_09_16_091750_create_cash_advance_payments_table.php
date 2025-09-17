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
        Schema::create('cash_advance_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cash_advance_id');
            $table->date('paid_on');
            $table->double('amount');
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('recorded_by')->nullable();
            $table->timestamps();

            $table->foreign('cash_advance_id')->references('id')
                ->on('cash_advances')->onDelete('cascade');
            $table->foreign('recorded_by')->references('id')
                ->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_advance_payments');
    }
};
