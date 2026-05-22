<?php

// public controller
use App\Http\Controllers\BannerController;

// admin controller
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\OrderManagementController;
use App\Http\Controllers\Admin\MenuManagementController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ReservationManagementController;
use App\Http\Controllers\Admin\BannerManagementController;
use App\Http\Controllers\Admin\AccountManagementController;

// customer controller
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\ReservationController;
use App\Http\Controllers\Customer\SessionController;

// laravel default
use App\Http\Models\Menu;
use Illuminate\Support\Facades\Route;

//Route::get('/user', function (Request $request) {
//    return $request->user();
//})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| GLOBAL PUBLIC ROUTE
|--------------------------------------------------------------------------
*/
Route::get('/banners', [BannerController::class, 'index'])->middleware('throttle:global');

Route::prefix('customer')->group(function () {
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

        Route::prefix('reservation')
            ->middleware('throttle:reservation_handler')
            ->group(function () {
                // check table
                Route::get('/month-availability', [
                    ReservationController::class,
                    'getMonthAvailability',
                ]);
                Route::get('/availability', [ReservationController::class, 'checkAvailability']);

                // step by step
                Route::post('/step-area', [ReservationController::class, 'storeStep1']);
                Route::post('/step-personal-data', [ReservationController::class, 'storeStep2']);
                Route::get('/get-personal-data', [ReservationController::class, 'getPersonalData']);
                Route::get('/summary', [ReservationController::class, 'calculateTotal']);

                // get menu
                Route::get('/preorder-cart', [ReservationController::class, 'getPreorderCart']);
                Route::post('/preorder-add', [ReservationController::class, 'addPreorderMenu']);
                Route::post('/preorder-update/{itemId}', [
                    ReservationController::class,
                    'updatePreorderMenuQty',
                ]);

                Route::post('/checkout', [ReservationController::class, 'processCheckout']);
            });

        Route::post('/cart/checkout', [CartController::class, 'checkout'])->middleware(
            'throttle:sensitive_actions',
        );
    });
});

/*
|--------------------------------------------------------------------------
| Website Admin Panel (Staff Management)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->group(function () {
    // Login Guard
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Check Role Guard
    Route::middleware(['check.admin.auth'])->group(function () {
        //---------------------------------------------------------
        // Mix Permissions: Owner, Admin, & Cashier
        //---------------------------------------------------------
        Route::middleware(['role:owner,admin,cashier'])->group(function () {
            Route::put('/profile', [ProfileController::class, 'updateProfile']);
            Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
            Route::get('/menu', [MenuManagementController::class, 'index']);
        });

        //---------------------------------------------------------
        // POS Module Permissions: Owner & Cashier
        //---------------------------------------------------------
        Route::middleware(['role:owner,cashier'])->group(function () {
            Route::post('/orders', [OrderManagementController::class, 'storeFromPOS']);
            Route::get('/orders/token/{token}', [
                OrderManagementController::class,
                'getOrderByToken',
            ]);
        });

        //---------------------------------------------------------
        // Management Permissions: Owner & Admin
        //---------------------------------------------------------
        Route::middleware(['role:owner,admin'])->group(function () {
            // Reports Dashboard
            Route::get('/stats/summary', [DashboardController::class, 'getSummaryStats']);
            Route::get('/stats/recent-transactions', [
                DashboardController::class,
                'getRecentTransactions',
            ]);

            // CRUD Master Menu
            Route::apiResource('menu', MenuManagementController::class)->except(['index']);

            // Live Orders & Reservations Management
            Route::get('/orders/active', [OrderManagementController::class, 'getActiveOrders']);
            Route::get('/reservations', [ReservationManagementController::class, 'index']);
            Route::patch('/reservations/{id}/status', [
                ReservationManagementController::class,
                'updateStatus',
            ]);

            // CRUD Master Banner
            Route::get('/banners', [BannerManagementController::class, 'index']);
            Route::post('/banners', [BannerManagementController::class, 'store']);
            Route::put('/banners/{id}', [BannerManagementController::class, 'update']);
            Route::patch('/banners/{id}/toggle', [
                BannerManagementController::class,
                'toggleActive',
            ]);
            Route::delete('/banners/{id}', [BannerManagementController::class, 'destroy']);
        });

        //---------------------------------------------------------
        // Owner's Special Permission
        //---------------------------------------------------------
        Route::middleware(['role:owner'])->group(function () {
            // CRUD Management Staff
            Route::apiResource('accounts', AccountManagementController::class);
        });
    });
});
