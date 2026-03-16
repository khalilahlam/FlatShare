<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Foto extends Model
{
    protected $table = 'fotos';
    protected $guarded = [];

    public function piso()
    {
        return $this->belongsTo(Piso::class, 'piso_id');
    }
}