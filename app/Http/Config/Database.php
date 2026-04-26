<?php

namespace App\Http\Config;

use PDO;
use PDOException;

class Database
{
    private $host = "localhost";
    private $user = "root";
    private $pass = "@ShoruKun01";
    private $dbname = "teras_db";
    public $conn;

    public function getConnection()
    {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host" .
                    $this->host .
                    ";dbname" .
                    $this->dbname .
                    $this->user .
                    $this->pass,
            );

            $this->conn->setAttribute(
                PDO::ATTR_ERRMODE,
                PDO::ERRMODE_EXCEPTION,
            );

            $this->conn->setAttribute(
                PDO::ATTR_DEFAULT_FETCH_MODE,
                PDO::FETCH_ASSOC,
            );

            $this->conn->exec("set names utf8");
        } catch (PDOException $e) {
            header("content-type: application/json");
            http_response_code(500);
            echo json_encode([
                "message" => "Connection failed: " . $e->getMessage(),
            ]);
            exit();
        }
        return $this->conn;
    }
}
