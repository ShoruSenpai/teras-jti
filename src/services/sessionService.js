import { authStore } from '../stores/auth.js';
import apiClient from './apiClient.js';

export async function createSession(type, coords) {
  const res = await apiClient.post('/session/create', {
    session_type: type,
    latitude: coords.lat,
    longitude: coords.long,
  });

  return res.data;
}

export async function validateSession(token) {
  const finalToken = token || authStore.token;

  const res = await apiClient.post('/session/validate', {
    token: finalToken,
  });

  return res.data;
}
