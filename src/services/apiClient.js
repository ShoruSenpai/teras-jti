import axios from 'axios';
import { config } from '../config/config.js';
import { adminAuthStore } from '../stores/adminAuth.js';

const apiClient = axios.create({
  baseURL: config.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((reqConfig) => {
  if (adminAuthStore.token) {
    reqConfig.headers['X-Session-Token'] = adminAuthStore.token;
  }
  return reqConfig;
});

export default apiClient;
