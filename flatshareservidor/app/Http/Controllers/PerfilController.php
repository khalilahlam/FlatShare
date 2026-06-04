<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

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

    $cloudinary = new \Cloudinary\Cloudinary([
        'cloud' => [
            'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
            'api_key'    => env('CLOUDINARY_API_KEY'),
            'api_secret' => env('CLOUDINARY_API_SECRET'),
        ]
    ]);

    $result = $cloudinary->uploadApi()->upload($request->file('foto')->getRealPath(), [
        'folder' => 'fotos_perfil'
    ]);

    $url = $result['secure_url'];
    $user->update(['foto_perfil' => $url]);

    return response()->json(['foto_perfil' => $url]);
}
public function deleteFoto(Request $request)
{
    $user = $request->user();
    $user->update(['foto_perfil' => null]);
    return response()->json(['message' => 'Foto eliminada']);
}
}