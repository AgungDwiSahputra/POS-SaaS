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
        Schema::create('digital_withdrawals', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id'); // Multi-tenant isolation
            $table->string('reference_code')->unique(); // Kode referensi unik untuk transaksi
            $table->date('date'); // Tanggal transaksi
            $table->foreignId('store_id')->constrained('stores')->onDelete('cascade'); // Store yang melakukan transaksi
            $table->foreignId('digital_provider_id')->constrained('digital_providers')->onDelete('cascade'); // Provider yang digunakan sebagai sumber dana
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // User yang melakukan transaksi
            $table->string('customer_name'); // Nama customer yang tarik tunai
            $table->string('customer_phone')->nullable(); // No HP customer
            $table->decimal('withdrawal_amount', 15, 2); // Nominal yang ditarik customer
            $table->decimal('admin_fee', 15, 2)->default(0); // Biaya admin (fleksibel)
            $table->decimal('total_amount', 15, 2); // Total = withdrawal_amount + admin_fee
            $table->decimal('provider_balance_before', 15, 2); // Saldo provider sebelum transaksi
            $table->decimal('provider_balance_after', 15, 2); // Saldo provider setelah transaksi
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('pending'); // Status transaksi
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
        Schema::dropIfExists('digital_withdrawals');
    }
};
