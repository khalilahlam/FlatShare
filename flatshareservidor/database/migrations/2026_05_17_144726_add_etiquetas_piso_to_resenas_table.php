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
    Schema::table('resenas', function (Blueprint $table) {
        $table->json('etiquetas')->nullable()->after('comentario');
        $table->foreignId('piso_id')->nullable()->constrained('pisos')->nullOnDelete()->after('destinatario_id');
    });
}

public function down(): void
{
    Schema::table('resenas', function (Blueprint $table) {
        $table->dropColumn('etiquetas');
        $table->dropForeign(['piso_id']);
        $table->dropColumn('piso_id');
    });
}
};
