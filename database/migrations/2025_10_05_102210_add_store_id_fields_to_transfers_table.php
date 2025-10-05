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
        Schema::table('transfers', function (Blueprint $table) {
            $table->unsignedBigInteger('from_store_id')->nullable()->after('from_warehouse_id');
            $table->unsignedBigInteger('to_store_id')->nullable()->after('to_warehouse_id');

            $table->foreign('from_store_id')
                ->references('id')->on('stores')
                ->onUpdate('cascade')
                ->onDelete('set null');
            
            $table->foreign('to_store_id')
                ->references('id')->on('stores')
                ->onUpdate('cascade')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transfers', function (Blueprint $table) {
            $table->dropForeign(['from_store_id']);
            $table->dropForeign(['to_store_id']);
            $table->dropColumn(['from_store_id', 'to_store_id']);
        });
    }
};
