import { config } from "@/config/config";
import axios from "axios";

const apiClient = axios.create({
  baseURL: config.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
