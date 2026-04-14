<?php

use App\Http\Models\Cart;
use App\Http\Models\OrderToken;
use App\Http\Models\SessionToken;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    SessionToken::where('status', 'active')
        ->where('expired_at', '<', now())
        ->update([
            'status' => 'expired',
        ]);
    OrderToken::where('status', 'active')
        ->where('expired_at', '<', now())
        ->update([
            'status' => 'expired',
        ]);
})
    ->everyMinute()
    ->between('08:00', '22:00')
    ->skip(function () {
        return now()->isSunday();
    });

Schedule::call(function () {
    Cart::whereHas('session', function ($query) {
        $query->where('status', 'expired');
    })->delete();

    Log::info('Cleanup carts from session' . now());
})
    ->hourly()
    ->between('08:00', '22:00');
