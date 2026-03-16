<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Piso extends Model
{
    protected $table = 'pisos';
    protected $guarded = [];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function fotos()
    {
        return $this->hasMany(Foto::class, 'piso_id');
    }
}