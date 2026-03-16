<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
   public function register(Request $request)
{
    $data = $request->validate([
        'nombre'      => 'required|string',
        'apellidos'   => 'required|string',
        'email'       => 'required|email|unique:usuarios,email',
        'password'    => 'required|min:6|confirmed',
        'propietario' => 'required|boolean',
    ]);

    $usuario = Usuario::create([
        'nombre'      => $data['nombre'],
        'apellidos'   => $data['apellidos'],
        'email'       => $data['email'],
        'password'    => $data['password'],
        'propietario' => $data['propietario'],
    ]);

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
}