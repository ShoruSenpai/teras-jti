<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

// database models
use App\Http\Models\OrderHistory;
use App\Http\Models\OrderDetail;
use App\Http\Models\Menu;
use App\Http\Models\Cart;
use App\Http\Models\CartItem;
use App\Http\Models\OrderToken;

class OrderManagementController extends Controller
{
    public function storeFromPOS(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'order_type' => 'required|in:dine-in,take-away',
            'order_method' => 'required|in:online,offline',
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:menu_list,menu_id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
            'total' => 'required|numeric',
        ]);

        $admin = $request->attributes->get('admin_user');

        DB::beginTransaction();

        try {
            $order = OrderHistory::create([
                'order_token_id' => null,
                'token' => $request->token,
                'order_method' => 'offline',
                'order_type' => $request->order_type,
                'order_time' => now(),
                'paid_at' => now(),
                'total_price' => $request->total,
                'status' => 'paid',
                'cashier_id' => $admin->admin_id,
            ]);

            foreach ($request->items as $item) {
                $subtotal = $item['price'] * $item['qty'];

                OrderDetail::create([
                    'order_id' => $order->order_id,
                    'menu_id' => $item['id'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'subtotal' => $subtotal,
                ]);

                Menu::where('menu_id', $item['id'])->decrement('menu_stock', $item['qty']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat!',
                'data' => [
                    'order_id' => $order->order_id,
                    'invoice' => $request->order_type,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(
                [
                    'success' => false,
                    'message' => 'Gagal membuat pesanan: ' . $e->getMessage(),
                ],
                500,
            );
        }
    }

    public function getActiveOrders()
    {
        $orders = OrderHistory::with(['details.menu'])
            ->orderBy('order_time', 'desc')
            ->limit(50)
            ->get();

        $formattedOrders = $orders->map(function ($order) {
            return [
                'id' => $order->token,
                'type' => $order->order_type === 'dine-in' ? 'Dine In' : 'Take Away',
                'time' => Carbon::parse($order->order_time)->format('H:i'),
                'status' => ucfirst($order->status),
                'total' => (int) $order->total_price,
                'items' => $order->details->map(function ($detail) {
                    return [
                        'name' => $detail->menu ? $detail->menu->menu_name : 'Menu Dihapus',
                        'qty' => $detail->qty,
                    ];
                }),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedOrders,
        ]);
    }

    public function getOrderByToken($token)
    {
        $orderToken = OrderToken::where('token', $token)->where('status', 'active')->first();

        if (!$orderToken) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Token tidak valid, sudah expired, atau sudah digunakan.',
                ],
                404,
            );
        }

        $cart = Cart::where('session_token_id', $orderToken->session_token_id)->first();

        if (!$cart) {
            return response()->json(
                ['success' => false, 'message' => 'Keranjang kosong untuk token ini.'],
                404,
            );
        }

        $cartItems = CartItem::with('menu')->where('cart_id', $cart->cart_id)->get();

        $formattedItems = $cartItems->map(function ($item) {
            return [
                'id' => $item->menu_id,
                'name' => $item->menu ? $item->menu->menu_name : 'Unknown Item',
                'qty' => $item->qty,
                'price' => $item->price,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $orderToken->token,
                'items' => $formattedItems,
            ],
        ]);
    }
}
