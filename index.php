<?php
require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

date_default_timezone_set('Asia/Jakarta');

use App\Http\Config\Database;
use App\Http\Middleware\CheckSessionToken;
use App\Http\Controllers\BannerController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ReservationController;

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Session-Token");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

function sendJson($data, $message = '', $status = 200)
{
    header('Content-type: application/json');
    http_response_code($status);
    echo json_encode([
        'success' => $status >= 200 && $status < 300,
        'message' => $message,
        'data'    => $data
    ]);
    exit();
}

// =========================================================================
// ROUTE PUBLIC
// =========================================================================

if ($path === '/api/customer/banners' && $method === 'GET') {
    (new BannerController($db))->index();
}
elseif ($path === '/api/customer/session/create' && $method === 'POST') {
    (new SessionController($db))->create();
}
elseif ($path === '/api/customer/session/validate' && $method === 'POST') {
    (new SessionController($db))->validateSession();
}

// =========================================================================
// ROUTE PROTECTED
// =========================================================================
else {
    $middleware = new CheckSessionToken($db);
    $sessionData = $middleware->handle();

    if ($path === '/api/customer/menus' && $method === 'GET') {
        $stmt = $db->query("
            SELECT m.menu_id, m.category_id, m.menu_name, m.menu_description, 
                   m.menu_price, m.menu_stock, m.menu_image, m.is_new, 
                   m.is_recommended, m.status, c.category_name
            FROM menu_list m
            LEFT JOIN menu_category c ON m.category_id = c.category_id
            WHERE m.status IN ('available', 'sold_out')
        ");
        $menus = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($menus as &$menu) {
            $menu['category'] = [
                'category_id'   => $menu['category_id'],
                'category_name' => $menu['category_name']
            ];
            unset($menu['category_name']);

            $stmtGroup = $db->prepare("SELECT option_group_id, option_group_name FROM menu_option_group WHERE menu_id = ?");
            $stmtGroup->execute([$menu['menu_id']]);
            $groups = $stmtGroup->fetchAll(PDO::FETCH_ASSOC);

            foreach ($groups as &$group) {
                $stmtValues = $db->prepare("SELECT option_value_id, option_value, extra_price FROM menu_option_value WHERE option_group_id = ?");
                $stmtValues->execute([$group['option_group_id']]);
                $group['options'] = $stmtValues->fetchAll(PDO::FETCH_ASSOC);
            }
            $menu['option_group'] = $groups;
        }
        sendJson($menus);
    }

    elseif (str_starts_with($path, '/api/customer/cart')) {
        $cartController = new CartController($db);
        $cartController->setSession($sessionData);

        if ($path === '/api/customer/cart' && $method === 'GET') {
            $cartController->index();
        }
        elseif ($path === '/api/customer/cart/add' && $method === 'POST') {
            $cartController->store();
        }
        elseif ($path === '/api/customer/cart/summary' && $method === 'GET') {
            $cartController->getSummary();
        }
        elseif ($path === '/api/customer/cart/checkout' && $method === 'POST') {
            $cartController->checkout();
        }
        elseif (preg_match('#^/api/customer/cart/update/(\d+)$#', $path, $matches) && $method === 'POST') {
            $cartController->updateQty((int)$matches[1]);
        }
        else {
            sendJson([], 'Endpoint Cart tidak ditemukan', 404);
        }
    }

    elseif (str_starts_with($path, '/api/customer/reservation')) {
        $resController = new ReservationController($db);
        $resController->setSession($sessionData); // Inject Data Session

        if ($path === '/api/customer/reservation/month-availability' && $method === 'GET') {
            $resController->getMonthAvailability();
        }
        elseif ($path === '/api/customer/reservation/availability' && $method === 'GET') {
            $resController->checkAvailability();
        }
        elseif ($path === '/api/customer/reservation/step-area' && $method === 'POST') {
            $resController->storeStep1();
        }
        elseif ($path === '/api/customer/reservation/step-personal-data' && $method === 'POST') {
            $resController->storeStep2();
        }
        elseif ($path === '/api/customer/reservation/get-personal-data' && $method === 'GET') {
            $resController->getPersonalData();
        }
        elseif ($path === '/api/customer/reservation/summary' && $method === 'GET') {
            $resController->calculateTotal();
        }
        elseif ($path === '/api/customer/reservation/preorder-cart' && $method === 'GET') {
            $resController->getPreorderCart();
        }
        elseif ($path === '/api/customer/reservation/preorder-add' && $method === 'POST') {
            $resController->addPreorderMenu();
        }
        elseif ($path === '/api/customer/reservation/checkout' && $method === 'POST') {
            $resController->processCheckout();
        }
        elseif (preg_match('#^/api/customer/reservation/preorder-update/(\d+)$#', $path, $matches) && $method === 'POST') {
            $resController->updatePreorderMenuQty((int)$matches[1]);
        }
        else {
            sendJson([], 'Endpoint Reservation tidak ditemukan', 404);
        }
    }

    else {
        sendJson([], 'Endpoint tidak valid', 404);
    }
}