<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Http\Models\UserAdmin; // Pastikan import model yang baru dibuat
use Symfony\Component\HttpFoundation\Response;

class CheckAdminAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->header('X-Session-Token');

        if (!$token) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Unauthorized: Token sesi admin tidak ditemukan.',
                ],
                401,
            );
        }

        $admin = UserAdmin::where('api_token', $token)->first();

        if (!$admin) {
            return response()->json(
                [
                    'success' => false,
                    'message' =>
                        'Unauthorized: Sesi tidak valid atau telah berakhir. Silakan login kembali.',
                ],
                401,
            );
        }

        $request->attributes->set('admin_user', $admin);

        return $next($request);
    }
}
