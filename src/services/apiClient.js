import { config } from "@/config/config";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";

const apiClient = axios.create({
  baseURL: config.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const auth = useAuthStore();

  if (auth.token) {
    config.headers["X-Session-Token"] = auth.token;
  }
  return config;
});

export default apiClient;
