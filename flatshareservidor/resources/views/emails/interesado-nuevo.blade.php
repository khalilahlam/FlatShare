<x-mail::message>
# Nuevo interesado en tu piso 

Hola **{{ $piso->usuario->nombre }}**,

El usuario **{{ $inquilino->nombre }} {{ $inquilino->apellidos }}** se ha interesado en tu piso:

-  **{{ $piso->titulo }}**
-  {{ $piso->ciudad ?? $piso->ubicacion }}
-  {{ $piso->precio }}€/mes

Puedes ver su perfil y gestionar la solicitud desde tu panel.

<x-mail::button :url="'http://localhost:4200'">
Ver solicitudes
</x-mail::button>

Saludos,<br>
**Khalil & Raúl**<br>
El equipo de **FlatShare**
</x-mail::message>