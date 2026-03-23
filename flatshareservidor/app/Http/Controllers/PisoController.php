<?php

namespace App\Http\Controllers;

use App\Models\Piso;
use Illuminate\Http\Request;

class PisoController extends Controller
{
    public function index(Request $request)
    {
        $query = Piso::with(['usuario', 'fotos']);

        if ($request->filled('ciudad')) {
            $query->whereRaw('LOWER(ciudad) = ?', [mb_strtolower($request->query('ciudad'))]);
        }

        return $query->get();
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
            'ciudad'         => 'required|string|max:100',
            'lat'            => 'nullable|numeric|between:-90,90',
            'lng'            => 'nullable|numeric|between:-180,180',
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

        $data = $request->validate([
            'titulo'         => 'sometimes|required|string',
            'descripcion'    => 'sometimes|nullable|string',
            'precio'         => 'sometimes|required|numeric',
            'ubicacion'      => 'sometimes|required|string',
            'ciudad'         => 'sometimes|required|string|max:100',
            'lat'            => 'sometimes|nullable|numeric|between:-90,90',
            'lng'            => 'sometimes|nullable|numeric|between:-180,180',
            'num_companeros' => 'sometimes|nullable|integer',
            'habitaciones'   => 'sometimes|nullable|integer',
            'banos'          => 'sometimes|nullable|integer',
            'metros'         => 'sometimes|nullable|integer',
            'amueblado'      => 'sometimes|nullable|boolean',
        ]);

        $piso->update($data);

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