// services/authApi.js
import apiClient from '../services/apiClient.js';
import { adminAuthStore } from '../stores/adminAuth.js';

export const authApi = {
  /**
   * Mengirim data login ke backend Laravel
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>}
   */
  async login(email, password) {
    try {
      // apiClient sudah memiliki baseURL yang mengarah ke '/api/admin'
      const response = await apiClient.post('/auth/login', { email, password });

      // Jika backend me-return success: true
      if (response.data.success) {
        const { token, user } = response.data.data;

        // Simpan token ke cookie & data user ke localStorage lewat store admin
        adminAuthStore.loginSuccess(token, user);
      }

      return response.data;
    } catch (error) {
      // Jika error datang dari response Laravel (misal: status 401 / email salah)
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      // Jika terjadi error jaringan atau server mati
      throw { success: false, message: 'Gagal terhubung ke server Teras JTI.' };
    }
  },

  /**
   * Mengirim request logout ke backend dan membersihkan session frontend
   * @returns {Promise<object>}
   */
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout');

      if (response.data.success) {
        // Hapus cookie dan localStorage
        adminAuthStore.logout();
      }

      return response.data;
    } catch (error) {
      // Khusus logout: Tetap bersihkan session di frontend meskipun API backend error
      // Supaya user tidak "terjebak" di halaman admin jika server mendadak down
      adminAuthStore.logout();

      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw {
        success: false,
        message: 'Gagal logout dari server, sesi lokal dibersihkan.',
      };
    }
  },
};
