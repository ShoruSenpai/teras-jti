import apiClient from '../services/apiClient.js';

export const bannerApi = {
  getBanners: async () => {
    try {
      const response = await apiClient.get('/banners');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch banners:', error);
      return [];
    }
  },

  addBanner: async (data) => {
    const response = await apiClient.post('/banners', data);
    return response.data;
  },

  updateBanner: async (id, data) => {
    const response = await apiClient.put(`/banners/${id}`, data);
    return response.data;
  },

  toggleBannerStatus: async (id) => {
    const response = await apiClient.patch(`/banners/${id}/toggle`);
    return response.data;
  },

  deleteBanner: async (id) => {
    const response = await apiClient.delete(`/banners/${id}`);
    return response.data;
  },
};
