<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Piso;

class ChatController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'mensaje' => 'required|string',
            'history' => 'array',
        ]);

        // 1. Cargar pisos de la BD (igual que antes)
        $pisos = Piso::with('fotos')->get()->map(function ($piso) {
            return [
                'id'           => $piso->id,
                'titulo'       => $piso->titulo,
                'precio'       => $piso->precio,
                'ubicacion'    => $piso->ubicacion,
                'ciudad'       => $piso->ciudad,
                'habitaciones' => $piso->habitaciones,
                'metros'       => $piso->metros,
                'amueblado'    => $piso->amueblado,
            ];
        });

        // 2. System prompt con los pisos inyectados
        $systemPrompt = "Eres un asistente de FlatShare, una plataforma de búsqueda de pisos compartidos. "
            . "Ayuda a los usuarios a encontrar piso y responde dudas sobre alquiler. "
            . "Estos son los pisos disponibles actualmente: "
            . json_encode($pisos, JSON_UNESCAPED_UNICODE)
            . ". Responde siempre en español y de forma breve.";

        // 3. Construir historial + mensaje nuevo
        $history = $request->input('history', []);
        $mensaje = $request->input('mensaje');

        $contents = [];
        foreach ($history as $turn) {
            $contents[] = [
                'role'  => $turn['role'],   // 'user' o 'model'
                'parts' => [['text' => $turn['text']]],
            ];
        }
        $contents[] = [
            'role'  => 'user',
            'parts' => [['text' => $mensaje]],
        ];

        // 4. Llamada a Gemini con Http facade (más limpio que curl)
        $apiKey = env('GEMINI_API_KEY');
        $model  = 'gemini-2.5-flash';

        $response = Http::post(
            "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}",
            [
                'system_instruction' => [
                    'parts' => [['text' => $systemPrompt]]
                ],
                'contents' => $contents,
            ]
        );

        // 5. Extraer respuesta
        $reply = $response->json('candidates.0.content.parts.0.text') ?? 'Sin respuesta';

        return response()->json(['reply' => $reply]);
    }
}