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
        Schema::create('digital_transaction_audits', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->unsignedBigInteger('store_id');
            $table->unsignedBigInteger('digital_provider_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('transaction_type', ['sale', 'topup', 'withdrawal', 'adjustment']);
            $table->string('transaction_id');
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->string('description')->nullable();
            $table->json('metadata')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['tenant_id', 'store_id']);
            $table->index(['tenant_id', 'digital_provider_id']);
            $table->index(['tenant_id', 'transaction_type']);
            $table->index(['tenant_id', 'created_at']);

            // Foreign keys (uncomment if you want to enforce referential integrity)
            // $table->foreign('store_id')->references('id')->on('stores')->onDelete('cascade');
            // $table->foreign('digital_provider_id')->references('id')->on('digital_providers')->onDelete('cascade');
            // $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('digital_transaction_audits');
    }
};
