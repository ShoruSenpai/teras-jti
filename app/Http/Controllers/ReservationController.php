<?php

namespace App\Http\Controllers;

use PDO;
use DateTimeImmutable;
use Exception;
use Midtrans\Config;
use Midtrans\Snap;

class ReservationController extends Controller
{
    private ?array $session = null;

    public function setSession(array $session): void
    {
        $this->session = $session;
    }

    private function getSession(): ?array
    {
        return $this->session;
    }

    public function getMonthAvailability(): void
    {
        $month = $_GET['month'] ?? null;

        if (!$month) {
            $this->json([], 'Month is required', 400);
            return;
        }

        $totalArea = (int)$this->db->query("SELECT COUNT(*) FROM reservation_area")->fetchColumn();

        $stmt = $this->db->prepare("
            SELECT DATE(reservation_datetime) as date, COUNT(*) as booked_count
            FROM reservation
            WHERE reservation_datetime LIKE ? AND status IN ('confirmed', 'pending')
            GROUP BY DATE(reservation_datetime)
        ");
        $stmt->execute(["{$month}%"]);
        $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $availability = [];
        foreach ($reservations as $row) {
            $availability[$row['date']] = [
                'is_full' => $row['booked_count'] >= $totalArea,
                'booked_count' => (int)$row['booked_count']
            ];
        }

        $this->json([
            'data' => $availability
        ],
            '',
            200);
    }

    public function checkAvailability(): void
    {
        $date = $_GET['date'] ?? null;

        if (!$date) {
            $this->json([], 'Date is required', 400);
            return;
        }

        $requestDate = new DateTimeImmutable($date);
        $tomorrow = (new DateTimeImmutable())->modify('tomorrow');

        if ($requestDate < $tomorrow) {
            $this->json([], 'Reservasi minimal dilakukan minimal 1 hari sebelum kedatangan.', 400);
            return;
        }

        $stmtBooked = $this->db->prepare("
            SELECT area_id 
            FROM reservation 
            WHERE DATE(reservation_datetime) = ? AND status IN ('confirmed', 'pending')
        ");
        $stmtBooked->execute([$requestDate->format('Y-m-d')]);
        $bookedAreaIds = $stmtBooked->fetchAll(PDO::FETCH_COLUMN);

        $areas = $this->db->query("SELECT * FROM reservation_area")->fetchAll(PDO::FETCH_ASSOC);

        $mappedAreas = array_map(function ($area) use ($bookedAreaIds) {
            return [
                'area_id' => $area['area_id'],
                'area_name' => $area['area_name'],
                'price' => $area['reservation_price'],
                'isAvailable' => !in_array($area['area_id'], $bookedAreaIds)
            ];
        }, $areas);

        $this->json(['data' => $mappedAreas]);
    }

    public function storeStep1(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $date = $input['date'] ?? '';
        $areaId = $input['area_id'] ?? null;

        $requestDate = new DateTimeImmutable($date);
        $tomorrow = (new DateTimeImmutable())->modify('tomorrow');

        if ($requestDate < $tomorrow) {
            $this->json([], 'Reservasi minimal dilakukan minimal 1 hari sebelum kedatangan.', 400);
            return;
        }

        $session = $this->getSession();
        if (!$session) {
            $this->json([], 'Sesi tidak valid', 403);
            return;
        }

        $now = (new DateTimeImmutable())->format('Y-m-d H:i:s');
        $customerName = $session['customer_name'] ?? 'Session: ' . substr($session['token'], 0, 8);
        $customerPhone = $session['customer_phone'] ?? '08123456789';

        $stmtCheck = $this->db->prepare("SELECT reservation_id FROM reservation WHERE session_token_id = ? LIMIT 1");
        $stmtCheck->execute([$session['token_id']]);
        $existing = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $stmtUpdate = $this->db->prepare("
                UPDATE reservation 
                SET reservation_datetime = ?, area_id = ?, status = 'pending', updated_at = ? 
                WHERE reservation_id = ?
            ");
            $stmtUpdate->execute(["{$date} 00:00:00", $areaId, $now, $existing['reservation_id']]);
            $reservationId = $existing['reservation_id'];
        } else {
            $stmtInsert = $this->db->prepare("
                INSERT INTO reservation (session_token_id, reservation_datetime, area_id, status, reservation_duration, customer_name, customer_phone, guest_count, created_at, updated_at)
                VALUES (?, ?, ?, 'pending', 0, ?, ?, 0, ?, ?)
            ");
            $stmtInsert->execute([$session['token_id'], "{$date} 00:00:00", $areaId, $customerName, $customerPhone, $now, $now]);
            $reservationId = $this->db->lastInsertId();
        }

        $this->json(['reservation_id' => $reservationId]);
    }

    public function storeStep2(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $session = $this->getSession();

        if (!$session) {
            $this->json([], 'Sesi tidak valid', 403);
            return;
        }

        $stmtRes = $this->db->prepare("
            SELECT r.*, a.area_name, a.minimum_guest, a.maximum_guest 
            FROM reservation r
            JOIN reservation_area a ON r.area_id = a.area_id
            WHERE r.session_token_id = ? LIMIT 1
        ");
        $stmtRes->execute([$session['token_id']]);
        $reservation = $stmtRes->fetch(PDO::FETCH_ASSOC);

        if (!$reservation) {
            $this->json([], 'Reservation not found', 404);
            return;
        }

        $minGuest = $reservation['minimum_guest'] ?? 10;
        $maxGuest = $reservation['maximum_guest'] ?? 20;
        $guestCount = (int)($input['guest_count'] ?? 0);

        if ($guestCount < $minGuest || $guestCount > $maxGuest) {
            $this->json([], "Kapasitas untuk {$reservation['area_name']} adalah {$minGuest} hingga {$maxGuest}.", 400);
            return;
        }

        $dateOnly = (new DateTimeImmutable($reservation['reservation_datetime']))->format('Y-m-d');
        $timeInput = $input['reservation_time'] ?? '';

        try {
            $checkInCarbon = new DateTimeImmutable("{$dateOnly} {$timeInput}");
        } catch (Exception $e) {
            $this->json([], 'Format waktu tidak sesuai', 400);
            return;
        }

        $openTime = new DateTimeImmutable("{$dateOnly} 08:00:00");
        $closeTime = new DateTimeImmutable("{$dateOnly} 19:00:00");

        if ($checkInCarbon < $openTime || $checkInCarbon > $closeTime) {
            $this->json([], 'Jam checkin reservasi harus diantara jam 7 pagi sampai 7 malam', 400);
            return;
        }

        $duration = (int)($input['reservation_duration'] ?? 0);

        if ($duration < 3) {
            $this->json([], 'Durasi minimal adalah 3 jam.', 400);
            return;
        }

        $checkOutCarbon = $checkInCarbon->modify("+{$duration} hours");
        $maxCloseTime = new DateTimeImmutable("{$dateOnly} 22:00:00"); // Asumsi batas tutup mall/kafe 10 malam dari pesan aslimu

        if ($checkOutCarbon > $maxCloseTime) {
            $this->json([], 'Check-out melebihi waktu tutup (10 malam). Silahkan kurangi waktu durasi atau majukan check-in', 400);
            return;
        }

        $stmtUpd = $this->db->prepare("
            UPDATE reservation 
            SET reservation_datetime = ?, reservation_duration = ?, customer_name = ?, customer_phone = ?, guest_count = ?, updated_at = ?
            WHERE reservation_id = ?
        ");
        $stmtUpd->execute([
            $checkInCarbon->format('Y-m-d H:i:s'),
            $duration,
            $input['customer_name'] ?? '',
            $input['customer_phone'] ?? '',
            $guestCount,
            (new DateTimeImmutable())->format('Y-m-d H:i:s'),
            $reservation['reservation_id']
        ]);

        $this->json([]);
    }

    public function calculateTotal(): void
    {
        $session = $this->getSession();

        $stmtRes = $this->db->prepare("
            SELECT r.*, a.price_unit, a.reservation_price 
            FROM reservation r
            JOIN reservation_area a ON r.area_id = a.area_id
            WHERE r.session_token_id = ? LIMIT 1
        ");
        $stmtRes->execute([$session['token_id']]);
        $reservation = $stmtRes->fetch(PDO::FETCH_ASSOC);

        if (!$reservation) {
            $this->json([], 'Reservation not found', 404);
            return;
        }

        $priceUnit = $reservation['price_unit'] > 0 ? $reservation['price_unit'] : 1;
        $requestDuration = (int)$reservation['reservation_duration'];
        $billedBlock = ceil($requestDuration / $priceUnit);
        $areaPrice = $billedBlock * ($reservation['reservation_price'] ?? 0);

        $stmtMenu = $this->db->prepare("SELECT SUM(qty) as total_items, SUM(subtotal) as total FROM reservation_menu WHERE reservation_id = ?");
        $stmtMenu->execute([$reservation['reservation_id']]);
        $menuData = $stmtMenu->fetch(PDO::FETCH_ASSOC);

        $totalItems = (int)$menuData['total_items'];
        $menuPrice = (int)$menuData['total'];

        $total = $areaPrice + $menuPrice;
        $minDp = $areaPrice + ($menuPrice * 0.5);

        $this->db->prepare("UPDATE reservation SET reservation_total = ?, updated_at = ? WHERE reservation_id = ?")
            ->execute([$total, (new DateTimeImmutable())->format('Y-m-d H:i:s'), $reservation['reservation_id']]);

        $this->json([
            'total_items'  => $totalItems,
            'total_price'  => $total,
            'data' => [
                'total'        => $total,
                'minDp'        => $minDp,
                'payNow'       => $menuPrice > 0 ? $minDp : $total,
                'billing_info' => [
                    'duration'        => $requestDuration,
                    'billed_blocks'   => $billedBlock,
                    'price_per_block' => $reservation['reservation_price'],
                    'area_total'      => $areaPrice,
                ]
            ]
        ]);
    }

    public function getPersonalData(): void
    {
        $session = $this->getSession();
        $stmt = $this->db->prepare("SELECT * FROM reservation WHERE session_token_id = ? LIMIT 1");
        $stmt->execute([$session['token_id']]);
        $reservation = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$reservation) {
            $this->json([], 'Reservation not found', 404);
            return;
        }

        $time = (new DateTimeImmutable($reservation['reservation_datetime']))->format('H:i');

        $this->json([
            'data' => [
                'customer_name' => str_contains($reservation['customer_name'], 'Session:') ? '' : $reservation['customer_name'],
                'customer_phone' => $reservation['customer_phone'] === '08123456789' ? '' : $reservation['customer_phone'],
                'guest_count' => $reservation['guest_count'] == 0 ? '' : $reservation['guest_count'],
                'reservation_time' => $time === '00:00' ? '' : $time,
                'reservation_duration' => $reservation['reservation_duration'] == 0 ? '' : $reservation['reservation_duration'],
            ]
        ]);
    }

    public function getPreorderCart(): void
    {
        $session = $this->getSession();
        $stmt = $this->db->prepare("SELECT reservation_id FROM reservation WHERE session_token_id = ? LIMIT 1");
        $stmt->execute([$session['token_id']]);
        $resId = $stmt->fetchColumn();

        if (!$resId) {
            $this->json([], 'Reservation not found', 404);
            return;
        }

        $stmtItems = $this->db->prepare("
            SELECT rm.*, m.menu_name, m.menu_price, m.menu_image 
            FROM reservation_menu rm
            JOIN menu_list m ON rm.menu_id = m.menu_id
            WHERE rm.reservation_id = ?
        ");
        $stmtItems->execute([$resId]);
        $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

        foreach ($items as &$item) {
            $item['menu'] = [
                'menu_id' => $item['menu_id'],
                'menu_name' => $item['menu_name'],
                'menu_price' => $item['menu_price'],
                'menu_image' => $item['menu_image']
            ];
            unset($item['menu_name'], $item['menu_price'], $item['menu_image']);

            $stmtOpts = $this->db->prepare("
                SELECT rmo.*, mov.option_value, mov.extra_price
                FROM reservation_menu_option rmo
                JOIN menu_option_value mov ON rmo.option_value_id = mov.option_value_id
                WHERE rmo.reservation_menu_id = ?
            ");
            $stmtOpts->execute([$item['reservation_menu_id']]);
            $options = $stmtOpts->fetchAll(PDO::FETCH_ASSOC);

            $formattedOptions = [];
            foreach ($options as $opt) {
                $formattedOptions[] = [
                    'reservation_menu_id' => $opt['reservation_menu_id'],
                    'option_value_id' => $opt['option_value_id'],
                    'option_value' => [
                        'option_value_id' => $opt['option_value_id'],
                        'option_value' => $opt['option_value'],
                        'extra_price' => $opt['extra_price']
                    ]
                ];
            }
            $item['options'] = $formattedOptions;
        }

        $this->json(['data' => $items]);
    }

    public function addPreorderMenu(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $session = $this->getSession();

        $stmtRes = $this->db->prepare("SELECT reservation_id FROM reservation WHERE session_token_id = ? LIMIT 1");
        $stmtRes->execute([$session['token_id']]);
        $resId = $stmtRes->fetchColumn();

        if (!$resId) {
            $this->json([], 'Reservation not found', 404);
            return;
        }

        $menuId = $input['menu_id'] ?? null;
        $stmtMenu = $this->db->prepare("SELECT menu_price FROM menu_list WHERE menu_id = ? LIMIT 1");
        $stmtMenu->execute([$menuId]);
        $menu = $stmtMenu->fetch(PDO::FETCH_ASSOC);

        if (!$menu) {
            $this->json([], 'Menu not found', 404);
            return;
        }

        $stmtExist = $this->db->prepare("SELECT * FROM reservation_menu WHERE reservation_id = ? AND menu_id = ? LIMIT 1");
        $stmtExist->execute([$resId, $menuId]);
        $existing = $stmtExist->fetch(PDO::FETCH_ASSOC);

        $this->db->beginTransaction();
        try {
            if ($existing) {
                $newQty = $existing['qty'] + 1;
                $this->db->prepare("UPDATE reservation_menu SET qty = ?, subtotal = ? WHERE reservation_menu_id = ?")
                    ->execute([$newQty, $newQty * $menu['menu_price'], $existing['reservation_menu_id']]);
            } else {
                $this->db->prepare("INSERT INTO reservation_menu (reservation_id, menu_id, qty, price, subtotal) VALUES (?, ?, 1, ?, ?)")
                    ->execute([$resId, $menuId, $menu['menu_price'], $menu['menu_price']]);

                $newItemId = $this->db->lastInsertId();

                if (!empty($input['options']) && is_array($input['options'])) {
                    $stmtOpt = $this->db->prepare("INSERT INTO reservation_menu_option (reservation_menu_id, option_value_id) VALUES (?, ?)");
                    foreach ($input['options'] as $optionId) {
                        $stmtOpt->execute([$newItemId, $optionId]);
                    }
                }
            }
            $this->db->commit();
            $this->json([]);
        } catch (Exception $e) {
            $this->db->rollBack();
            $this->json([], $e->getMessage(), 500);
        }
    }

    public function updatePreorderMenuQty(int $id): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $action = $input['action'] ?? null;

        $stmt = $this->db->prepare("
            SELECT rm.*, m.menu_price 
            FROM reservation_menu rm
            JOIN menu_list m ON rm.menu_id = m.menu_id
            WHERE rm.reservation_menu_id = ? LIMIT 1
        ");
        $stmt->execute([$id]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$item) {
            $this->json([], 'Item not found', 404);
            return;
        }

        $newQty = $item['qty'];
        if ($action === 'plus') {
            $newQty++;
        } elseif ($action === 'minus') {
            $newQty--;
        }

        if ($newQty > 0) {
            $this->db->prepare("UPDATE reservation_menu SET qty = ?, subtotal = ? WHERE reservation_menu_id = ?")
                ->execute([$newQty, $newQty * $item['menu_price'], $id]);
        } else {
            $this->db->prepare("DELETE FROM reservation_menu WHERE reservation_menu_id = ?")->execute([$id]);
        }

        $this->json([]);
    }

    public function processCheckout(): void
    {
        $session = $this->getSession();

        $stmtRes = $this->db->prepare("
            SELECT r.*, a.reservation_price, a.price_unit, a.area_name 
            FROM reservation r
            JOIN reservation_area a ON r.area_id = a.area_id
            WHERE r.session_token_id = ? LIMIT 1
        ");
        $stmtRes->execute([$session['token_id']]);
        $reservation = $stmtRes->fetch(PDO::FETCH_ASSOC);

        if (!$reservation) {
            $this->json([], 'Reservation not found', 404);
            return;
        }

        Config::$serverKey = $_ENV['MIDTRANS_SERVER_KEY'] ?? '';
        Config::$isProduction = filter_var($_ENV['MIDTRANS_IS_PRODUCTION'] ?? false, FILTER_VALIDATE_BOOLEAN);
        Config::$isSanitized = true;
        Config::$is3ds = true;

        $orderId = 'JTI-RST-' . $reservation['reservation_id'] . '-' . time();
        $itemDetails = [];

        $priceUnit = $reservation['price_unit'] > 0 ? $reservation['price_unit'] : 1;
        $billedBlock = ceil($reservation['reservation_duration'] / $priceUnit);
        $areaPrice = $billedBlock * ($reservation['reservation_price'] ?? 0);

        if ($areaPrice > 0) {
            $itemDetails[] = [
                'id' => 'AREA-' . $reservation['area_id'],
                'price' => (int)$reservation['reservation_price'],
                'quantity' => (int)$billedBlock,
                'name' => 'Reservasi Tempat: ' . $reservation['area_name'],
            ];
        }

        $stmtMenu = $this->db->prepare("SELECT SUM(subtotal) as total FROM reservation_menu WHERE reservation_id = ?");
        $stmtMenu->execute([$reservation['reservation_id']]);
        $menuPrice = (int)$stmtMenu->fetchColumn();

        $dpMenuPrice = 0;
        if ($menuPrice > 0) {
            $dpMenuPrice = (int)round($menuPrice * 0.5);
            $itemDetails[] = [
                'id' => 'DP-MENU',
                'price' => $dpMenuPrice,
                'quantity' => 1,
                'name' => 'DP Pre-Order Menu (50%)',
            ];
        }

        $ppnTax = 1000;
        $itemDetails[] = [
            'id' => 'TAX-PPN',
            'price' => $ppnTax,
            'quantity' => 1,
            'name' => 'Biaya Layanan/PPN',
        ];

        $grossAmount = $areaPrice + $dpMenuPrice + $ppnTax;

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $grossAmount,
            ],
            'item_details' => $itemDetails,
            'customer_details' => [
                'first_name' => $reservation['customer_name'] ?: 'Guest',
                'phone' => $reservation['customer_phone'] ?: '-',
            ],
        ];

        try {
            $snapToken = Snap::getSnapToken($params);

            $this->json(['snap_token' => $snapToken]);
        } catch (Exception $e) {
            $this->json([], 'Gagal generate token pembayaran: ' . $e->getMessage(), 500);
        }
    }
}