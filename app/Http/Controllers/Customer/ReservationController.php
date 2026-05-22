<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Models\Menu;
use App\Http\Models\Reservation;
use App\Http\Models\ReservationArea;
use App\Http\Models\ReservationMenu;
use App\Http\Models\ReservationMenuOption;
use App\Http\Models\SessionToken;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Midtrans\Config;
use Midtrans\Snap;

class ReservationController extends Controller
{
    public function getMonthAvailability(Request $request)
    {
        $month = $request->query('month');

        if (!$month) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Month is required',
                ],
                400,
            );
        }

        $totalArea = ReservationArea::count();

        $reservation = Reservation::where('reservation_datetime', 'like', $month . '%')
            ->whereIn('status', ['confirmed', 'pending'])
            ->get();

        $groupReservation = $reservation->groupBy(function ($item) {
            return Carbon::parse($item->reservation_datetime)->format('Y-m-d');
        });

        $availability = [];
        foreach ($groupReservation as $date => $books) {
            $availability[$date] = [
                'is_full' => $books->count() >= $totalArea,
                'booked_count' => $books->count(),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $availability,
        ]);
    }

    public function checkAvailability(Request $request)
    {
        $date = $request->query('date');

        if (!$date) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Date is required',
                ],
                400,
            );
        }

        $requestDate = Carbon::parse($date)->startOfDay();
        $tomorrow = Carbon::tomorrow();

        if ($requestDate->lessThan($tomorrow)) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Reservasi minimal dilakukan minimal 1 hari sebelum kedatangan.',
                ],
                400,
            );
        }

        $bookedAreaId = Reservation::whereDate('reservation_datetime', $date)
            ->whereIn('status', ['confirmed', 'pending'])
            ->pluck('area_id');

        $areas = ReservationArea::all()->map(function ($area) use ($bookedAreaId) {
            return [
                'area_id' => $area->area_id,
                'area_name' => $area->area_name,
                'price' => $area->reservation_price,
                'isAvailable' => !$bookedAreaId->contains($area->area_id),
            ];
        });
        return response()->json([
            'success' => true,
            'data' => $areas,
        ]);
    }

    public function storeStep1(Request $request)
    {
        $requestDate = Carbon::parse($request->date)->startOfDay();
        $tomorrow = Carbon::tomorrow();

        if ($requestDate->lessThan($tomorrow)) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Reservasi minimal dilakukan minimal 1 hari sebelum kedatangan.',
                ],
                400,
            );
        }

        $session = SessionToken::where('token', $request->header('X-Session-Token'))->first();
        $reservation = Reservation::updateOrCreate(
            ['session_token_id' => $session->token_id],
            [
                'reservation_datetime' => $request->date . ' 00:00:00',
                'area_id' => $request->area_id,
                'status' => 'pending',
                'reservation_duration' => 0,
                'customer_name' =>
                    $session->customer_name ?? 'Session: ' . substr($session->token, 0, 8),
                'customer_phone' => $session->customer_phone ?? '08123456789',
                'guest_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        );
        return response()->json([
            'success' => true,
            'reservation_id' => $reservation->reservation_id,
        ]);
    }

    public function storeStep2(Request $request)
    {
        $session = SessionToken::where('token', $request->header('X-Session-Token'))->first();
        $reservation = Reservation::with('area')
            ->where('session_token_id', $session->token_id)
            ->first();

        if (!$reservation) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Reservation not found',
                ],
                404,
            );
        }

        $area = $reservation->area;

        $minGuest = $area->minimum_guest ?? 10;
        $maxGuest = $area->maximum_guest ?? 20;

        if ($request->guest_count < $minGuest || $request->guest_count > $maxGuest) {
            return response()->json(
                [
                    'success' => false,
                    'message' => "Kapasitas untuk {$area->area_name} adalah {$minGuest} hingga {$maxGuest}.",
                ],
                400,
            );
        }

        $dateOnly = Carbon::parse($reservation->reservation_datetime)->format('Y-m-d');

        try {
            $checkInCarbon = Carbon::parse($dateOnly . ' ' . $request->reservation_time);
        } catch (\Exception $e) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Format waktu tidak sesuai',
                ],
                400,
            );
        }

        $openTime = Carbon::parse($dateOnly . '08:00:00');
        $closeTime = Carbon::parse($dateOnly . '19:00:00');

        if ($checkInCarbon->lessThan($openTime) || $checkInCarbon->greaterThan($closeTime)) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Jam checkin reservasi harus diantara jam 7 pagi sampai 7 malam',
                ],
                400,
            );
        }

        $duration = (int) $request->reservation_duration;

        if ($duration < 3) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Durasi minimal adalah 3 jam.',
                ],
                400,
            );
        }

        $checkOutCarbon = $checkInCarbon->copy()->addMinutes($duration * 60);

        if ($checkOutCarbon->greaterThan($closeTime)) {
            return response()->json(
                [
                    'success' => false,
                    'message' =>
                        'Check-out melebihi waktu tutup (10 malam). Silahkan kurangi waktu durasi atau majukan check-in',
                ],
                400,
            );
        }

        $reservation->update([
            'reservation_datetime' => $checkInCarbon->format('Y-m-d H:i:s'),
            'reservation_duration' => $duration,
            'customer_name' => $request->customer_name,
            'customer_phone' => $request->customer_phone,
            'guest_count' => $request->guest_count,
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
        ]);
    }

    public function calculateTotal(Request $request)
    {
        $session = SessionToken::where('token', $request->header('X-Session-Token'))->first();
        $reservation = Reservation::with(['area', 'preorderMenu'])
            ->where('session_token_id', $session->token_id)
            ->first();

        $area = $reservation->area;
        $priceUnit = $area->price_unit > 0 ? $area->price_unit : 1;

        $requestDuration = $reservation->reservation_duration;

        $billedBlock = ceil($requestDuration / $priceUnit);
        $areaPrice = $billedBlock * ($area->reservation_price ?? 0);

        $menuPrice = $reservation->preorderMenu->sum('subtotal');
        $totalItems = $reservation->preorderMenu->sum('qty');

        $menuPrice = $reservation->preorderMenu->sum('subtotal');
        $total = $areaPrice + $menuPrice;

        $minDp = $areaPrice + $menuPrice * 0.5;

        $reservation->update([
            'reservation_total' => $total,
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'total_items' => $totalItems,
            'total_price' => $menuPrice,
            'data' => [
                'total' => $total,
                'minDp' => $minDp,
                'payNow' => $menuPrice > 0 ? $minDp : $total,
                'billing_info' => [
                    'duration' => $requestDuration,
                    'billed_blocks' => $billedBlock,
                    'price_per_block' => $area->reservation_price,
                    'area_total' => $areaPrice,
                ],
            ],
        ]);
    }

    public function getPersonalData(Request $request)
    {
        $session = SessionToken::where('token', $request->header('X-Session-Token'))->first();
        $reservation = Reservation::where('session_token_id', $session->token_id)->first();

        if (!$reservation) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Reservation not found',
                ],
                404,
            );
        }

        $time = Carbon::parse($reservation->reservation_datetime)->format('H:i');

        return response()->json([
            'success' => true,
            'data' => [
                'customer_name' => str_contains($reservation->customer_name, 'Session:')
                    ? ''
                    : $reservation->customer_name,
                'customer_phone' =>
                    $reservation->customer_phone === '08123456789'
                        ? ''
                        : $reservation->customer_phone,
                'guest_count' => $reservation->guest_count == 0 ? '' : $reservation->guest_count,
                'reservation_time' => $time === '00:00' ? '' : $time,
                'reservation_duration' =>
                    $reservation->reservation_duration == 0
                        ? ''
                        : $reservation->reservation_duration,
            ],
        ]);
    }

    public function getPreorderCart(Request $request)
    {
        $session = SessionToken::where('token', $request->header('X-Session-Token'))->first();
        $reservation = Reservation::where('session_token_id', $session->token_id)->first();

        if (!$reservation) {
            return response()->json([
                'success' => false,
                'message' => 'Reservation not found',
            ]);
        }

        $menuItems = ReservationMenu::with(['menu', 'options.optionValue'])
            ->where('reservation_id', $reservation->reservation_id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $menuItems,
        ]);
    }

    public function addPreorderMenu(Request $request)
    {
        $session = SessionToken::where('token', $request->header('X-Session-Token'))->first();
        $reservation = Reservation::where('session_token_id', $session->token_id)->first();

        if (!$reservation) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Reservation not found',
                ],
                404,
            );
        }

        $menuList = Menu::find($request->menu_id);

        if (!$menuList) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Menu not found',
                ],
                404,
            );
        }

        $existingItem = ReservationMenu::where('reservation_id', $reservation->reservation_id)
            ->where('menu_id', $request->menu_id)
            ->first();

        if ($existingItem) {
            $newQty = $existingItem->qty + 1;
            $existingItem->update([
                'qty' => $newQty,
                'subtotal' => $newQty * $menuList->menu_price,
            ]);
        } else {
            $newItem = ReservationMenu::create([
                'reservation_id' => $reservation->reservation_id,
                'menu_id' => $request->menu_id,
                'qty' => 1,
                'subtotal' => $menuList->menu_price,
            ]);

            if ($request->has('options') && is_array($request->options)) {
                foreach ($request->options as $optionId) {
                    ReservationMenuOption::create([
                        'reservation_menu_id' => $newItem->reservation_menu_id,
                        'option_value_id' => $optionId,
                    ]);
                }
            }
        }

        return response()->json(['success' => true]);
    }

    public function updatePreorderMenuQty(Request $request, $id)
    {
        $item = ReservationMenu::with('menu')->find($id);

        if (!$item) {
            return response()->json(['success' => false, 'message' => 'Item not found'], 404);
        }

        if ($request->action === 'plus') {
            $newQty = $item->qty + 1;
        } elseif ($request->action === 'minus') {
            $newQty = $item->qty - 1;
        }

        if ($newQty > 0) {
            $item->update([
                'qty' => $newQty,
                'subtotal' => $newQty * $item->menu->menu_price,
            ]);
        } else {
            $item->delete();
        }

        return response()->json(['success' => true]);
    }

    public function processCheckout(Request $request)
    {
        $session = SessionToken::where('token', $request->header('X-Session-Token'))->first();
        $reservation = Reservation::with(['area', 'preorderMenu.menu'])
            ->where('session_token_id', $session->token_id)
            ->first();

        if (!$reservation) {
            return response()->json(
                ['success' => false, 'message' => 'Reservation not found'],
                404,
            );
        }

        Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;

        $orderId = 'JTI-RST-' . $reservation->reservation_id . '-' . time();

        $itemDetails = [];
        $area = $reservation->area;
        $priceUnit = $area->price_unit > 0 ? $area->price_unit : 1;
        $billedBlock = ceil($reservation->reservation_duration / $priceUnit);
        $areaPrice = $billedBlock * ($area->reservation_price ?? 0);

        if ($areaPrice > 0) {
            $itemDetails[] = [
                'id' => 'AREA-' . $area->area_id,
                'price' => $area->reservation_price ?? 0,
                'quantity' => $billedBlock,
                'name' => 'Reservasi Tempat: ' . $area->area_name,
            ];
        }

        $menuPrice = $reservation->preorderMenu->sum('subtotal');
        $dpMenuPrice = 0;

        if ($menuPrice > 0) {
            $dpMenuPrice = (int) round($menuPrice * 0.5);
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
                'first_name' => $reservation->customer_name ?: 'Guest',
                'phone' => $reservation->customer_phone ?: '-',
            ],
        ];

        try {
            $snapToken = Snap::getSnapToken($params);

            return response()->json([
                'success' => true,
                'snap_token' => $snapToken,
            ]);
        } catch (Exception $e) {
            return response()->json(
                [
                    'success' => false,
                    'message' => 'Gagal generate token pembayaran: ' . $e->getMessage(),
                ],
                500,
            );
        }
    }
}
