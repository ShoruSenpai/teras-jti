<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\Banner;

class BannerManagementController extends Controller
{
    /**
     * GET /api/admin/banners
     */
    public function index()
    {
        $banners = Banner::orderBy('display_order', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $banners,
        ]);
    }

    /**
     * POST /api/admin/banners
     */
    public function store(Request $request)
    {
        $request->validate([
            'banner_title' => 'required|string|max:100',
            'image_url' => 'required|string|max:255',
            'link_url' => 'nullable|string|max:255',
            'display_order' => 'required|integer',
            'is_active' => 'required|boolean',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
        ]);

        $banner = Banner::create([
            'banner_title' => $request->banner_title,
            'image_url' => $request->image_url,
            'link_url' => $request->link_url,
            'display_order' => $request->display_order,
            'is_active' => $request->is_active,
            'start_at' => $request->start_at,
            'end_at' => $request->end_at,
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Banner berhasil ditambahkan',
            'data' => $banner,
        ]);
    }

    /**
     * PUT /api/admin/banners/{id}
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'banner_title' => 'required|string|max:100',
            'image_url' => 'required|string|max:255',
            'link_url' => 'nullable|string|max:255',
            'display_order' => 'required|integer',
            'is_active' => 'required|boolean',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
        ]);

        $banner = Banner::findOrFail($id);

        $banner->update([
            'banner_title' => $request->banner_title,
            'image_url' => $request->image_url,
            'link_url' => $request->link_url,
            'display_order' => $request->display_order,
            'is_active' => $request->is_active,
            'start_at' => $request->start_at,
            'end_at' => $request->end_at,
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Banner berhasil diperbarui',
        ]);
    }

    /**
     * PATCH /api/admin/banners/{id}/toggle
     * Digunakan khusus untuk tombol Switch (On/Off) di tabel
     */
    public function toggleActive($id)
    {
        $banner = Banner::findOrFail($id);

        // Balikkan nilai boolean-nya
        $banner->is_active = !$banner->is_active;
        $banner->save();

        return response()->json([
            'success' => true,
            'message' => 'Status banner diubah',
            'is_active' => $banner->is_active,
        ]);
    }

    /**
     * DELETE /api/admin/banners/{id}
     */
    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);
        $banner->delete();

        return response()->json([
            'success' => true,
            'message' => 'Banner berhasil dihapus',
        ]);
    }
}
