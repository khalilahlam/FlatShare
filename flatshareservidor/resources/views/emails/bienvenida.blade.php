<x-mail::message>
# ¡Bienvenido/a a FlatShare, {{ $usuario->nombre }}!

Nos alegra que te hayas unido a nuestra comunidad. Ya puedes acceder a tu cuenta y empezar a explorar pisos y compañeros.

@if($usuario->propietario)
Como **propietario**, puedes publicar tu piso y gestionar las solicitudes de los inquilinos.
@else
Como **inquilino**, puedes buscar pisos y enviar solicitudes a los propietarios.
@endif

<x-mail::button :url="'http://localhost:4200'">
Acceder a FlatShare
</x-mail::button>

Si no has creado esta cuenta, ignora este mensaje.

Saludos,<br>
**Khalil & Raúl**<br>
El equipo de **FlatShare**
</x-mail::message>