import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

// ngrok domain
const ngrok = "0f23-2404-c0-3571-72da-c137-1ca7-4f7c-2519.ngrok-free.app";

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
