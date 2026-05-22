/**
 * services/api.js — Barrel / Re-export file
 *
 * File ini TIDAK berisi logika apapun.
 * Semua fungsi API sudah dipindahkan ke file terpisah di folder /api:
 *
 *   src/api/authApi.js        — Login & Logout
 *   src/api/menuApi.js        — CRUD Menu
 *   src/api/orderApi.js       — Dine-In Orders & POS Place Order
 *   src/api/reportApi.js      — Dashboard Stats & Transactions
 *   src/api/reservationApi.js — Reservasi
 *   src/api/bannerApi.js      — CRUD Banner
 *   src/api/accountApi.js     — CRUD Akun Staf (Owner only)
 *   src/api/profileApi.js     — Update Profil & Password sendiri
 *
 * Semua view yang menggunakan `import { ApiService } from '../services/api'`
 * tidak perlu diubah — ApiService tetap tersedia dari sini sebagai re-export.
 */

import { menuApi } from '../api/menuApi.js';
import { orderApi } from '../api/orderApi.js';
import { dashboardApi } from '../api/dashboardApi.js';
import { reservationApi } from '../api/reservationApi.js';
import { bannerApi } from '../api/bannerApi.js';
import { accountApi } from '../api/accountApi.js';
import { profileApi } from '../api/profileApi.js';

/**
 * ApiService — gabungan semua modul API.
 * Dipakai oleh semua view dan component melalui:
 *   import { ApiService } from '../services/api';
 */
export const ApiService = {
  // ── Menu ─────────────────────────────────────────────
  getMenu: menuApi.getMenu,
  addMenuItem: menuApi.addMenuItem,
  updateMenuItem: menuApi.updateMenuItem,
  deleteMenuItem: menuApi.deleteMenuItem,

  // ── Orders (Dine-In & POS) ───────────────────────────
  getDineInOrders: orderApi.getDineInOrders,
  placeOrder: orderApi.placeOrder,

  // ── Reports / Dashboard ──────────────────────────────
  getStats: dashboardApi.getStats,
  getTransactions: dashboardApi.getTransactions,

  // ── Reservations ─────────────────────────────────────
  getReservations: reservationApi.getReservations,
  updateReservationStatus: reservationApi.updateReservationStatus,

  // ── Banners ──────────────────────────────────────────
  getBanners: bannerApi.getBanners,
  addBanner: bannerApi.addBanner,
  updateBanner: bannerApi.updateBanner,
  toggleBannerStatus: bannerApi.toggleBannerStatus,
  deleteBanner: bannerApi.deleteBanner,

  // ── Accounts (Owner only) ────────────────────────────
  getAccounts: accountApi.getAccounts,
  addAccount: accountApi.addAccount,
  updateAccount: accountApi.updateAccount,
  deleteAccount: accountApi.deleteAccount,

  // ── Profile (current user) ───────────────────────────
  updateProfile: profileApi.updateProfile,
  changePassword: profileApi.changePassword,
};
