<?php

use App\Http\Controllers\BannerController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\SessionController;
use App\Http\Models\Menu;
use Illuminate\Support\Facades\Route;

//Route::get('/user', function (Request $request) {
//    return $request->user();
//})->middleware('auth:sanctum');

Route::prefix('session')
    ->middleware('throttle:auth_session')
    ->group(function () {
        Route::post('/create', [SessionController::class, 'create']);
        Route::post('/validate', [SessionController::class, 'validateSession']);
    });

Route::middleware(['check.session'])->group(function () {
    Route::get('/menus', function () {
        return Menu::with(['category', 'optionGroup.options'])
            ->whereIn('status', ['available', 'sold_out'])
            ->select([
                'menu_id',
                'category_id',
                'menu_name',
                'menu_description',
                'menu_price',
                'menu_stock',
                'menu_image',
                'is_new',
                'is_recommended',
                'status',
            ])
            ->get();
    })->middleware('throttle:global');

    Route::prefix('cart')
        ->middleware('throttle:cart_handler')
        ->group(function () {
            Route::get('/', [CartController::class, 'index']);
            Route::post('/add', [CartController::class, 'store']);
            Route::get('/summary', [CartController::class, 'getSummary']);
            Route::post('/update/{itemId}', [CartController::class, 'updateQty']);
        });

    Route::post('/cart/checkout', [CartController::class, 'checkout'])->middleware(
        'throttle:sensitive_actions',
    );
});

Route::get('/banners', [BannerController::class, 'index'])->middleware('throttle:global');
