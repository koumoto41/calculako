<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// Registered here (not routes/api.php) so these stay on the 'web' middleware
// group (session + CSRF), which login/logout need. They're placed under
// /api purely so Apache's reverse proxy can split traffic by URL prefix
// alone: /api/* -> Laravel, everything else -> the SPA. /login itself is
// also a client-side React Router page (visited via plain GET), so it must
// NOT be a prefix Apache proxies to Laravel unconditionally.
Route::post('/api/login', [AuthController::class, 'login']);
Route::post('/api/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
