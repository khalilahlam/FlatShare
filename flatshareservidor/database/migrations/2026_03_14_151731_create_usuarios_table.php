<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('apellidos');
            $table->string('telefono', 15)->nullable();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('foto_perfil')->nullable();
            $table->text('descripcion')->nullable();
            $table->text('intereses')->nullable();
            $table->enum('rol', ['visitante', 'usuario', 'admin'])->default('usuario');
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};