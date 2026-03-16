<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resenas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('autor_id');
            $table->unsignedBigInteger('destinatario_id');
            $table->integer('puntuacion');
            $table->text('comentario')->nullable();
            $table->timestamps();

            $table->foreign('autor_id')->references('id')->on('usuarios')->onDelete('cascade');
            $table->foreign('destinatario_id')->references('id')->on('usuarios')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resenas');
    }
};