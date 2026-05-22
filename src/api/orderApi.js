/**
 * orderApi.js
 * API call untuk pesanan: POS (kasir) dan dine-in orders.
 *
 * Endpoint backend:
 *   GET  /orders/active   — live dine-in orders
 *   POST /orders          — buat pesanan baru dari kasir
 */
import apiClient from '../services/apiClient.js';

export const orderApi = {
  /**
   * Ambil semua pesanan aktif (dine-in live view).
   * @returns {Promise<Array>}
   */
  getDineInOrders: async () => {
    const response = await apiClient.get('/orders/active');
    return response.data.data ?? response.data;
  },

  /**
   * Buat pesanan baru dari kasir (POS).
   * @param {object} orderData - { orderType, tableNumber, items, subtotal, tax, total }
   * @returns {Promise<object>}
   */
  placeOrder: async (orderData) => {
    try {
      // POST ke /api/admin/orders
      const response = await apiClient.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Gagal mengirim pesanan:', error);
      // Lempar pesan error dari Laravel jika ada (misal validasi gagal atau stok habis)
      throw (
        error.response?.data || {
          success: false,
          message: 'Gagal terhubung ke server Teras JTI.',
        }
      );
    }
  },
  getOrderByToken: async (tokenString) => {
    try {
      const response = await apiClient.get(`/orders/token/${tokenString}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { message: 'Gagal mencari token.' };
    }
  },
};
