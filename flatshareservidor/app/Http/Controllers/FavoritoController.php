<?php

namespace App\Http\Controllers;

use App\Models\Favorito;
use Illuminate\Http\Request;

class FavoritoController extends Controller
{
    public function index(Request $request)
    {
        $favoritos = Favorito::where('usuario_id', $request->user()->id)
            ->pluck('piso_id');
        return response()->json($favoritos);
    }

    public function store(Request $request, $pisoId)
    {
        $existe = Favorito::where('usuario_id', $request->user()->id)
            ->where('piso_id', $pisoId)
            ->first();

        if ($existe) {
            return response()->json(['message' => 'Ya es favorito'], 409);
        }

        Favorito::create([
            'usuario_id' => $request->user()->id,
            'piso_id'    => $pisoId,
        ]);

        return response()->json(['message' => 'Añadido'], 201);
    }

    public function destroy(Request $request, $pisoId)
    {
        Favorito::where('usuario_id', $request->user()->id)
            ->where('piso_id', $pisoId)
            ->delete();

        return response()->json(['message' => 'Eliminado']);
    }
}