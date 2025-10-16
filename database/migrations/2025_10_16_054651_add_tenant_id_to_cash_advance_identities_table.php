<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // add tenant_id column to cash_advance_identities table
        Schema::table('cash_advance_identities', function (Blueprint $table) {
            $table->unsignedBigInteger('tenant_id')->after('id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        })
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cash_advance_identities', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropColumn('tenant_id');
            $table->dropUnique(['employee_id']);
        });
    }
};
