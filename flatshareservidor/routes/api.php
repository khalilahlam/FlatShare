<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PisoController;
use App\Http\Controllers\InteresadoController;
use App\Http\Controllers\FavoritoController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/favoritos', [FavoritoController::class, 'index']);
    Route::post('/favoritos/{pisoId}', [FavoritoController::class, 'store']);
    Route::delete('/favoritos/{pisoId}', [FavoritoController::class, 'destroy']);
});

// AUTH
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // PISOS
    Route::post('/pisos', [PisoController::class, 'store']);
    Route::put('/pisos/{id}', [PisoController::class, 'update']);
    Route::delete('/pisos/{id}', [PisoController::class, 'destroy']);
});

// Públicas
Route::get('/pisos', [PisoController::class, 'index']);
Route::get('/pisos/{id}', [PisoController::class, 'show']);

// Rutas de interesados
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/pisos/{pisoId}/interesados', [InteresadoController::class, 'store']);
    Route::delete('/pisos/{pisoId}/interesados', [InteresadoController::class, 'destroy']);
    Route::get('/pisos/{pisoId}/interesados', [InteresadoController::class, 'porPiso']);
    Route::delete('/pisos/{pisoId}/interesados/{usuarioId}', [InteresadoController::class, 'eliminarCandidato']);
    Route::get('/pisos/{pisoId}/mi-estado', [InteresadoController::class, 'miEstado']);
});