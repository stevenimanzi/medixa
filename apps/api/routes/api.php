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
        
        // Pharmacy Routes
        Route::get('/pharmacy', [\App\Http\Controllers\Api\PharmacyController::class, 'show']);
        Route::put('/pharmacy', [\App\Http\Controllers\Api\PharmacyController::class, 'update']);

        // Branches Route
        Route::apiResource('branches', \App\Http\Controllers\Api\BranchController::class);
        
        // Products Route
        Route::apiResource('products', \App\Http\Controllers\Api\ProductController::class);
        
        // Stock Routes
        Route::post('/stock/in', [\App\Http\Controllers\Api\StockController::class, 'stockIn']);
        Route::post('/stock/out', [\App\Http\Controllers\Api\StockController::class, 'stockOut']);
        
        // Users Route
        Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);
    });
});
