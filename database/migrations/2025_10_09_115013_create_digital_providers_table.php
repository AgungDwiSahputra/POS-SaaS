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
        Schema::create('digital_providers', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nama provider (DANA, GoPay, OVO, dll)
            $table->string('code')->unique(); // Kode unik provider (DANA, GOPAY, OVO)
            $table->text('description')->nullable(); // Deskripsi provider
            $table->string('logo')->nullable(); // Path logo provider
            $table->boolean('is_active')->default(true); // Status aktif/tidak
            $table->json('settings')->nullable(); // Pengaturan tambahan dalam JSON format
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('digital_providers');
    }
};
