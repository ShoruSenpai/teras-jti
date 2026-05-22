<?php

namespace App\Http\Controllers;

use PDO;
use DateTimeImmutable;
use Exception;

class SessionController extends Controller
{
    private float $targetLat = -8.15740159509914;
    private float $targetLong = 113.72300532798566;
    private float $radiusLimit = 0.05;

        public function create(): void
        {
            $request = json_decode(file_get_contents('php://input'), true) ?? [];

            error_log('Request Create Session: ' . json_encode($request));

            $type = $request['session_type'] ?? null;

            $stmt = $this->db->prepare("SELECT * FROM service_settings WHERE service_type = :type LIMIT 1");
            $stmt->execute(['type' => $type]);
            $settings = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$settings) {
                $this->json(['success' => false], 'Invalid session type', 403);
                return;
            }

            $now = new DateTimeImmutable();

            // check days opened
            if ($type === 'dine-in' && $now->format('w') === '0') {
                $this->json(['success' => false], 'Maaf, Teras JTI libur pada hari minggu. Sampai jumpa senin pagi!', 403);
                return;
            }

            // check active route
            if (!(bool)$settings['is_active']) {
                $msg = $settings['custom_message'] ?: "Layanan $type sedang dinonaktifkan";
                $this->json(['success' => false], $msg, 403);
                return;
            }

            // check maintenance time
            if (!empty($settings['closed_until'])) {
                $closedUntil = new DateTimeImmutable($settings['closed_until']);
                if ($now < $closedUntil) {
                    $msg = $settings['custom_message'] ?: "Layanan $type sedang tutup sampai " . $closedUntil->format('d M Y H:i');
                    $this->json(['success' => false], $msg, 403);
                    return;
                }
            }

            // check closed time
            $currentTimeStr = $now->format('H:i:s');
            if ($currentTimeStr < $settings['open_time'] || $currentTimeStr > $settings['close_time']) {
                $open = substr($settings['open_time'], 0, 5);
                $close = substr($settings['close_time'], 0, 5);
                $this->json(['success' => false], "Maaf layanan $type hanya tersedia pada jam $open-$close WIB.", 403);
                return;
            }

            // check geofencing
            if ($type === 'dine-in') {
                $userLat = isset($request['latitude']) ? (float)$request['latitude'] : null;
                $userLong = isset($request['longitude']) ? (float)$request['longitude'] : null;

                if (!$userLat || !$userLong) {
                    $this->json(['success' => false], 'Lokasi diperlukan untuk pemesanan Dine In', 403);
                    return;
                }

                $distance = $this->calculateDistance($userLat, $userLong, $this->targetLat, $this->targetLong);

                if ($distance > $this->radiusLimit) {
                    $this->json(['success' => false], 'Anda berada di luar area Teras JTI. Silahkan pesan pada area Teras JTI!', 403);
                    return;
                }
            }

            $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
//            $userLat = isset($request['latitude']) ? (float)$request['latitude'] : null;
//            $userLong = isset($request['longitude']) ? (float)$request['longitude'] : null;

            try {
                $this->db->beginTransaction();

                $updateStmt = $this->db->prepare("
                    UPDATE session_token 
                    SET status = 'expired' 
                    WHERE ip_address = :ip AND session_type = :type AND status = 'active'
                ");
                $updateStmt->execute(['ip' => $ip, 'type' => $type]);

                $minute = ($type === 'dine-in') ? 30 : 360;
                $expiredAt = $now->modify("+{$minute} minutes");

                $sessionToken = $now->format('dm') . '-' . $this->generateRandomString(6);

                $insertSession = $this->db->prepare("
                    INSERT INTO session_token (token, session_type, ip_address, latitude, longitude, created_at, expired_at, status)
                    VALUES (:token, :type, :ip, :lat, :long, :created, :expired, 'active')
                ");
                $insertSession->execute([
                    'token'   => $sessionToken,
                    'type'    => $type,
                    'ip'      => $ip,
                    'lat'     => $userLat ?? null,
                    'long'    => $userLong ?? null,
                    'created' => $now->format('Y-m-d H:i:s'),
                    'expired' => $expiredAt->format('Y-m-d H:i:s')
                ]);

                $sessionTokenId = $this->db->lastInsertId();

                $parts = explode('-', $sessionToken);
                $orderToken = $parts[1] . '-' . $parts[0];

                $insertOrder = $this->db->prepare("
                    INSERT INTO order_token (session_token_id, token, total_price_estimate, created_at, expired_at, status)
                    VALUES (:session_id, :token, 0, :created, :expired, 'active')
                ");
                $insertOrder->execute([
                    'session_id' => $sessionTokenId,
                    'token'      => $orderToken,
                    'created'    => $now->format('Y-m-d H:i:s'),
                    'expired'    => $expiredAt->format('Y-m-d H:i:s')
                ]);

                $this->db->commit();

                $this->json([
                    'success'    => true,
                    'token'      => $sessionToken,
                    'expired_at' => $expiredAt->format('Y-m-d H:i:s')
                ]);

            } catch (Exception $e) {
                $this->db->rollBack();
                $this->json([
                    'success' => false
                ],
                    'Terjadi kesalahan sistem: ' . $e->getMessage(),
                    500);
            }
        }

    public function validateSession(): void
    {
        $request = json_decode(file_get_contents('php://input'), true) ?? [];
        $token = $request['token'] ?? null;
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

        if (!$token) {
            $this->json(['success' => false], 'Token error dalam request', 400);
            return;
        }

        $stmt = $this->db->prepare("SELECT * FROM session_token WHERE token = :token LIMIT 1");
        $stmt->execute(['token' => $token]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$session) {
            $this->json(['success' => false], 'Sesi tidak ditemukan', 404);
            return;
        }

        $now = new DateTimeImmutable();
        $expiry = new DateTimeImmutable($session['expired_at']);

        if ($now > $expiry || $session['status'] === 'expired') {
            if ($session['status'] !== 'expired') {
                try {
                    $this->db->beginTransaction();

                    $updSession = $this->db->prepare("UPDATE session_token SET status = 'expired' WHERE token_id = :id");
                    $updSession->execute(['id' => $session['token_id']]);

                    $updOrder = $this->db->prepare("UPDATE order_token SET status = 'expired' WHERE session_token_id = :session_id");
                    $updOrder->execute(['session_id' => $session['token_id']]);

                    $this->db->commit();
                } catch (Exception $e) {
                    $this->db->rollBack();
                }
            }
            $this->json(['success' => false], 'Session expired', 401);
            return;
        }

        if ($session['ip_address'] !== $ipAddress) {
            $this->json(['success' => false], 'Alamat IP tidak cocok', 403);
            return;
        }

        $this->json([
            'success'    => true,
            'expired_at' => $session['expired_at']
        ]);
    }

    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
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

    private function generateRandomString(int $length = 6): string
    {
        $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[random_int(0, $charactersLength - 1)];
        }
        return $randomString;
    }
}