<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Mail\Bienvenida;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'nombre'           => 'required|string',
            'apellidos'        => 'required|string',
            'email'            => 'required|email|unique:usuarios,email',
            'password'         => 'required|min:6|confirmed',
            'propietario'      => 'required|boolean',
            'fecha_nacimiento' => 'nullable|date',
            'telefono'         => 'nullable|string|max:20',
            'ciudad'           => 'nullable|string|max:100',
            'descripcion'      => 'nullable|string',
            'intereses'        => 'nullable|string',
        ]);

        $usuario = Usuario::create([
            'nombre'           => $data['nombre'],
            'apellidos'        => $data['apellidos'],
            'email'            => $data['email'],
            'password'         => $data['password'],
            'propietario'      => $data['propietario'],
            'fecha_nacimiento' => $data['fecha_nacimiento'] ?? null,
            'telefono'         => $data['telefono'] ?? null,
            'ciudad'           => $data['ciudad'] ?? null,
            'descripcion'      => $data['descripcion'] ?? null,
            'intereses'        => $data['intereses'] ?? null,
        ]);

        Mail::to($usuario->email)->send(new Bienvenida($usuario));

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $usuario], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $usuario = Usuario::where('email', $data['email'])->first();

        if (!$usuario || !Hash::check($data['password'], $usuario->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $usuario]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada']);
    }

    public function updateProfile(Request $request)
    {
        $usuario = $request->user();

        $data = $request->validate([
            'nombre'           => 'required|string',
            'apellidos'        => 'required|string',
            'telefono'         => 'nullable|string|max:20',
            'ciudad'           => 'nullable|string|max:100',
            'descripcion'      => 'nullable|string',
            'intereses'        => 'nullable|string',
            'fecha_nacimiento' => 'nullable|date',
        ]);

        $usuario->update($data);

        return response()->json($usuario);
    }

    public function perfil($id)
    {
        $usuario = Usuario::findOrFail($id);
        return response()->json($usuario);
    }
}