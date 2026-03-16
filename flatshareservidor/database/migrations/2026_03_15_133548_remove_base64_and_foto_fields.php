<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fotos', function (Blueprint $table) {
            $table->dropColumn('base64');
        });

        Schema::table('pisos', function (Blueprint $table) {
            $table->dropColumn('foto');
        });
    }

    public function down(): void
    {
        Schema::table('fotos', function (Blueprint $table) {
            $table->longText('base64')->nullable();
        });

        Schema::table('pisos', function (Blueprint $table) {
            $table->longText('foto')->nullable();
        });
    }
};
