<?php

namespace App\Http\Controllers;

use App\Http\Models\Banner;
use App\Http\Resources\BannerResource;

class BannerController extends Controller
{
    public function index()
    {
        $now = now();
        $banners = Banner::where('is_active', 1)
            ->where(function ($q) use ($now) {
                $q->whereNull('start_at')->orWhere('start_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_at')->orWhere('end_at', '>=', $now);
            })
            ->orderBy('display_order', 'asc')
            ->get();

        return BannerResource::collection($banners)->additional([
            'Success' => true,
            'message' => 'Banner List',
        ]);
    }
}
