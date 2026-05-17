<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resena extends Model
{
    protected $table = 'resenas';
    protected $fillable = [
        'autor_id',
        'destinatario_id',
        'piso_id',
        'puntuacion',
        'comentario',
        'etiquetas',
    ];

    protected function casts(): array
    {
        return [
            'etiquetas' => 'array',
        ];
    }

    public function autor()
    {
        return $this->belongsTo(User::class, 'autor_id')
                    ->select(['id', 'nombre', 'apellidos', 'foto_perfil', 'propietario']);
    }

    public function destinatario()
    {
        return $this->belongsTo(User::class, 'destinatario_id')
                    ->select(['id', 'nombre', 'apellidos', 'foto_perfil', 'propietario']);
    }

    public function piso()
    {
        return $this->belongsTo(Piso::class)->select(['id', 'titulo']);
    }
}