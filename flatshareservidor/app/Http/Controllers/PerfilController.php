<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PerfilController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'nombre'          => 'sometimes|string|max:100',
            'apellidos'       => 'sometimes|string|max:100',
            'telefono'        => 'sometimes|string|max:20',
            'ciudad'          => 'sometimes|string|max:100',
            'descripcion'     => 'sometimes|string',
            'intereses'       => 'sometimes|string',
            'fecha_nacimiento' => 'sometimes|date',
        ]);

        $user->update($request->only([
            'nombre', 'apellidos', 'telefono', 'ciudad',
            'descripcion', 'intereses', 'fecha_nacimiento'
        ]));

        return response()->json($user);
    }

    public function updateFoto(Request $request)
    {
        $request->validate([
            'foto' => 'required|image|max:2048',
        ]);

        $user = $request->user();

        // Eliminar foto anterior si existe
        if ($user->foto_perfil) {
            Storage::disk('public')->delete($user->foto_perfil);
        }

        $path = $request->file('foto')->store('fotos_perfil', 'public');
        $user->update(['foto_perfil' => $path]);

        return response()->json(['foto_perfil' => $path]);
    }
}