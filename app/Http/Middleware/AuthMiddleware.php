<?php
declare(strict_types=1);

namespace App\Http\Middleware;

use DateTime;
use PDO;
use DateTimeImmutable;

class AuthMiddleware
{
    public function __construct(private readonly PDO $db) {}

    public function handle(): ?array
    {
        $headers = getallheaders();
        $token = $headers["X-Session-Token"] ?? $_GET["token"];

        if (!$token) {
            $this->sendResponse(
                false,
                "Access denied! Session token not found",
                401,
            );
        }

        $stmt = $this->db->prepare(
            "SELECT id, expired_at, ip_address FROM  session_token WHERE  token = :token AND status = 'active' LIMIT 1",
        );
        $stmt->execute(["token" => $token]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);

        $currentIp = $_SERVER["REMOTE_ADDR"];

        $now = new DateTimeImmutable();

        if (
            !$session ||
            $now > new DateTimeImmutable($session["expired_at"]) ||
            $session["ip_address"] != $currentIp
        ) {
            if ($session) {
                $updateStmt = $this->db->prepare(
                    "UPDATE session_token SET status = 'expired' WHERE id = :id",
                );
                $updateStmt->execute(["id" => $session["id"]]);
            }
            $this->sendResponse(
                false,
                "Sesi tidak valid atau telah habis.",
                401,
            );
        }
        return true;
    }

    private function sendResponse(
        bool $status,
        string $message,
        int $statusCode,
    ): never {
        http_response_code($statusCode);
        header("Content-Type: application/json");

        echo json_encode([
            "status" => $status,
            "message" => $message,
        ]);

        exit();
    }
}
