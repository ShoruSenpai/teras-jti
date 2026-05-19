<?php

namespace App\Http\Controllers;

use PDO;

abstract class Controller
{
    public function __construct(protected readonly PDO $db){}

    protected function json(array $data, string $message = '', int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json');

        if (!empty($message)) {
            $data['message'] = $message;
        }

        echo json_encode($data);
    }
}