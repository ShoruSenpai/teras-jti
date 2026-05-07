<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Models\Reservation;
use App\Http\Models\ReservationArea;
use App\Http\Models\SessionToken;
use Illuminate\Http\Request;
use Carbon\Carbon;

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
                'reservation_datetime' => $request->date,
                'area_id' => $request->area_id,
                'status' => 'pending',
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

        $reservation->update([
            'reservation_duration' => $request->reservation_duration,
            'customer_name' => $request->customer_name,
            'customer_phone' => $request->customer_phone,
            'guest_count' => $request->guest_count,
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

        $areaPrice = $reservation->area->reservation_price ?? 0;
        $menuPrice = $reservation->preorderMenu->sum('subtotal');
        $total = $areaPrice + $menuPrice;
        $minDp = $menuPrice * 0.5 + $areaPrice;

        $reservation->update(['reservation_total' => $total]);

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'minDp' => $minDp,
                'payNow' => $menuPrice > 0 ? $minDp : $total,
            ],
        ]);
    }
}
