<?php

namespace App\Http\Controllers;

use App\Models\Interesado;
use App\Models\Piso;
use Illuminate\Http\Request;
use App\Models\Chat;

class InteresadoController extends Controller
{
    public function store(Request $request, $pisoId)
    {
        $userId = $request->user()->id;
        $piso = Piso::with('usuario')->findOrFail($pisoId);

        if ($piso->usuario_id === $userId) {
            return response()->json(['message' => 'No puedes interesarte en tu propio piso'], 403);
        }

        $existe = Interesado::where('usuario_id', $userId)->where('piso_id', $pisoId)->first();
        if ($existe) {
            return response()->json(['message' => 'Ya estás en la lista'], 409);
        }

        $interesado = Interesado::create([
            'usuario_id' => $userId,
            'piso_id'    => $pisoId,
            'estado'     => 'pendiente',
        ]);

        return response()->json($interesado, 201);
    }

    public function destroy(Request $request, $pisoId)
    {
        $userId = $request->user()->id;
        Interesado::where('usuario_id', $userId)->where('piso_id', $pisoId)->delete();
        return response()->json(['message' => 'Eliminado']);
    }

    public function porPiso(Request $request, $pisoId)
    {
        $piso = Piso::findOrFail($pisoId);

        if ($piso->usuario_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $interesados = Interesado::with('usuario')->where('piso_id', $pisoId)->get();
        return response()->json($interesados);
    }

    public function eliminarCandidato(Request $request, $pisoId, $usuarioId)
    {
        $piso = Piso::findOrFail($pisoId);

        if ($piso->usuario_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        Interesado::where('piso_id', $pisoId)->where('usuario_id', $usuarioId)->delete();
        return response()->json(['message' => 'Candidato eliminado']);
    }

    public function miEstado(Request $request, $pisoId)
    {
        $interesado = Interesado::where('usuario_id', $request->user()->id)
            ->where('piso_id', $pisoId)
            ->first();

        return response()->json(['interesado' => $interesado ? true : false]);
    }

    public function misIntereses(Request $request)
    {
        $userId = $request->user()->id;

        $interesados = Interesado::with('piso.fotos')
            ->where('usuario_id', $userId)
            ->get();

        $pisos = $interesados->map(function ($interesado) {
            $piso = $interesado->piso->toArray();
            $piso['mi_estado'] = $interesado->estado;
            return $piso;
        });

        return response()->json($pisos);
    }

    public function aceptar(Request $request, $pisoId, $usuarioId)
    {
        $piso = Piso::findOrFail($pisoId);

        if ($piso->usuario_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $aceptadosActuales = Interesado::where('piso_id', $pisoId)
            ->where('estado', 'aceptado')
            ->count();

        if ($aceptadosActuales >= $piso->num_companeros) {
            return response()->json(['message' => 'El piso ya tiene el máximo de compañeros aceptados'], 422);
        }

        $interesado = Interesado::with('usuario')
            ->where('piso_id', $pisoId)
            ->where('usuario_id', $usuarioId)
            ->firstOrFail();

        $interesado->update(['estado' => 'aceptado']);

        $aceptados = Interesado::where('piso_id', $pisoId)
            ->where('estado', 'aceptado')
            ->pluck('usuario_id')
            ->toArray();

        $participantes = array_unique(array_merge([$piso->usuario_id], $aceptados));
        $chat = \App\Models\Chat::firstOrCreate(['piso_id' => $pisoId]);
        $chat->usuarios()->syncWithoutDetaching($participantes);

        return response()->json($interesado);
    }

    public function rechazar(Request $request, $pisoId, $usuarioId)
    {
        $piso = Piso::with('usuario')->findOrFail($pisoId);

        if ($piso->usuario_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $interesado = Interesado::with('usuario')
            ->where('piso_id', $pisoId)
            ->where('usuario_id', $usuarioId)
            ->firstOrFail();

        $interesado->update(['estado' => 'rechazado']);

        return response()->json($interesado);
    }
}