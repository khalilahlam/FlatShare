<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fotos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('piso_id');
            $table->string('url');
            $table->timestamps();

            $table->foreign('piso_id')->references('id')->on('pisos')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fotos');
    }
};