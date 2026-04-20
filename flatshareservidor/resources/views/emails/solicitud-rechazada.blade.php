<x-mail::message>
# Hola {{ $inquilino->nombre }},

Lamentamos informarte que tu solicitud para el piso **{{ $piso->titulo }}** en {{ $piso->ciudad ?? $piso->ubicacion }} no ha sido aceptada en esta ocasión.

No te desanimes, hay muchos otros pisos disponibles en FlatShare que pueden encajar contigo.

<x-mail::button :url="'http://localhost:4200'">
Buscar otros pisos
</x-mail::button>

Saludos,<br>
**Khalil & Raúl**<br>
El equipo de **FlatShare**
</x-mail::message>