<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\PaymentController;
use Illuminate\Support\Facades\Route;

// Prefix semua route dengan 'api/v1'
Route::prefix('v1')->group(function () {
    // Auth Routes (Public)
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    // Public Routes
    Route::apiResource('hotels', HotelController::class)->only(['index', 'show']);
    Route::apiResource('rooms', RoomController::class)->only(['index', 'show']);

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        // Auth Routes
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
        Route::post('user', [AuthController::class, 'store']); // Tambahkan ini
        
        // User Management Routes
        Route::prefix('users')->group(function () {
            Route::get('/', [AuthController::class, 'index']);
            Route::post('/', [AuthController::class, 'store']);  // Add this line
            Route::get('/{id}', [AuthController::class, 'show']);
            Route::put('/{id}', [AuthController::class, 'update']);
            Route::delete('/{id}', [AuthController::class, 'destroy']);
        });

        // Protected Hotel & Room Routes (for admin)
        Route::apiResource('hotels', HotelController::class)->except(['index', 'show']);
        Route::apiResource('rooms', RoomController::class)->except(['index', 'show']);

        // Reservation Routes
        Route::apiResource('reservations', ReservationController::class);

        // Payment Routes
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('payments/reservation/{id}', [PaymentController::class, 'getByReservation']);
        });
        Route::apiResource('payments', PaymentController::class);
    });
});