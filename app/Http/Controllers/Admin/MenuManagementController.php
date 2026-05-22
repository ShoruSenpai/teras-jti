<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Models\Menu;
use App\Http\Models\Category;
use Illuminate\Http\Request;

class MenuManagementController extends Controller
{
    /**
     * Digunakan oleh Kasir (POS) & Admin untuk memuat daftar menu
     */
    public function index()
    {
        // Ambil semua menu beserta data tabel kategorinya (Eager Loading)
        $menus = Menu::with('category')->get();

        // Format ulang (Map) agar key-nya sesuai dengan yang dibaca Native JS
        $formattedMenus = $menus->map(function ($item) {
            return [
                'id' => $item->menu_id,
                'name' => $item->menu_name,
                'category' => $item->category ? $item->category->category_name : 'Uncategorized',
                'price' => (int) $item->menu_price,
                'image' => $item->menu_image,
                'description' => $item->menu_description,
                'status' => $item->status,
                'stock' => (int) $item->menu_stock,
                'is_new' => (bool) $item->is_new, // Kirim ke frontend untuk toggle Edit
                'is_recommended' => (bool) $item->is_recommended, // Kirim ke frontend untuk toggle Edit
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedMenus,
        ]);
    }

    /**
     * POST /api/admin/menu (Buat Menu Baru)
     */
    public function store(Request $request)
    {
        // 1. Tambahkan validasi untuk stock, is_new, dan is_recommended
        $request->validate([
            'name' => 'required|string|max:100',
            'price' => 'required|numeric',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'image' => 'nullable|string', // Ubah jadi string agar bisa menerima path '/assets/...'
            'status' => 'required|string',
            'is_new' => 'required|boolean',
            'is_recommended' => 'required|boolean',
        ]);

        $category = Category::firstOrCreate([
            'category_name' => $request->category,
        ]);

        $dbStatus = 'available';
        if ($request->status === 'Out of Stock') {
            $dbStatus = 'sold_out';
        }
        if ($request->status === 'Disabled') {
            $dbStatus = 'disabled';
        }

        // 2. Simpan semua field ke tabel database
        $menu = Menu::create([
            'category_id' => $category->category_id,
            'menu_name' => $request->name,
            'menu_price' => $request->price,
            'menu_stock' => $request->stock,
            'menu_description' => $request->description,
            'menu_image' => $request->image,
            'status' => $dbStatus,
            'is_new' => $request->boolean('is_new'),
            'is_recommended' => $request->boolean('is_recommended'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil ditambahkan',
            'data' => $menu,
        ]);
    }

    /**
     * PUT /api/admin/menu/{id} (Update Menu)
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'price' => 'required|numeric',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'status' => 'required|string',
            'is_new' => 'required|boolean',
            'is_recommended' => 'required|boolean',
        ]);

        $menu = Menu::findOrFail($id);

        $category = Category::firstOrCreate([
            'category_name' => $request->category,
        ]);

        $dbStatus = 'available';
        if ($request->status === 'Out of Stock') {
            $dbStatus = 'sold_out';
        }
        if ($request->status === 'Disabled') {
            $dbStatus = 'disabled';
        }

        $menu->update([
            'category_id' => $category->category_id,
            'menu_name' => $request->name,
            'menu_price' => $request->price,
            'menu_stock' => $request->stock,
            'menu_description' => $request->description,
            'menu_image' => $request->image,
            'status' => $dbStatus,
            'is_new' => $request->boolean('is_new'),
            'is_recommended' => $request->boolean('is_recommended'),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil diupdate',
        ]);
    }

    /**
     * DELETE /api/admin/menu/{id} (Hapus Menu)
     */
    public function destroy($id)
    {
        $menu = Menu::findOrFail($id);
        $menu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil dihapus',
        ]);
    }
}
