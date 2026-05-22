/**
 * reservationApi.js
 * API call untuk halaman reservasi (ReservationView).
 *
 * Endpoint backend:
 *   GET   /reservations
 *   PATCH /reservations/:id/status
 */
import apiClient from '../services/apiClient.js';

export const reservationApi = {
  /**
   * Ambil semua data reservasi.
   * @returns {Promise<Array>}
   */
  getReservations: async () => {
    try {
      const response = await apiClient.get('/reservations');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
      return [];
    }
  },

  /**
   * Update status reservasi (Confirm / Cancel).
   * @param {number} id
   * @param {string} newStatus - 'Confirmed' | 'Cancelled' | 'Pending'
   * @returns {Promise<object>}
   */
  updateReservationStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/reservations/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update status:', error);
      throw error;
    }
  },
};
