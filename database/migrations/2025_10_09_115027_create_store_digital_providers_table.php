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
        Schema::create('store_digital_providers', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id'); // Multi-tenant isolation
            $table->foreignId('store_id')->constrained('stores')->onDelete('cascade'); // Reference ke tabel stores
            $table->foreignId('digital_provider_id')->constrained('digital_providers')->onDelete('cascade'); // Reference ke tabel digital_providers
            $table->decimal('balance', 15, 2)->default(0); // Saldo dalam Rupiah (IDR)
            $table->boolean('is_active')->default(true); // Status aktif/tidak untuk store ini
            $table->json('settings')->nullable(); // Pengaturan khusus untuk provider di store ini
            $table->timestamp('last_topup_at')->nullable(); // Waktu top-up terakhir
            $table->decimal('last_topup_amount', 15, 2)->nullable(); // Nominal top-up terakhir
            $table->timestamps();

            // Unique constraint untuk kombinasi store_id dan digital_provider_id
            $table->unique(['store_id', 'digital_provider_id'], 'unique_store_provider');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_digital_providers');
    }
};
