<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\OrderHistory;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Endpoint: GET /api/admin/stats/summary
     */
    public function getSummaryStats()
    {
        $revenue = OrderHistory::where('status', 'paid')->sum('total_price');

        $totalOrders = OrderHistory::count();

        $avgOrder = $totalOrders > 0 ? $revenue / $totalOrders : 0;

        $activeOrders = OrderHistory::where('status', 'pending')->count();

        $revenueTrend = '+15.2%';
        $ordersTrend = '+8.5%';
        $avgOrderTrend = '+2.1%';

        return response()->json([
            'success' => true,
            'data' => [
                'revenue' => (int) $revenue,
                'revenueTrend' => $revenueTrend,
                'orders' => $totalOrders,
                'ordersTrend' => $ordersTrend,
                'avgOrder' => (int) $avgOrder,
                'avgOrderTrend' => $avgOrderTrend,
                'activeOrders' => $activeOrders,
            ],
        ]);
    }

    /**
     * Endpoint: GET /api/admin/stats/recent-transactions
     */
    public function getRecentTransactions()
    {
        $recentOrders = OrderHistory::orderBy('order_time', 'desc')->get();

        $transactions = $recentOrders->map(function ($order) {
            $status = strtoupper($order->status);
            if ($status === 'PAID') {
                $status = 'COMPLETED';
            }

            return [
                'id' => $order->token,
                'table' => $order->order_type === 'dine-in' ? 'Dine In' : 'Take Away',
                'paid_at' => $order->paid_at,
                'amount' => (int) $order->total_price,
                'status' => $status,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }
}
