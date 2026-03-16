<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario1_id');
            $table->unsignedBigInteger('usuario2_id');
            $table->timestamps();

            $table->foreign('usuario1_id')->references('id')->on('usuarios')->onDelete('cascade');
            $table->foreign('usuario2_id')->references('id')->on('usuarios')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};