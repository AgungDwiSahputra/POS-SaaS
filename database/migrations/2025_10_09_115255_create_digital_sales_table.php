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
            $table->string('tenant_id'); // Multi-tenant isolation
            $table->string('reference_code')->unique(); // Kode referensi unik untuk transaksi
            $table->date('date'); // Tanggal transaksi
            $table->foreignId('store_id')->constrained('stores')->onDelete('cascade'); // Store yang melakukan transaksi
            $table->foreignId('digital_provider_id')->constrained('digital_providers')->onDelete('cascade'); // Provider yang digunakan
            $table->foreignId('digital_product_id')->constrained('digital_products')->onDelete('cascade'); // Produk yang dijual
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // User yang melakukan transaksi
            $table->string('customer_name')->nullable(); // Nama customer (opsional)
            $table->string('customer_phone')->nullable(); // No HP customer (opsional)
            $table->decimal('cost_price', 15, 2); // Harga beli dari provider
            $table->decimal('sell_price', 15, 2); // Harga jual ke customer
            $table->decimal('margin', 15, 2); // Margin = sell_price - cost_price
            $table->decimal('provider_balance_before', 15, 2); // Saldo provider sebelum transaksi
            $table->decimal('provider_balance_after', 15, 2); // Saldo provider setelah transaksi
            $table->string('provider_transaction_id')->nullable(); // ID transaksi dari provider eksternal
            $table->string('customer_transaction_id')->nullable(); // ID transaksi untuk customer
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled'])->default('pending'); // Status transaksi
            $table->text('notes')->nullable(); // Catatan tambahan
            $table->json('transaction_data')->nullable(); // Data transaksi tambahan dalam JSON
            $table->timestamp('completed_at')->nullable(); // Waktu transaksi selesai
            $table->timestamps();
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
