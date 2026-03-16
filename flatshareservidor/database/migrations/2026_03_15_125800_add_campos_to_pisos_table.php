<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pisos', function (Blueprint $table) {
            $table->integer('habitaciones')->default(1)->after('num_companeros');
            $table->integer('banos')->default(1)->after('habitaciones');
            $table->integer('metros')->default(0)->after('banos');
            $table->boolean('amueblado')->default(false)->after('metros');
        });
    }

    public function down(): void
    {
        Schema::table('pisos', function (Blueprint $table) {
            $table->dropColumn(['habitaciones', 'banos', 'metros', 'amueblado']);
        });
    }
};