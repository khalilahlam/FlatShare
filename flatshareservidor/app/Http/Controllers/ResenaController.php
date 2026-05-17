<?php

namespace App\Http\Controllers;

use App\Models\Resena;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ResenaController extends Controller
{
    // GET /api/resenas/{usuarioId} — reseñas recibidas por un usuario
    public function index($usuarioId)
    {
        $resenas = Resena::with(['autor', 'piso'])
            ->where('destinatario_id', $usuarioId)
            ->orderByDesc('created_at')
            ->get();

        $media = $resenas->avg('puntuacion');

        return response()->json([
            'resenas' => $resenas,
            'media'   => round($media, 1),
            'total'   => $resenas->count(),
        ]);
    }

    // GET /api/resenas/puedo-resena/{usuarioId}
    // Comprueba si el auth puede reseñar a ese usuario
    public function puedoResena($usuarioId)
    {
        $authId = auth()->id();

        if ($authId == $usuarioId) {
            return response()->json(['puede' => false]);
        }

        // Ya existe reseña de este auth a ese usuario (cualquier piso)
        $yaReseno = Resena::where('autor_id', $authId)
            ->where('destinatario_id', $usuarioId)
            ->exists();

        if ($yaReseno) {
            return response()->json(['puede' => false, 'motivo' => 'ya_resenado']);
        }

        // Comprobar que han coincidido: el auth aceptó al usuario en su piso
        // o el usuario aceptó al auth en su piso
        $hanCoincidido = DB::table('interesados')
            ->where(function ($q) use ($authId, $usuarioId) {
                // auth es propietario, usuarioId es inquilino aceptado
                $q->whereIn('piso_id', function ($sub) use ($authId) {
                    $sub->select('id')->from('pisos')->where('usuario_id', $authId);
                })->where('usuario_id', $usuarioId)->where('estado', 'aceptado');
            })
            ->orWhere(function ($q) use ($authId, $usuarioId) {
                // usuarioId es propietario, auth es inquilino aceptado
                $q->whereIn('piso_id', function ($sub) use ($usuarioId) {
                    $sub->select('id')->from('pisos')->where('usuario_id', $usuarioId);
                })->where('usuario_id', $authId)->where('estado', 'aceptado');
            })
            ->exists();

        return response()->json(['puede' => $hanCoincidido]);
    }

    // POST /api/resenas
    public function store(Request $request)
    {
        $request->validate([
            'destinatario_id' => 'required|exists:users,id',
            'piso_id'         => 'nullable|exists:pisos,id',
            'puntuacion'      => 'required|integer|min:1|max:5',
            'comentario'      => 'nullable|string|max:500',
            'etiquetas'       => 'nullable|array',
            'etiquetas.*'     => 'string|max:50',
        ]);

        $authId = auth()->id();

        if ($authId == $request->destinatario_id) {
            return response()->json(['error' => 'No puedes reseñarte a ti mismo'], 422);
        }

        $existe = Resena::where('autor_id', $authId)
            ->where('destinatario_id', $request->destinatario_id)
            ->exists();

        if ($existe) {
            return response()->json(['error' => 'Ya has reseñado a este usuario'], 422);
        }

        $resena = Resena::create([
            'autor_id'        => $authId,
            'destinatario_id' => $request->destinatario_id,
            'piso_id'         => $request->piso_id,
            'puntuacion'      => $request->puntuacion,
            'comentario'      => $request->comentario,
            'etiquetas'       => $request->etiquetas ?? [],
        ]);

        return response()->json($resena->load('autor', 'piso'), 201);
    }

    // DELETE /api/resenas/{id}
    public function destroy($id)
    {
        $resena = Resena::findOrFail($id);

        if ($resena->autor_id !== auth()->id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $resena->delete();
        return response()->json(['ok' => true]);
    }
}