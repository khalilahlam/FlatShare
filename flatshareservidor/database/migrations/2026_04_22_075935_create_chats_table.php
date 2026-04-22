<?php
 
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
 
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            // El piso al que pertenece este chat grupal
            $table->foreignId('piso_id')->constrained('pisos')->onDelete('cascade');
            $table->timestamps();
        });
 
        // Tabla pivot: qué usuarios pertenecen a cada chat
        Schema::create('chat_usuarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained('chats')->onDelete('cascade');
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['chat_id', 'usuario_id']);
        });
    }
 
    public function down(): void
    {
        Schema::dropIfExists('chat_usuarios');
        Schema::dropIfExists('chats');
    }
};
