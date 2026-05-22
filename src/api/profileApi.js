/**
 * profileApi.js
 * API call untuk halaman pengaturan profil pengguna sendiri (SettingsView).
 *
 * Endpoint backend:
 *   PUT /profile          — update nama & email
 *   PUT /profile/password — ganti password
 */
import apiClient from '../services/apiClient.js';

export const profileApi = {
  /**
   * Update profil diri sendiri (nama dan/atau email).
   * @param {object} userData - { name, email }
   * @returns {Promise<object>} - objek user yang sudah diupdate
   */
  updateProfile: async (userData) => {
    const response = await apiClient.put('/profile', {
      name: userData.name,
      email: userData.email,
    });
    return response.data.data ?? response.data;
  },

  /**
   * Ganti password.
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<boolean>}
   */
  changePassword: async (currentPassword, newPassword) => {
    await apiClient.put('/profile/password', {
      currentPassword,
      newPassword,
    });
    return true;
  },
};
