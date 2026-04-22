<?php

namespace App\Http\Controllers;

use App\Models\Interesado;
use App\Models\Piso;
use App\Mail\InteresadoNuevo;
use App\Mail\SolicitudAceptada;
use App\Mail\SolicitudRechazada;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
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

        // Email al propietario
        Mail::to($piso->usuario->email)->send(new InteresadoNuevo($piso, $request->user()));

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

        $interesado = Interesado::with('usuario')
            ->where('piso_id', $pisoId)
            ->where('usuario_id', $usuarioId)
            ->firstOrFail();

        $interesado->update(['estado' => 'aceptado']);

        // Contar cuántos aceptados hay ahora
        $aceptados = Interesado::where('piso_id', $pisoId)
            ->where('estado', 'aceptado')
            ->pluck('usuario_id')
            ->toArray();

        // Siempre actualizar el chat cuando se acepta alguien
        $participantes = array_unique(array_merge([$piso->usuario_id], $aceptados));
        $chat = \App\Models\Chat::firstOrCreate(['piso_id' => $pisoId]);

        // Usar syncWithoutDetaching para no borrar los que ya están
        $chat->usuarios()->syncWithoutDetaching($participantes);

        // Email al inquilino
        Mail::to($interesado->usuario->email)->send(new SolicitudAceptada($piso, $interesado->usuario));

        return response()->json($interesado);
    }

    public function rechazar(Request $request, $pisoId, $usuarioId)
    {
        $piso = Piso::findOrFail($pisoId);

        if ($piso->usuario_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $interesado = Interesado::with('usuario')
            ->where('piso_id', $pisoId)
            ->where('usuario_id', $usuarioId)
            ->firstOrFail();

        $interesado->update(['estado' => 'rechazado']);

        Mail::to($interesado->usuario->email)->send(new SolicitudRechazada($piso, $interesado->usuario));

        return response()->json($interesado);
    }
}