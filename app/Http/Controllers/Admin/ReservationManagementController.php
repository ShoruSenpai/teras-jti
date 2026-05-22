<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\Reservation;
use Carbon\Carbon;

class ReservationManagementController extends Controller
{
    /**
     * Endpoint: GET /api/admin/reservations
     */
    public function index()
    {
        $reservations = Reservation::with('area')->orderBy('reservation_datetime', 'asc')->get();

        $formattedReservations = $reservations->map(function ($res) {
            $datetime = Carbon::parse($res->reservation_datetime);

            return [
                'id' => $res->reservation_id,
                'customer' => $res->customer_name,
                'phone' => $res->customer_phone,
                'date' => $datetime->format('d M Y'),
                'time' => $datetime->format('H:i'),
                'guests' => $res->guest_count,
                'tablePref' => $res->area ? $res->area->area_name : 'No Preference',
                'status' => ucfirst($res->status),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedReservations,
        ]);
    }

    /**
     * Endpoint: PATCH /api/admin/reservations/{id}/status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:Confirmed,Cancelled,Pending,Completed',
        ]);

        $reservation = Reservation::findOrFail($id);

        $newStatus = strtolower($request->status);
        $reservation->status = $newStatus;

        if ($newStatus === 'confirmed') {
            $reservation->confirmed_at = now();
        }

        $reservation->save();

        return response()->json([
            'success' => true,
            'message' => 'Reservation status updated successfully',
        ]);
    }
}
