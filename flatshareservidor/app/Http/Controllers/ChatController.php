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

        $apiKey = env('GEMINI_API_KEY');
        $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={$apiKey}";

        $body = json_encode([
            'contents' => [
                [
                    'parts' => [
                        ['text' => $contexto . "\n\nUsuario: " . $mensaje]
                    ]
                ]
            ]
        ]);

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);

        $texto = $data['candidates'][0]['content']['parts'][0]['text'] ?? 'No he podido responder, intenta de nuevo.';

        return response()->json(['respuesta' => $texto]);
    }
}