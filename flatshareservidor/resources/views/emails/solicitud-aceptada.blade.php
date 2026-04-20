<x-mail::message>
# ¡Enhorabuena, {{ $inquilino->nombre }}! 

Tu solicitud para el siguiente piso ha sido **aceptada**:

-  **{{ $piso->titulo }}**
-  {{ $piso->ciudad ?? $piso->ubicacion }}
-  {{ $piso->precio }}€/mes

El propietario ha revisado tu perfil y pronto se pondrá en contacto contigo.

<x-mail::button :url="'http://localhost:4200'">
Ver mi piso
</x-mail::button>

Saludos,<br>
**Khalil & Raúl**<br>
El equipo de **FlatShare**
</x-mail::message>