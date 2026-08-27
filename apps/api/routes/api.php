<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;

Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/user', [AuthController::class, 'user']);
        Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
        
        // POS Routes
        Route::get('/pos/products', [\App\Http\Controllers\Api\PosController::class, 'getProducts']);
        Route::get('/pos/customers', [\App\Http\Controllers\Api\PosController::class, 'getCustomers']);
        Route::post('/pos/checkout', [\App\Http\Controllers\Api\PosController::class, 'checkout']);
    });
});
