<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PisoController;
use App\Http\Controllers\InteresadoController;
use App\Http\Controllers\FavoritoController;
use App\Http\Controllers\ChatController;


// AUTH públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Pisos públicas
Route::get('/pisos', [PisoController::class, 'index']);
Route::get('/pisos/{id}', [PisoController::class, 'show']);


// Chat IA (pública)
Route::post('/chat', [ChatController::class, 'chat']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::get('/usuarios/{id}', [AuthController::class, 'perfil']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Pisos
    Route::post('/pisos', [PisoController::class, 'store']);
    Route::put('/pisos/{id}', [PisoController::class, 'update']);
    Route::delete('/pisos/{id}', [PisoController::class, 'destroy']);

    // Favoritos
    Route::get('/favoritos', [FavoritoController::class, 'index']);
    Route::post('/favoritos/{pisoId}', [FavoritoController::class, 'store']);
    Route::delete('/favoritos/{pisoId}', [FavoritoController::class, 'destroy']);

    // Interesados
    Route::get('/mis-intereses', [InteresadoController::class, 'misIntereses']);
    Route::post('/pisos/{pisoId}/interesados', [InteresadoController::class, 'store']);
    Route::delete('/pisos/{pisoId}/interesados', [InteresadoController::class, 'destroy']);
    Route::get('/pisos/{pisoId}/interesados', [InteresadoController::class, 'porPiso']);
    Route::delete('/pisos/{pisoId}/interesados/{usuarioId}', [InteresadoController::class, 'eliminarCandidato']);
    Route::get('/pisos/{pisoId}/mi-estado', [InteresadoController::class, 'miEstado']);
    Route::put('/pisos/{pisoId}/interesados/{usuarioId}/aceptar', [InteresadoController::class, 'aceptar']);
    Route::put('/pisos/{pisoId}/interesados/{usuarioId}/rechazar', [InteresadoController::class, 'rechazar']);
});