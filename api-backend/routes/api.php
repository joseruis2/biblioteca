<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AutorController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LibroController;
use App\Http\Controllers\Api\MultaController;
use App\Http\Controllers\Api\PrestamoController;
use App\Http\Controllers\Api\ReservaController;
use App\Http\Controllers\Api\UsuarioController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ── Públicas ──
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ── Protegidas ──
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Libros
    Route::get('/libros', [LibroController::class, 'index']);
    Route::get('/libros/{id}', [LibroController::class, 'show']);
    Route::post('/libros', [LibroController::class, 'store']);
    Route::put('/libros/{id}', [LibroController::class, 'update']);
    Route::delete('/libros/{id}', [LibroController::class, 'destroy']);

    // Categorias
    Route::apiResource('categorias', CategoriaController::class);

    // Autores
    Route::apiResource('autores', AutorController::class);

    // Prestamos
    Route::get('/prestamos', [PrestamoController::class, 'index']);
    Route::post('/prestamos', [PrestamoController::class, 'store']);
    Route::post('/prestamos/{id}/devolver', [PrestamoController::class, 'devolver']);

    // Reservas
    Route::get('/reservas', [ReservaController::class, 'index']);
    Route::post('/reservas', [ReservaController::class, 'store']);
    Route::post('/reservas/{id}/cancelar', [ReservaController::class, 'cancelar']);

    // Multas
    Route::get('/multas', [MultaController::class, 'index']);
    Route::post('/multas/{id}/pagar', [MultaController::class, 'pagar']);

    Route::get('/usuarios', [UsuarioController::class, 'index']);
    Route::put('/usuarios/{id}', [UsuarioController::class, 'update']);
    Route::patch('/usuarios/{id}/toggle', [UsuarioController::class, 'toggle']);

    // Agrega esta:
    Route::get('/prestamos/{id}', [PrestamoController::class, 'show']);

    // Agrega estas (admin ve todas)
    Route::get('/reservas/todas', [ReservaController::class, 'todas']);
    Route::post('/reservas/{id}/completar', [ReservaController::class, 'completar']);
    Route::post('/reservas/{id}/expirar', [ReservaController::class, 'expirar']);

    Route::get('/dashboard', [DashboardController::class, 'index']);
});
