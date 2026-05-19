<?php

namespace App\Http\Controllers;

use Exception;
use PDO;

class CartController extends Controller
{
    private ?array $session = null;

    public function setSession(array $session): void
    {
        $this->session = $session;
    }

    public function index(): void
    {
        $stmt = $this->db->prepare("SELECT * FROM cart WHERE session_token_id = ? LIMIT 1");
        $stmt->execute([$this->session['token_id']]);
        $cart = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cart) {
            $this->json([], 'Cart empty', 200);
            return;
        }

        $stmtItems = $this->db->prepare("
            SELECT ci.*, m.menu_name, m.menu_price, m.menu_image 
            FROM cart_item ci
            JOIN menu_list m ON ci.menu_id = m.menu_id
            WHERE ci.cart_id = ?
        ");
        $stmtItems->execute([$cart['cart_id']]);
        $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

        foreach ($items as &$item) {
            $item['menu'] = [
                'menu_id'    => $item['menu_id'],
                'menu_name'  => $item['menu_name'],
                'menu_price' => $item['menu_price'],
                'menu_image' => $item['menu_image']
            ];
            unset($item['menu_name'], $item['menu_image']);

            $stmtOpts = $this->db->prepare("
                SELECT cio.*, mov.option_value, mov.extra_price
                FROM cart_item_option cio
                JOIN menu_option_value mov ON cio.option_value_id = mov.option_value_id
                WHERE cio.cart_item_id = ?
            ");
            $stmtOpts->execute([$item['cart_item_id']]);
            $options = $stmtOpts->fetchAll(PDO::FETCH_ASSOC);

            $formattedOptions = [];
            foreach ($options as $opt) {
                $formattedOptions[] = [
                    'cart_item_id'    => $opt['cart_item_id'],
                    'option_value_id' => $opt['option_value_id'],
                    'option_value'    => [
                        'option_value_id' => $opt['option_value_id'],
                        'option_value'      => $opt['option_value'],
                        'extra_price'     => $opt['extra_price']
                    ]
                ];
            }
            $item['options'] = $formattedOptions;
        }

        $cart['items'] = $items;
        $this->json($cart, 'Success get cart');
    }

    public function store(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $menuId = $input['menu_id'] ?? null;
        $optionIds = $input['options'] ?? [];

        if (!$menuId) {
            $this->json([], 'Menu ID tidak boleh kosong', 400);
            return;
        }

        sort($optionIds);
        $variantKey = $menuId . (empty($optionIds) ? '' : '-' . implode('-', $optionIds));

        try {
            $this->db->beginTransaction();

            $stmtMenu = $this->db->prepare("SELECT menu_price FROM menu_list WHERE menu_id = ? LIMIT 1");
            $stmtMenu->execute([$menuId]);
            $menu = $stmtMenu->fetch(PDO::FETCH_ASSOC);

            if (!$menu) {
                throw new Exception("Menu tidak ditemukan");
            }

            $stmtCart = $this->db->prepare("SELECT cart_id FROM cart WHERE session_token_id = ?");
            $stmtCart->execute([$this->session['token_id']]);
            $cart = $stmtCart->fetch(PDO::FETCH_ASSOC);

            if (!$cart) {
                $this->db->prepare("INSERT INTO cart (session_token_id, created_at) VALUES (?, NOW())")
                    ->execute([$this->session['token_id']]);
                $cartId = (int)$this->db->lastInsertId();
            } else {
                $cartId = (int)$cart['cart_id'];
            }

            $finalPrice = (int)$menu['menu_price'];
            if (!empty($optionIds)) {
                $placeholders = implode(',', array_fill(0, count($optionIds), '?'));
                $stmtExtra = $this->db->prepare("SELECT SUM(extra_price) as extra FROM menu_option_value WHERE option_value_id IN ($placeholders)");
                $stmtExtra->execute($optionIds);
                $finalPrice += (int)$stmtExtra->fetch(PDO::FETCH_ASSOC)['extra'];
            }

            $stmtCheck = $this->db->prepare("SELECT cart_item_id, qty FROM cart_item WHERE cart_id = ? AND variant_key = ?");
            $stmtCheck->execute([$cartId, $variantKey]);
            $existingItem = $stmtCheck->fetch(PDO::FETCH_ASSOC);

            if ($existingItem) {
                $newQty = $existingItem['qty'] + 1;
                $this->db->prepare("UPDATE cart_item SET qty = ?, subtotal = ? WHERE cart_item_id = ?")
                    ->execute([$newQty, $newQty * $finalPrice, $existingItem['cart_item_id']]);
            } else {
                $stmtInsertItem = $this->db->prepare("INSERT INTO cart_item (cart_id, menu_id, variant_key, qty, price, subtotal) VALUES (?,?,?,?,?,?)");
                $stmtInsertItem->execute([$cartId, $menuId, $variantKey, 1, $finalPrice, $finalPrice]);
                $newItemId = $this->db->lastInsertId();

                if (!empty($optionIds)) {
                    $stmtOptInsert = $this->db->prepare("INSERT INTO cart_item_option (cart_item_id, option_value_id) VALUES (?,?)");
                    foreach ($optionIds as $oid) {
                        $stmtOptInsert->execute([$newItemId, $oid]);
                    }
                }
            }

            $this->db->commit();
            $this->json([], 'Berhasil ditambahkan ke keranjang');
        } catch (Exception $e) {
            $this->db->rollBack();
            $this->json([], $e->getMessage(), 500);
        }
    }

    public function getSummary(): void
    {
        $stmt = $this->db->prepare("
            SELECT SUM(ci.qty) as total_items, SUM(ci.subtotal) as total_price 
            FROM cart_item ci
            JOIN cart c ON ci.cart_id = c.cart_id
            WHERE c.session_token_id = ?
        ");
        $stmt->execute([$this->session['token_id']]);
        $summary = $stmt->fetch(PDO::FETCH_ASSOC);

        $this->json([
            'total_items' => (int)($summary['total_items'] ?? 0),
            'total_price' => (int)($summary['total_price'] ?? 0)
        ], 'Cart summary');
    }

    public function updateQty(int $itemId): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $action = $input['action'] ?? 'add';

        $stmt = $this->db->prepare("SELECT * FROM cart_item WHERE cart_item_id = ?");
        $stmt->execute([$itemId]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$item) {
            $this->json([], 'Item not found', 404);
            return;
        }

        if ($action === 'add') {
            $newQty = $item['qty'] + 1;
            $this->db->prepare("UPDATE cart_item SET qty = ?, subtotal = ? WHERE cart_item_id = ?")
                ->execute([$newQty, $newQty * $item['price'], $itemId]);
            $this->json([], 'Quantity ditambahkan');
        } else {
            if ($item['qty'] > 1) {
                $newQty = $item['qty'] - 1;
                $this->db->prepare("UPDATE cart_item SET qty = ?, subtotal = ? WHERE cart_item_id = ?")
                    ->execute([$newQty, $newQty * $item['price'], $itemId]);
                $this->json([], 'Quantity dikurangi');
            } else {
                $this->removeItem($itemId);
            }
        }
    }

    public function removeItem(int $itemId): void
    {
        $this->db->prepare("DELETE FROM cart_item WHERE cart_item_id = ?")->execute([$itemId]);
        $this->json([], 'Item berhasil dihapus');
    }

    public function checkout(): void
    {
        try {
            $this->db->beginTransaction();

            $stmtCart = $this->db->prepare("
                SELECT c.cart_id, SUM(ci.subtotal) as total 
                FROM cart c
                LEFT JOIN cart_item ci ON c.cart_id = ci.cart_id
                WHERE c.session_token_id = ?
                GROUP BY c.cart_id
            ");
            $stmtCart->execute([$this->session['token_id']]);
            $cartData = $stmtCart->fetch(PDO::FETCH_ASSOC);

            if (!$cartData || empty($cartData['total']) || $cartData['total'] <= 0) {
                throw new Exception("Gagal checkout! Keranjang kosong.");
            }

            $stmtOrder = $this->db->prepare("SELECT * FROM order_token WHERE session_token_id = ? LIMIT 1");
            $stmtOrder->execute([$this->session['token_id']]);
            $order = $stmtOrder->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                throw new Exception("Pesanan bermasalah, sesi tidak sinkron.");
            }

            $stmtUpdOrder = $this->db->prepare("
                UPDATE order_token 
                SET total_price_estimate = ?, status = 'active' 
                WHERE session_token_id = ?
            ");
            $stmtUpdOrder->execute([$cartData['total'], $this->session['token_id']]);

            $this->db->commit();

            $this->json([
                'order_token' => $order['token'],
                'total'       => (int)$cartData['total']
            ], 'Pesanan telah dikunci');

        } catch (Exception $e) {
            $this->db->rollBack();
            $this->json([], $e->getMessage(), 400);
        }
    }
}