<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pisos', function (Blueprint $table) {
            $table->string('ciudad')->nullable()->after('ubicacion');
        });
    }

    public function down(): void
    {
        Schema::table('pisos', function (Blueprint $table) {
            $table->dropColumn('ciudad');
        });
    }
};
