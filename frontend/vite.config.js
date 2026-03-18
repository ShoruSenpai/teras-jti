import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

// ngrok domain
const ngrok = "7438-157-66-128-160.ngrok-free.app";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  server: {
    allowedHosts: [ngrok],
    hmr: {
      host: ngrok,
      protocol: "wss", // Use 'wss' (WebSocket Secure) for HTTPS
      clientPort: 443, // Standard HTTPS port
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
