<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Piso;

class ChatController extends Controller
{
    public function chat(Request $request)
    {
        $mensaje = $request->input('mensaje');

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

        $contexto = "Eres un asistente de FlatShare, una plataforma de búsqueda de pisos compartidos. "
            . "Ayuda a los usuarios a encontrar piso y responde dudas sobre alquiler. "
            . "Estos son los pisos disponibles actualmente: "
            . json_encode($pisos, JSON_UNESCAPED_UNICODE)
            . ". Responde siempre en español y de forma breve.";

        $apiKey = env('OPENROUTER_API_KEY');
        $url = "https://openrouter.ai/api/v1/chat/completions";

        $body = json_encode([
            'model' => 'meta-llama/llama-3.1-8b-instruct:free',
            'messages' => [
                ['role' => 'system', 'content' => $contexto],
                ['role' => 'user',   'content' => $mensaje],
            ],
        ]);

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $apiKey,
        ]);
        $response = curl_exec($ch);
        curl_close($ch);

        // DEBUG TEMPORAL
        return response()->json(['raw' => $response]);
    }
}