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
        Schema::table('digital_products', function (Blueprint $table) {
            $table->dropColumn(['download_link', 'license_key', 'max_downloads']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('digital_products', function (Blueprint $table) {
            $table->string('download_link')->nullable()->after('price');
            $table->string('license_key')->nullable()->after('download_link');
            $table->integer('max_downloads')->default(0)->after('expiry_date');
        });
    }
};
