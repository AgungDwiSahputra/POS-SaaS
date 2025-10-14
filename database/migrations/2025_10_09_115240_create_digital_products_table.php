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
            $table->string('tenant_id'); // Multi-tenant isolation
            $table->string('name'); // Nama produk digital (Pulsa 10K, Paket Data 5GB, dll)
            $table->string('code')->unique(); // Kode unik produk
            $table->string('product_code')->unique(); // Kode produk untuk barcode/identifikasi
            $table->text('description')->nullable(); // Deskripsi produk
            $table->string('category'); // Kategori produk (pulsa, paket_data, voucher, dll)
            $table->decimal('cost_price', 15, 2); // Harga beli/cost (harga dari provider)
            $table->decimal('sell_price', 15, 2); // Harga jual (harga ke customer)
            $table->decimal('margin', 15, 2)->nullable(); // Margin = sell_price - cost_price
            $table->string('provider_code')->nullable(); // Kode produk di provider eksternal
            $table->json('product_data')->nullable(); // Data tambahan produk dalam JSON (untuk API provider)
            $table->boolean('is_active')->default(true); // Status aktif/tidak
            $table->integer('sort_order')->default(0); // Urutan untuk sorting
            $table->timestamps();
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
