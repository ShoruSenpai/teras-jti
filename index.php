<?php
require_once "vendor/autoload.php";

use App\Http\Config\Database;

$database = new Database();
$db = $database->getConnection();
