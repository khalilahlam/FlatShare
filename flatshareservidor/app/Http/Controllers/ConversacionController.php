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
    /**
     * Devuelve todos los chats del usuario autenticado
     * con el último mensaje y los participantes.
     */
    public function misChats()
    {
        $userId = Auth::id();

        $chats = Chat::whereHas('usuarios', function ($q) use ($userId) {
                $q->where('users.id', $userId);
            })
            ->with([
                'piso:id,titulo,ciudad',
                'usuarios:id,nombre,apellidos',
                'ultimoMensaje.usuario:id,nombre',
            ])
            ->get()
            ->map(function (Chat $chat) use ($userId) {
                $noLeidos = Mensaje::where('chat_id', $chat->id)
                    ->where('usuario_id', '!=', $userId)
                    ->where('leido', false)
                    ->count();

                return [
                    'id'            => $chat->id,
                    'piso'          => $chat->piso,
                    'usuarios'      => $chat->usuarios,
                    'ultimo_mensaje' => $chat->ultimoMensaje,
                    'no_leidos'     => $noLeidos,
                ];
            });

        return response()->json($chats);
    }

    /**
     * Devuelve los mensajes de un chat concreto
     * y los marca como leídos.
     */
    public function mensajes($chatId)
    {
        $userId = Auth::id();
        $chat = Chat::findOrFail($chatId);

        // Verificar que el usuario pertenece al chat
        if (!$chat->usuarios->contains('id', $userId)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Marcar como leídos los mensajes que no son míos
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

    /**
     * Envía un mensaje a un chat.
     */
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
            'chat_id'   => $chatId,
            'usuario_id' => $userId,
            'contenido' => $request->contenido,
            'leido'     => false,
        ]);

        return response()->json($mensaje->load('usuario:id,nombre,apellidos'), 201);
    }

    /**
     * Cuando el propietario acepta a un inquilino,
     * crea o actualiza el chat grupal del piso
     * añadiendo al propietario + todos los aceptados.
     */
    public function crearOActualizarChat($pisoId)
    {
        $piso = Piso::findOrFail($pisoId);

        // IDs de inquilinos aceptados
        $aceptados = Interesado::where('piso_id', $pisoId)
            ->where('estado', 'aceptado')
            ->pluck('usuario_id')
            ->toArray();

        // Incluir al propietario
        $participantes = array_unique(array_merge([$piso->usuario_id], $aceptados));

        // Buscar chat existente o crear uno nuevo
        $chat = Chat::firstOrCreate(['piso_id' => $pisoId]);

        // Sincronizar participantes
        $chat->usuarios()->sync($participantes);

        return response()->json([
            'message' => 'Chat actualizado',
            'chat_id' => $chat->id,
        ]);
    }

    /**
     * Número total de mensajes no leídos del usuario.
     */
    public function noLeidos()
    {
        $userId = Auth::id();

        $total = Mensaje::whereHas('chat.usuarios', function ($q) use ($userId) {
                $q->where('users.id', $userId);
            })
            ->where('usuario_id', '!=', $userId)
            ->where('leido', false)
            ->count();

        return response()->json(['total' => $total]);
    }
}