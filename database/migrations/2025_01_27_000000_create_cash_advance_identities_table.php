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
        Schema::create('cash_advance_identities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('employee_id')->nullable(); // Nomor pegawai jika ada
            $table->string('department')->nullable(); // Departemen
            $table->text('address')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('type', ['employee', 'contractor', 'other'])->default('employee');
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->foreign('created_by')->references('id')
                ->on('users')
                ->onUpdate('cascade')
                ->onDelete('set null');

            $table->index(['name', 'email']);
            $table->index('employee_id');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_advance_identities');
    }
};
