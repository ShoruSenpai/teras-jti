import apiClient from '../services/apiClient.js';

export const accountApi = {
  getAccounts: async () => {
    try {
      const response = await apiClient.get('/accounts');
      return response.data.data.map((acc) => ({
        ...acc,
        id: acc.admin_id,
      }));
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      return [];
    }
  },

  addAccount: async (data) => {
    const response = await apiClient.post('/accounts', data);
    return response.data;
  },

  updateAccount: async (id, data) => {
    try {
      const response = await apiClient.put(`/accounts/${id}`, data);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: 'Terjadi kesalahan pada server.' }
      );
    }
  },

  deleteAccount: async (id) => {
    const response = await apiClient.delete(`/accounts/${id}`);
    return response.data;
  },
};
