<?php

namespace App\Http\Middleware;

use App\Http\Models\SessionToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSessionToken
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->header('X-Session-Token') ?? $request->query('token');

        if (!$token) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Access denied! Session token not found.',
                ],
                401,
            );
        }

        $session = SessionToken::where('token', $token)->where('status', 'active')->first();

        if (
            !$session ||
            now()->greaterThan($session->expired_at) ||
            $session->ip_address !== $request->ip()
        ) {
            if ($session) {
                $session->update([
                    'status' => 'expired',
                ]);
            }
            return response()->json([
                'success' => false,
                'message' => 'Sesi tidak valid atau telah habis.',
            ]);
        }
        return $next($request);
    }
}
