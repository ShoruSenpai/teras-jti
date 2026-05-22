<?php

use App\Http\Models\Cart;
use App\Http\Models\CartItem;
use App\Http\Models\OrderToken;
use App\Http\Models\SessionToken;
use App\Http\Models\OrderHistory;
use App\Http\Models\OrderDetail;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
//use Throwable;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    $expiredSessionsCount = SessionToken::where('status', 'active')
        ->where('expired_at', '<', now())
        ->update([
            'status' => 'expired',
        ]);

    if ($expiredSessionsCount > 0) {
        Log::info(
            "[Scheduler] {$expiredSessionsCount} Session Token kedaluwarsa telah diperbarui.",
        );
    }

    $expiredOrders = OrderToken::where('status', 'active')->where('expired_at', '<', now())->get();

    foreach ($expiredOrders as $orderToken) {
        try {
            DB::transaction(function () use ($orderToken) {
                $cart = Cart::where('session_token_id', $orderToken->session_token_id)->first();

                if ($cart) {
                    $history = OrderHistory::create([
                        'order_token_id' => $orderToken->order_token_id,
                        'token' => $orderToken->token,
                        'order_method' => 'offline',
                        'order_time' => now(),
                        'total_price' => $orderToken->total_price_estimate,
                        'status' => 'expired',
                    ]);

                    $cartItems = CartItem::where('cart_id', $cart->cart_id)->get();

                    foreach ($cartItems as $item) {
                        OrderDetail::create([
                            'order_id' => $history->order_id,
                            'menu_id' => $item->menu_id,
                            'qty' => $item->qty,
                            'price' => $item->price,
                            'subtotal' => $item->subtotal,
                        ]);
                    }

                    CartItem::where('cart_id', $cart->cart_id)->delete();
                    $cart->delete();

                    Log::info('[Scheduler] Order kedaluwarsa dipindah ke History', [
                        'token' => $orderToken->token,
                        'order_id' => $history->order_id,
                    ]);
                } else {
                    Log::warning(
                        '[Scheduler] Order kedaluwarsa diupdate, tapi Cart tidak ditemukan',
                        [
                            'token' => $orderToken->token,
                        ],
                    );
                }

                $orderToken->update([
                    'status' => 'expired',
                ]);
            });
        } catch (Throwable $e) {
            Log::error('[Scheduler] Gagal memproses Order Token kedaluwarsa', [
                'token' => $orderToken->token,
                'error' => $e->getMessage(),
            ]);
        }
    }
})
    ->everyMinute()
    ->between('08:00', '22:00')
    ->skip(function () {
        return now()->isSunday();
    });

Schedule::call(function () {
    $deletedCartsCount = Cart::whereHas('session', function ($query) {
        $query->where('status', 'expired');
    })->delete();

    if ($deletedCartsCount > 0) {
        Log::info(
            "[Garbage Collector] {$deletedCartsCount} Cart ditinggalkan berhasil dibersihkan.",
        );
    }
})
    ->hourly()
    ->between('08:00', '22:00');
