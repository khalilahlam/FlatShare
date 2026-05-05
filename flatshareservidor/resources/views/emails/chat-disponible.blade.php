<x-mail::message>
# ¡Hay novedades en tu piso, {{ $usuario->nombre }}! 💬

Se ha confirmado un match en el siguiente piso y ya tienes acceso al chat grupal:

- **{{ $piso->titulo }}**
- {{ $piso->ciudad ?? $piso->ubicacion }}
- {{ $piso->precio }}€/mes

Entra en la plataforma y empieza a chatear con tus futuros compañeros.

<x-mail::button :url="'http://localhost:4200/chat'">
Ver el chat
</x-mail::button>

Saludos,<br>
**Khalil & Raúl**<br>
El equipo de **FlatShare**
</x-mail::message>