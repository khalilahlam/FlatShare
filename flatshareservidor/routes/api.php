<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PisoController;

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