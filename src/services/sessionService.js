import { useAuthStore } from "@/stores/auth";
import apiClient from "./apiClient";

export async function createSession(type, coords) {
  const res = await apiClient.post("/session/create", {
    session_type: type,
    latitude: coords.lat,
    longitude: coords.long,
  });

  return res.data;
}

export async function validateSession(token) {
  const auth = useAuthStore();
  const finalToken = token || auth.token;

  const res = await apiClient.post("/session/validate", {
    token: finalToken,
  });

  return res.data;
}
