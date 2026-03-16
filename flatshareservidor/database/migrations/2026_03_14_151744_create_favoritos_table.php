<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favoritos', function (Blueprint $table) {
            $table->unsignedBigInteger('usuario_id');
            $table->unsignedBigInteger('piso_id');
            $table->timestamps();

            $table->primary(['usuario_id', 'piso_id']);
            $table->foreign('usuario_id')->references('id')->on('usuarios')->onDelete('cascade');
            $table->foreign('piso_id')->references('id')->on('pisos')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favoritos');
    }
};