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
        Schema::create('digital_topup_requests', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id'); // Multi-tenant isolation
            $table->string('request_code')->unique(); // Kode unik untuk request
            $table->foreignId('store_id')->constrained('stores')->onDelete('cascade'); // Store yang request
            $table->foreignId('digital_provider_id')->constrained('digital_providers')->onDelete('cascade'); // Provider yang akan di-topup
            $table->foreignId('requested_by')->constrained('users')->onDelete('cascade'); // User yang buat request
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null'); // User yang approve (super admin/owner)
            $table->decimal('amount', 15, 2); // Nominal top-up yang diminta
            $table->decimal('current_balance', 15, 2); // Saldo saat ini sebelum top-up
            $table->decimal('balance_after_topup', 15, 2); // Saldo setelah top-up
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending'); // Status request
            $table->text('reason')->nullable(); // Alasan top-up dari store
            $table->text('admin_notes')->nullable(); // Catatan dari admin yang approve/reject
            $table->string('payment_reference')->nullable(); // Referensi pembayaran ke owner
            $table->timestamp('approved_at')->nullable(); // Waktu approval
            $table->timestamp('completed_at')->nullable(); // Waktu top-up selesai
            $table->json('metadata')->nullable(); // Data tambahan dalam JSON format
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('digital_topup_requests');
    }
};
