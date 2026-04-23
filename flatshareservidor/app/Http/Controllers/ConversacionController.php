<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Mensaje;
use App\Models\Piso;
use App\Models\Interesado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConversacionController extends Controller
{
    public function misChats()
    {
        $userId = Auth::id();

        $chats = Chat::whereHas('usuarios', function ($q) use ($userId) {
                $q->where('usuarios.id', $userId);
            })
            ->with([
                'piso.fotos',
                'usuarios:id,nombre,apellidos',
                'ultimoMensaje.usuario',
            ])
            ->get()
            ->map(function (Chat $chat) use ($userId) {
                $noLeidos = Mensaje::where('chat_id', $chat->id)
                    ->where('usuario_id', '!=', $userId)
                    ->where('leido', false)
                    ->count();
                return [
                    'id' => $chat->id,
                    'piso' => $chat->piso ? [
                        'id' => $chat->piso->id,
                        'titulo' => $chat->piso->titulo,
                        'ciudad' => $chat->piso->ciudad,
                        'foto' => $chat->piso->fotos->first() ? $chat->piso->fotos->first()->url : null,
                    ] : null,
                    'usuarios' => $chat->usuarios,
                    'ultimo_mensaje' => $chat->ultimoMensaje,
                    'no_leidos' => $noLeidos,
                ];
        });

        return response()->json($chats);
    }

    public function mensajes($chatId)
    {
        $userId = Auth::id();
        $chat = Chat::findOrFail($chatId);

        if (!$chat->usuarios->contains('id', $userId)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        Mensaje::where('chat_id', $chatId)
            ->where('usuario_id', '!=', $userId)
            ->where('leido', false)
            ->update(['leido' => true]);

        $mensajes = Mensaje::where('chat_id', $chatId)
            ->with('usuario:id,nombre,apellidos')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($mensajes);
    }

    public function enviar(Request $request, $chatId)
    {
        $userId = Auth::id();
        $chat = Chat::with('usuarios')->findOrFail($chatId);

        if (!$chat->usuarios->contains('id', $userId)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $request->validate([
            'contenido' => 'required|string|max:2000',
        ]);

        $mensaje = Mensaje::create([
            'chat_id'    => $chatId,
            'usuario_id' => $userId,
            'contenido'  => $request->contenido,
            'leido'      => false,
        ]);

        return response()->json($mensaje->load('usuario:id,nombre,apellidos'), 201);
    }

    public function crearOActualizarChat($pisoId)
    {
        $piso = Piso::findOrFail($pisoId);

        $aceptados = Interesado::where('piso_id', $pisoId)
            ->where('estado', 'aceptado')
            ->pluck('usuario_id')
            ->toArray();

        $participantes = array_unique(array_merge([$piso->usuario_id], $aceptados));
        $chat = Chat::firstOrCreate(['piso_id' => $pisoId]);
        $chat->usuarios()->sync($participantes);

        return response()->json(['message' => 'Chat actualizado', 'chat_id' => $chat->id]);
    }

    public function noLeidos()
    {
        $userId = Auth::id();

        $total = Mensaje::whereHas('chat.usuarios', function ($q) use ($userId) {
                $q->where('usuarios.id', $userId); // ✅
            })
            ->where('usuario_id', '!=', $userId)
            ->where('leido', false)
            ->count();

        return response()->json(['total' => $total]);
    }
}