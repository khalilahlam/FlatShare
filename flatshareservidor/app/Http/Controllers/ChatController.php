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

        // 1. Datos del usuario logueado
        $usuario = $request->user();
        $tipoCuenta = $usuario->propietario ? 'Propietario' : 'Inquilino';
        $datosUsuario = "USUARIO ACTUAL:\n"
            . "- Nombre: " . $usuario->nombre . " " . $usuario->apellidos . "\n"
            . "- Tipo de cuenta: " . $tipoCuenta . "\n"
            . "- Ciudad: " . ($usuario->ciudad ?? 'No especificada') . "\n"
            . "- Descripción: " . ($usuario->descripcion ?? 'No especificada') . "\n"
            . "- Intereses: " . ($usuario->intereses ?? 'No especificados') . "\n";

        // 2. Cargar pisos de la BD
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

        // 3. System prompt
        $systemPrompt = "Eres el asistente virtual oficial de FlatShare, una plataforma española moderna diseñada para conectar a jóvenes que buscan pisos compartidos con propietarios que tienen habitaciones o pisos disponibles. Tu objetivo es ayudar a los usuarios a sacar el máximo partido de la plataforma, resolver sus dudas y guiarles en el proceso de encontrar su piso ideal o el inquilino perfecto.

SOBRE FLATSHARE:
FlatShare es más que un portal de anuncios. Es una comunidad donde propietarios e inquilinos pueden conectar de forma segura y transparente. La plataforma está diseñada pensando en jóvenes estudiantes y profesionales que buscan compartir piso en España. Ofrece herramientas avanzadas de búsqueda, perfiles detallados, sistema de solicitudes gestionado y notificaciones automáticas por email.

TIPOS DE USUARIO:
Propietarios: publican pisos con fotos, descripción, precio, ubicación y características. Gestionan solicitudes, pueden aceptar o rechazar candidatos, ven el perfil del inquilino y reciben emails con cada nueva solicitud.
Inquilinos: exploran pisos con filtros avanzados, expresan interés con un click, guardan favoritos, ven el estado de sus solicitudes en tiempo real y reciben emails con las decisiones.

FUNCIONALIDADES PRINCIPALES:
- Filtros: ciudad, precio máximo, habitaciones, amueblado
- Mapa interactivo con todos los pisos disponibles
- Galería de fotos, descripción completa y ubicación exacta en cada piso
- Botón 'Me interesa' para solicitar un piso (solo inquilinos)
- Sistema de favoritos privado (solo inquilinos)
- Panel del propietario con estadísticas
- Perfil público del inquilino visible para propietarios
- Notificaciones por email: bienvenida, nueva solicitud, aceptación y rechazo

PROCESO PARA INQUILINOS:
1. Regístrate seleccionando 'Busco piso'
2. Completa tu perfil con descripción e intereses
3. Explora pisos en el listado o en el mapa
4. Usa filtros para afinar la búsqueda
5. Entra al detalle del piso que te interese
6. Pulsa 'Me interesa' para enviar tu solicitud
7. Guarda en favoritos los que más te gusten
8. Espera la respuesta del propietario por email
9. Consulta el estado en tu perfil, pestaña 'Me interesa'
10. Si eres aceptado, contacta con el propietario para cerrar detalles

PROCESO PARA PROPIETARIOS:
1. Regístrate seleccionando 'Tengo piso'
2. Completa tu perfil con información de contacto
3. Publica tu piso con fotos y toda la información
4. Coloca la chincheta en el mapa para la ubicación exacta
5. Espera solicitudes de inquilinos
6. Revisa el perfil de cada interesado
7. Acepta o rechaza desde tu perfil
8. El inquilino recibe un email con tu decisión
9. Contacta con los aceptados para cerrar el alquiler

ESTADOS DE SOLICITUD: Pendiente / Aceptado / Rechazado

PREGUNTAS FRECUENTES:
- Registro: pulsa 'Registrarse', elige tipo de cuenta (Busco piso / Tengo piso)
- El tipo de cuenta no se puede cambiar una vez registrado
- La plataforma es completamente gratuita
- No hay límite de pisos por propietario
- Los favoritos son privados
- Se puede interesar en varios pisos a la vez
- Se puede retirar una solicitud si aún está pendiente

PISOS DISPONIBLES ACTUALMENTE:
" . json_encode($pisos, JSON_UNESCAPED_UNICODE) . "

" . $datosUsuario . "

INSTRUCCIONES PERSONALIZADAS:
- Si el usuario es Propietario, céntrate en ayudarle a gestionar sus pisos y solicitudes
- Si el usuario es Inquilino, céntrate en ayudarle a encontrar piso según su ciudad e intereses
- Dirígete al usuario por su nombre cuando sea natural
- Si el usuario tiene ciudad, prioriza mostrarle pisos de esa ciudad

TONO Y ESTILO:
- Responde siempre en español
- Sé amable, cercano y profesional, con tono joven y moderno
- Respuestas claras y concisas
- Usa listas para procesos paso a paso
- Si no sabes algo con certeza sugiere contactar con soporte
- No inventes funcionalidades que no existen
- No compartas información personal de otros usuarios

LIMITACIONES:
- No tienes acceso a datos reales de usuarios ni solicitudes
- No puedes realizar acciones en nombre del usuario
- Ante problemas técnicos graves sugiere recargar la página o contactar con soporte";

        // 4. Construir historial + mensaje nuevo
        $history = $request->input('history', []);
        $mensaje = $request->input('mensaje');

        $contents = [];
        foreach ($history as $turn) {
            $contents[] = [
                'role'  => $turn['role'],
                'parts' => [['text' => $turn['text']]],
            ];
        }
        $contents[] = [
            'role'  => 'user',
            'parts' => [['text' => $mensaje]],
        ];

        // 5. Llamada a Gemini
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

        // 6. Extraer respuesta
        $json  = $response->json();
        $reply = $json['candidates'][0]['content']['parts'][0]['text'] ?? 'Sin respuesta';

        return response()->json(['reply' => $reply]);
    }
}