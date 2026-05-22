<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Models\Cart;
use App\Http\Models\CartItem;
use App\Http\Models\Menu;
use App\Http\Models\MenuOptionValue;
use App\Http\Models\OrderToken;
use App\Http\Models\SessionToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    // get all cart
    public function index(Request $request)
    {
        $token = $request->header('X-Session-Token');
        $session = SessionToken::where('token', $token)->first();

        if (!$session) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Sesi tidak valiid',
                ],
                403,
            );
        }

        $cart = Cart::where('session_token_id', $session->token_id)
            ->with(['items.menu', 'items.options.option_value'])
            ->first();

        return response()->json($cart);
    }

    // add cart
    public function store(Request $request)
    {
        $token = $request->header('X-Session-Token');
        $session = SessionToken::where('token', $token)->first();

        if (!$session) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Sesi tidak valiid',
                ],
                403,
            );
        }

        $cart = Cart::firstOrCreate(
            [
                'session_token_id' => $session->token_id,
            ],
            [
                'created_at' => now(),
            ],
        );

        $menuId = $request->menu_id;
        $optionIds = $request->options ?? [];

        sort($optionIds);
        $variantKey = $menuId . (empty($optionIds) ? '' : '-' . implode('-', $optionIds));

        $menu = Menu::findOrFail($menuId);
        $extraPrice = MenuOptionValue::whereIn('option_value_id', $optionIds)->sum('extra_price');
        $finalPrice = $menu->menu_price + $extraPrice;

        DB::beginTransaction();
        try {
            $cartItem = CartItem::where('cart_id', $cart->cart_id)
                ->where('variant_key', $variantKey)
                ->first();

            if ($cartItem) {
                $cartItem->increment('qty');
                $cartItem->update([
                    'subtotal' => $cartItem->qty * $finalPrice,
                ]);
            } else {
                $cartItem = CartItem::create([
                    'cart_id' => $cart->cart_id,
                    'menu_id' => $menuId,
                    'variant_key' => $variantKey,
                    'qty' => 1,
                    'price' => $finalPrice,
                    'subtotal' => $finalPrice,
                ]);

                foreach ($optionIds as $oid) {
                    DB::table('cart_item_option')->insert([
                        'cart_item_id' => $cartItem->cart_item_id,
                        'option_value_id' => $oid,
                    ]);
                }
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Berhasil ditambahkan ke keranjang',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(
                [
                    'success' => false,
                    'message' => $e->getMessage(),
                ],
                500,
            );
        }
    }

    // get summary cart
    public function getSummary(Request $request)
    {
        $token = $request->header('X-Session-Token');
        $session = SessionToken::where('token', $token)->first();
        $cart = Cart::where('session_token_id', $session->token_id)->first();

        if (!$cart) {
            return response()->json([
                'total_items' => 0,
                'total_price' => 0,
            ]);
        }

        $summary = CartItem::where('cart_id', $cart->cart_id)
            ->selectRaw('sum(qty) as total_items, sum(subtotal) as total_price')
            ->first();

        return response()->json([
            'total_items' => (int) $summary->total_items,
            'total_price' => (int) $summary->total_price,
        ]);
    }

    // update qty cart
    public function updateQty(Request $request, $itemId)
    {
        $item = CartItem::findOrFail($itemId);
        $action = $request->action;

        if ($action == 'add') {
            $item->increment('qty');
        } else {
            if ($item->qty > 1) {
                $item->decrement('qty');
            } else {
                return $this->removeItem($itemId);
            }
        }

        $item->update([
            'subtotal' => $item->qty * $item->price,
        ]);
        return response()->json([
            'success' => true,
        ]);
    }

    // remove item cart
    public function removeItem($itemId)
    {
        CartItem::destroy($itemId);
        return response()->json([
            'success' => true,
        ]);
    }

    // checkout items
    public function checkout(Request $request)
    {
        $token = $request->header('X-Session-Token');
        $session = SessionToken::where('token', $token)->first();

        if (!$session) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Sesi tidak valid.',
                ],
                403,
            );
        }

        $cart = Cart::where('session_token_id', $session->token_id)->first();

        if (!$cart || $cart->items()->count() == 0) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Gagal checkout! Keranjang kosong.',
                ],
                400,
            );
        }

        $totalFinal = $cart->items()->sum('subtotal');

        DB::beginTransaction();
        try {
            $order = OrderToken::where('session_token_id', $session->token_id)->first();

            $order->update([
                'total_price_estimate' => $totalFinal,
                'status' => 'active',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pesanan telah dikunci.',
                'order_token' => $order->token,

                'total' => $totalFinal,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(
                [
                    'success' => false,
                    'message' => $e->getMessage(),
                ],
                500,
            );
        }
    }
}
