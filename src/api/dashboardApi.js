import apiClient from '../services/apiClient.js';

export const dashboardApi = {
  getStats: async () => {
    try {
      const response = await apiClient.get('/stats/summary');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      return {
        revenue: 0,
        revenueTrend: '0%',
        orders: 0,
        ordersTrend: '0%',
        avgOrder: 0,
        avgOrderTrend: '0%',
        activeOrders: 0,
      };
    }
  },

  getTransactions: async () => {
    try {
      const response = await apiClient.get('/stats/recent-transactions');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      return [];
    }
  },
};
