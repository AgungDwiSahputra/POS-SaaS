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
        Schema::table('cash_advances', function (Blueprint $table) {
            $table->unsignedBigInteger('identity_id')->nullable()->after('warehouse_id');
            $table->foreign('identity_id')->references('id')
                ->on('cash_advance_identities')
                ->onUpdate('cascade')
                ->onDelete('set null');
            $table->index('identity_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cash_advances', function (Blueprint $table) {
            $table->dropForeign(['identity_id']);
            $table->dropIndex(['identity_id']);
            $table->dropColumn('identity_id');
        });
    }
};
