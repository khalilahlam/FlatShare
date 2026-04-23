<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Usuario;


class Chat extends Model
{
    protected $fillable = ['piso_id'];

    public function piso()
    {
        return $this->belongsTo(Piso::class);
    }

    public function usuarios()
    {
        return $this->belongsToMany(Usuario::class, 'chat_usuarios', 'chat_id', 'usuario_id')
                    ->withTimestamps();
    }

    public function mensajes()
    {
        return $this->hasMany(Mensaje::class)->orderBy('created_at', 'asc');
    }

    public function ultimoMensaje()
    {
        return $this->hasOne(Mensaje::class)->latestOfMany();
    }
}