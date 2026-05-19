import axios from 'axios';
import { config } from '../config/config.js';
import { authStore } from '../stores/auth.js';

const apiClient = axios.create({
  baseURL: config.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((reqConfig) => {
  if (authStore.token) {
    reqConfig.headers['X-Session-Token'] = authStore.token;
  }
  return reqConfig;
});

export default apiClient;
