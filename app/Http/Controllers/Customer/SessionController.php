<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Models\OrderToken;
use App\Http\Models\SessionToken;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SessionController extends Controller
{
    private $targetLat = -8.15740159509914;
    private $targetLong = 113.72300532798566;
    private $radiusLimit = 0.05;

    //    public function __construct()
    //    {
    //        if (app()->enviroment('local')) {
    //            Carbon::setTestNow(now()->next(Carbon::MONDAY)->setTimeFrom(now()));
    //        }
    //    }

    public function create(Request $request)
    {
        // validate check
        \Log::info('Request Create Session:', $request->all());

        $type = $request->session_type;
        $settings = \DB::table('service_settings')->where('service_type', $type)->first();

        if (!$settings) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Invalid session type',
                ],
                403,
            );
        }

        //         sunday closed
        if ($type === 'dine-in' && now()->isSunday()) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Maaf, Teras JTI libur pada hari minggu. Sampai jumpa senin pagi!',
                ],
                403,
            );
        }

        // check is open
        if (!$settings->is_active) {
            return response()->json(
                [
                    'success' => false,
                    'message' => $settings->custom_message ?: "layanan $type sedang dinonaktifkan",
                ],
                403,
            );
        }

        // check temporarily closed
        if ($settings->closed_until && now()->lessThan($settings->closed_until)) {
            return response()->json(
                [
                    'success' => false,
                    'message' =>
                        $settings->custom_message ?:
                        "layanan $type sedang tutup sampai " .
                            Carbon::parse($settings->closed_until)->format('d M Y H:i'),
                ],
                403,
            );
        }

        // check operational (just if service type have operational time)
        $now = now()->format('H:i:s');
        if ($now < $settings->open_time || $now > $settings->close_time) {
            return response()->json(
                [
                    'success' => false,
                    'message' =>
                        "Maaf layanan $type hanya tersedia pada jam " .
                        substr($settings->open_time, 0, 5) .
                        '-' .
                        substr($settings->close_time, 0, 5) .
                        ' WIB.',
                ],
                403,
            );
        }

        // check geofencing
        if ($type === 'dine-in') {
            $userLat = $request->latitude;
            $userLong = $request->longitude;

            if (!$userLat || !$userLong) {
                return response()->json(
                    [
                        'success' => false,
                        'message' => 'Lokasi diperlukan untuk pemesanan Dine In',
                    ],
                    403,
                );
            }

            $distance = $this->calculateDistance(
                $userLat,
                $userLong,
                $this->targetLat,
                $this->targetLong,
            );

            if ($distance > $this->radiusLimit) {
                return response()->json(
                    [
                        'success' => false,
                        'message' =>
                            'Anda berapa di luar area Teras JTI. Silahkan pesan pada area Teras JTI!',
                    ],
                    403,
                );
            }
        }

        $ip = $request->ip();
        $type = $request->session_type;

        SessionToken::where('ip_address', $ip)
            ->where('session_type', $type)
            ->where('status', 'active')
            ->update([
                'status' => 'expired',
            ]);

        $minute = $type === 'dine-in' ? 30 : 360;
        $sessionToken = now()->format('dm') . '-' . Str::upper(Str::random(6));
        $session = SessionToken::create([
            'token' => $sessionToken,
            'session_type' => $type,
            'ip_address' => $request->ip(),
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'created_at' => now(),
            'expired_at' => now()->addMinutes($minute),
            'status' => 'active',
        ]);

        $parts = explode('-', $sessionToken);
        $orderToken = $parts[1] . '-' . $parts[0];

        OrderToken::create([
            'session_token_id' => $session->token_id,
            'token' => $orderToken,
            'total_price_estimate' => 0,
            'created_at' => now(),
            'expired_at' => $session->expired_at,
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'token' => $sessionToken,
            'expired_at' => $session->expired_at,
        ]);
    }

    public function validateSession(Request $request)
    {
        $token = $request->token;

        if (!$token) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Token eror dalam request',
                ],
                400,
            );
        }

        $session = SessionToken::where('token', $request->token)->first();

        // session check
        if (!$session) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Sesi tidak ditemukan',
                ],
                404,
            );
        }

        $orderSession = OrderToken::where('session_token_id', $session->token_id)->first();

        $now = Carbon::now();
        $expiry = Carbon::parse($session->expired_at);

        // expired check
        if ($now->greaterThan($expiry) || $session->status === 'expired') {
            if ($session->status !== 'expired') {
                $session->update([
                    'status' => 'expired',
                ]);
                if ($orderSession) {
                    $orderSession->update([
                        'status' => 'expired',
                    ]);
                }
            }
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Session expired',
                ],
                401,
            );
        }

        // ip check
        if ($session->ip_address !== $request->ip()) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Alamat IP tidak cocok',
                ],
                403,
            );
        }

        return response()->json([
            'success' => true,
            'expired_at' => $session->expired_at,
        ]);
    }

    // geofencing formula
    public function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a =
            sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }
}
