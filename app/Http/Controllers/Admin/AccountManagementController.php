<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Models\UserAdmin;
use Illuminate\Support\Facades\Hash;

class AccountManagementController extends Controller
{
    /**
     * GET /api/admin/accounts
     */
    public function index()
    {
        $accounts = UserAdmin::all();

        return response()->json([
            'success' => true,
            'data' => $accounts,
        ]);
    }

    /**
     * POST /api/admin/accounts
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:user_admin,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:owner,admin,cashier',
        ]);

        $account = UserAdmin::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil dibuat',
            'data' => $account,
        ]);
    }

    /**
     * PUT /api/admin/accounts/{id}
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:user_admin,email,' . $id . ',admin_id',
            'role' => 'required|in:owner,admin,cashier',
        ]);

        $account = UserAdmin::findOrFail($id);
        $currentUser = auth()->user(); // Ambil user yang sedang login

        if ($currentUser && $currentUser->admin_id != $id) {
            if ($request->filled('password') || $request->role != $account->role) {
                if (!$request->filled('owner_password')) {
                    return response()->json(
                        [
                            'success' => false,
                            'message' => 'Otorisasi ditolak. Password Owner diperlukan.',
                        ],
                        403,
                    );
                }

                if (!Hash::check($request->owner_password, $currentUser->password)) {
                    return response()->json(
                        ['success' => false, 'message' => 'Password Owner salah!'],
                        403,
                    );
                }
            }
        }

        // --- UPDATE DATA ---
        $account->name = $request->name;
        $account->email = $request->email;
        $account->role = $request->role;

        if ($request->filled('password')) {
            $account->password = Hash::make($request->password);
        }

        $account->save();

        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil diupdate',
        ]);
    }

    /**
     * DELETE /api/admin/accounts/{id}
     */
    public function destroy($id)
    {
        $account = UserAdmin::findOrFail($id);

        if (auth()->id() == $id) {
            return response()->json(
                ['success' => false, 'message' => 'Anda tidak bisa menghapus akun Anda sendiri.'],
                400,
            );
        }

        $account->delete();

        return response()->json([
            'success' => true,
            'message' => 'Akun berhasil dihapus',
        ]);
    }
}
