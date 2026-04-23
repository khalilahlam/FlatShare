<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Usuario;

class Mensaje extends Model
{
    protected $fillable = ['chat_id', 'usuario_id', 'contenido', 'leido'];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }
}