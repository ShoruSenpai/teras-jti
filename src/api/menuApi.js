/**
 * menuApi.js
 * Semua API call yang berhubungan dengan data menu (master menu).
 */
import apiClient from '../services/apiClient.js';

export const menuApi = {
  /**
   * Ambil semua item menu dari backend dan sesuaikan format datanya.
   * @returns {Promise<Array>}
   */
  getMenu: async () => {
    try {
      const response = await apiClient.get('/menu');
      const rawData = response.data.data ?? response.data;

      // Map data dari format Laravel ke format UI
      return rawData.map((item) => ({
        ...item,

        id: item.menu_id || item.id,
        name: item.menu_name || item.name,
        category:
          typeof item.category === 'string' ? item.category : 'Uncategorized',
        price: Number(item.menu_price || item.price),
        image:
          item.menu_image ||
          item.image ||
          '/assets/images/teras-menu-template.webp',
        description: item.menu_description || item.description,
        status: item.status || 'Available',
      }));
    } catch (error) {
      console.error('Gagal mengambil data menu:', error);
      return []; // Return array kosong jika gagal agar UI tidak crash
    }
  },

  /**
   * Tambah item menu baru.
   * @param {object} itemData
   * @returns {Promise<object>}
   */
  addMenuItem: async (itemData) => {
    const response = await apiClient.post('/menu', itemData);
    return response.data.data ?? response.data;
  },

  /**
   * Update item menu yang sudah ada.
   * @param {number} id
   * @param {object} itemData
   * @returns {Promise<object>}
   */
  updateMenuItem: async (id, itemData) => {
    const response = await apiClient.put(`/menu/${id}`, itemData);
    return response.data.data ?? response.data;
  },

  /**
   * Hapus item menu.
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  deleteMenuItem: async (id) => {
    await apiClient.delete(`/menu/${id}`);
    return true;
  },
};
