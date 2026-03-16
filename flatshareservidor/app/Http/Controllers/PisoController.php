<?php

namespace App\Http\Controllers;

use App\Models\Piso;
use Illuminate\Http\Request;

class PisoController extends Controller
{
    public function index()
    {
        return Piso::with(['usuario', 'fotos'])->get();
    }

    public function show($id)
    {
        $piso = Piso::with(['usuario', 'fotos'])->find($id);
        if (!$piso) return response()->json(['message' => 'Piso no encontrado'], 404);
        return $piso;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titulo'         => 'required|string',
            'descripcion'    => 'nullable|string',
            'precio'         => 'required|numeric',
            'ubicacion'      => 'required|string',
            'num_companeros' => 'nullable|integer',
            'habitaciones'   => 'nullable|integer',
            'banos'          => 'nullable|integer',
            'metros'         => 'nullable|integer',
            'amueblado'      => 'nullable|boolean',
        ]);

        $data['usuario_id'] = $request->user()->id;
        $piso = Piso::create($data);

        if ($request->hasFile('fotos')) {
            foreach ($request->file('fotos') as $foto) {
                $path = $foto->store('fotos', 'public');
                $piso->fotos()->create(['url' => $path]);
            }
        }

        return response()->json($piso->load('fotos'), 201);
    }

    public function update(Request $request, $id)
    {
        $piso = Piso::find($id);
        if (!$piso) return response()->json(['message' => 'Piso no encontrado'], 404);
        if ($piso->usuario_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $piso->update($request->except('fotos'));

        if ($request->hasFile('fotos')) {
            foreach ($request->file('fotos') as $foto) {
                $path = $foto->store('fotos', 'public');
                $piso->fotos()->create(['url' => $path]);
            }
        }

        return response()->json($piso->load('fotos'));
    }

    public function destroy(Request $request, $id)
    {
        $piso = Piso::find($id);
        if (!$piso) return response()->json(['message' => 'Piso no encontrado'], 404);
        if ($piso->usuario_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $piso->delete();
        return response()->json(['message' => 'Piso eliminado']);
    }
}