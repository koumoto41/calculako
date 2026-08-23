<?php

use App\Http\Controllers\Api\AllowanceController;
use App\Http\Controllers\Api\CardBillController;
use App\Http\Controllers\Api\CardController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\MonthClosureController;
use App\Http\Controllers\Api\VendorController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('categories', CategoryController::class)->except('show');
    Route::apiResource('vendors', VendorController::class)->except('show');
    Route::apiResource('cards', CardController::class)->except('show');
    Route::apiResource('expenses', ExpenseController::class)->except('show');

    Route::get('/allowance', [AllowanceController::class, 'show']);
    Route::put('/allowance', [AllowanceController::class, 'update']);

    Route::get('/card-bills', [CardBillController::class, 'index']);
    Route::put('/card-bills', [CardBillController::class, 'update']);

    Route::get('/months/{year}/{month}/summary', [MonthClosureController::class, 'summary']);
    Route::post('/months/{year}/{month}/close', [MonthClosureController::class, 'close']);
    Route::delete('/months/{year}/{month}/close', [MonthClosureController::class, 'reopen']);
});
