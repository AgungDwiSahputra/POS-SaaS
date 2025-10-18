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
        Schema::create('digital_products', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2);
            $table->string('download_link')->nullable();
            $table->string('license_key')->nullable();
            $table->date('expiry_date')->nullable();
            $table->integer('max_downloads')->default(0);
            $table->string('file_path')->nullable();
            $table->timestamps();

            // Foreign key constraint untuk multi-tenant
            $table->foreign('tenant_id')->references('id')->on('tenants')->onUpdate('cascade')->onDelete('cascade');

            // Indexes for performance
            $table->index(['tenant_id', 'code']);
            $table->index(['tenant_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('digital_products');
    }
};
