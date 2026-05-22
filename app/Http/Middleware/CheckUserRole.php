<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $admin = $request->attributes->get('admin_user');

        if (!$admin || !in_array($admin->role, $roles)) {
            return response()->json(
                [
                    'success' => false,
                    'message' =>
                        'Forbidden: Akun dengan role (' .
                        strtoupper($admin->role) .
                        ') tidak memiliki hak akses ke fitur ini.',
                ],
                403,
            );
        }

        return $next($request);
    }
}
