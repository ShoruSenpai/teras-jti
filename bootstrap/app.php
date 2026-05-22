<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// admin middleware
use App\Http\Middleware\CheckAdminAuth;
use App\Http\Middleware\CheckUserRole;

// customer middleware
use App\Http\Middleware\CheckSessionToken;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'check.session' => CheckSessionToken::class,
            'check.admin.auth' => CheckAdminAuth::class,
            'role' => CheckUserRole::class,
        ]);

        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();
